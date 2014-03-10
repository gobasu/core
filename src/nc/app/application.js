'use strict';
var Observer = require('../util/observer');
var ModuleLoader = require('./module-loader');

var fs = require('fs');
var path = require('path');

/**
 * @todo: detect env (console or browser) and apply proper routing + disable/enable http server
 * @type {exports|*}
 *  @final
 */
var Application = function init() {

    var self = this;

    var _applicationDir;
    var _assetsDir;
    var _moduleLoader;

    var DIRNAME_THEMES = 'themes';
    var DIRNAME_MODULES = 'module';
    var DIRNAME_MODELS = 'model';
    var DIRNAME_VIEWS = 'view';

    /**
     * Holds all events within application
     *
     * @type {Observer}
     * @private
     */
    var _mediator = new Observer();


    //events
    /**
     * Event onRequest
     * @type {string}
     */
    self.ON_REQUEST = 'onRequest';

    self.ON_ERROR = 'onError';

    self.ON_HANDLER_NOT_FOUND = 'onHandlerNotFound';


    /**
     * Sets application's dir
     *
     * Application's dir must contain following sub-dirs
     * - view (shared views)
     * - model (shared models)
     * - module
     * - config
     * - themes
     *
     * @param {String} dir
     */
    self.setApplicationDir = function (dir) {
        _applicationDir = dir;

        //setup subdirs
        self.themesDir = path.join(_applicationDir, DIRNAME_THEMES);
        self.modulesDir = path.join(_applicationDir, DIRNAME_MODULES);
        self.modelsDir = path.join(_applicationDir, DIRNAME_MODELS);
        self.viewsDir = path.join(_applicationDir, DIRNAME_VIEWS);

    };


    self.setTheme = function (name) {
        self.themeName = 'default';
        self.themeDir = path.join(self.themesDir, self.themeName);
    };

    /**
     * Sets public dir which will be accessible from outside
     *
     * @param {String} dir
     */
    self.setAssetsDir = function (dir) {
        _assetsDir = dir;
    };

    self.getAssetsDir = function() {
        return _assetsDir;
    };

    self.getModuleLoader = function() {
        return _moduleLoader;
    };

    /**
     * Runs application on given port
     * if none provided 8888 will be used
     *
     * @param {int} port
     */
    self.run = function(env) {

        if (!_applicationDir) {
            throw new Error('No application directory defined, please call Application.setApplicationDir before Application.run');
        }

        //setup module loader
        _moduleLoader = new ModuleLoader(self.modulesDir);
        _moduleLoader.load();

        //@todo: implement this
        self.setTheme('default');

        //run environment
        switch (env) {
            case Application.ENV_CLI://@todo: implement this
                break;


            case Application.ENV_HTTP:
                var HTTPEnv = require('./env/http');
                var env = new HTTPEnv(self);
                env.run();

                break;
        }
    };

    /**
     * Returns application's event hub
     *
     * @returns {Observer}
     */
    self.getMediator = function() {
        return _mediator;
    };

};

Application.ENV_HTTP = 'http';
Application.ENV_CLI = 'cli';

module.exports = Application;