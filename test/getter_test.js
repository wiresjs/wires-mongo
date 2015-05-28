var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")



describe('Removing should be okay', function() {

   var user;

   before(function() {
      user = new TestUser({
         name: 'ivan',
         nested: {
            hello: 1
         },
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
});
