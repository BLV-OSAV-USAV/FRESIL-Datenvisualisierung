Promise.all([
    d3.csv("../figure_data/gefahr_counts.csv"),
    d3.csv("../figure_data/gefahr_treiber_counts.csv")
  ]).then(([gefahrCounts, treiberCounts]) => {
    // Merge the data on 'id' and 'gefahr_id'
    const mergedData = gefahrCounts.map(count => ({
      ...count,
      ...treiberCounts.find(treiber => treiber.gefahr_id === count.id)
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

    baseVisualization(result, "#cab2d6");

/*     function reorganizeCircles() {
      // Sort the result array based on circle size
      result.sort((a, b) => b.size - a.size);

      // Calculate new positions for circles in a spiral layout
      const numCircles = result.length;
      const centerX = 0;
      const centerY = 0;
      const radiusStep = 20; // Adjust the step based on your preference
      let angle = 0;

      result.forEach((circle, index) => {
        const radius = index * radiusStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
      
        circle.x = x;
        circle.y = y;
      
        // Increase the angle for the next circle
        angle += 0.1; // Adjust the angle increment based on your preference
      });
    
      // Update the simulation data and restart it
      simulation.nodes(result).alpha(1).restart();
    }

    function resetVisualization() {
        // Reset the positions of circles to their original state

        baseVisualization(result);

        // Create a force simulation
        const simulation = d3.forceSimulation(result)
            .force("x", d3.forceX().strength(0.05))
            .force("y", d3.forceY().strength(0.05))
            .force("collide", d3.forceCollide(d => d.size + 5).iterations(2))
            .on("tick", ticked);

        // Reset the viewBox to the initial value
        svg.attr("viewBox", initialViewBox);

        // Remove the pie chart and back button if they exist
        svg.select(".pie-chart-group").remove();
    } */


  })