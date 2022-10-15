var panCardService = require("../services/panCardService.js");
var Response = require("../util/response");
var logger = require("../../config/logger");
var Promise = require("bluebird");

var PanCardController = {
    addPanCard: addPanCard,
    getAllPanCards: getAllPanCards,
    getPanCard: getPanCard,
    };

function addPanCard(req, res) {
    var response = new Response();
    var panCardDetails = req.body;
    logger.info("panCard details ", panCardDetails);
    panCardService.addPanCard(panCardDetails).then(function (message) {
        response.status.statusCode = '200';
        response.data = message;
        response.status.message = 'PanCard registered successfully!! ';
        res.status(200).json(response);
    }).catch(function (err) {
        if (err.code == 409) {
            response.status.code = "409";
            response.status.message = "PanCard already registered";
            res.status(response.status.code).json(response);
        } else {
            response.status.code = "500";
            response.status.message = "failed. Please try again.";
            res.status(response.status.code).json(response);
        }
    })
}

function getAllPanCards(req,res) {
    var response = new Response();
    panCardService.getAllPanCards().then(function(panCardList) {
        response.data.response = panCardList;
        response.status.statusCode = '200';
        response.status.message = 'PanCard List ';
        res.status(200).json(response);
    }).catch(function(err) {
        response.status.statusCode = '500';
        response.status.message = 'Could not fetch PanCard List. Please try again.';
        res.status(500).json(response);
    })
}

function getPanCard(req,res) {
    var response = new Response();
    var panNumber=req.params.panNumber;
    panCardService.getPanCard(panNumber).then(function(panCard) {
        response.data.response = panCard;
        response.status.statusCode = '200';
        response.status.message = 'PanCard List ';
        res.status(200).json(response);
    }).catch(function(err) {
        response.status.statusCode = '500';
        response.status.message = err.message;
        res.status(500).json(response);
    })
}

module.exports = PanCardController;