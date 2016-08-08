// Tests clearing up the layer data
// jshint mocha:true
'use strict';

var expect = require('chai').expect;
var config = require('../../index.js');

describe('Resetting layer data', function() {

    var layerOneData = {a: 1};
    var layerTwoData = {b: 2};
    var layerThreeData = {c: 3};

    var prepareLayers = () => {
        config.removeAllLayers();
        // Load some basic configuration data into three layers
        config.addLayer('one', layerOneData);
        config.addLayer('two', layerTwoData);
        config.addLayer('three', layerThreeData);
        // Traversal order is now: three, two, one
    };

    describe('clearLayer()', function() {
        beforeEach(prepareLayers);
        it('clear one layer\'s data');
        it('clear multiple layers\'s data at once');
    });

    describe('clearAllLayers()', function() {
        beforeEach(prepareLayers);
        it('clear all layers\' data');
    });
});