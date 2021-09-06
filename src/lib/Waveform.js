import React from 'react';
import ReactWaves, { Regions } from '@dschoon/react-waves';
 
export default class Waveform extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        wavesurfer: null,
        duration: 0,
      }
    }

    componentDidUpdate(prevProps) {
        const { wavesurfer } = this.state;
        const { position } = this.props;
        if (wavesurfer && prevProps.position !== position) {
            wavesurfer.seekTo(Math.min(1, Math.max(0, position)));
        }
    }

    // onPosChange = (newPosition) => {
    //     const { onPositionChange, position } = this.props;
    //     if (Math.ceil(position) !== newPosition) {
    //         console.log("Position changed", newPosition);
    //         this.ghostPosition = newPosition;
    //         onPositionChange(newPosition);
    //     }
    // }
  
    onLoading = ({ wavesurfer }) => {
        wavesurfer.toggleInteraction();
        this.setState(({ wavesurfer }));
    };

    onReady = () => {
        const { wavesurfer } = this.state;
        console.log("Ready", wavesurfer.getDuration());
        this.setState({ duration: wavesurfer.getDuration() });
    }

    getRegions = () => {
        const { duration } = this.state;
        const { range } = this.props;
        return {
            cut: {
                id: 'cut',
                start: range ? range[0] : 0,
                end: range ? range[1] : 0,
                color: 'rgba(146, 210, 117, 0.3)',
            }
        };
    }

    handleSingleRegionUpdate = (e) => {
        const { onRangeChange } = this.props;
        const { start, end } = e.region;
        onRangeChange([start, end], true);
      };

    secondsToPosition = (sec) => {
        const { duration } = this.state;
        return 1 / this.wavesurfer.getDuration() * sec;
    };
 
    render () {
        const { src, position, range } = this.props;
        const regions = this.getRegions();
        console.log(range, position, regions);
      return (
          <ReactWaves
            audioFile={src}
            className={'dnm-video-cut-audio-waveform'}
            options={{
              barGap: 3,
              barWidth: 4,
              barHeight: 2,
              barRadius: 3,
              cursorWidth: 0,
              height: 150,
              hideScrollbar: true,
              progressColor: '#46be8ae6',
              responsive: true,
              waveColor: '#D1D6DA',
            }}
            zoom={1}
            pos={position}
            playing={false} 
            onReady={this.onReady}
            onLoading={this.onLoading}
            onPosChange={this.onPosChange}
          >
            <Regions
                onSingleRegionUpdate={this.handleSingleRegionUpdate}
                regions={regions}
            />
          </ReactWaves>
      )
    }
  }