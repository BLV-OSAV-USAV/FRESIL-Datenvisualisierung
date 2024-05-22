/**
 * Loads and processes matrix data, merges it with driver data, and creates a bubble chart visualization.
 * @param {string} timeFilter - The time filter to be applied to the data.
 * @param {string} lang - The language code for translations.
 * @param {string} bereich - The area/category of the data.
 */
 function matrixOrdnung(timeFilter, lang, bereich) {
  // Load the required CSV files asynchronously
  Promise.all([
      d3.csv(`./figure_data/base/${bereich}/matrix_counts_${timeFilter}.csv`), // Load matrix counts data
      d3.csv(`./figure_data/treiber/${bereich}/matrix_treiber_counts_${lang}_${timeFilter}.csv`) // Load matrix treiber counts data
  ]).then(([matrixCounts, treiberCounts]) => {
      // Clear any existing elements in the SVG with id 'bubbleChart'
      d3.select("svg#bubbleChart").selectAll("*").remove();

      // Check if matrixCounts is empty
      if (matrixCounts.length === 0) {
          d3.select("svg#bubbleChart")
              .append("text")
              .attr("text-anchor", "middle")
              .text("No data available to display the chart.");
          return; // Exit the function early
      }

      // Define available languages
      var langs = ['de', 'fr', 'it', 'en'];
      
      // Add permalink (assuming addPermalink is defined elsewhere)
      var permalink = addPermalink();
      
      // Determine the language to use, default to the first language if not found
      var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0]; 

      // Merge the data on 'id' and 'matrix_id'
      const mergedData = matrixCounts.map(count => {
          // Find corresponding treiberData for each matrixCount
          const treiberData = treiberCounts.find(treiber => treiber.matrix_id === count.id);
          // Calculate size for the bubble chart
          const size = count.count * count.mean_sterne;
          // Parse meldung_ids string to array
          const meldungIdsArray = JSON.parse(count.meldung_ids);
          
          return {
              id: +count.id,
              name: count[`bezeichnung_${lang}`], // Get the name in the selected language
              count: +count.count,
              mean_sterne: +count.mean_sterne,
              size: +size,
              meldung_ids: meldungIdsArray,
              // Convert treiberData object to key-value pairs excluding the first entry
              treiber: treiberData ? Object.fromEntries(Object.entries(treiberData).slice(1)) : {}, 
          };
      });

      // Extract the 'name' column values for the select element
      const nameList = mergedData.map(data => data.name);

      // Populate the select element in the front end with the name list
      populateSelect(nameList);

      // Call the baseVisualization function with the merged data
      baseVisualization(mergedData, '#a6cee3', '#305C73', 'matrix', lang);
  });
}

/**
* Populates a select element with a sorted list of names.
* @param {Array<string>} nameList - List of names to populate the select element.
*/
function populateSelect(nameList) {
  const selectElement = document.getElementById('gm-list');

  // Sort the nameList alphabetically
  nameList.sort();

  // Clear existing options in the select element
  selectElement.innerHTML = '';

  // Add new options to the select element
  nameList.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      selectElement.appendChild(option);
  });
}
