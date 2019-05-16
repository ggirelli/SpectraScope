
var initFluorophoreList = function() {
    d3.tsv("data/fluorophores.tsv", function(data) {
        var listAddWrap = $("#settings-fluorophores .option-list");
        var listRmWrap = $("#selection-fluorophores .option-list");
        for (var i = data.length - 1; i >= 0; i--) {
          if ( data[i].color == "auto" ) { data[i].color = get_color(data[i].wem); }
          var fluColor = $("<span></span>")
            .css({'background-color':data[i].color})
            .addClass("fluColor");

          var waveSmall = $("<small>("+data[i].wex+"/"+data[i].wem+")</small>");

          var fluObj = $("<a href='#'>"+data[i].name+" </a>")
            .attr("data-name", data[i].name)
            .addClass("btn btn-block")
            .prepend(fluColor).append(waveSmall);
          var fluObj2 = fluObj.clone();

          fluObj.click(function(e) {
              var name = $(this).attr("data-name");
              $(this).css({'display':'none'})
              $("#selection-fluorophores a[data-name='"+name+"']").removeAttr("style");
              e.preventDefault();
            });
          listAddWrap.prepend(fluObj);

          fluObj2.click(function(e) {
              var name = $(this).attr("data-name");
              $(this).css({'display':'none'})
              $("#settings-fluorophores a[data-name='"+name+"']").removeAttr("style");
              e.preventDefault();
            }).css({'display':'none'});
          listRmWrap.prepend(fluObj2);
        }
    })
}

var initFilterList = function() {
    d3.tsv("data/filters.tsv", function(data) {
        var listAddWrap = $("#settings-filters .option-list");
        var listRmWrap = $("#selection-filters .option-list");
        for (var i = data.length - 1; i >= 0; i--) {
          if ( data[i].color == "auto" ) { data[i].color = get_color(data[i].start); }
          var fluColor = $("<span></span>")
            .css({'background-color':data[i].color})
            .addClass("fluColor");

          if ( "" == data[i].customDescription ) {
            data[i].customDescription = data[i].start+"/"+data[i].width;
          }
          var waveSmall = $("<small> ("+data[i].customDescription+")</small>");
          var nickSmall = $("<small> ("+data[i].nickname+")</small>");

          var filObj = $("<a href='#'>"+data[i].name+"<br/></a>")
            .attr("data-name", data[i].name)
            .addClass("btn btn-block")
            .prepend(fluColor).append(waveSmall).append(nickSmall);
          var filObj2 = filObj.clone();

          filObj.click(function(e) {
              var name = $(this).attr("data-name");
              $(this).css({'display':'none'})
              $("#selection-filters a[data-name='"+name+"']").removeAttr("style");
              e.preventDefault();
            });
          listAddWrap.prepend(filObj);

          filObj2.click(function(e) {
              var name = $(this).attr("data-name");
              $(this).css({'display':'none'})
              $("#settings-filters a[data-name='"+name+"']").removeAttr("style");
              e.preventDefault();
            }).css({'display':'none'});
          listRmWrap.prepend(filObj2);
        }
    })
}

var plotSpectraViewer = function () {
    var svg = d3.select("#d3wrapper svg");
    $("#d3wrapper svg g").remove();
    svg.attr("width", $("#d3wrapper").width());
    svg.attr("height", $("#d3wrapper").height());

    var margin = {top: 20, right: 20, bottom: 20, left: 30};
    var width = +svg.attr("width") - margin.left - margin.right;
    var height = +svg.attr("height") - margin.top - margin.bottom;
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var formatNumber = d3.format(".1f");
    var x = d3.scaleLinear().domain([0, 900]).range([0, width]);
    var y = d3.scaleLinear().domain([0, 1]).range([height, 0]);
    var xAxis = d3.axisTop(x)
        .tickSize(height)
        .tickFormat(function(d) {
          var s = formatNumber(d);
          return "\xa0" + s;
        });
    var yAxis = d3.axisRight(y)
        .tickSize(width)
        .tickFormat(function(d) {
          var s = formatNumber(d);
          return "\xa0" + s;
        });

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(customXAxis);
    g.append("g").call(customYAxis);

    function customXAxis(g) {
      g.call(xAxis);
      g.select(".domain").remove();
      g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
      g.selectAll(".tick text").attr("x", -4).attr("dy", -4);
    }

    function customYAxis(g) {
      g.call(yAxis);
      g.select(".domain").remove();
      g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
      g.selectAll(".tick text").attr("x", -20).attr("dy", 2);
    }
}

$(document).ready(function() {
    plotSpectraViewer();
    initFluorophoreList();
    initFilterList();
});
$(window).resize(plotSpectraViewer);