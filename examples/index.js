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
        }
        this.videoRef = React.createRef();
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
        const { inPoint, outPoint, muted, type } = this.state;
        return(
            <React.Fragment>
                <button onClick={() => this.setState({ type: type === 'audio' ? 'video' : 'audio' })}>Toggle mode</button>
                <DnmVideoCut
                    inPoint={inPoint}
                    outPoint={outPoint}
                    muted={muted}
                    catalogue={{
                        unmute: 'Custom unmute label'
                    }}
                    src={type === 'audio' ? music : video}
                    type={type}
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
