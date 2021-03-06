var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')
var domain = require('wires-domain');

var ObjectID = require('mongodb').ObjectID;

describe('Equals test', function() {

	var Item = Model.extend({
		collection: "paginate_test",
		schema: {
			_id: [],
			name: {}
		}
	})

	var record;
	var recordStringId;
	var items = [];
	before(function(done) {
		new Item().drop().then(function() {
			for (var i = 1; i < 126; i++) {
				items.push({
					name: "Item " + i
				});
			}
			return domain.each(items, function(item) {
				return new Item(item).save()
			});

		}).then(function(item) {
			done()
		})
	});

	it("Should contain 125 records", function(done) {
		Item.find().count().then(function(count) {
			count.should.be.equal(125)
			done();
		})
	})

	it("Should give a different result structure and give 11 records on a page", function(done) {
		Item.find().paginate({
			page: 1,
			perPage: 11
		}).then(function(output) {
			output.paginator.should.be.ok;
			output.items.should.be.ok;
			output.items.length.should.be.equal(11)
			done();
		}).catch(function(e) {
			done(e)
		})
	})


	it("Should filter stuff", function(done) {
		Item.find().filter(function() {
			return this.get('name') === "Item 1";
		}).all().then(function(results) {
			results.length.should.be.equal(1)
			done();
		}).catch(function(e) {
			done(e)
		})
	})

	it("Should go to the second page", function(done) {

		Item.find().paginate({
			page: 2,
			perPage: 11,
		}).then(function(output) {
			var lastItem = output.items[10];

			lastItem.get("name").should.be.equal("Item 22")
			done();
		}).catch(function(e) {
			done(e)
		})
	})


});
