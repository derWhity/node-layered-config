// Tests loading the data from files
// jshint mocha:true
'use strict';

var expect = require('chai').expect;
var config = require('../../index.js');

describe('Loading layer data from files', function() {

    describe('loadFromFile()', function() {

        beforeEach(function() {
            config.removeAllLayers();
        });

        it('load data from a single file into one layer using automatic layer naming');
        it('load data from a single file into one layer using manual layer naming');
        it('load data from multiple files into multiple layers');
    });

    describe('loadFromDirectory()', function() {

        // The tests are dependant on each other - so we clear only once.
        before(function() {
            config.removeAllLayers();
        })

        it('load data from a directory into multiple layers');
        it('name the layers after the loaded file names');
    });
});