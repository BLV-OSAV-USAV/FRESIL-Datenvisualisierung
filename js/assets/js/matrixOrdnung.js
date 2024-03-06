function matrixOrdnung(timeFilter, lang) {
  // Load the required CSV files asynchronously
  Promise.all([
    d3.csv(`../figure_data/matrix_counts_${timeFilter}.csv`), // Load matrix counts data
    d3.csv("../figure_data/matrix_treiber_counts.csv"), // Load matrix treiber counts data
    d3.csv("../figure_data/matrix_bereich_counts.csv")
  ]).then(([matrixCounts, treiberCounts, bereichCounts]) => {
    d3.select("svg#bubbleChart").selectAll("*").remove();
    console.log(matrixCounts);

      // Check if gefahrCounts is empty
      if (matrixCounts.length === 0) {
        d3.select("svg#bubbleChart")
            .append("text")
            .attr("text-anchor", "middle")
            .text("No data available to display the chart.");
        return; // Exit the function early
      }

      var langs = ['de', 'fr', 'it', 'en'];
      var permalink = addPermalink();
      // Load the language
      var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0]; 

    // Merge the data on 'id' and 'matrix_id'
    const mergedData = matrixCounts.map(count => {
      const treiberData = treiberCounts.find(treiber => treiber.matrix_id === count.id);
      const bereichData = bereichCounts.find(bereich => bereich.matrix_id === count.id);
      const size = count.count * count.mean_sterne;
      return {
        id: +count.id,
        name: count[`bezeichnung_${lang}`],
        count: +count.count,
        mean_sterne: +count.mean_sterne,
        size: +size,
        treiber: treiberData ? Object.fromEntries(Object.entries(treiberData).slice(1)) : {}, // Convert treiberData object to key-value pairs
        bereich: bereichData ? Object.fromEntries(Object.entries(bereichData).slice(1)) : {}  // Convert bereichData object to key-value pairs
      };
    });

    // Extract the 'name' column values
    const nameList = mergedData.map(data => data.name);
    // Call a function to populate the select element in the front end
    populateSelect(nameList);

    // Call the baseVisualization function with the result datas
    baseVisualization(mergedData, '#a6cee3', 'matrix');
  });
} 

// Function to populate the select element in the front end
function populateSelect(nameList) {
  const selectElement = document.getElementById('gm-list');
  selectElement.innerHTML = '';
  nameList.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      selectElement.appendChild(option);
  });
}