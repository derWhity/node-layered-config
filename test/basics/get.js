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
                }
            }
        };

        var layerTwoData = {
            a: 'overwritten',
            b: 4,
            e: null,
            f: {
                ff: 12
            }
        };

        var layerThreeData = {
            a: 'overwritten again',
            d: {
                dd: {
                    ddd3: false
                },
                dd2: {
                    dd2d: true
                }
            },
            e: 'Hurz'
        };

        before(function() {
            // Load some basic configuration data into three layers
            config.addLayer('one', layerThreeData);
            config.addLayer('two', layerTwoData);
            config.addLayer('three', layerOneData);
            // Traversal order is now: one, two, three
        });

        it('load root-level data correctly');
        it('load hierarcical data correctly');
        it('load overwritten data correctly');
        it('ignore nulls when requested');
        it('load data from a specific layer');
        it('throw an error if any of the parameters is of a wrong type');

    });

    describe('has()', function() {

    });
});