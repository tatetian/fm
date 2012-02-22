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
            //manager.mainPanel.updateHeight();
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
            //manager.showLoading();
            //manager.mainPanel.updateHeight(); 
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
        me: "#top",
        mainView: "#top > .wrapper > .main",
        searchInput: "#search",
        topbarBtns: "#top .tab .button",
        titleLbl: "#top .title",
        entry: "#top .entries .entry",
        leftBtn: "#top .slide.secondary .button.arrow-left-icon",
        tabs: "#top .content .tabs",
        content: "#top .content"
    };
    // scroller
    var scrollContainer = $(this.elements.content).get(0);
    var scrollContent = $(this.elements.tabs).get(0);
    FmMainPanel.container = scrollContainer;
    FmMainPanel.content = scrollContent;
    this.scroller = new FmScroller(scrollContainer, scrollContent, scrollContainer);
}
FmTopPanel.prototype.init = function() {
    // toggle toppanel
    var topPanel = this;
    function onToggle(e) {
        topPanel.toggle();
        if(e) e.stopPropagation();
    }
    $(this.elements.titleLbl).click(onToggle);
    $("body").click(function(e) {
        if(topPanel.state.expanded)
            onToggle();
    });
    // animate search bar
    $(this.elements.searchInput).focus(function(e){
        $(this).animate({"width":"8em"}, "fast");
        e.stopPropagation();
    });
    // resize
    $(window).resize(function() {
        topPanel.updateHeight();
    });
    this.updateHeight();
}
FmTopPanel.prototype.toggle = function() {
    $(this.elements.mainView).slideToggle();
    $(this.elements.me).toggleClass("expanded");
    $(this.elements.searchInput).toggle();
    $(this.elements.topbarBtns).toggle();
    this.state.expanded = !this.state.expanded;

    if(this.state.expanded) {
        this.scroller.activate();
        this.scroller.updateDimensions();
    }
    else {
        this.manager.mainPanel.scroller.activate();
    }
}
FmTopPanel.prototype.clickLeftBtn = function(data, callback) {
    $(this.elements.leftBtn).click(data, callback);
}
FmTopPanel.prototype.updateHeight = function() {
    var h = $(window).height();
    var contentH = 0.9*h - 96;
    $(this.elements.content).height(contentH);
    this.scroller.updateDimensions();
}
/******************************FmMainPanel*******************************/
function FmMainPanel(manager) {
    this.manager = manager;
    this.elements = {
        me: "#main.slider",
        primaryView: "#main.slider > .slide.primary",
        secondaryView: "#main.slider > .slide.secondary",
        entries: "#main .entry.clickable",
        result: "#main > .slide.primary > .result",
        moreEntry: "#main > .slide.primary > .result > .entry.more"
    };
    var scrollContainer = $(this.elements.primaryView).get(0);
    var scrollContent = $(this.elements.result).get(0);
    FmMainPanel.container = scrollContainer;
    FmMainPanel.content = scrollContent;
    this.scroller = new FmScroller(scrollContainer, scrollContent, $("body")[0]);
    this.state = {
        entriesTotal: 0,
        entriesNum: 0 
    };
    this.$moreEntry = $('<div class="entry more">' +
                        '<div class="info"><h4><em>More</em></h4></div>' + 
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
    // activate the scroller
    this.scroller.activate();
}
FmMainPanel.prototype.updateHeight = function() {
    if (this.manager.state.isPrimaryView) {
        //$(this.elements.me).height($(this.elements.primaryView).height()); 
        this.scroller.updateDimensions();
    }
    else
        $(this.elements.me).height($(this.elements.secondaryView).height()); 
}
FmMainPanel.prototype.clickRightBtn = function(data, callback) {
    $(this.elements.me).delegate(
            this.elements.entries, 
            "fmClick", 
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
    $result.append('<div style="width:100%;height:4em;"></div>');
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
/***************************FmScroller**************************************/
/**
 * @para container dom element of container
 * @para content dom element of content
 */
function FmScroller(container, content, scrollbarContainer) {
    // init variables
    this.container = container;
    this.content = content;
    // init scrollbar
    this.scrollbar = new FmScrollBar(container, content, scrollbarContainer);
    // init scroller
    var render = this.getRenderFunc(window, container, content, 
                                    this.scrollbar.element, 
                                    scrollbarContainer);
    this.scroller = new Scroller(render, {
        scrollingX: false
    });
    this.updateDimensions();
    // activate
    this.activated = false;
    FmScroller.instances.push(this);
    // handle events
    this.initEventHandler();
}
FmScroller.instances = [];
FmScroller.prototype.activate = function() {
    // only one scroller is allowed to be active
    for(i in FmScroller.instances) {
        FmScroller.instances[i].deactivate();
    }
    this.activated = true;
}
FmScroller.prototype.deactivate = function() {
    this.activated = false;
}
FmScroller.prototype.initEventHandler = function() {
    var that = this;
    if ('ontouchstart' in window) {
		this.container.addEventListener("touchstart", function(e) {
            if (!that.activated || 
			    // Don't react if initial down happens on a form element
			    e.target.tagName.match(/input|textarea|select/i) ) {
				return;
			}
			that.scroller.doTouchStart(e.touches, e.timeStamp);
			e.preventDefault();
		}, false);

		document.addEventListener("touchmove", function(e) {
            if (!that.activated)
                return;
			that.scroller.doTouchMove(e.touches, e.timeStamp);
		}, false);

		document.addEventListener("touchend", function(e) {
		    if (!that.activated)
                return;
        	that.scroller.doTouchEnd(e.timeStamp);
		}, false);
	} else {
		var mousedown = false;
        var moved = false;
        var $clicked = [];

		this.container.addEventListener("mousedown", function(e) {
			if (!that.activated ||
                // Don't react if initial down happens on a form element
			    e.target.tagName.match(/input|textarea|select/i) ) {
				return;
			}
			
			that.scroller.doTouchStart([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);

            that.scrollbar.show();
			mousedown = true;
            moved = false;

            setTimeout(function() {
                if (moved)
                    return;
                var $newClicked = $(e.target).closest('.clickable');
                $newClicked.addClass('clicked');
                $clicked.push($newClicked);
            }, 100);
		}, false);

		document.addEventListener("mousemove", function(e) {
            if (!that.activated || !mousedown)
				return;

            moved = true;

			that.scroller.doTouchMove([{
				pageX: e.pageX,
				pageY: e.pageY
			}], e.timeStamp);

			mousedown = true;
		}, false);

		document.addEventListener("mouseup", function(e) {
			if (!that.activated || !mousedown) {
				return;
			}

			that.scroller.doTouchEnd(e.timeStamp);
            that.scrollbar.hide();
            
            if(!moved)
                $(e.target).closest('.clickable').trigger('fmClick');
            if($clicked.length > 0) {
                setTimeout(function() {
                    for(i in $clicked)
                        $clicked[i].removeClass('clicked');
                }, 100);
            }
			mousedown = false;
		}, false);
		
	} 
}
FmScroller.prototype.updateDimensions = function() {
    this.scroller.setDimensions(
            this.container.clientWidth, 
            this.container.clientHeight, 
            this.content.offsetWidth, 
            this.content.offsetHeight);
    this.scrollbar.updateHeight();
}
FmScroller.prototype.getRenderFunc = function(global, container, content, scrollbar, scrollbarContainer) {
	var docStyle = document.documentElement.style;
	
	var engine;
	if (global.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
		engine = 'presto';
	} else if ('MozAppearance' in docStyle) {
		engine = 'gecko';
	} else if ('WebkitAppearance' in docStyle) {
		engine = 'webkit';
	} else if (typeof navigator.cpuClass === 'string') {
		engine = 'trident';
	}
	
	var vendorPrefix = {
		trident: 'ms',
		gecko: 'Moz',
		webkit: 'Webkit',
		presto: 'O'
	}[engine];
	
	var helperElem = document.createElement("div");
	var undef;

	var perspectiveProperty = vendorPrefix + "Perspective";
	var transformProperty = vendorPrefix + "Transform";

    // special effect for scrollbar    
    function topAndHeightForScrollbar(top) {
        var h = parseInt(scrollbar.getAttribute('normalHeight'));
        var H = scrollbarContainer.clientHeight - 2 * FmScrollBar.minTop;
        var f = H / content.offsetHeight; 
        top *=f;
        if (top < 0) {  // topbar overflow at top
            h += top;
            if (h < FmScrollBar.minH)
                h = FmScrollBar.minH;
            top = 0;
        }
        else if (top + h > H ) {   // topbar overflow at bottom
            h = H - top;
            if (h < FmScrollBar.minH)
                h = FmScrollBar.minH;
            top = H - h;
        }
        return {t: top, h:h};
    }
	if (helperElem.style[perspectiveProperty] !== undef) {
		return function(left, top, zoom) {
			content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')';
            
            var topAndHeight = topAndHeightForScrollbar(top); 
            scrollbar.style.height = topAndHeight.h + 'px';
            scrollbar.style[transformProperty] = 'translate3d(0px,' + (topAndHeight.t) + 'px,0) scale(' + zoom + ')';
		};	
	} else if (helperElem.style[transformProperty] !== undef) {
		return function(left, top, zoom) {
			content.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px) scale(' + zoom + ')';

            var topAndHeight = topAndHeightForScrollbar(top); 
            scrollbar.style.height = topAndHeight.h + 'px';
            scrollbar.style[transformProperty] = 'translate(0px,' + (topAndHeight.t) + 'px) scale(' + zoom + ')';
		};
	} else {
		return function(left, top, zoom) {
			content.style.marginLeft = left ? (-left/zoom) + 'px' : '';
			content.style.marginTop = top ? (-top/zoom) + 'px' : '';
			content.style.zoom = zoom || '';
            
            var topAndHeight = topAndHeightForScrollbar(top); 
            scrollbar.style.height = topAndHeight.h + 'px';
            scrollbar.style.marginTop = topAndHeight.t  + 'px';
		};
	}
}
/**************************FmScrollBar**************************************/
/**
 * @arg container the container of scroller
 * @arg content the content of scroller
 * @arg attachTo the element that scrollbar is attached to
 */
function FmScrollBar(container, content, scrollbarContainer) {
    // assumme the container to be relative or absolute positioned 
    this.container = container;
    this.content = content;
    this.scrollbarContainer = scrollbarContainer;
    this.$bar = $('<div class="scrollbar"></div>');
    this.element = this.$bar.get(0);
    $(scrollbarContainer).append(this.$bar);
}
FmScrollBar.prototype.updateHeight = function() {
    this.overflow = this.content.offsetHeight > this.container.clientHeight;
    if(!this.overflow)
        this.hide();
    var h =  this.container.clientHeight
           * (this.scrollbarContainer.clientHeight - FmScrollBar.minTop * 2)
           / this.content.offsetHeight;
    if (h < FmScrollBar.minH)
        h = FmScrollbar.minH;
    this.$bar.attr('normalHeight', h+'px');
    this.$bar.height(h);
}
FmScrollBar.prototype.show = function() {
    if(this.overflow)
        this.$bar.fadeIn();
}
FmScrollBar.prototype.hide = function() {
    this.$bar.fadeOut();
}
FmScrollBar.minH = 4;
FmScrollBar.minTop = 4;
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
            total: 3,
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
    var unselectable = " unselectable=on";
    for(var i = 0; i < l; ++i) {
        var e = entries[i];
        var group = this.decideTimeGroup(e);
        var firstInGroup = false;
        if(group != this.lastGroup) {
            htmlToInsert.push('<div class="title"' + unselectable + '><h5>' + 
                                group + '<span class="nip"></span></h5></div>');
            firstInGroup = true;
            this.lastGroup = group;
        }
        htmlToInsert.push('<div class="entry clickable' + 
                          (firstInGroup?' first"':'"') + unselectable + '>');
        htmlToInsert.push('<div class="info"' + unselectable + '>');
        htmlToInsert.push('<h4' + unselectable + '><em' + unselectable + '>' + e.title + '</em></h4>');
        if(e.authors) {
            htmlToInsert.push('<p' + unselectable + '>' + e.authors + 
                (e.publication? '. ' + e.publication : '') + '</p>');
        }
        var k = e.tags.length;
        if(k > 0) {
            htmlToInsert.push('<p' + unselectable + '>');
            for(var j = 0; j < k; ++j) {
                htmlToInsert.push('<span class="tag"' + unselectable + '>' + e.tags[j] + '</span>');
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
// disable text selection in IE by setting attribute unselectable to true
function disableIETextSelection(root){
    var $root = $(root);
    $root.attr('unselectable', 'on');
    var children = $root.children();
    var l = children.length;
    for(var i = 0; i < l ; ++i)
        disableIETextSelection(children[i]);
}
$(document).ready(function() {
    // init manager
    var manager = new FmManager();
    manager.init();
    // misc.
    if ($.browser.msie) 
        disableIETextSelection($("#top-panel")[0]); 
});


