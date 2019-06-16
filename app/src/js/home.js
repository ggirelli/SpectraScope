var margin = {top: 40, right: 20, bottom: 20, left: 40},
  visRange = [250, 900];

var inScope = function(scopes) {
  var scopeSelected = $("#scope-select").children("option:selected").val();
  if ("useall" == scopeSelected) return(true);
  return -1 != scopes.indexOf(scopeSelected);
}

var plotSpectrum = function(name, type, color, dashed = false) {
  var selectedTemplate = eset.get("selected-template");
  var data1 = eset.get("templates." + selectedTemplate + ".fluorophores." + name + "." + type + "spectra");
  name = name + "_" + type;

  var data = [], sdata = "w\tri\n";
  for (var i = 0; i < data1.w.length; i++) {
    data.push({w:data1.w[i], ri:data1.ri[i]});
    sdata  = sdata + data1.w[i] + "\t" + data1.ri[i] + "\n";
  }

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
    var name = $(this).attr("name").split("_")[0],
      type = $(this).attr("name").split("_")[1],
      desc = $("#fluorophores .selection a[data-name='"+name+"']").text();
    $("#short-details").val(desc + " (" + type + ")");
  });
  $("path[name='"+name+"']").mouseleave(function(e) {
    $("#short-details").val("");
  });
  $("path[name='"+name+"']").click(function(e) {
    var name = $(this).attr("name").split("_")[0],
      desc = $("#fluorophores .selection a[data-name='"+name.split("_")[0]+"'] small").text();
    $("#extended_details").text(name+" "+desc+" (" + type + ")\n"+sdata);
  });
}

var plotFluorophore = function(name, color) {
  plotSpectrum(name, "ex", color, true)
  plotSpectrum(name, "em", color)
}

var initFluorophoreList = function() {
  var listAddWrap = $("#fluorophores .option-list.settings");
  listAddWrap.children().remove();
  var listRmWrap = $("#fluorophores .option-list.selection");
  listRmWrap.children().remove();

  var selectedTemplate = eset.get("selected-template");
  var data = eset.get("templates." + selectedTemplate + ".fluorophores");
  var fluo_names = Object.keys(data);

  for (var k = 0; k < fluo_names.length; k++) {
    var i = fluo_names[k];

    if ( data[i].color == "auto" ) { data[i].color = get_color(data[i].empeak); }
    var fluColor = $("<span></span>")
      .css({'background-color':data[i].color})
      .addClass("fluColor");

    var waveSmall = $("<small>("+data[i].expeak+"/"+data[i].empeak+")</small>");

    var fluObj = $("<a href='#'>"+i+" </a>")
      .attr("data-name", i)
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
}

var plotFilterSpectrum = function(name, color) {
  var selectedTemplate = eset.get("selected-template");
  var filter = eset.get("templates." + selectedTemplate + ".optical_elements." + name);
  var data1 = filter.spectra;

  var data = [], sdata = "w\tri\n";
  for (var i = 0; i < data1.w.length; i++) {
    data.push({w:data1.w[i], ri:data1.ri[i]});
    sdata  = sdata + data1.w[i] + "\t" + data1.ri[i] + "\n";
  }

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
    var name = $(this).attr("name").split("_")[0],
      desc = $(".filters.selection a[data-name='"+name+"']").text();
    $("#short-details").val(desc);
  });
  $("path[name='"+name+"_filter']").mouseleave(function(e) {
    $("#short-details").val("");
  });
  $("path[name='"+name+"_filter']").click(function(e) {
    var name = $(this).attr("name").split("_")[0],
      desc = $(".filters.selection a[data-name='"+name+"'] small").text();
    $("#extended_details").text("Filter: " + name+" "+desc+" (" + filter.type + ")\n"+sdata);
  });
}

var plotFilter = function(name, color) {
  plotFilterSpectrum(name, color);
}

