
	var Davy = {
		
		db :   {},

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
			});

			// an indian connected
			socket.on('db new', function (indian) {
				Davy.db[indian.id] = indian.data;
				Davy.face.newClient(indian.id,indian.data);
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


		},


		// Admin Interface
		face: {
			newClient : function(id, data) {

				var n = '<details id="c_'+id+'">';
				n += '<summary><span class="title">'+id+'</span>';
				n += '<span class="browser '+data.details.browser+'"></span>';
				n += '<span class="os '+data.details.os+'"></span>';
				n += '</summary>';
				n += '<button class="trackbtn btn small primary" data-id="'+id+'">Track</button>';
				n += '<pre>'+Davy.face.dump(data)+'</pre>';
				n += '</details>';
				$('#list-inner').append(n);
			},

			removeClient : function(id){
				$('#list #c_'+id).fadeTo('slow', .2);
			},

			showDetailsPane : function(){
				$('#main').animate({
					width:800
				}, 100);
			},

			hideDetailsPane : function(){
				$('#main').animate({
					width:400
				}, 100);
			},

			// helper to print object details
			// TODO: remove
			dump : function(arr,level) {
				var dumped_text = "";
				if(!level) level = 0;
				
				//The padding given at the beginning of the line.
				var level_padding = "";
				for(var j=0;j<level+1;j++) level_padding += "    ";
				
				if(typeof(arr) == 'object') { //Array/Hashes/Objects 
					for(var item in arr) {
						var value = arr[item];
						
						if(typeof(value) == 'object') { //If it is an array,
							dumped_text += level_padding + "'" + item + "' ...\n";
							dumped_text += Davy.face.dump(value,level+1);
						} else {
							dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
						}
					}
				} else { //Stings/Chars/Numbers etc.
					dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
				}
				return dumped_text;
			}
		},
	}; // end Davy
	Davy.init();