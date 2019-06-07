var margin = {top: 40, right: 20, bottom: 20, left: 40},
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
    vis.insert("path")
      .datum(data)
      .attr("class", "line fluoSpectra")
      .attr("fill", color).attr("fill-opacity", 0.3)
      .attr("stroke", color).attr("stroke-width", 2)
      .attr("stroke-dasharray", 4)
      .attr("name", "fluo_"+name)
      .attr("d", d3.line()
        .x(function(d) { return x(d.w); })
        .y(function(d) { return y(1-d.ri); }));
  } else {
    vis.insert("path")
      .datum(data)
      .attr("class", "line fluoSpectra")
      .attr("fill", color).attr("fill-opacity", 0.3)
      .attr("stroke", color).attr("stroke-width", 2)
      .attr("name", "fluo_"+name)
      .attr("d", d3.line()
        .x(function(d) { return x(d.w); })
        .y(function(d) { return y(1-d.ri); }));
  }
  $("path[name='fluo_"+name+"']").mouseenter(function(e) {
    var name = $(this).attr("name").split("_")[0];
    var desc = $("#fluorophores .selection a[data-name='"+name+"']").text();
    $("#short-details").val(desc);
  });
  $("path[name='fluo_"+name+"']").mouseleave(function(e) {
    $("#short-details").val("");
  });
  $("path[name='fluo_"+name+"']").click(function(e) {
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
      var listAddWrap = $(".fluorophores .option-list");
      var listRmWrap = $(".fluorophores.selection");
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
            $(".fluorophores .option-list a").removeAttr("style");
            $(this).css({'display':'none'})
            $(".fluorophores.selection a").css({'display':'none'});
            $(".fluorophores.selection a[data-name='"+name+"']").removeAttr("style");
            $("path[name*='fluo_'").remove();
            plotSpectraViewer();
            checkModelability();
            e.preventDefault();
          });
        listAddWrap.prepend(fluObj);

        fluObj2.click(function(e) {
            var name = $(this).attr("data-name");
            $(this).css({'display':'none'})
            $(".fluorophores .option-list a").removeAttr("style");
            $(".fluorophores.selection a.disabled").removeAttr("style");
            $("path[name*='fluo_']").remove();
            checkModelability();
            e.preventDefault();
          }).css({'display':'none'});
        listRmWrap.prepend(fluObj2);
      }
  });
}

var plotFilterSpectrum = function(data1, name, color, prefix) {
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
  vis.append("path", ":first-child")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "#323232").attr("fill-opacity", 0.3)
    .attr("stroke", color).attr("stroke-width", 2)
    .attr("name", prefix+"_"+name+"_filter")
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

var plotFilter = function(name, color, prefix) {
  d3.tsv("data/filter-spectra/"+name+".tsv", function(data1) {
    plotFilterSpectrum(data1, name, color, prefix);
  });
}

var initExFilterList = function() {
  d3.tsv("data/filters.tsv", function(data) {
      var listAddWrap = $(".ex-filters .option-list.input");
      var listRmWrap = $(".ex-filters.selection");
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
            $(".ex-filters .option-list a").removeAttr("style");
            $(this).css({'display':'none'})
            $(".ex-filters.selection a").css({'display':'none'});
            $(".ex-filters.selection a[data-name='"+name+"']").removeAttr("style");
            $("path[name*='ex_'").remove();
            plotSpectraViewer();
            checkModelability();
            e.preventDefault();
          });
        listAddWrap.prepend(filObj);

        filObj2.click(function(e) {
            var name = $(this).attr("data-name");
            $(this).css({'display':'none'})
            $(".ex-filters .option-list a").removeAttr("style");
            $(".ex-filters.selection a.disabled").removeAttr("style");
            $("path[name*='ex_'").remove();
            checkModelability();
            e.preventDefault();
          }).css({'display':'none'});
        listRmWrap.prepend(filObj2);
      }
  });
}

