
load_fluorophore_list = function() {
	// Load list of fluorophores and their data to the settings table
	var fluoTab = $("table#settings-fluorophore > tbody")
	fluoTab.children().remove();

	var selectedTemplate = eset.get("selected-template");
	var fluos = eset.get("templates." + selectedTemplate + ".fluorophores");

	if ( 0 == Object.keys(fluos).length ) {
		fluoTab.append($("<tr><td class='text-center' colspan='6'><i>No fluorophores found.</i></td></tr>"))
	} else {
		for (var i = Object.keys(fluos).length - 1; i >= 0; i--) {
			var fluoName = Object.keys(fluos)[i]
			
			var fluoRow = $("<tr></tr>");
			fluoRow.append($("<th scope='row'>" + fluoName + "</th>"));
			fluoRow.append($("<td>" + fluos[fluoName].expeak + "</td>"));
			fluoRow.append($("<td>" + fluos[fluoName].empeak + "</td>"));
			fluoRow.append($("<td>" + fluos[fluoName].color + "</td>"));

			var fluoOpts = $("<td></td>");
			fluoOpts.append(
				$("<a href='#'></a>")
					.addClass("btn btn-danger btn-sm mr-2")
					.html("<i class='fas fa-minus' ></i>")
					.attr('data-name', fluoName)
					.click(function(e) {
						e.preventDefault();
						rm_fluorophore($(this).attr("data-name"));
					})
					.attr('data-toggle', 'tooltip')
					.attr('data-placement', 'top')
					.attr('title', 'Remove fluorophore')
					.tooltip()
				);
			fluoOpts.append(
				$("<a href='#'></a>")
					.addClass("btn btn-info btn-sm mr-2")
					.html("<i class='fas fa-file-export' ></i>")
					.attr('data-name', fluoName)
					.click(function(e) {
						e.preventDefault();
						dl_fluorophore_spectra($(this).attr("data-name"), "ex");
					})
					.attr('data-toggle', 'tooltip')
					.attr('data-placement', 'top')
					.attr('title', 'Download excitation spectra')
					.tooltip()
				);
			fluoOpts.append(
				$("<a href='#'></a>")
					.addClass("btn btn-info btn-sm mr-2")
					.html("<i class='fas fa-file-export' ></i>")
					.attr('data-name', fluoName)
					.click(function(e) {
						e.preventDefault();
						dl_fluorophore_spectra($(this).attr("data-name"), "em");
					})
					.attr('data-toggle', 'tooltip')
					.attr('data-placement', 'top')
					.attr('title', 'Download emission spectra')
					.tooltip()
				);
			fluoRow.append(fluoOpts);

			fluoTab.append(fluoRow);
		}
	}
}

add_fluorophore = function(data) {
	// Add a new fluorophore
	var selectedTemplate = eset.get("selected-template");
	var required_keys = ['name', 'expeak', 'empeak', 'color', 'expath', 'empath'];

	var fluo = {};
	var keys = [];
	for (var i = data.length - 1; i >= 0; i--) {
		var e = data[i];
		keys.push(e.name);
		fluo[e.name] = e.value;
	}

	for (var i = required_keys.length - 1; i >= 0; i--) {
		var k = required_keys[i];
		if ( -1 == keys.indexOf(k) ) {
			toastr.error("Missing required '" + k + "' data. No fluorophore added.");
			return false;
		}
	}

	fluo.expeak = parseFloat(fluo.expeak);
	fluo.empeak = parseFloat(fluo.empeak);
	fluo.emspectra = read_spectra(fluo.empath);
	fluo.exspectra = read_spectra(fluo.expath);
	fluo.microscopes = [];

	var fluoName = fluo.name
	delete fluo.name;
	eset.set("templates." + selectedTemplate + ".fluorophores." + fluoName, fluo);

	toastr.success("Fluorophore '" + fluo.name + "' added.");
	load_fluorophore_list();
}

