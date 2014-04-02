var faye = require('faye');
var fs = require('fs'),
	config = require('nconf'),
	server = require('./routepub-server.js');

config.argv()
	.env()
	.file({
		file: 'config.json'
	});
var client = new faye.Client(config.get('test').serverUrl);

var test = client.publish('/test', {
	message: 'hello from test!'
});

test.then(function() {
	console.log("publish received by server!");
	client.disconnect();
}, function(error) {
	console.log('ERROR:', error);
	client.disconnect();
});