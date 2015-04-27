var Class = require('wires-class');
module.exports = Class.extend({
	initialize : function(message, code)
	{
		this.code = code || 500;
		this.message = message || 'Something went wrong';
	}
});
