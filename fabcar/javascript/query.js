/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

var queryService = {
    query: query 
}

async function query(orgName,orgDomain,functionname,input) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', `${orgDomain}`, `connection-${orgName}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(`${orgName}appUser`);
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: `${orgName}appUser`, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        if(input.length == 0){
            const result = await contract.evaluateTransaction(functionname);
            console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
            return `${result.toString()}`;
        }
        else {
            input = JSON.stringify(input);
            console.log("i am inside input ", `${input}`)
            let response_payloads = await contract.evaluateTransaction(functionname,input);
            console.log(response_payloads.toString());
            console.log("Transaction has been evaluated, result is:",response_payloads.toString());
            if (response_payloads[0].details != null && response_payloads[0].details.toString().includes('error')) {
			return { status: "ERROR", error: response_payloads[0].details }
		    }
            let result = JSON.parse(response_payloads.toString());
		    return { status: "SUCCESS", result: result }
            // return result;
        }
        
  
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        
        return { status: "ERROR", error: error.message }
    }
}

module.exports = queryService;
