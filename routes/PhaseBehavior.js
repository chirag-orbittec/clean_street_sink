/**
 * Created by root on 4/25/17.
 */
var fs = require('fs');
var path = require('path');
var piexif = require("piexifjs");
var extend = require('util')._extend;
var image_pipeline_model = require('./models/image_pipeline_model');

function phase1(exifObj,PhaseResult,image,phase,addResultInImage,sendMessage){
    console.log("==========================================================================================================");
    console.log("========================================== Phase 1 =======================================================");
    console.log("==========================================================================================================");
    var image1 =  'data:image/jpeg;base64,' + base64_encode(path.join(__dirname, '..', 'temp', 'deepmask_output.jpg'));
    addResultInImage(exifObj,PhaseResult,image1,phase,sendMessage,image1);
}

function phase2(exifObj,PhaseResult,image, phase,addResultInImage,sendMessage){
    // read the image file created by deepmask to send it further
    console.log("==========================================================================================================");
    console.log("========================================== Phase 2 =======================================================");
    console.log("==========================================================================================================");
    var image1 =  'data:image/jpeg;base64,' + base64_encode(path.join(__dirname, '..', 'temp', 'deepmask_output.jpg'));
    addResultInImage(exifObj,PhaseResult,image,phase,sendMessage,image1);
}

function phase3(exifObj,PhaseResult,image,phase,addResultInImage,sendMessage){
    console.log("==========================================================================================================");
    console.log("========================================== Phase 3 =======================================================");
    console.log("==========================================================================================================");
    addResultInImage(exifObj,PhaseResult,image, phase,sendMessage, image);
}

function phase4(exifObj,PhaseResult,image,phase,addResultInImage,sendMessage){
    var userCommentAddress,
        phaseResultAggrigatedString,
        phaseResultAggrigatedJSON,
        Phase3Result,
        boundingBoxesObject,
        finalResultObject,
        imageid,
        detectionResults = {};
    console.log("==========================================================================================================");
    console.log("========================================== Phase 4 =======================================================");
    console.log("==========================================================================================================");
    console.log('============================================EXIF==========================================================');
    console.log(exifObj);
    console.log('=========================================EXIF - END=======================================================');
    if (piexif && piexif.ExifIFD && piexif.ExifIFD.UserComment){
        console.log("1) User Comment Property Found");
        userCommentAddress = piexif.ExifIFD.UserComment;
        if(exifObj && exifObj["Exif"]) {
            console.log("2) EXIF Object Found");
            phaseResultAggrigatedString = exifObj["Exif"][userCommentAddress] || '{}';
            phaseResultAggrigatedJSON = JSON.parse(phaseResultAggrigatedString);
            if (phaseResultAggrigatedJSON) {
                imageid = phaseResultAggrigatedJSON.id;
                console.log("3) phaseResultAggrigatedJSON Object Found with IMAGEID ==> ", imageid);
                if(phaseResultAggrigatedJSON.Phase1Result) {
                    processPhase1Result(phaseResultAggrigatedJSON.Phase1Result);
                }
                if(phaseResultAggrigatedJSON.Phase2Result) {
                    boundingBoxesObject = processPhase2Result(phaseResultAggrigatedJSON.Phase2Result);
                }
                if(phaseResultAggrigatedJSON.Phase3Result && boundingBoxesObject) {
                    finalResultObject = processPhase3Result(phaseResultAggrigatedJSON.Phase3Result, boundingBoxesObject);
                }
            }
        }
    }

    console.log( "###############--finalResultObject--#############");
    console.log(finalResultObject);
    console.log( "###################################################");

    if(finalResultObject){
        console.log('4) Updating image_pipeline_model for Image id ==> ' + imageid);
        detectionResults = {detectionResults: JSON.stringify(finalResultObject)};
        image_pipeline_model.findOneAndUpdate({id: imageid},{$set:detectionResults},{new: true},function (err) {
            if(err) {
                console.log('xxxxxxxxx ERROR xxxxxxxx => image_pipeline_model.findOneAndUpdate',err);
            } else {
                console.log('5) Successfully Updated => image_pipeline_model.findOneAndUpdate');
            }
        });
    }
}

function processPhase1Result(phaseResultString) {
    console.log( "##############################################");
    console.log( "#### Currently Processing ===> Phase 1 Result");
    console.log( "###############################################");
    console.log("#####PROCESSING NOT REQUIRED FOR THIS PHASE#####");
    console.log( "################################################");
}

function processPhase2Result(phaseResultString) {
    var phaseResultObj,
        boundingBoxesObject = {};

    console.log( "##############################################");
    console.log( "#### Currently Processing ===> Phase 2 Result");
    console.log( "###############################################");
    if (phaseResultString) {
        phaseResultObj = JSON.parse(phaseResultString);
        if (phaseResultObj && phaseResultObj.length > 0) {
            for(var i = 0; i < phaseResultObj.length; i++) {
                if (phaseResultObj[i]) {
                    for (var bb in phaseResultObj[i]) {
                        console.log("#### Found Bounding Box ===> ", bb);
                        boundingBoxesObject[bb] = extend({}, phaseResultObj[i][bb]);
                    }
                }
            }
        }
    }
    console.log( "################################################");

    return JSON.parse(JSON.stringify(boundingBoxesObject));
}

function processPhase3Result(phaseResultString, boundingBoxesObject) {
    var phaseResultObj,
        finalCombinedObject = {},
        tempResObj,
        classKeys;

    console.log( "##############################################");
    console.log( "#### Currently Processing ===> Phase 3 Result");
    console.log( "###############################################");
    if (phaseResultString) {
        phaseResultObj = JSON.parse(phaseResultString);
        if (phaseResultObj && boundingBoxesObject) {
            for (var bb in boundingBoxesObject) {
                finalCombinedObject[bb] = {};
                finalCombinedObject[bb].bb = extend({}, boundingBoxesObject[bb]);
                finalCombinedObject[bb].classes = extend({}, phaseResultObj[bb]);
                tempResObj = phaseResultObj[bb];
                if(tempResObj && tempResObj[0]){
                    classKeys = Object.keys(tempResObj[0]);
                    if (classKeys && classKeys[0]){
                        finalCombinedObject[bb].trueClass = classKeys[0];
                        finalCombinedObject[bb].trueClassProb = tempResObj[0][classKeys[0]];
                    }
                }
            }
        }
    }
    return JSON.parse(JSON.stringify(finalCombinedObject));
}

switch(config_file.phaseBehavior){

    case 'phase1':
        module.exports = {ExecutePhaseLogic : phase1};
        break;

    case 'phase2' :
        module.exports = {ExecutePhaseLogic : phase2};
        break;

    case 'phase3' :
        module.exports = {ExecutePhaseLogic : phase3};
        break;

    case 'phase4' :
        module.exports = {ExecutePhaseLogic : phase4};
        break;
}


// Reading image and converting it base64 encoding.
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}
