var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')


describe('Required test', function() {
   var Item = Model.extend({
      collection: "test_items_required",
      schema: {
         _id: [],
         name: {},
         tag: {
            reference: true
         }
      }
   })

   var Tag = Model.extend({
      collection: "test_items_tag_required",
      schema: {
         _id: [],
         name: {}
      }
   })

   var record;
   var recordStringId;
   before(function(done) {
      var item, tag;
      Item.drop().then(function() {
         return Tag.drop();
      }).then(function() {
         return new Item({
            name: "hello"
         }).save()
      }).then(function(_item) {
         item = _item;
         var tag = new Tag({
            name: "test_tag"
         });
         return tag.save();
      }).then(function(tag) {
         //item.set("tag", tag);
         return item.save();
      }).then(function() {
         done();
      })
   })

   it("Should assert an error when record is not found", function(done) {
      Item.find({
            name: "not_present"
         }).required()
         .first().then(function(record) {
            done("Should not here");
         }).catch(function(error) {
            should.equal(error.status, 404);
            done();
         })
   })
   it("Should assert an error when record is not found (using with query)", function(done) {
      Item.find({
            name: "hello"
         }).with("tag", Tag.required("tag is required")).required()
         .first().then(function(record) {
            done("Should not be here");
         }).catch(function(error) {
            should.equal(error.message, "tag is required");
            done();
         })
   })


});
