import React, { Component } from 'react';
import raf from 'raf';

const events = [
    'resize',
    'scroll',
    'touchstart',
    'touchmove',
    'touchend',
    'pageshow',
    'load'
];

const hardwareAcceleration = { transform: 'translateZ(0)' };

export default class ReactSingleSticky extends Component {
    constructor(props) {
        super(props);
        this.placeholderRef = React.createRef();
        this.contentRef = React.createRef();
        this.scrollContainer = null;
        this.state = {
            style: {},
            calculatedHeight: 0
        };
        this.rafHandle = null;
        this.handleEvent = this.handleEvent.bind(this);
    }

    componentDidMount() {
        const {
            bottomOffset,
            getScrollContainer,
            getWrapContainer,
        } = this.props;
        this.scrollContainer = getScrollContainer ? getScrollContainer() : window;
        this.wrapContainer = getWrapContainer ? getWrapContainer() : null;
        events.forEach((event) => {
            this.scrollContainer.addEventListener(event, this.handleEvent);
        });
        // 底部吸顶一般是默认吸顶，随着滚动取消，所以需要首次触发一下
        if (bottomOffset || bottomOffset === 0) {
            this.handleEvent();
        }
    }

    componentWillUnmount() {
        if (this.rafHandle) {
            raf.cancel(this.rafHandle);
            this.rafHandle = null;
        }
        events.forEach((event) => {
            this.scrollContainer.removeEventListener(event, this.handleEvent);
        });
    }

    handleEvent() {
        this.rafHandle = raf(() => {
            const {
                topOffset = 0, // 默认顶部固定，如同时设置底部固定，则优先底部固定
                bottomOffset,
            } = this.props;
            const {
                top: scrollRectTop,
                bottom: scrollRectBottom,
            } = this.scrollContainer.getBoundingClientRect();
            const scrollContainerStyle = window.getComputedStyle(this.scrollContainer);
            const scrollBorderTopWidth = parseFloat(scrollContainerStyle.borderTopWidth);
            const scrollBorderBottomWidth = parseFloat(scrollContainerStyle.borderBottomWidth);

            const {
                height,
            } = this.contentRef.current.getBoundingClientRect();
            const {
                width, left, top,
            } = this.placeholderRef.current.getBoundingClientRect();

            let stickyTop; // 忽略了 scrollContainer 的 border
            let stickyBottom = 'unset';
            let isSticky;
            let position = 'fixed';
            if (this.wrapContainer) {
                const {
                    top: wraplRectTop,
                    bottom: wrapRectBottom,
                } = this.wrapContainer.getBoundingClientRect();
                if (bottomOffset || bottomOffset === 0) { // 底部固定
                    stickyTop = scrollRectBottom - height - bottomOffset - scrollBorderBottomWidth;
                    // // wrap的顶部距离 设定的需要sticky顶部距离 的距离 
                    const distanceFromTop = wraplRectTop - stickyTop;
                    isSticky = wraplRectTop - scrollRectBottom > 0 ? false : top >= stickyTop;
                    // 问题所在 distanceFromTop > 0 时，设置为fixed 部分底部内容出现在 scroll元素下面的外面，但是没有东西可以遮挡（如果是window滚动可以遮挡）
                    if (isSticky && distanceFromTop > 0) {
                        position = 'absolute';
                        stickyTop = 0;
                    }
                } else { // 顶部固定
                    stickyTop = scrollRectTop + topOffset + scrollBorderTopWidth;
                    // wrap的底部距离 设定的需要sticky顶部距离 的距离
                    const distanceFromBottom = wrapRectBottom - stickyTop;
                    // isSticky 包含了 absolute的 情况
                    isSticky = wrapRectBottom - scrollRectTop > 0 ? top <= stickyTop : false;
                    // 问题所在 distanceFromBottom - height < 0 时，设置为fixed 部分顶部内容出现在 scroll元素上面的外面，但是没有东西可以遮挡（如果是window滚动可以遮挡）
                    if (isSticky && distanceFromBottom - height < 0) {
                        position = 'absolute';
                        stickyTop = 'unset';
                        stickyBottom = 0;
                    }
                }
            } else {
                if (bottomOffset || bottomOffset === 0) { // 底部固定
                    stickyTop = scrollRectBottom - height - bottomOffset - scrollBorderBottomWidth;
                    isSticky = top >= stickyTop;
                } else {
                    stickyTop = scrollRectTop + topOffset + scrollBorderTopWidth; // 顶部固定
                    isSticky = top <= stickyTop;
                }
            }

            if (!isSticky) {
                this.setState({
                    style: {
                        ...hardwareAcceleration
                    },
                    calculatedHeight: 0
                });
            } else {
                this.setState({
                    style: {
                        position,
                        top: stickyTop,
                        bottom: stickyBottom,
                        width,
                        left: position === 'absolute' ? 'unset' : left,
                        ...hardwareAcceleration
                    },
                    calculatedHeight: height
                });
            }
        });
    }

    render() {
        const { style, calculatedHeight } = this.state;
        const { children } = this.props;
        const element = React.cloneElement(
            children,
            {
                ref: this.contentRef,
                style
            }
        );
        return (
            <div>
                <div style={{ paddingBottom: calculatedHeight }} ref={this.placeholderRef} />
                {element}
            </div>
        );
    }
}
