var domain = require('../index');
var Promise = require('promise');
var Class = require('wires-class');


domain.service("item", function() {

	return domain.Model.extend({
		init: function($a) {
			this.a = $a;

		},
		pukka: function() {
			return this.a;
		}
	});
});