'use strict';
var fs = require('fs');
var Module = require('./module');

var Loader = function init(dir) {

    var self = this;
    var _moduleDir = dir;
    var _modules = {};

    /**
     * Loads modules
     */
    self.load = function() {
        var dirList = fs.readdirSync(_moduleDir);

        for (var module in dirList) {
            module = dirList[module];

            var configFile = path.join(_moduleDir, module, 'config.js');
            if (!fs.existsSync(configFile)) {
                console.warn('Module `' + module + '` does not contain config file, ignoring module...');
                continue;
            }

            var config = require(configFile);
            config.moduleName = module;
            config.moduleDir = path.join(_moduleDir, module);
            var module = new Module(config, self, nc);
            _modules[config.moduleName] = module;
        }
    };

    /**
     * Returns loaded module with given name
     *
     * @param {String} name
     * @returns {Module}
     */
    self.get = function(name) {
        return _modules[name] ? _modules[name] : false;
    };

    /**
     * Checks if module with given name was load
     *
     * @param {String} name
     * @returns {boolean}
     */
    self.has = function(name) {
        return _modules[name] ? true : false;
    };

    self.all = function() {
        return _modules;
    };
}

module.exports = Loader;