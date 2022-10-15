var aadharCardService = require("../services/aadharCardService.js");
var Response = require("../util/response");
var logger = require("../../config/logger");
var Promise = require("bluebird");

var AadharCardController = {
    addAadharCard: addAadharCard,
    getAllAadharCards: getAllAadharCards,
    getAadharCard: getAadharCard,
    };

function addAadharCard(req, res) {
    var response = new Response();
    var aadharCardDetails = req.body;
    logger.info("aadharCard details ", aadharCardDetails);
    aadharCardService.addAadharCard(aadharCardDetails).then(function (message) {
        response.status.statusCode = '200';
        response.data = message;
        response.status.message = 'AadharCard registered successfully!! ';
        res.status(200).json(response);
    }).catch(function (err) {
        if (err.code == 409) {
            response.status.code = "409";
            response.status.message = "AadharCard already registered";
            res.status(response.status.code).json(response);
        } else {
            response.status.code = "500";
            response.status.message = "failed. Please try again.";
            res.status(response.status.code).json(response);
        }
    })
}

function getAllAadharCards(req,res) {
    var response = new Response();
    aadharCardService.getAllAadharCards().then(function(aadharCardList) {
        response.data.response = aadharCardList;
        response.status.statusCode = '200';
        response.status.message = 'AadharCard List ';
        res.status(200).json(response);
    }).catch(function(err) {
        response.status.statusCode = '500';
        response.status.message = 'Could not fetch AadharCard List. Please try again.';
        res.status(500).json(response);
    })
}

function getAadharCard(req,res) {
    var response = new Response();
    var aadharNumber=req.params.aadharNumber;
    var otp=req.query.otp;
    aadharCardService.getAadharCard(aadharNumber,otp).then(function(aadharCardList) {
        response.data.response = aadharCardList;
        response.status.statusCode = '200';
        response.status.message = 'AadharCard List ';
        res.status(200).json(response);
    }).catch(function(err) {
        console.log("ERROR",err);
        response.status.statusCode = '500';
        response.status.message = err.message;
        res.status(500).json(response);
    })
}

module.exports = AadharCardController;