var logger = require("../../config/logger"); //removed till testing completion
var Promise = require('bluebird');
var invokeService = require('../../fabcar/javascript/invoke.js')
var queryService = require('../../fabcar/javascript/query.js')
var log4js = require('log4js');
var logger = log4js.getLogger('DrivingLicence service');
var DrivingLicenceService = {
    addDrivingLicence: addDrivingLicence,
    getAllDrivingLicences: getAllDrivingLicences,
    getDrivingLicence: getDrivingLicence
};

const ORG_NAME='government';
const ORG_DOMAIN='government.com';



function addDrivingLicence(drivingLicenceDetails) {
    console.log("i am inside drivingLicence sigup service", drivingLicenceDetails);

    return new Promise(function (resolve, reject) {
        try {

            var functionName = "addDL";
            var inputdata = {
                "DLNumber" : drivingLicenceDetails.DLNumber,
                "fullName" : drivingLicenceDetails.fullName,
                "validity" : drivingLicenceDetails.validity,
                "dob" : drivingLicenceDetails.dob,
                "image1" : drivingLicenceDetails.image1,
                "image2" : drivingLicenceDetails.image2

            }
            console.log("=================json data =========================");
            // console.log(inputdata.DLNumber);
            console.log("=================json data =========================");
            invokeService.invoke(ORG_NAME, ORG_DOMAIN, functionName, inputdata).then(async function (chaincodeOutput) {
                console.log("chaincode output", chaincodeOutput);
                if(chaincodeOutput.status=="ERROR")
                reject(new Error("Failed to Add Driving Licence"));
                // logger.info("Stored DrivingLicence in Ledger", invokeResult);
                resolve("DrivingLicence Added Successfully");
            });

        } catch (err) {
            console.log("Error", err);
            reject("Error", err);
        }
    });
}


function getAllDrivingLicences() {

    return new Promise(async function (resolve, reject) {
        try {
          var fcn = "getAllDLs";
            let input = {}
            let queryResult = await queryService.query(ORG_NAME, ORG_DOMAIN, fcn, input);
            resolve(queryResult);
        } catch (err) {
            logger.error("Could not get Driving Licence details from blockchain", err.stack);
            reject("Failed to get data from blockchain");
        };
    });
}

function getDrivingLicence(DLNumber) {

    return new Promise(async function (resolve, reject) {
        try {
          var fcn = "getDL";
            let input = {
                "DLNumber": DLNumber
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


module.exports = DrivingLicenceService;
