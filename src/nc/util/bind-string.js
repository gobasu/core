_ = require('lodash-node');

/**
 * Replaces string if it starts with `:` to the value provided
 * in corresponding key in data parameter
 *
 * @param {String|Array} string
 * @param {Object} data
 * @returns {String|Array}
 *
 * @example
 * var bindable = ':bindable';
 * var data = {bindable: 'hello world'};
 *
 * console.log(bindString(bindable, data);//hello world
 */
function bindString(string, data) {
    var result;
    if (_.isArray(string)) {
        result = [];
        for (var i in string) {
            result[i] = bindString(string[i], data);
        }

        return result;
    }
    if (string.charAt(0) === ':') {
        var key = string.substring(1);
        result = data[key] || null;
    }
    result = result || string;
    return result;
}

module.exports = bindString;