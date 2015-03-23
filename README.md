# bedrock-mongodb

A [bedrock][] module that creates a simple MongoDB database and provides an
easy API for creating and working with its collections.

## Quick Examples

```
npm install bedrock-mongodb
```

Below is an example that simply opens a collection when the database is ready
and then runs a query and prints the result. A more common use case for a
module that uses `bedrock-mongodb` would be to expose its own API that hides
the details of using whatever collections it has opened.

```js
var bedrock = require('bedrock');
var database = require('bedrock-mongodb');

// custom configuration
bedrock.config.mongodb.name = 'my_project_dev'; // default: bedrock_dev
bedrock.config.mongodb.host = 'localhost';      // default: localhost
bedrock.config.mongodb.port = 27017;            // default: 27017
bedrock.config.mongodb.username = 'my_project'; // default: bedrock
bedrock.config.mongodb.password = 'password';   // default: password

// the mongodb database 'my_project_dev' and the 'my_project' user will
// be created on start up following a prompt for the admin user credentials

// open some collections once the database is ready
bedrock.events.on('bedrock-mongodb.ready', function(callback) {
  database.openCollections(['collection1', 'collection2'], function(err) {
    if(err) {
      return callback(err);
    }
    // do something with the open collection(s)
    database.collections.collection1.find({id: 'foo'}, function(err, result) {
      if(err) {
        return callback(err);
      }
      console.log('result', result);
      callback();
    });
  });
});

bedrock.start();
```

Below is an example demonstrating the use of a distributed ID generator.

```js
var database = require('bedrock-mongodb');

database.getDistributedIdGenerator('mynamespace', function(err, idGenerator) {
  if(err) {
    console.error('Error', err);
    return;
  }
  idGenerator.generateId(function(err, id) {
    if(err) {
      console.error('Error', err);
      return;
    }
    console.log('ID generated', identifier);
  });
});
```

## Configuration

For documentation on database configuration, see [config.js](https://github.com/digitalbazaar/bedrock-mongodb/blob/master/lib/config.js).

## Requirements

* Linux or Mac OS X (also works on Windows with some coaxing)
* node.js >= 0.10.x
* npm >= 1.4.x
* mongodb ~= 2.4.x

## Setup

1. Ensure an admin user is set up on mongodb. To do so, follow the instructions
   at [mongodb.org](http://docs.mongodb.org/manual/tutorial/add-user-administrator/)
   for your version of MongoDB. Versions 2.4 and 2.6 are currently supported.
2. [optional] Tweak your project's configuration settings; see
   [Configuration](#configuration) or [Quick Examples](#quickexamples).

## API

### collections

An object whose keys are the names of the collections that have been
opened via `openCollections`.

### openCollections(collections, callback)

Opens a set of collections (creating them if necessary), if they aren't already
open. Once all of the collections are open, `callback` is called. If an error
occurs, `callback` is called immediately with the error. If no error occurs,
then once the `callback` has been called, `collections` object will have keys
that match the collection names and values that are instances of
[mongodb-native][]
[Collection](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html).

### getDistributedIdGenerator(namespace, callback)

Gets the `DistributedIdGenerator` for the given namespace. If the
`DistributedIdGenerator` does not exist, it will be created. The `callback`
will be passed an error if one occurred, otherwise it will be passed `null`
for the error and the `DistributedIdGenerator` instance. A
`DistributedIdGenerator` can be used to quickly generate unique identifiers
in a safe and distributed manner.

The underlying assumption that prevents identifier collisions is that there is
a shared collection (amongst all machines) with synchronized write access. To
ensure identifiers can be generated without waiting for a system-wide lock,
this collection is only hit once a local identifier namespace is exhausted,
which should be very rare.

A distributed ID looks like:

```
<version>.<globalId>.<localId>.<currentId>
```

Where '.' is the reserved separator character. The `globalId` is stored
in a shared database and can only be updated atomically.

The version is hardcoded to 1. The `localId` can be any combination of
alphanumeric characters not including `.`. The `.` character was chosen
instead of `-` or `_` because those characters are used in URL-safe base64
encodings. This allows `globalId` and `localId` parts to be encoded in base64,
however, they are encoded in hex in the current implementation as is the
`currentId`.

### DistributedIdGenerator.generateId(callback)

Generates a new unique, URL-safe identifier. The identifier is guaranteed
not to conflict with any other identifier generated using the same namespace,
regardless of the machine used to generate it (provided that the machines
share the same database). If an error occurs, the `callback` will be called
with the error, otherwise, it will be called with `null` for the error and
the identifier.


[bedrock]: https://github.com/digitalbazaar/bedrock
[mongodb-native]: http://mongodb.github.io/node-mongodb-native/2.0/
