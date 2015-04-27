var domain = require('./index');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

app.use(cookieParser('your secret here'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

require('require-all')(__dirname + '/testservices');
require('require-all')(__dirname + '/testrest');
app.use(domain.express());

console.log(1);
var server = app.listen(3000, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);

});