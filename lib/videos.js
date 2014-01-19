var youtubedl = require('youtube-dl'),
	videoList = [];

function addVideo(url, callback) {
	var video = {};
	video.url = url;

	getInfo(video, callback);
}

// Takes a video object and adds additional info from it's url
function getInfo(video, callback) {
	if (video.url) {
		youtubedl.getInfo(video.url, function(err, info) {
			if (err) {
				console.log('Info could not be retrieved for url: ' + video.url);
			} else {
				video.title = info.title;
				video.thumbnail = info.thumbnail;
				video.vurl = info.url;

				// Add the video to the list
				videoList.push(video);

				callback();
			}
		});
	} else {
		console.log('The video does not have a url!');
	}
}

exports.videoList = videoList;
exports.addVideo = addVideo;