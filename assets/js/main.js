Ordnung = 'gefahr';

var langs = ['de', 'fr', 'it', 'en'];
var permalink = addPermalink();
// Load the language
var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0];

function handleGMddChange(ordnung){
    Ordnung = ordnung;
    
    // Assuming your dropdown has an id attribute set to "myDropdown"
    let bereich = document.getElementById("bereich-dd");
    let timefilter = document.getElementById("timeFilter")
    bereich.selectedIndex = 0;
    timefilter.selectedIndex = 0;

    // Load and execute the script for handling gefahrButton click
    const script = document.createElement('script');
    script.src = `./assets/js/${ordnung}Ordnung.js`; 

    // Listen for the 'load' event on the script element
    script.addEventListener('load', () => {
        if(ordnung === 'gefahr'){
            // Call the gefahrOrdnung function with the desired timeFilter argument
            gefahrOrdnung('all', lang, 'all');
        } else if(ordnung==='matrix'){
            matrixOrdnung('all', lang, 'all');
        } else if(ordnung==='steckbrief'){
            steckbriefOrdnung('all', lang, 'all');
        };

    });

    document.head.appendChild(script);
}

function handleDDChange(timeFilter, bereich) {

    // Load and execute the script for handling gefahrButton click
    const script = document.createElement('script');

    if (Ordnung === 'gefahr') {
        script.src = './assets/js/gefahrOrdnung.js'; 
            // Listen for the 'load' event on the script element
        script.addEventListener('load', () => {
            // Call the gefahrOrdnung function with the desired timeFilter argument
            gefahrOrdnung(timeFilter, lang, bereich);
        });

    } else if (Ordnung === 'matrix') {
        script.src = './assets/js/matrixOrdnung.js';
            // Listen for the 'load' event on the script element
        script.addEventListener('load', () => {
            // Call the matrixOrdnung function with the desired timeFilter argument
            matrixOrdnung(timeFilter, lang, bereich);
        });
    } else if (Ordnung === 'steckbrief'){
        script.src = './assets/js/steckbriefOrdnung.js';
            // Listen for the 'load' event on the script element
        script.addEventListener('load', () => {
            // Call the matrixOrdnung function with the desired timeFilter argument
            steckbriefOrdnung(timeFilter, lang, bereich);
        });
    }

    script.src = './assets/js/gefahrOrdnung.js'; 
    document.head.appendChild(script);
}


// Add event listeners to the buttons with context binding
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
