Ordnung = 'gefahr';

var langs = ['de', 'fr', 'it', 'en'];
var permalink = addPermalink();
// Load the language
var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0];

function handleGMddChange(ordnung){
    Ordnung = ordnung;
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
        }

    });

    document.head.appendChild(script);
}

function handleTimeFilterChange(timeFilter) {
    // Load and execute the script for handling gefahrButton click
    const script = document.createElement('script');

    if (Ordnung === 'gefahr') {
        script.src = './assets/js/gefahrOrdnung.js'; 
            // Listen for the 'load' event on the script element
        script.addEventListener('load', () => {
            // Call the gefahrOrdnung function with the desired timeFilter argument
            gefahrOrdnung(timeFilter, lang);
        });

    } else if (Ordnung === 'matrix') {
        script.src = './assets/js/matrixOrdnung.js';
            // Listen for the 'load' event on the script element
        script.addEventListener('load', () => {
            // Call the matrixOrdnung function with the desired timeFilter argument
            matrixOrdnung(timeFilter, lang);
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
    handleTimeFilterChange(this.value);
    moveToSection('two');
});

window.addEventListener('load', function() {
    handleGMddChange('gefahr');
});
