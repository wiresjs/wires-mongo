var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')


describe('Default values', function() {


	var Item = Model.extend({
		collection: "test_items_default_test",
		schema: {
			_id: [],
			name: {},
			published: {
				defaults: false
			},
			date: {
				defaults: function() {
					return new Date();
				}
			}
		}
	})
	before(function(done) {
		new Item().drop().then(function() {
			done();
		})
	})



	it('Default value should be set', function(done) {
		new Item({
			name: "test"
		}).save().then(function(item) {
			item.attrs.published.should.be.equal(false);
			item.attrs.date.should.be.instanceof(Date)
			done()
		}).catch(function(e) {
			done(e);
		})
	});



});
