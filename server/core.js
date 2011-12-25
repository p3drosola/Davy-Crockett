module.exports = {

	version:   0.1,
	socket:    undefined,
	ioTracker: undefined,
	ioAdmin:   undefined,
	port:      8080,

	indianDB:  {},
	trackDB:   {},
	events: {},

	init : function(port, dirname){

		// setup pretty logs
		clog = require('clog');
		console = clog;

		clog.info("===========================================");
		clog.info("> Starting up Davy Crockett on port "+ port);
		clog.info("===========================================");

		this.port = port;
		express = require('express');
		app = express.createServer();
		exec = require('child_process').exec;

		/*
		events = {
			tracker : require('./events-tracker.js');	
		};*/

		// attatch socket.io to express server
		io = require('socket.io').listen(app);

		// serve static files from /public dir
		app.configure(function(){
			app.use(express.static(dirname + '/public'));
		});

		// show stack trace in Node.js development mode
		app.configure('development', function(){
		    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
		});

		// start express
		app.listen(this.port); 

		trackerIO = io.of('/tracker');
		adminIO = io.of('/admin');

		// this is how you access a specific client socket
		//trackerIO.socket(socket_id)

		// bind eventHandlers when a client connects to /tracker
		trackerIO.on('connection', function(socket){
			
			// an indian opened a page
			socket.on('open page', function (data) {

				clog.info("Indian #"+socket.id+ " opened " + data.url);
				
				// store in DB
				module.exports.indianDB[socket.id] = data;

				// let admin know
				adminIO.emit('db new', { id:socket.id, data:data});
			});

			// an indian disconnected
			socket.on('disconnect', function () {

				clog.debug("Indian #" + socket.id+ " disconnected");

				// remove from DB
				delete module.exports.indianDB[socket.id];

				// let admin know
				adminIO.emit('db remove', socket.id);
			});

			// events:
			socket.on('click', function(data){
				clog.warn('EVT[click] #'+socket.id, data);
				
				var trackDB = module.exports.trackDB;

				if (trackDB[socket.id] != undefined) {
					// TODO: currently sending to all users in /admin
					adminIO.emit("click", data);
				} else {
					clog.error("no tracker is listening to indian #"+socket.id);
					clog.debug("trackingDB", trackDB);
				}
			});
			
			socket.on('scroll', function(data){
				clog.warn('EVT[scroll] #'+socket.id, data);
				
				var trackDB = module.exports.trackDB;

				if (trackDB[socket.id] != undefined) {
					adminIO.emit("scroll", data);
				} else {
					clog.error("no tracker is listening to indian #"+socket.id);
					clog.debug("trackingDB", trackDB);
				}
			});
			socket.on('mouse', function(data){
				clog.warn('EVT[mouse] #'+socket.id, data);
				
				var trackDB = module.exports.trackDB;

				if (trackDB[socket.id] != undefined) {
					adminIO.emit("mouse", data);
				} else {
					clog.error("no tracker is listening to indian #"+socket.id);
					clog.debug("trackingDB", trackDB);
				}
			});

		});


		// bind events for /admin
		adminIO.on('connection', function (socket) {
	
			// push current indianDB to admin
			socket.emit('db', module.exports.indianDB);

			// when admin decides to tail someone
			socket.on('tail', function(client_id) {

				console.info('Admin is now tracking indian #' + client_id);

				// keep a record of the track opperation
				module.exports.trackDB[client_id] = socket.id;

				// let the indian know he is being followed
				trackerIO.socket(client_id).emit('tailing');
				//io.sockets.sockets[client_id].emit('tailing');

			});

		});


	}	
};