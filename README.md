# wires-mongo

Wires Mongo is a simple ORM for mongodb. It uses native mongodb driver and does not invent any special quires. The driver is comprehensive enough. It is using Promises, and has conform to wires-domain protocol.



## Features

  * Model mapping
  * Promise based
  * Schema with auto validations
  * Simple but powerful API

## Installation

```bash
$ npm install wires-mongo
```

## Connecting db service

ORM does not have a connector, you need to register wires-domain service that return mongo cursor.
There are bugs related to getting collection name with newer version of driver. So, for now, please consider using
mongodb -> 1.4.17
```js
var domain = require("wires-domain")
var mongo = require('mongodb');
var Connection;
domain.service("$db", function() {
	return new Promise(function(resolve, reject) {
		if (Connection) {
			return resolve(Connection);
		}
		mongo.MongoClient.connect('mongodb://localhost:27017/wires_mongo_test', {
			server: {
				auto_reconnect: true
			}
		}, function(err, _db) {
			if (err) {
				return reject(err);
			}
			Connection = _db;
			return resolve(Connection);
		})
	})
});
```
