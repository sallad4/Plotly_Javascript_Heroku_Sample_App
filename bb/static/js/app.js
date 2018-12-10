function buildMetadata(sample) {
  
  // builds the metadata panel
  // Use `d3.json` to fetch the metadata for a sample
  var url = "/metadata/"+sample
  d3.json(url).then(function(response){
    // Use d3 to select the panel with id of `#sample-metadata`
    var metaHTML = d3.select("#sample-metadata")

    // Use `.html("") to clear any existing metadata
    metaHTML.html("")    

    // Use `Object.entries` to add each key and value pair to the panel  
    Object.entries(response).forEach(([key,value]) => {
      metaHTML.append("p").text(key+": "+value)
    })    
});
}

function buildCharts(sample) {
  console.log("buildCharts")
  // console.log(sample)

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  let url = "/samples/"+sample
  d3.json(url).then(function(response){

  // @TODO: Build a Bubble Chart using the sample data      
    trace = {x: response.otu_ids,
        y: response.sample_values,
        mode: "markers",
        name: response.otu_labels,
        text: response.otu_labels,
        marker: {
          size: response.sample_values,
          color: response.otu_ids,
        }              
    }
    var data = [trace];

    var layout = {
      title: "Belly Button Bubble Plot",
      showlegend: false,
      xaxis: {title:"IDs",},
      yaxis: {title:"Sample Values"},
    }

    Plotly.newPlot("bubble", data, layout)
  
    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).    

    var zipper = response.otu_ids.map(function(x,i){
        return [x, response.sample_values[i], response.otu_labels[i]]
    })

    var sorter = zipper.sort(function(a,b){
        return b[1] - a[1]
      })

    var slicedAndSorted = {
      "otu_ids": sorter.slice(0,10).map(x => x[0]),
      "sample_values": sorter.slice(0,10).map(x => x[1]),
      "otu_labels": sorter.slice(0,10).map(x => x[2])
    }

    var buildPie = [{
      values: slicedAndSorted.sample_values,
      hovertext:  slicedAndSorted.otu_labels,       
      labels: slicedAndSorted.otu_ids,  
      type: 'pie'
    }];
    
    var layoutPie = {
      title: "Belly Button Top 10",
      showlegend: true,
      legend: {
        x: 1,
        y: 0.5
      }
    };
    
    Plotly.newPlot('pie', buildPie, layoutPie);      
  })
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();