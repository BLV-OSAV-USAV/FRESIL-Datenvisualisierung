let circles;
let svg;

function baseVisualization(data, color){

    let w = window.innerWidth;
	let width = 0;
	let height = 0;


    svg = d3.select("svg#bubbleChart");

    // Remove existing title elements
    svg.selectAll("title").remove();

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



function moveToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

