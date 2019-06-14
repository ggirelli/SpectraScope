
load_scopeList = function() {
	// Load microscope list
	var selectedTemplate = eset.get("selected-template");
	var scopeList = eset.get("templates." + selectedTemplate + ".microscopes");
	$("#settings-microscopes").children().remove();
	for (var i = scopeList.length - 1; i >= 0; i--) {
		var microscope_name = scopeList[i];
		var optElement = $("<option></option>").text(microscope_name);
		if ( i == 0 ) { optElement.attr("selected", true); }
		$("#settings-microscopes").prepend(optElement);
	}
}

add_microscope = function() {
	// Add empty microscope
	bootbox.prompt({
		title: "How should we call the new microscope?",
		callback: function(result) {
			var selectedTemplate = eset.get("selected-template");
			var scopeList = eset.get("templates." + selectedTemplate + ".microscopes");
			if ( result == null || 0 == result.length ) {
				toastr.error("No microscope added.");
			} else if ( -1 != scopeList.indexOf(result) ) {
				toastr.error("The provided name is already in use. Try again.");
			} else {
				scopeList.push(result);
				eset.set("templates." + selectedTemplate + ".microscopes", scopeList.sort());
				toastr.success("Added microscope '" + result + "'!");
				load_scopeList();
			}
		}
	});
}

rm_microscope = function() {
	// Remove current microscope. Requires confirmation.
	var selectedTemplate = eset.get("selected-template");

	var scopeList = eset.get("templates." + selectedTemplate + ".microscopes"),
		selectedScope = $("#settings-microscopes").val();

	var msg = "Are you sure you want to cancel the '" + selectedScope + "' microscope?<br/>";
	msg = msg + "<small class='text-danger'>This cannot be undone!</small>";
	bootbox.confirm({
		message: msg,
		callback: function(result){
			if ( result ) {
				var new_scopeList = $.grep(scopeList, (value) => { return value != selectedScope }).sort();
			    eset.set("templates." + selectedTemplate + ".microscopes", new_scopeList);

			    // Light sources
			    var sourceRootPath = "templates." + selectedTemplate + ".sources";
			    var sources = eset.get(sourceRootPath);
			    for (var i = Object.keys(sources).length - 1; i >= 0; i--) {
			    	var sourceName = Object.keys(sources)[i],
			    		sourcePath = sourceRootPath + "." + sourceName;
			    	scopeList = eset.get(sourcePath + ".microscopes");
			    	if ( -1 != scopeList.indexOf(selectedScope) ) {
						new_scopeList = $.grep(scopeList, (value) => { return value != selectedScope }).sort();
						eset.set(sourcePath + ".microscopes", new_scopeList);
					}
			    }

			    // Optical components

			    toastr.success("The microscope '" + selectedScope + "' has been removed.");
			    load_scopeList();
			} else {
				toastr.info("Nothing done.");
			}
		}
	});
}

load_microscope_components = function() {
	// Load components that are or can be associated with the selected microscope.
	var selectedTemplate = eset.get("selected-template");
	var selectedScope = $("#settings-microscopes").val();

	// Light sources
	var sourceAvailWrap = $("#settings-microscopes-source-available");
	var sourceAddedWrap = $("#settings-microscopes-source-added");
	sourceAvailWrap.children().remove();
	sourceAddedWrap.children().remove();
	for (var i = Object.keys(eset.get("templates." + selectedTemplate + ".sources")).length - 1; i >= 0; i--) {
		var sourceName = Object.keys(eset.get("templates." + selectedTemplate + ".sources"))[i];
		var scopeList = eset.get("templates." + selectedTemplate + ".sources." + sourceName + ".microscopes");

		var sourceElem = $("<option></option>")
			.text(sourceName)
			.attr("name", sourceName)
			.val(sourceName);

		var sourceAvailElem = sourceElem.clone()
			.click(function(e) {
				e.preventDefault();
				$(this).css({"display" : "none"});

				var selectedTemplate = eset.get("selected-template");
				var selectedScope = $("#settings-microscopes").val();
				var sourcePath = "templates." + selectedTemplate + ".sources." + $(this).val();
				var source = eset.get(sourcePath);
				var scopeList =  source.microscopes;
				if ( -1 == scopeList.indexOf(selectedScope) ) {
					scopeList.push(selectedScope);
					eset.set(sourcePath + ".microscopes", scopeList.sort());
				}

				sourceAddedWrap
					.find("option[name="+$(this).attr("name")+"]")
					.removeAttr("style")
					.blur().prop("selected", false);
			});
		var sourceAddedElem = sourceElem.clone()
			.click(function(e) {
				e.preventDefault();
				$(this).css({"display" : "none"});

				var selectedTemplate = eset.get("selected-template");
				var selectedScope = $("#settings-microscopes").val();
				var sourcePath = "templates." + selectedTemplate + ".sources." + $(this).val();
				var source = eset.get(sourcePath);
				var scopeList =  source.microscopes;
				if ( -1 != scopeList.indexOf(selectedScope) ) {
					eset.set(sourcePath + ".microscopes",
						$.grep(scopeList, (value) => { return value != selectedScope }).sort());
				}

				sourceAvailWrap
					.find("option[name="+$(this).attr("name")+"]")
					.removeAttr("style")
					.blur().prop("selected", false);
			});

		if ( -1 == scopeList.indexOf(selectedScope) ) {
			sourceAvailWrap.append(sourceAvailElem);
			sourceAddedWrap.append(sourceAddedElem.css({"display" : "none"}));
		} else {
			sourceAvailWrap.append(sourceAvailElem.css({"display" : "none"}));
			sourceAddedWrap.append(sourceAddedElem);
		}
	}

	// Optical components
}

$(function() {
	$("#settings-scope-tab").click(function(e) {
		load_scopeList();
		load_microscope_components();
	});
	$("#settings-microscopes").change(function(e) { load_microscope_components(); });
	$("#settings-add-microscope-btn").click(function(e) { add_microscope(); });
	$("#settings-rm-microscope-btn").click(function(e) { rm_microscope(); });
});
