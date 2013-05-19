define([
    'mocha', 'chai',
    'lodash',
    'goog'
], function (
    mocha, chai,
    _,
    goog
) {
    'use strict';
    var expect = chai.expect;

    describe('Internal utilities', function () {
        // Only testing features I rely on.

        var RANGE = 32;
        var TYPE_EXAMPLES = {
            array: [0, 1, 2],
            date: new Date(1111111111),
            'function': function () {},
            number: 42,
            object: {a: 1, b: 2, c: 3},
            regexp: /^.*$/img,
            string: 'Hello, World!'
        };

        describe('#_bind', function () {
            var obj = null;
            beforeEach(function () {
                obj = {
                    fn: function () {
                        return [this, arguments];
                    }
                };
            });

            it('locks a method to a context', function () {
                expect(goog._bind(obj.fn, obj)()[0]).to.equal(obj);
            });

            it('adds extra arguments upon binding', function () {
                var arg = 42;
                expect(goog._bind(obj.fn, obj, null, arg)()[1][1]).to.equal(arg);
                expect(goog._bind(obj.fn, obj, null, null, arg)()[1][2]).to.equal(arg);
            });

            it('only binds the context once', function () {
                var arg = 42;
                var bound = goog._bind(obj.fn, obj, arg, arg);
                var rebound = goog._bind(bound, null);

                expect(rebound()[0]).to.equal(obj);
            });

            it('allows multiple argument bindings', function () {
                var arg = 42;
                var bound = _.reduce(_.range(RANGE), function (func) {
                    return goog._bind(func, obj, arg);
                }, obj.fn);

                expect(bound()[1][RANGE - 1]).to.equal(arg);
            });
        });

        describe('#_isFunction', function () {
            it('recognizes functions from a heap of types', function () {
                _.forEach(TYPE_EXAMPLES, function (example, key) {
                    if (key !== 'function') {
                        expect(goog._isFunction(example)).not.to.equal(true);
                    }
                    else {
                        expect(goog._isFunction(example)).to.equal(true);
                    }
                });
            });
        });

        describe('#_contains', function () {
            it('finds items iff they\'re in the array.', function () {
                var arrayOne = [{}, 42, false, [], null];
                var arrayTwo = [{}, 43, void 0, true];
                _.forEach(arrayOne, function (item) {
                    expect(goog._contains(arrayOne, item)).to.equal(true);
                });
                _.forEach(arrayTwo, function (item) {
                    expect(goog._contains(arrayOne, item)).not.to.equal(true);
                });
            });
        });

        describe('#_extend', function () {
            it('returns an object if no arg is passed', function () {
                expect(goog._extend()).to.be.an('object');
            });

            it('modifies objects in place', function () {
                var obj = {};
                expect(goog._extend(obj, {foo: 1})).to.equal(obj);
                expect(obj).to.have.property('foo');
            });
        });

        describe('#_indexOf', function () {
            var obj = {};
            var iArr = [];
            var arr = [0, 1, 2, 3, {}, iArr, obj];

            it('finds items using exact match', function () {
                expect(goog._indexOf(arr, iArr)).to.equal(5);
                expect(goog._indexOf(arr, obj)).to.equal(6);
                expect(goog._indexOf(arr, 2)).to.equal(2);
            });

            it('returns -1 when item is not found', function () {
                expect(goog._indexOf(arr, 42)).to.equal(-1);
            });

            it('finds characters in a string', function () {
                expect(goog._indexOf('Hello, World!', 'W')).to.equal(7);
            });
        });

        describe('#_jsonParse', function () {
            it('parses JSON objects', function () {
                expect(
                    goog._jsonParse('{"foo": 42, "bar": {"baz": 99}}').bar
                ).to.have.property('baz');
            });
        });
    });

    describe('The goog AMD loader.', function () {
    });
});
