import React from 'react';
import { render } from 'react-dom';
import DnmVideoCut from '../dist/dnm-react-video-cut.es';
import video from './video.mp4';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inPoint: 0,
            outPoint: 100,
            muted: false,
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
        const { inPoint, outPoint, muted } = this.state;
        return(
            <DnmVideoCut
                inPoint={inPoint}
                outPoint={outPoint}
                muted={muted}
                catalogue={{
                    unmute: 'Custom unmute label'
                }}
                src={video}
                maxDuration={10}
                minDuration={4}
                onRangeChange={this.handleRangeChange}
                onMuteChange={this.handleMuteChange}
                onNotSupportedVideoLoad={(err) => console.error("Video source not supported", err)}
            />
        )
    }
}

render(
    <App />,
    document.getElementById('root')
);
