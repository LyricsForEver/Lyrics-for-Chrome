i18n.process(document);

function toggle(slide){
  if($('[name=lyricsType]:checked').prop('id') === 'new-tab'){
    if(slide){
      $('#new-tab-extra-options').slideDown();
    } else {
      $('#new-tab-extra-options').show();
    }
  } else {
    if(slide){
      $('#new-tab-extra-options').slideUp();
    } else {
      $('#new-tab-extra-options').hide();
    }
  }
}

if(localStorage['showLyricsType'] === 'onPage'){
  $('#current-tab').attr('checked', 'checked');
} else if(localStorage['showLyricsType'] === 'popup'){
  $('#in-popup').attr('checked', 'checked');
} else {
  $('#new-tab').attr('checked', 'checked');
}

if(localStorage['tabType'] === 'pinned'){
  $('#new-tab-pinned').attr('checked', 'checked');
} else {
  $('#new-tab-normal').attr('checked', 'checked');
}

$('[name=lyricsType]').change(function(){
  toggle(true)
});

toggle(false);

$('#settings').submit(function(){
  
  var selected = $('[name=lyricsType]:checked');
  
  if(selected.length === 0){
    return;
  }
  
  switch(selected.val()){
    case 'current-tab':
      localStorage['showLyricsType'] = 'onPage';
    break;
    case 'new-tab':
      localStorage['showLyricsType'] = 'newTab';
    break;
    case 'in-popup':
      localStorage['showLyricsType'] = 'popup';
    break;
  }
  
  selected = $('[name=pinned]:checked');
  
  if(selected.length === 0){
    return;
  }
  
  if(selected.val() === '1'){
    localStorage['tabType'] = 'pinned';
  } else {
    localStorage['tabType'] = 'normal';
  }
  
  alert(chrome.i18n.getMessage('settingsSaved'));
  
  return false;
});

$('#show-lyrics-type-cancel').click(function(){
  chrome.tabs.getCurrent(function(tab){
    chrome.tabs.remove(tab.id);
  });
  
  return false;
});