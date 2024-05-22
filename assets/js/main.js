//Sets the initial category (Ordnung) to 'gefahr'.
 var Ordnung = 'gefahr';

//Defines available languages and loads the language from permalink.
 var langs = ['de', 'fr', 'it', 'en'];
 var permalink = addPermalink();

 //Sets the language based on the permalink or defaults to the first language.
 var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0];
 
 /**
  * Handles the change event for the general category dropdown.
  * @param {string} ordnung - The selected category.
  */
 function handleGMddChange(ordnung) {
     Ordnung = ordnung;
 
     // Assuming your dropdown has an id attribute set to "myDropdown"
     let bereich = document.getElementById("bereich-dd");
     let timefilter = document.getElementById("timeFilter");
     bereich.selectedIndex = 0;
     timefilter.selectedIndex = 0;
 
     // Load and execute the script for handling gefahrButton click
     const script = document.createElement('script');
     script.src = `./assets/js/${ordnung}Ordnung.js`; 
 
     // Listen for the 'load' event on the script element
     script.addEventListener('load', () => {
         if (ordnung === 'gefahr') {
             gefahrOrdnung('all', lang, 'all');
         } else if (ordnung === 'matrix') {
             matrixOrdnung('all', lang, 'all');
         } else if (ordnung === 'steckbrief') {
             steckbriefOrdnung('all', lang, 'all');
         } else if (ordnung === 'signal') {
             signalOrdnung('all', lang, 'all');
         }
     });
 
     document.head.appendChild(script);
 }
 
 /**
  * Handles the change event for time filter and category dropdowns.
  * @param {string} timeFilter - The selected time filter.
  * @param {string} bereich - The selected category.
  */
 function handleDDChange(timeFilter, bereich) {
     // Load and execute the script for handling category change
     const script = document.createElement('script');
 
     if (Ordnung === 'gefahr') {
         script.src = './assets/js/gefahrOrdnung.js';
         script.addEventListener('load', () => {
             gefahrOrdnung(timeFilter, lang, bereich);
         });
     } else if (Ordnung === 'matrix') {
         script.src = './assets/js/matrixOrdnung.js';
         script.addEventListener('load', () => {
             matrixOrdnung(timeFilter, lang, bereich);
         });
     } else if (Ordnung === 'steckbrief') {
         script.src = './assets/js/steckbriefOrdnung.js';
         script.addEventListener('load', () => {
             steckbriefOrdnung(timeFilter, lang, bereich);
         });
     } else if (Ordnung === 'signal') {
         script.src = './assets/js/signalOrdnung.js';
         script.addEventListener('load', () => {
             signalOrdnung(timeFilter, lang, bereich);
         });
     }
 
     document.head.appendChild(script);
 }
 
 /**
  * Adds event listeners to the dropdown elements and initializes the default category on window load.
  */
 document.getElementById('gm-dd').addEventListener('change', function() {
     handleGMddChange(this.value);
     moveToSection('two');
 });
 
 document.getElementById('timeFilter').addEventListener('change', function() {
     var bereichValue = document.getElementById('bereich-dd').value;
     handleDDChange(this.value, bereichValue);
     moveToSection('two');
 });
 
 document.getElementById('bereich-dd').addEventListener('change', function() {
     var timeValue = document.getElementById('timeFilter').value;
     handleDDChange(timeValue, this.value);
     moveToSection('two');
 });
 
 window.addEventListener('load', function() {
     handleGMddChange('gefahr');
 });
 