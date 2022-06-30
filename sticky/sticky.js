import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';

const hardwareAcceleration = { transform: 'translateZ(0)' };

export default class Sticky extends Component {
    static propTypes = {
        topOffset: PropTypes.number,
        bottomOffset: PropTypes.number,
        children: PropTypes.func.isRequired
    };

    placeholderRef = createRef();

    contentRef = createRef();

    static defaultProps = {
        topOffset: 0,
        bottomOffset: 0,
    };

    static contextTypes = {
        subscribe: PropTypes.func,
        unsubscribe: PropTypes.func,
        getParent: PropTypes.func
    };

    state = {
        isSticky: false,
        style: {}
    };

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillMount() {
        if (!this.context.subscribe) {
            throw new TypeError(
                'Expected Sticky to be mounted within StickyContainer'
            );
        }
        this.context.subscribe(this.handleContainerEvent);
    }

    componentWillUnmount() {
        this.context.unsubscribe(this.handleContainerEvent);
    }

    componentDidUpdate() {
        this.placeholderRef.current.style.paddingBottom = `${this.state.isSticky ? this.state.calculatedHeight : 0}px`;
    }

    handleContainerEvent = ({
        distanceFromTop,
        distanceFromBottom,
    }) => {
        const { topOffset = 0, bottomOffset } = this.props;
        const placeholderClientRect = this.placeholderRef.current.getBoundingClientRect();
        const { top, left, width } = placeholderClientRect;
        const contentClientRect = this.contentRef.current.getBoundingClientRect();
        const { height: calculatedHeight } = contentClientRect;

        let stickyTop;
        let isSticky;
        if (bottomOffset || bottomOffset === 0) { // 底部固定
            stickyTop = distanceFromBottom - calculatedHeight - bottomOffset;
            isSticky = top + calculatedHeight >= distanceFromBottom -bottomOffset;
        } else {
            stickyTop = distanceFromTop + topOffset; // 顶部固定
            isSticky = top <= topOffset;
        }

        const style = !isSticky
            ? { ...hardwareAcceleration }
            : {
                position: 'fixed',
                top: stickyTop,
                left,
                width,
                ...hardwareAcceleration,
            };

        this.setState({
            isSticky,
            distanceFromTop,
            calculatedHeight,
            style
        });
    };

    render() {
        const element = React.cloneElement(
            this.props.children,
            {
                ref: this.contentRef,
                isSticky: this.state.isSticky,
                distanceFromTop: this.state.distanceFromTop,
                calculatedHeight: this.state.calculatedHeight,
                style: this.state.style
            }
        );

        return (
            <div>
                <div ref={this.placeholderRef} />
                {element}
            </div>
        );
    }
}
