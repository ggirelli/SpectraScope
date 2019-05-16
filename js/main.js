var margin = {top: 20, right: 20, bottom: 20, left: 30},
  visRange = [250, 900];

var plotSpectrum = function(data1, name, color, dashed = false) {
  var data = [{'w':parseFloat(data1[data1.length-1].w), "ri":0}];
  for (var i = data1.length - 1; i >= 0; i--) {
    data.push({'w':parseFloat(data1[i].w), "ri":parseFloat(data1[i].ri)});
  }
  data.push({'w':parseFloat(data1[0].w), "ri":0});

  var svg = d3.select("#d3wrapper svg"),
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    x = d3.scaleLinear().domain(visRange).range([0, width]),
    y = d3.scaleLinear().domain([0, 1]).range([0, height]);

  var vis = d3.select("#d3wrapper svg g");
  if ( dashed ) {
    vis.append("path")
      .datum(data)
      .attr("class", "line fluoSpectra")
      .attr("fill", color).attr("fill-opacity", 0.3)
      .attr("stroke", color).attr("stroke-width", 2)
      .attr("stroke-dasharray", 4)
      .attr("name", name)
      .attr("d", d3.line()
        .x(function(d) { return x(d.w); })
        .y(function(d) { return y(1-d.ri); }));
  } else {
    vis.append("path")
      .datum(data)
      .attr("class", "line fluoSpectra")
      .attr("fill", color).attr("fill-opacity", 0.3)
      .attr("stroke", color).attr("stroke-width", 2)
      .attr("name", name)
      .attr("d", d3.line()
        .x(function(d) { return x(d.w); })
        .y(function(d) { return y(1-d.ri); }));
  }
  $("path[name='"+name+"']").mouseenter(function(e) {
    var name = $(this).attr("name").split("_")[0];
    var desc = $("#fluorophores .selection a[data-name='"+name+"']").text();
    $("#short-details").val(desc);
  });
  $("path[name='"+name+"']").mouseleave(function(e) {
    $("#short-details").val("");
  });
  $("path[name='"+name+"']").click(function(e) {
    var name = $(this).attr("name");
    var desc = $("#fluorophores .selection a[data-name='"+name.split("_")[0]+"'] small").text();
    $.get("data/fluorophore-spectra/"+name+".tsv", {},
      function(data) { $("#extended_details").text(name+" "+desc+"\n"+data); })
  });
}

var plotFluorophore = function(name, color) {
  d3.tsv("data/fluorophore-spectra/"+name+"_ex.tsv", function(data1) {
    plotSpectrum(data1, name+"_ex", color, true)
  });
  d3.tsv("data/fluorophore-spectra/"+name+"_em.tsv", function(data1) {
    plotSpectrum(data1, name+"_em", color)
  });
}

var initFluorophoreList = function() {
  d3.tsv("data/fluorophores.tsv", function(data) {
      var listAddWrap = $("#fluorophores .option-list.settings");
      var listRmWrap = $("#fluorophores .option-list.selection");
      for (var i = data.length - 1; i >= 0; i--) {
        if ( data[i].color == "auto" ) { data[i].color = get_color(data[i].wem); }
        var fluColor = $("<span></span>")
          .css({'background-color':data[i].color})
          .addClass("fluColor");

        var waveSmall = $("<small>("+data[i].wex+"/"+data[i].wem+")</small>");

        var fluObj = $("<a href='#'>"+data[i].name+" </a>")
          .attr("data-name", data[i].name)
          .attr("data-color", data[i].color)
          .addClass("btn btn-block")
          .prepend(fluColor).append(waveSmall);
        var fluObj2 = fluObj.clone();

        fluObj.click(function(e) {
            var name = $(this).attr("data-name"),
              color = $(this).attr("data-color");
            $(this).css({'display':'none'})
            $("#fluorophores .selection a[data-name='"+name+"']").removeAttr("style");
            plotFluorophore(name, color);
            e.preventDefault();
          });
        listAddWrap.prepend(fluObj);

        fluObj2.click(function(e) {
            var name = $(this).attr("data-name");
            $(this).css({'display':'none'})
            $("#fluorophores .settings a[data-name='"+name+"']").removeAttr("style");
            $("path[name='"+name+"_em']").remove();
            $("path[name='"+name+"_ex']").remove();
            e.preventDefault();
          }).css({'display':'none'});
        listRmWrap.prepend(fluObj2);
      }
  });
}

