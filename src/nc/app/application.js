'use strict';
var Observer = require('../util/observer');
var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');

/**
 * @todo: detect env (console or browser) and apply proper routing + disable/enable http server
 * @type {exports|*}
 *
 *
 *  +-------------+
 *  | Application |
 *  +-------------+
 *  +  +  +  +  +
 *  |  |  |  |  +-----> public
 *  |  |  |  |
 *  |  |  |  +--------> theme
 *  |  |  |
 *  |  |  +-----------> module
 *  |  |
 *  |  +--------------> controller
 *  |
 *  +-----------------> model
 *
 *  @final
 */
var Application = function init(nc) {

    var self = this;
    var _appServer = express();
    var _appDir;
    var _secret = 'your secret goes here';

    /**
     * Holds all events within application
     *
     * @type {Observer}
     * @private
     */
    var _mediator = new Observer();

    /**
     * Loaded modules are kept here
     *
     * @type {Object}
     * @private
     */
    var _modules = {};

    var MODULE_DIR = path.join(__dirname, '..', 'module');

    /**
     * MainController class
     * @type {nc.Controller}
     */
    var MainControllerClass = require('../controller/main.js')(nc);
    var _mainController = new MainControllerClass(self);

    //events
    /**
     * Event onRequest
     * @type {string}
     */
    self.ON_REQUEST = 'onRequest';


    /**
     * Loads modules' config files and creates Module object
     * for each of module.
     *
     * @private
     */
    function _setupModules() {
        var moduleList = fs.readdirSync(MODULE_DIR);

        for (var module in moduleList) {
            module = moduleList[module];
            var configFile = path.join(MODULE_DIR, module, 'config.js');
            if (!fs.existsSync(configFile)) {
                console.warn('Module `' + module + '` does not contain config file');
                continue;
            }

            var config = require(configFile);
            config.moduleName = module;
            config.moduleDir = path.join(MODULE_DIR, module);
            var module = new nc.Module(config, self, nc);
            _modules[config.moduleName] = module;
        }
    }

    /**
     * Calls onEvent method with onRequest event on each module
     * registered within the application. If no handler for http
     * request will be found the 404 error will occur
     *
     * @param req
     * @param res
     * @param next
     * @private
     */
    function _handleHTTPRequest(req, res, next) {

        //prevent dispatchin request if real file exists
        if (fs.existsSync(path.join(_appDir, req.path))) {
            next();
        }

        //this flag tells whetever 404 error should be thrown
        var responseSend = false;
        self.getMediator().dispatch(self.ON_REQUEST, req, res);

        for (var module in _modules) {
            module = _modules[module];

            try {
                if (module.onEvent('onRequest', req, res)) {
                    responseSend = true;
                    break;
                }
            } catch (e) {
                _mainController.request = req;
                _mainController.response = res;
                _mainController.onError(500, e);
                console.error(e);
                return;
            }
        }

        if (!responseSend) {
            _mainController.request = req;
            _mainController.response = res;
            _mainController.onError(404, new Error('Page not Found'));
            console.warn('Page not found ' + req.path);
            return;
        }
    }

    /**
     * Sets public application dir
     * @param dir
     */
    self.setApplicationDir = function (dir) {
        _appDir = dir;
    };

    /**
     * Runs application on given port
     * if none provided 8888 will be used
     *
     * @param {int} port
     */
    self.run = function(port) {
        port = port || 8888;

        if (!_appDir) {
            console.error('No public directory defined, please call Application.setApplicationDir before Application.run');
        }

        _setupModules();

        //basic express setup
        _appServer.use(express.urlencoded());
        _appServer.use(express.methodOverride());
        _appServer.use(express.cookieParser(_secret));
        _appServer.use(express.session());
        _appServer.use(express.static(path.join(_appDir)));

        //resource requested handle modules here
        _appServer.use(_handleHTTPRequest);

        http.createServer(_appServer).listen(port, function() {
            console.info('Node Commerce server is listening on port ' + port);
        });
    };

    /**
     * Returns application's event hub
     *
     * @returns {Observer}
     */
    self.getMediator = function() {
        return _mediator;
    };

    self.themeName = 'default';

    self.viewDir = path.join(__dirname, '..', 'view');

    self.themesDir = path.join(__dirname, '..', 'themes');

    self.modelDir = path.join(__dirname, '..', 'model');

    self.themeDir = path.join(self.themesDir, self.themeName);

};

module.exports = Application;