function steckbriefOrdnung(timeFilter, lang, bereich){
// Load data from CSV files: steckbriefCounts and treiberCounts
    Promise.all([
      d3.csv(`./figure_data/base/${bereich}/steckbrief_counts_${timeFilter}.csv`),
      d3.csv(`./figure_data/treiber/${bereich}/steckbrief_treiber_counts_${lang}_${timeFilter}.csv`),
    ]).then(([steckbriefCounts, treiberCounts]) => {
      d3.select("svg#bubbleChart").selectAll("*").remove();

      var langs = ['de', 'fr', 'it', 'en'];
      var permalink = addPermalink();
      // Load the language
      var lang = (langs.indexOf(permalink.lang) != -1) ? permalink.lang : langs[0]; 

      // Merge the data on 'id' and 'steckbrief_id'
      const mergedData = steckbriefCounts.map(count => {
        const treiberData = treiberCounts.find(treiber => treiber.steckbrief_id === count.id);
        const size = count.count * count.mean_sterne;
        const meldungIdsArray = JSON.parse(count.meldung_ids); // Parse meldung_ids string to array
        return {
          id: +count.id,
          name: count.titel,
          count: +count.count,
          mean_sterne: +count.mean_sterne,
          count_mut: +count.count_mut,
          kurzinfo: count.kurzinfo,
          mut_date: count.mut_date,
          erf_date: count.erf_date,
          size: +size,
          meldung_ids: meldungIdsArray,
          treiber: treiberData ? Object.fromEntries(Object.entries(treiberData).slice(1)) : {}, // Convert treiberData object to key-value pairs
        };
      });

    console.log(mergedData);

    // Extract the 'name' column values
    const nameList = mergedData.map(data => data.name);
    // Call a function to populate the select element in the front end
    populateSelect(nameList, lang);

    // Call the baseVisualization function with the result data
    baseVisualization(mergedData, "#ABEBC6", '#58D68D','steckbrief', lang);

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
