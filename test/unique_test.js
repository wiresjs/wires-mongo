var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')


describe('Unset test', function() {
   var record1 = '559a51bee3c18f4dc41ae319';
   var record2 = '559a51bee3c18f4dc41ae349';

   var Tag = Model.extend({
      collection: "test_tags_unique",
      schema: {
         _id: [],
         name: {}
      }
   })

   var Item = Model.extend({
      collection: "test_unique",
      schema: {
         _id: [],
         name: {},
         tags: {
            reference: true,
            unique: true
         }
      }
   })

   var record;
   var recordStringId;
   var firstTag;
   before(function(done) {
      new Item().drop().then(function(item) {
         return Tag.drop()
      }).then(function() {
         var tag = new Tag({
            name: "123"
         });
         return tag.save();
      }).then(function(_tag) {
         firstTag = _tag;
         done();
      })
   })

   it("Should save only 1 item", function(done) {
      var item = new Item();
      item.set("tags", [record1, record1]);
      item.save().then(function() {
         item.get("tags").length.should.be.equal(1)
         done();
      })
   });

   it("Should save 2 different items", function(done) {
      var item = new Item();
      item.set("tags", [record1, record2]);
      item.save().then(function() {
         item.get("tags").length.should.be.equal(2)
         done();
      })
   });
   it("Should save 1 item (having 2 same models)", function(done) {
      var item = new Item();
      item.set("tags", [firstTag, firstTag]);
      item.save().then(function() {
         item.get("tags").length.should.be.equal(1)
         done();
      })
   });


});
