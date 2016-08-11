
var app;

var START = 1;
var END = 1366;
var MAX_RADIUS = 50;
var TRANSITION_DURATION = 1;

d3.queue()
  .defer(d3.json, 'data/us-states.json')
  .defer(d3.json, 'data/candidates.json')
  .awaitAll(function (error, results) {
    if (error) {throw error; }
    dataMap = results[0];
    dataCands = results[1];
    app.initialize(dataCands);
  });

app = {
  data: [],
  components: [],

  options: {
    time: START,
    filtered: true,
  },

  initialize: function (data) {
    app.data = data;

    var parseDate = d3.timeParse("%m/%d/%Y"); //https://bl.ocks.org/d3noob/0e276dc70bb9184727ee47d6dd06e915

    data.forEach(function (d) {
        d.reg_date = parseDate(d.reg_date)
      });

    app.components = [
      new Chart('#chart1')
    ];

    function incrementTime() {
      app.options.time += 1;
      if (app.options.time > END) {
        app.options.time = START;
      };

      app.update(); 
    }

    d3.interval(incrementTime, TRANSITION_DURATION);
  },

  update: function (){
    app.components.forEach(function (c) {if (c.update) {c.update(); }});
  }
}

function Chart(selector) {
  var chart = this;

  margin = {left: 20, right: 20, top: 20, bottom: 20};

  chart.width = 950 - margin.left - margin.right;
  chart.height = 550 - margin.top - margin.bottom;

  chart.projection = d3.geoAlbersUsa();

      // create path variable
  chart.projectionPath = d3.geoPath()
    .projection(chart.projection);

  chart.svg = d3.select('#chart1')
    .append('svg')
    .attr('width', chart.width)
    .attr('height', chart.height)
    .append("g")
    .attr("transform", function(){ return "translate(" + margin.left + "," + margin.top + ")" });

  chart.svg.selectAll("path")
    .data(dataMap.features)
    .enter()
    .append("path")
    .attr("class", "map")
    .attr("d", chart.projectionPath)
    .attr("stroke", "black")
    .attr("fill", "#194375");

    chart.update();
}

Chart.prototype = {
  update: function () {

    var chart = this;

    var txData = app.data.slice();

    if(app.options.filtered) {txData = txData.filter(function (d) {
      return d.time_index <= app.options.time; })};

    points = chart.svg.selectAll("circle").data(txData);

    points
      .enter()
      .append("circle")
      .attr("class","cands")
      .attr("cx", function (d) { return chart.projection([d.cand_long, d.cand_lat]) [0]; })
      .attr("cy", function (d) { return chart.projection([d.cand_long, d.cand_lat]) [1]; })
      .attr("r", "6");

    points.exit().remove()



    console.log(app.options.time)

  }
}






