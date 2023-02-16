import React from 'react';
import ReactDOM from 'react-dom';
// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import PropTypes from 'prop-types';
import { Range } from 'rc-slider';
import SmartCroppr from 'dnm-react-smartcroppr';
import styles from './css/styles';
import Draggable from './lib/draggable';
import PlayIcon from './lib/svg/play';
import PauseIcon from './lib/svg/pause';
import LoopIcon from './lib/svg/loop';
import ZoomIcon from './lib/svg/zoom';
import StartIcon from './lib/svg/start';
import { throttle } from 'lodash-es';
import Waveform from './lib/Waveform';

export default class DnmVideoCut extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // We sometimes need to force rerender because some elements position need to be recalculated
            forceRerenderKey: 0,
            videoDuration: 0,
            isPlaying: false,
            forceCursorDragging: false,
            zoomFactor: [0],
            playCursorPosition: {
                xRatio: 0,
                yRatio: 0
            },
            waveformIsReady: false,
        }
        this.playLoop = false;
        this.playerRef = { current: null };
        this.scrollable = React.createRef();
        this.draggable = React.createRef();
        this.draggableApi = null;
        this.rangeDisabled = true;
        this.isEditing = false;
        this.seekVideoTo = throttle(this._seekVideoTo, 200);
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyPress);
    }

    componentDidUpdate(prevProps, prevState) {
        const { videoDuration } = this.state;
        const { inPoint, outPoint, src, muted, type, } = this.props;
        if(!isNaN(videoDuration) && videoDuration !== prevState.videoDuration) {
            this.handleRangeChange([inPoint, outPoint], true);
        }
        if(src !== prevProps.src) {
            this.pauseVideo();
            if (type === 'audio') this.setState({ waveformIsReady: false });
        }
        if(this.isEditing && (prevProps.inPoint !== inPoint || prevProps.outPoint !== outPoint)) {
            let time;
            if(prevProps.inPoint !== inPoint && prevProps.outPoint !== outPoint) {
                const { min, max } = this.getAcceptedDuration();
                if(Math.abs(outPoint - inPoint - min) < Math.abs(outPoint - inPoint - max)) time = prevProps.inPoint < inPoint ? inPoint : outPoint;
                else time = prevProps.inPoint > inPoint ? inPoint : outPoint;
            }
            else time = prevProps.outPoint !== outPoint ? outPoint : inPoint;
            this.seekVideoTo(time);
        }
        if(muted !== prevProps.muted) this.updatePlayerVolume();
    }

    componentWillUnmount = () => {
        window.removeEventListener("keydown", this.handleKeyPress);
        const video = this.playerRef.current;
        if (video) {
            video.removeEventListener('timeupdate', this.monitorAutoplay);
            video.removeEventListener('seek', this.monitorAutoplay);
        }
    }

    _seekVideoTo(time) {
        if (!isNaN(time)) {
            const video = this.playerRef.current;
            if(video) video.currentTime = time;
        }
    }

    getAcceptedDuration = () => {
        const { minDuration, maxDuration } = this.props;
        const { videoDuration } = this.state;
        let min = parseFloat(minDuration) || 0;
        if (min < 0) min = 0;
        let max = parseFloat(maxDuration) || videoDuration;
        if (max > videoDuration) max = videoDuration;
        return min > max ? { min: max, max: min } : { min, max };
    }

    getFormatedValues = (inPoint, outPoint, lastTarget = "in") => {
        if(!inPoint) inPoint = this.props.inPoint;
        if(!outPoint) outPoint = this.props.outPoint;
        const { min, max } = this.getAcceptedDuration();
        const { videoDuration } = this.state;

        let inValue = inPoint || 0;
        let outValue = outPoint || videoDuration;

        const format = (_lastTarget) => {
            if(outValue - inValue > max) {
                if(_lastTarget === "in") outValue = inValue + max;
                else inValue = outValue - max;
            } else if(outValue - inValue < min) {
                if(_lastTarget === "in") outValue = inValue + min;
                else inValue = outValue - min;
            }
        }
        format(lastTarget);

        if(inValue < 0) {
            inValue = 0;
            format("in");
        } else if(outValue > videoDuration) {
            outValue = videoDuration;
            format("out");
        }

        return {
            inValue,
            outValue
        }
    }

    toggleVideoAutoPlay = (playLoop = true) => {
        const video = this.playerRef.current;
        if(video) {
            this.playLoop = playLoop;
            if(video.paused) {
                this.monitorAutoplay(true);
                this.playVideo();
            }
            else this.pauseVideo();
        }
    }

    monitorAutoplay = (force = false) => {
        const video = this.playerRef.current;
        if(video && (!video.paused || force === true)) {
            if(this.playLoop) {
                const { inValue, outValue } = this.getFormatedValues();
                const time = video.currentTime;
                if((time + 0.04) < inValue || (time - 0.04) > outValue) {
                    video.currentTime = inValue;
                }
            }
            this.updatePlayCursorPosition(null, true);
        }
    }

    playVideo = () => {
        const video = this.playerRef.current;
        if(video) {
            video.play();
        }
        this.setState({ isPlaying: true });
    }

    pauseVideo = () => {
        const video = this.playerRef.current;
        if(video) {
            video.pause();
        }
        this.setState({ isPlaying: false });
    }

    updatePlayerVolume = () => {
        const { muted } = this.props;
        const video = this.playerRef.current;
        if(video) {
            video.volume = muted ? 0 : 0.5;
        }
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
            const video = this.playerRef.current;
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

    getLoopElPosition = () => {
        if (this.scrollable.current) {
            const handleLeft = this.scrollable.current.getElementsByClassName('rc-slider-handle-1')[0];
            const handleRight = this.scrollable.current.getElementsByClassName('rc-slider-handle-2')[0];
            if (handleLeft && handleRight) {
                const posLeft = parseFloat(handleLeft.style.left);
                const posRight = parseFloat(handleRight.style.left);
                const posIcon = `${posLeft + (posRight - posLeft) / 2}%`;
                return posIcon;
            }
        }
        return '0';
    }

    handleWaveformReady = () => {
        this.setState({ waveformIsReady: true });
    }

    handleDraggableApiMount = (api) => this.draggableApi = api;

    handleKeyPress = event => {
        if(event.keyCode === 32) {
            event.preventDefault();
            this.toggleVideoAutoPlay();
        } else if (event.keyCode === 80) {
            event.preventDefault();
            this.handleFreePlayClick();
        }
    }

    handlePlayerLoad = (ref) => {
        this.playerRef = { current: ref };
        const video = this.playerRef.current;
        if (video) {
            video.addEventListener('timeupdate', this.monitorAutoplay);
            video.addEventListener('seek', this.monitorAutoplay);
        }
    }

    handleVideoPlayerLoad = (cropprInstance, videoNode) => {
        this.handlePlayerLoad(videoNode);
        this.handleLoadedData();
    }

    handleLoadedData = () => {
        const { onVideoLoadedData } = this.props;
        const video = this.playerRef.current;
        if (video) {
            const { inPoint } = this.props;
            if (typeof inPoint !== "undefined") this.seekVideoTo(inPoint);
            this.updatePlayerVolume();
            this.setState({ videoDuration: video.duration }, () => this.updatePlayCursorPosition())
            if (onVideoLoadedData) onVideoLoadedData(video);
        }
    }

    handleRangeChange = (value, force = false) => {
        if (!this.rangeDisabled || force) {
            const { onRangeChange, outPoint } = this.props;
            const lastTarget = value[1] !== outPoint ? "out" : "in";
            const { inValue, outValue } = this.getFormatedValues(value[0], value[1], lastTarget);
            onRangeChange([inValue, outValue]);
        }
    }

    handleBeforeRangeChange = (ev, a) => {
        this.pauseVideo();
        this.isEditing = true;
    }

    handleAfterRangeChange = () => {
        const { playCursorPosition, videoDuration } = this.state;
        this.seekVideoTo(playCursorPosition.xRatio * videoDuration);
        this.isEditing = false;
    }

    handleCutInClick = () => {
        const { forceRerenderKey } = this.state;
        const { outPoint } = this.props;
        this.handleRangeChange([this.playerRef.current.currentTime, outPoint], true);
        // We need to force rerendering to recalculate position of loop icon
        setTimeout(() => this.setState({ forceRerenderKey: forceRerenderKey + 1 }), 100);
    }

    handleCutOutClick = () => {
        const { forceRerenderKey } = this.state;
        const { inPoint } = this.props;
        this.handleRangeChange([inPoint, this.playerRef.current.currentTime], true);
        setTimeout(() => this.setState({ forceRerenderKey: forceRerenderKey + 1 }), 100);
    }

    handleFreePlayClick = () => {
        this.toggleVideoAutoPlay(false);
    }

    handleLoopPlayClick = (event) => {
        event.stopPropagation();
        this.toggleVideoAutoPlay();
    }

    handlePlayCursorDrag = (position) => {
        const { xRatio } = position;
        const { videoDuration } = this.state;
        this.seekVideoTo(videoDuration * xRatio);
        this.setState({ playCursorPosition: position });
    }

    handleWaveformPositionChange = (position) => {
        const { playCursorPosition } = this.state;
        const { yRatio } = playCursorPosition;
        this.setState({ playCursorPosition: { xRatio: position / 100, yRatio } });
    }

    handleZoomFactorDragStart = () => this.setState({ forceCursorDragging: true });
    handleZoomFactorDragEnd = () => this.setState({ forceCursorDragging: false });

    handleZoomFactorChange = value => {
        const { zoomFactor } = this.state;
        this.setState({ zoomFactor: value }, this.scrollToCursor);
    }

    handleContainerMouseDown = (ev) => {
        const { target } = ev;
        const { forceCursorDragging } = this.state;
        if(!target.classList.contains("rc-slider-handle") && !target.classList.contains("dnm-video-cut-playing-cursor")) {
            if (!this.rangeDisabled || !forceCursorDragging) {
                this.rangeDisabled = true;
                this.setState({ forceCursorDragging: true });
            }
        } else if (this.rangeDisabled || forceCursorDragging) {
            this.rangeDisabled = false;
            this.setState({ forceCursorDragging: false });
        }
    }

    handleContainerMouseUp = () => {
        this.rangeDisabled = true;
        this.setState({ forceCursorDragging: false });
    }

    handleMuteChange = (event) => {
        const { onMuteChange } = this.props;
        if (onMuteChange) onMuteChange(!event.target.checked);
    }

    render() {
        const { inValue, outValue } = this.getFormatedValues();
        const { videoDuration, playCursorPosition, isPlaying, forceCursorDragging, zoomFactor, waveformIsReady, } = this.state;
        const { src, catalogue, classes, playerCursorWidth, muted, onMuteChange, type, waveformHeight, tooltipRenderer, loader, minDuration, smartCropprProps, } = this.props;

        const loopElPosition = this.getLoopElPosition();

        return (
            <div css={css`${styles}`}>
                <div className={`dnm-video-cut-root ${classes.root || ""} ${isPlaying ? "is-playing" : "is-paused"}`}>
                    {
                        type === 'audio' ? (
                            <React.Fragment>
                                {
                                    !waveformIsReady && loader ? loader : null
                                }
                                <Waveform
                                    src={src}
                                    visible={waveformIsReady}
                                    position={playCursorPosition.xRatio}
                                    onPositionChange={this.handleWaveformPositionChange}
                                    onRangeChange={this.handleRangeChange}
                                    onWaveformReady={this.handleWaveformReady}
                                    range={[inValue, outValue]}
                                    height={waveformHeight}
                                />
                                <audio
                                    className={`dnm-video-cut-audio-player ${classes.audioPlayer || ""}`}
                                    src={src}
                                    ref={this.handlePlayerLoad}
                                    loop
                                    onLoadedData={this.handleLoadedData}
                                    onError={this.handlePlayerError}
                                    preload="auto"
                                />
                            </React.Fragment>
                        ) : (
                            <SmartCroppr
                                { ...(smartCropprProps || {}) }
                                onMediaLoad={this.handleVideoPlayerLoad}
                                mediaType="video"
                                src={src}
                            />
                        )
                    }
                    <div className="dnm-video-cut-progress-root">
                        <div className="dnm-video-cut-cutter-icons">
                            {
                                tooltipRenderer((
                                    <div
                                        className="dnm-video-cut-in-icon"
                                        onClick={this.handleCutInClick}
                                    >
                                        <StartIcon />
                                    </div>
                                ), { title: catalogue.cutInTooltip, id: 'cut-in' })
                            }
                            {
                                tooltipRenderer((
                                    <div
                                        className="dnm-video-cut-out-icon"
                                        onClick={this.handleCutOutClick}
                                    >
                                        <StartIcon />
                                    </div>
                                ), { title: catalogue.cutOutTooltip, id: 'cut-out' })
                            }
                        </div>
                        <div className="dnm-video-cut-progress-core">
                            {
                                tooltipRenderer((
                                    <div
                                        className="dnm-video-cut-play-icon"
                                        onClick={this.handleFreePlayClick}
                                    >
                                        {isPlaying ? <PauseIcon /> : <PlayIcon /> }
                                    </div>
                                ), { title: isPlaying ? catalogue.pauseTooltip : catalogue.playTooltip, id: 'play' })
                            }
                            <div className="dnm-video-cut-progress-scrollable-parent" ref={this.scrollable}>
                                <div
                                    className="dnm-video-cut-progress-scrollable-root"
                                    style={{ width: `calc(${zoomFactor[0] + 100}% - 20px)` }}
                                >
                                    <div className="dnm-video-cut-loop-icon-container">
                                        <div className="dnm-video-cut-loop-icon-shell" style={{ position: 'absolute', left: `calc(${loopElPosition} - 10px)` }}>
                                            {
                                                tooltipRenderer((
                                                    <div
                                                        className="dnm-video-cut-loop-icon"
                                                        onClick={this.handleLoopPlayClick}
                                                    >
                                                        {isPlaying ? <PauseIcon /> : <LoopIcon /> }
                                                    </div>
                                                ), { title: isPlaying ? catalogue.loopPauseTooltip : catalogue.loopPlayTooltip, id: 'loop', context: {loopElPosition, videoDuration, playCursorPosition, playerCursorWidth, zoomFactor, inValue, outValue} })
                                            }
                                        </div>
                                    </div>
                                    <div
                                        className="dnm-video-cut-progress-container"
                                        onTouchMove={this.handleContainerMouseDown}
                                        onTouchEnd={this.handleContainerMouseUp}
                                        onMouseDown={this.handleContainerMouseDown}
                                        onMouseUp={this.handleContainerMouseUp}
                                    >
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
                            </div>
                        </div>
                        {
                            // +0.001 needed to fix weird round bug
                            outValue - inValue + 0.001 < (parseFloat(minDuration) || 0) ? (
                                <div>
                                    <p className="dnm-video-cut-too-short-warning">{ catalogue.videoTooShortWarning }</p>
                                </div>
                            ) : null
                        }
                        <div className="dnm-video-cut-tools">
                            {/* placing the zoom BEFORE the mute checkbox, the css will then handle it for BOTH audio and video: for audio, "space-between" will place the zoom as if it were "flex-start" */}
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
                            {
                                type !== 'audio' ? (
                                    <div className="dnm-video-cut-mute">
                                        {
                                            onMuteChange && (
                                                <label className="dnm-video-cut-checkbox-container">
                                                    { catalogue.unmute }
                                                    <input type="checkbox" checked={!muted} onChange={this.handleMuteChange} />
                                                    <span className="dnm-video-cut-checkmark" />
                                                </label>
                                            )
                                        }
                                    </div>
                                ) : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

DnmVideoCut.propTypes = {
    catalogue: PropTypes.object,
    classes: PropTypes.shape({
        root: PropTypes.string,
        range: PropTypes.string,
    }),
    onRangeChange: PropTypes.func.isRequired,
    onVideoLoadedData: PropTypes.func,
    src: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['audio', 'video']),
    inPoint: PropTypes.number,
    outPoint: PropTypes.number,
    draggableWidth: PropTypes.number,
    maxDuration: PropTypes.number,
    minDuration: PropTypes.number,
    muted: PropTypes.bool,
    onMuteChange: PropTypes.func,
    playerCursorWidth: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.number,
    ]),
    smartCropprProps: PropTypes.object.isRequired,
    waveformHeight: PropTypes.number,
    tooltipRenderer: PropTypes.func,
};

DnmVideoCut.defaultProps = {
    catalogue: {
        unmute: 'Enable sound',
        cutInTooltip: 'Define inpoint',
        cutOutTooltip: 'Define outpoint',
        playTooltip: 'Click or press P to play',
        pauseTooltip: 'Click or press P to pause',
        loopPlayTooltip: 'Click or press space to play the segment',
        loopPauseTooltip: 'Click or press space to pause the segment',
        videoTooShortWarning: 'Imported video is shorter than the recommended minimum duration, which may lead to an unexpected result.',
    },
    classes: {},
    onRangeChange: points => null,
    onVideoLoadedData: video => null,
    inPoint: 0,
    outPoint: 0,
    type: 'video',
    draggableWidth: null,
    maxDuration: 0,
    minDuration: 0,
    muted: false,
    playerCursorWidth: 14,
    waveformHeight: 150,
    tooltipRenderer: (children, { title }) => children,
};
