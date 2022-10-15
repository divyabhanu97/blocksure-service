/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

var invokeService = {  
    invoke: invoke 
}

async function invoke(orgName,orgDomain,functionname,input) { 
    try {
        // load the network configuration
        console.log("=======================data===========================");
        // console.log(input.secondOrgPV);
        input = JSON.stringify(input);
        // console.log(input);
        // console.log(input.org1DvForOrg2);
        // console.log(input.org2Name);
        console.log("=======================data===========================");
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', `${orgDomain}`, `connection-${orgName}.json`);
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

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
        await gateway.connect(ccp, { wallet, identity: `${orgName}admin`, discovery: { enabled: true, asLocalhost: true } });
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');
        // Get the contract from the network.
        const contract = network.getContract('fabcar');
        
        

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
        // await contract.submitTransaction('createCar', 'Puneeth', 'Honda', 'Accord', 'White', 'Cat');
        console.log(input);
        console.log("===============final invoke----------------------");
        console.log(functionname);
        await contract.submitTransaction(`${functionname}`,input);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();
        return { status: "SUCCESS" }

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return { status: "ERROR", error: error.message }
        //process.exit(1);
    }
}

module.exports = invokeService;
