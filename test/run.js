var TESTS = [
    'test/goog'
];

require({
    goog: {
        maps: {
            version: '3.12',
            settings:{
                other_params: 'sensor=false'
            }
        },
        viz: {
            name: 'visualization',
            version: '1.0',
            settings: {
                packages: ['charteditor']
            }
        }
    },

    paths: {
        'chai': '../node_modules/chai/chai',
        'lodash': '../node_modules/lodash/lodash',
        'mocha': '../node_modules/mocha/mocha',
        'goog': '../src/goog',
        'test': '.'
    },

    shim: {
        mocha: {
            exports: 'mocha'
        }
    }
});

require([
    'require',
    'lodash',
    'mocha'
], function (
    require,
    _,
    mocha
) {
    'use strict';
    _.noConflict();

    mocha.ui('bdd');
    mocha.reporter('html');

    var runner = typeof window !== 'undefined' && window.mochaPhantomJS ?
        window.mochaPhantomJS : mocha;

    require(TESTS, _.bind(runner.run, runner));
});
