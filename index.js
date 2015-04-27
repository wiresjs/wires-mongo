var domain = require('wires-domain');
var Class = require('wires-class');
var _ = require('lodash');
var Promise = require("promise");
var logger = require("log4js").getLogger("model");
var ObjectID = require('mongodb').ObjectID;
var Model;


var ValidationBase = Class.extend({
	initialize: function() {},
	// Validates key and value
	// Now checks if attributes presents in schema
	// Needs to be extended later on
	_attrIsValid: function(k, v) {
		return this.schema[v] !== undefined;
	},
	_queryValue: function(key, value) {
		if (key && key.indexOf("id") > -1) {
			if (_.isString(value)) {
				try {
					value = ObjectID.createFromHexString(value);
				} catch (e) {}
			}
		}
		return value;
	},
	_getValidNumber: function(input) {
		if (_.isString(input)) {
			if (input.match(/\d{1,}/)) {
				return parseInt(input)
			}
		}
		if (_.isNumber(input)) {
			return input;
		}
	},
	_validate: function(resolve, reject) {
		var self = this;
		var data = {};
		for (var key in this.schema) {
			var params = this.schema[key];
			if (_.isPlainObject(params)) {
				var required = params.required;
				if (_.isBoolean(required)) {
					if (required === true && self.attrs[key] === undefined) {
						return reject({
							status: 400,
							message: "Field '" + key + "' is required"
						})
					}
				}
			}
		}
		return resolve();
	}
})
var EventBase = ValidationBase.extend({
	initialize: function() {},
	// Triggers each time key is set
	onAttributeSet: function(key, value) {
		return value;
	},
	onBeforeCreate: function(resolve, reject) {
		resolve();
	},
	onBeforeUpdate: function(resolve, reject) {
		resolve();
	},
	onBeforeSave: function(resolve, reject) {
		resolve();
	},
	onBeforeRemove: function(resolve, reject) {
		resolve();
	},
	onAfterRemove: function(resolve, reject) {
		resolve();
	},
	onCreateSuccess: function() {

	}
});

/**
 * Projections
 * 
 '''js 
 projections: {
	user: ["name", "email", {
		images: {
			$slice: -5
		}
	}],
	others: {
		exclude: ["name", "email"],
	}
}
'''
 * Sets defined projections.
 * user.projection("others");
 * 
 */
var ProjectionBase = EventBase.extend({
	initialize: function() {},
	toDatabase: function() {
		var self = this;
		var data = {};
		_.each(this.schema, function(v, k) {
			if (self.attrs[k] !== undefined && k != "_id") {
				data[k] = self.attrs[k]
			}
		});
		return data;
	},
	// Sets appropriate projection
	projection: function(name) {

		var projections = this.constructor.prototype.projections || {};

		var projection = projections[name];
		if (!projection)
			return this;

		var data = {};
		if (_.isArray(projection)) {
			_.each(projection, function(item) {
				if (_.isString(item)) {
					data[item] = 1;
				}
				if (_.isPlainObject(item)) {
					_.each(item, function(v, k) {
						data[k] = v;
					});
				}
			});
		}
		if (_.isPlainObject(projection)) {
			_.each(projection, function(v, k) {
				if (k === "exclude" && _.isArray(v)) {
					_.each(v, function(fieldExcluded) {
						data[fieldExcluded] = 0;
					});
				} else {
					data[k] = v;
				}
			});
		}
		this._reqParams.projectionArray = data;
		return this;
	}
});



var Query = ProjectionBase.extend({
	initialize: function() {},

	// Finds data
	// Defines criterion based on 2 (key, value) or 1 arguments
	// Should a proper mongo query
	find: function() {

		if (arguments.length === 2) {
			this._reqParams.query[arguments[0]] = this._queryValue(arguments[0], arguments[1]);
		} else {
			var filteredCriteria = {}
			_.each(arguments[0], function(value, key) {
				filteredCriteria[key] = this._queryValue(key, value)
			}, this);
			this._reqParams.query = _.merge(this._reqParams.query, filteredCriteria)
		}
		return this;
	},
	// Finds by id
	findById: function(id) {
		this.find("_id", id);
		return this.first();
	},
	// Sorting can be acieved with option parameter sort which takes an array of sort preferences
	// [['field1','asc'], ['field2','desc']]
	sort: function(sort, direction) {
		this._reqParams.options.sort = this._reqParams.options.sort || [];
		this._reqParams.options.sort.push([sort, direction || "asc"]);
		return this;
	},
	// Sets number to option using key
	// For example this.options.skip = 0
	_setNumberValueToOption: function(key, number) {
		var num;
		if ((num = this._getValidNumber(number)) !== undefined) {
			this._reqParams.options[key] = num
		} else {
			delete this._reqParams.options[key];
		}
		return this;
	},
	// Offset
	skip: function(number) {
		return this._setNumberValueToOption("skip", number);
	},
	// limit
	limit: function(number) {
		return this._setNumberValueToOption("limit", number);
	}
})

