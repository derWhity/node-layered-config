'use strict';

let LayeredConfiguration = require('./lib/LayeredConfiguration.js');

// Export both, an configuration instance for direct use and the class
module.exports = new LayeredConfiguration();
module.exports.LayeredConfiguration = LayeredConfiguration;