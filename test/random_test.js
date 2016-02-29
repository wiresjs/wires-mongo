var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')
var domain = require('wires-domain');
var _ = require('lodash')
var ObjectID = require('mongodb').ObjectID;

describe('Random test', function() {

   var Item = Model.extend({
      collection: "random_test",
      schema: {
         _id: [],
         name: {}
      }
   })

   var record;
   var recordStringId;
   var items = [];
   before(function(done) {
      new Item().drop().then(function() {
         for (var i = 1; i < 11; i++) {
            items.push({
               name: "Item " + i
            });

         }
         return domain.each(items, function(item) {
            return new Item(item).save()
         });

      }).then(function(item) {
         done()
      })
   });

   it("Should contain 10 records", function(done) {
      Item.find().count().then(function(count) {
         count.should.be.equal(10)
         done();
      })
   });

   it("Should give any record", function(done) {
      var iterations = [];
      for (var i = 0; i <= 50; i++) {
         iterations.push({
            i: i
         });
      }
      return domain.each(iterations, function() {
         return Item.find().firstRandom();
      }).then(function(data) {
         var hasTitle = false;
         _.each(data, function(item) {
            if (!item || !item.get('name')) {
               return done("Something is wrong with random")
            }
         });
         done();
      }).catch(done)

   });

});
