wires-domain
============

Restful Service for express.js with dependency injection.

## Installation

	npm install wires-domain --save
	
## Services

Define few services

	domain.service("$a", function() {
		return "Response from $a"
	});
	domain.service("$b", function($a) {
		return $a
	});
	
Now we can call service "$b", that returns results from service "$a"

	domain.require(function($b) {
		//$b is resolved and ready to be used!
	})

domain.require always returns a promise.

For more example see test/flow.js

### Asynchronous

	domain.service("$wait", function() {
		return domain.promise(function(resolve, reject) {
			resolve("Some async result")	
		})
	});

you can also use promise directly

       new Promise(function(resolve, reject){})

## Factories

Wires supports automatic factory creation.
Simply do that:

    domain.service("item", function() {
		return domain.Factory.extend({
		    init : function($a)
		    {
		    	this.localVariable = $a;
		    },
		    testMe : function()
		    {
		    	return this.localVariable;
		    }
		});
	});

Accesing this service will constuct the model call init and resolve all injected dependencies

	index: function($res, item) {
		$res.send(item.testMe())
	}

You can create an abstraction layer on top on domain.Factory
Extend as much as you like, building your own solutions!


## Restful Architecture

2 folders to be created. Services and RestApi. Put all your dependencies into "services" folder.
Resembles angular.js style.

Require all at once:

	require('require-all')('/services');
	require('require-all')('/rest');

Connect with express.js

	app.use(domain.express());


## Restfull example

	var domain = require('wires-domain');
	domain.path("/:id?", domain.BaseResource.extend({
		index: function($res, $params) {
			$res.send({ id : $params.id } )
		}
	}));

All matched paramaters are combined into "$params" injection

### Restful method

	// GET
    index: function($res) {
		throw {
			status: 505,
			message: 'Not implemented'
		};
	},
	// POST
	add: function($res) {
		throw {
			status: 505,
			message: 'Not implemented'
		}
	},
	// PUT
	update: function($res) {
		throw {
			status: 505,
			message: 'Not implemented'
		}
	},
	// DELETE
	remove: function() {
		throw {
			status: 505,
			message: 'Not implemented'
		}
	}


## Restful local injections

### $res
Express res

### $req
Express req

### $params
matched parameters from the url

### $next
It is possible to try next candidate. Note, that this is not express "next" function.
Let's check an example:

	domain.path("/", domain.BaseResource.extend({
		index: function($res, $nice, $next) {
			$next();
			//$res.send("First")
		}
	}));
	
	domain.path("/", domain.BaseResource.extend({
		index: function($res) {
			$res.send("Second")
		}
	}));


## Exceptions

Any exception can be thrown. If an object is a dictionary and it containes "status" key, that will be taken as a http code response. You can combine it with "message"

     domain.service("$a", function($params.id) {
		if ( $params.id === 5 ){
			throw {status : 400, message "You can't access this item"}
		}
     });


