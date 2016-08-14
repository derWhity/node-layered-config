'use strict';

let _ = require('lodash');

/**
 * @class Layer
 */
class Layer {

    // region -- Constructor ------------------------------------------------------------------------------------------

    constructor(name, configData, writeToDisk) {
        /**
         * @property {String} name
         * The name of this configruation layer
         */
        this.name = name;

        /**
         * @property {Boolean} writeToDisk
         * If set to `false`, this layer will not be written when #saveToDirectory() is called
         */
        this.writeToDisk = !!writeToDisk;

        /**
         * @private
         * @property {Object} data
         * Internal data storage for the configuration data
         */
        this.data = configData ? _.cloneDeep(configData) : {};
    }

    // endregion Constructor

    // region -- Internal helper functions ----------------------------------------------------------------------------

    /**
     * @private
     * Internal function to recurse through the object hierarchy and return the value at the given path
     *
     * @param  {String[]}   pathArray         An array containing the path segments that result by splitting the path
     *                                        by its separator (String.prototype.split(separator))
     * @param  {Object}     currentContext    The current position in the configuration hierarchy. This object is used
     *                                        as root for the further search.
     * @return {*}                            The element as requested by the path or `undefined` if the element
     *                                        described by the path does not exist
     */
    doGetConfigurationNode(pathArray, currentContext) {
        if (!_.isArray(pathArray)) {
            throw new TypeError('pathArray has to be an Array');
        }
        let len = pathArray.length;
        if (len === 0) {
            // No path left - the context is what the caller wants
            return currentContext;
        }
        let pathElement = pathArray.shift();
        if (!_.isString(pathElement) || !pathElement.trim()) {
            // Ignore illegal path element
            return this.doGetConfigurationNode(pathArray, currentContext);
        }
        if (!_.isPlainObject(currentContext) || !currentContext.hasOwnProperty(pathElement)) {
            // We cannot recurse deeper
            return undefined;
        }
        if (len === 1) {
            // A direct child is the result requested - return it directly to avoid another recursion
            return currentContext[pathElement];
        }
        // Recurse deeper
        return this.doGetConfigurationNode(pathArray, currentContext[pathElement]);
    }

    /**
     * @private
     * Internal function to traverse the configuration object and write a value at the position indicated by the given
     * path array
     *
     * @param  {String[]}   pathArray         An array describing the hierarchy the new value has to be stored at
     * @param  {*}          value             The value to store
     * @param  {Object}     currentContext    The current position inside the hierarchy
     */
    doSetConfigurationNode(pathArray, value, currentContext) {
        if (!_.isArray(pathArray)) {
            throw new TypeError('pathArray has to be an Array');
        }
        let len = pathArray.length;
        if (len === 0) {
            // Empty path - we won't write here
            return;
        }
        let pathElement = pathArray.shift();
        if (!_.isString(pathElement) || !pathElement.trim()) {
            // Skip the illegal path element
            this.doSetConfigurationNode(pathArray, value, currentContext);
        }
        if (len === 1) {
            if (value === undefined) {
                delete currentContext[pathElement];
            } else {
                currentContext[pathElement] = value;
            }
        } else {
            // We have to recurse deeper
            if (
                !currentContext.hasOwnProperty(pathElement) ||
                !_.isPlainObject(currentContext[pathElement])
            ) {
                currentContext[pathElement] = {};
            }
            this.doSetConfigurationNode(pathArray, value, currentContext[pathElement]);
        }
    }

    // endregion Internal helper functions

    // region -- Externally used interface ----------------------------------------------------------------------------

    /**
     * Clears the data stored in this layer
     */
    clear() {
        this.data = {};
    }

    /**
     * Traverses a configuration object and returns the element at the position given in the path array
     *
     * @param  {String[]}   pathArray         An array containing the path segments that result by splitting the path
     *                                        by its separator (String.prototype.split(separator))
     * @return {*}                            The element as requested by the path or `undefined` if the element
     *                                        described by the path does not exist
     */
    getConfigurationNode(pathArray) {
        return this.doGetConfigurationNode(pathArray.concat(), this.data);
    }

    /**
     * Stores a new value at the given position inside the configuration hierarchy
     *
     * @param  {String[]}   pathArray         An array describing the hierarchy the new value has to be stored at
     * @param  {*}          value             The value to store
     */
    setConfigurationNode(pathArray, value) {
        this.doSetConfigurationNode(pathArray, value, this.data);
    }

    // endregion Externally used interface

}

module.exports = Layer;