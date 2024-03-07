// Bubble chart visu
let circles;
let svg;

/**
 * Visualizes data using a bubble chart.
 * 
 * @param {Array} data - The data to be visualized.
 * @param {string} color - The color of the bubbles.
 * @param {string} selectedColor - The color of the selected bubble.
 * @param {string} filter - The filter to be applied to the data.
 */
function baseVisualization(data, color, selectedColor, filter){

	  let width = 0;
    let defaultId = ''; // Variable to store the id of the data with the biggest count

    const selectElement = document.getElementById('gm-list');

    // Find the data with the biggest count
    let maxCount = -Infinity;
    data.forEach(d => {
        if (d.count > maxCount) {
            maxCount = d.count;
            defaultId = d.id;
        }
    });


    svg = d3.select("svg#bubbleChart");

    // Remove existing title elements
    svg.selectAll("title").remove();

    // Sort the result array based on circle size
    data.sort((a, b) => b.size - a.size);

    // Calculate new positions for circles in a spiral layout
    const centerX = 0;
    const centerY = 0;
    const radiusStep = 20; // Adjust the step based on your preference
    let angle = 0;

    data.forEach((circle, index) => {
      const radius = index * radiusStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
    
      circle.x = x;
      circle.y = y;
    
      // Increase the angle for the next circle
      angle += 0.1; // Adjust the angle increment based on your preference
    });

    // Create a force simulation
    const simulation = d3.forceSimulation(data)
    .force("x", d3.forceX().strength(0.05))
    .force("y", d3.forceY().strength(0.05))
    .force("collide", d3.forceCollide(d => d.size + 5).iterations(8))
    .on("tick", ticked);


    circles = svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("r", d => d.size)
    .attr("fill", color)
    .attr("id", d => d.id)
    .on("mouseover", function(d) {
      // Only add stroke if the circle is not the clicked one
      if (!d3.select(this).classed("clicked")) {
          d3.select(this).attr("fill", selectedColor); 
      }
    
      // Calculate the center position of the circle
      const circleCenterX = d.x;
      const circleCenterY = d.y;
    
      // Update the tooltip position to the center of the circle
      let w = window.innerWidth;
      let offsetheight = document.getElementById('bubbleChart').offsetHeight;
      let tooltipOffsetWidth = (w - width) / 2;
    
      //Update the tooltip position and value
      d3.select("#tooltip")
          .style("left", (circleCenterX + tooltipOffsetWidth) + "px")
          .style("top", (circleCenterY + offsetheight) + "px")
          .select("#titel")
          .text(d.name);
    
      d3.select("#tooltip")  
          .select("#meldungCount")
          .text(`Anzahl Meldungen: ${d.count}`);
    
      d3.select("#tooltip")
          .select("#meanSterne")
          .text(`Durchschnittliche Wichtigkeit: ${d.mean_sterne}`);
    
      d3.select("#tooltip").classed("hidden", false);
    
    })
    
    .on("mouseout", function() { 
      // Only remove stroke if the circle is not the clicked one
      if (!d3.select(this).classed("clicked")) {
          d3.select(this).attr("fill", color); 
      }
      //Hide the tooltip
      d3.select("#tooltip").classed("hidden", true);
    })
    .on("click", function(d,i) {
      // Remove stroke from all circles
      svg.selectAll("circle").attr("fill", color).classed("clicked", false); 
      
      // Apply stroke to the clicked circle and add the "clicked" class
      d3.select(this).attr("fill", selectedColor).classed("clicked", true);
 

      moveToSection('three');

      // Extract the "treiber" values from the selected circle
      let treiberData = d.treiber;
      let bereichData = d.bereich;
      let id = d.id;
      let title = d.name;

      // Set the value of the select element to the selected circle's name
      selectElement.value = title; 
      
      // Update the content of the <span> tag with the class "waffle-title"
      document.querySelector('#waffle-title').innerText = title;
      // Create and display waffle chart
      createWaffleChart(treiberData, bereichData);
      createList(id, filter);
    });

/*     // Create text elements for displaying circle names
    svg.selectAll("text")
        .data(data.slice(0, 5)) // Select only the top 5 circles
        .enter()
        .append("text")
        .attr("cx", d => d.x) // Position text at the x-coordinate of the circle
        .attr("cy", d => d.y) // Position text at the y-coordinate of the circle
        .attr("text-anchor", "middle") // Center text horizontally
        .attr("dy", "0.35em") // Offset text vertically for better alignment
        .text(d => d.name) // Set text content to circle name
        .style("font-size", "10px"); // Adjust font size as needed */



    createWaffleChart(data.find(d => d.id === defaultId).treiber, data.find(d => d.id === defaultId).bereich);
    createList(defaultId, filter);
    defaultCircle = svg.select(`circle[id="${defaultId}"]`);
    defaultCircle.attr("fill", selectedColor).classed("clicked", true);

    // Update the content of the <span> tag with the class "waffle-title"
    document.querySelector('#waffle-title').innerText = data.find(d => d.id === defaultId).name;
 
      // Add event listener to the select element
    selectElement.addEventListener('change', function(event) {
        const selectedName = event.target.value;
        const selectedCircle = data.find(circle => circle.name === selectedName);
        if (selectedCircle) {
            // Remove stroke from all circles
            svg.selectAll("circle").attr("fill", color).classed("clicked", false);

            // Apply stroke to the selected circle and add the "clicked" class
            const selectedCircleElement = svg.select(`circle[id="${selectedCircle.id}"]`);
            selectedCircleElement.attr("fill", selectedColor).classed("clicked", true);

            // Run createWaffleChart and createList functions
            moveToSection('three');
            createWaffleChart(selectedCircle.treiber, selectedCircle.bereich);
            createList(selectedCircle.id, filter);

            let title = selectedCircle.name;

            // Update the content of the <span> tag with the class "trn"
            document.querySelector('#waffle-title').innerText = title;

        }
    });


    /**
     * Updates the position of circles based on the tick event.
     * @param {Object} d - The data object representing the circle.
     */
    function ticked(d) {
      circles.attr("cx", d => d.x)
        .attr("cy", d => d.y);
    }
  }

  let table; // Define the DataTable variable outside the function scope

