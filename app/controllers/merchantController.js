var merchantService = require("../services/merchantService.js");
var Response = require("../util/response");
var logger = require("../../config/logger");
var Promise = require("bluebird");

var MerchantController = {
    addMerchant: addMerchant,
    updateMerchant: updateMerchant,
    getAllMerchants: getAllMerchants,
    getMerchant: getMerchant,
    deleteMerchant: deleteMerchant,
    getSingleMerchantKyc: getSingleMerchantKyc
    };

function addMerchant(req, res) {
    var response = new Response();
    var merchantDetails = req.body;
    logger.info("merchant details ", merchantDetails);
    merchantService.addMerchant(merchantDetails).then(function (message) {
        response.status.statusCode = '200';
        response.data = message;
        response.status.message = 'Merchant registered successfully!! ';
        res.status(200).json(response);
    }).catch(function (err) {
        if (err.code == 409) {
            response.status.code = "409";
            response.status.message = "Merchant already registered";
            res.status(response.status.code).json(response);
        } else {
            response.status.code = "500";
            response.status.message = "failed. Please try again.";
            res.status(response.status.code).json(response);
        }
    })
}

function updateMerchant(req, res) {
    var response = new Response();
    var panNumber=req.params.panNumber;
    var merchantDetails = req.body;
    logger.info("merchant details ", merchantDetails);
    merchantService.updateMerchant(panNumber,merchantDetails).then(function (message) {
        response.status.statusCode = '200';
        response.data = message;
        response.status.message = 'Merchant Updated successfully!! ';
        res.status(200).json(response);
    }).catch(function (err) {
        if (err.code == 404) {
            response.status.code = "404";
            response.status.message = "Merchant Not Found";
            res.status(response.status.code).json(response);
        } else {
            response.status.code = "500";
            response.status.message = err.message;
            res.status(response.status.code).json(response);
        }
    })
}


function getAllMerchants(req,res) {
    var response = new Response();
    merchantService.getAllMerchants().then(function(merchantList) {
        response.data.response = merchantList;
        response.status.statusCode = '200';
        response.status.message = 'Merchant List ';
        res.status(200).json(response);
    }).catch(function(err) {
        response.status.statusCode = '500';
        response.status.message = 'Could not fetch Merchant List. Please try again.';
        res.status(500).json(response);
    })
}

function getMerchant(req,res) {
    var response = new Response();
    var panNumber=req.params.panNumber;
    console.log("Controller PAN Number",panNumber);
    merchantService.getMerchant(panNumber).then(function(merchantList) {
        response.data.response = merchantList;
        response.status.statusCode = '200';
        response.status.message = 'Merchant List ';
        res.status(200).json(response);
    }).catch(function(err) {
        console.log("ERROR",err);
        response.status.statusCode = '500';
        response.status.message = err.message;
        res.status(500).json(response);
    })
}


function getSingleMerchantKyc(req,res) {
    var response = new Response();
    var panNumber=req.params.panNumber;
    var bankId=req.params.bankId;
    
    console.log("Controller PAN Number",panNumber);
    merchantService.getSingleMerchantKyc(panNumber,bankId).then(function(merchant) {
        response.data.response = merchant;
        response.status.statusCode = '200';
        response.status.message = 'Merchant Details ';
        res.status(200).json(response);
    }).catch(function(err) {
        console.log("ERROR",err);
        response.status.statusCode = '500';
        response.status.message = err.message;
        res.status(500).json(response);
    })
}



function deleteMerchant(req,res) {
    var response = new Response();
    var panNumber=req.params.panNumber;
    var bankId=req.params.bankId;
    
    console.log("Controller PAN Number",panNumber);

    merchantService.deleteMerchant(panNumber,bankId).then(function(result) {
        response.data.response = result;
        response.status.statusCode = '200';
        response.status.message = 'Merchant Removed';
        res.status(200).json(response);
    }).catch(function(err) {
        console.log("ERROR",err);
        response.status.statusCode = '500';
        response.status.message = err.message;
        res.status(500).json(response);
    })
}

module.exports = MerchantController;