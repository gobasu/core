'use strict';
var path = require('path');
var fs = require('fs');

var Class = require('../util/class');
var View = require('./view');

/**
 * Basic Controller class
 *
 * @constructor
 * @param {Application} app
 * @param {express.Request} request
 * @param {express.Response} response
 * @type {Controller}
 *
 * Defining new controller
 * @example:
 *  var Controller = require('nc/app/controller);
 *  module.exports = Controller.extend({
 *          myAction: function() {}
 *      });
 *  };
 */
var Controller = Class({
    init: function(module) {
        this._module = module;

    },
    /**
     * Resolves view's name to template class
     * @todo: Refractor this
     */
    view: function(name) {

        var themeName = this._module.getApp().themeName;

        var moduleName = this._module.moduleName;
        var moduleViewDir = path.join(this._module.moduleDir, 'src', 'view');
        var themeDir = path.join(this._module.getApp().themeDir, moduleName);
        var layoutDir = path.join(this._module.getApp().themeDir, 'layout');

        var globalView = path.join(this._module.getApp().viewDir, moduleName, name + '.js');
        var globalTemplate = path.join(themeDir, name + '.hb');
        var localView = path.join(moduleViewDir, name + '.js');
        var localTemplate = path.join(moduleViewDir, name + '.hb');

        var viewClass;
        var templatePath;
        var currentDir;

        //get custom view class if exists .js
        if (fs.existsSync(globalView)) {
            viewClass = require(globalView);
        } else if (fs.existsSync(localView)) {
            viewClass = require(localView);
        } else {
            viewClass = View;
        }

        //get template file .hb
        if (fs.existsSync(globalTemplate)) {
            templatePath = globalTemplate;
            currentDir = path.join(this._module.getApp().themeDir, moduleName);
        } else if (fs.existsSync(localTemplate)) {
            templatePath = localTemplate;
            currentDir = path.join(moduleViewDir);
        } else {
            throw new Error('Template ' + name + ' does not exists in path ' + localTemplate);
        }

        var options = {
            localDir: moduleViewDir,
            themeDir: themeDir,
            layoutDir: layoutDir,
            templatePath: templatePath,
            moduleName: moduleName,
            templateName: name
        };

        //return view object
        return new viewClass(options);

    },
    /**
     * Resolves model's name to model class
     * @param name
     */
    model: function(name) {

    },
    onEvent: function() {

    },
    dispatch: function() {
        this._module.getMediator().dispatch.apply(this._module.getMediator(), arguments);
    }

});

module.exports = Controller;