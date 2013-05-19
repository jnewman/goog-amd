/*jshint evil:true*/
//noinspection ThisExpressionReferencesGlobalObjectJS
define((function (global) {
    'use strict';

    return function () {
        // I'm going to steal methods from Array.
        var aProto = Array.prototype;

        // For Arguments coercion.
        var slice = aProto.slice;

        // Creating thse context free to enable delelgation to natives later on.
        var isFunction = function (thing) {
            return typeof thing === 'function';
        };

        var bind = function (func, context, args) {
            args = slice.call(arguments, 2);
            return function () {
                return func.apply(context, args.concat(slice.call(arguments, 0)));
            };
        };

        return {
            /**
             * @see {@link Loader Plugins|https://github.com/amdjs/amdjs-api/wiki/Loader-Plugins}
             *
             * @param {string} name The library to load
             * @param {Function} localRequire A context aware require function.
             * @param {Function} notify A function to call once we've completed loading.
             */
            load: function (name, localRequire, notify) {
                var params = this._parse(name);
                var extend = bind(this._extend, this);

                localRequire(['https://www.google.com/jsapi'], function () {
                    google.load(params.moduleName, params.version, extend(params.settings, {
                        callback: function () {
                            notify(global.google);
                        }
                    }));
                });
            },

            _bind: bind,

            _contains: function (array, item) {
                var items = slice.call(arguments, 1);
                for (var i = 0, len = items.length; i < len; ++i) {
                    if (this._indexOf(array, item) === -1) {
                        return false;
                    }
                }
                return true;
            },

            _extend: function (target, src) {
                target = target || {};
                if (!src) {
                    return target;
                }

                for (var key in src) {
                    if (src.hasOwnProperty(key)) {
                        target[key] = src[key];
                    }
                }
                return target;
            },

            _getPart: function (config, name, otherwise) {
                var parts = config.split(/(:|,)/),
                    value;

                if (this._contains(parts, name)) {
                    value = parts[this._indexOf(parts, name) + 2];
                    if (/^\{.*\}$/.test(value)) {
                        // A bit of hackery to support JSON.
                        value = config.split(name + ':')[1];
                        value = value.replace(/([^\}]+)\}.{0,}$/, '$1}');
                        value = this._jsonParse(value);
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
            },

            _indexOf: function (array, item) {
                if (isFunction(aProto.indexOf)) {
                    return aProto.indexOf.call(array, item);
                }

                if (typeof array === 'string') {
                    array = array.split('');
                }

                for (var i = 0, len = array.length; i < len; ++i) {
                    if (array[i] === item) {
                        return i;
                    }
                }
                return -1;
            },

            _isFunction: isFunction,

            _jsonParse: typeof JSON !== 'undefined' && isFunction(JSON.parse) ?
                bind(JSON.parse, JSON) :
                function (json) {
                    return eval('(' + json + ')');
                },

            _parse: function (path) {
                var getP = bind(this._getPart, this, path);

                return {
                    moduleName: getP('moduleName', getP('name')),
                    version: getP('version'),
                    settings: {
                        language: getP('language', 'eng'),
                        nocss: getP('nocss', true),
                        packages: getP('packages', []),
                        other_params: getP('other_params', {})
                    }
                };
            }
        };
    };
})(this));
