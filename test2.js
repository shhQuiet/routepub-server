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

function enterAndLeave(client, username) {
	var randPath = paths.slice(0, Math.random() * (paths.length + 1));
	randPath = randPath.join('/');
	randPath = '/test' + (randPath.length > 0 ? '/' : '') + randPath;
	console.log(username + " entering " + randPath);
	client.publish(randPath, {
		user: username,
		type: 'enteredRoute',
		route: randPath,
		message: 'hello to this route!'
	}).then(function() {
		var randWait = ((Math.random() * (maximumWait - minimumWait)) + minimumWait) * 1000;
		setTimeout(function() {
			console.log('Leaving ' + randPath);
			iterations--;
			client.publish(randPath, {
				user: username,
				type: 'leftRoute',
				route: randPath,
				message: 'so long from that route!'
			}).then(function() {
				if (iterations <= 0) {
					client.disconnect();
				}
			});
			if (iterations > 0) {
				setTimeout(function() {
					enterAndLeave(client, username);
				}, 1);
			} else {
				console.log('Finished.');
			}
		}, randWait);

	}, function(error) {
		console.log("ERROR:", error);
	});
}

console.log('Starting test...');
var username;
for (var i = 0; i < numClients; ++i) {
	username = 'user' + i + '-' + thisInstanceId;
	enterAndLeave(new faye.Client(testconfig.serverUrl), username);
}