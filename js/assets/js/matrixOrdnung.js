// Load the required CSV files asynchronously
Promise.all([
  d3.csv("../figure_data/matrix_counts.csv"), // Load matrix counts data
  d3.csv("../figure_data/matrix_treiber_counts.csv") // Load matrix treiber counts data
]).then(([matrixCounts, treiberCounts]) => {
  // Merge the data on 'id' and 'matrix_id'
  const mergedData = matrixCounts.map(count => ({
    ...count,
    ...treiberCounts.find(treiber => treiber.matrix_id === count.id)
  }));

  // Store the initial viewBox value
  const initialViewBox = "-250 -250 500 500";

  // Convert the merged data to the desired structure
  let result = mergedData.map(entry => {
    const {
      id,
      count,
      bezeichnung_de,
      mean_sterne,
      matrix_id,
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
  baseVisualization(result, '#a6cee3', 'matrix');
});
