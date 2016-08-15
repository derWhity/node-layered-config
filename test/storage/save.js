// Tests saving data to files
/* global describe, it, beforeEach, afterEach */
'use strict';

let expect = require('chai').expect;
let config = require('../../index.js');
let fs = require('fs');
let path = require('path');
let rimraf = require('rimraf');
let Hjson = require('hjson');

describe('Storing layer data to files', function() {
    let layerAData = {a: 1234, b: {ba: true}};
    let layerBData = {b: {bb: 1337}};
    let layerCData = {c: true};
    let layerDData = {d: {da: {daa: true}, db: true}};
    let storagePath = path.join(__dirname, 'storageTest');

    beforeEach(function(done) {
        config.addLayer('a', layerAData).writeToDisk = true;
        config.addLayer('b', layerBData);
        config.addLayer('c', layerCData);
        config.addLayer('some/../test/../../layer', layerDData).writeToDisk = true;
        // Create the storage dir
        fs.mkdir(storagePath, err => {
            done(err);
        });
    });

    afterEach(function(done) {
        rimraf(storagePath, err => {
            done(err);
        });
    });

    describe('saveToFile()', function() {
        it('save the data of one layer into a file', function() {
            let fileName = path.join(storagePath, 'test.hjson');
            return expect(config.saveToFile('a', fileName)).to.eventually.be.fulfilled
                .then(() => {
                    expect(
                        Hjson.parse(fs.readFileSync(fileName, {encoding: 'utf8'}))
                    ).to.deep.equal(layerAData);
                });
        });

        it('reject when an unknown layer is specified', function() {
            let fileName = path.join(storagePath, 'test.hjson');
            return expect(config.saveToFile('notThere', fileName)).to.eventually.be.rejected;
        });

        it('reject when an illegal layer name is given', function() {
            let fileName = path.join(storagePath, 'test.hjson');
            return expect(config.saveToFile(true, fileName)).to.eventually.be.rejected
                .then(expect(config.saveToFile(1234, fileName)).to.eventually.be.rejected)
                .then(expect(config.saveToFile(true, fileName)).to.eventually.be.rejected)
                .then(expect(config.saveToFile([], fileName)).to.eventually.be.rejected)
                .then(expect(config.saveToFile({}, fileName)).to.eventually.be.rejected);
        });
    });

    describe('saveToDirectory()', function() {
        it('saving the data of all layers into a directory', function() {
            return expect(config.saveToDirectory(storagePath)).to.eventually.be.fulfilled
                .then(() => {
                    expect(fs.readdirSync(storagePath)).to.deep.equal(['a.hjson', 'some____test_______layer.hjson']);
                    expect(
                        Hjson.parse(fs.readFileSync(path.join(storagePath, 'a.hjson'), {encoding: 'utf8'}))
                    ).to.deep.equal(layerAData);
                    expect(
                        Hjson.parse(
                            fs.readFileSync(
                                path.join(storagePath, 'some____test_______layer.hjson'),
                                {encoding: 'utf8'}
                            )
                        )
                    ).to.deep.equal(layerDData);
                });
        });
    });
});
