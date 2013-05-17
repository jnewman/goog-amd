/*jshint evil:true*/
define(function () {
    'use strict';
    var global = this;

    var lender = [];
    var slice = lender.slice;

    // polyfills.
    var isFunction = function (thing) {
        return typeof Function.bind === 'function';
    };

    var bind = isFunction(Function.bind) ? Function.bind : function (func, context, args) {
        args = slice.call(args, 0);
        return function () {
            args = args.concat(slice.call(arguments, 0));
            func.apply(context, args);
        };
    };

    var indexOf = isFunction(lender.indexOf) ?
        bind(lender.indexOf, lender) :  function (array, item) {
            for (var i = 0, len = array.length; i < len; ++i) {
                if (array[i] === item) {
                    return i;
                }
            }
            return -1;
        };

    var contains = function (array, item) {
        var items = slice.call(arguments, 1);
        for (var i = 0, len = items.length; i < len; ++i) {
            if (indexOf(array, item) === -1) {
                return false;
            }
        }
        return true;
    };

    var extend = function (target, src) {
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                target[key] = src;
            }
        }
        return target;
    };

    var jsonParse = !!JSON && isFunction(JSON.parse) ? bind(JSON.parse, JSON) : function (json) {
        return eval('(' + json + ')');
    };

    var getPart = function (config, name, otherwise) {
        var parts = config.split(/(:|,)/),
            value;

        if (contains(parts, name)) {
            value = parts[indexOf(parts, name) + 2];
            if (/^\{/.test(value)) {
                // A bit of hackery to support JSON.
                value = config.split(name + ':')[1];
                value = value.replace(/([^\}]+)\}.{0,}$/, '$1}');
                value = jsonParse(value);
            }

            // We'll have key : value, so the value will be 2 after the key.
            return value;
        }
        else if (otherwise !== 'undefined') {
            return otherwise;
        }
        else {
            throw new Error('Couldn\'t find your piece.');
        }
    };

    var parse = function (path) {
        var get = bind(getPart, null, path);

        return {
            moduleName: get('moduleName', get('name')),
            version: get('version'),
            settings: {
                language: get('language', 'eng'),
                nocss: get('nocss', true),
                packages:get('packages', []),
                other_params: get('other_params', {})
            }
        };
    };

    return {

        load: function (name, localRequire, notify) {
            var params = parse(name);

            localRequire(['//www.google.com/jsapi'], function () {
                google.load(params.moduleName, params.version, extend(params.settings, {
                    callback: function () {
                        notify(global.google);
                    }
                }));
            });
        }
    };
});
