var bookResults = new Vue({
  el: '#book-results',
  data: function() {
    return {
      displayBooks: [],
      searchTerm: null,
    };
  },
  methods: {
    
    searchBooks: function(searchTerm) {
      const theVue = this; // change to arrow function?
      console.log(`searching for books about the country "${searchTerm}"`);
      const url = 'https://openlibrary.org/search.json?place=' + searchTerm + '&subject=fiction' + '&limit=1000'; //API has a limit of 1000 
      console.log(url)
      //function that takes the name of a state and returns an array of books from Open Library API
      fetch(url)
      .then(function(response) {
      return response.json();
        }).then(function(data) {
        console.log(data); 
        theVue.displayBooks = data.docs;
        
      });
    
    },
    
  },
    
});

var width = 700,
  height = 700,
  sens = 0.25,
  focused;

  //Setting projection

  var projection = d3.geo.orthographic()
  .scale(300)
  .rotate([0, 0])
  .translate([width / 2, height / 2])
  .clipAngle(90);

  var path = d3.geoPath()
  .projection(projection);

  //SVG container

  var svg = d3.select("map-holder").append("svg")
  .attr("width", width)
  .attr("height", height);

  //Adding water

  svg.append("path")
  .datum({type: "Sphere"})
  .attr("class", "water")
  .attr("d", path);

  var countryNamedisplay = d3.select("body").append("div").attr("class", "countryTooltip"),
  countryList = d3.select("header").append("select").attr("name", "countries");


  queue()
  .defer(d3.json, "data/world-110m.json")
  .defer(d3.tsv, "data/world-country-names.tsv")
  .await(ready);

  //Main function

  function ready(error, world, countryData) {

    var countryById = {},
    countries = topojson.feature(world, world.objects.countries).features;

    //Adding countries to select

    countryData.forEach(function(d) {
      countryById[d.id] = d.name;
      option = countryList.append("option");
      option.text(d.name);
      option.property("value", d.id);
    });

    //Drawing countries on the globe

    var world = svg.selectAll("path.land")
    .data(countries)
    .enter().append("path")
    .attr("class", "land")
    .attr("d", path)

    //Drag event

    .call(d3.behavior.drag()
      .origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
      .on("drag", function() {
        var rotate = projection.rotate();
        projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
        svg.selectAll("path.land").attr("d", path);
        svg.selectAll(".focused").classed("focused", focused = false);
      }))

    //Mouse events

    .on("mouseover", function(d) {
      countryNamedisplay.text(countryById[d.id])
      .style("left", (d3.event.pageX + 7) + "px")
      .style("top", (d3.event.pageY - 15) + "px")
      .style("display", "block")
      .style("opacity", 1);
    })
    .on("mouseout", function(d) {
      countryNamedisplay.style("opacity", 0)
      .style("display", "none");
    })
    .on("mousemove", function(d) {
      countryNamedisplay.style("left", (d3.event.pageX + 7) + "px")
      .style("top", (d3.event.pageY - 15) + "px");
    })
    .on("click", function(d) {
      console.log(countryById[d.id])
    });
  };
  

    //Country focus on option select

    d3.select("select").on("change", function() {
      var rotate = projection.rotate(),
      focusedCountry = country(countries, this),
      p = d3.geo.centroid(focusedCountry);

      svg.selectAll(".focused").classed("focused", focused = false);

    //Globe rotating

    (function transition() {
      d3.transition()
      .duration(2500)
      .tween("rotate", function() {
        var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
        return function(t) {
          projection.rotate(r(t));
          svg.selectAll("path").attr("d", path)
          .classed("focused", function(d, i) { return d.id == focusedCountry.id ? focused = d : false; });
        };
      })
      })();
    });

    function country_clicked(d) {
      searchBooks(countryById[d.id]);
    }

    function country(cnt, sel) { 
      for(var i = 0, l = cnt.length; i < l; i++) {
        if(cnt[i].id == sel.value) {return cnt[i];}
      }
    };
  

