var Application = require('../../src/nc/app/application');
var path = require('path');
describe('nc.app.Application - suite', function() {

    it('Application.new', function() {
        var app = new Application(path.join(__dirname, 'mock'));

        expect(app.themesDir, path.join(__dirname, 'mock', Application.DIRNAME_THEMES));

        console.log(app);
    });
});