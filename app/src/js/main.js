const { shell } = require('electron')

$(document).ready(function() {
    $("a.external").click(function(e) {
      shell.openExternal($(this).attr("href"));
      e.preventDefault();
    });
});

check_spectra = function(path) {
	// Check if a spectra file is properly formatted
	var data = fs.readFileSync(path, 'utf-8').split("\n");
	for (var i = 0; i < data.length; i++) {
		data[i] = data[i].replace("\r", "");
		data[i] = data[i].replace("\n", "");
		if (i == data.length-1 & 0 == data[i].length ) break;
		if ( -1 == data[i].indexOf("\t") ) {
			console.error("Missing column separator '\t' in row #" + (i+1) + ".");
			return false;
		}
		var cols = data[i].split("\t");
		var ncols = data[i].split("\t").length;
		if ( 2 != ncols ) {
			console.error("Expected 2 columns, " + ncols + " found in row #" + (i+1) + ".");
			return false;
		}
		if ( i > 0 ) {
			if ( Number.isNaN(parseFloat(cols[0])) ) {
				console.error("Expected float, found '" + cols[0] + "' in column #1 of row #" + (i+1) + ".");
				return false;
			}
			if ( Number.isNaN(parseFloat(cols[1])) ) {
				console.error("Expected float, found '" + cols[1] + "' in column #2 of row #" + (i+1) + ".");
				return false;
			}
		}
	}
	if ( data[0] != "w\tri" ) {
		console.error("Missing header line 'w\tri'.");
		return false;
	}
	return true;
}

read_spectra = function(path) {
	// Read and parse (re-sample) a spectra file
	return path;
}