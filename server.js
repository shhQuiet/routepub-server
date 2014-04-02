var fs = require('fs'),
	nconf = require('nconf'),
	server = require('./routepub-server.js');

//
// Setup nconf to use (in-order):
//   1. Command-line arguments
//   2. Environment variables
//   3. A file located at 'path/to/config.json'
//
nconf.argv()
	.env()
	.file({
		file: 'config.json'
	});

console.log("======== Starting server ========\nUsing port    [" + nconf.get("PORT") + "]");

server.start(nconf);