var child = require('child_process');

// Takes a video object and pauses or plays the video using its stdin stream
function playPause(video, callback) {
	if (video.controlStream) {
		video.controlStream.write('p');
		video.playing = !video.playing;
		console.log(video.title + ' played/paused');

		callback();
	} else {
		console.log(video.title + ' does not have a control stream');
	}
}

// Callback not necessary as a callback is called when omxplayer exits (triggered by q)
function stop(video) {
	if (video.controlStream) {
		video.controlStream.write('q');
	} else {
		console.log(video.title + ' does not have a control stream');
	}
}

// Takes a video object and plays the video using omxplayer
function start(video, callback, exitCallback) {
	var omxplayer = child.spawn('omxplayer', video.vurl);
	video.playing = true;
	video.current = true;
	console.log(video.title + ' started!');


	omxplayer.on('exit', function(code, signal) {
		video.playing = false;
		video.current = false;
		video.controlStream = null;
		console.log(video.title + ' finished!');

		// Executed when video ends on it's own
		exitCallback();
	});

	// Video controlled by writing to stdin stream.
	video.controlStream = omxplayer.stdin;

	callback();
}

function play(vurl, callback) {
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

// Expose functions in this module
exports.playPause = playPause;
exports.stop = stop;
exports.start = start;