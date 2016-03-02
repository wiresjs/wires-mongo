var assert = require('assert');
var should = require('should');
var Model = require('../index');
var domain = require("wires-domain");
var TestUser = require("./model.js");
var ObjectID = require('mongodb').ObjectID;

describe('Equals test', function() {

   var Item = Model.extend({
      collection: "ensure_test",
      schema: {
         _id: [],
         title: {}
      }
   });

   var record;
   before(function(done) {
      new Item().drop().then(function() {
         done();
      });
   });

   it("Should first record", function(done) {
      var item = new Item();
      item.set('title', 'hello').ensure('unique', {
         title: 'hello'
      }).save().then(function() {
         done();
      }).catch(done);
   });

   it("Should not create the same record", function(done) {
      var item = new Item();
      item.set('title', 'hello').ensure('unique', {
         title: 'hello'
      }, 'You are wrong!')
      item.save().then(function() {
         done("Should not be here");
      }).catch(function(e) {
         e.message.should.equal('You are wrong!');
         done();
      });
   });

   it("Should not create the same record with ensureUnique", function(done) {
      var item = new Item();
      item.set('title', 'hello').ensureUnique({
         title: 'hello'
      }, 'You are wrong!');
      item.save().then(function() {
         done("Should not be here");
      }).catch(function(e) {
         e.message.should.equal('You are wrong!');
         done();
      });
   });

});
