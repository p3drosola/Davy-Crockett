var Davy = {
		
	db :   {},  // indians database
	face: null, // interface
	simulatorPos: {},

	init:function(){

		// connect to davy server
		var socket = io.connect('http://localhost:8000/admin');
		
		// load inicial indians database
		socket.on('db', function (data) {
			//console.log(data);
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
			//console.log(window.simulator.document);
			//console.log( window.simulator.document.elementFromPoint(coords[0], coords[1]) );
			$('#mouse-tracker').css({
				left:coords[0],
				top:coords[1]

			}).twinkle({
				widthRatio:0,
				heightRatio:0,
				effect:'splash'
			});

			window.simulator.document.elementFromPoint(coords[0], coords[1]).click();
		});

		// tracker scroll event
		socket.on('scroll', function(coords){
			console.log('indian scroll event');
			window.simulator.scrollTo(coords[0],coords[1]);
		});


		// tracker mouse move event
		socket.on('mouse', function(coords){
			
			//console.log('indian mouse move', coords);
			$('#mouse-tracker').css({
				left: coords[0],
				top: coords[1]
			});
		});


		// when the track button is clicked
		$('#indian-list .btn').live('click', function(){

			var id = $(this).parents('tr').attr('data-id');
			console.log('tracking #'+id);
			var indian = Davy.db[id];
			socket.emit('track', id );

			//window.simulator = window.open(indian.url, '_blank', 'innerWidth='+indian.details.viewportWidth+',innerHeight='+indian.details.viewportWidth+',location=no,menubar=no,status=no,titlebar=no,toolbar=no,resizable=no,directories=no');

			var url;
			if( indian.url.search('\\?') != -1 ){
				url = indian.url+'&notrack=1';
			} else {
				url = indian.url+'?notrack=1';
			}

			$('#simulator').attr('src', url);
			$('#simulator').css({
				width: indian.details.width,
				height: indian.details.height,
				display:'none'
			}).fadeIn('slow', function(){
				var pos = $('#simulator').offset();
				//console.log(Davy.simulatorPos);
				$('#simulator-cover').css({
				width: indian.details.width,
				height: indian.details.height,
				left: pos.left,
				top: pos.top
			});
			});


			$('.nav .tracker').click();

			//window.simulator.document.body.appendChild($('<div id="mousetracker" style="width:20px;height:20px;background:red;position:absolute;z-index:2000;"></div>'));

			/*
			if (window.simulator.jQuery.twinkle == undefined){
				var head = window.simulator.document.getElementsByTagName("head")[0];         
				var script = window.simulator.document.createElement('script');
				script.type = 'text/javascript';
				cssNode.src = 'crocket/javascript/jquery.twinkle.js';
				head.appendChild(script);
			}*/
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
		hash = hash.substr(1);
		Davy.face.navTo(hash);

		// welcome banner action
		$("#welcome .show-indians").click(function(){
			$('.nav a[href=#indians]').click();
		});
	},
	newClient : function(id, data) {

		var n = '<tr data-id="'+id+'" style="display:none">';
		n += '<td class="id"><button class="btn">track #'+id+'</button></td>';
		n += '<td>'+data.url+'</td>';
		n += '<td>'+data.details.OS+'</td>';
		n += '<td>'+data.details.browser+'</td>';
		n += '</tr>';
		$('#indian-list tbody').append(n);
		$('#indian-list tr[data-id='+id+']').fadeIn();
	},
	removeClient : function(id){
		var row = $('#indian-list tr[data-id='+id+']');
		$('button', row).addClass('disabled');
		$(row).addClass('dead');
	},
	checkEmpty:function(){
		if($('#indian-list tbody tr').length == 0){
			$(".main-content.indians .empty").fadeIn();
		} else {
			$(".main-content.indians .empty").slideUp();
		}
	},
	navTo : function( tab ){

		if ($.trim(tab) != ''){
			var item = $('.nav .'+tab);
			if (item.length == 1){
				$(item).click();
				window.location.hash = tab;
			} else {
				console.log('no tab called '+tab);
			}
		}
	}
		
};


jQuery(function($){
	Davy.face.init();
	Davy.init();
});
