var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index')

describe('Unset test', function() {

   var Test = Model.extend({
      collection: "test_set_test",
      schema: {
         _id: [],
         name: {},
         data: {}
      }
   })

   it("Should set simple param", function() {
      var test = new Test();
      test.set("name", 'ivan');

      test.get("name").should.equal("ivan");
   });

   it("Should set deep array1", function() {
      var test = new Test();
      test.set("data.name", 'ivan');

      var result = test.get("data.name");
      result.should.equal('ivan');
   });

   it("Should set deeper 2", function() {
      var test = new Test();
      test.set("data.name.test", 'ivan');

      var result = test.get("data.name.test");
      result.should.equal('ivan');
   });

   it("Should set deeper 2 with empty array", function() {
      var test = new Test();
      test.set("data.name.test", ['hello']);

      var result = test.get("data.name.test");
      result[0].should.be.equal('hello')

   });

   it("Should not override", function() {
      var test = new Test({
         data: {
            key1: 'hello'
         }
      });
      test.set("data.key2", 'hello2')

      test.get("data.key1").should.equal('hello');
      test.get("data.key2").should.equal('hello2');
   });

   it("Should override with nested object", function() {
      var test = new Test({
         data: {
            key1: 'hello',
            key2: {
               deep: {
                  something: 1
               }
            }
         }
      });
      test.set("data.key2.deep", 'hello2')
      assert.deepEqual(test.get("data"), {
         key1: 'hello',
         key2: {
            deep: 'hello2'
         }
      });
   });

   it("Should not override with nested object", function() {
      var test = new Test({
         data: {
            key1: 'hello',
            key2: {
               deep: {
                  something: 1
               }
            }
         }
      });
      test.set("data.key2.deep.anything", 'hello2')
      assert.deepEqual(test.get("data"), {
         key1: 'hello',
         key2: {
            deep: {
               something: 1,
               anything: 'hello2'
            }
         }
      });
   });

   it("Should create long object from stratch", function() {
      var test = new Test();
      test.set('data.a.b.c.d', ['hello']);
      test.get('data.a.b.c.d.0').should.equal('hello')
   });

});
