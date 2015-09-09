var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")

describe('Model db queries', function() {
	// it('Should give collection names', function(done) {
	// 	var user = new TestUser();
	// 	user.getCollectionNames().then(function(res) {
	// 		res.should.be.instanceof(Array)
	// 		done();
	// 	})
	// });

	it('Should drop database', function(done) {
		var user = new TestUser();
		user.drop().then(function(data) {
			done();
		}).catch(function(e) {
			done();
		})
	})

	it('Should find all user and return an empty array', function(done) {
		var user = new TestUser();
		user.find().all().then(function(results) {
			results.should.be.instanceof(Array).and.have.length(0)
			done();
		}).catch(function(e) {
			done(e);
		})

	})

	it('Should create a record', function(done) {
		var user = new TestUser({
			name: "ivan",
			email: "ivan@morrr.com",
			password: "123"
		});
		user.save().then(function(data) {
			user.attrs._id.should.be.ok;
			done();
		}).catch(function(e) {
			console.log("Failed");
			logger.fatal(e.stack || e)
		});
	})

	it('Should find a record', function(done) {
		var user = new TestUser();
		var a = 1;
		user.find("name", "ivan").first().then(function(model) {
			model.attrs.name.should.be.equal("ivan")
			done();
		}).catch(function(e) {
			logger.fatal(e.stack || e)
		});
	})

	it('Should find and update the record', function(done) {
		var user = new TestUser();
		var a = 1;
		user.find("name", "ivan").first().then(function(model) {

			model.set("name", "pekka");
			model.save().then(function(record) {
				record.attrs.name.should.be.equal("pekka");
				done();
			}).catch(function(e) {
				logger.fatal(e.stack || e)
			})

		}).catch(function(e) {
			logger.fatal(e.stack || e)
		});
	})

	it('Update should be rejected due to validate', function(done) {
		var user = new TestUser();
		var a = 1;
		user.find("name", "pekka").first().then(function(model) {
			model.set("name", "pukka");
			model.save(function() {
				done("Should not have saved the model")
				console.log("Saved .. something is wrong");
			}).catch(function(e) {
				e.error.should.be.ok;
				done()
			});
		}).catch(function(e) {
			logger.fatal(e.stack || e)
		});
	})

	it('Should get all records (we have only one) ', function(done) {
		var user = new TestUser();
		user.all().then(function(data) {
			data.should.be.instanceof(Array).and.have.length(1)
			var model = data[0];
			model.attrs.name.should.be.ok;
			model.attrs.email.should.be.ok;
			model.attrs.password.should.be.ok;
			done();
		}).catch(function(e) {
			logger.fatal(e.stack || e)
		})
	});

	it('Should get first record with a projection applied', function(done) {
		var user = new TestUser();

		user.projection("world").first().then(function(record) {
			record.should.be.ok;
			record.attrs.name.should.be.ok;
			record.attrs.email.should.be.ok;
			should.equal(record.attrs.password, undefined);
			done();
		}).catch(function(e) {
			logger.fatal(e.stack || e)
			done(e);
		})
	});

	it('Shoud fail on simple validateion', function(done) {
		var user = new TestUser();

		user.save().then(function() {
			done("Should not have saved it")
		}).catch(function(e) {
			done();
		})

	});

});
