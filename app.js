var app = require('express').createServer();
var io = require('socket.io').listen(app);

// inicialize the database
var db = {};

app.listen(8000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/admin/index.html');
});


var tracker = io.of('/tracker');
tracker.on('connection', function (socket) {

	socket.on('open page', function (data) {
		console.log("Client "+socket.id+ " active on " + data.url);
		console.log("Details:");
		console.log(data.details);

		// store in DB
		db[socket.id] = data;

		// update view
		admin.emit('db new', { id:socket.id, data:data});

	});
	socket.on('disconnect', function () {

		console.log("Client disconnected:" + socket.id);

		// remove from DB
		delete db[socket.id];

		// update view
		admin.emit('db remove', socket.id);
	});
});

var admin = io.of('/admin');
admin.on('connection', function (socket) {
	
	// push current client DB
	socket.emit('db', db);

	socket.on('tail', function(client_id) {
		console.log('now tracking client:' + client_id);
		io.sockets.socket(client_id).emit('tracking',{});
	
	});

});




