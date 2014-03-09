var _ = require('lodash-node');
var Class = require('./class');
var EventEmitter = require('events').EventEmitter;

/**
 * Observer Class utilizes the pattern
 *
 * @constructor
 */
var Observer = Class({
    /**
     * @constructor
     * @memberOf nc.Observer
     */
    init: function() {
        this._emitter = new EventEmitter();
    },

    /**
     * Attach listener to given event or events
     *
     * @param {string|Array} event
     * @param {function} listener
     * @memberOf nc.Observer
     */
    addListener: function(event, listener) {
        if (_.isArray(event)) {
            for (var i in event) {
                var e = event[i];
                this._emitter.addListener(e, listener);
            }
            return this;
        }
        this._emitter.addListener(event, listener);
        return this;
    },

    /**
     * Removes listener(s) at given event or events
     *
     * @param {string|Array} event
     * @param {function} listener
     * @memberOf nc.Observer
     */
    removeListener: function(event, listener) {

        if (_.isArray(event)) {
            for (var i in event) {
                var e = event[i];
                this._emitter.removeListener(e, listener);
            }
            return this;
        }
        this._emitter.removeListener(event, listener);
        return this;

    },

    /**
     * Dispatches an event
     *
     * @param {string} event
     * @memberOf nc.Observer
     */
    dispatch: function() {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(args[0]);

        return this._emitter.emit.apply(this._emitter, args);
    },

    /**
     * Checks whatever given listener listens for an event
     *
     * @param {string} event
     * @param {function} listener
     * @return {boolean} true if event has listener otherwise false
     * @memberOf nc.Observer
     */
    hasListener: function(event, listener) {
        var listeners = this._emitter.listeners(event);

        if (listeners.length === 0) {
            return false;
        }

        if (typeof listener === 'undefined') {
            return true;
        }

        for (var i in listeners) {
            if (listeners[i] === listener) {
                return true;
            }
        }
        return false;
    }
});

module.exports = Observer;