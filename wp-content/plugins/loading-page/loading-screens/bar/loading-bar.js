(function ($) {

    $.loadingpage = $.loadingpage || {};
    $.loadingpage.graphics = $.loadingpage.graphics || {};

    $.loadingpage.graphics['bar'] = {
        created: false,
        attr   : {},
        create : function(options){
            options.backgroundColor = options.backgroundColor || "#000000";
            options.height          = options.height || 1;
            options.foregroundColor = options.foregroundColor || "#FFFFFF";
            
            var css_o = {
                width: "100%",
                height: "100%",
                backgroundColor: options.backgroundColor,
                position: "fixed",
                zIndex: 666999,
                top: 0,
                left: 0
            };
            
            if( options[ 'backgroundImage' ] ){
                css_o['backgroundImage']  = 'url('+options[ 'backgroundImage' ]+')';
                css_o['background-repeat'] = options[ 'backgroundRepeat' ];
                css_o['background-position'] = 'center center';

                if( 
                    css_o['background-repeat'].toLowerCase() == 'no-repeat' && 
                    typeof options['fullscreen'] !== 'undefined' &&
                    options['fullscreen']*1 == 1 
                )
                {
                    css_o[ "background-attachment" ] = "fixed";
                    css_o[ "-webkit-background-size" ] = "contain";
                    css_o[ "-moz-background-size" ] = "contain";
                    css_o[ "-o-background-size" ] = "contain";
                    css_o[ "background-size" ] = "contain";
                }
            }
            
            this.attr['overlay'] = $("<div class='lp-screen'></div>").css(css_o).appendTo("body");
            
            this.attr['bar'] = $("<div class='lp-screen-graphic'></div>").css({
                height: options.height+"px",
                marginTop: "-" + (options.height / 2) + "px",
                backgroundColor: options.foregroundColor,
                width: "0%",
                position: "absolute",
                top: "50%"
            }).appendTo(this.attr['overlay']);
            
            if (options.text) {
                this.attr['text'] = $("<div class='lp-screen-text'></div>").text("0%").css({
                    height: "40px",
                    width: "100px",
                    position: "absolute",
                    fontSize: "3em",
                    top: "50%",
                    left: "50%",
                    marginTop: "-" + (59 + options.height) + "px",
                    textAlign: "center",
                    marginLeft: "-50px",
                    color: options.foregroundColor
                }).appendTo(this.attr['overlay']);
            }
            
            this.created = true;
        },
        
        set : function(percentage){
            this.attr['bar'].stop().animate({
                width: percentage + "%",
                minWidth: percentage + "%"
            }, 200);

            if (this.attr['text']) {
                this.attr['text'].text(Math.ceil(percentage) + "%");
            }
        },
        
        complete : function(callback){
            callback();
            var me = this;
            this.attr['overlay'].fadeOut(500, function () {
                me.attr['overlay'].remove();
            });
        }
    };
})(jQuery);