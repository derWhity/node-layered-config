// Tests the get() functionality
// jshint mocha:true
'use strict';

var expect = require('chai').expect;
var config = require('../../index.js');
var path = require('path');

describe('Retrieving data', function() {
    describe('get()', function() {

        var layerOneData = {
            a: 1,
            b: 2,
            c: 3,
            d: {
                dd: {
                    ddd: true,
                    ddd2: 'Hello World'
                },
                dd3: {
                    ddd: true
                }
            },
            g: 'OnlyVisibleWhenNullIsIgnored'
        };

        var layerTwoData = {
            b: 'overwritten',
            c: 4,
            e: null,
            d: {
                dd: {
                    ddd2: 'Hello overwritten'
                },
                dd3: {
                    ddd: null,
                    ddd2: false
                }
            },
            f: {
                ff: 12,
                ff2: {
                    fff: 1,
                    fff2: {
                        ffff: true
                    }
                }
            }
        };

        var layerThreeData = {
            c: 'overwritten again',
            d: {
                dd: {
                    ddd3: false
                },
                dd2: {
                    ddd2: true
                }
            },
            e: 'Hurz',
            g: null,
            h: null
        };

        before(function() {
            // Load some basic configuration data into three layers
            config.addLayer('one', layerOneData);
            config.addLayer('two', layerTwoData);
            config.addLayer('three', layerThreeData);
            // Traversal order is now: three, two, one
        });

        it('load root-level data correctly', function() {
            expect(config.get('a')).to.equal(1);
            expect(config.get('e')).to.equal('Hurz');
            expect(config.get('g')).to.equal(null);
        });

        it('load hierarcical data correctly', function() {
            expect(config.get('f.ff')).to.equal(12);
            expect(config.get('f.ff2.fff')).to.equal(1);
            expect(config.get('f.ff2.fff2.ffff')).to.equal(true);
        });

        it('ignore multiple consecutive separators', function() {
            expect(config.get('f..ff2........fff2...ffff..')).to.equal(true);
            // Add some spaces
            expect(config.get('.. ..f.ff2... ..fff')).to.equal(1);
        });

        it('load overwritten data correctly', function() {
            expect(config.get('b')).to.equal('overwritten');
            expect(config.get('c')).to.equal('overwritten again');
            expect(config.get('d.dd.ddd')).to.equal(true);
            expect(config.get('d.dd.ddd2')).to.equal('Hello overwritten');
            expect(config.get('d.dd.ddd3')).to.equal(false);
            expect(config.get('d.dd2.ddd2')).to.equal(true);
            expect(config.get('d.dd3.ddd')).to.equal(null);
        });

        it('ignore nulls when requested', function() {
            expect(config.get('g', true)).to.equal('OnlyVisibleWhenNullIsIgnored');
            expect(config.get('d.dd3.ddd', true)).to.equal(true);
            expect(config.get('h', true)).to.equal(undefined);
        });

        it('load data from a specific layer', function() {
            expect(config.get('b', false, 'two')).to.equal('overwritten');
            expect(config.get('b', false, ['two', 'one'])).to.equal('overwritten');
            // Alter the order in which the layers will be checked
            expect(config.get('b', false, ['one', 'two'])).to.equal(2);
            expect(config.get('d.dd.ddd2', false, ['one', 'two'])).to.equal('Hello World');
            // Ignore nulls
            expect(config.get('d.dd3.ddd', true, ['two', 'one'])).to.equal(true);

        });

        it('ignore non-existing layers', function() {
            expect(config.get('d.dd3.ddd', true, ['foo', 'bar', 'two', 'baz','one'])).to.equal(true);
            expect(config.get('b', false, 'foo')).to.equal(undefined);
        });

        it('return only the layer\'s version of a branch when requesting a branch', function() {
            expect(config.get('d.dd')).to.deep.equal({ddd3: false});
            expect(config.get('d.dd3')).to.deep.equal({ddd: null, ddd2: false});
        });

        it('accepts different path separators', function() {
            config.pathSeparator = '/';
            expect(config.get('/d/dd/ddd2')).to.equal('Hello overwritten');
            expect(config.get('/ /d//dd/ddd2//')).to.equal('Hello overwritten');
            config.pathSeparator = '+';
            expect(config.get('+d+dd+ddd2')).to.equal('Hello overwritten');
            expect(config.get('+ +d++dd+ddd2++')).to.equal('Hello overwritten');
            config.pathSeparator = '<Separator>';
            expect(config.get('<Separator>d<Separator>dd<Separator>ddd2')).to.equal('Hello overwritten');
            expect(config.get('<Separator> <Separator>d<Separator><Separator>dd<Separator>ddd2<Separator><Separator>'))
                .to.equal('Hello overwritten');
            config.pathSeparator = '.';
        });

        it('throw an error if any of the parameters is of a wrong type', function() {
            expect(() => config.get(true)).to.throw(TypeError);
            expect(() => config.get(['a'])).to.throw(TypeError);
            expect(() => config.get(1337)).to.throw(TypeError);
            expect(() => config.get({})).to.throw(TypeError);
            expect(() => config.get('a', true, true)).to.throw(TypeError);
            expect(() => config.get('a', true, {})).to.throw(TypeError);
        });

    });

    describe('has()', function() {
        it('return correct values when isNull === false', function() {
            expect(config.has('a')).to.equal(true);
            expect(config.has('d.dd.ddd2')).to.equal(true);
            expect(config.has('d.dd4.ddd')).to.equal(false);
            expect(config.has('h')).to.equal(true);
            expect(config.has('x')).to.equal(false);
        });

        it('return correct values when isNull === true', function() {
            expect(config.has('a', true)).to.equal(true);
            expect(config.has('d.dd.ddd2', true)).to.equal(true);
            expect(config.has('d.dd4.ddd', true)).to.equal(false);
            expect(config.has('h', true)).to.equal(false); // << this is the essential one!
            expect(config.has('x', true)).to.equal(false);
        });

        it('return correct values when requesting data from specific layers', function() {
            expect(config.has('a', false, 'two')).to.equal(false);
            expect(config.has('d.dd3.ddd', true, 'two')).to.equal(false);
            expect(config.has('d.dd3.ddd', true, ['two', 'one'])).to.equal(true);
        });

        it('throw an error if any of the parameters is of a wrong type', function() {
            expect(() => config.has(true)).to.throw(TypeError);
            expect(() => config.has(['a'])).to.throw(TypeError);
            expect(() => config.has(1337)).to.throw(TypeError);
            expect(() => config.has({})).to.throw(TypeError);
            expect(() => config.has('a', true, true)).to.throw(TypeError);
            expect(() => config.has('a', true, {})).to.throw(TypeError);
        });
    });
});