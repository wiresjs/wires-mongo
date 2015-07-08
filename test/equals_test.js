var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')
var ObjectID = require('mongodb').ObjectID;

describe('Equals test', function() {

	var Item = Model.extend({
		collection: "test_items_equals",
		schema: {
			_id: [],
			name: {},
			published: {
				defaults: false
			}
		}
	})

	var record;
	var recordStringId;
	var recordObjectId;
	before(function(done) {
		new Item().drop().then(function() {
			return new Item({
				name: "equal_test_name"
			}).save()
		}).then(function(item) {
			record = item;
			recordStringId = record.get("_id").toString();
			recordObjectId = record.get("_id");
			done();
		})
	})



	it('Record id should be ok', function() {
		record.get("_id").should.be.ok
		recordStringId.should.be.an.instanceof(String)
	});

	it('Compare with string', function() {
		record.equals(recordStringId).should.be.equal(true)
	});

	it('Compare with object id', function() {
		record.equals(recordObjectId).should.be.equal(true)
	});

	it('Compare with mongo id', function() {
		record.equals(ObjectID.createFromHexString(recordStringId)).should.be.equal(true)
	});

	it('Compare with a model after request', function(done) {
		Item.find({
			name: "equal_test_name"
		}).first().then(function(item) {
			record.equals(item).should.be.equal(true);
			done();
		})
	});

	it('Compare with weired object (has toString())', function() {
		var Weirdo = function() {
			this.toString = function() {
				return recordStringId
			}
		}
		record.equals(new Weirdo()).should.be.equal(true)
	});

});