var initFilterList = function(ftype) {
  var listAddWrap = $("#"+ftype+"-filters .option-list.settings");
  listAddWrap.children().remove();
  var listRmWrap = $("#"+ftype+"-filters .option-list.selection");
  listRmWrap.children().remove();

  var selectedTemplate = eset.get("selected-template");
  var data = eset.get("templates." + selectedTemplate + ".optical_elements");
  var filter_names = Object.keys(data);

  for (var k = 0; k < filter_names.length; k++) {
    var i = filter_names[k];
    
    if ( !inScope(data[i].microscopes) ) continue;
    if (data[i].type != ftype) continue;

    if ( data[i].color == "auto" ) { data[i].color = get_color(data[i].mid); }
    var fluColor = $("<span></span>")
      .css({'background-color':data[i].color})
      .addClass("fluColor");

    if ( "" == data[i].description ) {
      if ( "none" == data[i].width) {
        data[i].description = data[i].mid;
      } else {
        data[i].description = data[i].mid+"/"+data[i].width;
      }
    }
    var waveSmall = $("<small> ("+data[i].description+")</small>");
    var nickSmall = $("<small> ("+data[i].details+")</small>");

    var filObj = $("<a href='#'>"+i+"<br/></a>")
      .attr("data-name", i)
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
}

var plotSourceSpectrum = function(name, color) {
  var selectedTemplate = eset.get("selected-template");
  var data1 = eset.get("templates." + selectedTemplate + ".sources." + name + ".spectra");

  var data = [], sdata = "w\tri\n";
  for (var i = 0; i < data1.w.length; i++) {
    data.push({w:data1.w[i], ri:data1.ri[i]});
    sdata  = sdata + data1.w[i] + "\t" + data1.ri[i] + "\n";
  }

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
    var name = $(this).attr("name").split("_")[0],
      desc = $("#sources .selection a[data-name='"+name+"']").text();
    $("#short-details").val("source: " + desc);
  });

  $("path[name='"+name+"_source']").mouseleave(function(e) {
    $("#short-details").val("");
  });

  $("path[name='"+name+"_source']").click(function(e) {
    var name = $(this).attr("name").split("_")[0],
      desc = $("#sources .selection a[data-name='"+name+"'] small").text();
    $("#extended_details").text("Source: " + name+" "+desc+"\n"+sdata);
  });
}

var plotSource = function(name, color) {
  plotSourceSpectrum(name, color);
}

var initSourceList = function() {
  var listAddWrap = $("#sources .option-list.settings");
  listAddWrap.children().remove();
  var listRmWrap = $("#sources .option-list.selection");
  listRmWrap.children().remove();

  var selectedTemplate = eset.get("selected-template");
  var data = eset.get("templates." + selectedTemplate + ".sources");
  var source_names = Object.keys(data);

  for (var k = 0; k < source_names.length; k++) {
    var i = source_names[k];
    if ( !inScope(data[i].microscopes) ) continue;

    if ( data[i].color == "auto" ) { data[i].color = get_color(data[i].peak); }
    var fluColor = $("<span></span>")
      .css({'background-color':data[i].color})
      .addClass("fluColor");

    if ( "" == data[i].customDescription ) {
      data[i].customDescription = data[i].peak+"/"+data[i].width;
    }
    var detailSmall = $("<small> ("+data[i].details+")</small>");

    var lightObj = $("<a href='#'>"+i+"</a>")
      .attr("data-name", i)
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

var initScopeList = function() {
    var selectedTemplate = eset.get("selected-template");
    var scopeList = eset.get("templates." + selectedTemplate + ".microscopes");

    $("#scope-select").children("option:not(.default)").remove();

    for (var i = 0; i < scopeList.length; i++) {
      var scopeOpt = $("<option></option>")
        .text(scopeList[i]).val(scopeList[i]);
      $("#scope-select").append(scopeOpt);
    }
}

async function bootSpectraScope() {
  await initSourceList();
  await initFilterList("dm");
  await initFilterList("ex");
  await initFilterList("em");
  await initFluorophoreList();
  plotSpectraViewer();
}


$(document).ready(function() {
    $("#settings-modal-receiver").load("./includes/settings-modal.html");
    $("footer").load("./includes/footer.html");

    initScopeList();
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
