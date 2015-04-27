var domain = require('../index');


domain.service("$a", function($b) {
	return {
		data: $b.details + " Some shit from a"
	}
});