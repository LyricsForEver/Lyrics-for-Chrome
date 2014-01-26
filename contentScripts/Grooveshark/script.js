LyricsPlugin.prototype.getTitleFromPage = function(){
  // Set the video's title
  var song = $('#now-playing-metadata .song').attr("title"),
      artist = $('#now-playing-metadata .artist').attr("title");
  
  // Return false if nothing is playing
  if(song.length === 0 && artist.length === 0){
    return false;
  }
  
  return song + ' - ' + artist;
};

LyricsPlugin.prototype.setTitleFromPage = function(){
  // Set the video's title
  var song = $('#now-playing-metadata .song').attr("title"),
      artist = $('#now-playing-metadata .artist').attr("title");
      
  if(!song || song.length === 0 || !artist || artist.length === 0){
    this.currentLyrics.title = "";
  } else {
    this.currentLyrics.title = song + ' - ' + artist;
    this.currentLyrics.originalTitle = song + ' - ' + artist;
  }
  
  return this.currentLyrics._title;
};


LyricsPlugin.prototype.init = function(){
  var lyricsHTML, lyricsObj, self = this;

  // Set the video's title
  this.setTitleFromPage();
  
  // The height is controlled by Grooveshark itself
  this.hasMaxHeight = false;
  
  this.setSongTitleInFlashMessage = true;

  lyricsHTML = [
    '<div class="lfc-wrap lfc-new-gs">',
      '<div id="page-header" class="no-separator">',
        '<div class="meta">',
          '<h3 id="lfc-flash-message">',
            
          '</h3>',
        '</div>',
        '<div class="page_options">',
          '<button id="lfc-refresh-lyrics" class="btn" type="button">',
            chrome.i18n.getMessage('refreshLyrics'),
          '</button>',
          '<button id="lfc-change-lyrics" class="btn" type="button">',
            chrome.i18n.getMessage('changeLyrics'),
          '</button>',
        '</div>',
      '</div>',
      '<div class="column1">',
        '<div id="lfc-flash-wrap">',
          '<p id="lfc-flash-description"></p>',
        '</div>',
        
        '<div id="lfc-loading-message">',
          chrome.i18n.getMessage('loadingMessage'),
        '</div>',
        
        '<div id="lfc-lyrics">',
          
        '</div>',
        
        '<form id="lfc-search-form" class="search">',
          '<p><input type="text" id="lfc-search-lyrics" class="search"/></p>',

          '<p><button type="submit" id="lfc-search-button" class="btn">',
            chrome.i18n.getMessage('find'),
          '</button></p>',
        '</form>',
      '</div>',
      '<p class="lfc-donate-area">',
        '<a href="http://www.pledgie.com/campaigns/18436"><img alt="Click here to lend your support to: Lyrics for Google Chrome\u2122 and make a donation at www.pledgie.com !" src="http://www.pledgie.com/campaigns/18436.png?skin_name=chrome" border="0" /></a>',
      '</p>',
    '</div>'].join('');

  // The div that holds everything
  this.elements.outerWrapper = lyricsObject = $(lyricsHTML);
  
  // The div that holds the actual content (no headers)
  this.elements.innerWrapper = $('.column1', lyricsObject);
  
  // Loading message wrapper
  this.elements.loadingMessage = $('#lfc-loading-message', lyricsObject);
  
  // The div that holds the lyrics itself
  this.elements.lyricsContent = $('#lfc-lyrics', lyricsObject);
  
  // The form which you can use to search manually for lyrics
  this.elements.searchForm = $('#lfc-search-form', lyricsObject);
  
  // The input field for manual search
  this.elements.searchInput = $('#lfc-search-lyrics', lyricsObject);
  
  this.elements.changeLyrics = $('#lfc-change-lyrics', lyricsObject);
  this.elements.refreshLyrics = $('#lfc-refresh-lyrics', lyricsObject);
  
  this.elements.flashMessage = $('#lfc-flash-message', lyricsObject);
  this.elements.flashDescription = $('#lfc-flash-description', lyricsObject);
  this.elements.flashWrap = $('#lfc-flash-wrap', lyricsObject);
  
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
  
  // Refresh lyrics button
  this.elements.refreshLyrics.click(function(){
    self.setTitleFromPage();
    self.queryLyrics();
    
    return false;
  });
  
  this.addToPage = function(){
    $('#page-content').html('').append(lyricsObject);
  }
  
  // Add it to the page
  $('#lfc-lyrics-menu-button').live('click', function(){
    self.show();
    self.showSearchForm('searchTitle', 'searchHelp');
    
    if(self.currentLyrics.title.length > 0) {
      self.queryLyrics();
    }
    
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
  
  $('#lfc-search-button').live('click', function(){
    self.elements.searchForm.submit();
  });
  
  this.searchIntervalCallback = function(){
    var titleFromPage = self.getTitleFromPage();
    
    if(titleFromPage && titleFromPage !== self.currentLyrics.originalTitle){
      self.setTitleFromPage();
      self.queryLyrics();
    }
  };
};

/**
 * Override the .show function
 */
LyricsPlugin.prototype.show = function(){
  this.startSearchInterval(2000);
  this.setTitleFromPage();
  this.addToPage();
  this.elements.outerWrapper.show();
  this.isVisible = true;
};

LyricsPlugin.prototype.hide = function(){
  this.stopSearchInterval();
  this.hideSections();
  this.elements.outerWrapper.hide();
  this.animateHeight(this.elements.innerWrapper, 0);
  this.isVisible = false;
  $('#headerSearchBtn').click();
};