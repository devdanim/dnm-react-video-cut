import React from 'react';
import ReactDOM from 'react-dom';
// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import styles from './css/styles';
import Draggable from './lib/draggable';
import PlayIcon from './lib/svg/play';
import PauseIcon from './lib/svg/pause';
import ZoomIcon from './lib/svg/zoom';
import { throttle } from 'lodash-es';


const Range = Slider.Range;
export default class DnmVideoCut extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            videoDuration: 0,
            isEditing: false,
            isPlaying: false,
            rangeDisabled: true,
            forceCursorDragging: false,
            forceScrollToCursor: false,
            zoomFactor: [0],
            playCursorPosition: {
                xRatio: 0,
                yRatio: 0
            }
        }
        this.videoRef = React.createRef();
        this.scrollable = React.createRef();
        this.draggable = React.createRef();
        this.draggableApi = null;
        this.seekVideoTo = throttle(this._seekVideoTo, 50);
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyPress);
    }

    componentDidUpdate(prevProps, prevState) {
        const { videoDuration, isEditing } = this.state;
        const { inPoint, outPoint, src, minDuration, maxDuration } = this.props;
        if(!isNaN(videoDuration) && videoDuration !== prevState.videoDuration) {
            this.handleRangeChange([inPoint, outPoint]);
        }
        if(src !== prevProps.src) {
            this.pauseVideo();
        }
        if(isEditing && (prevProps.inPoint !== inPoint || prevProps.outPoint !== outPoint)) {
            let time;
            if(prevProps.inPoint !== inPoint && prevProps.outPoint !== outPoint) {
                const max = maxDuration || videoDuration;
                if(Math.abs(outPoint - inPoint - minDuration) < Math.abs(outPoint - inPoint - max)) time = prevProps.inPoint < inPoint ? inPoint : outPoint;
                else time = prevProps.inPoint > inPoint ? inPoint : outPoint;
            }
            else time = prevProps.outPoint !== outPoint ? outPoint : inPoint;
            this.seekVideoTo(time);
        }

    }

    componentWillUnmount = () => {
        window.removeEventListener("keydown", this.handleKeyPress);
    }


    _seekVideoTo(time) {
        if (!isNaN(time)) {
            const video = this.videoRef.current;
            if(video) video.currentTime = time;
        }
    }

    getFormatedValues = (inPoint, outPoint, lastTarget = "in") => {
        if(!inPoint) inPoint = this.props.inPoint;  
        if(!outPoint) outPoint = this.props.outPoint;
        const { maxDuration, minDuration } = this.props;
        const { videoDuration } = this.state;

        let max = maxDuration || videoDuration;
        if(max > videoDuration) max = videoDuration;

        let inValue = inPoint || 0;
        let outValue = outPoint || videoDuration;

        if(outValue - inValue > max) {
            if(lastTarget === "in") outValue = inValue + max;
            else inValue = outValue - max;
        } else if(outValue - inValue < minDuration) {
            if(lastTarget === "in") outValue = inValue + minDuration;
            else inValue = outValue - minDuration;
        }
        
        if(inValue < 0) inValue = 0;
        if(outValue > videoDuration) outValue = videoDuration;

        return { 
            inValue,
            outValue
        }
    }

    toggleVideoAutoPlay = (playInArea) => {
        const video = this.videoRef.current;
        if(video) {
            if(video.paused) {
                this.playVideo();
                this.monitorAutoplay(playInArea);
            }
            else this.pauseVideo();
        }
    }

    monitorAutoplay = (playInArea = true) => {
        const video = this.videoRef.current;
        if(video && !video.paused) {
            if(playInArea === true) {
                const { inValue, outValue } = this.getFormatedValues(); 
                const time = video.currentTime;
                if(time < inValue || time > outValue) video.currentTime = inValue;
            }
            this.updatePlayCursorPosition(null, true);
            setTimeout(() => this.monitorAutoplay(playInArea), 100);     
        }
    }

    playVideo = () => {
        const video = this.videoRef.current;
        if(video) {
            video.play();
        }
        this.setState({ isPlaying: true });
    }

    pauseVideo = () => {
        const video = this.videoRef.current;
        if(video) {
            video.pause();
        }
        this.setState({ isPlaying: false });
    }

    scrollToCursor = () => {
        const { playCursorPosition, zoomFactor, forceCursorDragging } = this.state;
        const { xRatio, yRatio } = playCursorPosition;
        const { currentX } = this.draggableApi.calculateCurrentPositionFromRatios(xRatio, yRatio);
        const { scrollLeft, clientWidth } = this.scrollable.current;
        if(forceCursorDragging || currentX < scrollLeft || currentX > (scrollLeft + clientWidth)) this.scrollable.current.scrollLeft = currentX;
    }

    updatePlayCursorPosition = (xRatio = null, autoScroll = false) => {
        if(xRatio === null) {
            const video = this.videoRef.current;
            const { videoDuration } = this.state;
            if(video && videoDuration) {
                xRatio = video.currentTime / videoDuration;
            } else xRatio = 0;
        }
        const playCursorPosition = {
            xRatio,
            yRatio: 0,
        };
        this.setState({ playCursorPosition }, () => {
            if (autoScroll === true) this.scrollToCursor();
        })
    }

    handleVideoPlayerError = event => {
        const { error } = event.target;
        if (error && error.code === 4) {
            const { onNotSupportedVideoLoad } = this.props;
            onNotSupportedVideoLoad(error.message);
        }
    }

    handleDraggableApiMount = (api) => this.draggableApi = api;

    handleKeyPress = event => {
        if(event.keyCode === 32) {
            event.preventDefault();
            this.toggleVideoAutoPlay();
        }
    }

    handleLoadedData = () => {
        const video = this.videoRef.current;
        if(video) {
            const { inPoint } = this.props;
            if (typeof inPoint !== "undefined") this.seekVideoTo(inPoint);
            this.setState({ videoDuration: video.duration }, () => this.updatePlayCursorPosition())
        }
    }

    handleRangeChange = (value) => {
        const { rangeDisabled } = this.state;
        if (!rangeDisabled) {
            const { onRangeChange, outPoint } = this.props;
            const lastTarget = value[1] !== outPoint ? "out" : "in";
            const { inValue, outValue } = this.getFormatedValues(value[0], value[1], lastTarget);
            onRangeChange([inValue, outValue]);
        }
    }

    handleBeforeRangeChange = (ev, a) => {
        this.pauseVideo();
        this.setState({ isEditing: true });
    }

    handleAfterRangeChange = () => {
        const { playCursorPosition, videoDuration } = this.state;
        this.seekVideoTo(playCursorPosition.xRatio * videoDuration);
        this.setState({ isEditing: false });
    }

    handleFreePlayClick = () => {
        this.toggleVideoAutoPlay(false);
    }

    handlePlayCursorDrag = (position) => {
        const { xRatio } = position;
        const { videoDuration } = this.state;
        this.seekVideoTo(videoDuration * xRatio);
        this.setState({ playCursorPosition: position });
    }

    handleZoomFactorDragStart = () => this.setState({ forceCursorDragging: true });
    handleZoomFactorDragEnd = () => this.setState({ forceCursorDragging: false });

    handleZoomFactorChange = value => {
        const { zoomFactor } = this.state;
        this.setState({ zoomFactor: value }, this.scrollToCursor);
    }

    handleContainerMouseDown = (ev) => {
        ev.stopPropagation();
        const { target } = ev;
        if(!target.classList.contains("rc-slider-handle") && !target.classList.contains("dnm-video-cut-playing-cursor")) {
            this.setState({ rangeDisabled: true, forceCursorDragging: true });
        } else this.setState({ rangeDisabled: false, forceCursorDragging: false });
    }

    handleContainerMouseUp = () => this.setState({ rangeDisabled: true, forceCursorDragging: false });

    render() {
        const { inValue, outValue } = this.getFormatedValues();
        const { videoDuration, isEditing, playCursorPosition, isPlaying, forceCursorDragging, zoomFactor, } = this.state;
        const { src, classes, playerCursorWidth } = this.props;

        return (
            <div css={css`${styles}`}> 
                <div className={`dnm-video-cut-root ${classes.root || ""} ${isEditing ? "is-editing" : ""} ${isPlaying ? "is-playing" : "is-paused"}`}>
                    <video 
                        className={`dnm-video-cut-player ${classes.player || ""}`}
                        src={`${src}`}
                        ref={this.videoRef}
                        loop
                        controls={false}
                        onLoadedData={this.handleLoadedData}
                        onError={this.handleVideoPlayerError}
                    />
                    <div>
                        <div className="dnm-video-cut-play-icon" onClick={this.handleFreePlayClick}>
                            {isPlaying ? <PauseIcon /> : <PlayIcon /> }
                        </div>
                        <div className="dnm-video-cut-progress-scrollable-parent" ref={this.scrollable}>
                            <div className="dnm-video-cut-progress-container" style={{ width: `calc(${zoomFactor[0] + 100}% - 20px)` }} onTouchStart={this.handleContainerMouseDown} onTouchEnd={this.handleContainerMouseUp} onMouseDown={this.handleContainerMouseDown} onMouseUp={this.handleContainerMouseUp}>
                                <Draggable 
                                    className="dnm-video-cut-playing-cursor-draggable-item"
                                    axis="x" 
                                    forceDragging={forceCursorDragging}
                                    onMount={this.handleDraggableApiMount}
                                    onDrag={this.handlePlayCursorDrag}
                                    onDragStart={this.pauseVideo}
                                    position={playCursorPosition}
                                    draggableWidth={playerCursorWidth}
                                    rerenderKey={zoomFactor[0]}
                                >
                                    <div className="dnm-video-cut-playing-cursor" ref={this.draggable} />
                                </Draggable>
                                <Range 
                                    className={`dnm-video-cut-range ${classes.range || ""}`}
                                    min={0}
                                    max={videoDuration || 0}
                                    step={.05}
                                    value={[inValue, outValue]} 
                                    onChange={this.handleRangeChange}
                                    onBeforeChange={this.handleBeforeRangeChange}
                                    onAfterChange={this.handleAfterRangeChange}
                                />
                            </div>
                        </div>
                        <div className="dnm-video-cut-tools">
                            <div className="dnm-video-cut-zoom">
                                <Range 
                                    className={`dnm-video-cut-zoom-range ${classes.zoomRange || ""}`}
                                    min={0}
                                    max={900}
                                    step={.05}
                                    value={zoomFactor} 
                                    onBeforeChange={this.handleZoomFactorDragStart}
                                    onAfterChange={this.handleZoomFactorDragEnd}
                                    onChange={this.handleZoomFactorChange}
                                />
                                <div className="dnm-video-cut-zoom-icon">
                                    <ZoomIcon />
                                </div>
                            </div>
                            <div className="clearfix" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

DnmVideoCut.propTypes = {
    classes: PropTypes.shape({
        root: PropTypes.string,
        player: PropTypes.string,
        range: PropTypes.string,
    }),
    onRangeChange: PropTypes.func.isRequired,
    src: PropTypes.string.isRequired,
    inPoint: PropTypes.number,
    outPoint: PropTypes.number,
    maxDuration: PropTypes.number,
    minDuration: PropTypes.number,
    draggableWidth: PropTypes.number,
};

DnmVideoCut.defaultProps = {
    classes: {},
    inPoint: 0,
    outPoint: 0,
    maxDuration: 0,
    minDuration: 0,
    playerCursorWidth: 14,
};