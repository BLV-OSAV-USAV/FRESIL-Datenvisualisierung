/**
 * Loads and processes danger data, merges it with driver data, and creates a bubble chart visualization.
 * @param {string} timeFilter - The time filter to be applied to the data.
 * @param {string} lang - The language code for translations.
 * @param {string} bereich - The area/category of the data.
 */
function gefahrOrdnung(timeFilter, lang, bereich) {
  // Load data from CSV files: gefahrCounts and treiberCounts
  Promise.all([
      d3.csv(`./figure_data/base/${bereich}/gefahr_counts_${timeFilter}.csv`),
      d3.csv(`./figure_data/treiber/${bereich}/gefahr_treiber_counts_${lang}_${timeFilter}.csv`)
  ]).then(([gefahrCounts, treiberCounts]) => {
      // Clear any existing elements in the SVG with id 'bubbleChart'
      d3.select("svg#bubbleChart").selectAll("*").remove();

      // Define available languages
      var langs = ['en', 'de', 'fr', 'it'];
      
      // Add permalink (assuming addPermalink is defined elsewhere)
      var permalink = addPermalink();
      
      // Determine the language to use, default to the first language if not found
      var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0]; 

      // Merge the data on 'id' and 'gefahr_id'
      const mergedData = gefahrCounts.map(count => {
          // Find corresponding treiberData for each gefahrCount
          const treiberData = treiberCounts.find(treiber => treiber.gefahr_id === count.id);
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
      populateSelect(nameList, lang);

      // Call the baseVisualization function with the merged data
      baseVisualization(mergedData, "#cab2d6", '#5F496A', 'gefahr', lang);
  });
}

/**
 * Populates a select element with a sorted list of names.
 * @param {Array<string>} nameList - List of names to populate the select element.
 * @param {string} lang - Language code for sorting.
 */
function populateSelect(nameList, lang) {
  const selectElement = document.getElementById('gm-list');

  // Sort the nameList alphabetically based on the selected language
  nameList.sort((a, b) => a.localeCompare(b, lang, { ignorePunctuation: true }));

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
