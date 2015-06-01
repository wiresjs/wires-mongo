var domain = require('wires-domain');
var Class = require('wires-class');
var _ = require('lodash');
var Promise = require("promise");
var logger = require("log4js").getLogger("model");
var ObjectID = require('mongodb').ObjectID;
var resolveall = require("resolveall")
var pagination = require("pagination");
var Model;


var convertStringToMongoId = function(value) {
	if (value.length === 24) {
		var validMongoId = new RegExp("^[0-9a-fA-F]{24}$");
		if (validMongoId.test(value)) {
			try {
				value = ObjectID.createFromHexString(value);
			} catch (e) {}
		}
	}
	return value;
}
var tryMongoId = function(value) {

	if (_.isString(value)) {
		value = convertStringToMongoId(value)
	}

	if (value instanceof Model) {
		if (value.get("_id")) {
			value = tryMongoId(value.get("_id").toString())
		}
	}
	if (_.isArray(value)) {
		_.each(value, function(item, index) {
			value[index] = tryMongoId(item)
		});
	}
	if (_.isPlainObject(value)) {
		_.each(value, function(v, k) {
			value[k] = tryMongoId(v)
		});
	}
	return value;
}



var ValidationBase = Class.extend({
	initialize: function() {},
	// Validates key and value
	// Now checks if attributes presents in schema
	// Needs to be extended later on
	_attrIsValid: function(k, v) {
		return this.schema[v] !== undefined;
	},
	_queryValue: function(key, value) {
		return tryMongoId(value);
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
		var rejectMessage;

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

	},
	onCascadeRemove: function(resolve, reject) {
		var self = this;
		var id = this.get('_id');

		if (this.cascade_remove) {

			domain.each(self.cascade_remove, function(path) {
				if (!_.isString(path)) {
					return reject({
						status: 500,
						message: "Wrong format detected, when using cascade_remove. Expected '@action Model.key'"
					})
				}
				var match = path.match(/^@(\w+)\s*(\w+)\.(\w+)$/);
				if (!match) {

					return reject({
						status: 500,
						message: "Cascade '" + path + "' does not conform the path rule - '@action Model.key'"
					})
				} else {
					var action = match[1];
					var model = match[2];
					var key = match[3];

					// Require model
					return domain.require(model, function(Instance) {

						// Excluding from an array
						if (action === "exclude") {
							var criteria = {}
							criteria[key] = {
								$in: [id]
							}
							return Instance.find(criteria).all().then(function(_records) {
								return domain.each(_records, function(record) {
									record.set(key, _.filter(record.get(key), function(item) {
										return item.toString() !== id.toString();
									}));
									return record.save();
								});
							});
						}
						// Remove record
						if (action === "remove") {
							var criteria = {}
							criteria[key] = id;
							return Instance.find(criteria).removeAll();
						}

						if (action === "nullify") {
							var criteria = {}
							criteria[key] = id;
							return Instance.find(criteria).all().then(function(_records) {

								return domain.each(_records, function(_record) {

									return _record.set(key, null).save();
								});
							})
						}
					})
				}
			}).then(function() {
				return resolve()
			}).catch(function() {
				return reject(e)
			})

		} else {
			return resolve();
		}
	},
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
		_.each(this.schema, function(options, k) {
			if (self.attrs[k] !== undefined && k != "_id") {


				// try model
				if (self.attrs[k] instanceof Model && self.attrs[k].get("_id")) {
					data[k] = self.attrs[k].get("_id")
				} else {
					// Check if it's a reference
					// And convert it to mongoid
					data[k] = options.reference ? tryMongoId(self.attrs[k]) : self.attrs[k]
				}

				// check for array
				if (_.isArray(self.attrs[k])) {
					var filteredArray = [];
					_.each(self.attrs[k], function(item) {
						if (item instanceof Model && item.get("_id")) {
							filteredArray.push(item.get("_id"))
						} else {
							filteredArray.push(item);
						}
					});
					data[k] = filteredArray;
				}

			} else {
				if (options.defaults !== undefined) {
					data[k] = options.defaults;
				}
			}
		}, this);
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
			if (_.isPlainObject(arguments[0])) {
				var query = tryMongoId(arguments[0])
				this._reqParams.query = _.merge(this._reqParams.query, query)
			}
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
	paginate: function(opts) {
		var self = this;
		var opts = opts || {};
		return new Promise(function(resolve, reject) {

			var perPage = self._getValidNumber(opts.perPage) || 10;
			var page = self._getValidNumber(opts.page) || 1;
			var range = self._getValidNumber(opts.range) || 10

			return self.count().then(function(count) {

				// Modifying the query
				self.skip((page - 1) * perPage);
				self.limit(perPage)
				return count;
			}).then(function(count) {

				var paginator = pagination.create('search', {
					prelink: '/',
					current: page,
					rowsPerPage: perPage,
					pageLinks: range,
					totalResult: count
				});
				return self.all().then(function(models) {
					var output = {
						paginator: paginator.getPaginationData(),
						items: models
					}
					return resolve(output);
				})
			}).catch(function(e) {
				return reject(e);
			})
		});
	},
	// Dropping database
	drop: function() {
		var collectionName = this.collectionName;
		var self = this;
		return new Promise(function(resolve, reject) {
			domain.require(function($db) {
				$db.collection(collectionName).drop(function(err, success) {
					return resolve(success);
				})
			}).catch(reject);

		})
	},
	// Saves data
	// Should check for _id. If it is there, then it's and update
	// if not - insert
	save: function() {
		var self = this;

		var isNewRecord = !this.attrs._id;
		var self = this;


		return resolveall.chain([
			this._validate,
			// this variable is bound for easy operations within
			this.onBeforeSave,
			// If it's a new record resolving onBeforeCreate
			isNewRecord ? this.onBeforeCreate : this.onBeforeUpdate
		], this).then(function(res) {
			var doc = self.toDatabase();
			return new Promise(function(resolve, reject) {
				domain.require(function($db) {
					if (isNewRecord) {
						$db.collection(self.collectionName).insert(doc, {
							new: 1
						}, function(err, records) {
							if (err) {
								return reject(err);
							}
							self.set(records[0]);
							return resolve(self)
						});
					} else {
						$db.collection(self.collectionName).findAndModify({
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
				})
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

		return resolveall.chain([
			this.onBeforeRemove,
			this.onCascadeRemove,
			function(resolve, reject) {
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
			},
			this.onAfterRemove
		], this);
	},
	// Removes all records
	removeAll: function() {


		return this.all().then(function(items) {

			return domain.each(items, function(item) {

				return item.remove();
			});
		});
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
				if (process.env.DEBUG) {
					logger.info("QUERY FROM " + collectionName + " ->\n" + JSON.stringify(self._reqParams.query, 2, 2));
				}
				$db.collection(collectionName)
					.find(self._reqParams.query, self._reqParams.projectionArray || {}, self._reqParams.options, function(err,
						cursor) {
						if (err) {
							return reject(err);
						}
						return resolve(cursor);
					});

			}).catch(reject);
		});
	},
	resolveWithRequest: function(resolve, reject) {
		var self = this.self;
		var opts = this.opts;
		var models = opts.models;
		// Check if it's not a model
		// The only way for now is to check if it has _wires_mongo_model preffix
		if (!opts.target._wires_mongo_model) {
			// If it's just a funcion setting results right here

			if (_.isFunction(opts.target)) {
				return domain.each(models, function(model) {
					var result = opts.target.bind(model)();
					if (result instanceof Promise) {
						return result.then(function(objects) {
							model.set(opts.field, objects)
						})
					}
				}).then(function() {
					return resolve()
				}).catch(reject)
			}
		} else {
			// If actually model was passed
			opts.target.find({
				_id: {
					$in: opts.ids
				}
			}).mergeRequestParams(opts.target._reqParams).all().then(function(results) {
				var map = {};
				_.each(results, function(model) {
					map[model.get("_id")] = model;
				});
				return resolve({
					field: opts.field,
					map: map
				})
			}).catch(reject);
		}
	},
	// Bind models to fields
	// Understand and array of mongoid's
	_bindReferences: function(models, results) {

		_.each(models, function(item, a) {

			_.each(results, function(data) {
				// Data can be null (in case of freestle callback)
				if (data) {
					var targetField = item.attrs[data.field]
					if (targetField instanceof ObjectID) {
						if (data.map[targetField.toString()]) {
							// Setting a one2one records here
							item.attrs[data.field] = data.map[targetField.toString()]
						}
					}
					if (_.isArray(targetField)) {
						var modelsArray = [];
						_.each(targetField, function(mongoID) {
							if (data.map[mongoID.toString()]) {
								// Setting a one2one records here
								modelsArray.push(data.map[mongoID.toString()]);
							}
						});
						item.attrs[data.field] = modelsArray;
					}
				}
			});
		});
	},
	_extractIdsFromReferences: function(models) {
		var ids = {};
		var self = this;
		_.each(models, function(item) {
			// APpend only valid ids

			_.each(self._reqParams.with, function(target, field) {
				if (!ids[field]) {
					ids[field] = [];
				}
				if (item.attrs[field] instanceof ObjectID) {
					ids[field].push(item.attrs[field])
				}
				// Check for arrays
				if (_.isArray(item.attrs[field])) {
					_.each(item.attrs[field], function(possibleID) {
						if (possibleID instanceof ObjectID) {
							ids[field].push(possibleID);
						}
					});
				}
			});
		});
		return ids;
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
					//return self.resolveWithStatements(models, resolve, reject);
				});
			}).catch(reject);
		}).then(function(models) {

			// Resolving with statements
			return new Promise(function(resolve, reject) {
				if (Object.keys(self._reqParams.with).length === 0) {
					return resolve(models);
				}
				var ids = self._extractIdsFromReferences(models)
					// Creating functions to be resolved
				var toResolve = [];
				_.each(ids, function(withIds, key) {
					var filteredString = {}
					var filtered = [];
					// manual filter.. lodash does not do it's job .. ()
					_.each(withIds, function(curID) {
						var stringID = curID.toString();
						if (!filteredString[stringID]) {
							filteredString[stringID] = curID
							filtered.push(curID)
						}
					});
					toResolve.push(self.resolveWithRequest.bind({
						self: self,
						opts: {
							field: key,
							ids: filtered,
							models: models,
							target: self._reqParams.with[key]
						}
					}))
				});
				resolveall.chain(toResolve).then(function(results) {
					self._bindReferences(models, results);
					return resolve(models)

				}).catch(reject);
			});
		});
	}
});

