import React from 'react';
import WavesurferPlayer from '@wavesurfer/react'
import Regions from 'wavesurfer.js/dist/plugins/regions.esm.js';

export default class Waveform extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      wavesurfer: null,
      wavesurferRegions: null
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.redraw);
  }

  componentWillUnmount() {
    const { wavesurfer, wavesurferRegions } = this.state
    window.removeEventListener('resize', this.redraw);
    if (wavesurfer) wavesurfer.destroy();
    if (wavesurferRegions) wavesurferRegions.destroy();
  }

  componentDidUpdate(prevProps) {
    const { wavesurfer, wavesurferRegions } = this.state;
    const { position, range, zoomFactor } = this.props;
    if (wavesurfer) {
      if (prevProps.position !== position) wavesurfer.seekTo(Math.min(1, Math.max(0, position)));
      if (prevProps.zoomFactor !== zoomFactor) {
        wavesurfer.zoom(zoomFactor)
      }
    }
    if (wavesurferRegions && prevProps.range !== range) {
      wavesurferRegions.clearRegions();
      wavesurferRegions.addRegion({
        id: 'cut',
        start: range ? range[0] : 0,
        end: range ? range[1] : 0,
        color: 'rgba(146, 210, 117, 0.3)',
        resize: false,
        drag: false
      })
    }
  }

  onReady = (wavesurfer) => {
    const { onWaveformReady, range, position } = this.props;
    const wavesurferRegions = wavesurfer.registerPlugin(Regions.create())
    wavesurferRegions.addRegion({
      id: 'cut',
      start: range ? range[0] : 0,
      end: range ? range[1] : 0,
      color: 'rgba(146, 210, 117, 0.3)',
      resize: false,
      drag: false
    })
    onWaveformReady(wavesurfer);
    if (wavesurfer && position) wavesurfer.seekTo(Math.min(1, Math.max(0, position)));
    this.setState(({ wavesurfer, wavesurferRegions }));
  }


  handleSingleRegionUpdate = (e) => {
    const { onRangeChange } = this.props;
    const { start, end } = e.region;
    onRangeChange([start, end], true);
  };

  render() {
    const { src, height, visible } = this.props;

    return <div
      className={`dnm-video-cut-audio-waveform ${visible === false ? 'dnm-video-cut-audio-waveform-loading' : ''}`}>
      <WavesurferPlayer
        key={src}
        url={src}
        height={height}
        waveColor={'#D1D6DA'}
        hideScrollbar={true}
        interact={false}
        progressColor={'#aeb3b7'}
        onReady={this.onReady}
      />
    </div>
  }
}