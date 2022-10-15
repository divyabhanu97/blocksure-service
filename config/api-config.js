var express = require("express");
var properties = require('./config').properties();
var path = require('path');
var bodyParser = require("body-parser");
var organizationController = require("../app/controllers/organization.controller");
var merchantController = require("../app/controllers/merchantController");
var aadharCardController=require("../app/controllers/aadharCardController");
var panCardController=require("../app/controllers/panCardController");
var DLController=require("../app/controllers/DLController");

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
var morganLogger = require("morgan");
var logger = require("./logger");
var fs = require('fs');
var routes = require('../app/routes/routes');
var cors = require("cors");

var app = express();
app.use(morganLogger('dev'));

var router = express.Router();
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', "extended": false }));
app.use('/', cors())
app.use('/', router);


var controllers = {
    organizationController: organizationController,
    merchantController: merchantController,
    aadharCardController: aadharCardController,
    panCardController: panCardController,
    DLController: DLController

};


app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//app.use(keycloak.middleware());
//var routerwithkeycloak = express.Router();
app.use('/', router);

routes.setUp(router, controllers);

app.use(function (req, res) {
    res.status(404).json({ url: req.originalUrl + ' not found' })
});

//error handler if something breaks
app.use(function (err, req, res, next) {
    logger.error(err.stack);
    res.status(500).send('Something broke!');
});


if (!fs.existsSync(properties.logs.location)) {
    // Create the directory if it does not exist
    fs.mkdirSync(properties.logs.location);
}

var ApiConfig = function () {
    this.app = app;
}

module.exports = ApiConfig;