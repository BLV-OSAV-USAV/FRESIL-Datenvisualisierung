/**
 * Initialize the elements of the app: map, search box, localization
 */
var init = function(nointeraction) {
  
  var langs = ['en', 'de', 'fr', 'it'];
  var body = $(document.body);
  var permalink = addPermalink();

  // Load the language
  var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0]; 
  window.translator = $('html').translate({
    lang: lang,
    t: sdTranslations // Object defined in translations.js
  });

    
  $(document).ready(function () {
      document.title = translator.get('pagetitle');
  });
  
  // Set map source
  if ($.contains(document.body, document.getElementById("myMap"))) {
    document.getElementById("myMap").src = 
    '//map.geo.admin.ch/embed.html?lang=' + lang + '&topic=energie&bgLayer=ch.swisstopo.pixelkarte-grau&layers=ch.swisstopo.swissimage-product,ch.bfe.statistik-wasserkraftanlagen&layers_opacity=0.6,1';
  }  
  
}