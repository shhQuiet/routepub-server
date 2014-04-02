function getInfo(req, res) {
	res.send(200, 'Your information, sir!');
}

function log() {
	var args = [].pop.call(arguments);
	var type = [].shift.call(arguments);

	console.log(type, '/', args);
}

function onHandshake() {
	log('handshake', arguments);
}

function onSubscribe() {
	log('subscribe', arguments);
}

function onUnsubscribe() {
	log('unsubscribe', arguments);
}

function onPublish() {
	log('publish', arguments);
}

function onDisconnect() {
	log('disconnect', arguments);
}

function setupBayeux(bayeux) {
	bayeux.on('handshake', onHandshake);
	bayeux.on('subscribe', onSubscribe);
	bayeux.on('unsubscribe', onUnsubscribe);
	bayeux.on('publish', onPublish);
	bayeux.on('disconnect', onDisconnect);
}

function startLoggingClient(bayeux) {

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
	server.listen(config.get('PORT'), function() {
		console.log('Adapter config:', adapterConfig);
		console.log('Listening:' + serverUrl);
	});

};