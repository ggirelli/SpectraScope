
load_microscope_list = function() {
	// Load microscope list
	var selectedTemplate = eset.get("selected-template");
	var microscope_list = eset.get("templates." + selectedTemplate + ".microscopes");
	$("#settings-microscopes").children().remove();
	for (var i = microscope_list.length - 1; i >= 0; i--) {
		var microscope_name = microscope_list[i];
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
			var microscope_list = eset.get("templates." + selectedTemplate + ".microscopes");
			if ( result == null || 0 == result.length ) {
				toastr.error("No microscope added.");
			} else if ( -1 != microscope_list.indexOf(result) ) {
				toastr.error("The provided name is already in use. Try again.");
			} else {
				microscope_list.push(result);
				eset.set("templates." + selectedTemplate + ".microscopes", microscope_list);
				load_microscope_list();
				toastr.success("Added microscope '" + result + "'!");
			}
		}
	});
}

$(function() {
	$("#settings-scope-tab").click(function(e) { load_microscope_list(); });
	$("#settings-add-microscope-btn").click(function(e) { add_microscope(); });
});
