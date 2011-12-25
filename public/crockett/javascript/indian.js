
/*!
 * Davy Crockett
 * Copyright(c) 2010 Pedro Solá <p3dro.sola@gmail.com>
 * All Rights Reserved
 */


/* Adds jQuery if it's not alvailable on the page */
if (jQuery == undefined) {
	console.log('adding jQuery');
	var head = document.getElementsByTagName("head")[0];         
	var script = document.createElement('script');
	script.type = 'text/javascript';
	cssNode.src = 'crocket/javascript/jquery.js';
	head.appendChild(script);
	jQuery.noConflict();
}


jQuery(function($){
	

// get client details
BrowserDetect.init();

var elem = (document.compatMode === "CSS1Compat") ? 
	document.documentElement : document.body;

var height = elem.clientHeight;
var width = elem.clientWidth;

var details = {
		os : BrowserDetect.OS,
		browser : BrowserDetect.browser,
		browserVersion : BrowserDetect.version,
		viewportHeight: height,
		viewportWidth: width
};

indian.init(details);


// register interaction event handlers
document.onclick = function(e) {
	if (e.type == 'click') {
		indian.sendClick(indian.getMousePosition());
	}
	
}
window.onscroll = function(e){
	clearTimeout(indian.scrollDampner);

	var x = (document.all ? document.scrollLeft : window.pageXOffset);
	var y = (document.all ? document.scrollTop : window.pageYOffset);

	indian.scrollDampner = setTimeout(indian.sendScroll([x, y]), 500 );
}

setInterval(indian.sendMousePosition, 1000);

HTMLElement.prototype.click = function() {
	var evt = this.ownerDocument.createEvent('MouseEvents');
	evt.initMouseEvent('click', true, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
	this.dispatchEvent(evt);
}
		
}); // end jQuery document.ready
			
var indian = {

	'scrollDampner' : null,

	'conf' : function(configuraiton) {
		// TODO: merge config with defaults
		this.conf = configuration;	
	},

	'init' : function(details){

		this.id;
		this.tailing = false;
		this.socket = io.connect('http://localhost:8000/tracker');

		this.socket.on('connect', function(t){
			console.log('indian spawned:'+this.socket.sessionid);
			this.id = this.socket.sessionid;
		});
		this.socket.emit('open page', { 
			url: window.location.href,
			details: details ,
			groupBy: 'ip'
			}
		);

		this.socket.on('tailing', function(){
			//alert('looks like i\'m being tailed! '+this.id);
			this.tailing = true;
		});
	},
	'sendClick' : function(data){
		this.socket.emit('click', data);
	},
	'sendScroll' : function(coords){
		this.socket.emit('scroll', coords);
	},

	getMousePosition: function(e){
		var posx = 0;
		var posy = 0;
		if (!e) var e = window.event;
		if (e.pageX || e.pageY) 	{
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) 	{
			posx = e.clientX + document.body.scrollLeft
				+ document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop
				+ document.documentElement.scrollTop;
		}
		return [posx, posy];
	},

	sendMousePosition : function(){
		//this.socket.emit('mouse', indian.getMousePosition());
		console.log('sending mouse position');
	}

};