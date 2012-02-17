var fm = { 
    is_topbar_expanded: false,
    is_slide_primary: true,
    last_scroll_top: 0,
    scrollOwner: $.browser.msie || $.browser.mozilla || $.browser.opera ? "html" : "body",
    toggleTopbar: function(e) {
        //fm.toggleOverlay();
        $("#top-panel > .wrapper > .main").slideToggle();
        $("#search").toggle();
        $("#topbar .tab .button").toggle();
        e.stopPropagation(); 
    },
    toggleOverlay: function(e) {
        $o = $("#overlay");
        if($o.css("display") === "none") {
            $o.show();
            $o.animate({"opacity": 0.8}); 
        }
        else 
            $o.animate({"opacity": 0}, function() {$o.hide();}); 
    },
    scrollTo: function(pos) {
        $(fm.scrollOwner).animate({"scrollTop": pos});
    },
    onWindowResize: function(e) {
        if (fm.is_slide_primary)
            $("#main.slider").height($("#main.slider > .slide.primary").height()); 
        else
            $("#main.slider").height($("#main.slider > .slide.secondary").height()+4); 
    }
};
/* Web Services */
fm.ws = {
    "docs": {
        "search": 
        /* Search relevant docs according to some conditions
         * @arg tag string
         * @arg keywords array
         * @arg sort_key string
         * @arg from
         * @arg to 
         * */
        function() {

        },
        "upload": function() {
        },
        "delete": function() {},
        "edit": function() {},
        "detail": function() {}
    },
    "tags": {
        "list": function() {},
        "edit": function() {},
        "add": function() {},
    },
    "tag": {
        "add": function() {},
        "edit": function() {},
        "delete": function() {}
    }
};
$(document).ready(function() {
    // Event handlers
    // Open/close top-panel
    $("#topbar .slide.primary .title").click(fm.toggleTopbar);
    $("#top-panel .entries .entry").click(fm.toggleTopbar);
    $("#overlay").click(fm.toggleTopbar);
    // Expand search bar
    $("#search").focus(function(e){
        $("#search").animate({"width":"8em"}, "fast");
        e.stopPropagation();
    });
    $("#main .entry li.button.arrow-right-icon").click(function(e) {
        if(fm.is_slide_primary) {
            fm.is_slide_primary = false;
            fm.last_scroll_top = $(window).scrollTop();
            $(".slide").animate({"left":"-=100%"});
            fm.scrollTo(0);
            $("#top-panel .main .tab.primary").hide();
            $("#top-panel .bottombar").hide();
            $("#top-panel .main .tab.secondary").show();
            fm.onWindowResize();    
        }
    });
    $("#topbar .slide.secondary .button.arrow-left-icon").click(function(e) {
        if(!fm.is_slide_primary) {
            fm.is_slide_primary = true;
            $(".slide").animate({"left":"+=100%"});
            $("#top-panel .main .tab.primary").show();
            $("#top-panel .bottombar").show();
            $("#top-panel .main .tab.secondary").hide();
            fm.scrollTo(fm.last_scroll_top);
            fm.onWindowResize();
        } 
    }); 
    $(window).resize(fm.onWindowResize);
    fm.onWindowResize();
});


