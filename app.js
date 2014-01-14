var express = require('express'),
	app = express(),
	path = require('path'),
	player = require('./lib/player.js'),
	videos = require('./lib/videos.js');

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	console.log('Get request received');

	res.render('player/index');
});

app.post('/', function(req, res) {
	console.log('Post request received');

	player.getInfo(req.body.ytUrl, server, res);
});

console.log('Listening on port ' + app.get('port'));
var io = require('socket.io').listen(app.listen(app.get('port')));

io.sockets.on('connection', function(socket) {
	socket.on('new', function(data) {
		// Once the video has been added to the list, emit the updated list to all connected
		video.addVideo(data.yturl, function() {
			io.sockets.emit('update', videos.videoList);
		})
	});

	socket.on('control', function(data) {

	});
});