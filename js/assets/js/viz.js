// Bubble chart visu
let circles;
let svg;

function baseVisualization(data, color){

    let w = window.innerWidth;
	  let width = 0;
	  let height = 0;


    svg = d3.select("svg#bubbleChart");

    // Remove existing title elements
    svg.selectAll("title").remove();

    // Sort the result array based on circle size
    data.sort((a, b) => b.size - a.size);

    // Calculate new positions for circles in a spiral layout
    const numCircles = data.length;
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
    .on("mouseover", function(d) {
        d3.select(this).attr("stroke", "#000"); 
        let [posx, posy] = d3.mouse(this);

        let w = window.innerWidth;
		    let offsetheight = document.getElementById('bubbleChart').offsetHeight;
		    let tooltipOffsetWidth = (w - width) / 2;

            //Update the tooltip position and value
		    d3.select("#tooltip")
            .style("left", (posx + tooltipOffsetWidth) + "px")
            .style("top", (posy + offsetheight) + "px")
            .select("#titel")
            .text(d.name);

            d3.select("#tooltip")  
		        .select("#meldungCount")
		        .text(`Anzahl Meldungen: ${d.count}`)

            d3.select("#tooltip")
                .select("#meanSterne")
                .text(`Durchschnittliche Wichtigkeit: ${d.mean_sterne}`);


            d3.select("#tooltip").classed("hidden", false);
        })
    .on("mouseout", function() { 
        d3.select(this).attr("stroke", null); 
        //Hide the tooltip
        d3.select("#tooltip").classed("hidden", true);
    })
    .on("click", function(d,i) {
        moveToSection('three');
        // Extract the "treiber" values from the selected circle
        const treiberData = d.treiber;
        const id = d.id;
        const title = d.name;
        // Create and display waffle chart
        createWaffleChart(treiberData, title);
        createList(id);
    });

    // Add a title.
    circles.append("title")
      .text(d => `${d.name}\nMeldung count: ${d.count}\nMean sterne: ${d.mean_sterne}`);

    function ticked(d) {
      circles.attr("cx", d => d.x)
        .attr("cy", d => d.y);
    }
  }

  let table; // Define the DataTable variable outside the function scope

