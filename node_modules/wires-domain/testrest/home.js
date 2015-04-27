var domain = require('../index');

domain.path("/", domain.BaseResource.extend({
	index: function($res, $nice, $next) {
		$next();
		//$res.send("First")
	}
}));

domain.path("/", domain.BaseResource.extend({
	index: function($res) {
		$res.send("hello")
	}
}));