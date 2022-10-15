# VkycChain

## Features

- Video KYC
- AI extraction of documents and video
- Aadhar Card Verification
- PAN Card Verification
- KYC Document sharing between banks
- Data security using Blockchain Network 

## Software Requirements

- Node.js **12+**
- Docker and Docker Compose
- Go
- Python
- Hyperledger Fabric 2.2 

## How to install

### Using Git (recommended)

1.  Clone the project from github.

### Using manual download ZIP

1.  Download repository
2.  Uncompress to your desired directory

### Install npm dependencies after installing (Git or manual download)

```bash
cd <project-directory>
npm install
```

### Setting up environments

1.  Download and install all prerequisites for running Hyperledger Fabirc network.

## Project structure

```sh
.
├── LICENSE
├── MAINTAINERS.md
├── README.md
├── SECURITY.md
├── app
│   ├── controllers
│   ├── resources
│   ├── routes
│   ├── services
│   └── util
├── app.js
├── bin
│   ├── configtxgen
│   ├── configtxlator
│   ├── cryptogen
│   ├── discover
│   ├── fabric-ca-client
│   ├── fabric-ca-server
│   ├── idemixgen
│   ├── orderer
│   └── peer
├── chaincode
│   └── fabcar
├── config
│   ├── api-config.js
│   ├── config.js
│   ├── configtx.yaml
│   ├── core.yaml
│   ├── hfcConfig.json
│   ├── logger.js
│   ├── mongoose.js
│   ├── orderer.yaml
│   └── url.js
├── fabcar
│   ├── javascript
│   ├── networkDown.sh
│   └── startFabric.sh
├── logs
│   ├── swap-services.log
│   └── vkyc-services.log
├── package-lock.json
├── package.json
├── swagger.json
├── test-network
│   ├── README.md
│   ├── channel-artifacts
│   ├── config.json
│   ├── config_block.pb
│   ├── config_update.json
│   ├── config_update.pb
│   ├── config_update_in_envelope.json
│   ├── configtx
│   ├── docker
│   ├── fabcar.tar.gz
│   ├── index.js
│   ├── log.txt
│   ├── modified_anchor_config.json
│   ├── modified_config.json
│   ├── modified_config.pb
│   ├── mychannel.block
│   ├── network.sh
│   ├── org3_update_in_envelope.pb
│   ├── organizationdetails
│   ├── organizations
│   ├── original_config.pb
│   ├── package.json
│   ├── scripts
│   └── system-genesis-block
└── wallet
    ├── acquirerbankoneadmin.id
    ├── acquirerbankoneappUser.id
    ├── acquirerbanktwoadmin.id
    ├── acquirerbanktwoappUser.id
    ├── governmentadmin.id
    ├── governmentappUser.id
    ├── merchantadmin.id
    └── merchantappUser.id

```

## How to run

### Bringing up Hyperledger Fabric Network

```bash
./test-network/scripts/startFabric.sh
```

### Running API server second time

```bash
npm run
```

Press CTRL + C to stop the process.


### Onboarding new organizations

You can onboard acquirer bank nodes in the fabric network using API.
Make use of POST http://localhost:4000/apis/v1/organizations API for onboarding new node.

##### Sample Request Body

    {
        "orgName": "acquirerbankone",
        "fullName": "ACME Bank",
        "verificationCode": "321",
        "domain": "acquirerbankone.com",
        "type": "Bank"
    }

