var width = 960,
  height = 600;
 /* 
  var width = window.innerWidth,
        height = window.innerHeight;
*/
//NB convertin shape file of Kampala steps
//download shape file the go to https://ogre.adc4gis.com/ TARGET SRS:WGS84 after upload the geojson
// file in mapshaper.org and then export it to TOPOJSON 
  // Setting color domains(intervals of values) for our map

  var color_domain = [500, 1500, 3500, 7500, 15000]
  var ext_color_domain = [0, 500, 1500, 3500, 7500, 15000]
  var legend_labels = ["< 500", "500+", "1500+", "3500+", "7500+", "> 15000"]              
  var color = d3.scale.threshold()
  .domain(color_domain)
  .range(["#239B56", "yellow", "#F39C12", "#C0392B", "#7C47B5", "#930B15"]);

  var div = d3.select("body").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

  var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("margin", "10px auto");

  var projection = d3.geo.albers()
		  .center([33.48, 1.21])
		  .rotate([-1, 11.5, -16.4])
          .parallels([25, 36])
          .translate([width /2, height / 3])
          .scale(170000);
  var path = d3.geo.path().projection(projection);

  //Reading map file and data

  queue()
  .defer(d3.json, "js/Kla.json")
  .defer(d3.csv, "data/population.csv")
  .await(ready);
  
  //Start of Choropleth drawing

  function ready(error, map, data) {
   var rateById = {};
   var nameById = {};

   data.forEach(function(d) {
    rateById[d.RegionCode] = +d.Male2002;
    nameById[d.RegionCode] = d.RegionCode;
  });

  //Drawing Choropleth

  svg.append("g")
  .attr("class", "region")
  .selectAll("path")
  .data(topojson.object(map, map.objects.Kla).geometries)
  //.data(topojson.feature(map, map.objects.Kla).features) <-- in case topojson.v1.js
  .enter().append("path")
  .attr("d", path)
  .style("fill", function(d) {
    return color(rateById[d.properties.UBOS_PN_13]); 
  })
  .style("opacity", 0.8)

  //Adding mouseevents
  .on("mouseover", function(d) {
    d3.select(this).transition().duration(300).style("opacity", 1);
    div.transition().duration(300)
    .style("opacity", 1)
    div.text(nameById[d.properties.UBOS_PN_13] + " : " + rateById[d.properties.UBOS_PN_13])
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY -30) + "px");
	d3.select("h2").text(d.properties.UBOS_PN_13);
//	d3.select("h3").text(d.properties.Male2002);
	
  })
  .on("mouseout", function() {
    d3.select(this)
    .transition().duration(300)
    .style("opacity", 0.8);
    div.transition().duration(300)
    .style("opacity", 0);
  })
  
   // Adding cities on the map

  d3.tsv("data/city.tsv", function(error, data) {
    var city = svg.selectAll("g.city")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "city")
    .attr("transform", function(d) { return "translate(" + projection([d.lon, d.lat]) + ")"; });

    city.append("circle")
    .attr("r", 5)
    .style("fill", "lime")
    .style("opacity", 0.75);

    city.append("text")
    .attr("x", 20)
    .text(function(d) { return d.City; });
  });
  
  }; // <-- End of Choropleth drawing
 
  //Adding legend for our Choropleth

  var legend = svg.selectAll("g.legend")
  .data(ext_color_domain)
  .enter().append("g")
  .attr("class", "legend");

  var ls_w = 20, ls_h = 20;

  legend.append("rect")
  .attr("x", 20)
  .attr("y", function(d, i){ return height - (i*ls_h) - 2*ls_h;})
  .attr("width", ls_w)
  .attr("height", ls_h)
  .style("fill", function(d, i) { return color(d); })
  .style("opacity", 0.8);

  legend.append("text")
  .attr("x", 50)
  .attr("y", function(d, i){ return height - (i*ls_h) - ls_h - 4;})
  .text(function(d, i){ return legend_labels[i]; });
