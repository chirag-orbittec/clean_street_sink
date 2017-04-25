/**
 * Created by root on 4/25/17.
 */

var config_file = require('./config/configuration');

function phase1(){
    console.log("i am in phase1");
}

function phase2(){
    console.log("i am in phase2");
}

exports.phaseBehavior =  config_file.phaseBehavior;