/**
 * Creates a list based on the provided id and filter.
 * @param {number} id - The id used for filtering the CSV data.
 * @param {string} filter - The filter used for filtering the CSV data.
 */
function createList(id, filter) {
  Promise.all([
    fetch("../csv-files-filtered/filtered-ad_meldung-20231128.csv").then(response => response.text()),
    fetch(`../csv-files-filtered/filtered-ad_meldung_ad_${filter}-20231128.csv`).then(response => response.text()),
    fetch("../csv-files-filtered/filtered-ad_publikation_detail-20231128.csv").then(response => response.text()),
    fetch("../csv-files-filtered/filtered-ad_publikation-20231128.csv").then(response => response.text()),
    fetch("../csv-files-filtered/filtered-ad_meldung_ad_treiber-20231128.csv").then(response => response.text()),
    fetch("../csv-files-filtered/filtered-ad_treiber-20231128.csv").then(response => response.text()),
    fetch("../csv-files-filtered/filtered-ad_meldung_ad_bereich-20231128.csv").then(response => response.text()),
    fetch("../csv-files-filtered/filtered-ad_bereich-20231128.csv").then(response => response.text()),
    fetch("../csv-files-filtered/filtered-ad_meldung_ad_matrix-20231128.csv").then(response => response.text()),
    fetch("../csv-files-filtered/filtered-ad_matrix-20231128.csv").then(response => response.text()),
    ]).then(([meldungsText, meldungXfilterText, publikationDetailText, publikationText, 
          meldungXtreiberText, treiberText, meldungXbereichText, bereichText, meldungXmatrixText, matrixText]) => {
      // Parse CSV data
        const meldungs = d3.dsvFormat("#").parse(meldungsText);
        const meldungXfilter = d3.dsvFormat("#").parse(meldungXfilterText);
        const publikation_detail = d3.dsvFormat("#").parse(publikationDetailText);
        const publikation = d3.dsvFormat("#").parse(publikationText);
        const meldungXtreiber = d3.dsvFormat("#").parse(meldungXtreiberText);
        const treiber = d3.dsvFormat("#").parse(treiberText);
        const meldungXbereich = d3.dsvFormat("#").parse(meldungXbereichText);
        const bereich = d3.dsvFormat("#").parse(bereichText);
        const meldungXmatrix = d3.dsvFormat("#").parse(meldungXmatrixText);
        const matrix = d3.dsvFormat("#").parse(matrixText);

        // Filter the CSV based on the 'id' variable
        const filteredMeldungIds = meldungXfilter.filter(row => Number(row[`${filter}_id`]) === id)
                                                  .map(row => row.meldung_id);
    
        const filteredData = meldungs.filter(row => filteredMeldungIds.includes(row.id));

        // Add 'links' column to filteredData
        filteredData.forEach(row => {
        // Find links associated with the current 'id'
        const links = publikation_detail
            .filter(pubRow => pubRow.publikation_id === row.id)
            .map(pubRow => {
                const foundPublikation = publikation.find(p => p.id === pubRow.publikation_id);
                if (foundPublikation) {
                    return { [foundPublikation.titel]: pubRow.link };
                } else {
                    return { [pubRow.link]: pubRow.link }; // or handle the missing data accordingly
                }
              });
          // Assign links to 'links' column
          row.links = links;

          // Find treibers associated with the current 'id'
          const treibers = meldungXtreiber.filter(meldungXtreiberRow => meldungXtreiberRow.meldung_id === row.id)
          .map(meldungXtreiberRow => {
              const treiberId = meldungXtreiberRow.treiber_id;
              const treiberInfo = treiber.find(t => t.id === treiberId);
              return treiberInfo ? treiberInfo.bezeichnung_de : '-';
          });
          // Assign treibers to 'treiber' column
          row.treiber = treibers;

          // Find treibers associated with the current 'id'
          const matrices = meldungXmatrix.filter(meldungXmatrixRow => meldungXmatrixRow.meldung_id === row.id)
          .map(meldungXmatrixRow => {
              const matrixId = meldungXmatrixRow.matrix_id;
              const matrixInfo = matrix.find(t => t.id === matrixId);
              return matrixInfo ? matrixInfo.bezeichnung_de : '-';
          });
          // Assign treibers to 'treiber' column
          row.matrix = matrices;

          // Find treibers associated with the current 'id'
          const bereichs = meldungXbereich.filter(meldungXbereichRow => meldungXbereichRow.meldung_id === row.id)
          .map(meldungXbereichRow => {
              const bereichId = meldungXbereichRow.bereich_id;
              const bereichInfo = bereich.find(t => t.id === bereichId);
              return bereichInfo ? bereichInfo.bezeichnung_de : '-';
          });
          // Assign treibers to 'treiber' column
          row.bereich = bereichs;
      });

      /**
       * Formats the data object for a row.
       * 
       * @param {Object} d - The original data object for the row.
       * @returns {string} The formatted HTML string.
       */
      function format(d) {
        // `d` is the original data object for the row
        let linksHTML = '';
        for (const link of d.links) {
            const key = Object.keys(link)[0]; // Extracting the key from the link object
            const value = link[key]; // Extracting the value from the link object
            linksHTML += `<a href="${value}" target="_blank">${key}</a><br>`;
        }
        function convertToStars(num) {
          switch (num) {
              case '1':
                  return '<span>&#9733;</span>'; // One star symbol
              case '2':
                  return '<span>&#9733;&#9733;</span>'; // Two star symbols
              case '3':
                  return '<span>&#9733;&#9733;&#9733;</span>'; // Three star symbols
              default:
                  return '';
          }
        }
      
        return (
            '<dl>' +
            '<dt style="font-weight:bold;">Kurzinfo</dt>' +
            '<dd>' +
            d.kurzinfo +
            '</dd>' +
            '<dt style="font-weight:bold;">Wichtigkeit (von 3)</dt>' +
            '<dd>' +
            convertToStars(d.sterne) +
            '</dd>' +
            '<dt style="font-weight:bold;">Treibers</dt>' +
            '<dd>' +
            d.treiber +
            '</dd>' +
            '<dt style="font-weight:bold;">Matrix</dt>' +
            '<dd>' +
            d.matrix +
            '</dd>' +
            '<dt style="font-weight:bold;">Bereich</dt>' +
            '<dd>' +
            d.bereich +
            '</dd>' +
            '<dt style="font-weight:bold;">Links</dt>' +
            '<dd>' +
            linksHTML +
            '</dd>' +
            '</dl>'
        );
      }


      // Check if the DataTable instance already exists
      if (!table) {
        // Initialize DataTable only if it doesn't exist
        table = new DataTable('#filtered-table', {
            columns: [
                {
                    className: 'dt-control',
                    orderable: false,
                    data: null,
                    defaultContent: ''
                },
                { title: 'Titel', data: 'titel' },
                { title: 'date', data: 'Dates_erf_date' }
            ],
            data: filteredData, // Pass the modified data to the DataTable
            scrollY: '500px', // Set a fixed height for the table body
            scrollCollapse: true, // Allow collapsing the table height if the content doesn't fill it
            paging: false, // Disable pagination
            order: [[2, 'desc']] // Order by the 'date' column in descending order
              });
            
              // Bind the click event handler to the DataTable
              $('#filtered-table tbody').on('click', 'td.dt-control', function () {
                  var tr = $(this).parents('tr');
            var row = table.row(tr);
        
            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            } else {
                // Open this row (the format() function would return the data to be shown)
                row.child(format(row.data())).show();
                tr.addClass('shown');
            }
        });
      } else {
        // If DataTable instance already exists, just update its data
        table.clear().rows.add(filteredData).draw();
      }

              });
        }


