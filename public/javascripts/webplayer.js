$(document).ready(function () {
	var socket = io.connect('http://10.0.0.10');

	socket.on('status', function(data) {
		console.log('Status received');
		console.log(data);

		// When the video is finished send the user back to the home page
		if (data.done == true) {
			socket.disconnect();
			window.location.href = '/';
		// If the video is playing the button should show a pause icon
		} else if (data.playing == true) {
			console.log('Playing!');
			$('#playpause span').attr('class', 'glyphicon glyphicon-pause');
		// If the video is paused the button should show a play icon
		} else if (data.playing == false) {
			console.log('Paused!');
			$('#playpause span').attr('class', 'glyphicon glyphicon-play');
		}

		// Set the title of the video
		$('#title').text(data.title);
	});

	$('#playpause').click(function() {
		socket.emit('control', {control: 'playpause'});
	});

	$('#stop').click(function() {
		socket.emit('control', {control: 'stop'});
	});
});