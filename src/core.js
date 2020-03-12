import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import Draggable from './lib/draggable';
import PlayIcon from './lib/svg/play';
import PauseIcon from './lib/svg/pause';

const Range = Slider.Range;
export default class DnmVideoCut extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            videoDuration: 0,
            isEditing: false,
            isPlaying: false,
            playCursorPosition: {
                xRatio: 0,
                yRatio: 0,
            }
        }
        this.videoRef = React.createRef();
    }

    componentDidMount() {
        this.getStateFromProps();
        window.addEventListener("keydown", this.handleKeyPress);
        window.addEventListener('resize', this.onWindowResize);
    }

    componentDidUpdate(prevProps, prevState) {
        const { videoDuration, isEditing } = this.state;
        const { inPoint, outPoint, src } = this.props;
        if(!isNaN(videoDuration) && videoDuration !== prevState.videoDuration) {
            this.handleRangeChange([inPoint, outPoint]);
        }
        if(src !== prevProps.src) {
            this.pauseVideo();
            this.getStateFromProps();
        }
        if(isEditing && (prevProps.inPoint !== inPoint || prevProps.outPoint !== outPoint)) {
            let time;
            if(prevProps.inPoint !== inPoint && prevProps.outPoint !== outPoint) time = prevProps.inPoint > inPoint ? inPoint : outPoint;
            else time = prevProps.outPoint !== outPoint ? outPoint : inPoint;
            this.seedVideoTo(time);
        }

    }

    componentWillUnmount = () => {
        window.removeEventListener("keydown", this.handleKeyPress);
        window.removeEventListener('resize', this.onWindowResize);
    }


    handleKeyPress = event => {
        if(event.keyCode === 32) {
            event.preventDefault();
            this.toggleVideoAutoPlay();
        }
    }

    getStateFromProps() {
        const video = this.videoRef.current;
        if(video) {
            video.addEventListener('loadedmetadata', () => {
                this.setState({ videoDuration: video.duration })
            });
        }
    }

    seedVideoTo(time) {
        console.log(time);
        const video = this.videoRef.current;
        if(video) video.currentTime = time;
    }

    getFormatedValues = (inPoint, outPoint, lastTarget = "in") => {
        if(!inPoint) inPoint = this.props.inPoint;  
        if(!outPoint) outPoint = this.props.outPoint;
        const { maxDuration } = this.props;
        const { videoDuration } = this.state;

        let max = maxDuration || videoDuration;
        if(max > videoDuration) max = videoDuration;

        let inValue = inPoint || 0;
        let outValue = outPoint || videoDuration;

        if(outValue - inValue > max) {
            if(lastTarget === "in") outValue = inValue + max;
            else inValue = outValue - max;
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
            this.updatePlayCursorPosition();
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

    updatePlayCursorPosition = (xRatio = null) => {
        if(xRatio === null) {
            const video = this.videoRef.current;
            const { videoDuration } = this.state;
            if(video && videoDuration) {
                xRatio = video.currentTime / videoDuration;
            } else xRatio = 0;
        }
        this.setState({
            playCursorPosition: {
                xRatio,
                yRatio: 0
            }
        })
    }

    handleRangeChange = (value, e, a) => {
        const { onRangeChange, outPoint } = this.props;
        const lastTarget = value[1] !== outPoint ? "out" : "in";
        const { inValue, outValue } = this.getFormatedValues(value[0], value[1], lastTarget);
        onRangeChange([inValue, outValue]);
    }

    handleBeforeRangeChange = () => {
        this.pauseVideo();
        this.setState({ isEditing: true });
    }

    handleAfterRangeChange = () => {
        const { playCursorPosition, videoDuration } = this.state;
        this.seedVideoTo(playCursorPosition.xRatio * videoDuration);
        this.setState({ isEditing: false });
    }

    handleFreePlayClick = () => {
        this.toggleVideoAutoPlay(false);
    }

    handlePlayCursorDrag = (position) => {
        const { xRatio } = position;
        const { videoDuration } = this.state;
        this.seedVideoTo(videoDuration * xRatio);
        this.setState({ playCursorPosition: position });
    }

    render() {
        const { inValue, outValue } = this.getFormatedValues();
        const { videoDuration, isEditing, playCursorPosition, isPlaying } = this.state;
        const { src, classes } = this.props;

        return (
            <div className={`dnm-video-cut-root ${isEditing ? "is-editing" : ""} ${isPlaying ? "is-playing" : "is-paused"} ${classes.root || ""}`}>
                <video className={`dnm-video-cut-player ${classes.player || ""}`} src={`${src}`} ref={this.videoRef} loop controls={false} />
                <div className="dnm-video-cut-play-icon" onClick={this.handleFreePlayClick}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon /> }
                </div>
                <div className="dnm-video-cut-progress-container">
                    <Draggable 
                        className="dnm-video-cut-playing-cursor-draggable-item"
                        axis="x" 
                        onDrag={this.handlePlayCursorDrag}
                        onDragStart={this.pauseVideo}
                        position={playCursorPosition}
                    >
                        <div className="dnm-video-cut-playing-cursor" />
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
    maxDuration: PropTypes.number
};

DnmVideoCut.defaultProps = {
    classes: {},
    inPoint: 0,
    outPoint: 0,
    maxDuration: 0,
};