var plotFilterSpectrum = function(data1, name, color) {
  var data = [{'w':parseFloat(data1[data1.length-1].w), "ri":0}];
  for (var i = data1.length - 1; i >= 0; i--) {
    data.push({'w':parseFloat(data1[i].w), "ri":parseFloat(data1[i].ri)});
  }
  data.push({'w':parseFloat(data1[0].w), "ri":0});

  var svg = d3.select("#d3wrapper svg"),
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    x = d3.scaleLinear().domain(visRange).range([0, width]),
    y = d3.scaleLinear().domain([0, 1]).range([0, height]);

  var vis = d3.select("#d3wrapper svg g");
  vis.insert("path", ":first-child")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "#323232").attr("fill-opacity", 0.3)
    .attr("stroke", color).attr("stroke-width", 2)
    .attr("name", name+"_filter")
    .attr("d", d3.line()
      .x(function(d) { return x(d.w); })
      .y(function(d) { return y(1-d.ri); }));
  $("path[name='"+name+"_filter']").mouseenter(function(e) {
    var name = $(this).attr("name").split("_")[0];
    var desc = $("#filters .selection a[data-name='"+name+"']").text();
    $("#short-details").val(desc);
  });
  $("path[name='"+name+"_filter']").mouseleave(function(e) {
    $("#short-details").val("");
  });
  $("path[name='"+name+"_filter']").click(function(e) {
    var name = $(this).attr("name").split("_")[0];
    var desc = $("#filters .selection a[data-name='"+name+"'] small").text();
    $.get("data/filter-spectra/"+name+".tsv", {},
      function(data) { $("#extended_details").text(name+" "+desc+"\n"+data); })
  });
}

var plotFilter = function(name, color) {
  d3.tsv("data/filter-spectra/"+name+".tsv", function(data1) {
    plotFilterSpectrum(data1, name, color);
  });
}

var initFilterList = function() {
  d3.tsv("data/filters.tsv", function(data) {
      var listAddWrap = $("#filters .option-list.settings");
      var listRmWrap = $("#filters .option-list.selection");
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
          .attr("data-color", data[i].color)
          .addClass("btn btn-block")
          .prepend(fluColor).append(waveSmall).append(nickSmall);
        var filObj2 = filObj.clone();

        filObj.click(function(e) {
            var name = $(this).attr("data-name"),
              color = $(this).attr("data-color");
            $(this).css({'display':'none'})
            $("#filters .selection a[data-name='"+name+"']").removeAttr("style");
            plotFilter(name, color);
            e.preventDefault();
          });
        listAddWrap.prepend(filObj);

        filObj2.click(function(e) {
            var name = $(this).attr("data-name");
            $(this).css({'display':'none'})
            $("#filters .settings a[data-name='"+name+"']").removeAttr("style");
            $("path[name='"+name+"_filter'").remove();
            e.preventDefault();
          }).css({'display':'none'});
        listRmWrap.prepend(filObj2);
      }
  });
}

var plotSpectraViewer = function () {
  var svg = d3.select("#d3wrapper svg");
  $("#d3wrapper svg g").remove();
  svg.attr("width", $("#d3wrapper").width());
  svg.attr("height", $("#d3wrapper").height());

  var width = +svg.attr("width") - margin.left - margin.right;
  var height = +svg.attr("height") - margin.top - margin.bottom;
  var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var formatNumber = d3.format(".1f");
  var x = d3.scaleLinear().domain(visRange).range([0, width]);
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

  var activeFilters = $('#filters .selection a').filter(function() {
    return $(this).css('display') != 'none';
  });
  for (var i = activeFilters.length - 1; i >= 0; i--) {
    name = $(activeFilters[i]).attr("data-name");
    color = $(activeFilters[i]).attr("data-color");
    plotFilter(name, color);
  }

  var activeFluos = $('#fluorophores .selection a').filter(function() {
    return $(this).css('display') != 'none';
  });
  for (var i = activeFluos.length - 1; i >= 0; i--) {
    name = $(activeFluos[i]).attr("data-name");
    color = $(activeFluos[i]).attr("data-color");
    plotFluorophore(name, color);
  }
}

$(document).ready(function() {
    initFluorophoreList();
    initFilterList();
    plotSpectraViewer();
});
$(window).resize(plotSpectraViewer);