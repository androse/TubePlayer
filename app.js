var express = require('express'),
	path = require('path'),
	player = require('./lib/player.js'),
	app = express(),
	server = require('http').createServer(app);

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.bodyParser());
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
server.listen(app.get('port'));