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

## Attributes

All attributes are stored in "attrs" dictionary. Attribute will be ignored in case of missing in schema.
To set an attribute, use
```js
var user = new User();
user.set("name", "john")
// or
user.set({name : "john"})
```

It is possible to constuct model with a dictionary

```js
var user = new User({name : "john"});
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

You can use either first() or all() for performing mongodb request



## Count

A simple query for count
```js
var user = new TestUser();
user.find().count().then(function(num) {
   num.should.be.equal(2);
})
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

See [tests](wiresjs/wires-mongo/blob/master/test/base_model_test.js) for better understanding



## Saving
Like any activerecord we detect what type of query it is by absence or presence of _id attribute

```js
var user = new TestUser({
    name: "john",
});
user.save().then(function(newuser) {
	// At this point we have _id attribute set
	// Modify user name and return new promise
	return newuser.set("name", "ivan").save()
}).then(function(success){

}).catch(function(e) {
  logger.fatal(e.stack || e)
});
```

### Saving events and handlers

You can decorate saving with multiple methods. Add them to your  model

Triggered before performing creat request:
```js
onBeforeCreate: function(resolve, reject) {
	resolve();
}
```

Triggered before performing update request:

```js
onBeforeUpdate: function(resolve, reject) {
	resolve();
},
```

Triggered all the time when save is called
```js
onBeforeSave: function(resolve, reject) {
	resolve();
}
```


## Removing
Removing requires _id attribute set.

Triggers 2 events, that's why response is an array that contains results from promises
```js
user.remove().then(function(response) {
	// Amount of rows is in the second argument
	response[1].should.be.equal(1);
	done();
})
```
### Events on remove

Put these method into your model. Throw any exception or reject!
But don't forget to resolve :-)

```js
onBeforeRemove: function(resolve, reject) {
	resolve();
},
onAfterRemove: function(resolve, reject) {
	resolve();
},
```






