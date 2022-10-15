// var express = require("express");
// var configObj = require("./config/config");
// configObj.setEnvironment(process.argv[2]);
// var logger = require("./config/logger");
// var Mongoose = require("./config/mongoose");
// var mongo = new Mongoose();
// var Apis = require("./config/api-config");
// var apis = new Apis();

// var shell = require('shelljs');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// var app = express();
// var port = 5000;

// var https = require('https');
// function start() {
//     mongo.connect();
//     apis.app.listen(port, ()=>{
//       // logger.info('****************** SERVER STARTED ************************');
//       logger.info('****************** SERVER STARTED ************************');
//     logger.info('***************  http://%s:%s  ******************', host, port);
//     })
// }
// app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// var scriptDir = "./addOrg3.sh ";

// app.post("/test", (req, res) => {
//     console.log(req.body);
//     var orgName= req.body.orgName;
//     var orgDomain= req.body.orgDomain;
//     var port= req.body.port;
//     console.log(scriptDir+ orgName + " " + orgDomain + " " + port );
//     shell.exec(scriptDir+ orgName + " " + orgDomain + " " + port );

//     return "started";
//    });

// start();
// app.listen(port , () => console.log(`Hello world app listening on port ${port}!`));