module.exports = {
	addRestResource: function(path, handler) {
		global.__wires_resources__ = global.__wires_resources__ || [];

		global.__wires_resources__.push({
			path: path,
			handler: handler
		});
	},
	addService: function(name, f) {
		global.__wires_services__ = global.__wires_services__ || {};
		global.__wires_services__[name] = f;
	},
	getServices: function() {
		return global.__wires_services__ || {};
	},
	getRestResources: function() {
		return global.__wires_resources__ || [];
	}
}