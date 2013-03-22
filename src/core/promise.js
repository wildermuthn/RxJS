    var Promise = Rx.Promise = (function () {

        'use strict';

        var STATE_PENDING = 'pending',
            STATE_FULFILLED = 'fulfilled',
            STATE_REJECTED = 'rejected',
            EVENT_SUCCESS = 'success',
            EVENT_ERROR = 'error';

        // Check schedule mechanism
        var scheduleMethod = (function () {
            if (typeof ({}).toString.call(window.process) === '[object process]' && typeof window.process.nextTick === 'function') {
                return window.process.nextTick;
            }
            if (typeof window.setImmediate === 'function') {
                return window.setImmediate;
            }
            return function (action) { return window.setTimeout(action, 0); };
        }());

        function notifyAll(handlers, value) {
            console.log(handlers.length);
            for (var i = 0, len = handlers.length; i < len; i++) {

                handlers[i](value);
            }            
        }

        function Promise (fn) {
            this._handlers = [];
            this._errHandlers = [];
            this._state = STATE_PENDING;
            this._done = false;

            if (typeof fn === 'function') {
                var self = this;
                this._handlers.push(function (value) {
                    self.fulfill(value);
                });

                this._errHandlers.push(function (reason) {
                    self.reject(reason);
                });  
            }
        }

        var promisePrototype = Promise.prototype;

        promisePrototype.fulfill = function (value) {
            if (this._state === STATE_PENDING) {
                this._value = value;
            }
            if (this._state !== STATE_REJECTED) {
                notifyAll(this._handlers, this._value);
                this._handlers = [];
                this._errHandlers = [];
                this.state = STATE_FULFILLED;
            }
        };

        promisePrototype.reject = function (reason) {
            if (this._state === STATE_PENDING) {
                this._value = reason;
            }
            if (this._state !== STATE_FULFILLED) {
                notifyAll(this._errHandlers, this._value);
                this._handlers = [];
                this._errHandlers = [];
                this.state = STATE_REJECTED;
            }
        };

        promisePrototype.then = function (onFulfill, onReject) {

            var self = this, newPromise = new Promise();

            function handler(fn) {
                return function () {
                    var result; 
                    try {
                        result = fn.apply(self, arguments);
                    } catch (e) {
                        return newPromise.reject(e);
                    }

                    if (Promise.isPromise(result)) {
                        result.then(newPromise.fulfill.bind(newPromise), newPromise.reject.bind(newPromise));
                    } else {
                        newPromise.fulfill(result);
                    }
                }
            }

            scheduleMethod(function () {
                var onRejectHandler = typeof onReject === 'function' 
                    ? handler(onReject) 
                    : newPromise.reject.bind(newPromise);
                self._errHandlers.push(onRejectHandler);

                var onFulfillHandler = typeof onFulfill === 'function' 
                    ? handler(onFulfill) 
                    : newPromise.fulfill.bind(newPromise);
                self._handlers.push(onFulfillHandler);                
            });

            return newPromise;
        };

        Promise.isPromise = function (p) {
            return p && typeof p.then === 'function';
        };

        return Promise;

    }());