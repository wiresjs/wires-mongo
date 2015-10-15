var assert = require('assert');
var should = require('should');
var Model = require('../index');
var domain = require("wires-domain");
var TestUser = require("./model.js");
var ObjectID = require('mongodb').ObjectID;

describe('to Json property', function() {

   var Item = Model.extend({
      collection: "to_json_property_test",
      schema: {
         _id: [],
         title: {
            toJSON: function() {
               return this.get('_id') + "___" + this.get("title");
            }
         },
         description: {}
      }
   });
   before(function(done) {
      Item.drop().then(function() {
         done();
      }).catch(done);
   });

   it("Should create a record and have title modified when toJSON is called", function(done) {
      var item = new Item({
         title: "hello"
      });
      item.save().then(function(result) {

         var json = result.toJSON();
         json.title.should.containEql(item.getStringId());
         json.title.should.containEql("__");
         json.title.should.containEql(item.get("title"));
         done();
      }).catch(done);
   });

});
