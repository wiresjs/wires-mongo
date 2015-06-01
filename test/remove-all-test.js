var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")



describe('Remove All', function() {

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

	it('Checking current amount of data', function(done) {
		new TestUser().find().count().then(function(count) {
			count.should.be.equal(2);
			done();
		}).catch(function(e) {
			done(e)
		})
	});


	it('Removing all data', function(done) {

		TestUser.find().removeAll().then(function(data) {

			data.length.should.be.equal(2)
			done();
		}).catch(function(e) {
			console.log("Some error")
			done(e)
		})
	});

	it('Count should be zero after deletion', function(done) {
		new TestUser().find().count().then(function(count) {
			count.should.be.equal(0);
			done();
		});
	});

});
