var TESTS = [
    'test/goog'
];

require({
    paths: {
        'chai': '../node_modules/chai/chai',
        'lodash': '../node_modules/lodash/lodash',
        'mocha': '../node_modules/mocha/mocha',
        'src': '../src',
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
