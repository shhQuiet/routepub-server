var faye = require('faye');
var fs = require('fs'),
	config = require('nconf');

config.argv()
	.env()
	.file({
		file: 'config.json'
	});
var testconfig = config.get('test');
var minimumWait = testconfig.minimumWait;
var maximumWait = testconfig.maximumWait;
var numClients = testconfig.numClients;
var iterations = testconfig.numIterations;
var paths = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
var thisInstanceId = Math.random();

function listen() {
	var client;
	console.log("listening for " + process.argv[2])
	client = new faye.Client(testconfig.serverUrl);
	client.subscribe(process.argv[2], function(message) {
		console.log('got it:', message);
	});
}

console.log('Starting test...');
listen();