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

    Davy.Admin = function() {

        var that = this;
        this.db = [];

        // @TODO: for some reason init is running twice
        this.init = function(){

            // connect to davy server
            this.socket = io.connect('http://localhost:8000/admin');

            this.socket.on('connect', function(){
               console.log('[Davy] connected');
            });

            // load initial indians database
            this.socket.on('db', function (data) {
                console.log('[Davy] loaded list of clients', data);
                $.each(data, function(id, indian){
                    that.db[id] = indian;
                    that.interface.addClient(id, indian);
                });
                that.interface.checkEmpty();
            });

            // an indian connected
            this.socket.on('db new', function (indian) {
                that.db[indian.id] = indian.data;
                that.interface.addClient(indian.id,indian.data);
                that.interface.checkEmpty();
            });

            // an indian disconnected
            this.socket.on('db remove', function (client_id) {
                delete that.db.client_id;
                that.interface.removeClient(client_id);
            });


            // track click event
            this.socket.on('click', function(coords){

                console.log('[Davy] tracked click event', coords);

                $('#mouse-tracker').css({
                    left:coords[0],
                    top:coords[1]

                }).twinkle({
                    widthRatio:0,
                    heightRatio:0,
                    effect:'splash'
                });

                window.simulator.document.elementFromPoint(coords[0], coords[1]).click();
                //console.log('target', target);
                //console.log($('#simulator').contents().find(target).click());
                //$(target).trigger('click');
            });

            // track scroll event
            this.socket.on('scroll', function(coords){
                console.log('[Davy] tracked scroll event');
                window.simulator.scrollTo(coords[0],coords[1]);
            });

            // track mousemove event
            this.socket.on('mouse', function(coords){
                $('#mouse-tracker').css({
                    left: coords[0],
                    top: coords[1]
                });
            });


            this.interface.init();
        };


        // interface
        this.interface = {

            init : function(){

                console.log('[Davy] interface init');

                // main navigation
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
                that.interface.navTo(hash);

                // welcome banner action
                $("#welcome .show-indians").click(function(){
                    $('.nav a[href=#indians]').click();
                });

                // when the track button is clicked
                $('#indian-list .btn').live('click', function(){

                    var id = $(this).parents('tr').attr('data-id');
                    console.log('tracking #'+id);
                    var indian = that.db[id];
                    that.socket.emit('track', id );


                    var url;
                    if( indian.url.match('\\?')){
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
                            $('#simulator-cover').css({
                                width: indian.details.width,
                                height: indian.details.height,
                                left: pos.left,
                                top: pos.top
                            });
                        });


                    $('.nav .tracker').click();


                });
            },
            addClient : function(id, data) {

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
            checkEmpty : function(){
                if(!$('#indian-list tbody tr').length){
                    $(".main-content.indians .empty").fadeIn();
                } else {
                    $(".main-content.indians .empty").slideUp();
                }
            },
            navTo : function( tab ){

                console.log('navto', tab);
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

        this.init();
    };

    $(function(){
        Davy.admin = new Davy.Admin;
    });


})(jQuery, 'Davy');
