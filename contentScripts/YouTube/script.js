LyricsPlugin.prototype.setTitleFromPage = function(){
  // Set the video's title
  this.currentLyrics.title = $('#watch-headline-title').text();
  
  return this.currentLyrics._title;
};

LyricsPlugin.prototype.init = function(){
  var lyricsHTML, lyricsObj, self = this;

  // Set the video's title
  this.setTitleFromPage();
  
  this.hasMaxHeight = true;
  this.maxHeight = 313;
  
  lyricsHTML = [
    '<div id="ytl-outerwrapper" class="watch-module">',
      '<div class="watch-module-body">',
      
        '<h4>',
          '<a href="#" id="lfc-open-in-new-tab">Lyrics</a> ',
          '<a href="#" id="lfc-change-lyrics">(',
            chrome.i18n.getMessage('changeLyrics'),
          ')</a>',
          // clicking this image will hide the lyrics from the page
          '<img src="', chrome.extension.getURL('contentScripts/YouTube/close.png'), '" id="ytl-remove-lyrics" ',
            'alt="', chrome.i18n.getMessage('removeLyrics'), '"',
            'title="', chrome.i18n.getMessage('removeLyrics'), '"',
          '/>',
        '</h4>',
        
        '<div class="ytl-hor-rule"></div>',
        
        '<div id="ytl-innerwrapper">',
        
          '<div id="lfc-flash-wrap">',
            '<strong id="lfc-flash-message"></strong>',
            '<p id="lfc-flash-description"></p>',
          '</div>',
          
          '<div id="ytl-loading-message">',
            chrome.i18n.getMessage('loadingMessage'),
          '</div>',
          
          '<div id="ytl-lyrics" class="ytl-scrollbar-enabled">',
            // this is where the lyrics goes
          '</div>',
          
          // this form will show up when no lyrics were found
          '<form id="ytl-search-form" action="#">',
            '<p><input type="text" id="ytl-search-lyrics" name="ytl-search-lyrics" /></p>',
          '</form>',
        '</div>',
          
        '<div id="flattrButtonWrap">',
          '<a href="http://www.pledgie.com/campaigns/18436"><img alt="Click here to lend your support to: Lyrics for Google Chrome\u2122 and make a donation at www.pledgie.com !" src="http://www.pledgie.com/campaigns/18436.png?skin_name=chrome" border="0" /></a>',
          '<span class="ytl-donate-text">', chrome.i18n.getMessage('donate_text'), '</span>',
          '<div class="ytl-hor-rule"></div>',
        '</div>',
      '</div>',
    '</div>'
  ].join('');
  
  // The div that holds everything
  this.elements.outerWrapper = lyricsObject = $(lyricsHTML);
  
  // The div that holds the actual content (no headers)
  this.elements.innerWrapper = $('#ytl-innerwrapper', lyricsObject);
  
  // Loading message wrapper
  this.elements.loadingMessage = $('#ytl-loading-message', lyricsObject);
  
  // The div that holds the lyrics itself
  this.elements.lyricsContent = $('#ytl-lyrics', lyricsObject);
  
  // The form which you can use to search manually for lyrics
  this.elements.searchForm = $('#ytl-search-form', lyricsObject);
  
  // The input field for manual search
  this.elements.searchInput = $('#ytl-search-lyrics', lyricsObject);
  
  // Create a remove from page button
  this.elements.removeEl = $('#ytl-remove-lyrics', lyricsObject);
  
  this.elements.changeLyrics = $('#lfc-change-lyrics', lyricsObject);
  
  this.elements.flashMessage = $('#lfc-flash-message', lyricsObject);
  this.elements.flashDescription = $('#lfc-flash-description', lyricsObject);
  this.elements.flashWrap = $('#lfc-flash-wrap', lyricsObject);
  this.elements.donateWrap = $('#flattrButtonWrap', lyricsObject);
  
  // Make sure you hide the outer wrapper in first instance
  this.hide();
  
  // And also hide the lyrics and form div
  this.elements.searchForm.hide();
  this.elements.lyricsContent.hide();
  
  // Change lyrics button
  this.elements.changeLyrics.click(function(){
    self.hideSections();
    self.showSearchForm('searchTitle', 'searchHelp');
    
    return false;
  });
  
  
  this.elements.removeEl.attr('src', '//s.ytimg.com/yt/img/watch6-icon-close-vflZt2x4c.png');
  $('#watch7-sidebar').prepend(lyricsObject);
  
  
  $('#lfc-open-in-new-tab', lyricsObject).click(function(){
    chrome.extension.sendRequest({
      'action': 'currentLyricsToTab',
      'title': self.currentLyrics.title
    });
    
    return false;
  });
  
  // Set the click event for removing the lyrics from the page
  this.elements.removeEl.click(function(){
    self.hide();
    
    return false;
  });
  
  this.elements.searchForm.submit(function(e) {
    // Set the title and try to get the lyrics again
    self.currentLyrics.title = self.elements.searchInput.val();
    self.queryLyrics();
    
    return false;
  });
};

LyricsPlugin.prototype.show = function(){
  this.getTitleFromPage();
  this.elements.outerWrapper.show();
  this.isVisible = true;
};

LyricsPlugin.prototype.hide = function(){
  this.hideSections();
  this.elements.outerWrapper.hide();
  this.isVisible = false;
};