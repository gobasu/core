var _ = require('lodash-node');

/**
 *
 * @param classBody
 * @returns {}
 * @private
 */
ClassPollyfill = function (classBody) {

    var preventContructorCall = false;

    return (function createClass(self, classBody) {

        var classConstructor = function () {
            //apply constructor pattern
            if (typeof this['init'] === 'function' && preventContructorCall === false) {
                this.init.apply(this, arguments);
            }
        };

        //make new class instance of extended object
        if (self !== null) {
            preventContructorCall = true;
            classConstructor.prototype = new self();
            preventContructorCall = false;
        }

        var classPrototype = classConstructor.prototype;

        //create class body
        for (var prop in classBody) {

            //provide parent calls if method is overriden
            if (!classPrototype.hasOwnProperty('parent')) {
                classPrototype['parent'] = {};
            }
            classPrototype.parent[prop] = classPrototype[prop];

            //rewrite property
            classPrototype[prop] = classBody[prop];
        }

        //provide extending option in class
        classConstructor.extend = function (classBody) {
            return createClass(this, classBody);
        };

        return classConstructor;
    })(null, classBody);
};
module.exports = ClassPollyfill;