import React from 'react';
import { render } from 'react-dom';
import DnmVideoCut from '../dist/dnm-react-video-cut.es';
import video from './video.mp4';
import music from './music.wav';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inPoint: 0,
            outPoint: 100,
            muted: false,
            type: 'audio',
            src: null,
        }
        this.videoRef = React.createRef();
    }

    handleFileChange = (e, type) => {
        const { files } = e.target;
        if (files[0]) {
            this.setState({ src: URL.createObjectURL(files[0]), type });
        }
    }

    handleRangeChange = (value) => {
        this.setState({
            inPoint: value[0],
            outPoint: value[1]
        })
    }

    handleMuteChange = (muted) => {
        this.setState({ muted })
    }

    render() {
        const { inPoint, outPoint, muted, type, src } = this.state;
        return(
            <React.Fragment>
                <button onClick={() => this.setState({ type: type === 'audio' ? 'video' : 'audio', src: null })}>Toggle mode</button>
                <br />
                <br />
                <div>
                    <label htmlFor="audioFile">Set audio file</label>
                    <br />
                    <input type="file" id="audioFile" onChange={e => this.handleFileChange(e, "audio")} />
                </div>
                <br />
                <br />
                <div>
                    <label htmlFor="videoFile">Set video file</label>
                    <br />
                    <input type="file" id="videoFile" onChange={e => this.handleFileChange(e, "video")} />
                </div>
                <br />
                <br />
                <DnmVideoCut
                    inPoint={inPoint}
                    outPoint={outPoint}
                    muted={muted}
                    catalogue={{
                        unmute: 'Enable sound',
                        playTooltip: 'Click or press P to play',
                        pauseTooltip: 'Click or press P to pause',
                        loopPlayTooltip: 'Click or press space to play the segment',
                        loopPauseTooltip: 'Click or press space to pause the segment',
                    }}
                    src={src || (type === 'audio' ? music : video)}
                    type={type}
                    loader={<p>Is loading...</p>}
                    maxDuration={10}
                    minDuration={4}
                    onRangeChange={this.handleRangeChange}
                    onMuteChange={this.handleMuteChange}
                    onNotSupportedVideoLoad={(err) => console.error("Video source not supported", err)}
                />
            </React.Fragment>
        )
    }
}

render(
    <App />,
    document.getElementById('root')
);
