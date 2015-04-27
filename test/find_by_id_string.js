var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var _ = require('lodash');


describe('String ID to MongoDBid conversion', function() {

	var stringID;
	before(function(done) {
		var user = new TestUser();
		user.drop().then(function(data) {
			done();
		}).catch(function(e) {
			logger.fatal(e.stack || e)
		})
	})

	it('SHould create a test record', function(done) {
		var user = new TestUser({
			name: "test"
		});
		user.save().then(function(user) {
			stringID = user.attrs._id.toString();
			done();
		}).catch(function(e) {
			logger.fatal(e.stack || e)
		});
	});

	it('Ensure id is a string', function() {
		_.isString(stringID).should.be.equal(true);
	});

	it('Should find a record using findById', function(done) {

		var user = new TestUser()
		user.findById(stringID).then(function(user) {
			user.attrs.name.should.be.equal("test")
			done();
		}).catch(function(e) {
			logger.fatal(e.stack || e)
			done(e)
		})
	});

	it('Should find a record using find', function(done) {

		var user = new TestUser()
		user.find({
			_id: stringID
		}).first().then(function(user) {
			user.should.be.ok;
			user.attrs.name.should.be.equal("test")
			done();
		}).catch(function(e) {
			logger.fatal(e.stack || e)
		})
	});


});