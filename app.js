// Test Comment by Teja Surisetty

var configObj = require("./config/config");
configObj.setEnvironment(process.argv[2]);
var logger = require("./config/logger");
// var Mongoose = require("./config/mongoose");
// var mongo = new Mongoose();
var Apis = require("./config/api-config");

var apis = new Apis();


// require('./config/hfcConfig');
// var networkConfig = require('./artifacts/networkConfig/networkConfig.json');
var host = "20.198.243.63";
var port = 4000;
var fs=require('fs');
// var key = fs.readFileSync('./app/certificate/certificate/server.key');
// var cert = fs.readFileSync('./app/certificate/certificate/ssl_certificate.cer');
// var ca = fs.readFileSync('./app/certificate/certificate/IntermediateCA.cer');
// var options = {
//   key: key,
//   cert: cert,
//   ca: ca
// }

var https = require('https');

function start() {
   // mongo.connect();
    apis.app.listen(port, ()=>{
      // logger.info('****************** SERVER STARTED ************************');
      logger.info('****************** SERVER STARTED ************************');
    logger.info('***************  http://%s:%s  ******************',host,port);
    })
}

start();