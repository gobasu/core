'use strict';
var express = require('express');
var http = require('http');



var HTTPEnv = function init(app) {

    var self = this;
    var _assetsDir;

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

        //prevent dispatching request if real file exists
        if (fs.existsSync(path.join(app.getAssetsDir(), req.path))) {
            next();
        }

        //this flag tells whetever 404 error should be thrown
        var responseSend = false;
        var moduleLoader = app.getModuleLoader();
        app.getMediator().dispatch(self.ON_REQUEST, req, res);

        for (var moduleName in moduleLoader.all()) {
            var module = moduleLoader.get(moduleName);

            try {
                if (module.onEvent('onRequest', req, res)) {
                    responseSend = true;
                    break;
                }
            } catch (e) {
                app.getMediator().dispatch(self.ON_ERROR, e, req, res);
                return;
            }
        }

        if (!responseSend) {
            app.getMediator().dispatch(self.ON_HANDLER_NOT_FOUND, req, res);
            return;
        }
    };



    self.run = function() {
        _assetsDir = app.getAssetsDir();

        if (!_assetsDir) {
            throw new Error('No public directory defined, please call Application.setAssetsDir before Application.run');
        }

        //basic express setup
        var _server = express();
        _server.use(express.urlencoded());
        _server.use(express.methodOverride());
        _server.use(express.cookieParser('2938hweooIOg9egrgwheioqhfqdhoaso'));
        _server.use(express.session());
        _server.use(express.static(_assetsDir));

        //resource requested handle modules here
        _server.use(_handleHTTPRequest);

        http.createServer(_server).listen(8888, function() {
            console.info('Node Commerce server is listening on port ' + port);
        });
    }
};

module.exports = HTTPEnv;