var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var _ = require('lodash');


describe('String ID to MongoDBid conversion', function() {

	var stringID;
	var mongoID;
	var testUser;
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
			testUser = user;
			mongoID = user.get("_id");
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

	it('Should find a record using "find" with string first argument', function(done) {

		TestUser.find(stringID).first().then(function(user) {
			user.attrs.name.should.be.equal("test")
			done();
		}).catch(done)
	});

	it('Should not apply search by id, if first argument is not a valid mongo id ', function(done) {
		try {
		 TestUser.find('some bullshi');
		 done("Should not be here");
	 } catch(e){
		 done();
	 }

	});

	it('Should find a record using "find" with mongoid first argument', function(done) {
		TestUser.find(mongoID).first().then(function(user) {
			user.attrs.name.should.be.equal("test")
			done();
		}).catch(done)
	});

	it('Should find a record using "find" with first argument (as model)', function(done) {
		TestUser.find(testUser).first().then(function(user) {
			user.attrs.name.should.be.equal("test")
			done();
		}).catch(done)
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
