// Tests the set() functionality
/* global describe, it, before */
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
                    ddd: true
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

        it('write into the default layer', function() {
            config.set('a', 1337);
            config.set('g.xx.yy', true);
            config.set('c.cc', 1); // <- This one overwrites the 3

            expect(config.getLayerNames()).to.deep.equal(['three', 'two', 'one']);
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
            layer = config.getLayer('two');
            expect(layer.data).to.deep.equal(layerTwoData);
            layer = config.getLayer('one');
            expect(layer.data).to.deep.equal(layerOneData);
        });

        it('ignore illegal path elements', function() {
            config.set('...g.\n .  .    xx. ...   .zz', 1);
            config.set('.   ..a ..  . .  ', 'xxx');

            expect(config.getLayerNames()).to.deep.equal(['three', 'two', 'one']);
            let layer = config.getLayer('three');
            expect(layer.data).to.deep.equal({
                a: 'xxx',
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
                        yy: true,
                        zz: 1
                    }
                }
            });
            layer = config.getLayer('two');
            expect(layer.data).to.deep.equal(layerTwoData);
            layer = config.getLayer('one');
            expect(layer.data).to.deep.equal(layerOneData);
        });

        it('write into a specific layer', function() {
            config.set('a.1234.s::2', true, 'two');
            config.set('d.dd3', 32, 'two');

            expect(config.getLayerNames()).to.deep.equal(['three', 'two', 'one']);
            let layer = config.getLayer('three');
            expect(layer.data).to.deep.equal({
                a: 'xxx',
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
                        yy: true,
                        zz: 1
                    }
                }
            });
            layer = config.getLayer('two');
            expect(layer.data).to.deep.equal({
                a: {1234: {'s::2': true}},
                b: 'overwritten',
                e: null,
                d: {
                    dd: {
                        ddd2: 'Hello overwritten'
                    },
                    dd3: 32
                }
            });
            layer = config.getLayer('one');
            expect(layer.data).to.deep.equal(layerOneData);
        });

        it('add a new layer when writing to a nonexisting layer', function() {
            config.set('aa.bb.cc', 1234, 'newLayer');
            config.set('aa.bb.cc', 1235, 'newLayer2');
            expect(config.getLayerNames()).to.deep.equal(['newLayer2', 'newLayer', 'three', 'two', 'one']);
            let layer = config.getLayer('newLayer');
            expect(layer.data).to.deep.equal({aa: {bb: {cc: 1234}}});
            layer = config.getLayer('newLayer2');
            expect(layer.data).to.deep.equal({aa: {bb: {cc: 1235}}});
        });

        it('throw an error if the path is empty', function() {
            expect(() => config.set('', 'a')).to.throw(Error);
        });

        it('throw an error if any of the parameters is of a wrong type', function() {
            expect(() => config.set(133, 'a')).to.throw(TypeError);
            expect(() => config.set(true, 'a')).to.throw(TypeError);
            expect(() => config.set(null, 'a')).to.throw(TypeError);
        });
    });
});
