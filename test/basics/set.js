// Tests the set() functionality
// jshint mocha:true
'use strict';

var expect = require('chai').expect;
var config = require('../../index.js');

describe('Storing data', function() {
    describe('set()', function() {

        var layerOneData = {
            a: 1,
            b: 2,
            c: 3,
            d: {
                dd: {
                    ddd: true,
                }
            }
        };

        var layerTwoData = {
            b: 'overwritten',
            e: null,
            d: {
                dd: {
                    ddd2: 'Hello overwritten'
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
            }
        };

        before(function() {
            // Load some basic configuration data into three layers
            config.addLayer('one', layerOneData);
            config.addLayer('two', layerTwoData);
            config.addLayer('three', layerThreeData);
            // Traversal order is now: three, two, one
        });

        it('write into existing configuration nodes', function() {
            config.set('a', 1337);
            config.set('g.xx.yy', true);
            config.set('c.cc', 1);
            let layer = config.getLayer('three');
            expect(layer.data).to.deep.equal({
                a: 1337,
                c: {
                    cc: 1
                },
                d: {
                    dd: {
                        ddd3: false
                    },
                    dd2: {
                        ddd2: true
                    }
                },
                g: {
                    xx: {
                        yy: true
                    }
                }
            });
        });

        it('write into nonexisting configuration nodes');
        it('write into a specific layer');
        it('throw an error if any of the parameters is of a wrong type');

    });
});