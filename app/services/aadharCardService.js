var logger = require("../../config/logger"); //removed till testing completion
var Promise = require('bluebird');
var invokeService = require('../../fabcar/javascript/invoke.js')
var queryService = require('../../fabcar/javascript/query.js')
var log4js = require('log4js');
var logger = log4js.getLogger('AadharCard service');
var AadharCardService = {
    addAadharCard: addAadharCard,
    getAllAadharCards: getAllAadharCards,
    getAadharCard: getAadharCard
};

const ORG_NAME='government';
const ORG_DOMAIN='government.com';



function addAadharCard(aadharCardDetails) {
    console.log("i am inside aadharCard sigup service", aadharCardDetails);

    return new Promise(function (resolve, reject) {
        try {

            var functionName = "addAadharCard";
            var inputdata = {
                "aadharNumber" : aadharCardDetails.aadharNumber,
                "fullName" : aadharCardDetails.fullName,
                "gender" : aadharCardDetails.gender,
                "address" : aadharCardDetails.address,
                "dob" : aadharCardDetails.dob,
                "image" : aadharCardDetails.image
            }
            console.log("=================json data =========================");
            console.log(inputdata);
            console.log("=================json data =========================");
            invokeService.invoke(ORG_NAME, ORG_DOMAIN, functionName, inputdata).then(async function (chaincodeOutput) {
                console.log("chaincode output", chaincodeOutput);
                if(chaincodeOutput.status=="ERROR")
                reject(new Error("Failed to Add Aadhar Card"));
                // logger.info("Stored AadharCard in Ledger", invokeResult);
                resolve("AadharCard Added Successfully");
            });

        } catch (err) {
            console.log("Error", err);
            reject("Error", err);
        }
    });
}


function getAllAadharCards() {

    return new Promise(async function (resolve, reject) {
        try {
          var fcn = "getAllAadharCards";
            let input = {}
            let queryResult = await queryService.query(ORG_NAME, ORG_DOMAIN, fcn, input);
            resolve(queryResult);
        } catch (err) {
            logger.error("Could not get Aadhar Card details from blockchain", err.stack);
            reject("Failed to get data from blockchain");
        };
    });
}

function getAadharCard(aadharNumber,otp) {

    return new Promise(async function (resolve, reject) {
        try {
          var fcn = "getAadharCard";
            let input = {
                "aadharNumber": aadharNumber
            }
            console.log("Input",input);
            let queryResult = await queryService.query(ORG_NAME, ORG_DOMAIN, fcn, input);
            if(queryResult.status=="ERROR")
            reject(new Error("Aadhar Card Validation Failed"));
            resolve(queryResult);
        } catch (err) {
            logger.error("Could not get Aadhar Card details from blockchain", err.stack);
            reject("Failed to get data from blockchain");
        };
    });
}


module.exports = AadharCardService;
