var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')


describe('Unset test', function() {
   var Item = Model.extend({
      collection: "test_items_unset",
      schema: {
         _id: [],
         name: {},
         other: {}
      }
   })

   var record;
   var recordStringId;
   before(function(done) {
      new Item().drop().then(function() {
         return new Item({
            name: "hello",
            other: "world"
         }).save()
      }).then(function(item) {
         done();
      })
   })

   it("Should have 'other' field", function(done) {
      Item.find().first().then(function(item) {
         item.get("other").should.be.equal("world");
         done();
      }).catch(done)
   });
   it("Should unset a field", function(done) {
      Item.find().first().then(function(item) {
         item.unset("other")
         return item.save().then(function() {
            done();
         })
      }).catch(done)
   })

   it("'Other' field should not be there", function(done) {
      Item.find().first().then(function(item) {

         should.equal(item.get("other"), undefined);
         done();
      }).catch(done)
   })


});
