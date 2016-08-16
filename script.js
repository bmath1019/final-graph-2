
var app;

var START = 1;
var END = 1366;
var MAX_RADIUS = 50;
var TRANSITION_DURATION = 1;

d3.queue()
  .defer(d3.json, 'data/us-states.json')
  .defer(d3.json, 'data/candidates.json')
  .defer(d3.json, 'data/candagg.json')
  .awaitAll(function (error, results) {
    if (error) {throw error; }
    dataMap = results[0];
    dataCands = results[1];
    dataCandAgg = results[2];
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

  brushMargin = {left:40, right:20, top: 20,bottom:20};


  chart.width = 950 - margin.left - margin.right;
  chart.height = 570 - margin.top - margin.bottom;

  chart.brushwidth = 950 - brushMargin.left;
  chart.brushheight = 80 - brushMargin.top;

  // var zoom = d3.behavior.zoom()
  //   .translate([0, 0])
  //   .scale(1)
  //   .scaleExtent([1, 8])
  //   .on("zoom", zoomed);

  chart.projection = d3.geoAlbersUsa();

      // create path variable
  chart.projectionPath = d3.geoPath()
    .projection(chart.projection);

  chart.svg = d3.select('#chart1')
    .append('svg')
    .attr('width', chart.width + margin.left + margin.right)
    .attr('height', chart.height + margin.top + margin.bottom)
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

  // brush

  chart.x = d3.scaleLinear()
    .domain([0, d3.max(dataCandAgg,function (d) {return d.time_index_2; } )])
    .range([0,chart.width])
    .nice();  

  chart.y = d3.scaleLinear()
    .domain([0,d3.max(dataCandAgg,function (d) {return d.cand_agg; } )])
    .range([chart.brushheight,0])
    .nice();

  xAxis = d3.axisBottom()
    .scale(chart.x);

  yAxis = d3.axisLeft()
    .scale(chart.y)

  chart.svg2 = d3.selectAll("#brushtime")
    .append('svg')
    .attr('width',chart.width + brushMargin.left + brushMargin.right)
    .attr('height',chart.brushheight + brushMargin.top + brushMargin.bottom)
    .append('g')
    .attr('transform', 'translate(' + brushMargin.left + ',' + brushMargin.top + ')');

  chart.svg2.append('g')
    .attr('class','x axis')
    .attr('transform', 'translate(0,' + chart.brushheight + ')')
    .call(xAxis);

  chart.svg2.append('g')
    .attr('class','y axis')
    .call(yAxis)

  area = d3.area()
    .x(function (d) { return chart.x(d.time_index_2); })
    .y0(chart.brushheight)
    .y1(function (d) { return chart.y(d.cand_agg); });

   chart.svg2.append("path")
      .datum(dataCandAgg)
      .attr("d", area)
      .attr("class","brush");  

  chart.update();
}

Chart.prototype = {
  update: function () {

    var chart = this;

    var txData = app.data.slice();

    if(app.options.filtered) {txData = txData.filter(function (d) {
      return d.time_index <= app.options.time; })};

    points = chart.svg.selectAll("circle")
      .data(txData, function (d) {return d.can_id});

    points
      .enter()
      .append("circle")
      .attr("class",function (d) {return d.cand_par})
      .attr("cx", function (d) { return chart.projection([d.cand_long, d.cand_lat]) [0]; })
      .attr("cy", function (d) { return chart.projection([d.cand_long, d.cand_lat]) [1]; })
      .attr("r", "4")
      .merge(points);

    points.exit().remove()

    // console.log(app.options.time)

  }
}






