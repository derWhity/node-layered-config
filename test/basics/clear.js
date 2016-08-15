// Tests clearing up the layer data
/* global describe, it, beforeEach */
'use strict';

var expect = require('chai').expect;
var config = require('../../index.js');
var _ = require('lodash');

describe('Resetting layer data', function() {
    var layerOneData = {a: 1};
    var layerTwoData = {b: 2};
    var layerThreeData = {c: 3};

    var checkLayers = data => {
        _.forEach(config.getLayerNames(), (layerName, idx) => {
            let layer = config.getLayer(layerName);
            let layerData = data[idx];
            expect(layer.data).to.deep.equal(layerData);
        });
    };

    beforeEach(() => {
        config.removeAllLayers();
        // Load some basic configuration data into three layers
        config.addLayer('one', layerOneData);
        config.addLayer('two', layerTwoData);
        config.addLayer('three', layerThreeData);
        // Traversal order is now: three, two, one
    });

    describe('clearLayer()', function() {
        it('clear one layer\'s data', function() {
            checkLayers([layerThreeData, layerTwoData, layerOneData]);
            config.clearLayer('one');
            checkLayers([layerThreeData, layerTwoData, {}]);
            config.clearLayer('three');
            checkLayers([{}, layerTwoData, {}]);
        });

        it('clear multiple layers\'s data at once', function() {
            checkLayers([layerThreeData, layerTwoData, layerOneData]);
            config.clearLayer(['one', 'three']);
            checkLayers([{}, layerTwoData, {}]);
        });
    });

    describe('clearAllLayers()', function() {
        it('clear all layers\' data', function() {
            checkLayers([layerThreeData, layerTwoData, layerOneData]);
            config.clearAllLayers();
            checkLayers([{}, {}, {}]);
        });
    });
});
