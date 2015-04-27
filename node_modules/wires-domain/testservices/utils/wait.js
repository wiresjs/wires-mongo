var domain = require('../../index');


domain.service("$wait", function() {
	return domain.promise(function(resolve, reject) {

		setTimeout(function() {
			resolve({
				status: "Waiting is done"
			})
		}, 1000);
	})
});