var fs = require('fs');
var logger = require('./logger');
var environment = 'PROD';


var properties = {
    LOCAL: {
        app: {
            port: 51002
        },
        db: {
            username: "****",
            password: "********",
            host: "localhost",
            port: 51010,
            dbName: 'vkycBlockchainTemp'
        },
        logs: {
            location: 'logs'
        },
        swagger: {
            protocol: 'http',
            host: 'localhost',
            port: 51002
        },
        mockServer: {
            host: "localhost",
            port: "9100"
        }
    },
    //Running services on VM and connecting to DB on same VM
    PROD: {
        app: {
            port: 51003
        },
        db: {
            host: '13.71.6.76',
            port: 51010,
            username: process.env.MONGO_USER,
            password: process.env.MONGO_PASS,
            dbName: 'vkycBlockchainTemp'
        },
        logs: {
            location: 'logs'
        },
        swagger: {
            protocol: 'http',
            host: 'localhost',
            port: 51003
        },
    }
};

var getProperties = function () {
    return properties[environment];
}

var setEnvironment = function (newEnvironment) {
    if (properties[newEnvironment]) {
        environment = newEnvironment;
    }
    logger.info("Setting up properties for ", environment, " environment");
    //changeSwaggerConfigurations();
};
var getEnvironment = function () {
    return environment
};

module.exports = {
    properties: getProperties,
    setEnvironment: setEnvironment,
    getEnvironment: getEnvironment
};
