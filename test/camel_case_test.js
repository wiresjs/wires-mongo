
var Model = require('../index')
var should = require('should');

describe('CamelCaseTest', function() {
   it("Should do camel case from a string", function(){

      Model.toCamelCase("hello_world").should.be.equal('helloWorld')
   })

   it("Should do camel case from a string with first letter", function(){

      Model.toCamelCase("hello_world", {first : true}).should.be.equal('HelloWorld')
   })
   it("Should do camel case and ignore capita letters", function(){

      Model.toCamelCase("hello_woRld").should.be.equal('helloWorld')
   })
})