add_fluorophore_dialog = function() {
	// Show dialog to add a new fluorophore
	var addFluoForm = $("<form class='needs-validation'>\
		<div class='mb-2'>\
			Fluorophore name:<input class='form-control' type='text' name='name' required />\
			<small class='invalid-feedback'>A fluorophore with this name is already present. Try a different one!</small>\
		</div>\
		Excitation peak (nm):<input class='form-control mb-2' type='number' min=250 max=900 name='expeak' placeholder='Wavelength of maximum excitation' required />\
		Emission peak (nm):<input class='form-control mb-2' type='number' min=250 max=900 name='empeak' placeholder='Wavelength of maximum emission' required />\
		<div class='mb-2'>\
			Color:<input class='form-control' type='text' name='color' value='auto' required />\
			<small class='invalid-feedback'>The provided color is not valid, try again!</small>\
			<small>Set to <code>auto</code> to let the script select a color automatically, otherwise provide an hexadec code (e.g., '#FFFFFF')).</small>\
		</div>\
		<div class='mb-2'>\
			Excitation spectrum file:<input class='form-control' type='text' name='expath' required />\
			<small class='invalid-feedback'>Something is wrong with the uploaded file. Check the console for more details.</small>\
		</div>\
		<div class='mb-2'>\
			Emission spectrum file:<input class='form-control' type='text' name='empath' required />\
			<small class='invalid-feedback'>Something is wrong with the uploaded file. Check the console for more details.</small>\
		</div>\
		<input type='submit' class='btn btn-primary float-right mt-2' />\
		<input type='button' class='btn btn-secondary float-right mr-2 mt-2' value='Cancel' />\
	</form>");

	addFluoForm.submit(function(e) {
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
			if ( eset.has("templates." + selectedTemplate + ".fluorophores." + newName) ) {
				nameElem.addClass("is-invalid");
			} else {
				nameElem.addClass("is-valid");
			}
		}

		var spectra_type = ["em", "ex"];
		for (var i = spectra_type.length - 1; i >= 0; i--) {
			var peakElem = $(this).find("input[name='" + spectra_type[i] + "']");
			var newPeak = peakElem.val();
			var re = /[0-9]+/g;
			if ( re.test(newPeak) ) {
				newPeak = parseInt(newPeak);
				if ( newPeak >= 250 & newPeak <= 900 ) {
					peakElem.addClass("is-valid");
				} else {
					peakElem.addClass("is-invalid");
				}
			} else {
				peakElem.addClass("is-invalid");
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

		for (var i = spectra_type.length - 1; i >= 0; i--) {
			var spectraElem = $(this).find("input[name='" + spectra_type[i] + "path']");
			var spectrapath = spectraElem.val();
			if ( check_spectra(spectrapath) ) {
				spectraElem.addClass("is-valid");
			} else {
				spectraElem.addClass("is-invalid");
			}
		}

		if ( 0 == $(this).find(".is-invalid").length ) {
			$(this).addClass("was-validated");

			add_fluorophore($(this).serializeArray());

			bootbox.hideAll();
		}
	});

	addFluoForm.find("input[type='button']").click(function(e) {
		// Hide bootbox dialog
		bootbox.hideAll();
		toastr.warning("Nothing done.");
		e.preventDefault();
	});

	addFluoForm.find("input[name='expath']").focus(function(e) {
		// Trigger open file dialog
		$(this).blur();
		var filepath = dialog.showOpenDialog(null, {
			title: "Import excitation spectra file",
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

	addFluoForm.find("input[name='empath']").focus(function(e) {
		// Trigger open file dialog
		$(this).blur();
		var filepath = dialog.showOpenDialog(null, {
			title: "Import emission spectra file",
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
		title: 'Add fluorophore',
		message: addFluoForm,
		closeButton: false
	});
}

rm_fluorophore = function(fluoName) {
	// Remove a fluorophore. Requires confirmation.
	var selectedTemplate = eset.get("selected-template");

	if ( -1 == Object.keys(eset.get("templates." + selectedTemplate + ".fluorophores")).indexOf(fluoName) ) {
		toastr.error("Fluorophore '" + fluoName + "' not found.");
		return;
	}

	var msg = "Are you sure you want to cancel the '" + fluoName + "' fluorophore?<br/>";
	msg = msg + "<small class='text-danger'>This cannot be undone!</small>";
	bootbox.confirm({
		message: msg,
		callback: function(result){
			if ( result ) {
			    eset.delete("templates." + selectedTemplate + ".fluorophores." + fluoName);
			    toastr.success("The fluorophore '" + fluoName + "' has been removed.");
			    load_fluorophore_list();
			} else {
				toastr.info("Nothing done.");
			}
		}
	});
}

dl_fluorophore_spectra = function(fluoName, spectraType) {
	// Download fluorophore spectra
	var selectedTemplate = eset.get("selected-template");

	if ( -1 == ["em", "ex"].indexOf(spectraType) ) return;

	if ( -1 == Object.keys(eset.get("templates." + selectedTemplate + ".fluorophores")).indexOf(fluoName) ) {
		toastr.error("Fluorophore '" + fluoName + "' not found.");
		return;
	}

	write_spectra(eset.get("templates." + selectedTemplate + ".fluorophores." + fluoName + "." + spectraType + "spectra"),
		fluoName + "_" + spectraType + ".tsv");
}

$(function() {
	$("#settings-fluo-tab").click(function(e) { load_fluorophore_list(); });
	$("#settings-add-fluo-btn").click(function(e) { add_fluorophore_dialog(); });
});
