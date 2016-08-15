# node-layered-config 
[![Build Status](https://travis-ci.org/derWhity/node-layered-config.svg?branch=master)](https://travis-ci.org/derWhity/node-layered-config) [![Dependency Status](https://www.versioneye.com/user/projects/57a679a9fcd74d1602ca57fb/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/57a679a9fcd74d1602ca57fb)

A simple configuration system allowing multiple configuration layers (e.g. defaults, user-defined config)

Each layer is treated independently. If the configuration is queried, all layers are scanned from the layer with the highest priority to the one with the lowest. The first layer that can resolve the queried path will be the one returning the configured value.

## Usage

By default, an instance of `LayeredConfiguration` is created when the module is required.

```javascript
// Load a ready-to-use LayeredConfiguration instance
let config = require('layered-config');

// If you want to create your own instance, use this instead:
let LayeredConfig = require('layered-config').LayeredConfiguration;
let myConfig = new LayeredConfig();

```

### Adding layers

Before any configuration values can be read or written, we need to add one or more layers to the configuration.

If added by using `addlayer()`, every new layer will have a higher priority than the ones that were added before.

```javascript
// Add a first layer including some data
config.addLayer(
    'layerOne', 
    {
        one: 1,
        two: 2,
        three: {
            foo: 'bar'
        }
    }
);

// Add another layer
// This one has a higher priority than "layerOne"
config.addLayer(
    'layerTwo', 
    {
        three: {
            foo: 'overwritten', // This value overwrites the one in layerOne
            bar: 'baz'
        }
    }
);

console.dir(config.getLayerNames()); // ["layerTwo", "layerOne"]

```
`getLayerNames()` returns the names of the layers inside the configuration ordered from highest to lowest priority.

### Querying data

Each value inside the configuration hierarchy can be addressed by using a configuration path that describes the position you want to access. By default, configuration paths use "." as separator. To get the value of "bar" in our example above, the corresponding configuration path would be `three.bar`.

Querying the configuration is done by using `get()`:

```javascript
let valueOfBar = config.get('three.bar');
console.log(valueOfBar);                  // Output: 'baz'

// This will output "overwritten", since layerTwo has the highest priority
console.log(config.get('three.foo'));
```

If you want to query data from a specific layer, just add the layer name as second parameter:

```javascript
console.log(config.get('three.foo', 'layerOne')); // Output: 'bar'
```
You can even change the priority by passing the layer names in the order they should be queried:

```javascript
console.log(config.get('three.foo', ['layerOne', 'layerTwo'])); // Output: 'bar'
```
### Writing data

Data is written to the config using the `set()` method. It takes up to three parameters: The path to write to, the value to write and the layer the value shall be stored in. If the layer name is omitted, the new value will be written into the layer with the highest priority:

```javascript
config.set('my.precious.data', 'This is my value'); // Writes to "layerTwo"

config.set('some.other.data', 'Hello', 'layerOne'); // Writes to "layerOne"
```

You can write complete object hierarchies, too:
```javascript
config.set('my.data', {hello: {world: '!'});

let value = config.get('my.data.hello.world');
console.log(value); // Output: '!'
```

### Loading configuration data from the filesystem

`layered-config` reads and writes its configuration data using [Hjson](https://hjson.org/). This way, the configuration files can be written in a little bit more relaxed way and contain - for example - comments.

For more information about Hjson, see [the Hjson website](https://hjson.org/).

You can choose to either load each layer one by one using `loadFromFile()` or to fill the whole configuration by reading all `.json` and `.hjson` files from a directory using `loadFromDirectory()`. Both function return Promises that resolve when the load operations have completed.

```javascript
// Load the contents of userData.hjson into a new layer named "userData"
config.loadFromFile('./data/userData.hjson')
    .then(/* ... */);
    
// Load the same file into a layer named "foo"
config.loadFromFile('./data/userData.hjson', 'foo')
    .then(/* ... */);

// Cleanup
config.removeAllLayers();

// Load all (h)json files from ./data into the configuration
// Files will be loaded in alphabetical order
config.loadFromDirectory('./data')
    .then(/* ... */);
    
// Assuming that the directory contains the files "foo.hjson", "bar.json" and "baz.hjson",
let names = config.getLayerNames(); // ["foo", "baz", "bar"]
``` 

**Attention:**<br/>
If both, a `.hjson` and a `.json` file exist having the same filename, the resulting configuration will only contain the data from the `.json` file, because it will be loaded after the `.hjson` one, thus overwriting its data.

### Saving configuration data into files

When saving the configuration data you can either write the data of one layer into a single file using `saveToFile()` or write the data of all layers into Hjson files inside a directory, each having the layers' name by using `saveToDirectory()`.

Just like the load methods, each save method returns a Promise.

When using `saveToDirectory()`, only those layers will be written to disk that have their `writeToDisk` property set to `true` (_default:_ `false`).

```javascript
// Add some layers with data
config.addLayer('one', {a: 1}).writeToDisk = true;
config.addLayer('two', {b: 2});
config.addLayer('three', {c: 3}).writeToDisk = true;

// Write layer "two" to disk
config.saveToFile('two', 'myConfigFile.hjson')
    .then(/* ... */);
    
// This will write layers "one" and "three" to the target directory
config.saveToDirectory('./data')
    .then(/* ... */);
    
// The "data" directory now contains the files "one.hjson" and "three.hjson"
```