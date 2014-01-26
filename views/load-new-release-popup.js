// Poup
if(!localStorage['show_popup']){
  localStorage['show_popup'] = '1';
}

if(!localStorage['popup_timestamp']){
  localStorage['popup_timestamp'] = new Date().getTime() + 1000*60*60*24*6;
}


if(localStorage['show_popup'] == '1'){
  time = parseInt(localStorage['popup_timestamp'], 10);
  now = new Date().getTime();
  
  // Open popup
  if(time < now){
    setTimeout(function(){
      chrome.windows.create({
        url: chrome.extension.getURL('views/new-release-popup.html'),
        width: 500,
        height: 600,
        focused: true,
        type: 'popup'
      });
    }, 2000);
  }
}