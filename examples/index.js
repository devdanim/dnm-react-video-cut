import React from 'react';
import { render } from 'react-dom';
import DnmVideoCut from '../dist/dnm-react-video-cut.es';
import video from './video.mp4';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inPoint: 0,
            outPoint: 100
        }
        this.videoRef = React.createRef();
    }

    handleRangeChange = (value) => {
        this.setState({
            inPoint: value[0],
            outPoint: value[1]
        })
    }

    render() {
        const { inPoint, outPoint } = this.state;
        return(
            <DnmVideoCut
                inPoint={inPoint}
                outPoint={outPoint}
                src={video}
                maxDuration={10}
                onRangeChange={this.handleRangeChange}
            />
        )
    }
}

render(
    <App />,
    document.getElementById('root')
);
