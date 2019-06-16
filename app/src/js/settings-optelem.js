
load_optical_element_list = function() {
	// Load list of optical elements and their data to the settings table
	$("table.optElem-settings-list > tbody").children().remove();

	var selectedTemplate = eset.get("selected-template");
	var opticalElements = eset.get("templates." + selectedTemplate + ".optical_elements");

	var typeList = []

	for (var i = Object.keys(opticalElements).length - 1; i >= 0; i--) {
		var optElemName = Object.keys(opticalElements)[i]
		typeList.push(opticalElements[optElemName].type);
		
		var optElemRow = $("<tr></tr>");
		optElemRow.append($("<th scope='row'>" + optElemName + "</th>"));
		optElemRow.append($("<td>" + opticalElements[optElemName].mid + "</td>"));
		if ( "dm" != opticalElements[optElemName].type ) {
			optElemRow.append($("<td>" + opticalElements[optElemName].width + "</td>"));
		}
		optElemRow.append($("<td>" + opticalElements[optElemName].microscopes.join(", ") + "</td>"));
		optElemRow.append($("<td>" + opticalElements[optElemName].color + "</td>"));
		optElemRow.append($("<td>" + opticalElements[optElemName].details + "</td>"));
		optElemRow.append($("<td>" + opticalElements[optElemName].description + "</td>"));

		var optElemOpts = $("<td></td>");
		optElemOpts.append(
			$("<a href='#'></a>")
				.addClass("btn btn-danger btn-sm mr-2")
				.html("<i class='fas fa-minus' ></i>")
				.attr('data-name', optElemName)
				.click(function(e) {
					e.preventDefault();
					rm_optical_element($(this).attr("data-name"));
				})
				.attr('data-toggle', 'tooltip')
				.attr('data-placement', 'top')
				.attr('title', 'Remove optical element')
				.tooltip()
			);
		optElemOpts.append(
			$("<a href='#'></a>")
				.addClass("btn btn-info btn-sm mr-2")
				.html("<i class='fas fa-file-export' ></i>")
				.attr('data-name', optElemName)
				.click(function(e) {
					e.preventDefault();
					dl_optical_element_spectra($(this).attr("data-name"));
				})
				.attr('data-toggle', 'tooltip')
				.attr('data-placement', 'top')
				.attr('title', 'Download spectra')
				.tooltip()
			);
		optElemRow.append(optElemOpts);

		$("table.optElem-settings-list#settings-" + opticalElements[optElemName].type).append(optElemRow);
	}

	base_types = ["em", "ex", "dm"]
	type_meta = {em:8, dm:7, ex:8}
	for (var i = base_types.length - 1; i >= 0; i--) {
		if ( -1 == typeList.indexOf(base_types[i]) ) {
			$("table.optElem-settings-list#settings-" + base_types[i])
				.append($("<tr><td class='text-center' colspan='" + type_meta[base_types[i]] + "'><i>No elements found.</i></td></tr>"));
		}
	}
}

add_optical_element = function(data) {
	// Add a new optical element
	var selectedTemplate = eset.get("selected-template");
	var required_keys = ['name', 'type', 'mid', 'color', 'details', 'description', 'path'];

	var optElem = {};
	var keys = [];
	for (var i = data.length - 1; i >= 0; i--) {
		var e = data[i];
		keys.push(e.name);
		optElem[e.name] = e.value;
	}

	if ( -1 != keys.indexOf("type") ) {
		if ( "dm" != optElem.type ) required_keys.push("width");
	}

	for (var i = required_keys.length - 1; i >= 0; i--) {
		var k = required_keys[i];
		if ( -1 == keys.indexOf(k) ) {
			toastr.error("Missing required '" + k + "' data. No optical element added.");
			return false;
		}
	}

	optElem.mid = parseFloat(optElem.mid);
	if ( "dm" != optElem.type ) optElem.width = parseFloat(optElem.width);
	optElem.spectra = read_spectra(optElem.path);
	optElem.microscopes = [];

	var optElemName = optElem.name
	delete optElem.name;
	eset.set("templates." + selectedTemplate + ".optical_elements." + optElemName, optElem);

	toastr.success("Optical element '" + optElem.name + "' added.");
	load_optical_element_list();
}

