// Define function to execute when the 'gefahrButton' is clicked
function handleGefahrButtonClick() {
    // Remove 'active' class from all buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.classList.remove('active');
    });
    // Add 'active' class to 'gefahrButton'
    this.classList.add('active');
    // Load and execute the script for handling gefahrButton click
    const script = document.createElement('script');
    script.src = './assets/js/gefahrOrdnung.js'; 
    document.head.appendChild(script);
}

// Define function to execute when the 'matrixButton' is clicked
function handleMatrixButtonClick() {
    // Remove 'active' class from all buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.classList.remove('active');
    });
    // Add 'active' class to 'matrixButton'
    this.classList.add('active');
    // Load and execute the script for handling matrixButton click
    const script = document.createElement('script');
    script.src = './assets/js/matrixOrdnung.js'; 
    document.head.appendChild(script);
}

// Add event listeners to the buttons with context binding
document.getElementById('gefahrButton').addEventListener('click', handleGefahrButtonClick.bind(document.getElementById('gefahrButton')));
document.getElementById('matrixButton').addEventListener('click', handleMatrixButtonClick.bind(document.getElementById('matrixButton')));

// Call handleGefahrButtonClick() function by default when the page loads
window.addEventListener('load', function() {
    handleGefahrButtonClick.call(document.getElementById('gefahrButton'));
});
