function matrixOrdnung(timeFilter) {
  // Load the required CSV files asynchronously
  Promise.all([
    d3.csv(`../figure_data/matrix_counts_${timeFilter}.csv`), // Load matrix counts data
    d3.csv("../figure_data/matrix_treiber_counts.csv"), // Load matrix treiber counts data
    d3.csv("../figure_data/matrix_bereich_counts.csv")
  ]).then(([matrixCounts, treiberCounts, bereichCounts]) => {
    // Merge the data on 'id' and 'matrix_id'
    const mergedData = matrixCounts.map(count => {
      const treiberData = treiberCounts.find(treiber => treiber.matrix_id === count.id);
      const bereichData = bereichCounts.find(bereich => bereich.matrix_id === count.id);
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


    // Call the baseVisualization function with the result datas
    baseVisualization(mergedData, '#a6cee3', 'matrix');
  });
} 