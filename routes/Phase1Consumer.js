/**
 * Created by lazylad91 on 4/2/17.
 */
var async = require('async');
var kafka = require('kafka-node');
var asyncqueue = require('async.queue');
var path = require('path');
var piexif = require("piexifjs");
var fsPath = require('fs-path');
var path = require('path');
var ConsumerGroup = kafka.ConsumerGroup;
var producer = require('./producer');
var messageAPI = require('./message');
var PhaseBehavior = require('./PhaseBehavior');
var groupName = config_file.groupName;
var topicName = config_file.topicName;
var consumerName = config_file.consumerName;
var scriptName = config_file.scriptName;
var producerTopicName = config_file.producerTopicName;


var consumerOptions = {
    host: config_file.zookeeperServerURL,
    groupId: groupName,
    autoCommit : false,
    sessionTimeout: 15000,
    protocol: ['roundrobin'],
    fromOffset: 'latest' // equivalent of auto.offset.reset valid values are 'none', 'latest', 'earliest'
};


var consumerGroup1 = new ConsumerGroup(Object.assign({id: consumerName}, consumerOptions), topicName);
consumerGroup1.on('error', onError);
consumerGroup1.on('message', onMessage);


var q1 = asyncqueue(function(message, callback) {
    var spawn,
        exportScriptParams,
        tempImageFileName = path.join(__dirname, "..", "images", "temp", "tempPipeline" + new Date().getTime() + '.jpg'),
        imagebase64Data = message.message.value.toString().replace(/^data:([A-Za-z-+\/]+);base64,/, ""),
        child;

    fsPath.writeFile(tempImageFileName, imagebase64Data, 'base64', function (err) {
        if (err) {
            console.log('Error - 1');
        }
        else{
            spawn = require('child_process').spawnSync;
            // Put script name as first parameter and rest as arguement to script
            // in below Array
            exportScriptParams = [scriptName,tempImageFileName];
            child = spawn('sh', exportScriptParams, {cwd: path.join(__dirname, "..")});

            console.log('stdout here: \n' + child.stdout);
            console.log('stderr here: \n' + child.stderr);
            console.log('status here: \n' + child.status);

            if (child.status === 0) {
                callback();
                return;
            }
        }
    });
}, 1);

q1.drain = function(){
    consumerGroup1.resume();
    console.log("Phase 1 queue is empty for now!!!");
}

function onError (error) {
    console.error(error);
    console.error(error.stack);
}

function onMessage (message) {
    let message1 = message;
    q1.push({message: message1}, function(err) {
        console.log('Finished processing Phase 1 for message- ' + message1.offset);
            consumerGroup1.sendOffsetCommitRequest([{
                topic: message1.topic,
                partition: message1.partition, //default 0
                offset: message1.offset,
                metadata: 'm', //default 'm'
            }], function (err, data) {
                if(err){
                    console.log(err);
                }
		console.log(PhaseBehavior);
                PhaseBehavior.ExecutePhaseLogic();
                // Add all the modification here and then -- Pending
                var PhaseResult = require(path.join(__dirname, "..","temp")+'/result');
                addResultInImage(PhaseResult,message1.value,config_file.phase,function(finalResult){
                    //  Sending it to Phase2 Topic -- Insert this code in callback
                    var kafkamessage = [];

                    try {
                        kafkamessage.push(messageAPI.createMessage('keyed',"image", finalResult));
                        producer.sendMessage(producerTopicName,kafkamessage,0,0,function(result){
                            console.log('Message passed to -' +producerTopicName);
                        });

                    }
                    catch(error){
                        console.log(error);
                        console.log('Error - 1');
                        console.log(error);
                    }
                });
            });

    });
    consumerGroup1.pause();
}

/*
This function will take json result, image as base64,
insert json result in exif user comment, insert it into
image and return the image with latest exif.
return image with exif
 */
function addResultInImage(result,image,phase,callback){
    var exifObj = piexif.load(image);
    // Extracting user comment from exif
    var userComment = JSON.parse(exifObj["Exif"][piexif.ExifIFD.UserComment]);
    // Setting result in user comment
    userComment[phase+'Result'] = JSON.stringify(result);
    console.log('Phase4Result ' + JSON.stringify(userComment[phase+'Result']));
    // Updating UserComment in exif object
    exifObj["Exif"][piexif.ExifIFD.UserComment] = JSON.stringify(userComment);
    console.log(exifObj);
    //Removing exif object from current image
    var bufferedImageDataURI = piexif.remove(image);
    //Converting exifobject into stream
    var exifbytes = piexif.dump(exifObj);
    //added the new exif object
    bufferedImageDataURI  = piexif.insert(exifbytes, bufferedImageDataURI);
    console.log(piexif.load(bufferedImageDataURI));
    callback(bufferedImageDataURI);

}
