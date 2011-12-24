var Davy = {
		
	db :   {},  // indians database
	face: null, // interface

	init:function(){

		// connect to davy server
		var socket = io.connect('http://localhost:8000/admin');
		
		// load inicial indians database
		socket.on('db', function (data) {
			console.log(data);
			Davy.db = data;
			$.each(data, function(id, indian){
				Davy.db[id] = indian;
				Davy.face.newClient(id, indian);
			});
			Davy.face.checkEmpty();
		});
		
		// an indian connected
		socket.on('db new', function (indian) {
			Davy.db[indian.id] = indian.data;
			Davy.face.newClient(indian.id,indian.data);
			Davy.face.checkEmpty();
		});

		// an indian disconnected
		socket.on('db remove', function (client_id) {
			delete Davy.db.client_id;
			Davy.face.removeClient(client_id);
		});


		// tracker: click event
		socket.on('click', function(coords){
			console.log('indian click event');
			console.log(window.simulator.document);
			console.log( window.simulator.document.elementFromPoint(coords[0], coords[1]) );
			window.simulator.document.elementFromPoint(coords[0], coords[1]).click();
		});

		// tracker scroll event
		socket.on('scroll', function(coords){
			console.log('indian scroll event');
			window.simulator.scrollTo(coords[0],coords[1]);
		});


		// when the track button is clicked
		$('#list .trackbtn').live('click', function(){

			console.log('tailing #'+id);
			var id = $(this).attr('data-id');
			var indian = Davy.db[id];
			Davy.face.showDetailsPane();
			socket.emit('tail', id );

			window.simulator = window.open(indian.url, '_blank', 'innerWidth='+indian.details.viewportWidth+',innerHeight='+indian.details.viewportWidth+',location=no,menubar=no,status=no,titlebar=no,toolbar=no,resizable=no,directories=no');

			if (window.simulator.jQuery.twinkle == undefined){
				var head = window.simulator.document.getElementsByTagName("head")[0];         
				var script = window.simulator.document.createElement('script');
				script.type = 'text/javascript';
				cssNode.src = 'crocket/javascript/jquery.twinkle.js';
				head.appendChild(script);
			}

		});
	}
};


Davy.face = {
	
	init:function(){
		// top navigation
		$('.nav a').click(function(){
			$('.nav li').removeClass('active');
			$(this).parent().addClass('active');
			var loc = ($(this).attr('href').substr(1));
			window.hash = loc;
			$('.main-content, #welcome').hide();
			$('.'+loc, '#main').show();
		});
		$('.brand').click(function(){
			$('.nav li').removeClass('active');
			$('.main-content, #welcome').hide();
			$('#welcome').fadeIn();
		});

		// move to correct content if the hash is already set
		var hash = window.location.hash;
		var item = $('a[href='+hash+']', '.nav');
		if (item.length == 1){
			$(item).click();
		}

		// welcome banner action
		$("#welcome .show-indians").click(function(){
			$('.nav a[href=#indians]').click();
		});
	},
	newClient : function(id, data) {

		var n = '<tr data-id="'+id+'">';
		n += '<td class="id">'+id+'</td>';
		n += '<td>'+data.url+'</td>';
		n += '<td>'+data.details.os+'</td>';
		n += '<td>'+data.details.browser+'</td>';
		n += '</tr>';
		$('#indian-list tbody').append(n);
	},
	removeClient : function(id){
		var row = $('#indian-list tr[data-id='+id+']');
		$('button', row).removeClass('primary');
		$(row).addClass('dead');
	},
	checkEmpty:function(){
		if($('#indian-list tbody tr').length == 0){
			$(".indians .empty").show();
		} else {
			$(".indians .empty").hide();
		}
	}
		
};


jQuery(function($){
	Davy.face.init();
	Davy.init();
});
