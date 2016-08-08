'use strict';

let _ = require('lodash');

/**
 * @class Layer
 */
class Layer {

    constructor(name, configData) {
        /**
         * @property {String} name
         * The name of this configruation layer
         */
        this.name = name;

        /**
         * @property {Boolean} writeToDisk
         * If set to `false`, this layer will not be written when #saveToDirectory() is called
         */
        this.writeToDisk = false;

        /**
         * @private
         * @property {Object} data
         * Internal data storage for the configuration data
         */
        this.data = _.cloneDeep(configData);
    }

    /**
     * Traverses a configuration object and returns the element at the position given in the path array
     *
     * @param  {String[]}   pathArray         An array containing the path segments that result by splitting the path
     *                                        by its separator (String.prototype.split(separator))
     * @param  {Boolean}    createNonExisting Should non-existing parts of the path be created in the object hierarchy?
     * @return {*}                            The element as requested by the path or `undefined` if the element
     *                                        described by the path does not exist
     */
    getConfigurationNode(pathArray, createNonExisting) {
        if (!_.isArray(pathArray)) {
            throw new TypeError('pathArray has to be an Array');
        }
        return this.doGetConfigurationNode(pathArray.concat(), createNonExisting, this.data);
    }

    /**
     * @private
     * Internal function to recurse through the object hierarchy
     *
     * @param  {String[]}   pathArray         An array containing the path segments that result by splitting the path
     *                                        by its separator (String.prototype.split(separator))
     * @param  {Boolean}    createNonExisting Should non-existing parts of the path be created in the object hierarchy?
     * @param  {Object}     currentContext    The current position in the configuration hierarchy. This object is used
     *                                        as root for the further search.
     * @return {*}                            The element as requested by the path or `undefined` if the element
     *                                        described by the path does not exist
     */
    doGetConfigurationNode(pathArray, createNonExisting, currentContext) {
        if (pathArray.length === 0 || !_.isPlainObject(currentContext)) {
            return undefined;
        }
        let currentPathSegment = pathArray.shift();
        if (!_.isString(currentPathSegment) || !currentPathSegment.trim()) {
            // Ignore this path element and continue with the next one - this will only happen when this function
            // is called directly
            return this.doGetConfigurationNode(pathArray, createNonExisting, currentContext);
        }
        currentPathSegment = currentPathSegment.trim();
        if (!currentContext.hasOwnProperty(currentPathSegment)) {
            if (createNonExisting) {
                currentContext[currentPathSegment] = {};
            } else {
                return undefined;
            }
        }
        let currentElement = currentContext[currentPathSegment];
        if (pathArray.length === 0) {
            // We are at our destination
            return currentElement;
        }
        // Recurse deeper
        return this.doGetConfigurationNode(pathArray, createNonExisting, currentElement);
    }

}

module.exports = Layer;