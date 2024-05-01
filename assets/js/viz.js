// Bubble chart visualization

// Declare variables
let circles; // Variable to store bubble elements
let svg; // Variable to store SVG element
let dataCache, colorCache, selectedColorCache, filterCache, langCache; // Variables for caching data and settings

/**
 * Retrieves translated text based on language.
 * @param {Object} translation - Object containing translations.
 * @param {string} lang - Language code.
 * @param {string} key - Key for the translation.
 * @returns {string} - Translated text or original key if not found.
 */
function getTranslatedText(translation, lang, key) {
    return translation[lang][key] || key; // Returns translated text or key itself if not found
}

function addSteckbriefInfo(filter, id, data){
    if (filter === 'steckbrief') {
        div = document.getElementById('two_b');
        div.innerHTML = ''
        div.style.display = 'block';
        div.innerHTML +=  `
        <center>
            <p>${data.find(d => d.id === id).kurzinfo}</p>
            <br>
            Creation date: ${data.find(d => d.id === id).erf_date}
            <br>
            Last modification: ${data.find(d => d.id === id).mut_date}
            <br>
			<svg height="5" width="200">
			  <line x1="0" y1="0" x2="200" y2="0" style="stroke:rgba(144, 144, 144, 0.5);stroke-width:2" />
			</svg>
	 	</center>	
        `;
        } else {
        document.getElementById('two_b').style.display = 'none';
        }
}


