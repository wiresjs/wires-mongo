var assert = require('assert')
var should = require('should');

var TestUser = require("./model.js")



describe('Basic model test', function() {

	it('Shoud construct with attributes', function() {
		var attrs = {
			name: "ivan",
			email: "ivan@morrr.com"
		}
		var user = new TestUser(attrs);
		should.deepEqual(attrs, user.attrs);
	});

	it('Shoud construct with helper (.getAttributes)', function() {
		var attrs = {
			name: "ivan",
			email: "ivan@morrr.com"
		}

		var helperFunc = {
			getAttributes: function() {
				return attrs;
			}
		}
		var user = new TestUser(helperFunc);
		should.deepEqual(attrs, user.attrs);
	});


	it("Should get attribute by using dot notation", function() {
		var test = new TestUser();
		test.attrs.nested = {
			child: true
		}
		test.get("nested.child").should.be.equal(true);
	});

	it('Shoud filter out attributes that are not described', function() {
		var attrs = {
			name: "ivan",
			email: "ivan@morrr.com",
			some: true
		}
		var user = new TestUser(attrs);
		should.deepEqual({
			name: "ivan",
			email: "ivan@morrr.com"
		}, user.attrs);
	});

	it('Shoud merge query', function() {
		var user = new TestUser();
		user.find({
			name: "ivan"
		}).find("email", "ivan@morrr.com");

		should.deepEqual({
			name: "ivan",
			email: "ivan@morrr.com"
		}, user._reqParams.query)
	})

	it('Shoud add sort', function() {
		var user = new TestUser();
		user.sort("id");
		var res = [
			["id", "asc"]
		];
		should.deepEqual(user._reqParams.options.sort, res)

	});

	it('Shoud add and check skip', function() {
		var user = new TestUser();
		user.skip("10");

		user._reqParams.options.skip.should.be.equal(10)

		user.skip(0);

		user._reqParams.options.skip.should.be.equal(0)

		user.skip(null);
		should.not.exist(user._reqParams.options.skip);
	});

	it('Shoud set projection "user"', function() {
		var user = new TestUser();
		user.projection("user");

		should.deepEqual({
			name: 1,
			email: 1,
			images: {
				$slice: -5
			}
		}, user._reqParams.projectionArray);
	});

	it('Shoud set projection "world"', function() {
		var user = new TestUser();

		user.projection("world");

		should.deepEqual({
			password: 0
		}, user._reqParams.projectionArray)

	});

});