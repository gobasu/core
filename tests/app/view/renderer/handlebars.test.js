var Handlebars = require('../../../../src/nc/app/view/renderer/handlebars');

var fs = require('fs');
var path = require('path');

describe("nc.Handlebars suite", function() {
    it("Test block default (replace) mode", function() {
        var templatePath = path.join(__dirname, 'mock', 'handlebars', 'template-default.hb');
        var source = fs.readFileSync(templatePath , 'utf8');
        var template = Handlebars.compile(source);
        var options = {
            layoutDir: path.join(__dirname, 'mock', 'handlebars'),
            templatePath: templatePath,
            moduleName: 'test',
            templateName: 'test'
        };
        var result = template({_options: options});
        expect(result).toEqual('new value');
    });

    it("Test block append mode", function() {
        var templatePath = path.join(__dirname, 'mock', 'handlebars', 'template-append.hb');
        var source = fs.readFileSync(templatePath , 'utf8');
        var template = Handlebars.compile(source);
        var options = {
            layoutDir: path.join(__dirname, 'mock', 'handlebars'),
            templatePath: templatePath,
            moduleName: 'test',
            templateName: 'test'
        };
        var result = template({_options: options});
        expect(result).toEqual('default value new value');
    });

    it("Test block prepend mode", function() {
        var templatePath = path.join(__dirname, 'mock', 'handlebars', 'template-prepend.hb');
        var source = fs.readFileSync(templatePath , 'utf8');
        var template = Handlebars.compile(source);
        var options = {
            layoutDir: path.join(__dirname, 'mock', 'handlebars'),
            templatePath: templatePath,
            moduleName: 'test',
            templateName: 'test'
        };
        var result = template({_options: options});
        expect(result).toEqual('new value default value');
    });

});