var AccessHelpers = DBRequest.extend({
	// Comparers either id of a model this the current model's id
	equals: function(target) {
		if (!this.attrs._id)
			return false;
		var id;
		if (_.isString(target)) {
			id = tryMongoId(target);
		}
		if (target instanceof Model) {
			id = target.get("_id");
		}

		if (target instanceof ObjectID) {
			id = target
		}
		// Id is not valid
		if (!id)
			return false;


		return id.toString() === this.get("_id").toString();
	},
	// Gives true or false depending on presence in a target array of objects
	inArray: function(arr) {
		if (!_.isArray(arr))
			return false;
		if (!this.attrs._id)
			return false;
		var _inArray = false;
		_.each(arr, function(item) {
			var id;
			if (_.isString(item)) {
				id = tryMongoId(item);
			}
			if (item instanceof Model) {
				id = item.get("_id");
			}
			if (item instanceof ObjectID) {
				id = item;
			}

			if (id && id.toString() === this.attrs._id.toString()) {
				return _inArray = true;
			}
		}, this);
		return _inArray;
	}
});

module.exports = Model = AccessHelpers.extend({
	initialize: function(data) {

		// All user values are here
		this.attrs = {}
		this.schema = this.constructor.prototype.schema;
		this.collectionName = this.constructor.prototype.collection || null;

		this._reqParams = {
			query: {},
			options: {},
			with: {},
		}
		if (!this.schema) {
			throw {
				message: "Can't construct a model without schema"
			}
		}

		this.remove = _.bind(this.remove, this);

		// Allowing nice access point for wrappers
		if (data && _.isFunction(data['getAttributes'])) {
			this.set(data.getAttributes());
		} else {
			// Validate first parameter
			if (_.isPlainObject(data)) {
				this.set(data); // Setting user values to attribute
			}
		}
	},
	newInstance: function(args) {
		var Parent = this.constructor();
		return new Parent(args);
	},
	mergeRequestParams: function(data) {
		if (_.isPlainObject(data)) {
			this._reqParams = _.merge(this._reqParams, data);
		}
		return this;
	},
	onAttributeSet: function(key, value) {
		return value;
	},
	_setAttribute: function(k, v) {
		if (this._attrIsValid(k, k)) {
			this.attrs[k] = this.onAttributeSet(k, v);
		}
	},
	with: function(field, model) {
		this._reqParams.with[field] = model;
		return this;
	},
	getStringId: function() {
		if (this.attrs._id) {
			return this.attrs._id.toString();
		}
		return "";
	},
	// Can use dot notations
	get: function(key) {
		if (key && key.indexOf(".") > -1) {
			var value = this.attrs;
			var path = key.split("\.");
			_.each(path, function(k) {
				if (value[k] !== undefined) {
					if (value[k] instanceof Model) {
						value = value[k].attrs;
					} else {
						value = value[k];
					}
				} else {
					value = undefined
					return false;

				}
			});
			return value;
		}

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
}, {
	_wires_mongo_model: true,
	with: function() {
		var instance = new this();
		return instance.with.apply(instance, arguments)
	},
	find: function() {
		var instance = new this();
		return instance.find.apply(instance, arguments)
	},
	drop: function() {
		var instance = new this();
		return instance.drop.apply(instance, arguments)
	},
	findById: function() {
		var instance = new this();
		return instance.findById.apply(instance, arguments)
	}
});
