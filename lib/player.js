var request = require('request'),
	child = require('child_process');

//This is a new line.

// Retrieve the URL using youtube-dl
exports.getInfo = function(url, server, res) {
	var info = {};
	info.url = url;

	console.log('URL: ' + info.url);

	parseYouTubeID(info, server, res)
}

/*
	Credit to user mantish from stackoverflow for the following regex code
	http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url
*/
function parseYouTubeID(info, server, res) {	
	var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	var match = info.url.match(regExp);

	console.log('Parsing video ID...');

	if (match && match[2].length == 11) {
		console.log('ID: ' + match[2]);

		request('http://gdata.youtube.com/feeds/api/videos/' + match[2] + '?v=2&alt=jsonc', function(error, response, body) {
			console.log('Retrieving video data...');

			if (!error && response.statusCode == 200) {
				var ytData = JSON.parse(body);
				info.title = ytData.data.title;

				console.log('Data retrieved! Title: ' + info.title);

				retrieveUrl(info, server, res);
			} else {
				console.log('Data could not be retrieved!');

				renderError(res);
			}
		});
	} else {
		console.log('ID could not be parsed!');

	    renderError(res);
	}
}

function retrieveUrl(info, server, res) {
	var youtubedl = child.spawn('youtube-dl', ['-g', info.url]);

	console.log('Retrieving video URL...');

	// URL retreived from stdout
	youtubedl.stdout.on('data', function(data) {
		info.vurl = data.toString().replace(/^\s+|\s+$/g, '');

		console.log('Video URL: ' + info.vurl);

		// Play the video
		play(info, server, res);
	});		

	// If an error occurs spawning youtube-dl
	youtubedl.on('error', function(err) {
		console.log('Video URL could not be retrieved!')
		renderError(res);
	});
}

function play(info, server, res) {
	var io = require('socket.io').listen(server);

	var omxplayer = child.spawn('omxplayer', [info.vurl]);
	var status = {title: info.title, playing: true, done: false};

	console.log('Video being played...');

	// Wait for a socket connection
	io.sockets.on('connection', function(socket) {
		console.log('Socket connection!');

		socket.emit('status', status);

		// Control the player based on control messages sent over the socket
		socket.on('control', function(data) {
			if (data.control == 'playpause') {
				status.playing = !status.playing;

				var videoState;
				if (status.playing) videoState = 'playing';
				else videoState = 'paused';
				console.log('Video ' + videoState);

				omxplayer.stdin.write('p');
				socket.emit('status', status);
			} if (data.control == 'stop') {
				console.log('Video stopped');

				omxplayer.stdin.write('q');
			}
		});

		omxplayer.on('error', function(err) {
			console.log('omxplayer error!');
		});

		omxplayer.on('exit', function(code, signal) {
			status.playing = false;
			status.done = true;

			console.log('Video finished!');

			socket.emit('status', status);
		});

		omxplayer.on('close', function(code, signal) {
			console.log('omxplayer closed!');
		});

		omxplayer.on('message', function(message, sendHandle) {
			console.log('omxplayer messaged!');
		});
	})

	omxplayer.stdout.on('data', function(data) {
		console.log('omxplayer stdout -> ' + data);
	});

	omxplayer.stderr.on('data', function(data) {
		console.log('omxplayer stderr -> ' + data);
	});

	// Render the player page
	res.render('player/player');
}

function renderError(res) {
	res.render('player/error');
}