var DBRequest = Query.extend({
	initialize: function() {},

	// Returns collection names
	// Strips out database name and return 
	getCollectionNames: function() {
		return new Promise(function(resolve, reject) {
			domain.require(function($db) {
				$db.collectionNames(function(err, data) {
					var res = [];
					if (err) {
						reject(err);
					} else {
						_.each(data, function(item) {
							var i = item.name.split("\.");
							if (i.length > 0) {
								res.push(i[1]);
							}
						});
						resolve(res);
					}
				});
			}).catch(reject);
		});
	},
	// Dropping database
	drop: function() {
		var collectionName = this.collectionName;
		var self = this;
		return new Promise(function(resolve, reject) {
			self.getCollectionNames(function(collections) {
				if (_.indexOf(collections, collectionName) > -1) {
					return collections;
				} else {
					resolve(true);
				}
			}).catch(reject).then(function(collections) {
				if (!collections)
					return;
				domain.require(function($db) {
					$db.collection(collectionName).drop(function(err, success) {
						if (err) {
							return reject(err);
						}
						wasDropped = true;
						return resolve(success);
					})
				}).catch(reject);
			})
		})
	},
	// Saves data
	// Should check for _id. If it is there, then it's and update
	// if not - insert
	save: function() {
		var self = this;

		var isNewRecord = !this.attrs._id;
		var self = this;


		return Promise.all([
			// Before saving
			// 
			new Promise(this._validate.bind(this)),

			// this variable is bound for easy operations within
			new Promise(this.onBeforeSave.bind(this)),
			// If it's a new record resolving onBeforeCreate
			isNewRecord ? new Promise(this.onBeforeCreate.bind(this)) :
			// In any other case it's onBeforeUpdate
			new Promise(this.onBeforeUpdate.bind(this)),

			// Require database
			domain.require(function($db) {
				return $db
			})
		]).then(function(res) {
			var db = res[3];
			var doc = self.toDatabase();
			return new Promise(function(resolve, reject) {

				if (isNewRecord) {
					db.collection(self.collectionName).insert(doc, {
						new: 1
					}, function(err, records) {
						if (err) {
							return reject(err);
						}
						self.set(records[0]);
						return resolve(self)
					});
				} else {
					db.collection(self.collectionName).findAndModify({
						_id: self.attrs._id
					}, [], {
						$set: doc
					}, {
						new: 1
					}, function(e, doc) {
						if (e) {
							return reject(e)
						}
						self.set(doc);
						return resolve(self);
					});
				}
			});
		})
	},
	// Gets all records
	all: function() {
		return this.dbRequest();
	},
	// Gets the first one
	first: function() {
		var self = this;
		return new Promise(function(resolve, reject) {
			self.limit(1).dbRequest().then(function(data) {
				return resolve(data.length > 0 ? data[0] : null);
			}).catch(reject);
		});
	},
	remove: function() {
		var collectionName = this.collectionName;
		var self = this;
		var currentId = self.attrs._id;

		return Promise.all([
			new Promise(this.onBeforeRemove.bind(this)),
			new Promise(function(resolve, reject) {
				if (!currentId)
					return reject("Error in collection " + collectionName + ". ID is required in remove operation")
				domain.require(function($db) {
					$db.collection(collectionName).remove({
						_id: self._queryValue("_id", currentId)
					}, {}, function(e, result) {
						if (e) {
							return reject(e);
						}
						return resolve(result);
					});
				}).catch(reject);
			}),
			new Promise(this.onAfterRemove.bind(this))
		]);
	},
	count: function() {
		var self = this;
		return new Promise(function(resolve, reject) {
			self._getQueryCursor().then(function(cursor) {
				cursor.count(false, function(err, n) {
					if (err) {
						return reject(err);
					}
					return resolve(n);
				});
			}).catch(reject);
		});
	},
	_getQueryCursor: function() {
		var collectionName = this.collectionName;
		var self = this;
		return new Promise(function(resolve, reject) {
			domain.require(function($db) {
				$db.collection(collectionName)
					.find(self._reqParams.query, self._reqParams.projectionArray || {}, self._reqParams.options, function(err, cursor) {
						if (err) {
							return reject(err);
						}
						return resolve(cursor);
					});

			}).catch(reject);
		});
	},
	dbRequest: function(cb) {
		var self = this;
		var Parent = this.constructor;
		return new Promise(function(resolve, reject) {
			self._getQueryCursor().then(function(cursor) {
				cursor.toArray(function(e, docs) {
					if (e) {
						return reject(e);
					}
					var models = [];
					_.each(docs, function(item) {
						models.push(new Parent(item));
					});

					return resolve(models);
				});
			}).catch(reject);
		});
	}
});

module.exports = Model = DBRequest.extend({
	initialize: function(data) {

		// All user values are here
		this.attrs = {}
		this.schema = this.constructor.prototype.schema;
		this.collectionName = this.constructor.prototype.collection || null;

		this._reqParams = {
			query: {},
			options: {}
		}
		if (!this.schema) {
			throw {
				message: "Can't construct a model without schema"
			}
		}
		// Validate first parameter
		if (_.isPlainObject(data)) {
			this.set(data); // Setting user values to attribute
		}
	},
	_setAttribute: function(k, v) {
		if (this._attrIsValid(k, k)) {
			this.attrs[k] = this.onAttributeSet(k, v);
		}
	},
	get: function(key) {
		return this.attrs[key];
	},
	// Attaches values
	set: function(key, value) {
		if (_.isObject(key)) {
			var self = this;
			_.each(key, function(modelValue, modelKey) {
				self._setAttribute(modelKey, modelValue);
			});
		} else {
			this._setAttribute(key, value);
		}
		return this;
	},
	toJSON: function() {
		var schema = this.schema;
		var self = this;
		var values = {};
		var self = this;
		_.each(schema, function(params, name) {
			if (!params.hidden) {
				values[name] = self.attrs[name];
			}
		})
		return values;
	}
});