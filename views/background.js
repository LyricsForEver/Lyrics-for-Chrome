var newLyricsTabId = -1, HTMLDEBUG;

function onInstall() {
  chrome.tabs.create({
    url: chrome.extension.getURL('views/index.html'),
  });
}

function onUpdate(prevVersion) {
}

function getVersion() {
  var version;
  
  // Synchronous request
  $.ajax({
    url: chrome.extension.getURL('manifest.json'),
    async: false,
    dataType: 'json',
    success: function(data){
      version = data.version;
    }
  });
  
  return version;
}

function onLyricsTabPrepared(tab, callback){
  newLyricsTabId = tab.id;
    
  // Keep track of the lyrics tab
  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
    if(newLyricsTabId === tabId){
      newLyricsTabId = -1;
    }
  });
  
  // Create a temporary listener to check when the tab content has loaded
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status === "complete" && tab.id === newLyricsTabId) {
      callback.call();
      chrome.tabs.onUpdated.removeListener(arguments.callee);
    }
  });
}

function convertTabToLyricsTab(tabId, callback){
  var options = {
    url: chrome.extension.getURL('../contentScripts/Popup/popup.html')
  };
  
  chrome.tabs.update(tabId, options, function(newTab){
    onLyricsTabPrepared(newTab, callback);
  });
}

function createLyricsTab(index, callback){
  // deprecated
  var tabOptions = {
    url: chrome.extension.getURL('../contentScripts/Popup/popup.html'),
    pinned: localStorage['tabType'] === 'pinned'
  };
  
  // deprecated
  if(index !== -1){
    tabOptions.index = index;
  }
  
  // Options for the new lyrics popup window
  var windowOptions = {
    url: chrome.extension.getURL('../contentScripts/Popup/popup.html'),
    type: 'popup'
  };
  
  
  // Create a new tab or popup
  if(localStorage['showLyricsType'] == 'popup'){
    chrome.windows.create(windowOptions, function(newWindow){
      onLyricsTabPrepared(newWindow.tabs[0], callback);
    });
  } else {
    chrome.tabs.create(tabOptions, function(newTab){
      onLyricsTabPrepared(newTab, callback);
    });
  }
}

/**
 * 
 */
function openLyricsInTab(title, index){
  // Request for the lyrics tab
  var submitRequest = function(){
    chrome.tabs.sendRequest(newLyricsTabId, {
      title: title,
      onlyRequery: true,
      action: 'initNewTab'
    }, function(res){
      console.log('test', res, chrome.extension.lastError);
    });
  };
  
  if(newLyricsTabId === -1){
    // Create a new tab for the lyrics
    createLyricsTab(index, submitRequest);
  } else {
    // Make the tab selected
    chrome.tabs.update(newLyricsTabId, {selected: true});
    
    // The lyrics tab already exists
    submitRequest();
  }
}

// Omnibox default suggestion
chrome.omnibox.setDefaultSuggestion({description: chrome.i18n.getMessage('omniboxHelp')});

// If input has been sent via the omnibox
chrome.omnibox.onInputEntered.addListener(function(title){

  // Send info to Google Analytics
  _gaq.push(['_trackEvent', 'Usage', 'Omnibox']);
  
  chrome.tabs.getSelected(null, function(tab){
    
    // Check if you're already in the lyrics tab
    if(newLyricsTabId === tab.id){
      openLyricsInTab(title);
    }
    
    // Set the lyrics tab to the current tab`
    convertTabToLyricsTab(tab.id, function(){
      openLyricsInTab(title);
    });
  });
});

/*chrome.omnibox.onInputChanged.addListener(function(text, suggest){
  suggest([
      {
        'content' : 'Adele - Someone Like You',
        'description' : '<match>Ade</match>le - Someone Like You'
      },{
        'content' : 'Coldplay',
        'description' : 'Every teardrop is a waterfall'
      }
  ]);
});*/

chrome.extension.onRequest.addListener(function(request, sender, callback) {
  switch(request.action){
    case 'openSettings':
      chrome.tabs.create({
        url: chrome.extension.getURL('views/settings.html'),
        selected: true,
        index: sender.tab.index+1
      }, callback);
    break;
    case 'hideNewPopupNotification':
      localStorage['showNewPopupNotification'] = 'false';
    break;
    case 'newTabPageLoaded':
      
    break;
    case 'getLyrics':
      getLyrics(request.title, callback);
    break;
    case 'showPageActionIcon':
      chrome.pageAction.show(sender.tab.id);
    break;
    case 'currentLyricsToTab':
      openLyricsInTab(request.title, sender.tab.index+1);
    break;
  }
});

// Send a message to the tab if the page action was clicked
// This will only work if no popup was set for the current page action
// The popup has its own onclicked "handler", see popup.html
chrome.pageAction.onClicked.addListener(function(tab){
  
  // Send info to Google Analytics
  _gaq.push(['_trackEvent', 'Usage', 'Page action', tab.url.split('/', 3).join('/')]);

  if(localStorage['showLyricsType'] == 'onPage'){
  
    // Show the lyrics on the current tab itself
    chrome.tabs.sendRequest(tab.id, {action: 'showLyricsOnPage'});
  } else {
  
    // Get the title from the page
    chrome.tabs.sendRequest(tab.id, {action: 'getLyricsTitle'}, function(data){
      // Interval for keeping lyrics up-to-date with the songs
      var renewLyrics;
      
      // Open the lyrics for the first time in a tab
      openLyricsInTab(data.title, tab.index+1);
      
      // Check if the current lyrics featuring tab has closed
      chrome.tabs.onRemoved.addListener(function(id, info) {
        if(id == tab.id){
          clearInterval(renewLyrics);
          chrome.tabs.onRemoved.removeListener(arguments.callee);
        }
      });
      
      // Set the interval check
      renewLyrics = setInterval(function(){
      
        // If the lyrics tab itself has been closed, don't
        // open it again after a new song has started
        if(newLyricsTabId == -1){
          clearInterval(renewLyrics);
          return;
        }
        
        // Check every 2 seconds if the song has changed
        // so the lyrics can be updated
        chrome.tabs.sendRequest(tab.id, {action: 'songChanged'}, function(data){
          if(data.hasChanged){
            openLyricsInTab(data.title, tab.index+1);
          }
        });
      }, 2000);
    });
  }
});

// Check if the extension has been updated
var currVersion = getVersion(),
    prevVersion = localStorage['version'];
    
if (currVersion !== prevVersion) {
  if (typeof prevVersion === 'undefined') {
    onInstall();
  } else {
    onUpdate(prevVersion);
  }
  
  localStorage['version'] = currVersion;
}

// Check if is set whether the lyrics should show up on the page or in a new tab
if(typeof localStorage['showLyricsType'] === 'undefined'){
  localStorage['showLyricsType'] = 'onPage';
}

if(typeof localStorage['found'] === 'undefined'){
  localStorage['found'] = '0';
}

if(typeof localStorage['showNewPopupNotification'] === 'undefined'){
  localStorage['showNewPopupNotification'] = 'true';
}