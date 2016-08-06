'use strict';

let _ = require('lodash');
let Hjson = require('hjson');
let fs = require('fs');
let Layer = require('./Layer.js');

/**
 * @class LayeredConfiguration
 */
class LayeredConfiguration {

    constructor() {
        /**
         * @property {Object} layers
         * Internal storage for the configruation layers' data
         *
         * Each layer is stored with its stored in a property having its name.
         */
        this.layers = {};
        /**
         * @property {String[]} layerNames
         * Storage for the order in which the layers will be populated when data is requested.
         */
        this.layerNames = [];
        /**
         * @property {String} pathSeparator
         * The separator to use when describing a configuration path hierarchy
         */
        this.pathSeparator = '.';
    }

    /**
     * Searches a specific configuration path and returns its value.
     *
     * If no layer is specified, the search will populate all existing layers in the order which is configured in the
     * property #layerOrder. If the specified path is found on a layer, if not, the search continues with the next layer
     * in the list.
     *
     * Per default, null values count as existing paths, so if a layer contains a null value at a specific path, it
     * will be returned and the search will stop at this point. If you want to ignore null values and continue with
     * the next layer, pass `true` for the #ignoreNulls parameter
     *
     * @param  {String}             path                    The path to the configuration value to return
     * @param  {Boolean}            [ignoreNulls=false]     Set to `true` to treat null values as non-existing paths
     * @param  {String/String[]}    [restrictToLayer=null]  If specified, the search will be restricted only to the
     *                                                      layer or layers which are mentioned here.
     *                                                      The order in which the layers are populated will _not_ be
     *                                                      altered by the order the layers are passed in this parameter
     * @return {*}                                          The configuration value at the position specified in #path
     *                                                      or `undefined`, if no configuration value could be found.
     */
    get(path, ignoreNulls, restrictToLayer) {

    }

    /**
     * Stores an arbitary value at the configuration path provided. The value will be stored inside the configuration
     * layer specified by #layerName. If no layer name is provided, the value will be stored inside the layer with
     * the highest priority (first layer inside of #layerOrder).
     *
     * If a value of `undefined` is set to a configuration path, the node identified by the path will be deleted.
     *
     * @param {String}  path                The configuration path to store the value at
     * @param {*}       value               The value to store
     * @param {String}  [layerName=null]    The name of the layer to store the configruation value in
     */
    set(path, value, layerName) {

    }

    /**
     * Checks, if a specific path exists in the configuration - or a specific set of configuration layers, if specified
     *
     * @param  {String}             path                    The configuration path to check
     * @param  {String/String[]}    restrictToLayer         One or more layers to restrict the search to
     * @param  {Boolean}            [ignoreNulls=false]     If set to `true`, `null` values will be treated as non-
     *                                                      existing paths
     * @return {Boolean}                                    `true` if a value exists at the given path, `false` if not
     */
    has(path, restrictToLayer, ignoreNulls) {

    }

    /**
     * Adds a configuration layer to the config. New layers are always added with the highest priority. If you want to
     * use another priority, use #addLayerAt(), #addLayerBefore() or #addLayerAfter().
     *
     * Adding a layer with a layer name that already exists, will remove the existing layer before addng the new one
     *
     * @param {String} layerName            An unique identifier to identify the layer with
     * @param {Object} configurationData    The configuration hierarchy to populate the layer with
     * @return {Layer}                      The layer object that has been added to the configuration
     */
    addLayer(layerName, configurationData) {
        return this.addLayerAt(layerName, configurationData, 0);
    }

    /**
     * Adds a configuration layer to the config and places it at the given index of the serch order.
     *
     * Adding a layer with a layer name that already exists, will remove the existing layer before addng the new one
     *
     * @param {String} layerName            An unique identifier to identify the layer with
     * @param {Object} configurationData    The configuration hierarchy to populate the layer with
     * @param {Number} layerIndex           The index of the search order to add the layer at
     * @return {Layer}                      The layer object that has been added to the configuration
     */
    addLayerAt(layerName, configurationData, layerIndex) {
        if (!_.isString(layerName)) {
            throw new TypeError('layerName needs to be a string');
        }
        if (!_.isPlainObject(configurationData)) {
            throw new TypeError('configurationData needs to be an Object');
        }
        if (!_.isInteger(layerIndex)) {
            throw new TypeError('layerIndex needs to be an integer');
        }
        // Just to be sure: Remove an eventually existing layer
        this.removeLayer(layerName);
        let layer = new Layer(layerName, configurationData);
        this.layers[layerName] = layer;
        this.layerNames.splice(layerIndex, 0, layerName);
        return layer;
    }

    /**
     * @private
     * Adds a layer either before or after another layer
     *
     * This function is used internally by #addLayerBefore and #addLayerAfter
     *
     * @param {String}  layerName            An unique identifier to identify the layer with
     * @param {Object}  configurationData    The configuration hierarchy to populate the layer with
     * @param {Number}  otherLayerName       Name of the layer which will have this layer appended after it
     * @param {Boolean} before               `true` to add the new layer before, `false` to add it after the other
     *                                       layer
     * @return {Layer}                       The layer object that has been added to the configuration
     */
    addLayerRelativeTo(layerName, configurationData, otherLayerName, before) {
        if (!_.isString(otherLayerName)) {
            throw new TypeError('otherLayerName needs to be a string');
        }
        let idx = this.layerNames.indexOf(otherLayerName);
        if (idx === -1) {
            idx = before ? 0 : this.layerNames.length;
        }
        if (!before) {
            idx ++;
        }
        return this.addLayerAt(layerName, configurationData, idx);
    }

