    // Load data from CSV files: gefahrCounts and treiberCounts
    Promise.all([
      d3.csv("../figure_data/gefahr_counts.csv"),
      d3.csv("../figure_data/gefahr_treiber_counts.csv"),
      d3.csv("../figure_data/gefahr_bereich_counts.csv")
    ]).then(([gefahrCounts, treiberCounts, bereichCounts]) => {
      // Merge the data on 'id' and 'gefahr_id'
      const mergedData = gefahrCounts.map(count => {
        const treiberData = treiberCounts.find(treiber => treiber.gefahr_id === count.id);
        const bereichData = bereichCounts.find(bereich => bereich.gefahr_id === count.id);
        const size = count.count * count.mean_sterne;
        return {
          id: +count.id,
          name: count.bezeichnung_de,
          count: +count.count,
          mean_sterne: +count.mean_sterne,
          size: +size,
          treiber: treiberData ? Object.fromEntries(Object.entries(treiberData).slice(1)) : {}, // Convert treiberData object to key-value pairs
          bereich: bereichData ? Object.fromEntries(Object.entries(bereichData).slice(1)) : {}  // Convert bereichData object to key-value pairs
        };
      });
    

    // Call the baseVisualization function with the result data
    baseVisualization(mergedData, "#cab2d6", 'gefahr');

  })
