var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')

var Item = Model.extend({
	collection: "test_items",
	schema: {
		_id: [],
		name: {},
		current_tag: {},
		tags: {},
		freestyle: {}

	}
})
var Tag = Model.extend({
	collection: "test_tags",
	schema: {
		_id: [],
		name: {}
	}
})


describe('With query', function() {

	var item1;
	var item2;
	var tag1;
	var tag2;
	var tag3;
	before(function(done) {
		new Item().drop().then(function() {
			return new Tag().drop()
		}).then(function() {
			return new Item({
				name: "test1"
			}).save();
		}).then(function(item) {
			item1 = item;
			return new Tag({
				name: "tag1"
			}).save();
		}).then(function(_tag1) {
			tag1 = _tag1;
			return new Tag({
				name: "tag2"
			}).save();
		}).then(function(_tag2) {
			tag2 = _tag2
			return new Item({
				name: "test2"
			}).save()
		}).then(function(_item2) {
			item2 = _item2;
			return new Tag({
				name: "tag3"
			}).save()
		}).then(function(_tag3) {
			tag3 = _tag3;
			done()
		});

	});

	it('One item and two tags should be defined', function() {
		item1.should.be.ok;
		tag1.should.be.ok;
		tag2.should.be.ok;
	});

	it('Saving should consider model and extract an ID when saving', function(done) {
		item1.attrs.current_tag = tag1;
		item1.attrs.tags = [tag1, tag2]
		item1.save().then(function() {
			item2.attrs.tags = [tag3]
			item2.save();
		}).then(function() {
			done()
		}).catch(function(e) {
			done(e)
		})

	});

	it('Simple "with" query', function(done) {

		new Item()
			.with("current_tag", Tag)
			.with("tags", Tag).sort("name", "asc").all().then(function(res) {

				// Checking first item
				res[0].attrs.tags[0].attrs.name.should.be.equal("tag1");
				res[0].attrs.tags[1].attrs.name.should.be.equal("tag2");
				res[0].attrs.current_tag.attrs.name.should.be.equal("tag1");
				// Checking second item
				res[1].attrs.tags[0].attrs.name.should.be.equal("tag3");

				done();
			}).catch(function(e) {
				done(e);
				logger.fatal(e.stack || e)
			})
	});

	it('Simple "with" with freestyle callback', function(done) {
		Item.with("freestyle", function() {
			return Tag.find().all()
		}).all().then(function(items) {
			items[0].get("freestyle").length.should.greaterThan(0)
			done()
		}).catch(function(e) {
			done(e)
		})
	});



});
