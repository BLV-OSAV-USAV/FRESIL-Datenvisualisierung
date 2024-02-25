/**
 * Initialize the elements of the app: map, search box, localization
 */
var init = function(nointeraction) {
  
  var langs = ['de', 'fr', 'it', 'en'];
  var body = $(document.body);
  var permalink = addPermalink();

  // Load the language
  var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0]; 
  window.translator = $('html').translate({
    lang: lang,
    t: sdTranslations // Object defined in translations.js
  });

  // Set Twitter share link
  if ($.contains(document.body, document.getElementById("socialTwitter"))) {
    document.getElementById("socialTwitter").href = 
    'https://twitter.com/intent/tweet?text=' + translator.get('pagetitle').replace(" ","%20") + '&url=' + translator.get('domain') + '&related=BFEgeoinfo,BFEenergeia,EnergieSchweiz&hashtags=Wasserkraft&via=BFEgeoinfo';
  }

  // Set Facebook share link
  if ($.contains(document.body, document.getElementById("socialFB"))) {
    document.getElementById("socialFB").href = 
    'http://www.facebook.com/sharer.php?u=' + translator.get('domain').replace(" ","%20");
  }

  // Set email share link
  if ($.contains(document.body, document.getElementById("socialMail"))) {
    document.getElementById("socialMail").href = 
    'mailto:?subject=' + translator.get('pagetitle') + ' ' + translator.get('domain');
  }
    
  $(document).ready(function () {
      document.title = translator.get('pagetitle');
  });
  
  // Set map source
  if ($.contains(document.body, document.getElementById("myMap"))) {
    document.getElementById("myMap").src = 
    '//map.geo.admin.ch/embed.html?lang=' + lang + '&topic=energie&bgLayer=ch.swisstopo.pixelkarte-grau&layers=ch.swisstopo.swissimage-product,ch.bfe.statistik-wasserkraftanlagen&layers_opacity=0.6,1';
  }  
  
}