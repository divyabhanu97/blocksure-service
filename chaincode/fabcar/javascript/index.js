/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const FabCar = require('./lib/fabcar');
const Chaincode = require('./lib/chaincode');

module.exports.FabCar = FabCar;
module.exports.Chaincode = Chaincode;
module.exports.contracts = [ Chaincode];
