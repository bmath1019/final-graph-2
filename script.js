  
var app;

var parseDate = d3.timeParse("%m/%d/%Y"); 
var START = parseDate("11/7/2012") ;  
var END = parseDate("08/02/2016");

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
    play: false,
  },

  initialize: function (data) {
    app.data = data;

    app.components = [
      new Chart('#chart1')
    ];

    d3.select('window').on('resize', app.resize);

    function incrementTime() {
      if (app.options.play)
        app.options.time = d3.timeDay.offset(app.options.time,1); 
      if (app.options.time > END) {
        app.options.time = END; app.options.play = false;
      };

      app.update(); 
    }

    d3.interval(incrementTime, TRANSITION_DURATION);
  },

  resize: function () {
    app.components.forEach(function (c) { if (c.resize) { c.resize(); }});
  },


  update: function (){
    app.components.forEach(function (c) {if (c.update) {c.update(); }});
  }
}

function Chart(selector) {
  var chart = this;

  dataCands.forEach(function (d) {
    d.reg_date = parseDate(d.reg_date)
  });

  dataCandAgg.forEach(function (d) {
    d.agg_date = parseDate(d.agg_date)
  });


  margin = {left: 20, right: 20, top: 20, bottom: 20};

  brushMargin = {left:40, right:20, top: 20,bottom:20};

  chart.width = 950;
  chart.height = 500;

  chart.brushwidth = 700 - brushMargin.left - brushMargin.right;
  chart.brushheight = 120 - brushMargin.top - brushMargin.bottom;

  chart.projection = d3.geoAlbersUsa();

  // Create Map
  chart.projectionPath = d3.geoPath()
    .projection(chart.projection);

  chart.svg = d3.select('#chart1')
    .append('svg')
    .attr('width', chart.width)
    .attr('height', chart.height);

  chart.svg.selectAll("path")
    .data(dataMap.features)
    .enter()
    .append("path")
    .attr("class", "map")
    .attr("d", chart.projectionPath)
    .attr("stroke", "black")
    .attr("fill", "#194375");

  chart.x = d3.scaleTime()
    .domain([START,END]) 
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
    .tickSize(-chart.width)
    .ticks(3);

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
    .x(function (d) { return chart.x(d.agg_date); }) 
    .y0(chart.brushheight)
    .y1(function (d) { return chart.y(d.cand_agg); });

  chart.svg2.append("path")
    .datum(dataCandAgg)
    .attr("d", area)
    .attr("class","brushPath");  

  chart.svg2.append('rect')
    .attr('id','brushRect')
    .attr('y',0)
    .attr('height',chart.brushheight)
    .attr('x',0);

  countDateText = d3.select("#dateCounter")
  countCandText = d3.select("#candCounter") 

      function reset() {
      ticker.attr('x',function() {return chart.x(START)})
    }



// Drag ticker

  ticker = chart.svg2
    .append("g")
    .append("rect")
    .data([{x: chart.x(app.options.time) , y: 0}])
    .attr("x", function (d) {return d.x})
    .attr("y", 0)
    .attr("id", "dragright")
    .attr("height", chart.brushheight)
    .attr("width",5)
    .attr("fill","#194375")
    .attr("stroke", "#F4EFD9")
    .attr("cursor", "ew-resize");

  chart.update();
}

Chart.prototype = {
  update: function () {

    var chart = this;

    var txData = app.data.slice();

    if(app.options.filtered) {txData = txData.filter(function (d) {
      return d.reg_date <= app.options.time; })};

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

    chart.svg2.selectAll("#brushRect")
      .attr('width',function (d) {return chart.x(app.options.time); })

    formatTime = d3.timeFormat("%0m/%0d/%Y")

    function findAgg(dataCandAgg) { 
        return formatTime(dataCandAgg.agg_date) === formatTime(app.options.time);
    };
    // source for find function: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find

    // DRAG THE BAR! http://bl.ocks.org/mccannf/1629464

    if (app.options.play) {
      ticker.attr('x',function() {return chart.x(app.options.time)} )
    }

    else {    
      dragbarw = 5;

      dragright = d3.drag()
        .on("drag", rdragresize);

      ticker.call(dragright)

      function rdragresize(d) {
        coord = d3.mouse(this)[0];

        ticker.attr('x',function() {return coord} )

        return app.options.time = chart.x.invert(coord)
      }
    };

    var formatNumber = d3.format(",");

    countDateText.data(dataCandAgg).html(function (d){return formatTime(app.options.time)});    
    countCandText.data(dataCandAgg).html(function (d){return formatNumber(dataCandAgg.find(findAgg).cand_agg)});    

    points.exit().remove();

  }
}


