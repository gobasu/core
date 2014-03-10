'use strict';
var Class = require('../util/class');
var Router = require('./router');
var Controller = require('./controller');
var path = require('path');
var fs = require('fs');
var _ = require('lodash-node');

/**
 *
 * @type {exports|*}
 * @final
 */
var Module = function init(config, app, nc) {

    var self = this;

    var _events = config.events;
    self.moduleDir = config.moduleDir;
    self.moduleName = config.moduleName;
    var _routers = {};
    var _app = app;

    /**
     * Attaches module's listeners to application's event hub
     */
    (function _setupEvents() {
        for (var e in _events) {
            var event = _events[e];
            _app.getMediator().addListener(event, function() {
                self.onEvent.apply(self, arguments);
            });
        }
    })();

    /**
     * Setups routing for controller
     */
    (function _setupRouting() {
        for (var method in config.routes) {

            var router = _routers[method] = new Router();

            for (var route in config.routes[method]) {

                var r = config.routes[method][route];

                if (!r.hasOwnProperty('controller')) {
                    throw new Error('Config ' + self.moduleName + '.routes.' + method + '.' + route + ' controller is missing');
                }

                router.add(route, {
                    controller: r.controller,
                    action: r.action || 'onEvent',
                    params: r.params || []
                });
            }
        }
    })();

    /**
     * Loads and returns controller class from module's package
     *
     * @param {String} className
     * @returns {*}
     * @throws Error
     * @private
     */
    function _loadController(className) {
        var controllerPath = path.join(self.moduleDir, 'src', 'controller', className + '.js');

        if (!fs.existsSync(controllerPath)) {
            throw new Error('Controller ' + self.moduleName + '.' + className + ' does not exist at ' + controllerPath);
        }
        return require(controllerPath)(nc);
    }

    function _getRoute(type, path) {
        var result = false;
        if (_routers.hasOwnProperty(type)) {
            result = _routers[type].match(path);
        }

        if (result === false && type !== 'cli' && _routers.hasOwnProperty('all')) {
            result = _routers.all.match(path);
        }

        return result;
    }

    /**
     * Resolve route, loads controller, creates controller's instance
     * and executes proper method
     *
     * @param {express.Request} request
     * @param {express.Response} response
     * @returns {boolean}
     * @private
     */
    function _handleHTTPRequest(request, response) {
        var method = request.method.toLowerCase();

        var route = _getRoute(method, request.path);

        if (!route) {
            return false;
        }
        var controllerClassName = route.listener.controller;
        var Controller = _loadController(controllerClassName);

        var controllerInstance = new Controller(nc, self);
        controllerInstance.request = request;
        controllerInstance.response = response;
        if (!(controllerInstance instanceof Controller)) {
            throw new Error('Controller ' + self.moduleName + '.' + controllerClassName + ' must be an instance of nc.Controller');
        }

        var action = nc.util.bindString(route.listener.action, route.data);

        if (!(action in controllerInstance)) {
            console.warn('Controller ' + self.moduleName + '.' + controllerClassName + ' does not contain ' + action + ' method');
            return false;
        }

        var data = nc.util.bindString(route.listener.params, route.data);
        controllerInstance[action].apply(controllerInstance, data);

        return true;
    }

    /**
     * @todo implement this
     * @param event
     * @private
     */
    function _handleEvent(event) {
        var className = _events[event].controller;
        var methodName = _events[event].action || 'onEvent';

        var controller = _loadController(className);
        //controller[methodName].apply(controller, arguments);
    }

    self.onEvent = function(event) {
        if (event === 'onRequest') {
            return _handleHTTPRequest(arguments[1], arguments[2]);
        } else if (_events.hasOwnProperty(event)) {
            return _handleEvent.apply(arguments);
        }
    };

    self.getMediator = function() {
        return _app.getMediator();
    };

    self.getApp = function() {
      return _app;
    };

};

module.exports = Module;