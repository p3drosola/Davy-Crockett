
/*!
 * Davy Crockett
 * Copyright(c) 2010 Pedro Solá <p3dro.sola@gmail.com>
 * All Rights Reserved
 */


/* Adds jQuery if it's not alvailable on the page */
if (jQuery == undefined) {
	//console.log('adding jQuery');
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

var height = $(window).height();
var width = $(window).width();

var details = {
		os : BrowserDetect.OS,
		browser : BrowserDetect.browser,
		browserVersion : BrowserDetect.version,
		viewportHeight: height,
		viewportWidth: width
};

indian.init(details);

// ability to simulate click
HTMLElement.prototype.click = function() {
	var evt = this.ownerDocument.createEvent('MouseEvents');
	evt.initMouseEvent('click', true, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
	this.dispatchEvent(evt);
}
		
}); // end jQuery document.ready
			
var indian = {

	// Indian Variables

	tailing : false,
	socket : null,
	id : null,

	// Scroll variables
	'scrollInterval':null,
	'scrollPosition':[0,0],
	'scrollPositionLastSent':[],

	// Mouse mouse variables
	'mousemoveInterval' : null,
	'mousePosition' : [0,0],
	'mousePositionLastSent' : [],

	'conf' : function(configuraiton) {
		// TODO: configuration
		this.conf = configuration;	
	},

	'init' : function(details){

		this.tailing = false;

		// don't connect if the url contains notrack=1
		if ( window.location.href.search('notrack=1') == -1 ) {

			this.socket = io.connect('http://localhost:8000/tracker');

			this.socket.on('connect', function(t){
				//console.log('indian spawned:'+this.socket.sessionid);
				this.id = this.socket.sessionid;
			});
			this.socket.emit('open page', { 
				url: window.location.href,
				details: details ,
				groupBy: 'ip'
				}
			);

			this.socket.on('tailing', function(){
				indian.tailing = true;
				indian.bindEvents();
			});
		}
	},

	'bindEvents' : function(){
		// register interaction event handlers
		document.onclick = function(e) {
			if (e.type == 'click') {
				var data = [
					indian.mousePosition[0] - indian.scrollPosition[0],
					indian.mousePosition[1] - indian.scrollPosition[1]
				];
				indian.sendClick(data);
			}
			
		}
		window.onscroll = function(e){
			
			var x = (document.all ? document.scrollLeft : window.pageXOffset);
			var y = (document.all ? document.scrollTop : window.pageYOffset);	
			
			indian.scrollPosition = [x,y];

			//$.throttle( 50, indian.sendScroll )

		}
		indian.scrollInterval = setInterval(indian.sendScroll, 50 );

		window.onmousemove = function(e){
			indian.mousePosition =indian.getMousePosition(e);
		}
		indian.mousemoveInterval = setInterval(indian.sendMousePosition, 50);

	},

	'sendClick' : function(data){
		indian.socket.emit('click', data);
	},
	'sendScroll' : function(){
		if (indian.scrollPosition != indian.scrollPositionLastSent) {
			indian.socket.emit('scroll', indian.scrollPosition);
			//console.log('sending scroll');
			indian.scrollPositionLastSent = indian.scrollPosition;
		}
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

		if (indian.mousePosition != indian.mousePositionLastSent){
			//console.log('sending mouse position', indian.mousePosition);
			indian.mousePositionLastSent = indian.mousePosition;

			var data = [
				indian.mousePosition[0] - indian.scrollPosition[0],
				indian.mousePosition[1] - indian.scrollPosition[1]
			]; 
			console.log(data);
			indian.socket.emit('mouse', data);
		} 
	}

};