var domain = require('../../index');


domain.service("$date", function() {
	return new Date().getTime();
});