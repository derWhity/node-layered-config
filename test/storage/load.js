// Tests loading the data from files
/* global describe, it, beforeEach, before */
'use strict';

let expect = require('chai').expect;
let config = require('../../index.js');
let path = require('path');

describe('Loading layer data', function() {
    describe('Loading layer data from files', function() {
        describe('loadFromFile()', function() {
            beforeEach(function() {
                config.removeAllLayers();
            });

            it('load data from a single file into one layer using automatic layer naming', function() {
                return config.loadFromFile(path.join(__dirname, 'testData', 'a.hjson'))
                    .then(function(config) {
                        expect(config.getLayerNames()).to.deep.equal(['a']);
                        let layer = config.getLayer('a');
                        expect(layer.data).to.deep.equal({
                            a: {
                                aa: 1,
                                ab: 2,
                                ac: {
                                    aca: true
                                }
                            }
                        });
                    });
            });

            it('load data from a single file into one layer using manual layer naming', function() {
                return config.loadFromFile(path.join(__dirname, 'testData', 'b.hjson'), 'test')
                    .then(function(config) {
                        expect(config.getLayerNames()).to.deep.equal(['test']);
                        let layer = config.getLayer('test');
                        expect(layer.data).to.deep.equal({
                            b: {
                                bb: true
                            }
                        });
                    });
            });

            it('reject the promise when loading illegal HJSON data', function() {
                return expect(config.loadFromFile(path.join(__dirname, 'illegalData', 'illegalData.json'), 'test'))
                    .to.eventually.be.rejected;
            });
        });

        describe('loadFromDirectory()', function() {
            let check = function() {
                expect(config.getLayerNames()).to.deep.equal(['d', 'c', 'b', 'a']);
                expect(config.getLayer('a').data).to.deep.equal({a: {aa: 1, ab: 2, ac: {aca: true}}});
                // The JSON file instead of the HJSON one - because of the alphabetical order
                expect(config.getLayer('b').data).to.deep.equal({b: {ba: true, bb: {bbb: 'Hello World'}}});
                expect(config.getLayer('c').data).to.deep.equal({c: 1, d: {dd: true}});
                expect(config.getLayer('d').data).to.deep.equal({d: {1234: true}});
            };

            // The tests are dependant on each other - so we clear only once.
            before(function() {
                config.removeAllLayers();
            });

            it('load data from a directory into multiple layers', function() {
                return config.loadFromDirectory(path.join(__dirname, 'testData'))
                    .then(function(conf) {
                        expect(config).to.equal(conf);
                    })
                    .then(check.bind(this));
            });

            it('reject the promise and restore the last status if any loaded file contains illegal data', function() {
                return expect(config.loadFromDirectory(path.join(__dirname, 'illegalData')))
                    .to.eventually.be.rejected
                    .then(check.bind(this));
            });
        });
    });

    describe('Loading layer data from environment variables', function() {
        describe('loadFromEnv()', function() {
            before(function() {
                // Set some own env vars for the test
                process.env.TEST_VAR_ONE = 1234;
                process.env.TEST_VAR_TWO = 'Hello';
                process.env.TEST_VAR_THREE = 'xxx';
            });

            beforeEach(function() {
                config.removeAllLayers();
            });

            it('load all environment variables into a configuration layer without modifying them', function() {
                config.loadFromEnv({lowerCase: false});
                expect(config.getLayerNames()).to.deep.equal(['process_env']);
                expect(config.getLayer('process_env').data).to.deep.equal(process.env);
            });

            it('load only environment variables that are inside the whitelist', function() {
                config.loadFromEnv({lowerCase: false, whitelist: ['TEST_VAR_ONE', 'TEST_VAR_TWO']});
                expect(config.getLayerNames()).to.deep.equal(['process_env']);
                expect(config.getLayer('process_env').data).to.deep.equal(
                    {TEST_VAR_ONE: '1234', TEST_VAR_TWO: 'Hello'}
                );
            });

            it('load only environment variables that match a regular expression', function() {
                config.loadFromEnv({lowerCase: false, match: /TEST_VAR.*/});
                expect(config.getLayerNames()).to.deep.equal(['process_env']);
                expect(config.getLayer('process_env').data).to.deep.equal(
                    {TEST_VAR_ONE: '1234', TEST_VAR_TWO: 'Hello', TEST_VAR_THREE: 'xxx'}
                );
            });

            it('split variable names into correct paths when using the separator option', function() {
                config.loadFromEnv({lowerCase: false, match: /TEST_VAR.*/, separator: '_'});
                expect(config.getLayerNames()).to.deep.equal(['process_env']);
                expect(config.getLayer('process_env').data).to.deep.equal(
                    {
                        TEST: {
                            VAR: {
                                ONE: '1234',
                                TWO: 'Hello',
                                THREE: 'xxx'
                            }
                        }
                    }
                );
            });

            it('use the lowerCase option correctly', function() {
                config.loadFromEnv({match: /test_var.*/, separator: '_'});
                expect(config.getLayerNames()).to.deep.equal(['process_env']);
                expect(config.getLayer('process_env').data).to.deep.equal(
                    {
                        test: {
                            var: {
                                one: '1234',
                                two: 'Hello',
                                three: 'xxx'
                            }
                        }
                    }
                );
            });
        });
    });
});
