import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import raf from 'raf';

export default class Container extends PureComponent {
    static childContextTypes = {
        subscribe: PropTypes.func,
        unsubscribe: PropTypes.func,
        getParent: PropTypes.func
    };

    nodeRef = React.createRef();

    getChildContext() {
        return {
            subscribe: this.subscribe,
            unsubscribe: this.unsubscribe,
            getParent: this.getParent
        };
    }

    events = [
        'resize',
        'scroll',
        'touchstart',
        'touchmove',
        'touchend',
        'pageshow',
        'load'
    ];

    subscribers = [];

    rafHandle = null;

    subscribe = (handler) => {
        this.subscribers = this.subscribers.concat(handler);
    };

    unsubscribe = (handler) => {
        this.subscribers = this.subscribers.filter((current) => current !== handler);
    };

    notifySubscribers = (evt) => {
        if (!this.framePending) {
            const { currentTarget  } = evt;

            this.rafHandle = raf(() => {
                this.framePending = false;
                const { top, bottom } = this.nodeRef.current.getBoundingClientRect();

                this.subscribers.forEach((handler) => {
                    handler({
                        distanceFromTop: top,
                        distanceFromBottom: bottom,
                        eventSource: currentTarget === window ? document.body : this.nodeRef.current,
                    });
                });
            });
            this.framePending = true;
        }
    };

    getParent = () => this.nodeRef.current;

    componentDidMount() {
        this.events.forEach((event) => {
            window.addEventListener(event, this.notifySubscribers);
        });
        this.notifySubscribers({ currentTarget: window || this.nodeRef.current })
    }

    componentWillUnmount() {
        if (this.rafHandle) {
            raf.cancel(this.rafHandle);
            this.rafHandle = null;
        }

        this.events.forEach((event) => {
            window.removeEventListener(event, this.notifySubscribers);
        });
    }

    render() {
        return (
            <div
                ref={this.nodeRef}
                onScroll={this.notifySubscribers}
                onTouchStart={this.notifySubscribers}
                onTouchMove={this.notifySubscribers}
                onTouchEnd={this.notifySubscribers}
                {...this.props} />
        );
    }
}
