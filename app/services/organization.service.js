var logger = require("../../config/logger"); //removed till testing completion
var Promise = require('bluebird');
var adminService = require('../../fabcar/javascript/enrollAdmin.js')
var registerService = require('../../fabcar/javascript/registerUser.js')
var invokeService = require('../../fabcar/javascript/invoke.js')
var getadminService = require('../../fabcar/javascript/getadmin.js')
var queryService = require('../../fabcar/javascript/query.js')
var log4js = require('log4js');
var logger = log4js.getLogger('Organization service');
var shell = require('shelljs');
var scriptDir = "./test-network/scripts/";
var organizationService = {
    signupOrganization: signupOrganization,
    loginOrganization: loginOrganization,
    organizationCredential: organizationCredential,
    getAllOrganizations:getAllOrganizations
};


function signupOrganization(orgDetails) {
    console.log("i am inside org sigup service", orgDetails);


    return new Promise(function (resolve, reject) {
        try {
            shell.exec(scriptDir + "addOrg3.sh " + orgDetails.orgName + " " + orgDetails.domain);
            console.log("ADD ORG DONE");
            adminService.enrolladmin(orgDetails.orgName, orgDetails.domain).then(async function (outputdata) {
                registerService.registeruser(orgDetails.orgName, orgDetails.domain).then(async function (outputdata) {

                    var functionName = "addOrganization";
                    var inputdata = {
                        "orgName": orgDetails.orgName,
                        "fullName": orgDetails.fullName,
                        "domain": orgDetails.domain,
                        "address": "sample address",
                        "category": "sample",
                        "status": "active",
                        "type": orgDetails.type
                    }
                    console.log("=================json data =========================");
                    console.log(inputdata);
                    console.log("=================json data =========================");
                    invokeService.invoke(orgDetails.orgName, orgDetails.domain, functionName, inputdata).then(async function (chaincodeoutput) {
                        console.log("chaincode output", chaincodeoutput);
                       // logger.info("Stored Organization in Ledger", invokeResult);
                        resolve("Organization Added Successfully");
                    });


                }).catch(function (err) {
                    logger.info("Error in Registering User: ", err);
                    reject(err)

                });
            }).catch(function (err) {
                logger.info("Error in Enrolling new Admin: ", err);
                reject("Error in Enrolling new Admin");
            })
        } catch (err) {
            console.log("Error", err);
            reject("Error", err);
        }
    });
}

function loginOrganization(orgDetails) {
    return new Promise(async function (resolve, reject) {
        var orgQuery = [];
        orgQuery.push(orgDetails.orgName, orgDetails.verificationCode)
        nodeRegistrationDao.loginOrganization(orgQuery).then(async function (orgData) {
            var orgName = orgData.Org_Name;
            var domain = orgData.Domain;
            // console.log("Org Data", orgData);
            // console.log('Org Details', orgDetails);
            getadminService.getadmin(orgName, domain).then(async function (identity) {
                console.log('Identity', identity);
                if (identity == "undifine") {
                    reject("Invalid User");
                    return;
                } else {
                    let UserName = orgDetails.orgName;
                    let password = orgDetails.verificationCode;
                    var baseUrl = keycloakConfig.url;
                    var settings = {
                        realm: keycloakConfig.realm,
                        resource: keycloakConfig.clientId,
                        serverUrl: baseUrl,
                        grant_type: 'password',
                        adminLogin: UserName,
                        adminPassword: password,
                        adminClienId: keycloakConfig.clientId,
                        adminClientSecret: keycloakConfig.credentials.secret,
                        realmName: keycloakConfig.realm
                    }
                    let config = AdminClient.createAdminClientConfig(settings);
                    console.log("Config", config);
                    adminClient.authenticattion(config).then(out => {
                        console.log("token", out);
                        resolve(out);
                    }).catch(function (err) {
                        console.log("Error", err);
                    });
                }

            });


        }).catch(function (err) {
            reject(err);
        });
    });
}

function organizationCredential(orgCredential) {
    return new Promise(async function (resolve, reject) {
        nodeRegistrationDao.getCredential(orgCredential).then(async function (orgData) {
            resolve(orgData);
        }).err((error) => {
            reject('Invalid User', error);
        })
    })
}


function getAllOrganizations() {

    return new Promise(async function (resolve, reject) {
        try{        
        let orgName="government";
                let orgDomain="government.com";
                var fcn = "getAllOrganizations";
                let input = {}
                let queryResult = await queryService.query(orgName, orgDomain, fcn, input);
                console.log("Query Result",queryResult);
                var result = queryResult.result.filter(function(e, i) {
                    return queryResult.result[i].type == 'Insurer' 
                  })
                resolve(result);
            }catch( err) {
                logger.error("Could not get Info details to blockchain", err.stack);
                reject("Failed to get data from blockchain");
            };
        });
    }

module.exports = organizationService;
