
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