add_optical_element_dialog = function() {
	// Show dialog to add a new optical element
	var addOptElemForm = $("<form class='needs-validation'>\
		<div class='mb-2'>\
			Element name:<input class='form-control' type='text' name='name' required />\
			<small class='invalid-feedback'>An optical element with this name is already present. Try a different one!</small>\
		</div>\
		<div class='mb-2'>\
			Element type:<select class='form-control' name='type' id='type'>\
				<option value='ex' selected>Excitation filter</option>\
				<option value='dm'>Dichroic mirror</option>\
				<option value='em'>Emission filter</option>\
			</select>\
		</div>\
		Element midpoint (nm):<input class='form-control mb-2' type='number' min=250 max=900 name='mid' placeholder='Wavelength at transmission window midpoint/beginning' required />\
		Element width (nm):<input class='form-control mb-2' type='number' min=1 max=1000 name='width' placeholder='Transmission window width' required />\
		<div class='mb-2'>\
			Color:<input class='form-control' type='text' name='color' value='auto' required />\
			<small class='invalid-feedback'>The provided color is not valid, try again!</small>\
			<small>Set to <code>auto</code> to let the script select a color automatically, otherwise provide an hexadec code (e.g., '#FFFFFF')).</small>\
		</div>\
		Details:<input class='form-control mb-2' type='text' name='details' />\
		<div>\
			Description:<input class='form-control mb-2' type='text' name='description' />\
			<small>If left empty, a description will be generated by combining midpoint and width.</small>\
		</div>\
		<div class='mb-2'>\
			Spectrum file:<input class='form-control' type='text' name='path' required />\
			<small class='invalid-feedback'>Something is wrong with the uploaded file. Check the console for more details.</small>\
		</div>\
		<input type='submit' class='btn btn-primary float-right mt-2' />\
		<input type='button' class='btn btn-secondary float-right mr-2 mt-2' value='Cancel' />\
	</form>");

	addOptElemForm.submit(function(e) {
		// Check form content and submit if correct
		e.preventDefault();
		var selectedTemplate = eset.get("selected-template");

		$(this).find(".is-invalid").removeClass("is-invalid");
		$(this).find(".is-valid").removeClass("is-valid");

		var nameElem = $(this).find("input[name='name']");
		var newName = nameElem.val();
		if ( newName == null || 0 == newName.length ) {
			nameElem.addClass("is-invalid");
		} else {
			if ( eset.has("templates." + selectedTemplate + ".optical_elements." + newName) ) {
				nameElem.addClass("is-invalid");
			} else {
				nameElem.addClass("is-valid");
			}
		}

		var midpoint = $(this).find("input[name='mid']");
		var newPeak = midpoint.val();
		var re = /[0-9]+/g;
		if ( re.test(newPeak) ) {
			newPeak = parseInt(newPeak);
			if ( newPeak >= 250 & newPeak <= 900 ) {
				midpoint.addClass("is-valid");
			} else {
				midpoint.addClass("is-invalid");
			}
		} else {
			midpoint.addClass("is-invalid");
		}

		if ( "dm" != $(this).find("select").val() ) {
			var winWidth = $(this).find("input[name='width']");
			var newPeak = winWidth.val();
			var re = /[0-9]+/g;
			if ( re.test(newPeak) ) {
				newPeak = parseInt(newPeak);
				if ( newPeak > 0 & newPeak <= 1000 ) {
					winWidth.addClass("is-valid");
				} else {
					winWidth.addClass("is-invalid");
				}
			} else {
				winWidth.addClass("is-invalid");
			}
		}

		var colorElem = $(this).find("input[name='color']");
		var newColor = colorElem.val();
		if ( newColor == "auto" ) {
			colorElem.addClass("is-valid");
		} else {
			var re = /#?[0-9A-Fa-f]{6}/g;
			if ( re.test(newColor) ) {
				colorElem.addClass("is-valid");
				if ( -1 == newColor.indexOf("#") ) {
					colorElem.val("#" + newColor);
				}
			} else {
				colorElem.addClass("is-invalid");
			}
		}

		var spectraElem = $(this).find("input[name='path']");
		var spectrapath = spectraElem.val();
		if ( check_spectra(spectrapath) ) {
			spectraElem.addClass("is-valid");
		} else {
			spectraElem.addClass("is-invalid");
		}

		if ( 0 == $(this).find(".is-invalid").length ) {
			$(this).addClass("was-validated");

			add_optical_element($(this).serializeArray());

			bootbox.hideAll();
		}
	});

	addOptElemForm.find("select").change(function(e) {
		if ( "dm" == $(this).val() ) {
			$(this).parent().parent().find('input[name="width"]').attr("disabled", true);
		} else {
			$(this).parent().parent().find('input[name="width"]').attr("disabled", false);
		}
	});

	addOptElemForm.find("input[type='button']").click(function(e) {
		// Hide bootbox dialog
		bootbox.hideAll();
		toastr.warning("Nothing done.");
		e.preventDefault();
	});

	addOptElemForm.find("input[name='path']").focus(function(e) {
		// Trigger open file dialog
		$(this).blur();
		var filepath = dialog.showOpenDialog(null, {
			title: "Import spectra file",
			properties: ["openFile", "showHiddenFiles"],
			filters: [
				{ name: "Tabulation-separated spectra", extensions: ['tsv'] }
			]
		});
		if ( typeof filepath !== 'undefined' ) {
			$(this).val(filepath[0]);
			$(this).attr('title', filepath[0]);
		}
		e.preventDefault();
	});

	bootbox.dialog({
		title: 'Add optical element',
		message: addOptElemForm,
		closeButton: false
	});
}

rm_optical_element = function(optElemName) {
	// Remove an optical element. Requires confirmation.
	var selectedTemplate = eset.get("selected-template");

	if ( -1 == Object.keys(eset.get("templates." + selectedTemplate + ".optical_elements")).indexOf(optElemName) ) {
		toastr.error("Optical element '" + optElemName + "' not found.");
		return;
	}

	var msg = "Are you sure you want to cancel the '" + optElemName + "' element?<br/>";
	msg = msg + "<small class='text-danger'>This cannot be undone!</small>";
	bootbox.confirm({
		message: msg,
		callback: function(result){
			if ( result ) {
			    eset.delete("templates." + selectedTemplate + ".optical_elements." + optElemName);
			    toastr.success("The element '" + optElemName + "' has been removed.");
			    load_optical_element_list();
			} else {
				toastr.info("Nothing done.");
			}
		}
	});
}

dl_optical_element_spectra = function(optElemName) {
	// Download optical element spectra
	var selectedTemplate = eset.get("selected-template");

	if ( -1 == Object.keys(eset.get("templates." + selectedTemplate + ".optical_elements")).indexOf(optElemName) ) {
		toastr.error("Element '" + optElemName + "' not found.");
		return;
	}

	write_spectra(eset.get("templates." + selectedTemplate + ".optical_elements." + optElemName + ".spectra"),
		optElemName + ".tsv");
}

$(function() {
	$("#settings-optelem-tab").click(function(e) { load_optical_element_list(); });
	$("#settings-add-optelem-btn").click(function(e) { add_optical_element_dialog(); });
});
