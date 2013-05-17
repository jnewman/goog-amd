define([
    'mocha', 'chai',
    'lodash',
    'goog'
], function (
    mocha, chai,
    lodash,
    goog
) {
    'use strict';
    var assert = chai.assert;

    describe('The goog AMD loader.', function () {
        it('Tests', function () {
            assert.equal(42, 42);
        });
    });
});
