var fm = {
    is_topbar_expanded: false,
    is_slide_primary: true,
    toggleTopbar: function(e) {
        $("#top-panel > .wrapper > .main").slideToggle();
        $("#search").toggle();
        $("#topbar .tab .button").toggle();
        e.stopPropagation(); 
    },
    onWindowResize: function(e) {
        if (fm.is_slide_primary)
            $("#main.slider").height($("#main.slider > .slide.primary").height()); 
        else
            $("#main.slider").height($("#main.slider > .slide.secondary").height()+4); 
    }
};
$(document).ready(function() {
    // Event handlers
    // Open/close top-panel
    $("#topbar .slide.primary .title").click(fm.toggleTopbar);
    $("#top-panel .entries .entry").click(fm.toggleTopbar);
    // Expand search bar
    $("#search").focus(function(e){
        $("#search").animate({"width":"8em"}, "fast");
        e.stopPropagation();
    });
    $("#main .entry li.button.arrow-right-icon").click(function(e) {
        if(fm.is_slide_primary) {
            fm.is_slide_primary = false;
            $(".slide.primary").animate({"left":"-100%"});
            $(".slide.secondary").animate({"left":"0%"});
            $("#top-panel .main .tab.primary").hide();
            $("#top-panel .bottombar").hide();
            $("#top-panel .main .tab.secondary").show();
            fm.onWindowResize();    
        }
    });
    $("#topbar .slide.secondary .button.arrow-left-icon").click(function(e) {
        if(!fm.is_slide_primary) {
            fm.is_slide_primary = true;
            $(".slide.primary").animate({"left":"0%"});
            $(".slide.secondary").animate({"left":"100%"});
            $("#top-panel .main .tab.primary").show();
            $("#top-panel .bottombar").show();
            $("#top-panel .main .tab.secondary").hide();
            fm.onWindowResize();
        } 
    }); 
    $(window).resize(fm.onWindowResize);
    fm.onWindowResize();
});