    /**
     * Adds a configuration layer to the config and places it before the layer specified by #otherLayerName
     *
     * Adding a layer with a layer name that already exists, will remove the existing layer before addng the new one.
     *
     * If the other layer does not exist in the configuration, the new layer will be added at the beginning of the
     * layer list.
     *
     * @param {String} layerName            An unique identifier to identify the layer with
     * @param {Object} configurationData    The configuration hierarchy to populate the layer with
     * @param {Number} otherLayerName       Name of the layer which will have this layer prepended before it
     * @return {Layer}                      The layer object that has been added to the configuration
     */
    addLayerBefore(layerName, configurationData, otherLayerName) {
        return this.addLayerRelativeTo(layerName, configurationData, otherLayerName, true);
    }

    /**
     * Adds a configuration layer to the config and places it after the layer specified by #otherLayerName
     *
     * Adding a layer with a layer name that already exists, will remove the existing layer before addng the new one.
     *
     * If the other layer does not exist in the configuration, the new layer will be added at the end of the layer list.
     *
     * @param {String} layerName            An unique identifier to identify the layer with
     * @param {Object} configurationData    The configuration hierarchy to populate the layer with
     * @param {Number} otherLayerName       Name of the layer which will have this layer appended after it
     * @return {Layer}                      The layer object that has been added to the configuration
     */
    addLayerAfter(layerName, configurationData, otherLayerName) {
        return this.addLayerRelativeTo(layerName, configurationData, otherLayerName, false);
    }

    /**
     * @private
     * Internal function that removes a single layer by name
     *
     * @param  {String} layerName   The name of the layer to remove
     */
    removeSingleLayer(layerName) {
        if (!_.isString(layerName)) {
            throw new TypeError('layerName needs to be a string');
        }
        let idx = this.layerNames.indexOf(layerName);
        if (idx > -1) {
            this.layerNames.splice(idx, 1);
        }
        if (this.layers.hasOwnProperty(layerName)) {
            delete this.layers[layerName];
        }
    }

    /**
     * Removed the configuration layer with the given name.
     * By passing an array of layer names to this function, multiple layers can be removed at once.
     *
     * @param  {String/String[]} layerName One or more names of layers that shall be removed
     */
    removeLayer(layerName) {
        if (!_.isArray(layerName)) {
            layerName = [layerName];
        }
        _.forEach(layerName, layer => {
            this.removeSingleLayer(layer);
        });
    }

    /**
     * Removes all layers from the configuration
     */
    removeAllLayers() {
        this.layers = {};
        this.layerNames = [];
    }

    /**
     * Removes all stored values from the given layer, but keep the layer itself.
     * Multiple layers can be cleared at once by passing an array of layer names to clear.
     *
     * @param  {String/String[]} layerName One or more layer names to clear the configuration data for
     */
    clearLayer(layerName) {

    }

    /**
     * Clears the stored values for all layers in the configuration
     */
    clearAllLayers() {

    }

    /**
     * Loads the configuration data from a HJSON file and stores it into the given layer.
     * If the layer already exists, it will be cleared before adding the new data to it.
     *
     * This function is asynchronous and returns a Promise.
     *
     * @param  {String} filePath            Path to the file to load from disk
     * @param  {String} [layerName=null]    Name of the layer to store the configuration data in. If no value is
     *                                      specified, the layer will get the name of the HJSON file without the file
     *                                      extension.
     * @return {Promise}                    A promise that resolves when the configuration has been loaded successfully
     *                                      and rejects when an error occurs
     */
    loadFromFile(filePath, layerName) {

    }

    /**
     * Stores the configuration data from a specific layer into a HJSON file.
     *
     * If the specified file already exists, it will be overwritten.
     *
     * @param  {String}     layerName   The name of the layer to store in the resulting file
     * @param  {String}     filePath    Path to the file that should be written
     * @return {Promise}                A promise tha resolves when the configuration has been stored successfully and
     *                                  rejects if an error occures
     */
    saveToFile(layerName, filePath) {

    }

    /**
     * Returns the list of layer names this configuration contains, ordered by their priority
     *
     * @return {String[]}   The list of layer names
     */
    getLayerNames() {
        return this.layerNames.concat();
    }

    /**
     * Returns the layer with the given name
     *
     * @param  {String}             layerName   Name of the layer to get from the configuration
     * @return {Layer/undefined}                The layer with the given name or `undefined`, if the layer does not
     *                                          exist
     */
    getLayer(layerName) {
        return this.layers[layerName] || undefined;
    }

    /**
     * Loads the configuration from a set of HJSON (*.hjson) or JSON (*.json) files residing inside of the given
     * directory.
     *
     * Each file will create or overwrite a layer with the name of the loaded file without its file extension.
     * Existing layers will be cleared before loading the layer data - so if a layer exists that has no corresponding
     * file, it will still exist, but contain no data. If you want to start with only the layers from the configuration
     * files, use #removeAllLayers() before calling this function.
     *
     * All files will be loaded in alphabetical order.
     *
     * ATTENTION: If two files with the same name but different extensions exist, the JSON file's data will overwrite
     *            the HJSON file's data.
     *
     * @param  {String}     directoryPath   The path to load the layer data from
     * @return {Promise}                    A Promise that resolves when the data has been saved successfully and
     *                                      is rejected when an error occurs
     */
    loadFromDirectory(directoryPath) {

    }

    /**
     * Saves the data of all layers into HJSON (*.hjson) files inside the given directory. Each file will be named the same
     * as the layer which is stored in it.
     *
     * @param  {String}     directoryPath   The path to store the layer data in
     * @return {Promise}                    A Promise that resolves when the data has been saved successfully and
     *                                      is rejected when an error occurs
     */
    saveToDirectory(directoryPath) {

    }

}

module.exports = LayeredConfiguration;