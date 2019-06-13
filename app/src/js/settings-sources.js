
add_source = function() {
	var addSourceForm = $("<form class='needs-validation'>\
		<div class='mb-2'>\
			Source name:<input class='form-control' type='text' name='name' required />\
			<small class='invalid-feedback'>A source with this name is already present. Try a different one!</small>\
		</div>\
		Source spectrum peak (nm):<input class='form-control mb-2' type='number' min=250 max=900 name='peak' placeholder='Wavelength of maximum source intensity' required />\
		<div class='mb-2'>\
			Color:<input class='form-control' type='text' name='color' value='auto' required />\
			<small class='invalid-feedback'>The provided color is not valid, try again!</small>\
			<small>Set to <code>auto</code> to let the script select a color automatically, otherwise provide an hexadec code (e.g., '#FFFFFF')).</small>\
		</div>\
		Details:<input class='form-control mb-2' type='text' name='details' />\
		<div class='mb-2'>\
			Spectrum file:<input class='form-control' type='text' name='filepath' required />\
			<small class='invalid-feedback'>Something is wrong with the uploaded file. Check the console for more details.</small>\
		</div>\
		<input type='submit' class='btn btn-primary float-right mt-2' />\
		<input type='button' class='btn btn-secondary float-right mr-2 mt-2' value='Cancel' />\
	</form>");

	addSourceForm.submit(function(e) {
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
			if ( eset.has("templates." + selectedTemplate + ".sources." + newName) ) {
				nameElem.addClass("is-invalid");
			} else {
				nameElem.addClass("is-valid");
			}
		}

		var peakElem = $(this).find("input[name='peak']");
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

		var spectraElem = $(this).find("input[name='filepath']");
		var spectrapath = spectraElem.val();
		if ( check_spectra(spectrapath) ) {
			spectraElem.addClass("is-valid");
		} else {
			spectraElem.addClass("is-invalid");
		}

		//$(this).addClass("was-validated");

		//bootbox.hideAll();
	});

	addSourceForm.find("input[type='button']").click(function(e) {
		// Hide bootbox dialog
		bootbox.hideAll();
		toastr.warning("Nothing done.");
		e.preventDefault();
	});

	addSourceForm.find("input[name='filepath']").focus(function(e) {
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
		title: 'Add light source',
		message: addSourceForm,
		closeButton: false
	});
}

$(function() {
	$("#settings-add-source-btn").click(function(e) { add_source(); });
});
