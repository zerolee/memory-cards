'use strict'
// let etymafile = new File();
function showFile(input) {
    let file = input.files[0];

    let reader = new FileReader();

    reader.readAsText(file);
    let etymas;
    reader.onload = function () {
        etymas = JSON.parse(reader.result);
	alert(etymas[0].name);
    }
}

