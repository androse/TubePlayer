var child = require('child_process'),
	currentVideo = null,
	currentStream = null;

// Takes an array of video objects and pauses or plays the current video using its stdin stream
function playPause(videoList) {
	if (currentStream) {
		currentStream.write('p');
		videoList[currentVideo].playing = !videoList[currentVideo].playing;
		console.log(videoList[currentVideo].title + ' played/paused');
	} else {
		console.log('There is no current input stream!');
	}
}

function stop(videoList, callback) {
	if (currentStream) {
		console.log(videoList[currentVideo].title + ' is being stopped!');

		currentStream.write('q');
	} else {
		console.log('There is no current video or input stream!');
	}
}

// Takes an array of videos objects and plays the video specified by its index using omxplayer
function start(videoList, videoIndex, callback, exitCallback) {
	if (videoIndex < videoList.length) {	
		currentVideo = videoIndex;

		var omxplayer = child.spawn('omxplayer', [videoList[currentVideo].vurl]);
		videoList[currentVideo].playing = true;
		videoList[currentVideo].current = true;
		console.log(videoList[currentVideo].title + ' started!');

		omxplayer.on('exit', function(code, signal) {
			console.log('Video finished!');

			videoList[currentVideo].playing = false;
			videoList[currentVideo].current = false;
			currentVideo = null;
			currentStream = null;

			// Optional callback function
			typeof exitCallback == 'function' && exitCallback();
		});

		// Video controlled by writing to stdin stream.
		currentStream = omxplayer.stdin;

		callback();
	} else {
		console.log(videoIndex + ' is outside the range of playable videos!');
	}
}

// Stop the current video and play the newly specified one
function newVideo(videoList, videoIndex, callback) {
	console

	// If a video is already being played, stop it first
	if (currentVideo !== null) {
		console.log('There is a currently a video!');

		stop(videoList, function() {
			start(videoList, videoIndex, callback);
		});
	} else {
		start(videoList, videoIndex, callback);
	}
}

function volumeUp() {
	if (currentStream) {
		console.log('Volume increased!');
		currentStream.write('+');
	} else {
		console.log('There is no current video or input stream!');
	}
}

function volumeDown() {
	if (currentStream) {
		console.log('Volume decreased!');
		currentStream.write('-');
	} else {
		console.log('There is no current video or input stream!');
	}
}
// Expose functions in this module
exports.playPause = playPause;
exports.stop = stop;
exports.newVideo = newVideo;
exports.volumeUp = volumeUp;
exports.volumeDown = volumeDown;