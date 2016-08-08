

var margin = {
  left: 20,
  right: 20,
  top: 20,
  bottom: 20
};

var width = 950 - margin.left - margin.right;
var height = 550 - margin.top - margin.bottom;

  // set projection
  var projection = d3.geoAlbersUsa();

      // create path variable
  var projectionPath = d3.geoPath()
    .projection(projection);

d3.json('data/us-states.json', function(error,json) {

  projection.translate([width/2, height/2])
    .scale([width]);

  svg = d3.select('#chart1')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append("g")
    .attr("transform", function(){ return "translate(" + margin.left + "," + margin.top + ")" });

  svg.selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("class", "map")
    .attr("d", projectionPath)
    .attr("stroke", "black")
    .attr("fill", "#194375");

});







