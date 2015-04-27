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

## Schemas
Schemas are mandatory. It allows to do automatic validation on save, and brings transparency in your code after all.

```js
var Model = require('wires-mongo')
var = Model.extend({
	collection: "super_test",
	schema: {
		_id: [],
		name: {
		    required: true
		},
		email: [],
		password: [],
	}
})
```

## Queries
Find accepts native mongodb query. 
```js
var user = new TestUser();
user.find({name : "john"}).first().then(function(model) {
	model.attrs.name.should.be.equal("john")
	done();
}).catch(function(e) {
	logger.fatal(e.stack || e)
});
```

You can also use key and value as first and second arguments to fetch something using simple criterion.

```js
user.find("name", "john")
```

Find by id
Input string will be automatically converted to mongoObject if string detected.
```js
user.findById("mongodb id")
```

### Query with projection
It is possible to pass a projection. Add a projection to your model's properties

```js
projections: {
	user: ["name", "email"],
	world: {
		exclude: ["password"],
	}
},
```

You can use "exclude" to exclude specific properties from the query.
To set current projection

```js
var user = new TestUser();
user.projection("user");
```





