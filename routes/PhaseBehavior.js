/**
 * Created by root on 4/25/17.
 */


var fs = require('fs');

function phase1(){
    console.log("i am in phase1");
}

function phase2(){
    // read the image file created by deepmask to send it further
    var base64bufferedImageDataURIstr = base64_encode('../temp/deepmask_output.jpg');
    console.log(bufferedImageDataURI);
    return bufferedImageDataURI;
}

switch(config_file.phaseBehavior){

case 'phase1':
	module.exports = {ExecutePhaseLogic : phase1};
	break;

case 'phase2' :
	module.exports = {ExecutePhaseLogic : phase2};
	break;
}


// Reading image and converting it base64 encoding.
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}