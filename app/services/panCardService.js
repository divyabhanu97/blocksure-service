var logger = require("../../config/logger"); //removed till testing completion
var Promise = require('bluebird');
var invokeService = require('../../fabcar/javascript/invoke.js')
var queryService = require('../../fabcar/javascript/query.js')
var log4js = require('log4js');
var logger = log4js.getLogger('PanCard service');
var PanCardService = {
    addPanCard: addPanCard,
    getAllPanCards: getAllPanCards,
    getPanCard: getPanCard
};

const ORG_NAME='government';
const ORG_DOMAIN='government.com';



function addPanCard(panCardDetails) {
    console.log("i am inside panCard sigup service", panCardDetails);

    return new Promise(function (resolve, reject) {
        try {

            var functionName = "addPanCard";
            var inputdata = {
                "panNumber" : panCardDetails.panNumber,
                "fullName" : panCardDetails.fullName,
                "gender" : panCardDetails.gender,
                "address" : panCardDetails.address,
                "dob" : panCardDetails.dob,
                "image" : panCardDetails.image
            }
            console.log("=================json data =========================");
            console.log(inputdata);
            console.log("=================json data =========================");
            invokeService.invoke(ORG_NAME, ORG_DOMAIN, functionName, inputdata).then(async function (chaincodeOutput) {
                console.log("chaincode output", chaincodeOutput);
                if(chaincodeOutput.status=="ERROR")
                reject(new Error("Failed to Add Pan Card"));
                // logger.info("Stored PanCard in Ledger", invokeResult);
                resolve("PanCard Added Successfully");
            });

        } catch (err) {
            console.log("Error", err);
            reject("Error", err);
        }
    });
}


function getAllPanCards() {

    return new Promise(async function (resolve, reject) {
        try {
          var fcn = "getAllPanCards";
            let input = {}
            let queryResult = await queryService.query(ORG_NAME, ORG_DOMAIN, fcn, input);
            resolve(queryResult);
        } catch (err) {
            logger.error("Could not get Pan Card details from blockchain", err.stack);
            reject("Failed to get data from blockchain");
        };
    });
}

function getPanCard(panNumber) {

    return new Promise(async function (resolve, reject) {
        try {
          var fcn = "getPanCard";
            let input = {
                "panNumber": panNumber
            }
            let queryResult = await queryService.query(ORG_NAME, ORG_DOMAIN, fcn, input);
            if(queryResult.status=="ERROR")
            reject(new Error("PAN Card Validation Failed"));

            resolve(queryResult);
        } catch (err) {
            logger.error("Could not get Pan Card details from blockchain", err.stack);
            reject("Failed to get data from blockchain");
        };
    });
}


module.exports = PanCardService;
