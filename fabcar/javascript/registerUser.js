/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

var RegisterService = {
    registeruser: registeruser
}
 
async function registeruser(orgName,orgDomain) {
    try {
        console.log("Registering User");
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', `${orgDomain}`, `connection-${orgName}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        console.log("ccp Done");
        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities[`ca.${orgDomain}`].url;
        const ca = new FabricCAServices(caURL);
        console.log("ca Done");
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(`${orgName}appUser`);
        if (userIdentity) {
            console.log(`An identity for the user ${orgName} already exists in the wallet`);
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get(`${orgName}admin`);
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return; 
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: `${orgName}.department1`,
            enrollmentID: `${orgName}appUser`,
            role: 'client'
        }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: `${orgName}appUser`,
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `${orgName}MSP`,
            type: 'X.509',
        };
        await wallet.put(`${orgName}appUser`, x509Identity);
        console.log('Successfully registered and enrolled admin user "appUser" and imported it into the wallet');
        return "success"
    } catch (error) {
        console.error(`Failed to register user "appUser": ${error}`);
        process.exit(1);
    }
}

module.exports = RegisterService;