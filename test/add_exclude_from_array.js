var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")

var TestUser = require("./model.js")
var Model = require('../index')
var helper = require("./helper")

describe('Remove and Add from array', function() {
   var Item = Model.extend({
      collection: "test_items_array",
      schema: {
         _id: {},
         tags: {
            reference : true
         }
      },
      onAddToTags : function(target){

      },
      onExcludeFromTags : function(tag){
         return new Promise(function(resolve, reject){
            setTimeout(function(){
               return resolve({ yes : true})
            },50)
         })
      }
   })

   var Item2 = Model.extend({
      collection: "test_items_array2",
      schema: {
         _id: {},
         tags: {
            reference : true
         }
      }
   })

   var Tag = Model.extend({
      collection: "test_items_tag_array",
      schema: {
         _id: {},
         name : {}
      }
   })

   var tag1, tag2, item2;
   before(function(done) {
      helper.drop(Item, Tag).then(function(){

         return helper.add(Tag, [ { name : "hello1"}, { name : "hello2"}] ).then(function(tags){

            tag1 = tags[0];
            tag2 = tags[1]
         });
      }).then(function(){
         done();
      }).catch(function(){
         done(e)
      })

   })

   it("Should add to array", function(done) {
      var item = new Item();
      item.add([tag1, tag2], "tags").then(function(){
         item.save().then(function(item){
             item.get("tags").should.have.length(2)
             done()
         }).catch(function(e){
               done(e)
         })
      }).catch(function(e){
         done(e)
      })


   });

   it("Should exclude from an array", function(done) {
      Item.find().with('tags', Tag).first().then(function(item){

         item.exclude(tag1, "tags").then(function(array){
            tag1.inArray(array).should.be.equal(false)
            item.save().then(function(){
            
                  done();
            })

         });
      }).catch(function(e){
         done(e)
      })
   });

   it("Should add to array without a handler defined", function(done) {
      var item = new Item2();
      item.add(tag1, "tags").then(function(array){
         tag1.inArray(array).should.be.equal(true)
         item.save().then(function(_item2){
            item2 = _item2;
            done();
         })

      }).catch(function(e){
         done(e)
      })

   });

   it("Should remove from an array without a handler defined", function(done) {
      item2.get("tags").should.have.length(1)
      item2.exclude(tag1, "tags").then(function(tags){
         tags.should.have.length(0)
         done();
      }).catch(function(e){
         done(e)
      })

   });



});
