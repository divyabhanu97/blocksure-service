var config = require("./config");
var properties = config.properties();
var mongoose = require("mongoose");
var logger = require("./logger");

function connect() {
    // disabling username pass auth as of now
    //uncomment next line for enabling auth and comment second line
    // url = 'mongodb://' + properties.db.username + ':' + properties.db.password + '@' + properties.db.host.trim() + ':' + properties.db.port + '/' + properties.db.dbName;
    // url = 'mongodb://' + properties.db.host.trim() + ':' + properties.db.port + '/' + properties.db.dbName;
    // url = 'mongodb://root:Welcome123@opcoe-hyperledger.southeastasia.cloudapp.azure.com:51004/xyz';

    var url = 'mongodb://' + properties.db.host.trim() + ':' + properties.db.port + '/' + properties.db.dbName;

    var opt = {
        auth: {
            authdb: 'admin'
        }
    };

    logger.info("Mongo db url : " + url);
    mongoose.connect(url, opt);

    mongoose.connection.on('connected', function () {
        logger.info("Connection to Mongo established successfully..");
    });

    mongoose.connection.on('error', function (err) {
        logger.error('Connection to mongo failed ' + err);
    });
}

var Mongoose = function () {
    this.connect = connect;
}

module.exports = Mongoose;
