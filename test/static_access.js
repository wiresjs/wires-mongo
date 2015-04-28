var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')


describe('Models Static Access', function() {


	var Item = Model.extend({
		collection: "test_items_default_test",
		schema: {
			_id: [],
			name: {},
			published: {
				defaults: false
			}
		}
	})
	before(function(done) {
		Item.drop().then(function() {
			done();
		})
	})



	it('Should have find', function(done) {
		Item.find().all().then(function(res) {
			done();
		})
	});

	it('Should have findById', function(done) {
		Item.findById(1).then(function(res) {
			done();
		})
	});



});