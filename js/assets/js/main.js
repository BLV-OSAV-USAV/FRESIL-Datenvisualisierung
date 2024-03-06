Ordnung = 'gefahr';

var langs = ['de', 'fr', 'it', 'en'];
var permalink = addPermalink();
// Load the language
var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0];

console.log(lang);

// Define function to execute when the 'gefahrButton' is clicked
function handleGefahrButtonClick() {
    Ordnung = 'gefahr';
    // Remove 'active' class from all buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.classList.remove('active');
    });
    // Add 'active' class to 'gefahrButton'
    this.classList.add('active');

    // Load and execute the script for handling gefahrButton click
    const script = document.createElement('script');
    script.src = './assets/js/gefahrOrdnung.js'; 

    // Listen for the 'load' event on the script element
    script.addEventListener('load', () => {
        console.log(lang)
        // Call the gefahrOrdnung function with the desired timeFilter argument
        gefahrOrdnung('all', lang);
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
            gefahrOrdnung(timeFilter);
        });

    } else if (Ordnung === 'matrix') {
        script.src = './assets/js/matrixOrdnung.js';
            // Listen for the 'load' event on the script element
        script.addEventListener('load', () => {
            // Call the matrixOrdnung function with the desired timeFilter argument
            matrixOrdnung(timeFilter);
        });
    }

    script.src = './assets/js/gefahrOrdnung.js'; 



    document.head.appendChild(script);
}

// Define function to execute when the 'matrixButton' is clicked
function handleMatrixButtonClick() {
    Ordnung = 'matrix';
    // Remove 'active' class from all buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.classList.remove('active');
    });

    // Add 'active' class to 'matrixButton'
    this.classList.add('active');

    // Load and execute the script for handling matrixButton click
    const script = document.createElement('script');
    script.src = './assets/js/matrixOrdnung.js'; 
    // Listen for the 'load' event on the script element
    script.addEventListener('load', () => {
        // Call the gefahrOrdnung function with the desired timeFilter argument
        matrixOrdnung('all');
    });
    document.head.appendChild(script);
}

// Add event listeners to the buttons with context binding
document.getElementById('gefahrButton').addEventListener('click', function() {
    handleGefahrButtonClick.call(this);
    moveToSection('two');
});
document.getElementById('matrixButton').addEventListener('click', function() {
    handleMatrixButtonClick.call(this);
    moveToSection('two');
});

document.getElementById('timeFilter').addEventListener('change', function() {
    handleTimeFilterChange(this.value);
    moveToSection('two');
});

// Call handleGefahrButtonClick() function by default when the page loads
window.addEventListener('load', function() {
    handleGefahrButtonClick.call(document.getElementById('gefahrButton'));
});
