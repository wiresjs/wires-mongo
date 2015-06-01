var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")



describe('Removing should be okay', function() {

	var user1;
	var user2;
	before(function(done) {
		var user = new TestUser();
		user.drop().then(function(data) {}).catch(function(e) {
			logger.fatal(e.stack || e)
		}).then(function() {

			var u1 = new TestUser({
				name: "ivan"
			});
			var u2 = new TestUser({
				name: "pekka"
			});
			u1.save().then(function(u1) {
				user1 = u1;
			}).then(function() {
				return u2.save()
			}).then(function(u2) {
				user2 = u2;
				done();
			}).catch(function(e) {
				logger.fatal(e.stack || e)
			});
		})
	});

	it('Users should be defined', function() {
		user1.should.be.ok;
		user2.should.be.ok;
	});

	it('Find user using criterion and remove it after', function(done) {
		var user = new TestUser();
		user.find({
			name: "ivan"
		}).first().then(function(ivan) {
			ivan.should.be.ok;
			return ivan.remove();
		}).then(function(response) {
			response[2].should.be.equal(1);
			done();
		}).catch(function(e) {

			done(e);
		})
	});



});
