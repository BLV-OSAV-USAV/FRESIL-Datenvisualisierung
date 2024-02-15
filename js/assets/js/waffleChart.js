// Define a function to create a waffle chart
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
    console.log(total);
    
    // Now you can calculate the ratio for each treiber in the array
    const chartData = treiberArray.map(d => ({
        treiber: d.treiber,
        ratio: (d.value / total) * 100
    }));
    console.log(chartData);


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

    color = d3.scaleOrdinal(d3.schemeTableau10)
                .domain(sequence(chartData.length));

    const svg = d3.select("svg#waffleChart")
                    .attr("viewBox", [0, 0, width, height]);
    
    const g = svg.selectAll(".waffle")  
                    .data(waffles)
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
      .attr("y", d => whole ?  0 : scale(d.y))
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
      .on("end", () => drawLegend(svg, cells));


    drawLegend = (svg, cells) => {
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
          .attr("dx", 40)
          .attr("alignment-baseline", "hanging")
          .text((d, i) => `${d} (${chartData[i].ratio.toFixed(1)}%)`);
        
        function highlight(e, d, restore) {
          const i = legend.nodes().indexOf(e.currentTarget);
          cells.transition().duration(500)
            .attr("fill", d => d.index === i ? color(d.index) : "#ccc");  
        }
        
        function restore() {
          cells.transition().duration(500).attr("fill", d => color(d.index))
        }
      }

}