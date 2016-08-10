
var data = []

d3.queue()
.defer(d3.json, 'data/us-states.json')
.defer(d3.json, 'data/candidates.json')
.awaitAll(function (error, results) {
  if (error) {throw error; }
  dataMap = results[0];
  dataCands = results[1];

  var charts = [
    new Chart('#chart1')
  ];
})

function Chart(selector, variable, title){
  var chart = this;

  chart.margin = {left: 20, right: 20, top: 20, bottom: 20};

  chart.width = 950 - chart.margin.left - chart.margin.right;
  chart.height = 550 - chart.margin.top - chart.margin.bottom;

  chart.projection = d3.geoAlbersUsa();

      // create path variable
  chart.projectionPath = d3.geoPath()
    .projection(chart.projection);

  chart.svg = d3.select('#chart1')
    .append('svg')
    .attr('width', chart.width)
    .attr('height', chart.height)
    .append("g")
    .attr("transform", function(){ return "translate(" + chart.margin.left + "," + chart.margin.top + ")" });

  chart.svg.selectAll("path")
    .data(dataMap.features)
    .enter()
    .append("path")
    .attr("class", "map")
    .attr("d", chart.projectionPath)
    .attr("stroke", "black")
    .attr("fill", "#194375");

  chart.update()

}

Chart.prototype.update = function () {

  var chart = this;

  var points = chart.svg.selectAll("circle")
    .data(dataCands);

  points.enter()
    .append("circle")
    .attr("cx", function (d) { return chart.projection(d.cand_long); })
    .attr("cy", function (d) { return chart.projection(d.cand_lat); })
    .attr("r", "6")
    .attr("fill", "red")

}






