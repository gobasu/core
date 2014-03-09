'use strict';
var Handlebars = require('./view/renderer/handlebars');
var _ = require('lodash-node');
var Class = require('../util/class');
var fs = require('fs');





var View = Class({
    init: function(options) {

        var source = fs.readFileSync(options.templatePath, 'utf8');

        this._options = options;
        this._data = {};
        this._template = Handlebars.compile(source);

    },

    /**
     * Sets or gets template's data
     * @returns {*}
     */
    data: function(/** mutable **/) {
        if (arguments.length === 1) {
            if (_.isObject(arguments[0])) {
                //View.data(data);
                this._data = arguments[0];
            } else if (this._data.hasOwnProperty(arguments[0])) {
                //View.data(key);
                return this._data[arguments[0]];
            }
            return;
        }

        //View.data(key, value);
        this._data[arguments[0]] = arguments[1];
    },

    render: function() {
        var result = this._template(_.merge(this._data, {_options: this._options}));

        return result;
    },
    setLayout: function() {

    }
});

module.exports = View;