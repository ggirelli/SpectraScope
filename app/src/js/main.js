const { shell } = require('electron')

$(document).ready(function() {
    $("a.external").click(function(e) {
      shell.openExternal($(this).attr("href"));
      e.preventDefault();
    });
});

check_spectra = function(path) {
	// Check if a spectra file is properly formatted
	return false;
}

read_spectra = function(path) {
	// Read and parse (re-sample) a spectra file
}