var initEmFilterList = function() {
  d3.tsv("data/filters.tsv", function(data) {
      var listAddWrap = $(".em-filters .option-list.input");
      var listRmWrap = $(".em-filters.selection");
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
            $(".em-filters .option-list a").removeAttr("style");
            $(this).css({'display':'none'})
            $(".em-filters.selection a").css({'display':'none'});
            $(".em-filters.selection a[data-name='"+name+"']").removeAttr("style");
            $("path[name*='em_'").remove();
            plotSpectraViewer();
            checkModelability();
            e.preventDefault();
          });
        listAddWrap.prepend(filObj);

        filObj2.click(function(e) {
            var name = $(this).attr("data-name");
            $(this).css({'display':'none'})
            $(".em-filters .option-list a").removeAttr("style");
            $(".em-filters.selection a.disabled").removeAttr("style");
            $("path[name*='em_'").remove();
            checkModelability();
            e.preventDefault();
          }).css({'display':'none'});
        listRmWrap.prepend(filObj2);
      }
  });
}

var plotSourceSpectrum = function(data1, name, color) {
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
  vis.append("path", ":first-child")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "#fefefe").attr("fill-opacity", 0.5)
    .attr("stroke", color).attr("stroke-width", 2)
    .attr("stroke-dasharray", 4)
    .attr("name", name+"_source")
    .attr("d", d3.line()
      .x(function(d) { return x(d.w); })
      .y(function(d) { return y(1-d.ri); }));
  $("path[name='"+name+"_source']").mouseenter(function(e) {
    var name = $(this).attr("name").split("_")[0];
    var desc = $("#sources .selection a[data-name='"+name+"']").text();
    $("#short-details").val("source: " + desc);
  });
  $("path[name='"+name+"_source']").mouseleave(function(e) {
    $("#short-details").val("");
  });
  $("path[name='"+name+"_source']").click(function(e) {
    var name = $(this).attr("name").split("_")[0];
    var desc = $("#sources .selection a[data-name='"+name+"'] small").text();
    $.get("data/source-spectra/"+name+".tsv", {},
      function(data) { $("#extended_details").text("source: "+name+" "+desc+"\n"+data); })
  });
}

var plotSource = function(name, color) {
  d3.tsv("data/source-spectra/"+name+".tsv", function(data1) {
    plotSourceSpectrum(data1, name, color);
  });
}

var initSourceList = function() {
  d3.tsv("data/sources.tsv", function(data) {
      var listAddWrap = $(".sources .option-list");
      var listRmWrap = $(".sources.selection");
      for (var i = data.length - 1; i >= 0; i--) {
        if ( data[i].color == "auto" ) { data[i].color = get_color(data[i].peak); }
        var fluColor = $("<span></span>")
          .css({'background-color':data[i].color})
          .addClass("fluColor");

        if ( "" == data[i].customDescription ) {
          data[i].customDescription = data[i].peak+"/"+data[i].width;
        }
        var detailSmall = $("<small> ("+data[i].details+")</small>");

        var lightObj = $("<a href='#'>"+data[i].name+"</a>")
          .attr("data-name", data[i].name)
          .attr("data-color", data[i].color)
          .addClass("btn btn-block")
          .prepend(fluColor).append(detailSmall);
        var lightObj2 = lightObj.clone();

        lightObj.click(function(e) {
            var name = $(this).attr("data-name"),
              color = $(this).attr("data-color");
            $(".sources .option-list a").removeAttr("style");
            $(this).css({'display':'none'})
            $(".sources.selection a").css({'display':'none'});
            $(".sources.selection a[data-name='"+name+"']").removeAttr("style");
            $("path[name*='source'").remove();
            plotSpectraViewer();
            checkModelability();
            e.preventDefault();
          });
        listAddWrap.prepend(lightObj);

        lightObj2.click(function(e) {
            var name = $(this).attr("data-name");
            $(this).css({'display':'none'})
            $(".sources .option-list a").removeAttr("style");
            $(".sources.selection a.disabled").removeAttr("style");
            $("path[name*='source'").remove();
            e.preventDefault();
            checkModelability();
          }).css({'display':'none'});
        listRmWrap.prepend(lightObj2);
      }
  });
}

