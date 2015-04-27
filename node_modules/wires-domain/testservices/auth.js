var domain = require('../index');


domain.service("$auth", function($req) {
	return {
		validate: function() {
			if (!$req.query.test) {
				throw {
					code: 404,
					message: "Not authorized!"
				}
			}
		}
	}
});