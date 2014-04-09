var debug = false;
var subscriberStats = {
	userCount: 0
};
var routeUsers = {};

function getInfo(req, res) {
	res.send(200, routeUsers);
}

function log() {
	// var args = [].pop.call(arguments);
	// var type = [].shift.call(arguments);

	// console.log(type, args, ", u:", subscriberStats.userCount);
}

function onHandshake() {
	log('handshake....:', arguments);
	subscriberStats.userCount++;
}

function onSubscribe() {
	log('subscribe....:', arguments);
}

function onUnsubscribe() {
	log('unsubscribe..:', arguments);
}

function onPublish() {
	log('publish......:', arguments);
}

function onDisconnect() {
	log('disconnect...:', arguments);
	subscriberStats.userCount--;
}

function setupBayeux(bayeux) {
	bayeux.on('handshake', onHandshake);
	bayeux.on('subscribe', onSubscribe);
	bayeux.on('unsubscribe', onUnsubscribe);
	bayeux.on('publish', onPublish);
	bayeux.on('disconnect', onDisconnect);
}

function removeFromArray(array, search_term) {
	for (var i = array.length - 1; i >= 0; i--) {
		if (array[i] === search_term) {
			array.splice(i, 1);
			break; //<-- Uncomment  if only the first term has to be removed
		}
	}
}

function publishRouteStatus(client, route) {
	var users = routeUsers[route];
	client.publish('/routeStatus' + route, {
		type: 'routeStatus',
		route: route,
		users: users
	});
}

function startClient(bayeux) {
	var client = bayeux.getClient();
	client.subscribe('/test/**', function(message) {
		var handler = {
			'enteredRoute': function() {
				console.log(message.user, 'entered route', message.route);
				if (routeUsers[message.route]) {
					routeUsers[message.route].push(message.user);
				} else {
					routeUsers[message.route] = [message.user];
				}
				publishRouteStatus(client, message.route);
			},
			'leftRoute': function() {
				console.log(message.user, 'left route', message.route);
				removeFromArray(routeUsers[message.route], message.user);
				if (routeUsers[message.route].length === 0) {
					delete routeUsers[message.route];
				}
				publishRouteStatus(client, message.route);
			}
		}[message.type];
		if (handler) {
			handler();
		}
	});
}

exports.start = function(config) {
	var express = require('express'),
		faye = require('faye'),
		http = require('http'),
		os = require('os'),
		adapterConfig = config.get('faye').NodeAdapter,
		app = express(),
		server = http.createServer(app),
		bayeux = new faye.NodeAdapter(adapterConfig),
		serverUrl = 'http://' + os.hostname() + ':' + config.get('PORT') + adapterConfig.mount;

	bayeux.attach(server);

	app.get('/info', getInfo);

	app.use(function(err, req, res, next) {
		console.error(err.stack);
		res.send(500);
	});

	setupBayeux(bayeux);
	startClient(bayeux);
	server.listen(config.get('PORT'), function() {
		console.log('Adapter config:', adapterConfig);
		console.log('Listening:' + serverUrl);
	});

};