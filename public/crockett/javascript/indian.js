/*!
 * Davy Crockett
 * Copyright(c) 2010 Pedro Solá <p3dro.sola@gmail.com>
 * All Rights Reserved
 */


(function($, namespace){

    if (window[namespace]) {
        console.warn('Namespace conflict. "'+namespace+'" is already defined');
        return;
    }

    // export global object. change the namespace at the end of the file
    var Davy = window[namespace] = {};

    $(function(){
        Davy.indian = new Davy.Indian();
    });




    Davy.Indian = function() {

        var that = this;
        this.tracking = false;

        this.init = function(){

            // connect to server
            this.socket = io.connect('http://localhost:8000/tracker');

            // bind event handlers
            this.socket.on('connect', function(){
                console.log('[Davy] connected. id:'+this.socket.sessionid);
                that.id = this.socket.sessionid;
            });
            this.socket.on('disconnect', function(){
                console.log('[Davy] disconnected');
                that.stopTracking();
            });

            this.socket.on('track', that.startTracking );
            this.socket.on('stop track', that.stopTracking );


            // emit: send details to server
            var details = BrowserDetect.init();
            details.width = $(window).width();
            details.height = $(window).height();

            this.socket.emit('open page', {
                url: window.location.href,
                details:details
            });

        };

        // capture & send events
        // @TODO: performance: throttling via $.throttle seems to hurt performance a bit. consider reverting to custom throttler
        this.startTracking = function(){
            that.tracking = true;

            // click event
            $(document).on('click', function(e){
                that.socket.emit('click', [e.clientX, e.clientY]);
            });

            // mousemove event
            $(document).on('mousemove', $.throttle(50, function(e){
                that.socket.emit('mouse', [e.clientX, e.clientY]);
            }));

            // scroll event
            $(window).on('scroll', $.throttle(50, function(){
                var position = [$(document).scrollLeft(),$(document).scrollTop()];
                that.socket.emit('scroll', position);
            }));

            // @TODO: handle keyboard events

        };

        // unbind event handlers
        this.stopTracking = function(){
            that.tracking = false;
            console.log('stop tracking');

            $(document).off('click');
            $(document).off('mousemove');
            $(window).off('scroll');
        };

        // start the party!
        if (!window.location.href.match('notrack=1')) this.init();

    };


    // cross-browser click trigger
    HTMLElement.prototype.click = function() {
        var evt = this.ownerDocument.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        this.dispatchEvent(evt);
    }


})(jQuery, 'Davy'); // change Namespace here



