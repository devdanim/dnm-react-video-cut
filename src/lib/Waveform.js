import React from 'react';
import ReactWaves, { Regions } from '@dschoon/react-waves';
import { debounce } from 'lodash-es';

export default class Waveform extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        wavesurfer: null,
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
        this.setState(({ wavesurfer }));
    };

    onReady = () => {
        const { wavesurfer } = this.state;
        const { onWaveformReady } = this.props;
        onWaveformReady(wavesurfer);
    }

    getRegions = () => {
        const { range } = this.props;
        return {
            cut: {
                id: 'cut',
                start: range ? range[0] : 0,
                end: range ? range[1] : 0,
                color: 'rgba(146, 210, 117, 0.3)',
                resize: false,
                drag: false,
            }
        };
    }

    handleSingleRegionUpdate = (e) => {
        const { onRangeChange } = this.props;
        const { start, end } = e.region;
        onRangeChange([start, end], true);
      };
 
    render () {
        const { src, position, range, height, style, visible, } = this.props;
        const regions = this.getRegions();

        return (
          <ReactWaves
            audioFile={src}
            className={`dnm-video-cut-audio-waveform ${visible === false ? 'dnm-video-cut-audio-waveform-loading' : ''}`}
            options={{
              barGap: 3,
              barWidth: 4,
              barHeight: 2,
              barRadius: 3,
              cursorWidth: 0,
              interact: false,
              height,
              hideScrollbar: true,
              progressColor: '#aeb3b7',
              responsive: true,
              waveColor: '#D1D6DA',
            }}
            zoom={0}
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