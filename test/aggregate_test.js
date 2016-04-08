var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')
var domain = require('wires-domain');
var _ = require('lodash')
var ObjectID = require('mongodb').ObjectID;

describe('Aggregate TEst', function() {

   var Item = Model.extend({
      collection: "aggregate_test",
      schema: {
         _id: [],
         name: {},
         status: {}
      }
   })

   var record;
   var recordStringId;
   var items = [];
   before(function(done) {
      new Item().drop().then(function() {
         for (var i = 1; i <= 100; i++) {
            var name = i < 50 ? "Item50" : "Item100"
            items.push({
               name: name,
               status: i % 2 === 0 ? "A" : "B"
            });
         }
         return domain.each(items, function(item) {
            return new Item(item).save()
         });

      }).then(function(item) {
         done()
      })
   });

   it("Should aggregate", function(done) {
      Item.aggregate([{
         $group: {
            _id: "$name",
            "count": {
               $sum: 1
            }
         }
      }]).then(function(data) {
         data[0].count.should.equal(51)
         data[1].count.should.equal(49)
         done()
      }).catch(done)
   });

});
