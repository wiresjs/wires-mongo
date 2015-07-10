var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var _ = require('lodash');
var ObjectID = require('mongodb').ObjectID;
var Model = require('../index')
var domain = require("wires-domain")
describe('Ensure string id will be converted to mongo id', function() {


	var FooBar = Model.extend({
      collection: "test_mongo_id_convert_foo_bar",
      schema: {
         _id: [],
         name: {
         }
      }
   })


	before(function(done) {
		var user = new TestUser();
		user.drop().then(FooBar.drop()).then(function(){
			var records = [ {name : "bar"}, {name : "foo"}, {name : "test"}, {name : "pukka"} ];
			domain.each(records, function(item){
				return new FooBar(item).save();
			}).then(function(){
				done();
			})

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
	it('Should go deep into an object and convert STRING', function() {
		var user = new TestUser();
		user.find({
			$and: [{
				"items": {
					$in: ["5555d4877be0283353c28467"]
				}
			}]
		});

		var inData = user._reqParams.query['$and'][0]['items']['$in'];
		inData[0].should.be.an.instanceOf(ObjectID)
	})


	it('Should go deep into an object and convert MODELS', function(done) {

		var john = new TestUser({
			name: "john",
			just_string: "5555d4877be0283353c28467"
		});
		john.save().then(function(john) {
			var user = new TestUser();
			user.find({
				$and: [{
					"items": {
						$in: [john]
					}
				}]
			});

			var inData = user._reqParams.query['$and'][0]['items']['$in'];
			inData[0].should.be.an.instanceOf(ObjectID)
			done();
		})



	})


	it('Should convert simple find\'s ids to mondoID', function() {
		var user = new TestUser();
		user.find({
			"items": {
				$in: ["5555d4877be0283353c28467"]
			}
		});
		var inData = user._reqParams.query['items']['$in'];
		inData[0].should.be.an.instanceOf(ObjectID)

	})


	it('Should convert array or string', function(done) {
		var user = new TestUser({
			name: "ivan",
			model_reference: ["5555d4877be0283353c28467", "1555d4877be0283353c28467"]
		});
		user.save().then(function(newuser) {
			var data = newuser.get("model_reference");
			for (var item in data) {
				var value = data[item];
				value.should.be.an.instanceOf(ObjectID)
			}

			done();
		}).catch(function(e) {
			done(e)
		});
	});

	it('Should find by RegExp', function() {
		//helloworld
		FooBar.find({name : /fo/}).first().then(function(record){
			record.should.be.ok;
			record.get("name").should.equal("foo");
			done();
		}).catch(function(e){
			done(e)
		})
	})

	it('Should find by RegExp (test)', function() {
		//helloworld
		FooBar.find({name : /te/}).first().then(function(record){
			record.should.be.ok;
			record.get("name").should.equal("test");
			done();
		}).catch(function(e){
			done(e)
		})
	})

	it('Should not find by RegExp', function() {
		//helloworld
		FooBar.find({name : /bajak/}).first().then(function(record){
			done("Should not find");
		}).catch(function(e){
			done()
		})
	})

});
