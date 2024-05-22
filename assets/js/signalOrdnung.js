/**
 * Loads and processes profile data with signals, merges it with driver data, and creates a bubble chart visualization.
 * @param {string} timeFilter - The time filter to be applied to the data.
 * @param {string} lang - The language code for translations.
 * @param {string} bereich - The area/category of the data.
 */
 function signalOrdnung(timeFilter, lang, bereich) {
  // Load data from CSV files: steckbriefCounts and treiberCounts
  Promise.all([
      d3.csv(`./figure_data/base/${bereich}/steckbrief_counts_${timeFilter}.csv`),
      d3.csv(`./figure_data/treiber/${bereich}/steckbrief_treiber_counts_${lang}_${timeFilter}.csv`)
  ]).then(([steckbriefCounts, treiberCounts]) => {
      // Clear any existing elements in the SVG with id 'bubbleChart'
      d3.select("svg#bubbleChart").selectAll("*").remove();

      // Define available languages
      var langs = ['de', 'fr', 'it', 'en'];
      
      // Add permalink (assuming addPermalink is defined elsewhere)
      var permalink = addPermalink();
      
      // Determine the language to use, default to the first language if not found
      var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0]; 

      // Merge the data on 'id' and 'steckbrief_id'
      var mergedData = steckbriefCounts.map(count => {
          // Find corresponding treiberData for each steckbriefCount
          const treiberData = treiberCounts.find(treiber => treiber.steckbrief_id === count.id);
          // Calculate size for the bubble chart
          const size = count.count * count.mean_sterne;
          // Parse meldung_ids string to array
          const meldungIdsArray = JSON.parse(count.meldung_ids);
          
          return {
              id: +count.id,
              name: count.titel,
              count: +count.count,
              mean_sterne: +count.mean_sterne,
              count_mut: +count.count_mut,
              kurzinfo: count.kurzinfo,
              mut_date: count.mut_date,
              erf_date: count.erf_date,
              signal: count.signal,
              size: +size,
              meldung_ids: meldungIdsArray,
              // Convert treiberData object to key-value pairs excluding the first entry
              treiber: treiberData ? Object.fromEntries(Object.entries(treiberData).slice(1)) : {}, 
          };
      });

      // Filter the data to include only those with signal = 'True'
      mergedData = mergedData.filter(data => data.signal === 'True');

      // Extract the 'name' column values for the select element
      const nameList = mergedData.map(data => data.name);

      // Populate the select element in the front end with the name list
      populateSelect(nameList, lang);

      // Call the baseVisualization function with the merged data
      baseVisualization(mergedData, "#CD6155", '#922B21', 'signal', lang);
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
