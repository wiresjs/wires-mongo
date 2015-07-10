var assert = require('assert')
var should = require('should');
var logger = require("log4js").getLogger("test")
var TestUser = require("./model.js")
var Model = require('../index');
var domain = require('wires-domain')
var _ = require('lodash')

var Tag = Model.extend({
   collection: "cascade_remove_tag",
   cascade_remove: ['@exclude Blog.tags', '@nullify Blog.someother_tag'],
   schema: {
      _id: [],
      name: {
         required: true
      }
   },

})
domain.register("Tag", function() {
   return Tag;
})
var Item = Model.extend({
   collection: "cascade_remove_item",
   cascade_remove: ['@remove Blog.item'],
   schema: {
      _id: [],
      name: {
         required: true
      }
   },

})


domain.register("Item", function() {
   return Item;
})
var Blog = Model.extend({
   collection: "cascade_remove_blog",
   schema: {
      _id: [],
      name: {
         required: true
      },
      tags: {
         reference: true
      },
      item: {
         reference: true
      },
      someother_tag: {
         reference: true
      }
   },
});
domain.register("Blog", function() {
   return Blog
})


describe('Removing should be okay', function() {

   var blog1, blog2, tag1, tag2, item1, item2;

   before(function(done) {

      return Tag.drop().then(function() {

            return domain.each([{
               name: "tag 1"
            }, {
               name: "tag 2"
            }, {
               name: "tag 3"
            }], function(item) {
               return new Tag(item).save();
            }).then(function(tags) {
               tag1 = tags[0]
               tag2 = tags[1]
               return Item.drop()
            })
         }).then(function() {

            return domain.each([{
               name: "item 1"
            }, {
               name: "item 2"
            }], function(item) {
               return new Item(item).save();
            }).then(function(items) {
               item1 = items[0]
               item2 = items[1]
               return Blog.drop()
            })

         }).then(function() {
            return domain.each([{
               name: "Entry 1",
               tags: [tag1, tag2],
               item: item1
            }, {
               name: "Entry 2",
               tags: [tag2],
               item: item2
            }, {
               name: "Special Entry",
               tags: [tag2],
               item: item2,
               someother_tag: tag1
            }], function(bl) {
               return new Blog(bl).save();
            }).then(function(blogs) {
               blog1 = blogs[0];
               blog2 = blogs[2];
            })
         })
         .then(function() {

            done()
         }).catch(function(e) {
            done(e)
         })
   })
   it("Should remove from tag instance from the list ", function(done) {

      tag2.remove().then(function() {
         Blog.find()
            .all().then(function(records) {

               _.each(records, function(record) {
                  tag2.inArray(record.attrs.tags).should.be.equal(false);
               })
               done();
            }).catch(function(e) {
               done(e)
            });

      }).catch(function(e) {
         done(e)
      })

   });


   it("Should nullify ", function(done) {

      tag1.remove().then(function() {
         Blog.find()
            .all().then(function(records) {
               _.each(records, function(record) {

               })
               done();

            }).catch(function(e) {
               done(e)
            });

      }).catch(function(e) {
         done(e)
      })

   });

   it("Should remove the record", function(done) {
      item1.remove().then(function() {
         return Blog.find().all().then(function(items) {
            _.each(items, function(_blog) {
               _blog.get('item').toString().should.not.equal(item1.get('_id').toString())
            })
            done();
         })
      }).catch(function(e) {
         done(e)
      })
   });
});
