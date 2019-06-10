var margin = {top: 40, right: 20, bottom: 20, left: 40},
  visRange = [250, 900];

var inScope = function(scopes, scopeSelected) {
  if ("useall" == scopeSelected) return(true);
  for (var i = scopes.length - 1; i >= 0; i--) {
    if (scopes[i] == scopeSelected) return(true);
  }
  return(false);
}

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
      .attr("name", name)
      .attr("d", d3.line()
        .x(function(d) { return x(d.w); })
        .y(function(d) { return y(1-d.ri); }));
  } else {
    vis.insert("path")
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
  d3.tsv("data/fluorophore-spectra/"+name+"_ex.tsv").then(function(data1) {
    plotSpectrum(data1, name+"_ex", color, true)
  });
  d3.tsv("data/fluorophore-spectra/"+name+"_em.tsv").then(function(data1) {
    plotSpectrum(data1, name+"_em", color)
  });
}

var initFluorophoreList = function() {
  return(d3.tsv("data/fluorophores.tsv").then(function(data) {
      var listAddWrap = $("#fluorophores .option-list.settings");
      listAddWrap.children().remove();
      var listRmWrap = $("#fluorophores .option-list.selection");
      listRmWrap.children().remove();
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
  }));
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
  vis.append("path", ":first-child")
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
  d3.tsv("data/filter-spectra/"+name+".tsv").then(function(data1) {
    plotFilterSpectrum(data1, name, color);
  });
}

var initFilterList = function(ftype) {
  return(d3.tsv("data/filters.tsv").then(function(data) {
      var listAddWrap = $("#"+ftype+"-filters .option-list.settings");
      listAddWrap.children().remove();
      var listRmWrap = $("#"+ftype+"-filters .option-list.selection");
      listRmWrap.children().remove();
      for (var i = data.length - 1; i >= 0; i--) {
        if ( !inScope(data[i].scope.split(","),
          $("#scope-select").children("option:selected").val()) ) continue;
        if (data[i].type != ftype) continue;
        data[i].name = data[i].type+" "+data[i].name

        if ( data[i].color == "auto" ) { data[i].color = get_color(data[i].mid); }
        var fluColor = $("<span></span>")
          .css({'background-color':data[i].color})
          .addClass("fluColor");

        if ( "" == data[i].customDescription ) {
          if ( "none" == data[i].width) {
            data[i].customDescription = data[i].mid;
          } else {
            data[i].customDescription = data[i].mid+"/"+data[i].width;
          }
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
            $("#"+ftype+"-filters .selection a[data-name='"+name+"']").removeAttr("style");
            plotFilter(name, color);
            e.preventDefault();
          });
        listAddWrap.prepend(filObj);

        filObj2.click(function(e) {
            var name = $(this).attr("data-name");
            $(this).css({'display':'none'})
            $("#"+ftype+"-filters .settings a[data-name='"+name+"']").removeAttr("style");
            $("path[name='"+name+"_filter'").remove();
            e.preventDefault();
          }).css({'display':'none'});
        listRmWrap.prepend(filObj2);
      }
  }));
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
  d3.tsv("data/source-spectra/"+name+".tsv").then(function(data1) {
    plotSourceSpectrum(data1, name, color);
  });
}

var initSourceList = function() {
  return(d3.tsv("data/sources.tsv").then(function(data) {
      var listAddWrap = $("#sources .option-list.settings");
      listAddWrap.children().remove();
      var listRmWrap = $("#sources .option-list.selection");
      listRmWrap.children().remove();
      for (var i = data.length - 1; i >= 0; i--) {
        if ( !inScope(data[i].scope.split(","),
          $("#scope-select").children("option:selected").val()) ) continue;

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
            $(this).css({'display':'none'})
            $("#sources .selection a[data-name='"+name+"']").removeAttr("style");
            plotSource(name, color);
            e.preventDefault();
          });
        listAddWrap.prepend(lightObj);

        lightObj2.click(function(e) {
            var name = $(this).attr("data-name");
            $(this).css({'display':'none'})
            $("#sources .settings a[data-name='"+name+"']").removeAttr("style");
            $("path[name='"+name+"_source'").remove();
            e.preventDefault();
          }).css({'display':'none'});
        listRmWrap.prepend(lightObj2);
      }
  }));
}

var plotSpectraViewer = function() {
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

var initScopeList = function(path) {
  return(d3.tsv(path).then(function(data) {
      var scopeOptBase = $("#scope-select").children("option");
      var scopesBase = [], scopes = [];
      for (var i = scopeOptBase.length - 1; i >= 0; i--) {
        scopesBase.push($(scopeOptBase[i]).text());
      }
      for (var i = data.length - 1; i >= 0; i--) {
        var tmp_scopes = data[i].scope.split(",");
        for (var i = tmp_scopes.length - 1; i >= 0; i--) {
          if (-1 == scopesBase.indexOf(tmp_scopes[i])) {
            if (-1 == scopes.indexOf(tmp_scopes[i])) {
              scopes.push(tmp_scopes[i]);
            }
          }
        }
      }
      for (var i = scopes.length - 1; i >= 0; i--) {
        var scopeOpt = $("<option></option>")
          .text(scopes[i]).val(scopes[i]);
        $("#scope-select").append(scopeOpt);
      }
    }));
}

async function bootSpectraScope() {
  await initScopeList("data/sources.tsv");
  await initScopeList("data/filters.tsv");
  await initSourceList();
  await initFilterList("DM");
  await initFilterList("EX");
  await initFilterList("EM");
  await initFluorophoreList();
  plotSpectraViewer();
}


$(document).ready(function() {
    bootSpectraScope();
    $("#expand-all").click(function(e) {
      $('.accordion .collapse').removeClass('collapse').addClass('ex-collapse');
      e.preventDefault();
    });
    $("#collapse-all").click(function(e) {
      $('.ex-collapse').removeClass('ex-collapse').addClass('collapse');
      e.preventDefault();
    });
    $("#scope-select").change(function(e) {
      bootSpectraScope();
    });
});
$(window).resize(plotSpectraViewer);