/**
 * Visualizes data using a bubble chart.
 * 
 * @param {Array} data - The data to be visualized.
 * @param {string} color - The color of the bubbles.
 * @param {string} selectedColor - The color of the selected bubble.
 * @param {string} filter - The filter to be applied to the data.
 * @param {string} lang - The language for translation.
 */
 function baseVisualization(data, color, selectedColor, filter, lang) {
  // Cache data for resizing events
  dataCache = data;
  colorCache = color;
  selectedColorCache = selectedColor;
  filterCache = filter;
  langCache = lang;

  // Object containing translations
  let translations = {
      'de': { 'Anzahl': 'Anzahl Meldungen:', 
                'D_Wichtigkeit': 'Durchschnittliche Wichtigkeit:',
                'empty': 'Keine Daten verfügbar zur Anzeige des Diagramms.',
                'mut_count': 'Anzahl der Änderungen:' },
      'fr': { 'Anzahl': 'Nombres de Notifications:', 
                'D_Wichtigkeit': 'Importance moyenne:', 
                'empty': 'Aucune donnée disponible pour afficher le graphique.',
                'mut_count': 'Nombre de changements:' },
      'it': { 'Anzahl': 'Numero di notifiche:', 
                'D_Wichtigkeit': 'Importanza media:',
                'empty': 'Nessun dato disponibile per visualizzare il grafico.',
                'mut_count': 'Numero di modifiche:'},
      'en': { 'Anzahl': 'Number of Notifications:', 
                'D_Wichtigkeit': 'Average Importance:',
                'empty': 'No data available to display the chart',
                'mut_count': 'Number of changes:' }
  };

  let width = 0;
  let defaultId = ''; // Variable to store the id of the data with the biggest count

  const selectElement = document.getElementById('gm-list');

  // Find the data with the biggest count
  let maxCount = -Infinity;
  let mutMaxCount = -Infinity;
  data.forEach(d => {
      if (d.size > maxCount) {
          maxCount = d.size;
          defaultId = d.id;
      };
      if (filter === 'steckbrief'){
        if (d.mut_count > mutMaxCount){
            mutMaxCount = d.mut_count
        }
      }
  });

  svg = d3.select("svg#bubbleChart");  

  // Sort the result array based on circle size
  data.sort((a, b) => b.size - a.size);

  var el = document.getElementById("bubbleChart");
  var rect = el.getBoundingClientRect(); // get the bounding rectangle

  let centerX = rect.width / 2;
  let centerY = rect.height / 2;
  const radiusStep = 20; // Adjust the step based on your preference
  let angle = 0;

  if(data.length === 0){
        svg.append("text")
            .attr('x', centerX)
            .attr('y', centerY)
            .attr('text-anchor', 'middle')
            .attr("font-size", "15px")
            .text(getTranslatedText(translations, lang, 'empty'));

        document.querySelector('#waffle-title').innerHTML = '-';
        document.querySelector('#waffleChart').innerHTML = '';

        createList(lang);

    return;
  }

  data.forEach((circle, index) => {
      const radius = index * radiusStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      circle.x = x;
      circle.y = y;

      // Increase the angle for the next circle
      angle += 0.01; // Adjust the angle increment based on your preference
  });
  let multiplier
  if (maxCount > 25) {
    multiplier = Math.min(rect.width, rect.height) / 500; // Adjust as needed
  } else if (26 > maxCount > 15) {
    multiplier =  Math.min(rect.width, rect.height) / 250; // Adjust as needed
  } else {
    multiplier = Math.min(rect.width, rect.height) / 100 ;
  }


  // Create a force simulation
  let simulation = d3.forceSimulation(data)
      .force("x", d3.forceX(centerX).strength(0.05))
      .force("y", d3.forceY(centerY).strength(0.05))
      .force("collide", d3.forceCollide(d => {
          // Adjust the multiplier as needed to control the size of the bubbles
          return d.size * multiplier + 5;
      }).iterations(8))
      .on("tick", ticked);

  circles = svg.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("r", d => {
          // Adjust the multiplier as needed to control the size of the bubbles
          return d.size * multiplier;
      })
      .attr("fill", color)
      .attr("id", d => d.id)
      .on("mouseover", function (d) {
          // Only add stroke if the circle is not the clicked one
          if (!d3.select(this).classed("clicked")) {
              d3.select(this).attr("fill", selectedColor);
          }


          // Update the tooltip position and value
          d3.select("#tooltip")
              .style("left", (d3.event.pageX-25) + "px")
              .style("top", (d3.event.pageY-75) + "px")
              .select("#titel")
              .text(d.name);

          d3.select("#tooltip")
              .select("#meldungCount")
              .text(`${getTranslatedText(translations, lang, 'Anzahl')} ${d.count}`);

          if (filter === 'steckbrief'){
            d3.select("#tooltip")
              .select("#mutCount")
              .text(`${getTranslatedText(translations, lang, 'mut_count')} ${d.count_mut}`);
          }

           /* d3.select("#tooltip")
              .select("#meanSterne")
              .text(`${getTranslatedText(translations, lang, 'D_Wichtigkeit')} ${d.mean_sterne}`); */

          d3.select("#tooltip").classed("hidden", false);

      })

      .on("mouseout", function () {
          // Only remove stroke if the circle is not the clicked one
          if (!d3.select(this).classed("clicked")) {
              d3.select(this).attr("fill", color);
          }
          // Hide the tooltip
          d3.select("#tooltip").classed("hidden", true);
      })

      .on("click", function (d, i) {
          // Remove stroke from all circles
          svg.selectAll("circle").attr("fill", color).classed("clicked", false);

          // Apply stroke to the clicked circle and add the "clicked" class
          d3.select(this).attr("fill", selectedColor).classed("clicked", true);

          moveToSection('three');

          // Extract the "treiber" values from the selected circle
          let treiberData = d.treiber;
          let id = d.id;
          let title = d.name;
          let meldung_list = d.meldung_ids;

          // Set the value of the select element to the selected circle's name
          selectElement.value = title;

          // Update the content of the <span> tag with the class "waffle-title"
          document.querySelector('#waffle-title').innerText = title;

          addSteckbriefInfo(filter, id, data)

          // Create and display waffle chart
          createWaffleChart(treiberData);
          createList(lang, meldung_list);
      });


    addSteckbriefInfo(filter, defaultId, data)
    // Create and display waffle chart and list for default data
    createWaffleChart(data.find(d => d.id === defaultId).treiber);
    createList(lang, data.find(d => d.id === defaultId).meldung_ids);
    
    // Highlight default circle
    defaultCircle = svg.select(`circle[id="${defaultId}"]`);
    defaultCircle.attr("fill", selectedColor).classed("clicked", true);
    selectElement.value = data.find(d => d.id === defaultId).name;
    
    // Update the content of the <span> tag with the class "waffle-title"
    document.querySelector('#waffle-title').innerText = data.find(d => d.id === defaultId).name;



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
function createList(lang, meldung_ids = []) {
    Promise.all([
        fetch("./csv-files-filtered/filtered-ad_meldung-20231128.csv").then(response => response.text()),
        fetch("./csv-files-filtered/filtered-ad_publikation_detail-20231128.csv").then(response => response.text()),
        fetch("./csv-files-filtered/filtered-ad_publikation-20231128.csv").then(response => response.text()),
        fetch("./csv-files-filtered/filtered-ad_meldung_ad_treiber-20231128.csv").then(response => response.text()),
        fetch("./csv-files-filtered/filtered-ad_treiber-20231128.csv").then(response => response.text()),
        fetch("./csv-files-filtered/filtered-ad_meldung_ad_bereich-20231128.csv").then(response => response.text()),
        fetch("./csv-files-filtered/filtered-ad_bereich-20231128.csv").then(response => response.text()),
        fetch("./csv-files-filtered/filtered-ad_meldung_ad_matrix-20231128.csv").then(response => response.text()),
        fetch("./csv-files-filtered/filtered-ad_matrix-20231128.csv").then(response => response.text()),
    ]).then(([meldungsText, publikationDetailText, publikationText,
        meldungXtreiberText, treiberText, meldungXbereichText, bereichText, meldungXmatrixText, matrixText]) => {
        // Parse CSV data
        const meldungs = d3.dsvFormat("#").parse(meldungsText);
        const publikation_detail = d3.dsvFormat("|").parse(publikationDetailText);
        const publikation = d3.dsvFormat("#").parse(publikationText);
        const meldungXtreiber = d3.dsvFormat("#").parse(meldungXtreiberText);
        const treiber = d3.dsvFormat("#").parse(treiberText);
        const meldungXbereich = d3.dsvFormat("#").parse(meldungXbereichText);
        const bereich = d3.dsvFormat("#").parse(bereichText);
        const meldungXmatrix = d3.dsvFormat("#").parse(meldungXmatrixText);
        const matrix = d3.dsvFormat("#").parse(matrixText);

        const filteredData = meldungs.filter(row => meldung_ids.includes(Number(row.id)));

        // Modify filtered data
        filteredData.forEach(row => {
            const links = publikation_detail
                .filter(pubRow => pubRow.meldung_id === row.id)
                .map(pubRow => {
                    const foundPublikation = publikation.find(p => p.id === pubRow.publikation_id);
                    return foundPublikation ? { [foundPublikation.titel]: pubRow.link } : { [pubRow.link]: pubRow.link };
                });
            row.links = links;

            const treibers = meldungXtreiber.filter(meldungXtreiberRow => meldungXtreiberRow.meldung_id === row.id)
                .map(meldungXtreiberRow => {
                    const treiberId = meldungXtreiberRow.treiber_id;
                    const treiberInfo = treiber.find(t => t.id === treiberId);
                    return treiberInfo ? treiberInfo[`bezeichnung_${lang}`] : '-';
                });
            row.treiber = treibers;

            const matrices = meldungXmatrix.filter(meldungXmatrixRow => meldungXmatrixRow.meldung_id === row.id)
                .map(meldungXmatrixRow => {
                    const matrixId = meldungXmatrixRow.matrix_id;
                    const matrixInfo = matrix.find(t => t.id === matrixId);
                    return matrixInfo ? matrixInfo[`bezeichnung_${lang}`] : '-';
                });
            row.matrix = matrices;

            const bereichs = meldungXbereich.filter(meldungXbereichRow => meldungXbereichRow.meldung_id === row.id)
                .map(meldungXbereichRow => {
                    const bereichId = meldungXbereichRow.bereich_id;
                    const bereichInfo = bereich.find(t => t.id === bereichId);
                    return bereichInfo ? bereichInfo[`bezeichnung_${lang}`] : '-';
                });
            row.bereich = bereichs;
        });

        // Define language-specific text mappings
        const translations = {
            'de': {
                'search': 'Suche:',
                'count': 'Anzeige von _START_ bis _END_ der _TOTAL_ Meldungen',
                'Column_visibility': 'Sichtbarkeit der Spalte',
                'Titel': 'Titel',
                'Datum': 'Datum',
                'Kurzinfo': 'Kurzinfo',
                'Wichtigkeit': 'Wichtigkeit',
                'Treibers': 'Treiber',
                'Matrix': 'Lebensmittelgruppen',
                'Bereich': 'Bereich',
                'Links': 'Links',
                'csv': 'Tabelle als CSV exportieren'
            },
            'fr': {
                'search': 'Rechercher:',
                'count': 'Affichage du _START_ à la _END_ du _TOTAL_ des notifications',
                'Column_visibility': 'Visibilité des colonnes',
                'Titel': 'Titre',
                'Datum': 'Date',
                'Kurzinfo': 'Résumé',
                'Wichtigkeit': 'Importance',
                'Treibers': 'Facteurs de risque',
                'Matrix': 'Groupe d\'aliments',
                'Bereich': 'Domaines',
                'Links': 'Liens',
                'csv':'Exporter la table en format CSV'
            },
            'it': {
                'search': 'Ricerca:',
                'count': 'Mostra da _START_ a _END_ del _TOTAL_ delle notifiche',
                'Column_visibility': 'Visibilità delle colonne',
                'Titel': 'Titolo',
                'Datum': 'Data',
                'Kurzinfo': 'Sintesi',
                'Wichtigkeit': 'Importanza',
                'Treibers': 'Fattori di rischio',
                'Matrix': 'Gruppi Alimentari',
                'Bereich': 'Settore',
                'Links': 'Links',
                'csv': 'Esportare la tabella come CSV'
            },
            'en': {
                'search': 'Search:',
                'count': 'Showing _START_ to _END_ of _TOTAL_ notifications',
                'Column_visibility': 'Column visibility',
                'Titel': 'Title',
                'Datum': 'Date',
                'Kurzinfo': 'Summary',
                'Wichtigkeit': 'Importance',
                'Treibers': 'Drivers',
                'Matrix': 'Food groups',
                'Bereich': 'Domains',
                'Links': 'Links',
                'csv': 'Export table as CSV'
            }
        };

        function convertToStars(num) {
            switch (num) {
                case '1':
                    return '<span>&#9733;&#9734;&#9734</span>'; // One star symbol
                case '2':
                    return '<span>&#9733;&#9733;&#9734</span>'; // Two star symbols
                case '3':
                    return '<span>&#9733;&#9733;&#9733;</span>'; // Three star symbols
                default:
                    return '';
            }
        }

        // Check if the DataTable instance already exists
        if (!table) {
            // Initialize DataTable only if it doesn't exist
            table = new DataTable('#filtered-table', {
                language: {
                    info: getTranslatedText(translations, lang, 'count'),
                    search: getTranslatedText(translations, lang, 'search')
                },
                layout: {
                    topStart:{
                        buttons:[{
                            extend: 'colvis',
                                columns: ':not(.noVis)',
                                text: getTranslatedText(translations, lang, 'Column_visibility'),
                                popoverTitle: 'Column visibility selector'
                        }]
                    },
                    bottomStart: {
                        buttons: [{
                                extend: 'csv',
                                filename: 'FRESIL_export', // Change 'custom_filename' to the desired name
                                text: getTranslatedText(translations, lang, 'csv'),
                                charset: 'UTF-8',
                                exportOptions: {
                                    orthogonal: 'exportData', // Use raw data for export
                                    columns: ':visible'
                                }
                            }
                        ]
                    },
                    bottomEnd: 'info'
                },
                columns: [{
                        title: getTranslatedText(translations, lang, 'Titel'),
                        data: 'titel',
                        className: 'title-class'
                    },
                    {
                        title: getTranslatedText(translations, lang, 'Datum'),
                        data: 'Dates_erf_date',
                        className: 'date-class'
                    },
                    {
                        title: getTranslatedText(translations, lang, 'Kurzinfo'),
                        data: 'kurzinfo',
                        className: 'kurzinfo-class'
                    },
                    {
                        title: getTranslatedText(translations, lang, 'Wichtigkeit'),
                        data: 'sterne',
                        render: (data, type, row) => type === 'exportData' ? data : convertToStars(data)
                    },
                    {
                        title: getTranslatedText(translations, lang, 'Treibers'),
                        data: 'treiber',
                        visible: false
                    },
                    {
                        title: getTranslatedText(translations, lang, 'Matrix'),
                        data: 'matrix',
                        visible: false
                    },
                    {
                        title: getTranslatedText(translations, lang, 'Bereich'),
                        data: 'bereich',
                        visible: false
                    },
                    {
                        title: getTranslatedText(translations, lang, 'Links'),
                        data: 'links',
                        render: function(data, type, row) {
                            if (type === 'exportData') {
                                return data.map(link => Object.values(link)[0]).join(', ')
                            } else {
                                let linksHTML = '';
                                for (const link of data) {
                                    const key = Object.keys(link)[0]; // Extracting the key from the link object
                                    const value = link[key]; // Extracting the value from the link object
                                    linksHTML += `<a href="${value}" target="_blank">${key}</a><br>`;
                                }
                                return linksHTML
                            }
                        }
                    }
                ],
                data: filteredData, // Pass the modified data to the DataTable
                scrollY: '500px', // Set a fixed height for the table body
                scrollX: true,
                scrollCollapse: true, // Allow collapsing the table height if the content doesn't fill it
                paging: false, // Disable pagination
                order: [
                    [1, 'desc']
                ], // Order by the 'date' column in descending order
            });

        } else {
            // If DataTable instance already exists, just update its data
            table.clear().rows.add(filteredData).draw();
        }
    });
}








let svg_waffle, width, height, treiberCache;

/**
 * Creates a waffle chart based on the provided treiberData and title.
 * @param {Object} treiberData - The data object containing treiber values.
 */
function createWaffleChart(treiberData) {
    treiberCache = treiberData;

    
    // Clear existing waffle chart if any
    d3.select("#waffleChart").selectAll("*").remove();
    var el   = document.getElementById("waffleChart");
    var rect = el.getBoundingClientRect(); // get the bounding rectangle



    // Convert the object to an array of objects
    const treiberArray = Object.keys(treiberData).map(key => ({
        treiber: key,
        value: +treiberData[key]
    }));
    
    // Assuming total is the sum of all values in your treiberData object
    const total = treiberArray.reduce((acc, obj) => acc + obj.value, 0);

    const customColors = ['#a6cee3','#1f78b4','#b2df8a',
                            '#33a02c','#fb9a99','#e31a1c',
                            '#fdbf6f','#ff7f00','#cab2d6',
                            '#6a3d9a','#ffff99','#b15928',
                            '#8dd3c7', '#ffffb3', '#bebada',
                            '#fb8072'];

      // Object containing translations
    let translations = {
      'de': { 'emptyTreiber': 'Keine Daten zum Treiber verfügbar'},
      'fr': { 'emptyTreiber': 'Pas de données disponibles sur le facteur de risque'},
      'it': { 'emptyTreiber': 'Nessun dato disponibile sul fattore di rischio'},
      'en': { 'emptyTreiber': 'No data available on the hazard driver'}
    };     

    // Now you can calculate the ratio for each treiber in the array
    const chartData = treiberArray.map((d,index) => ({
        treiber: d.treiber,
        total: total,
        value: d.value,
        ratio: (d.value / total) * 100,
        color: customColors[index % customColors.length]
    }));

    // Check if chartData is empty
    if (chartData.length === 0) {
      d3.select("svg#waffleChart")
          .append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .text(getTranslatedText(translations, lang, 'emptyTreiber'));
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


    chartData.sort((a, b) => b.ratio - a.ratio);


    width = rect.width/2
    height = rect.height
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
                .range([waffleSize, 0])
                .padding(0.1);


    svg_waffle = d3.select("svg#waffleChart");
    
    const g = svg_waffle.selectAll(".waffle")  
                    .data(array)
                    .join("g")
                    .attr("class", "waffle");
    
    const cellSize = scale.bandwidth();
    const cells = g.append("g")
                    .selectAll("rect")
                    .data(d => d)
                    .join("rect")
                    .attr("fill", (d) => d.index === -1 ? "#ddd" : chartData[d.index].color);
                    
    

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
              .on("end", () => drawLegend(svg_waffle, cells));


    drawLegend = (svg, cells) => {
      
      const legendData = chartData.filter(d => d.ratio !== 0); // Filter out data with ratio equal to 0
      const legend = svg.selectAll(".legend")
        .data(legendData.map(d => d.treiber))
        .join("g")      
        .attr("opacity", 1)
        .attr("transform", (d, i) => {
          if (window.innerWidth < 980) { // Adjust this value as needed
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
        .attr("fill", (d, i) => legendData[i].ratio === 0 ? "#c7c7c7" : legendData[i].color); // Assign grey color if ratio is 0
      
      // Append text in the legend
      legend.append("text")
      .attr("x", 40) // Adjust the x position to align the text
      .attr("y", 15) // Adjust the y position to align the text
      .attr("alignment-baseline", "middle") // Align the text vertically in the middle
      .attr("fill", "black") 
      .text((d, i) => `${d} (${legendData[i].ratio.toFixed(0)}%)`);
      
        
        /**
         * Highlights a specific data point in the chart.
         * @param {string} d - The value to be highlighted.
         */
         function highlight(d) {
          const i = legendData.findIndex(item => item.treiber === d);
          cells.transition().duration(500)
              .attr("fill", data => data.index === i ? legendData[i].color : "#ccc");
        }
                
      /**
       * Restores the fill color of cells using a transition animation.
       */
      function restore() {
        cells.transition().duration(200).attr("fill", d => legendData[d.index].color)
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
    if(!isMobileDevice()){
        baseVisualization(dataCache, colorCache, selectedColorCache, filterCache, langCache);
    }
});

function isMobileDevice() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

// Move event listener registration outside baseVisualization function
document.getElementById('gm-list').addEventListener('change', function(event) {
    const selectedName = event.target.value;
    const selectedCircle = dataCache.find(circle => circle.name === selectedName);
    if (selectedCircle) {
        // Remove stroke from all circles
        svg.selectAll("circle").attr("fill", colorCache).classed("clicked", false);

        // Apply stroke to the selected circle and add the "clicked" class
        const selectedCircleElement = svg.select(`circle[id="${selectedCircle.id}"]`);
        selectedCircleElement.attr("fill", selectedColorCache).classed("clicked", true);

        // Run createWaffleChart and createList functions
        moveToSection('two');
        createWaffleChart(selectedCircle.treiber);
        createList(langCache, selectedCircle.meldung_ids);

        let title = selectedCircle.name;

        // Update the content of the <span> tag with the class "waffle-title"
        document.querySelector('#waffle-title').innerText = title;
    }
});

