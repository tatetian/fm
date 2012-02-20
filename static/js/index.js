/********************************FmClient********************************/
function FmManager() {
    this.topPanel = new FmTopPanel(this);
    this.mainPanel = new FmMainPanel(this);
    this.webService = new FmWebService(this);

    this.state = {
        isPrimaryView : true,
        lastScrollTop: 0,
        lastSearch: {
            tag: null,
            keywords: null
        }
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
    var manager = this;
    this.topPanel.clickLeftBtn(function(e) {
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
    this.mainPanel.clickRightBtn(function(e) {
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
// do a new search
FmManager.prototype.search = function(tag, keywords) {
    // sotre search terms
    this.state.lastSearch.tag = tag;
    this.state.lastSearch.keywords = keywords;
    // show loading
    this.showLoading();
    // do search
    var manager = this;
    this.webService.docsSearch(tag, keywords, function(response) {
        if(!response.error) {
            manager.mainPanel.showResult(response.result);
            manager.hideLoading();
        }
        else {  // handle error
            
        }
    });
}
// continue last search
FmManager.prototype.more = function() {
    // continue last search
    var tag = this.state.lastSearch.tag;
    var keywords = this.state.lastSearch.keywords;
    // do the search
    var manager = this;
    this.mainPanel.showLoadingMore();
    this.webService.docsSearch(tag, keywords, function(response) {
        if(!response.error) {
            manager.mainPanel.showMoreResult(response.result);
            manager.mainPanel.hideLoadingMore();
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
    var topPanel = this;
    function onToggle(e) {
        topPanel.toggle();
        e.stopPropagation();
    }
    $(this.elements.titleLbl).click(onToggle);
    $(this.elements.entry).click(onToggle);
    $("body").click(function(e) {
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
        me: "#main.slider",
        primaryView: "#main.slider > .slide.primary",
        secondaryView: "#main.slider > .slide.secondary",
        rightBtns: ".entry li.button.arrow-right-icon",
        result: "#main > .slide.primary > .result",
        moreEntry: "#main > .slide.primary > .result > .entry.more"
    };
    this.state = {
        entriesTotal: 0,
        entriesNum: 0 
    };
    this.$moreEntry = $('<div class="entry more">' +
                        '<div class="info"><h3><em>More</em></h3></div>' + 
                        '<ul class="buttons">' + 
                        '<li class="button arrow-down-icon"></li>' + 
                        '</ul>' +
                        '</div>')
    this.resultHtmlBuilder = new FmResultHtmlBuilder();
}
FmMainPanel.prototype.init = function() {
    // init variables 
    var mainPanel = this;
    var manager = this.manager;
    // windows resize
    $(window).resize(function(e) {
        mainPanel.updateHeight();
    });
    // click for more entries
    this.$moreEntry.click(function(e) {
        manager.more();
    });
    // set the height of main panel to reveal content
    this.updateHeight();
}
FmMainPanel.prototype.updateHeight = function() {
    if (this.manager.state.isPrimaryView)
        $(this.elements.me).height($(this.elements.primaryView).height()); 
    else
        $(this.elements.me).height($(this.elements.secondaryView).height()); 
}
FmMainPanel.prototype.clickRightBtn = function(data, callback) {
    $(this.elements.me).delegate(
            this.elements.rightBtns, 
            "click", 
            data, 
            callback);
}
FmMainPanel.prototype.showResult = function(result) {
    var entries = result.entries;
    var $result = $(this.elements.result);
    // remove old result
    $result.hide();
    $result.children().remove();
    // update counter
    this.state.entriesNum = entries.length;
    this.state.entriesTotal = result.total;
    // build new result HTML elements
    var resultHtml = this.resultHtmlBuilder.newHtml(entries);
    $result.append(resultHtml);
    // toggle more indicator
    this.updateMoreEntry();
    // show it
    var mainPanel = this;
    $result.fadeIn('fast', function() {
        mainPanel.updateHeight();
    });
}
FmMainPanel.prototype.showMoreResult = function(moreResult) {
    var entries = moreResult.entries;
    var $result = $(this.elements.result);
    // update counter
    this.state.entriesNum += entries.length;
    // build more result HTML elements
    var moreResultHtml = this.resultHtmlBuilder.moreHtml(entries);
    // append
    var $moreResultHtml = $(moreResultHtml);
    this.$moreEntry.detach();
    $moreResultHtml.hide();
    $result.append($moreResultHtml);
    this.updateMoreEntry();
    // show it
    var mainPanel = this;
    $moreResultHtml.fadeIn('fast', function(){
        mainPanel.updateHeight();
    });
}
FmMainPanel.prototype.updateMoreEntry = function() {
    if (this.state.entriesNum < this.state.entriesTotal) {
    //    $(this.elements.moreEntry).show();
        this.$moreEntry.appendTo($(this.elements.result));
    }
    else {
    //    $(this.elements.moreEntry).hide();
        this.$moreEntry.detach();
    }
}
FmMainPanel.prototype.showLoadingMore = function() {
    this.$moreEntry.addClass('loading');
}
FmMainPanel.prototype.hideLoadingMore = function() {
    this.$moreEntry.removeClass('loading');
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
FmWebService.prototype.docsSearch = function(tag, keywords, callback) {
    var response = {
        id: 1,
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
                    addedOn: "Feb 19 2012",
                    tags: ["column store", "VLDB'09"] },
                {   docId: "3333333",
                    title: "The End of an Architectural Era", 
                    authors: "Michael Stonebraker, Samuel Madden, Daniel J. Abadi", 
                    publication: "VLDB '07", 
                    addedOn: "Feb 19 2012",
                    tags: ["column store"] } 
            ]
        }
    };
    setTimeout(function() {
        callback(response);
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
/*******************************FmResultConstructor****************************/
function FmResultHtmlBuilder() {
    this.MONTH_STR = ['JAN', 'FEB', 'MAR', 'APR', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    this.init();
}
FmResultHtmlBuilder.prototype.init = function() {
    this.lastGroup = null;
}
FmResultHtmlBuilder.prototype.newHtml = function(entries) {
    this.init();
    return this.toHtml(entries);
}
FmResultHtmlBuilder.prototype.moreHtml = function(entries) {
    return this.toHtml(entries);
}
FmResultHtmlBuilder.prototype.decideTimeGroup = function(entry) {
    var now = new Date().getTime();
    var date = new Date(Date.parse(entry.addedOn));
    var time = date.getTime();
    if (time >= now - 30*60*1000) {  // within in half an hour
        return "just now";
    }
    else if ( time >= DateConstants.TODAY ) {    // within today
        return "today";
    }
    else if ( time >= DateConstants.YESTERDAY ) {
        return "yesterday";
    }
    else if ( time >= DateConstants.THIS_WEEK ) {
        return "this week";
    }
    else if ( time >= DateConstants.LAST_WEEK) {
        return "last week";
    }
    else if ( time >= DateConstants.THIS_MONTH ) {
        return "this month";
    }
    else if ( time >= DateConstants.LAST_MONTH ) {
        return "last month";
    }
    else if ( time >= DateConstants.THIS_YEAR ) {    // within this year
        return this.MONTH_STR[date.getMonth()]; 
    }
    else {  
        return this.MONTH_STR[date.getMonth()] + ' ' + this.getFullYear(); 
    }
}
FmResultHtmlBuilder.prototype.toHtml = function(entries) {
    // According to www.learningjquery.com/2009/03/43439-reasons-to-use-append-correct
    // below is the fastest way to insert many HTML elements into DOM
    var rightBtnHtml = '<ul class="buttons"><li class="button arrow-right-icon"></li></ul>';
    var htmlToInsert = [];
    var l = entries.length;
    for(var i = 0; i < l; ++i) {
        var e = entries[i];
        var group = this.decideTimeGroup(e);
        var firstInGroup = false;
        if(group != this.lastGroup) {
            htmlToInsert.push('<div class="title"><h4>' + group + '<span class="nip"></span></h4></div>');
            firstInGroup = true;
            this.lastGroup = group;
        }
        htmlToInsert.push('<div class="entry' + 
                          (firstInGroup?' first':'')+ '">');
        htmlToInsert.push('<div class="info">');
        htmlToInsert.push('<h3><em>' + e.title + '</em></h3>');
        if(e.authors) {
            htmlToInsert.push('<p>' + e.authors + 
                (e.publication? '. ' + e.publication : '') + '</p>');
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
    return htmlToInsert.join('');
}
/******************************Initialization********************************/
$(document).ready(function() {
    // init manager
    var manager = new FmManager();
    manager.init();
});