let svg_waffle, width, height, treiberCache, bereichCache;

/**
 * Creates a waffle chart based on the provided treiberData and title.
 * @param {Object} treiberData - The data object containing treiber values.
 */
function createWaffleChart(treiberData, bereichData) {
    treiberCache = treiberData;
    bereichData = bereichCache;
    // Clear existing waffle chart if any
    d3.select("#waffleChart").selectAll("*").remove();

    // Convert the object to an array of objects
    const treiberArray = Object.keys(treiberData).map(key => ({
        treiber: key,
        value: +treiberData[key]
    }));
    
    // Assuming total is the sum of all values in your treiberData object
    const total = treiberArray.reduce((acc, obj) => acc + obj.value, 0);

    // Now you can calculate the ratio for each treiber in the array
    const chartData = treiberArray.map(d => ({
        treiber: d.treiber,
        total: total,
        value: d.value,
        ratio: (d.value / total) * 100
    }));
    // Check if chartData is empty
    if (chartData.length === 0) {
      d3.select("svg#waffleChart")
          .append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .text("No data available to display the chart.");
      return; // Exit the function early
    }

    // Calculate the sum of rounded ratios
    const roundedSum = chartData.reduce((acc, obj) => acc + Math.round(obj.ratio), 0);

    // If sum is less than 100, find treiber with the highest ratio
    if (roundedSum < 100) {
        // Find treiber with the highest ratio
        const maxRatioTreiber = chartData.reduce((max, obj) => obj.ratio > max.ratio ? obj : max, chartData[0]);

        // Calculate the difference
        const difference = 100 - roundedSum;

        // Assign the difference to the treiber with the highest ratio
        maxRatioTreiber.ratio += difference;
    }

    // Update chartData accordingly
    chartData.forEach(d => {
        d.value = total * (d.ratio / 100); // Update the value based on the updated ratio
    });



    padding = ({x: 10, y: 40});
    width = window.innerWidth * 0.8; // 80% of window width
    if (window.innerWidth < 800) {
      height = window.innerHeight * 1.5;
    } else {
      height = window.innerHeight * 0.6;
    }
    waffleSize = width < height ? width : height;


    const max = chartData.length; 
    let index = 0, curr = 1, accu = Math.round(chartData[0].ratio), waffle = [];

    sequence = (length) => Array.apply(null, {length: length}).map((d, i) => i);

    const array = [];
    
    for(let y = 9; y >= 0; y--){
      for(let x = 0; x < 10; x ++) {
        if (curr > accu && index < max) {
          let r = Math.round(chartData[++index].ratio);
          while(r === 0 && index < max) r = Math.round(chartData[++index].ratio);
          accu += r;
        }
        waffle.push({x, y, index});
        curr++;
      } 
      array.push(waffle);
    }

    scale = d3.scaleBand()
                .domain(sequence(10))
                .range([0, waffleSize])
                .padding(0.1);

    const customColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
    '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
    '#bcbd22', '#17becf', '#aec7e8', '#ffbb78',
    '#98df8a', '#ff9896', '#c5b0d5', '#c49c94',
    '#f7b6d2', '#c7c7c7', '#dbdb8d'];
        
    const color = d3.scaleOrdinal()
                    .domain(sequence(chartData.length))
                    .range(customColors);

    svg_waffle = d3.select("svg#waffleChart")
                  .attr("width", width)
                  .attr("height", height)
                  .attr("viewBox", [0, 0, width, height]);
    
    const g = svg_waffle.selectAll(".waffle")  
                    .data(array)
                    .join("g")
                    .attr("class", "waffle");
    
    const cellSize = scale.bandwidth();
    const half = cellSize / 2;
    const cells = g.append("g")
                    .selectAll("rect")
                    .data(d => d)
                    .join("rect")
                    .attr("fill", d => d.index === -1 ? "#ddd" : color(d.index));
    

    cells.attr("x", d => scale(d.x))
      .attr("y", d => scale(9 - d.y)) // Reverse the y-axis position
      .attr("rx", 3).attr("ry", 3)
      .attr("width", cellSize).attr("height", cellSize)      


    cells.append("title").text(d => {
        const cd = chartData[d.index];
        return `${cd.treiber}\n (${Math.round(cd.ratio)}%)`; // Use toFixed(0) to remove decimals
    });
     
    cells.transition()
      .duration(d => d.y * 100)
      .ease(d3.easeBounce)
      .attr("y", d => scale(d.y));

    svg_waffle.transition().delay(550)
      .on("end", () => drawLegend(svg_waffle, cells, color));


    drawLegend = (svg, cells, color) => {
      const legend = svg.selectAll(".legend")
        .data(chartData.map(d => d.treiber))
        .join("g")      
        .attr("opacity", 1)
        .attr("transform", (d, i) => {
          if (window.innerWidth < 800) { // Adjust this value as needed
              // Position the legends beneath the chart
              return `translate(0,${waffleSize + 20 + i * 40})`;
          } else {
              // Position the legends to the right of the chart
              return `translate(${waffleSize + 20},${i * 30})`;
          }
        })
        .on("mouseover", highlight)
        .on("mouseout", restore);
      
      legend.append("rect")
        .attr("rx", 3).attr("ry", 3)
        .attr("width", 30).attr("height", 20)
        .attr("fill", (d, i) => color(i));    
      
      legend.append("text")
        .attr("x", 40) // Adjust the x position to align the text
        .attr("y", 15) // Adjust the y position to align the text
        .style("font-size", window.innerWidth < 800 ? "17px" : "14px") // Adjust the font sizes as needed
        .attr("alignment-baseline", "middle") // Align the text vertically in the middle
        .text((d, i) => `${d} (${chartData[i].ratio.toFixed(0)}%)`);
        
        /**
         * Highlights a specific data point in the chart.
         * @param {string} d - The value to be highlighted.
         */
        function highlight(d) {
          const i = chartData.findIndex(item => item.treiber === d);
          cells.transition().duration(500)
            .attr("fill", data => data.index === i ? color(data.index) : "#ccc");
        }            
        
      /**
       * Restores the fill color of cells using a transition animation.
       */
      function restore() {
        cells.transition().duration(200).attr("fill", d => color(d.index))
      }
    }

}


/**
 * Scrolls the page to the specified section using jQuery.
 * @param {string} sectionId - The ID of the section to scroll to.
 */
 function moveToSection(sectionId) {
  $('html, body').animate({
    scrollTop: $('#' + sectionId).offset().top
  }, 'slow');
}


window.addEventListener('resize', () => {
  createWaffleChart(treiberCache, bereichCache);
});
