# wires-mongo

Wires Mongo is a simple ORM for mongodb. It uses native mongodb driver and does not invent any special quires. The driver is comprehensive enough. It is using Promises, and has conform to wires-domain protocol.



## Features

  * Model mapping
  * Promise based
  * Reference fetching with optimized query
  * Schema with auto validations
  * Simple but powerful API
  * Good test coverage with comprehensive examples


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
Schemas are mandatory. It allows you to do automatic validation on save, and brings transparency to your code.

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

## Schema parameters

### required
Operation will be rejected if:

#### "required" it a type of boolean and target value is undefined
```js
schema: {
   _id: [],
   name: {
      required: true
   }
}
```
#### "required" it a type of function and returns something but undefined
```js
schema: {
   _id: [],
   name: {
      required: function(value) {
         if (value === "test") {
            return "SomeError";
         }
      }
   }
}
```
An exception can thrown as well

```js
schema: {
   _id: [],
   name: {
      required: function(value) {
         if (value === "test") {
            throw {
               status: 400,
               message: "AllBad"
            }
         }
      }
   }
}
```

#### "required" it a type of RegExp and the expression gives nothing or value is undefined
```js
schema: {
   _id: [],
   name: {
      required: /\d{4}/
   },
   other: {}
}
```

### ignore
Means that field is settable but will be ignored when saved
```js
schema: {
   _id: [],
   name: {
      ignore: true
   }
}
```

### unique
Applies to arrays only. Understands mongoids, models and strings
```js
schema: {
   _id: [],
   name: {
      unique: true
   }
}
```

### minLength
Checks the minimum length of a string. Will throw an error if any object but string is passed
```js
schema: {
   _id: [],
   name: {
      minLength: 20
   }
}
```

### maxLength
Checks the maximum length of a string. Will throw an error if any object but string is passed
```js
schema: {
   _id: [],
   name: {
      maxLength: 5
   }
}
```



## Set Attributes

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

You can use dot notation to get a particular object

```js
user.get('somedict.name')
user.get('somelist.0.name')
```

## Unset attribute

Use "unset" to remove attribute(s) from the database

```js
item.unset('name')
item.unset('email', 'pass')
item.unset('email', 'pass', ['other_field', 'something_else'])
```

You can pass arguments or lists (they will be flattened). You should call "save" to perform the operation.


## Queries

Find accepts native mongodb query.

```js
TestUser.find({name : "john"}).first().then(function(model) {
	model.attrs.name.should.be.equal("john")
	done();
}).catch(function(e) {
	logger.fatal(e.stack || e)
});
```

You can also use key and value as first and second arguments to fetch something using simple criterion.

```js
TestUser.find("name", "john")
```

You can use either first() or all() for performing mongodb request

### Find by id
IF you use find with 1 argument, wires-mongo assumes you want to find a record by id.
You can pass a string, model reference, or ObjectID accordingly  

```js
TestUser.find("559a508ce147b840c4986535")
TestUser.find(otherReference)
TestUser.find(ObjectID("559a508ce147b840c4986535"))
// is all the same
```

Makes a query:
```js
{ _id : "559a508ce147b840c4986535"}
```

(findById is deprecated)



## With/Join

It is possible to automatically fetch referenced items.
Let's say, we have a record Item, that has a reference "current_tag" that is a model "Tag"

```js
Item.find().with("current_tag", Tag).all()
```
Instead of getting ObjectId as a result, activerecord will collect all ids that need to be fetched, and will make one opmtimized query to retrieve items for you! The same applies to lists that have ObjectId within

```js
Item.find().with("tags", Tag)
```

See [with-query tests](wiresjs/wires-mongo/blob/master/test/with-query.js) for better understanding

### Required record

Record can automatically be reject if not found. Apply "required()" to your query
```js
Item.find({name : "test"}).required().then(function(){

}).catch(function(error){

});
```
if one of the "with" queries has a "required" parameter, entire promise will be rejected as well.

You can pass a custom message if needed

```js
Item.find({name : "test"}).required("This record is very important")
```

## Count

A simple query for count
```js
TestUser.find().count().then(function(num) {
   num.should.be.equal(2);
})
```

## Paginator
Items can be paginated. Wires-mongo uses https://www.npmjs.com/package/pagination module.
```js
Item.find().paginate({page: 1, perPage: 10, range : 10})
```
All defined options are optional.
Returns a promise, in fact an alternative for "all" request with a small difference - The output looks like this:

```js
{
  "paginator" : {},
  "items" : {}
}
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
### Default values

Add "defaults" key to your schema to set a default value.
Note, it will be set only when database request is performed.

```js
schema: {
		_id: [],
		name: {},
		published: {
			defaults: false
		}
	}
```

### Events on save

You can decorate saving with multiple methods. Add them to your  model
Triggered before create request:
```js
onBeforeCreate: function(resolve, reject) {
	resolve();
}
```

Triggered before update request:

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

You can also remove all found records. No instance required. However, we will create instance per found item and perform "remove" on it.

```js
new User().find({name : /test/}).removeAll();
```

## Cascade remove

Reference can be automatically removed. Add this property to a model

```js
cascade_remove: ['@exclude Blog.tags'],
```
Several directive can be applied

### @exclude
```js
cascade_remove: ['@exclude Blog.tags'],
```
Exludes id from the list (in the example it's "tags" from the Blog model

### @remove
```js
cascade_remove: ['@remove Blog.item'],
```

Searches for records that match Blog.item == self._id and removes them

### @nullify

```js
cascade_remove: ['@nullify Blog.someother_tag'],
```

Sets Blog.someother_tag to null

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



## Access helpers

### equals

You can compare to models by using "equals" method
Passing a string will automatically convert it to mongoid and compare it with the current _id
```js
record.equals("5555d4877be0283353c28467") // true
record.equals(sameRecords) // true
```

### inArray

Checks if current model is in an array. Understands array of strings, mondoIds and models
```js
record.inArray(["5555d4877be0283353c28467"]) // true
record.inArray([ObjectId])// true
record.inArray([record])// true
```

### filter
Allows you to filter your results before resolving the promise

```js
Item.find().filter(function() {
   return this.get('name') === "Item 1";
}).all().then(function(results) {
   results.length.should.be.equal(1)
   done();
})
```

### toJSON
When all() is called, list is being prototyped with $toJSON method, that will recursively serialize all objects
```js
Item.find().all().then(function(results) {
   results.$toJSON()
})
```

On top of of that each model has "toJSON" method
