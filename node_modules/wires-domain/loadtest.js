var domain = require("./index.js");
require('require-all')(__dirname + '/testservices');
require('require-all')(__dirname + '/testrest');
var Promise = require("promise");


domain.service("$nice", function() {
	console.log("Nice called")
	return {
		hello: "world"
	}
});


domain.require(function($nice) {
	console.log("Nice is", $nice);
}, {
	a: 1
}, function(err, results) {
	console.log("Done executing", err, results);
});