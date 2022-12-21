import React from 'react';
import { render } from 'react-dom';
import DnmVideoCut from '../dist/dnm-react-video-cut.es';
import video from './video.MOV';
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
            moduleKey: new Date().getTime()
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
        const { inPoint, outPoint, muted, type, src, moduleKey } = this.state;
        return(
            <React.Fragment>
                <button onClick={() => this.setState({ type: type === 'audio' ? 'video' : 'audio', src: null })}>Toggle mode</button>
                <button onClick={() => this.setState({ moduleKey: new Date().getTime() })}>Update React Key</button>
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
                <div style={{ width: '350px' }}>
                    <DnmVideoCut
                        key={moduleKey}
                        inPoint={inPoint}
                        outPoint={outPoint}
                        muted={muted}
                        catalogue={{
                            unmute: 'Enable sound',
                            playTooltip: 'Click or press P to play',
                            pauseTooltip: 'Click or press P to pause',
                            loopPlayTooltip: 'Click or press space to play the segment',
                            loopPauseTooltip: 'Click or press space to pause the segment',
                            videoTooShortWarning: 'Imported video is shorter than the recommended minimum duration, which may lead to an unexpected result.',
                        }}
                        src={src || (type === 'audio' ? music : video)}
                        type={type}
                        loader={<p>Is loading...</p>}
                        maxDuration={10}
                        minDuration={4}
                        onRangeChange={this.handleRangeChange}
                        onMuteChange={this.handleMuteChange}
                        smartCropprProps={{
                            aspectRatio: 2,
                            debug: false,
                            maxAspectRatio: 1,
                            mode: 'real',
                            onCropEnd: data => console.log('onCropEnd', data),
                            onCropMove: data => console.log('onCropMove', data),
                            onCropStart: data => console.log('onCropStart', data),
                            onInit: (instance, mediaNode) => {
                                console.log('onInit', instance, mediaNode);
                            },
                            onNotSupportedVideoLoad: (err) => console.error("Video source not supported", err),
                            smartCrop: true,
                            smartCropOptions: {
                                minScale: 1,
                                onSmartCropDone: (data) => {
                                    console.log("Smartcrop", data)
                                }
                            }
                        }}
                    />
                </div>
            </React.Fragment>
        )
    }
}

render(
    <App />,
    document.getElementById('root')
);
