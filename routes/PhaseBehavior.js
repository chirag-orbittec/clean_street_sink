/**
 * Created by root on 4/25/17.
 */


function phase1(){
    console.log("i am in phase1");
}

function phase2(){
    console.log("i am in phase2");
}

switch(config_file.phaseBehavior){

case 'phase1':
	module.exports = {ExecutePhaseLogic : phase1};
	break;

case 'phase2' :
	module.exports = {ExecutePhaseLogic : phase2};
	break;
}
