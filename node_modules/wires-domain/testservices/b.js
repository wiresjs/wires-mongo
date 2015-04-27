var domain = require('../index');
var Promise = require('promise');

domain.service("$nice", function($req, $res) {
	return {
		hello: "world"
	}
});

domain.service("$b", function($req, $res) {
	return new Promise(function(resolve, reject) {
		setTimeout(function() {
			resolve({
				details: "This is async b"
			})
		}, 1)
	})
});