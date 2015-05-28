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

	it('FInd all users should return 2 rows', function(done) {
		var user = new TestUser();
		user.find().all().then(function(res) {
			res.should.be.instanceof(Array).and.have.length(2)
			done();
		}).catch(function(e) {
			done(e);
		});
	});

	it('Count should return 2', function(done) {
		var user = new TestUser();
		user.find().count().then(function(num) {
			num.should.be.equal(2);
			done();
		}).catch(function(e) {
			done(e);
		})
	});



});
