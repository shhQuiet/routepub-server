var http = require('http'),
	faye = require('faye');

exports.start = function(config) {
	var server = http.createServer(),
		bayeux = new faye.NodeAdapter(config.get('faye.NodeAdapter')),
		port = config.get('PORT');

	bayeux.attach(server);
	server.listen(port);
	console.log("server is listening at port " + port)
}