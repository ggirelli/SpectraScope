const { shell } = require('electron')

$(document).ready(function() {
    $("a.external").click(function(e) {
      shell.openExternal($(this).attr("href"));
      e.preventDefault();
    });
});
