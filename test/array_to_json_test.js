var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')


describe('Unset test', function() {
   var record1 = '559a51bee3c18f4dc41ae319';
   var record2 = '559a51bee3c18f4dc41ae349';

   var Tag = Model.extend({
      collection: "test_tag_array_to_json",
      schema: {
         _id: [],
         name: {}
      }
   })

   var Item = Model.extend({
      collection: "test_item_array_to_json",
      schema: {
         _id: [],
         name: {},
         tag: {
            reference: true
         },
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


   it("Should  create records", function(done) {
      var item = new Item();
      item.set("tags", [firstTag]);
      item.set("tag", firstTag)
      item.save().then(function() {
         record = item;
         done();
      })
   });

   it("Should jsontify with the reference item", function(done) {
      Item.find().with("tag", Tag).all().then(function(items) {
         items[0].toJSON().tag.name.should.be.equal("123")
         done();
      }).catch(done)
   });

   it("Should jsontify with nested array", function(done) {
      Item.find().with("tags", Tag).all().then(function(items) {
         items.$toJSON()[0].tags[0].name.should.be.equal("123");
         done();
      }).catch(done)
   });


});
