//https://www.kirupa.com/html5/drag.htm

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { throttle } from 'lodash-es';

export default class Draggable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            xRatio: 0,
            yRatio: 0,
            render_key: 0,
        }
        this.active = false;
        this.initialX = 0;
        this.initialY = 0;
        this.ghostContainerDimensions = this.getContainerDimensions();
        this.draggableRef = React.createRef();
        this.handleWindowResize = throttle(this._handleWindowResize, 200);
    }

    componentDidMount() {  
        const { onMount } = this.props;
        this.container = ReactDOM.findDOMNode(this).parentNode;
        this.container.addEventListener("touchstart", this.handleDragStart, false);
        this.container.addEventListener("touchend", this.handleDragEnd, false);
        this.container.addEventListener("touchmove", this.handleDrag, false);
        this.container.addEventListener("mousedown", this.handleDragStart, false);
        this.container.addEventListener("mouseup", this.handleDragEnd, false);
        this.container.addEventListener("mousemove", this.handleDrag, false);
        window.addEventListener("resize", this.handleWindowResize, false);
        if (onMount) onMount(this);
    }

    componentDidUpdate() {
        const { containerWidth, containerHeight } = this.ghostContainerDimensions;
        this.ghostContainerDimensions = this.getContainerDimensions();
        // Force rerender if container dimensions has changed
        if (containerWidth !== this.ghostContainerDimensions.containerWidth || containerHeight !== this.ghostContainerDimensions.containerHeight) {
            this._handleWindowResize();
        }
    }

    componentWillUnmount() {
        this.container.removeEventListener("touchstart", this.handleDragStart);
        this.container.removeEventListener("touchend", this.handleDragEnd);
        this.container.removeEventListener("touchmove",this.handleDrag);
        this.container.removeEventListener("mousedown",this.handleDragStart);
        this.container.removeEventListener("mouseup",this.handleDragEnd);
        this.container.removeEventListener("mousemove", this.handleDrag);
        window.removeEventListener("resize", this.handleWindowResize, false);
    }

    handleDragStart = (e) => {
        const { draggableWidth, draggableHeight } = this.props;

        const rect = this.container.getBoundingClientRect();

        this.initialX = rect.left + (draggableWidth || 0) / 2;
        this.initialY = rect.top + (draggableHeight || 0) / 2;

        if (e.target === this.draggableRef.current || this.draggableRef.current.contains(e.target)) {
            const { onDragStart } = this.props;
            if(onDragStart) onDragStart();
            this.active = true;
        }
        this.lastMouseDown = new Date().getTime();
    }

    handleDrag = (e, force = false) => {
        const { forceDragging } = this.props;
        if (this.active || forceDragging || force === true) {
            e.preventDefault();

            let currentX, currentY;

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - this.initialX;
                currentY = e.touches[0].clientY - this.initialY;
            } else {
                currentX = e.clientX - this.initialX;
                currentY = e.clientY - this.initialY;
            }

            let forceDragEnd = false;
            const xMargin = 5;
            const yMargin = 50;

            const { containerWidth, containerHeight } = this.getContainerDimensions();
            const { xAxis, yAxis } = this.getAxis();
            
            if(currentX > containerWidth) {
                if(xAxis && currentX + xMargin > containerWidth) forceDragEnd = true;
                currentX = containerWidth;
            } else if(currentX < 0) {
                if(xAxis && currentX < -xMargin) forceDragEnd = true;
                currentX = 0;
            }

            
            if(currentY > containerHeight) {
                if(yAxis && currentY + yMargin > containerHeight) forceDragEnd = true;
                currentY = containerHeight;
            }
            else if(currentY < 0) {
                if(yAxis && currentY < -yMargin) forceDragEnd = true;
                currentY = 0;
            }

            if(forceDragEnd === true) this.handleDragEnd();

            this.updateState({ 
                xRatio: currentX / containerWidth, 
                yRatio: currentY / containerHeight
            });
        }
    }

    handleDragEnd = (e) => {
        this.active = false;
        const { onDragEnd } = this.props;
        if(onDragEnd) onDragEnd(); 
        if (new Date().getTime() - this.lastMouseDown < 300) this.handleDrag(e, true);
    }

    _handleWindowResize = () => {
        const { render_key } = this.state;
        this.updateState({ render_key });
    }

    getContainerDimensions = () => {
        let containerWidth = 0;
        let containerHeight = 0;
        if (this.container) {
            const paddings = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"].map(p => (Math.round(getComputedStyle(this.container)[p].replace("px", "") || 0)));
            containerWidth = this.container.clientWidth - (paddings[0] + paddings[1]) - this.draggableRef.current.clientWidth;
            containerHeight = this.container.clientHeight - (paddings[2] + paddings[3]) - this.draggableRef.current.clientHeight;
        }
        return { containerWidth, containerHeight };
    }

    getCurrentPositionWithPercent = () => {
        const { xRatio, yRatio } = this.getCurrentPosition();
        const { containerWidth, containerHeight } = this.getContainerDimensions();
        const currentX = xRatio * containerWidth;
        const currentY = yRatio * containerHeight;
        return { currentX, currentY };
    }

    getAxis = () => {
        const { axis } = this.props;
        const xAxis = axis === "y" ? false : true;
        const yAxis = axis === "x" ? false : true;
        return { xAxis, yAxis };
    }

    getCurrentPosition = () => {
        const { position } = this.props;
        if(position) {
            const { xRatio, yRatio } = position;
            return { xRatio, yRatio, ...this.calculateCurrentPositionFromRatios(xRatio, yRatio) };
        }
        return this.state;
    }
    
    calculateCurrentPositionFromRatios = (xRatio, yRatio) => {
        const { containerWidth, containerHeight } = this.getContainerDimensions();    
        const currentX = xRatio * containerWidth;
        const currentY = yRatio * containerHeight;
        return {
            currentX,
            currentY,
        };
    }

    updateState = (state) => {
        this.lastMove = new Date().getTime();
        const { position, onDrag } = this.props;
        if (!position) this.setState(state);
        else onDrag({ ...position, ...state });
    }

    render() {
        const { currentX, currentY } = this.getCurrentPosition();
        const { className } = this.props;
        const { xAxis, yAxis } = this.getAxis();
        return (
            <div ref={this.draggableRef} style={{transform: `translate3d(${xAxis ? currentX : 0}px, ${yAxis ? currentY : 0}px, 0)`}} className={`react-draggable ${className || ""}`}>
                { this.props.children }
            </div>
        );
    }
}

Draggable.propTypes = {
    className: PropTypes.string,
    axis: PropTypes.oneOf(["x","y"]),
    position: PropTypes.shape({
        xRatio: PropTypes.number,
        yRatio: PropTypes.number
    }),
    onDragStart: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
    draggableWidth: PropTypes.number,
    draggableHeight: PropTypes.number,
};



