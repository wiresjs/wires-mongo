var domain = require('../index.js');
var pathToRegexp = require('path-to-regexp');
var _ = require('lodash');
var invoker = require('./invoker');
var scope = require('./scope');

var defineMethod = function(req) {
	var method = req.query.method ? req.query.method : req.method;
	switch (method) {
		case 'GET':
			return 'index';
		case 'POST':
			return 'add';
		case 'PUT':
			return 'update';
		case 'DELETE':
			return 'remove';
	}
};


var getResourceCandidate = function(resources, index, url) {
	for (var i = index; i < resources.length; i++) {
		var item = resources[i];
		var keys = [];
		var re = pathToRegexp(item.path, keys);
		params = re.exec(url);
		if (params) {
			return {
				params: params,
				keys: keys,
				handler: item.handler,
				nextIndex: index + 1
			}
		}
	}
}



var callCurrentResource = function(info, req, res) {
	// Extract params 
	var mergedParams = {};
	var params = info.params;
	var handler = info.handler;

	_.each(info.keys, function(data, index) {
		var i = index + 1;
		if (params[i] !== null && params[i] !== undefined) {
			var parameterValue = params[i];
			if (parameterValue.match(/^\d{1,4}$/)) {
				parameterValue = parseInt(parameterValue);
			}
			mergedParams[data.name] = parameterValue;
		}
	});


	var method = defineMethod(req);
	var resourceInstance = new handler();

	// Checking is conventions are followed
	var isValidResource = resourceInstance instanceof domain.BaseResource;

	// Define parse options
	var parseOptions = {};
	if (isValidResource) {
		parseOptions.source = handler.prototype[method];
		parseOptions.target = resourceInstance[method];
		parseOptions.instance = resourceInstance;

	}
	// in case if it's just a function
	else {
		parseOptions = handler;
	}

	invoker.invoke(parseOptions, {
		$req: req,
		$res: res,
		$params: mergedParams,
		// Next function tries to get next
		$next: function() {
			return function() {
				var resources = scope.getRestResources();
				var data = getResourceCandidate(resources, info.nextIndex, req.path);
				if (data) {
					return callCurrentResource(data, req, res)
				}
			}
		}
	}).then(function(result) {

	}).catch(function(err) {
		var errResponse = {
			status: 500,
			message: "Error"
		};
		if (_.isObject(err)) {
			errResponse.status = err.status || 500;
			errResponse.message = err.message || "Error";
			if (err.details) {
				errResponse.details = err.details;
			}
		}
		res.status(errResponse.status).send(errResponse);
	});
}

module.exports = function(req, res, next) {
	var resources = scope.getRestResources();
	var data = getResourceCandidate(resources, 0, req.path);
	if (!data) {
		return next();
	}
	return callCurrentResource(data, req, res)
};