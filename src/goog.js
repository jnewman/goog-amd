/*jshint evil:true*/
//noinspection ThisExpressionReferencesGlobalObjectJS
define((function (global) {
    'use strict';

    return function () {
        var SUPPORTED = ['Dojo', 'RequireJS'];

        // I'm going to steal methods from Array.
        var aProto = Array.prototype;

        // For Arguments coercion.
        var slice = aProto.slice;

        // Creating thse context free to enable delelgation to natives later on.

        /**
         * @param {*} thing
         * @returns {boolean} Whether it's a function.
         */
        var isFunction = function (thing) {
            return typeof thing === 'function';
        };

        /**
         * @param {Function} func
         * @param {Object} [context]
         * @param {*...} [args]
         * @returns {Function}
         */
        var bind = function (func, context, args) {
            args = slice.call(arguments, 2);
            return function () {
                return func.apply(context || null, args.concat(slice.call(arguments, 0)));
            };
        };

        var googLoaded = false;

        var plugin = {
            /**
             * @see {@link Loader Plugins|https://github.com/amdjs/amdjs-api/wiki/Loader-Plugins}
             *
             * @param {string} name The library to load
             * @param {Function} localRequire A context aware require function.
             * @param {Function} notify A function to call once we've completed loading.
             * @param {Object} config
             */
            load: function (name, localRequire, notify, config) {
                var fetch = bind(this._fetch, this, localRequire, notify);
                var getParamsByConfig = bind(this._getParams, this, name);

                var configExists = !!config;

                if (configExists && config.isBuild) {
                    notify({});
                }
                // It's not a build and I can get the params sync.
                else if (configExists) {
                    fetch(getParamsByConfig(config));
                }
                // I need to fish around for the config and maybe the params.
                else {
                    this._getConfigThenFetch(localRequire, fetch, getParamsByConfig);
                }
            },

            ///////////////////////////////////////////////////////////////////////////////////////
            // App specific.
            ///////////////////////////////////////////////////////////////////////////////////////

            _getConfigThenFetch: function (localRequire, fetch, getParams) {
                try {
                    localRequire(['dojo/_base/config'], bind(function (config) {
                        fetch(getParams(config.goog || {}));
                    }, this));
                } catch (e) {
                    throw new Error('Unknown loader, should be one of:' + SUPPORTED.join(','));
                }
            },

            _getParams: function (name, config) {
                var params = null;
                // If it's a simple string, then we'll look everything up from the require config.
                if (/^[^:,"]+$/i.test(name)) {
                    params = config.goog[name];
                    if (!params.moduleName) {
                        params.moduleName = params.name || name;
                    }
                } else {
                    params = this._parse(name);
                }
                return params;
            },

            /**
             * Equivalent to getattr in Python.
             *
             * @param {string} config The context to lookup the prop on.
             * @param {string} name The property to lookup.
             * @param {*} [otherwise=null] Value to return if the jey is not found.
             * @returns {*} The prop's value or otherwise
             * @private
             */
            _getPart: function (config, name, otherwise) {
                var parts = config.split(/(:|,)/),
                    value;

                if (this._contains(parts, name)) {
                    value = parts[this._indexOf(parts, name) + 2];
                    // We'll have key : value, so the value will be 2 after the key.
                    return this._jsonParse(value);
                }
                else if (otherwise !== 'undefined') {
                    return otherwise;
                }
                else {
                    return null;
                }
            },


            /**
             * Converts name:maps,version:3.7,other_params:sensor=false
             *
             * @param {string} path
             * @returns {{
             *     moduleName: string,
             *     version: string,
             *     settings: {
             *         language: string,
             *         nocss: boolean,
             *         packages: Array,
             *         other_params: Object
             *     }
             * }} The configuration.
             * @private
             */
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
            },

            /**
             * Does the actual IO.
             *
             * @param {Function} localRequire
             * @param {Function} notify
             * @param {Object} params
             * @private
             */
            _fetch: function (localRequire, notify, params) {
                var load = bind(this._googLoad, this, params, notify);
                if (!googLoaded) {
                    localRequire(['https://www.google.com/jsapi'], load);
                }
                else {
                    load();
                }
            },

            _googLoad: function (params, notify) {
                google.load(params.moduleName, params.version, this._extend(params.settings, {
                    callback: function () {
                        notify(global.google[params.moduleName]);
                    }
                }));
            },

            ///////////////////////////////////////////////////////////////////////////////////////
            // Prollyfills
            ///////////////////////////////////////////////////////////////////////////////////////

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

            _indexOf: function (array, item) {
                if (typeof array === 'string') {
                    return array.indexOf(item);
                }

                if (isFunction(aProto.indexOf)) {
                    return aProto.indexOf.call(array, item);
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
                }
        };

        // Dojo calls the plugin in the laoder's context, so bind it to it's own context.
        plugin.load = bind(plugin.load, plugin);

        return plugin;
    };
})(this));
