// Tests the get() functionality
/* global describe, it */
'use strict';

var expect = require('chai').expect;
var config = require('../../index.js');
var Layer = require('../../lib/Layer.js');

describe('Layer handling', function() {
    var layerOneData = {a: 1, b: 2, c: 3};
    var layerTwoData = {a: 4, b: 5, e: 6};
    var layerThreeData = {a: 7, d: 8, e: 9};
    var layerFourData = {a: 10};
    var layerFiveData = {b: 11};
    var layerSixData = {c: 12};
    var layerSevenData = {d: 13};
    var layerEightData = {e: 14};
    var layerNineData = {e: 15};
    var ovewriteLayerData = {a: 666};

    var doCheck = function(nameData, expectedLayerData) {
        let layerNames = config.getLayerNames();
        expect(layerNames).to.be.an('array');
        expect(layerNames).to.deep.equal(nameData);
        // Check the layers themselves
        for (let i = 0; i < nameData.length; i += 1) {
            let layerName = nameData[i];
            let layer = config.getLayer(layerName);
            let expectedData = expectedLayerData[i];
            expect(layer).to.be.an.instanceof(Layer);
            expect(layer.data).to.deep.equal(expectedData);
        }
    };

    describe('basics', function() {
        it('empty upon initialization', function() {
            doCheck([], []);
        });
    });

    describe('addLayer()', function() {
        it('handle adding a first layer', function() {
            config.addLayer('one', layerOneData);
            doCheck(['one'], [layerOneData]);
        });
        it('handle adding a second layer', function() {
            config.addLayer('two', layerTwoData);
            doCheck(['two', 'one'], [layerTwoData, layerOneData]);
        });
        it('handle adding a third layer', function() {
            config.addLayer('three', layerThreeData);
            doCheck(['three', 'two', 'one'], [layerThreeData, layerTwoData, layerOneData]);
        });
        it('overwrite an existing layer with a new one with the same name', function() {
            config.addLayer('two', ovewriteLayerData);
            doCheck(['two', 'three', 'one'], [ovewriteLayerData, layerThreeData, layerOneData]);
        });
        it('handle the addition of an empty layer', function() {
            config.addLayer('xxx');
            doCheck(['xxx', 'two', 'three', 'one'], [{}, ovewriteLayerData, layerThreeData, layerOneData]);
        });
        it('throw an error if any of the parameters is of a wrong type', function() {
            expect(() => config.addLayer(1, {a: 1})).to.throw(TypeError);
            expect(() => config.addLayer('xxx', [])).to.throw(TypeError);
        });
    });

    describe('addLayerAt()', function() {
        it('add a layer at the correct position', function() {
            config.addLayerAt('four', layerFourData, 3);
            doCheck(
                ['xxx', 'two', 'three', 'four', 'one'],
                [{}, ovewriteLayerData, layerThreeData, layerFourData, layerOneData]
            );
        });
        it('add a layer at the end of the list when using an index > number of layers', function() {
            config.addLayerAt('five', layerFiveData, 100);
            doCheck(
                ['xxx', 'two', 'three', 'four', 'one', 'five'],
                [{}, ovewriteLayerData, layerThreeData, layerFourData, layerOneData, layerFiveData]
            );
        });
        it('throw an error if any of the parameters is of a wrong type', function() {
            expect(() => config.addLayerAt(1, {a: 1}, 0)).to.throw(TypeError);
            expect(() => config.addLayerAt('xxx', [], 0)).to.throw(TypeError);
            expect(() => config.addLayerAt('xxx', {a: 1}, true)).to.throw(TypeError);
        });
    });

    describe('addLayerBefore()', function() {
        it('add a layer before another', function() {
            config.addLayerBefore('six', layerSixData, 'three');
            doCheck(
                ['xxx', 'two', 'six', 'three', 'four', 'one', 'five'],
                [{}, ovewriteLayerData, layerSixData, layerThreeData, layerFourData, layerOneData, layerFiveData]
            );
        });
        it('add a layer to the beginning of the list when the referenced layer is not found', function() {
            config.addLayerBefore('seven', layerSevenData, 'nonexisting');
            doCheck(
                ['seven', 'xxx', 'two', 'six', 'three', 'four', 'one', 'five'],
                [
                    layerSevenData,
                    {},
                    ovewriteLayerData,
                    layerSixData,
                    layerThreeData,
                    layerFourData,
                    layerOneData,
                    layerFiveData
                ]
            );
        });
        it('throw an error if any of the parameters is of a wrong type', function() {
            expect(() => config.addLayerBefore(1, {a: 1}, 'three')).to.throw(TypeError);
            expect(() => config.addLayerBefore('xxx', [], 'three')).to.throw(TypeError);
            expect(() => config.addLayerBefore('xxx', {a: 1}, true)).to.throw(TypeError);
        });
    });

    describe('addLayerAfter()', function() {
        it('add a layer after another', function() {
            config.addLayerAfter('eight', layerEightData, 'four');
            doCheck(
                ['seven', 'xxx', 'two', 'six', 'three', 'four', 'eight', 'one', 'five'],
                [
                    layerSevenData,
                    {},
                    ovewriteLayerData,
                    layerSixData,
                    layerThreeData,
                    layerFourData,
                    layerEightData,
                    layerOneData,
                    layerFiveData
                ]
            );
        });
        it('add a layer to the end of the list when the referenced layer is not found', function() {
            config.addLayerAfter('nine', layerNineData, 'nonexisting');
            doCheck(
                ['seven', 'xxx', 'two', 'six', 'three', 'four', 'eight', 'one', 'five', 'nine'],
                [
                    layerSevenData,
                    {},
                    ovewriteLayerData,
                    layerSixData,
                    layerThreeData,
                    layerFourData,
                    layerEightData,
                    layerOneData,
                    layerFiveData,
                    layerNineData
                ]
            );
        });
        it('throw an error if any of the parameters is of a wrong type', function() {
            expect(() => config.addLayerAfter(1, {a: 1}, 'three')).to.throw(TypeError);
            expect(() => config.addLayerAfter('xxx', [], 'three')).to.throw(TypeError);
            expect(() => config.addLayerAfter('xxx', {a: 1}, true)).to.throw(TypeError);
        });
    });

    describe('removeLayer()', function() {
        it('remove a single layer', function() {
            config.removeLayer('three');
            doCheck(
                ['seven', 'xxx', 'two', 'six', 'four', 'eight', 'one', 'five', 'nine'],
                [
                    layerSevenData,
                    {},
                    ovewriteLayerData,
                    layerSixData,
                    layerFourData,
                    layerEightData,
                    layerOneData,
                    layerFiveData,
                    layerNineData
                ]
            );
        });
        it('remove multiple layers at once', function() {
            config.removeLayer(['six', 'one', 'five', 'seven']);
            doCheck(
                ['xxx', 'two', 'four', 'eight', 'nine'],
                [
                    {},
                    ovewriteLayerData,
                    layerFourData,
                    layerEightData,
                    layerNineData
                ]
            );
        });
        it('throw an error if the parameter is of a wrong type', function() {
            expect(() => config.removeLayer(1)).to.throw(TypeError);
            expect(() => config.removeLayer([1])).to.throw(TypeError);
        });
    });

    describe('removeAllLayers()', function() {
        it('remove all existing layers completely', function() {
            config.removeAllLayers();
            expect(config.layers).to.deep.equal({});
            expect(config.getLayerNames()).to.deep.equal([]);
        });
    });
});
