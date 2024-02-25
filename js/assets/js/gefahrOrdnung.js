// Load data from CSV files: gefahrCounts and treiberCounts
Promise.all([
    d3.csv("../figure_data/gefahr_counts.csv"),
    d3.csv("../figure_data/gefahr_treiber_counts.csv")
  ]).then(([gefahrCounts, treiberCounts]) => {
    // Merge the data on 'id' and 'gefahr_id'
    const mergedData = gefahrCounts.map(count => ({
      ...count,
      ...treiberCounts.find(treiber => treiber.gefahr_id === count.id)
    }));

    // Convert the merged data to the desired structure
    let result = mergedData.map(entry => {
      const {
        id,
        count,
        bezeichnung_de,
        mean_sterne,
        gefahr_id,
        ...treiberColumns
      } = entry;
      const treiber = Object.keys(treiberColumns).reduce((acc, key) => {
        acc[key] = treiberColumns[key];
        return acc;
      }, {});
      const size = count * mean_sterne;
      return {
        id: +id,
        name: bezeichnung_de,
        count: +count,
        mean_sterne: +mean_sterne,
        treiber: treiber,
        size: +size
      };
    });

    // Call the baseVisualization function with the result data
    baseVisualization(result, "#cab2d6", 'gefahr');

  })
