'use strict';
var Class = require('../util/class');
/**
 * Router class
 * @constructor
 *
 * @example:
 * var r = new Router();
 * r.on('path/:param_1?/:param_2
 */
var Router = Class({

    init: function() {
        this._separator = '/';
        this._routes = {};
    },

    /**
     * Registers route with listener
     * @param {String} route
     * @param {Function} listener
     */
    add: function(path, listener) {
        var r = path;
        var params = [];

        path = path
            .concat('/?')
            .replace(/\/\(/g, '(?:/')
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
                params.push({ name: key, optional: !! optional });
                slash = slash || '';
                return ''
                    + (optional ? '' : slash)
                    + '(?:'
                    + (optional ? slash : '')
                    + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
                    + (optional || '')
                    + (star ? '(/*)?' : '');
            })
            .replace(/([\/.])/g, '\\$1')
            .replace(/\*/g, '(.*)')
            .concat('$');

        this._routes[r] = {
            regex: new RegExp(path),
            params: params,
            listener : listener
        };


    },

    /**
     * Check whater route was registered
     * @returns {Boolean}
     */
    has: function(route, listener) {

        if (!this._routes.hasOwnProperty(route)) {
            return false;
        }

        if (typeof listener === 'undefined') {
            return true;
        }

        return this._routes[route].listener === listener;
    },

    remove: function(route, listener) {
        if (this.has(route, listener)) {
            delete this._routes[route];
        }
    },

    /**
     *
     * @param {String} path
     * @returns {{data: (Object), route: (String), listener: (Function)}}
     */
    match: function(path) {
        for (var r in this._routes) {
            var route = this._routes[r];
            var isMatching = path.match(route.regex);

            if (isMatching) {
                var data = {};
                var hasAllRequiredParams = true;
                for (var i = 1, l = isMatching.length; i < l; i++) {
                    if (typeof route.params[i-1] === 'undefined') {
                        data['*'] = isMatching[i];
                        continue;
                    }

                    if (route.params[i-1].optional === false && isMatching[i] === undefined) {
                        hasAllRequiredParams = false;
                        break;
                    }
                    data[route.params[i-1].name] = isMatching[i];
                }

                if (hasAllRequiredParams) {
                    return {
                        data: data,
                        route: r,
                        listener: route.listener
                    };
                }
            }

        }
        return false;
    }

});

module.exports = Router;