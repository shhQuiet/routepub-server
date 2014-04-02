var http = require('http'),
	faye = require('faye'),
	express = require('express'),
	config;

function getInfo(req, res, next) {
	res.send(200, '<h1>Your info sir</h1>');
}

exports.start = function(cfg) {
	var bayeux = new faye.NodeAdapter(cfg.get('faye.NodeAdapter')),
		port = cfg.get('PORT'),
		app = express();
	config = cfg;

	bayeux.attach(app);
	app.listen(port);
	console.log("server is listening at port " + port);

	app.get('/info', getInfo);
};