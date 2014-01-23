$(document).ready(function() {
	var socket = io.connect('http://10.0.0.10');
	disableControls();

	// Socket events

	socket.on('updateall', function(data) {
		updateList(data);
	});

	socket.on('updatelist', function(data) {
		updateList(data);
	});

	// JQuery events
	$('#yturlbtn').click(function() {
		addVideo();
	});

	$("#yturltxt").keyup(function(e) {
        if(e.keyCode == 13) {
            addVideo();
        }
    });

	$('#playpausebtn').click(function() {
		socket.emit('control', {
			control: 'playpause',
			selection: null
		});
	});

	$('#stopbtn').click(function() {
		disableControls();

		socket.emit('control', {
			control: 'stop',
			selection: null
		});
	});

	$('#volumeup').click(function() {
		socket.emit('control', {
			control: 'volumeup',
			selection: null
		})
	});

	$('#volumedown').click(function() {
		socket.emit('control', {
			control: 'volumedown',
			selection: null
		})
	});

	$('.list-group').on('click', '.list-group-item', function() {
		var index = parseInt($(this).attr('id'));
		console.log('Item index ' + index + ' selected!');

		socket.emit('control', {
			control: 'start',
			selection: index
		});
	});
	
	// Functions

	function addVideo() {
		socket.emit('add', {
			yturl: $('#yturltxt').val()
		});

		// Clear the input 
		$('#yturltxt').val('');
	}

	function updateList(data) {
		var currentVideo = null;

		// Empty the list of videos
		$('.list-group').empty();

		if (data.length > 0) {
			// Add all videos to the list
			data.forEach(function(element, index, array) {
				if (element.current) {
					// Update the current video
					currentVideo = element;

					$('.list-group').append(
						'<a href="#" id="' + index 
						+ '" class="list-group-item active">' 
						+ '<div class="row">'
						+ '<div class="col-xs-2">'
						+ '<img src="' + element.thumbnail 
						+ '" alt="' + element.title
						+ '" class="img-thumbnail">' 
						+ '</div>'
						+ '<div class="col-xs-10">'
						+ '<h4>' + element.title + '</h4>'
						+ '</div>'
						+ '</div>'
						+ '</a>'
					);
				} else {
					$('.list-group').append(
						'<a href="#" id="' + index
						+ '" class="list-group-item">' 
						+ '<div class="row">'
						+ '<div class="col-xs-2">'
						+ '<img src="' + element.thumbnail 
						+ '" alt="' + element.title
						+ '" class="img-thumbnail">' 
						+ '</div>'
						+ '<div class="col-xs-10">'
						+ '<h4>' + element.title + '</h4>'
						+ '</div>'
						+ '</div>'
						+ '</a>'
					);
				}
			});

			if (currentVideo) {
				enableControls();
			}
		}
	}

	function enableControls() {
		$('#playpausebtn').attr('disabled', false);
		$('#stopbtn').attr('disabled', false);
		$('#volumeup').attr('disabled', false);
		$('#volumedown').attr('disabled', false);
	}

	function disableControls() {
		$('#playpausebtn').attr('disabled', true);
		$('#stopbtn').attr('disabled', true);
		$('#volumeup').attr('disabled', true);
		$('#volumedown').attr('disabled', true);
	}
}); 