plotSpectraViewerBase = function() {
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

  svg.append("text")
      .attr("transform", "translate("+((visRange[1]+visRange[0])/2-margin.left)+","+(margin.top/3)+")")
      .style("text-anchor", "middle")
      .text("Wavelength (nm)");
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", -svg.attr("height")/2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Relative Intensity (a.u.)"); 
  function customXAxis(g) {
    g.call(xAxis);
    g.select(".domain").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").attr("x", -4).attr("dy", -4);
  }
  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(customXAxis);

  function customYAxis(g) {
    g.call(yAxis);
    g.select(".domain").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").attr("x", -20).attr("dy", 2);
  }
  g.append("g").call(customYAxis);

  svg.on("mousemove", function() {
    var mouse = d3.mouse(this);
    var width = +$(this).attr("width") - margin.left - margin.right;
    var height = +$(this).attr("height") - margin.top - margin.bottom;
    mouse[0] = mouse[0] - margin.left;
    mouse[0] = d3.scaleLinear().domain([0, width]).range(visRange)(mouse[0]);
    mouse[0] = Math.round(mouse[0]*10)/10;
    mouse[1] = height - mouse[1] + margin.top;
    mouse[1] = d3.scaleLinear().domain([0, height]).range([0, 1])(mouse[1]);
    mouse[1] = Math.round(mouse[1]*100)/100;
    $("#mouse-coords").text(mouse);
  });
}

var plotSpectraViewerStandard = function() {
  plotSpectraViewerBase();

  var activeSource = $('.sources.selection a:not(.disabled)').filter(function() {
    return $(this).css('display') != 'none';
  });
  for (var i = activeSource.length - 1; i >= 0; i--) {
    name = $(activeSource[i]).attr("data-name");
    color = $(activeSource[i]).attr("data-color");
    plotSource(name, color);
  }

  var activeExFilters = $('.ex-filters.selection a:not(.disabled)').filter(function() {
    return $(this).css('display') != 'none';
  });
  for (var i = activeExFilters.length - 1; i >= 0; i--) {
    name = $(activeExFilters[i]).attr("data-name");
    color = $(activeExFilters[i]).attr("data-color");
    plotFilter(name, color, "ex");
  }

  var activeFluos = $('.fluorophores.selection a:not(.disabled)').filter(function() {
    return $(this).css('display') != 'none';
  });
  for (var i = activeFluos.length - 1; i >= 0; i--) {
    name = $(activeFluos[i]).attr("data-name");
    color = $(activeFluos[i]).attr("data-color");
    plotFluorophore(name, color);
  }

  var activeEmFilters = $('.em-filters.selection a:not(.disabled)').filter(function() {
    return $(this).css('display') != 'none';
  });
  for (var i = activeEmFilters.length - 1; i >= 0; i--) {
    name = $(activeEmFilters[i]).attr("data-name");
    color = $(activeEmFilters[i]).attr("data-color");
    plotFilter(name, color, "em");
  }
}

var plotSpectraViewerModel = function() {
  plotSpectraViewerBase();


  var activeSource = $('.sources.selection a:not(.disabled)').filter(function() {
    return $(this).css('display') != 'none';
  })[0];
  console.log(activeSource);
  var activeExFilters = $('.ex-filters.selection a:not(.disabled)').filter(function() {
    return $(this).css('display') != 'none';
  })[0];
  console.log(activeExFilters);
  var activeFluos = $('.fluorophores.selection a:not(.disabled)').filter(function() {
    return $(this).css('display') != 'none';
  })[0];
  console.log(activeFluos);
  var activeEmFilters = $('.em-filters.selection a:not(.disabled)').filter(function() {
    return $(this).css('display') != 'none';
  })[0];
  console.log(activeEmFilters);

}

var plotSpectraViewer = function() {
  if ( $('#model-trigger').prop('checked') ) {
    plotSpectraViewerModel();
  } else {
    plotSpectraViewerStandard();
  }
}

var checkModelability = function() {
  var sourceSelected = $('.sources.selection a.disabled').css('display') == 'none',
    exFilterSelected = $('.ex-filters.selection a.disabled').css('display') == 'none',
    emFilterSelected = $('.em-filters.selection a.disabled').css('display') == 'none',
    fluoSelected = $('.fluorophores.selection a.disabled').css('display') == 'none';

  if ( sourceSelected & exFilterSelected & emFilterSelected & fluoSelected ) {
    $('#model-trigger').bootstrapToggle('enable');
  } else {
    $('#model-trigger').bootstrapToggle('off');
    $('#model-trigger').bootstrapToggle('disable');
  }
}

$(document).ready(function() {
    initSourceList();
    initExFilterList();
    initFluorophoreList();
    initEmFilterList();
    checkModelability();
    plotSpectraViewer();

    $("#model-trigger").change(function() {
      plotSpectraViewer();
    });
});
$(window).resize(plotSpectraViewer);
