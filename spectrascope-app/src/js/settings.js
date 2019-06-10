$(function() {

	// Settings template select
	$("select#settings-template").change(function(e) {
		eset.set("selected-template", $(this).val())
		e.preventDefault();
	});
	load_template_list();

	$("#settings-add-template-btn").click(function(e) { add_settings_template(); });
	$("#settings-rm-template-btn").click(function(e) { rm_settings_template(); });
	$("#settings-cp-template-btn").click(function(e) { copy_settings_template(); });
	$("#settings-dl-template-btn").click(function(e) { download_settings_template(); });
	$("#settings-ul-template-btn").click(function(e) { upload_settings_template(); });
	$("#settings-reset-template-btn").click(function(e) { reset_settings_template(); });
});