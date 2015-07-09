var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')
var ObjectID = require('mongodb').ObjectID;

describe('In array', function() {

	var Item = Model.extend({
		collection: "test_items_in_array",
		schema: {
			_id: [],
			name: {},
			published: {
				defaults: false
			}
		}
	})

	var record;
	var someStringArray;
	var someMongoIDArray;
	var someModelArray;
	before(function(done) {
		new Item().drop().then(function() {
			return new Item({
				name: "equal_test_name"
			}).save()
		}).then(function(item) {
			record = item;
			someStringArray = [record.get("_id").toString()]
			someMongoIDArray = [record.get("_id")]
			someModelArray = [record]
			done();
		})
	})



	it('Record should be in a string array', function() {
		record.inArray(someStringArray).should.be.equal(true)
	});

	it('Record should be in a mondoDB array', function() {
		record.inArray(someMongoIDArray).should.be.equal(true)
	});

	it('Record should be in a model array', function() {
		record.inArray(someModelArray).should.be.equal(true)
	});

	it('Record should be in a strange array', function() {
		var Weirdo = function(){
			this.toString = function(){
				return record.get("_id").toString();
			}
		}
		var someWeiredArray = [new Weirdo()]
		record.inArray(someWeiredArray).should.be.equal(true)
	});



});
