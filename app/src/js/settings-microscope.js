
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

$(function() {
	$("#settings-scope-tab").click(function(e) {
		load_microscope_list();
	});
});