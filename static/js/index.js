/********************************FmClient********************************/
function FmManager() {
    this.topPanel = new FmTopPanel(this);
    this.mainPanel = new FmMainPanel(this);
    this.webService = new FmWebService(this);

    this.state = {
        isPrimaryView : true,
        lastScrollTop: 0
    };
    this.elements = {
        scrollOwner: $.browser.msie || $.browser.mozilla || $.browser.opera ? "html" : "body",
        slides: ".slide",
        loader: "body > .loading"
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
            manager.mainPanel.updateHeight();
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
            manager.mainPanel.updateHeight();    
        }
    }); 
    // load data
    this.search("all", null);
}
FmManager.prototype.showLoading = function() {
    $(this.elements.loader).fadeIn();
}
FmManager.prototype.hideLoading = function() {
    $(this.elements.loader).fadeOut();
}
FmManager.prototype.scrollTo = function(pos) {
     $(this.elements.scrollOwner).animate({"scrollTop": pos});
}
FmManager.prototype.search = function(tag, keywords) {
    var context = {manager: this};
    this.webService.docsSearch(tag, keywords, context, function(response, context) {
        var manager = context.manager;
        if(!response.error) {
            manager.mainPanel.showResult(response.result);
            manager.hideLoading();
        }
        else {  // handle error
            
        }
    });
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
        "rightBtns": ".entry li.button.arrow-right-icon",
        "result": "#main .slide.primary .result"
    };
}
FmMainPanel.prototype.init = function() {
    $(window).resize({ mainPanel: this }, function(e) {
        e.data.mainPanel.updateHeight();
    });
    this.updateHeight();
}
FmMainPanel.prototype.updateHeight = function() {
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
FmMainPanel.prototype.showResult = function(result) {
    var $result = $(this.elements.result);
    // remove old result
    $result.hide();
    $result.children().remove();
    // construct new result
    // according to www.learningjquery.com/2009/03/43439-reasons-to-use-append-correct
    // below is the best way to insert many HTML elements into DOM
    var rightBtnHtml = '<ul class="buttons"><li class="button arrow-right-icon"></li></ul>';
    var htmlToInsert = [];
    var entries = result.entries;
    var l = entries.length;
    htmlToInsert.push('<div class="sub-result">');
    htmlToInsert.push('<div class="entries">');
    for(var i = 0; i < l; ++i) {
        var e = entries[i];
        htmlToInsert.push('<div class="entry">');
        htmlToInsert.push('<div class="info">');
        htmlToInsert.push('<h3><em>' + e.title + '</em></h3>');
        if(e.authors) {
            htmlToInsert.push('<p>' + e.authors + 
                (e.publication? '.&nbsp' + e.publication : '') + '</p>');
        }
        var k = e.tags.length;
        if(k > 0) {
            htmlToInsert.push('<p>');
            for(var j = 0; j < k; ++j) {
                htmlToInsert.push('<span class="tag">' + e.tags[j] + '</span>');
            }
            htmlToInsert.push('</p>');
        }
        htmlToInsert.push('</div>');
        htmlToInsert.push(rightBtnHtml);
        htmlToInsert.push('</div>'); 
    }
    htmlToInsert.push('</div></div>');
    $result.append(htmlToInsert.join('')); 
    $result.fadeIn();
    // 
    this.updateHeight();
}
/**************************Web Service**************************************/
function FmWebService() {
    this.url = {
        root: "ws/",
        docsSearch: "docs/search",
        docsUpload: "docs/upload",
        docsDelete: "docs/"
    };
}
FmWebService.prototype.docsSearch = function(tag, keywords, context, callback) {
    var response = {
        error: null,
        result: {
            sortedBy: "addedOn",
            total: 15,
            entries: [
                {   docId: "1111111",
                    title: "Zephyr: Live Migration in Shared Nothing Databases for Elastic Cloud Platforms",
                    authors: "Peter Bakkum, Kevin Skadron", 
                    publication: "SIGMOD 2011",
                    year: "2011",
                    addedOn: "Feb 19 2012",
                    tags: ["live migration", "SIGMOD'11"] },
                {   docId: "2222222",
                    title: "Brighthouse: An Analytic Data Warehouse for Ad-hoc Queries", 
                    authors: "Dominik Slezak, Jakub Wroblewski, Victoria Eastwood, Piotr Synak", 
                    publication: "VLDB '09", 
                    addedOn: "Feb 8 2012",
                    tags: ["column store", "VLDB'09"] },
                {   docId: "3333333",
                    title: "The End of an Architectural Era", 
                    authors: "Michael Stonebraker, Samuel Madden, Daniel J. Abadi", 
                    publication: "VLDB '07", 
                    addedOn: "Jan 6 2012",
                    tags: ["column store"] } 
            ]
        }
    };
    setTimeout(function() {
        callback(response, context);
    }, 1000);
}
FmWebService.prototype.docsUpload = function() {
}
FmWebService.prototype.docsDelete = function() {
}
FmWebService.prototype.docsDetail = function() {
}
FmWebService.prototype.docsEdit = function() {
}
FmWebService.prototype.tagsList = function() {
}
FmWebService.prototype.tagAdd = function() {
}
FmWebService.prototype.tagEdit = function() {
}
FmWebService.prototype.tagDelete = function() {
}
/******************************Initialization********************************/
$(document).ready(function() {
    var manager = new FmManager();
    manager.init();
});


