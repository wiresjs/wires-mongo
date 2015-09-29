var assert = require('assert');
var should = require('should');
var Model = require('../index');
var domain = require("wires-domain");
var TestUser = require("./model.js");
var ObjectID = require('mongodb').ObjectID;

describe('Equals test', function() {

   var Item = Model.extend({
      collection: "test_items_index",
      schema: {
         _id: [],
         title: {},
         description: {}
      }
   });

   var record;
   before(function(done) {
      new Item().drop().then(function() {
         var data = [{
            title: "Danger of chocolate",
            description: "Has nothing to do"
         }, {
            title: "chocolate is a poison for dogs",
            description: "Don't give chocolate for dogs."
         }, {
            title: "Hello World",
            description: "This is test1"
         }, {
            title: "My title",
            description: "This is test2"
         }, {
            title: "My dog is eating chocolate",
            description: "Why does my dog eat chocolate?"
         }, {
            title: "Chocolate is dangerous for dogs",
            description: "Very dangerous!"
         }];

         domain.each(data, function(a) {
            return new Item(a).save();
         }).then(function() {
            done();
         }).catch(done);
      });
   });

   it("Should create an index", function(done) {
      Item.createIndex({
         title: "text",
         description: "text"
      }).then(function(result) {
         done();
      }).catch(done);
   });

   it("Should perform a search query", function(done) {

      Item.findByText("dogs and chocolate", {
         sort: true
      }).all().then(function(data) {
         data[0].get("title").should.equal("chocolate is a poison for dogs");
         done();
      });
   });
});