function createList(id) {
    Promise.all([
        fetch("../csv-files-filtered/filtered-ad_meldung-20231128.csv").then(response => response.text()),
        fetch("../csv-files-filtered/filtered-ad_meldung_ad_gefahr-20231128.csv").then(response => response.text()),
        fetch("../csv-files-filtered/filtered-ad_publikation_detail-20231128.csv").then(response => response.text()),
        fetch("../csv-files-filtered/filtered-ad_publikation-20231128.csv").then(response => response.text()),
        fetch("../csv-files-filtered/filtered-ad_meldung_ad_treiber-20231128.csv").then(response => response.text()),
        fetch("../csv-files-filtered/filtered-ad_treiber-20231128.csv").then(response => response.text()),
        fetch("../csv-files-filtered/filtered-ad_meldung_ad_bereich-20231128.csv").then(response => response.text()),
        fetch("../csv-files-filtered/filtered-ad_bereich-20231128.csv").then(response => response.text()),
        fetch("../csv-files-filtered/filtered-ad_meldung_ad_matrix-20231128.csv").then(response => response.text()),
        fetch("../csv-files-filtered/filtered-ad_matrix-20231128.csv").then(response => response.text()),
    ]).then(([meldungsText, meldungXgefahrText, publikationDetailText, publikationText, 
              meldungXtreiberText, treiberText, meldungXbereichText, bereichText, meldungXmatrixText, matrixText]) => {
        // Parse CSV data
        const meldungs = d3.dsvFormat("#").parse(meldungsText);
        const meldungXgefahr = d3.dsvFormat("#").parse(meldungXgefahrText);
        const publikation_detail = d3.dsvFormat("#").parse(publikationDetailText);
        const publikation = d3.dsvFormat("#").parse(publikationText);
        const meldungXtreiber = d3.dsvFormat("#").parse(meldungXtreiberText);
        const treiber = d3.dsvFormat("#").parse(treiberText);
        const meldungXbereich = d3.dsvFormat("#").parse(meldungXbereichText);
        const bereich = d3.dsvFormat("#").parse(bereichText);
        const meldungXmatrix = d3.dsvFormat("#").parse(meldungXmatrixText);
        const matrix = d3.dsvFormat("#").parse(matrixText);

        // Filter the CSV based on the 'id' variable
        const filteredMeldungIds = meldungXgefahr.filter(row => Number(row.gefahr_id) === id)
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

        console.log(filteredData);

      // Formatting function for row details - modify as you need
      function format(d) {
        // `d` is the original data object for the row
        let linksHTML = '';
        for (const link of d.links) {
            const key = Object.keys(link)[0]; // Extracting the key from the link object
            const value = link[key]; // Extracting the value from the link object
            linksHTML += `<a href="${value}" target="_blank">${key}</a><br>`;
        }
      
        return (
            '<dl>' +
            '<dt style="font-weight:bold;">Kurzinfo</dt>' +
            '<dd>' +
            d.kurzinfo +
            '</dd>' +
            '<dt style="font-weight:bold;">Wichtigkeit (von 3)</dt>' +
            '<dd>' +
            d.sterne +
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
              { title: 'Titel', data: 'titel' }
              ],
              data: filteredData, // Pass the modified data to the DataTable
              scrollY: '500px', // Set a fixed height for the table body
              scrollCollapse: true, // Allow collapsing the table height if the content doesn't fill it
              paging: false // Disable pagination
          });

        } else {
            // If DataTable instance already exists, just update its data
            table.clear().rows.add(filteredData).draw();
        }
        // Add event listener for opening and closing details
        $('#filtered-table').on('click', 'td.dt-control', function (e) {
          let tr = $(this).closest('tr');
          let row = table.row(tr);

          if (row.child.isShown()) {
              // This row is already open - close it
              row.child.hide();
          } else {
              // Open this row
              row.child(format(row.data())).show();
          }
        });

              });
        }


// Waffle visu
function createWaffleChart(treiberData,title) {
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


    padding = ({x: 10, y: 40});
    height = 600;
    width = 1024;
    waffleSize = width < height ? width : height;


    const waffles = [];
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

    const svg = d3.select("svg#waffleChart")
                    .attr("viewBox", [0, 0, width, height]);
    
    const g = svg.selectAll(".waffle")  
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
      return `${cd.treiber}\n (${cd.ratio.toFixed(1)}%)`;
    });    
    
    cells.transition()
      .duration(d => d.y * 100)
      .ease(d3.easeBounce)
      .attr("y", d => scale(d.y));

    svg.transition().delay(550)
      .on("end", () => drawLegend(svg, cells, color));


    drawLegend = (svg, cells, color) => {
      const legend = svg.selectAll(".legend")
        .data(chartData.map(d => d.treiber))
        .join("g")      
        .attr("opacity", 1)
        .attr("transform", (d, i) => `translate(${waffleSize + 20},${i * 30})`)
        .on("mouseover", highlight)
        .on("mouseout", restore);
      
      legend.append("rect")
        .attr("rx", 3).attr("ry", 3)
        .attr("width", 30).attr("height", 20)
        .attr("fill", (d, i) => color(i));    
      
      legend.append("text")
        .attr("x", 40) // Adjust the x position to align the text
        .attr("y", 10) // Adjust the y position to align the text
        .attr("alignment-baseline", "middle") // Align the text vertically in the middle
        .text((d, i) => `${d} (${chartData[i].ratio.toFixed(1)}%)`);
        
        function highlight(d) {
          const i = chartData.findIndex(item => item.treiber === d);
          cells.transition().duration(500)
            .attr("fill", data => data.index === i ? color(data.index) : "#ccc");
        }            
        
      function restore() {
        cells.transition().duration(500).attr("fill", d => color(d.index))
      }
    }

}


// Move to section function
function moveToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }