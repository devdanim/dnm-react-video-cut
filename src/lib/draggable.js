//https://www.kirupa.com/html5/drag.htm

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class Draggable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentX: 0,
            currentY: 0,
            currentXRatio: 0,
            currentYRatio: 0
        }
        this.active = false;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        this.draggableRef = React.createRef();
    }

    componentDidMount() {  
        this.container = ReactDOM.findDOMNode(this).parentNode;
        this.container.addEventListener("touchstart", this.handleDragStart, false);
        this.container.addEventListener("touchend", this.handleDragEnd, false);
        this.container.addEventListener("touchmove", this.handleDrag, false);
        this.container.addEventListener("mousedown", this.handleDragStart, false);
        this.container.addEventListener("mouseup", this.handleDragEnd, false);
        this.container.addEventListener("mousemove", this.handleDrag, false);
        window.addEventListener("resize", this.handleWindowResize, false);
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
        if (e.type === "touchstart") {
            this.initialX = e.touches[0].clientX - this.xOffset;
            this.initialY = e.touches[0].clientY - this.yOffset;
        } else {
            this.initialX = e.clientX - this.xOffset;
            this.initialY = e.clientY - this.yOffset;
        }
        if (e.target === this.draggableRef.current || this.draggableRef.current.contains(e.target)) {
            const { onDragStart } = this.props;
            if(onDragStart) onDragStart();
            this.active = true;
        }
    }

    handleDrag = (e) => {
        if (this.active) {
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
            const xMargin = 50;
            const yMargin = 50;

            const { containerWidth, containerHeight } = this.getContainerDimensions();
            const { xAxis, yAxis } = this.getAxis();
            
            if(currentX > containerWidth) {
                if(xAxis && currentX + xMargin > containerWidth) forceDragEnd = true;
                currentX = containerWidth;
            }
            else if(currentX < 0) {
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

            this.xOffset = currentX;
            this.yOffset = currentY;

            this.updateState({ 
                currentX, 
                currentXRatio: currentX / containerWidth, 
                currentY,
                currentYRatio: currentY / containerHeight
             });
        }
    }

    handleDragEnd = (e) => {
        const { currentX, currentY } = this.getCurrentPosition();
        this.initialX = currentX;
        this.initialY = currentY;
        this.active = false;
        const { onDragEnd } = this.props;
        if(onDragEnd) onDragEnd();
    }

    handleWindowResize = () => {
        const position = this.getCurrentPositionWithPercent();
        const { xAxis, yAxis } = this.getAxis();
        const currentX = xAxis ? position.currentX : 0;
        const currentY = yAxis ? position.currentY : 0;
        this.updateState({ currentX, currentY });
    }

    getContainerDimensions = () => {
        const containerWidth = this.container ? this.container.clientWidth - this.draggableRef.current.clientWidth : 0;
        const containerHeight = this.container ? this.container.clientHeight - this.draggableRef.current.clientHeight : 0;
        return { containerWidth, containerHeight };
    }

    getCurrentPositionWithPercent = () => {
        const { currentXRatio, currentYRatio } = this.getCurrentPosition();
        const { containerWidth, containerHeight } = this.getContainerDimensions();
        const currentX = currentXRatio * containerWidth;
        const currentY = currentYRatio * containerHeight;
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
            const { containerWidth, containerHeight } = this.getContainerDimensions();    
            const currentX = xRatio * containerWidth;
            const currentY = yRatio * containerHeight;
            this.xOffset = currentX;
            this.yOffset = currentY;
            return {
                currentX,
                currentY,
                currentXRatio: xRatio,
                currentYRatio: yRatio,
            };
        }
        else {
            const { currentX, currentY } = this.state;
            this.xOffset = currentX;
            this.yOffset = currentY;
            return this.state;
        }
    }

    updateState = (state) => {
        const { position, onDrag } = this.props;
        if(!position) this.setState(state);
        else onDrag({ xRatio: state.currentXRatio, yRatio: state.currentYRatio });
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
};



