var Model = require('../index')
var _ = require('lodash')
var domain = require("wires-domain")
module.exports = {
   drop : function(){
      var models = _.flatten(arguments);
      domain.each
      return domain.each(models, function(item){
         return item.drop();
      })
   },
   add : function(Target, items){

      return domain.each(items, function(item){
         var item = new Target(item);
         return item.save();
      })
   }
}
