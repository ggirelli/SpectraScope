const { dialog } = require('electron').remote;
const fs = require('fs');
const path = require('path');

const toastr = require("toastr");
toastr.options.timeOut = 3000;
toastr.options.extendedTimeOut = 3000;
toastr.options.progressBar = true;

var empty_settings = {
	sources : {},
	filters: {
		em : {},
		ex : {}
	},
	mirrors : {},
	fluorophores : {},
	microscopes : []
};
var default_settings = {
	sources : {},
	filters: {
		em : {},
		ex : {}
	},
	mirrors : {},
	fluorophores : {},
	microscopes : ["BiCroScope 1", "BiCroScope 2"]
};

mk_default_settings = function() {
	// Build factory default settings template
	eset.set('templates.default', default_settings);
	eset.set("selected-template", "default");
}

reset_settings = function() {
	// Reset setting templates to default
	eset.deleteAll();
	mk_default_settings();
}

load_template_list = function() {
	// Load template list
	var selectedTemplate = "default";
	if ( eset.has("selected-template") ) {
		var selectedTemplate = eset.get("selected-template");
		if ( -1 == Object.keys(eset.getAll()['templates']).indexOf(selectedTemplate) ) {
			selectedTemplate = "default";
		}
	}
	$("select#settings-template").children().remove();
	$.each(eset.getAll()['templates'], function(k, v) {
		var optElement = $("<option></option>").text(k);
		if ( k == selectedTemplate ) {
			optElement.attr("selected", true);
		}
		$("select#settings-template").append(optElement);
	})
}

add_settings_template = function() {
	// Add empty settings template
	bootbox.prompt({
		title: "How should we call the new template?",
		callback: function(result) {
			if ( result == null || 0 == result.length ) {
				toastr.error("No template added.");
			} else if ( eset.has("templates." + result) ) {
				toastr.error("The provided name is already in use. Try again.");
			} else {
				eset.set("templates." + result, empty_settings);
				load_template_list();
				toastr.success("Added template '" + result + "'!");
			}
		}
	});
}

rm_settings_template = function() {
	// Remove a setting template. Requires confirmation.
	var selectedTemplate = eset.get("selected-template");

	if ( "default" == selectedTemplate ) {
		toastr.error("The default template cannot be removed.");
		return;
	}

	var msg = "Are you sure you want to cancel the '" + selectedTemplate + "' template?<br/>";
	msg = msg + "<small class='text-danger'>This cannot be undone!</small>";
	bootbox.confirm({
		message: msg,
		callback: function(result){
			if ( result ) {
			    eset.delete("templates." + selectedTemplate);
			    eset.set("selected-template", "default");
			    load_template_list();
			    toastr.success("The template '" + selectedTemplate + "' has been removed.");
			} else {
				toastr.info("Nothing done.");
			}
		}
	});
}

copy_settings_template = function() {
	// Copy a setting template.
	var selectedTemplate = eset.get("selected-template");
	var msg = "How should we call the new template?<br/>"
	msg = msg + "<small>This will be a copy of '" + selectedTemplate + "'.";
	bootbox.prompt({
		title: msg,
		callback: function(result) {
			if ( result == null || 0 == result.length ) {
				toastr.error("No template added.");
			} else if ( eset.has("templates." + result) ) {
				toastr.error("The provided name is already in use. Try again.");
			} else {
				eset.set("templates." + result, eset.get("templates." + selectedTemplate));
				load_template_list();
				toastr.success("Added template '" + result + "' as a copy of '" + selectedTemplate + "'!");
			}
		}
	});
}

download_settings_template = function() {
	// Download a setting template.
	var selectedTemplate = eset.get("selected-template");
	var filename = dialog.showSaveDialog(null, {
		title: "Export settings template",
		defaultPath: selectedTemplate + ".json"
	});

	try {
		var content = JSON.stringify(eset.get("templates." + selectedTemplate));
		fs.writeFileSync(filename, content, 'utf-8');
		toastr.success("'" + selectedTemplate + "' exported to '" + filename + "'");
	} catch(e) {
		toastr.error('Failed to save the file !');
	}
}

check_settings_template = function(data) {
	// Check a setting template for standard conformity
	if ( ! "sources" in data ) return false;
	if ( data.sources.constructor != {}.constructor ) return false;
	if ( ! "filters" in data ) return false;
	if ( ! "em" in data.filters ) return false;
	if ( data.filters.em.constructor != {}.constructor ) return false;
	if ( ! "ex" in data.filters ) return false;
	if ( data.filters.ex.constructor != {}.constructor ) return false;
	if ( ! "mirrors" in data ) return false;
	if ( data.mirrors.constructor != {}.constructor ) return false;
	if ( ! "fluorophores" in data ) return false;
	if ( data.fluorophores.constructor != {}.constructor ) return false;
	if ( ! "microscopes" in data ) return false;
	if ( data.microscopes.constructor != [].constructor ) return false;
	return true;
}

upload_settings_template = function() {
	// Upload a setting template.
	var selectedTemplate = eset.get("selected-template");
	var filename = dialog.showOpenDialog(null, {
		title: "Import settings template",
		properties: ["openFile", "showHiddenFiles"],
		filters: [
			{name: "SpectraScope Templates", extensions: ['json']}
		]
	})[0];
	var templateName = path.basename(filename, ".json");

	fs.readFile(filename, 'utf-8', (error, data) => {
		if ( error ) {
			toastr.error("Could not open the file. More info in the console.");
			console.log(error);
		} else if ( eset.has("templates." + templateName) ) {
			toastr.error("Template '" + templateName + "' already exist. Import failed.");
		} else {
			data = JSON.parse(data)


			eset.set("templates." + templateName, data);
			load_template_list();
			toastr.success("Template '" + templateName + "' imported.");
		}
	});
}

reset_settings_template = function() {
	// Remove all setting templates and regenerate default one. Requires confirmation.
	var selectedTemplate = eset.get("selected-template");
	var msg = "Beware! This will remove all templates and regenerate the factory default template only. Are you sure you want to continue?<br/>";
	msg = msg + "<small class='text-danger'>This cannot be undone!</small>";
	bootbox.confirm({
		message: msg,
		callback: function(result){
			if ( result ) {
			    reset_settings();
			    load_template_list();
			    toastr.success("Setting templates reset.");
			} else {
				toastr.info("Nothing done.");
			}
		}
	});
}