var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')


describe('Validation test', function() {
   var Item = Model.extend({
      collection: "test_item_validation",
      schema: {
         _id: [],
         name: {
            minLength: 5,
            maxLength: 10
         },
         other: {}
      }
   })

   var Other = Model.extend({
      collection: "test_other_validation",
      schema: {
         _id: [],
         name: {
            minLength: 5,
            maxLength: 400
         },
         other: {}
      }
   })

   var Foo = Model.extend({
      collection: "test_foo_validation",
      schema: {
         _id: [],
         name: {
            matches: /\d{4}/
         },
         other: {}
      }
   })

   var record;
   var recordStringId;
   before(function(done) {
      new Item().drop().then(function() {
         done();
      })
   })

   it("Should not save if name is empty", function(done) {
      var item = new Item();
      item.save().then(function() {
         done("Should not save without a name")
      }).catch(function() {
         done();
      })
   })

   it("Should not save if name is less than 5", function(done) {
      var item = new Item({
         name: "hell"
      });
      item.save().then(function() {
         done("Still saved")
      }).catch(function(e) {
         e.message.should.equal("Field 'name' requires at least 5 symbols")
         done();
      })
   })

   it("Should save if name is 5 symbols", function(done) {
      var item = new Item({
         name: "hello"
      });
      item.save().then(function() {
         done()
      }).catch(function(e) {
         done("Should pass");
      })
   })

   it("Should not save if name is more than 10", function(done) {
      var item = new Item({
         name: "hello fucking world"
      });
      item.save().then(function() {
         done("Still saved")
      }).catch(function(e) {
         e.message.should.equal("Field 'name' cannot exceed 10 symbols (got 19)")
         done();
      })
   });

   it("Date should not pass", function(done) {
      var item = new Other({
         name: new Date()
      });
      item.save().then(function() {
         done("Still saved")
      }).catch(function(e) {
         e.status.should.be.equal(400);
         done();
      })
   });

   it("Regexp test with numbers", function(done) {
      var item = new Foo({
         name: 1
      });
      item.save().then(function() {
         done("Still saved")
      }).catch(function(e) {
         e.message.should.be.equal("Field 'name' should be a string")
         done();
      })
   });

   it("Regexp test with a string should fail (year allowed)", function(done) {
      var item = new Foo({
         name: "sdf"
      });
      item.save().then(function() {
         done("Still saved")
      }).catch(function(e) {
         e.message.should.be.equal("Field 'name' is invalid")
         done();
      })
   });

   it("Regexp test with a string should pass", function(done) {
      var item = new Foo({
         name: "1994"
      });
      item.save().then(function() {
         done()
      }).catch(function(e) {
         done(e);
      })
   });


});
