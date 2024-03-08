function gefahrOrdnung(timeFilter, lang){
// Load data from CSV files: gefahrCounts and treiberCounts
    Promise.all([
      d3.csv(`../figure_data/base/gefahr_counts_${timeFilter}.csv`),
      d3.csv(`../figure_data/treiber/gefahr_treiber_counts_${lang}.csv`),
    ]).then(([gefahrCounts, treiberCounts]) => {
      d3.select("svg#bubbleChart").selectAll("*").remove();
      // Check if gefahrCounts is empty
      if (gefahrCounts.length === 0) {
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

      // Merge the data on 'id' and 'gefahr_id'
      const mergedData = gefahrCounts.map(count => {
        const treiberData = treiberCounts.find(treiber => treiber.gefahr_id === count.id);
        const size = count.count * count.mean_sterne;
        return {
          id: +count.id,
          name: count[`bezeichnung_${lang}`],
          count: +count.count,
          mean_sterne: +count.mean_sterne,
          size: +size,
          treiber: treiberData ? Object.fromEntries(Object.entries(treiberData).slice(1)) : {}, // Convert treiberData object to key-value pairs
        };
      });

    // Extract the 'name' column values
    const nameList = mergedData.map(data => data.name);
    // Call a function to populate the select element in the front end
    populateSelect(nameList, lang);

    // Call the baseVisualization function with the result data
    baseVisualization(mergedData, "#cab2d6", '#5F496A','gefahr');

  })
}

// Function to populate the select element in the front end
function populateSelect(nameList, lang) {
  const selectElement = document.getElementById('gm-list');
  
  //sort the nameList alphabetically
  nameList.sort((a, b) => a.localeCompare(b, lang, {ignorePunctuation: true}));

  // Clear existing options
  selectElement.innerHTML = '';

  // Add new options
  nameList.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      selectElement.appendChild(option);
  });

}
