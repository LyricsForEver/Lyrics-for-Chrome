function closeThis(){
  chrome.windows.getCurrent(null, function(wd){
    chrome.windows.remove(wd.id);
  });
}

later = document.getElementById('later');
never = document.getElementById('never');
  
  
  
later.onclick = function(){
  localStorage['popup_timestamp'] = new Date().getTime() + 1000*60*60*24*10;
  closeThis();
};
  
never.onclick = function(){
  localStorage['show_popup'] = '0'
  closeThis();
};