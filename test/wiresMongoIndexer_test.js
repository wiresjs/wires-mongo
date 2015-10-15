var assert = require('assert');
var should = require('should');
var Model = require('../index');
var domain = require("wires-domain");
var TestUser = require("./model.js");
var ObjectID = require('mongodb').ObjectID;

describe('Wire mongo indexer test', function() {

   var Item = Model.extend({
      collection: "test_items_index",
      schema: {
         _id: [],
         title: {},
         description: {}
      }
   });

   var record;
   domain.service("testModelOne", function() {
      return Model.extend({
         collection: "testModelOne",
         schema: {
            _id: [],
            title: {
               index: 1
            },
            description: {
               index: "text"
            },
            addition: {
               index: "text"
            }
         }
      });
   });
   domain.service("testModelTwo", function() {
      return Model.extend({
         collection: "testModelTwo",
         schema: {
            _id: [],
            title: {
               index: 1
            }
         }
      });
   });

   it("Should create indexes automatically", function(done) {
      domain.require(function($wiresMongoIndexer) {
         return $wiresMongoIndexer("testModelOne", "testModelTwo").then(function() {
            done();
         }).catch(done);
      });
   });

});
