var youtubedl = require('youtube-dl'),
	videoList = [];

function addVideo(url, callback) {
	var video = {};
	video.url = url;

	var index = videos.push(video) - 1;

	getInfo(videoList[index], callback);
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

				callback();
			}
		});
	} else {
		console.log('The video does not have a url!');
	}
}

exports.videoList = videoList;
exports.addVideo = addVideo;