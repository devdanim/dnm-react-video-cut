import { css } from '@emotion/react';

export default css`
  .rc-slider {
    position: relative;
    height: 14px;
    padding: 5px 0;
    width: 100%;
    border-radius: 6px;
    -ms-touch-action: none;
    touch-action: none;
    box-sizing: border-box;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
  .rc-slider * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
  .rc-slider-rail {
    position: absolute;
    width: 100%;
    background-color: #e9e9e9;
    height: 4px;
    border-radius: 6px;
  }
  .rc-slider-track {
    position: absolute;
    left: 0;
    height: 4px;
    border-radius: 6px;
    background: linear-gradient(45deg,#46be8a 0,#92d275 100%);
  }
  .rc-slider-handle {
    position: absolute;
    width: 14px;
    height: 14px;
    cursor: pointer;
    cursor: -webkit-grab;
    margin-top: -5px;
    cursor: grab;
    border-radius: 50%;
    border: solid 2px #46be8a;
    background-color: #fff;
    -ms-touch-action: pan-x;
    touch-action: pan-x;
  }
  .rc-slider-handle-dragging.rc-slider-handle-dragging.rc-slider-handle-dragging {
    border-color: #92d275;
    box-shadow: 0 0 0 5px #92d275;
  }
  .rc-slider-handle:focus {
    outline: none;
  }
  .rc-slider-handle-click-focused:focus {
    border-color: #46be8a;
    box-shadow: unset;
  }
  .rc-slider-handle:hover {
    border-color: #92d275;
  }
  .rc-slider-handle:active {
    border-color: #92d275;
    box-shadow: 0 0 5px #92d275;
    cursor: -webkit-grabbing;
    cursor: grabbing;
  }
  .rc-slider-mark {
    position: absolute;
    top: 18px;
    left: 0;
    width: 100%;
    font-size: 12px;
  }
  .rc-slider-mark-text {
    position: absolute;
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    cursor: pointer;
    color: #999;
  }
  .rc-slider-mark-text-active {
    color: #666;
  }
  .rc-slider-step {
    position: absolute;
    width: 100%;
    height: 4px;
    background: transparent;
  }
  .rc-slider-dot {
    position: absolute;
    bottom: -2px;
    margin-left: -4px;
    width: 8px;
    height: 8px;
    border: 2px solid #e9e9e9;
    background-color: #fff;
    cursor: pointer;
    border-radius: 50%;
    vertical-align: middle;
  }
  .rc-slider-dot-active {
    border-color: #46be8a;
  }
  .rc-slider-dot-reverse {
    margin-left: 0;
    margin-right: -4px;
  }
  .rc-slider-disabled {
    background-color: #e9e9e9;
  }
  .rc-slider-disabled .rc-slider-track {
    background-color: rgb(197, 203, 212);
  }
  .rc-slider-disabled .rc-slider-handle,
  .rc-slider-disabled .rc-slider-dot {
    border-color: rgb(197, 203, 212);
    box-shadow: none;
    background-color: #fff;
    cursor: not-allowed;
  }
  .rc-slider-disabled .rc-slider-mark-text,
  .rc-slider-disabled .rc-slider-dot {
    cursor: not-allowed !important;
  }
  .rc-slider-vertical {
    width: 14px;
    height: 100%;
    padding: 0 5px;
  }
  .rc-slider-vertical .rc-slider-rail {
    height: 100%;
    width: 4px;
  }
  .rc-slider-vertical .rc-slider-track {
    left: 5px;
    bottom: 0;
    width: 4px;
  }
  .rc-slider-vertical .rc-slider-handle {
    margin-left: -5px;
    -ms-touch-action: pan-y;
    touch-action: pan-y;
  }
  .rc-slider-vertical .rc-slider-mark {
    top: 0;
    left: 18px;
    height: 100%;
  }
  .rc-slider-vertical .rc-slider-step {
    height: 100%;
    width: 4px;
  }
  .rc-slider-vertical .rc-slider-dot {
    left: 2px;
    margin-bottom: -4px;
  }
  .rc-slider-vertical .rc-slider-dot:first-of-type {
    margin-bottom: -4px;
  }
  .rc-slider-vertical .rc-slider-dot:last-of-type {
    margin-bottom: -4px;
  }
  .rc-slider-tooltip-zoom-down-enter,
  .rc-slider-tooltip-zoom-down-appear {
    animation-duration: 0.3s;
    animation-fill-mode: both;
    display: block !important;
    animation-play-state: paused;
  }
  .rc-slider-tooltip-zoom-down-leave {
    animation-duration: 0.3s;
    animation-fill-mode: both;
    display: block !important;
    animation-play-state: paused;
  }
  .rc-slider-tooltip-zoom-down-enter.rc-slider-tooltip-zoom-down-enter-active,
  .rc-slider-tooltip-zoom-down-appear.rc-slider-tooltip-zoom-down-appear-active {
    animation-name: rcSliderTooltipZoomDownIn;
    animation-play-state: running;
  }
  .rc-slider-tooltip-zoom-down-leave.rc-slider-tooltip-zoom-down-leave-active {
    animation-name: rcSliderTooltipZoomDownOut;
    animation-play-state: running;
  }
  .rc-slider-tooltip-zoom-down-enter,
  .rc-slider-tooltip-zoom-down-appear {
    transform: scale(0, 0);
    animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  }
  .rc-slider-tooltip-zoom-down-leave {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
  }
  @keyframes rcSliderTooltipZoomDownIn {
    0% {
      opacity: 0;
      transform-origin: 50% 100%;
      transform: scale(0, 0);
    }
    100% {
      transform-origin: 50% 100%;
      transform: scale(1, 1);
    }
  }
  @keyframes rcSliderTooltipZoomDownOut {
    0% {
      transform-origin: 50% 100%;
      transform: scale(1, 1);
    }
    100% {
      opacity: 0;
      transform-origin: 50% 100%;
      transform: scale(0, 0);
    }
  }
  .rc-slider-tooltip {
    position: absolute;
    left: -9999px;
    top: -9999px;
    visibility: visible;
    box-sizing: border-box;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
  .rc-slider-tooltip * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
  .rc-slider-tooltip-hidden {
    display: none;
  }
  .rc-slider-tooltip-placement-top {
    padding: 4px 0 8px 0;
  }
  .rc-slider-tooltip-inner {
    padding: 6px 2px;
    min-width: 24px;
    height: 24px;
    font-size: 12px;
    line-height: 1;
    color: #fff;
    text-align: center;
    text-decoration: none;
    background-color: #6c6c6c;
    border-radius: 6px;
    box-shadow: 0 0 4px #d9d9d9;
  }
  .rc-slider-tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
  }
  .rc-slider-tooltip-placement-top .rc-slider-tooltip-arrow {
    bottom: 4px;
    left: 50%;
    margin-left: -4px;
    border-width: 4px 4px 0;
    border-top-color: #6c6c6c;
  }
  
  .dnm-video-cut-player {
    opacity: 1;
    width: 100%;
    max-height: 60vh;
  }

  .dnm-video-cut-audio-player {
    display: none;
  }

  .dnm-video-cut-audio-waveform-loading {
    height: 0;
    overflow: hidden;
  }

  .dnm-video-cut-audio-waveform {
    width: 100%;
    padding: 0;
    margin: 0;
  }
  
  .dnm-video-cut-audio-waveform .wavesurfer-region {
    z-index: 3 !important;
  }
  
  .dnm-video-cut-audio-waveform .wavesurfer-handle {
    background-color: rgba(146, 210, 117, 0.9) !important;
    width: 4px !important;
  }
  
  .dnm-video-cut-range {
    width: 100%;
    position: relative;
    bottom: 17px;
  }
  
  .dnm-video-cut-playing-cursor {
    height: 20px;
    width: 10px;
    background-color: white;
    border-radius: 10px;
    margin-top: -3px;
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
  }
  
  .dnm-video-cut-playing-cursor-draggable-item {
    width: 10px;
    z-index: 2;
    position: relative;
  }
  
  .dnm-video-cut-playing-cursor-draggable-item:hover {
    cursor: grab;
  }
  
  .dnm-video-cut-playing-cursor-draggable-item:active {
    cursor: -webkit-grabbing;
    cursor: grabbing;
  }
  
  .dnm-video-cut-playing-cursor {
    transform: scale(1);
    transition: all 0.2s ease-in-out;
  }
  
  .dnm-video-cut-playing-cursor:hover {
    transform: scale(1.3);
  }

  .dnm-video-cut-progress-root {
    display: flex;
    justify-content: center; 
    align-items: center;
    flex-flow: column;
  }
  
  .dnm-video-cut-progress-core {
    width: 100%;
    display: flex;
    align-items: center;
  }

  .dnm-video-cut-progress-scrollable-parent {
    width: calc(100% - 45px);
    display: inline-block;
    margin-left: 15px;
    margin-top: 0;
    padding-top: 10px;
    overflow-x: scroll;
  }

  .dnm-video-cut-progress-scrollable-root {
    margin-left: 10px;
    padding-right: 10px;
    position: relative;
  }
  
  .dnm-video-cut-loop-icon-container {
    height: 22px;
  }
  
  .dnm-video-cut-play-icon {
    width: 30px;
    height: 30px;
    display: inline-block;
    transform: scale(1);
    transition: all 0.2s ease-in-out;
    background: linear-gradient(45deg,#46be8a 0,#92d275 100%);
    border-radius: 100px;
    display: flex;
    justify-content: center; 
    align-items: center;
  }

  .dnm-video-cut-loop-icon {
    width: 20px;
    height: 20px;
    display: block;
    transform: scale(1);
    transition: transform 0.2s ease-in-out;
    background: linear-gradient(45deg,#46be8a 0,#92d275 100%);
    border-radius: 100px;
    z-index: 3;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .dnm-video-cut-loop-icon svg {
    color: white;
    position: relative;
  }

  .dnm-video-cut-play-icon svg {
    color: white;
    width: 12px;
    position: relative;
  }
  
  .dnm-video-cut-root.is-playing .dnm-video-cut-loop-icon svg {
    width: 9px;
  }
  
  .dnm-video-cut-root.is-paused .dnm-video-cut-loop-icon svg {
    width: 14px;
  }
  
  .dnm-video-cut-play-icon:hover, .dnm-video-cut-loop-icon:hover {
    cursor: pointer;
    transform: scale(1.2);
    box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.2);
  }

  .dnm-video-cut-tools {
    margin-top: 5px;
    width: 100%;
    align-self: flex-end;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-flow: row-reverse;
  }

  .dnm-video-cut-zoom {
    width: 150px;
  }
  
  .dnm-video-cut-zoom-icon {
    width: 17px;
  }
  
  .dnm-video-cut-zoom-icon {
    width: 18px;
    display: inline-block;
    margin-left: 10px;
  }

  .dnm-video-cut-zoom-range {
    width: calc(100% - 28px);
    display: inline-block;
  }

  .dnm-video-cut-zoom-icon svg {
    color: rgb(168, 173, 181);
  }

  .dnm-video-cut-mute {
    display: inline-block;
    float: left;
  }

  .dnm-video-cut-checkbox-container {
    display: block;
    position: relative;
    padding-left: 35px;
    padding-top: 3px;
    margin-bottom: 12px;
    cursor: pointer;
    font-size: 18px;
    color: rgb(158 162 169);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .dnm-video-cut-checkbox-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .dnm-video-cut-checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 25px;
    width: 25px;
    background-color: rgb(229, 233, 240);
    border-radius: 5px;
  }

  .dnm-video-cut-checkbox-container:hover input ~ .dnm-video-cut-checkmark {
    background-color: rgb(197, 203, 212);
  }

  .dnm-video-cut-checkbox-container input:checked ~ .dnm-video-cut-checkmark {
    background-color: #92d275;
  }

  .dnm-video-cut-checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  .dnm-video-cut-checkbox-container input:checked ~ .dnm-video-cut-checkmark:after {
    display: block;
  }

  .dnm-video-cut-checkbox-container .dnm-video-cut-checkmark:after {
    left: 9px;
    top: 5px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
`