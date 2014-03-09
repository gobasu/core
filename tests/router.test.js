var Router = require('../src/nc/app/router');

describe("nc.Router suite", function() {
    var callbackValue;
    var routes = [
        'some/:module',
        'some/:module/:action',
        'some/:module/:action/:id?'
    ];
    function callbackFnc() {
        callbackValue++;
    }

    it("Router - add", function() {

        var router = new Router();
        router.add(routes[0], callbackFnc);

        expect(router.has(routes[0])).toBeTruthy();
        expect(router.has(routes[0], callbackFnc)).toBeTruthy();
    });

    it("Router - remove", function() {
        var router = new Router();
        for (var r in routes) {
            router.add(routes[r], callbackFnc);
        }

        router.remove(routes[0], callbackFnc);

        expect(router.has(routes[0], callbackFnc)).toBeFalsy();
        expect(router.has(routes[1], callbackFnc)).toBeTruthy();
        expect(router.has(routes[2], callbackFnc)).toBeTruthy();

        router.remove(routes[1], callbackFnc);

        expect(router.has(routes[0], callbackFnc)).toBeFalsy();
        expect(router.has(routes[1], callbackFnc)).toBeFalsy();
        expect(router.has(routes[2], callbackFnc)).toBeTruthy();

        router.remove(routes[2], callbackFnc);

        expect(router.has(routes[0], callbackFnc)).toBeFalsy();
        expect(router.has(routes[1], callbackFnc)).toBeFalsy();
        expect(router.has(routes[2], callbackFnc)).toBeFalsy();

    });

    it("Router - match simple", function() {
        var router = new Router();

        router.add(routes[0], callbackFnc);
        router.add(routes[1], callbackFnc);

        var result = router.match('some/product');

        expect(result).not.toBeFalsy();
        expect(result.route).toEqual(routes[0]);
        expect(result.data.hasOwnProperty('module')).toBeTruthy();
        expect(result.data.module).toEqual('product');

        var result = router.match('some/product/show');
        expect(result).not.toBeFalsy();
        expect(result.route).toEqual(routes[1]);
        expect(result.data.hasOwnProperty('module')).toBeTruthy();
        expect(result.data.module).toEqual('product');
        expect(result.data.hasOwnProperty('action')).toBeTruthy();
        expect(result.data.action).toEqual('show');

    });

    it("Router - test matching one optional parameters :p?", function() {
        var result = false;

        var router = new Router();
        router.add('some/:module?', callbackFnc);

        result = router.match('some');
        expect(result).not.toBeFalsy();
        expect(result.data.hasOwnProperty('module')).toBeTruthy();
        expect(result.data.module).toBeUndefined();

        result = router.match('some/');
        expect(result).not.toBeFalsy();
        expect(result.data.hasOwnProperty('module')).toBeTruthy();
        expect(result.data.module).toBeUndefined();

    });

    it("Router - test matching multiple optional parameters :p?", function() {
        var result = false;

        var router = new Router();
        router.add('some/:module?/:action?', callbackFnc);
        router.add('other/:module?/do/:action?');

        result = router.match('some');
        expect(result).not.toBeFalsy();
        expect(result.data.hasOwnProperty('module')).toBeTruthy();
        expect(result.data.module).toBeUndefined();

        result = router.match('some/module');
        expect(result).not.toBeFalsy();
        expect(result.data.hasOwnProperty('module')).toBeTruthy();
        expect(result.data.module).toEqual('module');

        result = router.match('some/module/action');
        expect(result).not.toBeFalsy();
        expect(result.data.hasOwnProperty('module')).toBeTruthy();
        expect(result.data.module).toEqual('module');
        expect(result.data.hasOwnProperty('action')).toBeTruthy();
        expect(result.data.action).toEqual('action');

        result = router.match('other/do');
        expect(result).not.toBeFalsy();
        expect(result.data.hasOwnProperty('module')).toBeTruthy();
        expect(result.data.hasOwnProperty('action')).toBeTruthy();

        expect(result.data.module).toBeUndefined();
        expect(result.data.action).toBeUndefined();

        result = router.match('other/module/do');
        expect(result.data.module).toEqual('module');

        result = router.match('other/module/do/action');
        expect(result.data.action).toEqual('action');
    });

    it("Router - test matching wildcard", function() {
        var result = false;
        var router = new Router();

        router.add('download/:dir?/*', callbackFnc);

        result = router.match('download/some/file.ext');

    });
});