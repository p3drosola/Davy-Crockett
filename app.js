var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);
var exec = require('child_process').exec;
var serverPort = 8000;

// inicialize the database
var db = {};
var tracking = {};

// setup the express server
app.configure(function(){
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});


app.listen(serverPort);
exec('open "http://localhost:'+serverPort+'"/admin');
exec('open "http://localhost:'+serverPort+'"/client.html');


var tracker = io.of('/tracker');
tracker.on('connection', function (socket) {

	clients[socket.id] = socket; 

	socket.on('open page', function (data) {
		console.log("Client "+socket.id+ " active on " + data.url);
		//console.log("Details:");
		//console.log(data.details);

		// store in DB
		db[socket.id] = data;

		// update view
		admin.emit('db new', { id:socket.id, data:data});

	});
	socket.on('disconnect', function () {

		console.log("Client disconnected:" + socket.id);

		// remove from DB
		delete db[socket.id];
		delete clients[socket.id];

		// update view
		admin.emit('db remove', socket.id);
	});

	socket.on('mousemove', function(data){
		console.log('recieved mousemove event', data, socket.id);
	
		if (tracking[socket.id] != undefined) {
			io.sockets.sockets[tracking[socket.id]].emit("mousemove", { a: 'b' });
		} else {
			console.error("no tracker is listening to indian #"+socket.id);
		}
		
		
	});
});

var admin = io.of('/admin');
admin.on('connection', function (socket) {
	
	// push current client DB
	socket.emit('db', db);

	socket.on('tail', function(client_id) {

		console.log('admin is now tracking client:' + client_id);

		// keep a record of the track opperation
		tracking[client_id] = socket.id;

		// let the indian know he is being followed
		clients[client_id].emit('tailing');

	});

});




