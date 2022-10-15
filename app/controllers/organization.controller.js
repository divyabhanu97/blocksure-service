var organizationService = require("../services/organization.service.js");
var Response = require("../util/response");
var logger = require("../../config/logger");
var Promise = require("bluebird");

var organizationController = {
    signupOrganization: signupOrganization,
    loginOrganization: loginOrganization,
    organizationCredential: organizationCredential,
    getAllOrganizations: getAllOrganizations
};

function signupOrganization(req, res) {
    var response = new Response();
    var orgDetails = req.body;
    logger.info("org details ", orgDetails);
    organizationService.signupOrganization(orgDetails).then(function (message) {
        response.status.statusCode = '200';
        response.data = message;
        response.status.message = 'Organization registered successfully!! ';
        res.status(200).json(response);
    }).catch(function (err) {
        if (err.code == 409) {
            response.status.code = "409";
            response.status.message = "Organization already registered";
            res.status(response.status.code).json(response);
        } else {
            response.status.code = "500";
            response.status.message = "Signup failed. Please try again.";
            res.status(response.status.code).json(response);
        }
    })
}
function loginOrganization(req, res) {
    var response = new Response();
    var orgDetails = req.body;
    logger.info("orgDetails is :===", orgDetails);
    organizationService.loginOrganization(orgDetails).then(function (token) {
        response.data.token = token;
        response.status.statusCode = '200';
        response.status.message = 'Organization logged in successfully!! ';
        res.status(200).json(response);
    }).catch(function (err) {
        if (err.code == 401) {
            response.status.code = "401";
            response.status.message = "Unauthorized";
            res.status(response.status.code).json(response);
        } else {
            response.status.code = "500";
            response.status.message = "Login failed. Please try again.";
            res.status(response.status.code).json(response);
        }
    })
}

function organizationCredential(req, res) {
    var response = new Response();
    var orgCred = req.body;
    logger.info("orgCred For :===", orgCred);
    organizationService.organizationCredential(orgCred).then(function (output) {
        response.data.orgName = output.Org_Name;
        response.data.verificationCode = output.Verification_Code;
        response.status.statusCode = '200';
        response.status.message = 'Organization Credentials got successfully!';
        res.status(200).json(response);
    }).catch(function (err) {
        if (err.code == 401) {
            response.status.code = "401";
            response.status.message = "Unauthorized";
            res.status(response.status.code).json(response);
        } else {
            response.status.code = "500";
            response.status.message = "Fetch Credentials failed. Please try again.";
            res.status(response.status.code).json(response);
        }
    })

}
function getAllOrganizations(req,res) {
    var response = new Response();
    organizationService.getAllOrganizations().then(function(orgList) {
        response.data.response = orgList;
        response.status.statusCode = '200';
        response.status.message = 'Organization List ';
        res.status(200).json(response);
    }).catch(function(err) {
        response.status.statusCode = '500';
        response.status.message = 'Could not fetch Organization List. Please try again.';
        res.status(500).json(response);
    })
}
module.exports = organizationController;