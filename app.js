// Modules
var express = require('express')
  , app = express()
  , path = require('path')
  , http = require('http')
  , address = require('network-address');

// Create our server
var server = http.createServer(app);
server.listen(3000);

// Imports
require('./lib/library');
require('./lib/torrents');
require('./lib/search');
require('./lib/playback');
require('./lib/library/network');
require('./lib/streaming');

// Socket Stuff
var WebSocketServer = require('ws').Server
var DDPServer = require('./lib/sockets');
var wss = new WebSocketServer({ server : server });
var ddp = new DDPServer(wss);

// Development Building
if (app.settings.env === 'development') {
	require('./client/build');
}

app.use(require('./lib/playback/torrent'));
app.use(express.logger('dev'));
app.use(function(req, res, next){
	// Use aggressive caching for our movie images, so that we touch the server
	// as little as possible.
	if (req.url.indexOf('/movies/') === 0) {
		res.setHeader("Cache-Control", "public, max-age=345600"); // 4 days
    res.setHeader("Expires", new Date(Date.now() + 345600000).toUTCString());
	}
	return next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('./lib/torrents'));
app.use(require('./lib/streaming'));

// Serve up our HTML file. Eventually add a clientside
// router.
app.get('*', function(req, res){
  res.send(__dirname + '/public/index.html');
});

