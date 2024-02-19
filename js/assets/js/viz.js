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
        const total = d.count
        // Create and display waffle chart
        createWaffleChart(treiberData);
    });

    // Add a title.
    circles.append("title")
      .text(d => `${d.name}\nMeldung count: ${d.count}\nMean sterne: ${d.mean_sterne}`);

    function ticked(d) {
      circles.attr("cx", d => d.x)
        .attr("cy", d => d.y);
    }
  }



// Waffle visu
function createWaffleChart(treiberData) {
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
    console.log(chartData);
    
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