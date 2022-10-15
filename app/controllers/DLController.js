var drivingLicenceService = require("../services/DLService.js");
var Response = require("../util/response");
var logger = require("../../config/logger");
var Promise = require("bluebird");

var DrivingLicenceController = {
    addDrivingLicence: addDrivingLicence,
    getAllDrivingLicences: getAllDrivingLicences,
    getDrivingLicence: getDrivingLicence,
    };

function addDrivingLicence(req, res) {
    var response = new Response();
    var drivingLicenceDetails = req.body;
    // logger.info("drivingLicence details ", drivingLicenceDetails);
    drivingLicenceService.addDrivingLicence(drivingLicenceDetails).then(function (message) {
        response.status.statusCode = '200';
        response.data = message;
        response.status.message = 'DrivingLicence registered successfully!! ';
        res.status(200).json(response);
    }).catch(function (err) {
        if (err.code == 409) {
            response.status.code = "409";
            response.status.message = "DrivingLicence already registered";
            res.status(response.status.code).json(response);
        } else {
            response.status.code = "500";
            response.status.message = "failed. Please try again.";
            res.status(response.status.code).json(response);
        }
    })
}

function getAllDrivingLicences(req,res) {
    var response = new Response();
    drivingLicenceService.getAllDrivingLicences().then(function(drivingLicenceList) {
        response.data.response = drivingLicenceList;
        response.status.statusCode = '200';
        response.status.message = 'DrivingLicence List ';
        res.status(200).json(response);
    }).catch(function(err) {
        response.status.statusCode = '500';
        response.status.message = 'Could not fetch DrivingLicence List. Please try again.';
        res.status(500).json(response);
    })
}

function getDrivingLicence(req,res) {
    var response = new Response();
    var DLNumber=req.params.DLNumber;
    drivingLicenceService.getDrivingLicence(DLNumber).then(function(drivingLicence) {
        response.data.response = drivingLicence;
        response.status.statusCode = '200';
        response.status.message = 'DrivingLicence List ';
        res.status(200).json(response);
    }).catch(function(err) {
        response.status.statusCode = '500';
        response.status.message = err.message;
        res.status(500).json(response);
    })
}

module.exports = DrivingLicenceController;