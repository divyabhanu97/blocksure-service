var logger = require("../../config/logger"); //removed till testing completion
var Promise = require('bluebird');
var invokeService = require('../../fabcar/javascript/invoke.js')
var queryService = require('../../fabcar/javascript/query.js')
var log4js = require('log4js');
var logger = log4js.getLogger('Merchant service');

var MerchantService = {
    addMerchant: addMerchant,
    updateMerchant: updateMerchant,
    getAllMerchants: getAllMerchants,
    getMerchant: getMerchant,
    getSingleMerchantKyc: getSingleMerchantKyc,
    deleteMerchant: deleteMerchant
};

const ORG_NAME='merchant';
const ORG_DOMAIN='merchant.com';



function addMerchant(input) {
    console.log("inside add merchant service", input);

    return new Promise(function (resolve, reject) {
        try {

            var functionName = "addMerchant";
            var inputdata = {
                "bankId":input.bankId,
                "consentShared":input.consentShared,
                "merchantDetails" : input.merchantDetails,
                "verificationStatus" : input.verificationStatus
                }
            console.log("=================json data =========================");
            console.log(inputdata);

            invokeService.invoke(ORG_NAME, ORG_DOMAIN, functionName, inputdata).then(async function (chaincodeOutput) {
                console.log("chaincode output", chaincodeOutput);
                if(chaincodeOutput.status=="ERROR")
                reject(new Error("Failed to Add Merchant"));
                resolve("Merchant Added Successfully");
            });

        } catch (err) {
            console.log("Error", err);
            reject("Error", err);
        }
    });
}

function updateMerchant(panNumber,input) {
    console.log("inside update merchant service", input);

    return new Promise(function (resolve, reject) {
        try {

            var functionName = "updateMerchant";
            var inputdata = {
                "bankId":input.bankId,
                "consentShared":input.consentShared,
                "merchantDetails" : input.merchantDetails,
                "verificationStatus" : input.verificationStatus
                }
            console.log("=================json data =========================");
            console.log(inputdata);

            invokeService.invoke(ORG_NAME, ORG_DOMAIN, functionName, inputdata).then(async function (chaincodeOutput) {
                console.log("chaincode output", chaincodeOutput);
                if(chaincodeOutput.status=="ERROR")
                reject(new Error("Failed to Update Merchant"));
                resolve("Merchant Updated Successfully");
            });

        } catch (err) {
            console.log("Error", err);
            reject("Error", err);
        }
    });
}


function getAllMerchants() {

    return new Promise(async function (resolve, reject) {
        try {
          var fcn = "getAllMerchants";
            let input = {}
            let queryResult = await queryService.query(ORG_NAME, ORG_DOMAIN, fcn, input);
            resolve(queryResult);
        } catch (err) {
            logger.error("Could not get Merchant details from blockchain", err.stack);
            reject("Failed to get data from blockchain");
        };
    });
}

//Get All Merchant KYC based on PanNumber
function getMerchant(panNumber) {

    return new Promise(async function (resolve, reject) {
        try {
          var fcn = "getMerchant";
            let input = {
                "panNumber": panNumber
            }
            console.log("Input",input);
            let queryResult = await queryService.query(ORG_NAME, ORG_DOMAIN, fcn, input);
            if(queryResult.status=="ERROR")
            resolve([]);
            //reject(new Error("Merchant Not Found"));
            resolve(queryResult.result);
        } catch (err) {
            logger.error("Could not get Merchant details from blockchain", err.stack);
            reject("Failed to get data from blockchain");
        };
    });
}
function getSingleMerchantKyc(panNumber,bankId) {

    return new Promise(async function (resolve, reject) {
        try {
          var fcn = "getSingleMerchantKyc";
            let input = {
                "panNumber": panNumber,
                "bankId": bankId
            }
            console.log("Input",input);
            let queryResult = await queryService.query(ORG_NAME, ORG_DOMAIN, fcn, input);
            if(queryResult.status=="ERROR")
            reject(new Error("Merchant Not Found"));
            resolve(queryResult);
        } catch (err) {
            logger.error("Could not get Merchant details from blockchain", err.stack);
            reject("Failed to get data from blockchain");
        };
    });
}



function deleteMerchant(panNumber,bankId) {

    return new Promise(async function (resolve, reject) {
        try {
          var fcn = "deleteMerchant";
            let input = {
                "panNumber": panNumber,
                "bankId": bankId
            }
            console.log("Input",input);
            let invokeResult = await invokeService.invoke(ORG_NAME, ORG_DOMAIN, fcn, input);
            if(invokeResult.status=="ERROR")
            reject(new Error("Merchant Not Found"));
            resolve("Merchant Deleted");
        } catch (err) {
            logger.error("Could not delete Merchant details from blockchain", err.stack);
            reject("Failed to delete data from blockchain");
        };
    });
}
module.exports = MerchantService;
