i18n.process(document);

function init(){
  // Translate +1
  window.___gcfg = {lang: chrome.i18n.getMessage('plusone_locale')};
  
  // Init +1
  (function() {
    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
  })();
}

window.onload = function(){
  setTimeout(init, 0);
};