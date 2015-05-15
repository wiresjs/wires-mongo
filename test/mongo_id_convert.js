var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var _ = require('lodash');
var ObjectID = require('mongodb').ObjectID;

describe('Ensure string id will be converted to mongo id', function() {

	before(function(done) {
		var user = new TestUser();
		user.drop().then(function(data) {
			done();
		}).catch(function(e) {
			logger.fatal(e.stack || e)
		})
	})
	it('Should not convert string to object. Its just a string field', function(done) {
		var user = new TestUser({
			name: "ivan",
			just_string: "5555d4877be0283353c28467"
		});
		user.save().then(function(newuser) {
			newuser.get("just_string").should.be.an.instanceOf(String)
			done();
		}).catch(function(e) {
			done(e)
		});
	})

	it('Should convert mongo id string to mongo object', function(done) {
		var user = new TestUser({
			name: "ivan",
			model_reference: "5555d4877be0283353c28467"
		});
		user.save().then(function(newuser) {
			newuser.get("model_reference").should.be.an.instanceOf(ObjectID)
			done();
		}).catch(function(e) {
			done(e)
		});
	});

});