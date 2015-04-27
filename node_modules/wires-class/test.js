var Class = require('./index');

var A = Class.extend({
	initialize : function()
	{
		this.on('test', function(){
			console.log('Hello test');
		})
		
		this.on('foo', function(){
			console.log('Hello foo');
		})
	},
	test : function()
	{
		this.trigger('test foo');
	}
	
});

var a = new A();
a.test();

