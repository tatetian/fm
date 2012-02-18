/********************************FmClient********************************/
function FmManager() {
    this.topPanel = new FmTopPanel(this);
    this.mainPanel = new FmMainPanel(this);
    //this.webService = FmWebService(this);

    this.state = {
        isPrimaryView : true,
        lastScrollTop: 0
    };
    this.elements = {
        scrollOwner: $.browser.msie || $.browser.mozilla || $.browser.opera ? "html" : "body",
        slides: ".slide"
    };
}
FmManager.prototype.init = function() {
    // init components
    this.topPanel.init();
    this.mainPanel.init();
    // init slide event
    this.topPanel.clickLeftBtn({manager: this}, function(e) {
        var manager = e.data.manager;
        if(!manager.state.isPrimaryView) {
            manager.state.isPrimaryView = true;
            $(manager.elements.slides).animate({"left":"+=100%"});
           /* $("#top-panel .main .tab.primary").show();
            $("#top-panel .bottombar").show();
            $("#top-panel .main .tab.secondary").hide();*/
            manager.scrollTo(manager.state.lastScrollTop);
            manager.mainPanel.windowResize();
        } 
    });
    this.mainPanel.clickRightBtn({manager: this}, function(e) {
        var manager = e.data.manager;
        if(manager.state.isPrimaryView) {
            manager.state.isPrimaryView = false;
            manager.state.lastScrollTop = $(window).scrollTop();
            $(manager.elements.slides).animate({"left":"-=100%"});
            manager.scrollTo(0);
/*            $("#top-panel .main .tab.primary").hide();
            $("#top-panel .bottombar").hide();
            $("#top-panel .main .tab.secondary").show();*/
            manager.mainPanel.windowResize();    
        }
    }); 
}
FmManager.prototype.showLoading = function() {
}

FmManager.prototype.hideLoading = function() {
}
FmManager.prototype.scrollTo = function(pos) {
     $(this.elements.scrollOwner).animate({"scrollTop": pos});
}
/*******************************FmTopPanel*******************************/
function FmTopPanel(manager) {
    this.manager = manager;
    this.state = {
        expanded: false
    };
    this.elements = {
        "searchInput": "#search",
        "mainView": "#top-panel > .wrapper > .main",
        "topbarBtns": "#topbar .tab .button",
        "titleLbl": "#topbar .title",
        "entry": "#top-panel .entries .entry",
        "leftBtn": "#topbar .slide.secondary .button.arrow-left-icon"
    };
}
FmTopPanel.prototype.init = function() {
    // toggle toppanel
    function onToggle(e) {
        e.data.topPanel.toggle();
        e.stopPropagation();
    }
    $(this.elements.titleLbl).click({topPanel: this}, onToggle);
    $(this.elements.entry).click({topPanel: this}, onToggle);
    $("body").click({topPanel: this}, function(e) {
        topPanel = e.data.topPanel;
        if(topPanel.state.expanded)
            topPanel.onToggle();
    });
    // animate search bar
    $(this.elements.searchInput).focus(function(e){
        $(this).animate({"width":"8em"}, "fast");
        e.stopPropagation();
    });
}
FmTopPanel.prototype.toggle = function() {
    $(this.elements.mainView).slideToggle();
    $(this.elements.searchInput).toggle();
    $(this.elements.topbarBtns).toggle();
    this.state.expanded = !this.state.expanded;
}
FmTopPanel.prototype.clickLeftBtn = function(data, callback) {
    $(this.elements.leftBtn).click(data, callback);
}
/******************************FmMainPanel*******************************/
function FmMainPanel(manager) {
    this.manager = manager;
    this.elements = {
        "me": "#main.slider",
        "primaryView": "#main.slider > .slide.primary",
        "secondaryView": "#main.slider > .slide.secondary",
        "rightBtns": ".entry li.button.arrow-right-icon"
    };
}
FmMainPanel.prototype.init = function() {
    $(window).resize({ mainPanel: this }, function(e) {
        e.data.mainPanel.windowResize();
    });
    this.windowResize();
}
FmMainPanel.prototype.windowResize = function() {
    if (this.manager.state.isPrimaryView)
        $(this.elements.me).height($(this.elements.primaryView).height()); 
    else
        $(this.elements.me).height($(this.elements.secondaryView).height()+4); 
}
FmMainPanel.prototype.clickRightBtn = function(data, callback) {
    $(this.elements.me).delegate(
            this.elements.rightBtns, 
            "click", 
            data, 
            callback);
}
/* Web Services */
ws = {
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
    var manager = new FmManager();
    manager.init();
});


