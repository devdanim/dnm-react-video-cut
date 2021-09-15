import React from 'react';
import ReactWaves, { Regions } from '@dschoon/react-waves';
import { debounce } from 'lodash-es';

export default class Waveform extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        wavesurfer: null,
        duration: 0,
      }
      this.redraw = debounce(this._redraw, 250);
    }

    componentDidMount() {
      window.addEventListener('resize', this.redraw);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.redraw);
    }

    componentDidUpdate(prevProps) {
        const { wavesurfer } = this.state;
        const { position } = this.props;
        if (wavesurfer && prevProps.position !== position) {
            wavesurfer.seekTo(Math.min(1, Math.max(0, position)));
        }
    }
     
    _redraw = () => {
        const { wavesurfer } = this.state;
        if (wavesurfer) wavesurfer.drawBuffer();
    }
  
    onLoading = ({ wavesurfer }) => {
        wavesurfer.toggleInteraction();
        this.setState(({ wavesurfer }));
    };

    onReady = () => {
        const { wavesurfer } = this.state;
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
        const { src, position, range, height, } = this.props;
        const regions = this.getRegions();

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
              height,
              hideScrollbar: true,
              progressColor: '#aeb3b7',
              responsive: true,
              waveColor: '#D1D6DA',
            }}
            zoom={1}
            pos={position}
            playing={false} 
            onReady={this.onReady}
            onLoading={this.onLoading}
          >
            <Regions
                onSingleRegionUpdate={this.handleSingleRegionUpdate}
                regions={regions}
            />
          </ReactWaves>
      )
    }
  }