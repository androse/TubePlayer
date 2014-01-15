var child = require('child_process'),
	currentVideo = null;

// Takes an array of video objects and pauses or plays the current video using its stdin stream
function playPause(videoList) {
	if (videoList[currentVideo].controlStream) {
		videoList[currentVideo].controlStream.write('p');
		videoList[currentVideo].playing = !videoList[currentVideo].playing;
		console.log(videoList[currentVideo].title + ' played/paused');
	} else {
		console.log(videoList[currentVideo].title + ' does not have a control stream');
	}
}

function stop(videoList, callback) {
	if (videoList[currentVideo].controlStream) {
		currentVideo = null;
		videoList[currentVideo].playing = false;
		videoList[currentVideo].current = false;
		videoList[currentVideo].controlStream.write('q');
		videoList[currentVideo].controlStream = null;

		// Optional callback function
		typeof callback == "function" && callback();
	} else {
		console.log(videoList[currentVideo].title + ' does not have a control stream');
	}
}

// Takes an array of videos objects and plays the video specified by its index using omxplayer
function start(videoList, videoIndex, callback) {
	if (videoIndex < videoList.length) {	
		currentVideo = videoIndex;

		var omxplayer = child.spawn('omxplayer', videoList[currentVideo].vurl);
		videoList[currentVideo].playing = true;
		videoList[currentVideo].current = true;
		console.log(videoList[currentVideo].title + ' started!');

		omxplayer.on('exit', function(code, signal) {
			console.log(videoList[currentVideo].title + ' finished!');
		});

		// Video controlled by writing to stdin stream.
		videoList[currentVideo].controlStream = omxplayer.stdin;

		callback();
	} else {
		console.log(videoIndex + ' is outside the range of playable videos!');
	}
}

// Stop the current video and play the newly specified one
function newVideo(videoList, videoIndex, callback) {
	// If a video is already being played, stop it first
	if (currentVideo) {
		stop(videoList, function() {
			start(videoList, videoIndex, callback);
		});
	} else {
		start(videoList, videoIndex, callback);
	}
}

// Expose functions in this module
exports.playPause = playPause;
exports.stop = stop;
exports.newVideo = newVideo;