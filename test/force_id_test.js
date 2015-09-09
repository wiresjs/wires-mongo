var assert = require('assert');
var should = require('should');
var logger = require("log4js").getLogger("test");
var TestUser = require("./model.js");
var Model = require('../index');

describe('Force id test', function() {
   var Item = Model.extend({
      collection: "test_items_force_id",
      schema: {
         _id: [],
         name: {}
      }
   });

   var forceId = "5595269f6cd64ec0b7805ba2";
   var secondRecordId;
   before(function(done) {
      new Item().drop().then(function() {
         done();
      });
   });

   it("Should have forced id", function(done) {
      var item = new Item({
         name: "hello"
      });

      item.forceId(forceId);

      item.save().then(function(item) {
         item.equals(forceId).should.be.equal(true);
         done();
      }).catch(done);
   });

   it("Should not affect existing records", function(done) {

      Item.find({
         _id: forceId
      }).first().then(function(record) {
         record.set("_id", "556c571d1e1dd93c4e93c060");
         record.forceId("556c571d1e1dd93c4e93c060");
         record.set("name", "test");

         return record.save();
      }).then(function(record) {
         record.get("name").should.be.equal("test");
         record.equals(forceId).should.be.equal(true);
         done();
      }).catch(done);
   });

   it("Should have a different id", function(done) {
      var item = new Item({
         name: "Pekka"
      });
      item.save().then(function(newrecord) {
         newrecord.equals(forceId).should.equal(false);
         secondRecordId = newrecord.getStringId();
         done();
      }).catch(done);
   });

   it("Should find Pekka and validate previosly set id", function(done) {
      Item.find({
         name: "Pekka"
      }).first().then(function(pekka) {
         pekka.getStringId().should.equal(secondRecordId);
         done();
      }).catch(done);
   });

});
