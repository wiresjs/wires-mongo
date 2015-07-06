var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')

describe('Removing should be okay', function() {

   var user;

   var Item = Model.extend({
      collection: "test_getter",
      schema: {
         _id: [],
         name: {},
         nested: {},
         somelist: {},
         somelist: {},
         model_reference: {
            reference: true,
            unique: true
         }
      }
   })

   before(function() {
      user = new Item({
         name: 'ivan',
         nested: {
            hello: 1
         },
         somelist: [{
            name: "pukka"
         }],
         model_reference: new TestUser({
            name: 'John'
         })
      });


   });

   it('It should get a simple attribute', function() {
      user.get('name').should.be.equal('ivan')
   });

   it('It should be okay with json', function() {

      user.get('nested.hello').should.be.equal(1)
   });

   it('It should return undefined', function() {
      should.equal(user.get('some.thing.that.does.not.exist'), undefined);
   });

   it('It should be valid with nested model', function() {
      user.get('model_reference.name').should.be.equal("John")
   });
   it('It should get first item from an array', function() {
      user.get('somelist.0.name').should.be.equal("pukka")
   });
   it('It should get second item from an array and return undefined', function() {
      should.equal(user.get('somelist.2.name'), undefined)
   });
});
