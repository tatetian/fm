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
            $("#main.slider").height($("#main.slider > .slide.secondary").height()); 
    }
};
$(document).ready(function() {
    // Event handlers
    // Open/close top-panel
    $("#topbar .slide.primary .title span").click(fm.toggleTopbar);
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
            fm.onWindowResize();    
        }
    });
    $("#topbar .slide.secondary .button.arrow-left-icon").click(function(e) {
        if(!fm.is_slide_primary) {
            fm.is_slide_primary = true;
            $(".slide.primary").animate({"left":"0%"});
            $(".slide.secondary").animate({"left":"100%"});
            fm.onWindowResize();
        } 
    }); 
    $(window).resize(fm.onWindowResize);
    fm.onWindowResize();
});


