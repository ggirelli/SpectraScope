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

read_spectra = function(spath) {
	// Read and parse (re-sample) a spectra file
	var data0 = fs.readFileSync(spath, 'utf-8').split("\n");
	var header0 = data0[0].split("\t");

	var data = {w : [], ri : []},
		wID = header0.indexOf("w"),
		riID = header0.indexOf("ri");
	for (var i = 1; i < data0.length; i++) {
		if ( "" == data0[i] ) continue;
		var cols = data0[i].split("\t");
		data.w.push(parseFloat(cols[wID]));
		data.ri.push(parseFloat(cols[riID]));
	}

	var data2 = {w : [], ri : []};
	for (var i = 250; i <= 900; i++) {
		data2.w.push(i);

		if ( i < Math.min.apply(null, data.w) ) {
			data2.ri.push(0);
			continue;
		}
		if ( i > Math.max.apply(null, data.w) ) {
			data2.ri.push(0);
			continue;
		}

		var new_ri = 0,
			w_index = data.w.indexOf(i);
		if ( -1 != w_index ) {
			new_ri = data.ri[w_index];
		} else {
			var min_low = data.w.map((v) => {
					if ( 0 < v - i ) {
						return Math.abs(v - i);
					} else {
						return Number.POSITIVE_INFINITY;
					}
				}),
				min_hig = data.w.map((v) => {
					if ( 0 > v - i ) {
						return Math.abs(v - i);
					} else {
						return Number.POSITIVE_INFINITY;
					}
				});
			var id_low = min_low.indexOf(Math.min.apply(null, min_low)),
				id_hig = min_hig.indexOf(Math.min.apply(null, min_hig))
			var w1 = data.w[id_low], w2 = data.w[id_hig],
				ri1 = data.ri[id_low], ri2 = data.ri[id_hig];
			new_ri = ri1 + (ri2-ri1)/(w2-w1)*(i-w1);

		}
		data2.ri.push(new_ri);
	}

	return data2;
}

write_spectra = function(data, fname) {
	// Write spectra from settings to file
	var filename = dialog.showSaveDialog(null, {
		title: "Export spectra",
		defaultPath: fname
	});

	var content = "w\tri\n";
	for (var i = 0; i < data.w.length; i++)
		content = content + data.w[i] + "\t" + data.ri[i] + "\n";

	try {
		fs.writeFileSync(filename, content, 'utf-8');
		toastr.success("Spectra exported to '" + filename + "'");
	} catch(e) {
		toastr.error('Failed to export the spectra to "', filename, '"!');
	}
}
