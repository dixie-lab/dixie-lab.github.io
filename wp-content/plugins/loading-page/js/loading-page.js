jQuery(document).ready( function ($) {
	function validateScreenSize( opts )
	{
		if( typeof opts['screen_size'] == 'undefined' || opts['screen_size'] == 'all' || typeof opts['screen_width'] == 'undefined' ) return true;
		var screen_width = parseFloat(opts['screen_width']);
		if( isNaN(screen_width) || !isFinite(screen_width)) return true;
		var w  = window,
			d  = document,
			e  = d.documentElement,
			g  = d.getElementsByTagName('body')[0],
			sw = w.innerWidth || e.clientWidth || g.clientWidth;
		return ( (opts['screen_size'] == 'greater' && screen_width <= sw) || (opts['screen_size'] == 'lesser' && sw <= screen_width) );
	}
		
    /*Browser detection patch*/
    var browser = {};
    browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit/.test(navigator.userAgent.toLowerCase());
    browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
    browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
    browser.msie = /msie/.test(navigator.userAgent.toLowerCase());

    // Defining namespace
    $.loadingpage = $.loadingpage || {};

    var lp = $.loadingpage, // Namespace shortcut
        // Global variables
        
        // Loading page variables
        images = [],
		tmpImages = [];
        done = 0,
        destroyed = false,
        imageContainer = "",
        imageCounter = 0;
            
        // Default options
        default_options = {
            // Options for lazy load
            threshold: 100,
            effect: "show",
            effectspeed: 0,
            
            // Options for loading page
            loadingScreen: true,
            graphic : 'bar',
            onComplete: function () {}, // callback for loading page complete
            backgroundColor: "#000",
            foregroundColor: "#fff",
            text: true,
            deepSearch: true,
            pageEffect: "none"
        },
        
        options; // Default options extended with values passed as parameters
        
    
    // Methods used in lazy load
    lp.loadOriginalImg = function () {
        // Lazy load       
		$( 'body' ).find('.lp-lazy-load').each(function () {
			var e = $(this),
				src = e.attr("data-src");
			if( typeof src != 'undefined' )
			{
				e.attr( 'src', src );
			}	
		});
    };
    
    // Methods used in loading page
    lp.graphicAction = function( action, params ){
        if( typeof lp.graphics != 'undefined' && typeof lp.graphics[options.graphic] != 'undefined' && lp.graphics[options.graphic].created )
        {
            lp.graphics[ options.graphic ][ action ]( params );
        }
    };
    
    lp.ApplyAnimationToElement = function(animName) {
        $('body').addClass('lp-'+animName);
    };
    
    lp.onLoadComplete = function () {
		var time = (typeof options[ 'additionalSeconds' ] != 'undefined' && $.isNumeric( options[ 'additionalSeconds' ] ) ) ? parseInt(options[ 'additionalSeconds' ]) : 0;
		
		setTimeout(function(){$('#loadin_page_codeBlock').hide(); lp.graphicAction( 'complete', function(){ lp.ApplyAnimationToElement(options.pageEffect); options.onComplete(); } );}, time*1000);
        
    };
    
    lp.createPreloadContainer = function() {
        imageContainer = $("<div></div>").appendTo("body").css({
            display: "none",
            width: 0,
            height: 0,
            overflow: "hidden"
        });
        var d = document.domain.toLowerCase();
		imageCounter = images.length;
        for (var i = 0; imageCounter > i; i++) {
            if( tmpImages[i].indexOf( d ) == -1 )
            {
                lp.completeImageLoading();
                continue;
            }
			else
			{
				lp.addImageForPreload( images[i] );
			}	
        }        	
    };
    
    lp.addImageForPreload = function(url) {
        var image = $("<img />").bind("load", function () {
            lp.completeImageLoading();
        }).attr("src", url).appendTo(imageContainer);
    };

    lp.completeImageLoading = function () {
        done++;
        var percentage = (done / imageCounter) * 100;
        lp.graphicAction( 'set', percentage );
        
        if (done == imageCounter) {
            lp.destroyLoader();
        }
    };

    lp.destroyLoader = function () {
		if( !destroyed )
		{	
			destroyed = true;
			lp.graphicAction( 'set', 100 );
			$(typeof imageContainer == 'object').remove();
			lp.onLoadComplete();
		}	
    };

    lp.findImageInElement = function (element, deepSearch) {
        var urls = [];
		if(typeof($(element).attr("src")) != "undefined" && element.nodeName.toLowerCase() == "img")
		{
			urls.push( $(element).attr("src") );
		}	
		else if( deepSearch )
		{	
			if ($(element).css("background-image") != "none") 
			{
				var backImg = $(element).css("background-image"), url='';
				if( /\.(png|gif|jpg|jpeg|bmp)/i.test(backImg) )
				{	
					url = backImg;
					if ( !/gradient/i.test(url) ) 
					{
						url = url.match(/url\s*\(\s*['"]?([^"\)]*)/i);
						if(url !== null )
						{
							url = url[1].replace( /\s*\'*$/, '');
							urls = urls.concat(url.split(","));
						}	
					}
				}
			}
		}
		
		for (var i = 0; i < urls.length; i++) 
		{
			urls[i] = $.trim(urls[i]);
			if (urls[i].length > 0 && $.inArray(urls[i].toLowerCase(), tmpImages ) == -1) 
			{
				tmpImages.push(urls[i].toLowerCase());
				images.push( urls[i] );
			}
		}
    };
    
    $.fn.loadingpage = function(o){
        options = $.extend(
            default_options, o || {}
        );
        // loading page
        if(options['loadingScreen']*1)
		{
            this.each(function() {
				var selector = "img";
                if (options.deepSearch == true) {
					lp.findImageInElement(this, options.deepSearch);
					selector = "*:not(script)";
                }
				$(this).find(selector).each(function() {
					lp.findImageInElement(this, options.deepSearch);
				});
            });
			
			if( images.length )
			{	
				lp.createPreloadContainer();
			}
			else
			{
				lp.destroyLoader();
			}	
        }    
        return this;
    };
	
	if( typeof loading_page_settings != 'undefined' ){
		// Check for body existence and insert the loading screen if enabled
		var b = $("body");
		if( b.length )
		{
			var options = $.extend(
				default_options, loading_page_settings || {}
			);
			
			options[ 'text' ] *= 1;
			options['loadingScreen'] *= 1;
			
			if(options['loadingScreen'] && validateScreenSize(options))
			{
				if( ( typeof lp.graphics != 'undefined' ) && ( typeof lp.graphics[options.graphic] != 'undefined' ) )
				{
					lp.graphics[options.graphic].create(options);
					$( 'body' ).loadingpage( loading_page_settings );
					$('#loadin_page_codeBlock').show();
				}
			}
			b.append( '<style>body{visibility:visible;}</style>' ); 
		}	
	}
	
	$(window).on( 'load', function(){
		if( typeof lp[ 'loadOriginalImg' ] != 'undefined' ) lp.loadOriginalImg();
		if( options['loadingScreen'] && !destroyed ) lp.destroyLoader();
	} );
});