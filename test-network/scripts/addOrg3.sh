#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This script extends the Hyperledger Fabric test network by adding
# adding a third organization to the network
#

# prepending $PWD/../bin to PATH to ensure we are picking up the correct binaries
# this may be commented out to resolve installed version of tools if desired
export PATH=${PWD}/../../bin:${PWD}:$PATH
#it was export PATH=${PWD}/../../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}
export VERBOSE=false
ARG_LIST=($@)
ORG_NAME=${ARG_LIST[0]}
ORG_DOMAIN=${ARG_LIST[1]}
PEERPORT=${ARG_LIST[2]}
echo "PWD1="$PWD
echo "testing from script starting"

# We use the cryptogen tool to generate the cryptographic material
# (x509 certs) for the new org.  After we run the tool, the certs will
# be put in the organizations folder with org1 and org2

# Create Organziation crypto material using cryptogen or CAs
function generateOrg3() {
 
  # Create crypto material using Fabric CAs
  # if [ "$CRYPTO" == "Certificate Authorities" ]; then

    fabric-ca-client version > /dev/null 2>&1
    if [ $? -ne 0 ]; then
      echo "Fabric CA client not found locally, downloading..."
      cd ..
      #it was cd ../..
      curl -s -L "https://github.com/hyperledger/fabric-ca/releases/download/v1.4.4/hyperledger-fabric-ca-${OS_ARCH}-1.4.4.tar.gz" | tar xz || rc=$?
    if [ -n "$rc" ]; then
        echo "==> There was an error downloading the binary file."
        echo "fabric-ca-client binary is not available to download"
    else
        echo "==> Done."
      echo "PWD="$PWD
      cd test-network
    fi
    fi

    echo
    echo "##########################################################"
    echo "##### Generate certificates using Fabric CA's for ${ORG_NAME} ############"
    echo "##########################################################"

    echo 'CAPORT=='${CAPORT} ${PEERPORT}
    mkdir -p ${PWD}/docker/${ORG_NAME}/

    cp  -r ${PWD}/docker/template/template-docker-ca.yaml  ${PWD}/docker/${ORG_NAME}/docker-compose-ca.yaml
    sed -i "s/ORG_NAME/${ORG_NAME}/g;s/CAPORT/${CAPORT}/g" ${PWD}/docker/${ORG_NAME}/docker-compose-ca.yaml


    mkdir -p ${PWD}/organizations/fabric-ca/${ORG_NAME}/
    sudo chmod 777 ${PWD}/organizations/fabric-ca/${ORG_NAME}/

    sudo cp  -r ${PWD}/organizations/fabric-ca/template/template-ca-server-config.yaml  ${PWD}/organizations/fabric-ca/${ORG_NAME}/fabric-ca-server-config.yaml
    sed -i "s/ORG_NAME/${ORG_NAME}/g;s/ORG_DOMAIN/${ORG_DOMAIN}/g" ${PWD}/organizations/fabric-ca/${ORG_NAME}/fabric-ca-server-config.yaml


    IMAGE_TAG=$IMAGETAG docker-compose -f ${PWD}/docker/${ORG_NAME}/docker-compose-ca.yaml up -d 2>&1
    
      
    . organizations/fabric-ca/registerEnroll.sh ${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}


    sleep 10

    echo "##########################################################"
    echo "############ Create ${ORG_NAME} Identities ######################"
    echo "##########################################################"

    createOrg1 ${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}

  # fi
 
  echo
  echo "Generate CCP files for Org3"
  ./organizations/ccp-generate.sh ${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT} ${CAPORT}
}

# Generate channel configuration transaction
function generateOrg3Definition() {
  which configtxgen
  if [ "$?" -ne 0 ]; then
    echo "configtxgen tool not found. exiting"
    exit 1
  fi
  echo "##########################################################"
  echo "#######  Generating ${ORG_NAME} organization definition #########"
  echo "##########################################################"
   export FABRIC_CFG_PATH=$PWD


   set -x
  cp  $PWD/configtx/templates/template-org-configtx.yaml $PWD/configtx/configtx.yaml
  sed -i "s/ORG_NAME/$ORG_NAME/g;s/ORG_DOMAIN/$ORG_DOMAIN/g;s/PEERPORT/$PEERPORT/g" $PWD/configtx/configtx.yaml

   configtxgen -configPath ./configtx -printOrg ${ORG_NAME}MSP >$PWD/organizations/peerOrganizations/${ORG_DOMAIN}/${ORG_NAME}.json

 
  
   res=$?
   set +x
   if [ $res -ne 0 ]; then
     echo "Failed to generate ${ORG_NAME} config material..."
     exit 1
   fi
  echo
}

# Generate the needed certificates, the genesis block and start the network.
function addOrg3 () {
  
  pushd ./test-network
  START_PORT=7051
  ORG_NAME="$1"
  ORG_DOMAIN="$2"
  # PEERPORT="$3"

  length=( $(jq length $PWD/organizationdetails/org.json) )
  peerPort=( $(jq -r '.[].peerPort' $PWD/organizationdetails/org.json) )

  length=$(($length -1))
  echo "length " $length
  PEERPORT=$((${peerPort[$length]} + 5))
  echo "peer port " $PEERPORT
  # If the test network is not up, abort
  if [ ! -d ./organizations/ordererOrganizations ]; then
    echo
    echo "ERROR: Please, run ./network.sh up createChannel first."
    echo
    exit 1
  fi
  
  # read -p "Organization name : " ORG_NAME
  # read -p "Organization domain name (ex example.com) : " ORG_DOMAIN
   

  docker-compose -f  $PWD/docker/${ORG_NAME}/docker-compose-ca.yaml down
  sudo rm -rf  $PWD/docker/${ORG_NAME}/
  sudo rm -rf $PWD/organizations/peerOrganizations/${ORG_DOMAIN}
  sudo rm -rf $PWD/organizations/fabric-ca/${ORG_NAME}

  # read -p "Organization port number :" PEERPORT
  export PEERPORT=$PEERPORT

  CHAINPORT=$(($PEERPORT+1))
  echo 'CHAINPORT' $CHAINPORT
  export CHAINPORT=$CHAINPORT

  COUCHPORT=$(($CHAINPORT+1))
  echo 'COUCHPORT' $COUCHPORT
  export COUCHPORT=$COUCHPORT

  CAPORT=$(($COUCHPORT+1))
  echo 'CAPORT' $CAPORT
  export CAPORT=$CAPORT


  export ORG_NAME=$ORG_NAME
  export ORG_DOMAIN=$ORG_DOMAIN
  generateOrg3
  generateOrg3Definition
  cp  ${PWD}/docker/template/template-docker-org.yaml  ${PWD}/docker/${ORG_NAME}/docker-compose-org.yaml
  sed -i "s/ORG_NAME/${ORG_NAME}/g;s/ORG_DOMAIN/${ORG_DOMAIN}/g;s/COUCHPORT/${COUCHPORT}/g;s/PEERPORT/${PEERPORT}/g;s/CHAINPORT/${CHAINPORT}/g" ${PWD}/docker/${ORG_NAME}/docker-compose-org.yaml
  IMAGE_TAG=$IMAGETAG docker-compose -f $PWD/docker/${ORG_NAME}/docker-compose-org.yaml up -d 2>&1

  
  echo
  echo "###############################################################"
  echo "####### Generate and submit config tx to add Org3 #############"
  echo "###############################################################"
  ./scripts/step1updatechannel.sh $CHANNEL_NAME $CLI_DELAY $CLI_TIMEOUT $VERBOSE ${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}

  
  jq '.[.| length] |= . + {"orgName" :"'${ORG_NAME}'","orgDoamin":"'${ORG_DOMAIN}'","peerPort" :"'${PEERPORT}'"}' $PWD/organizationdetails/org.json >$PWD/organizationdetails/temp.json
  cp -r  $PWD/organizationdetails/temp.json  $PWD/organizationdetails/org.json
  VERSION=1
  CC_SRC_LANGUAGE=javascript
  MAX_RETRY=5
  scripts/OrgdeployCC.sh $CHANNEL_NAME $CC_SRC_LANGUAGE $VERSION $CLI_DELAY $MAX_RETRY $VERBOSE ${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}

  if [ $? -ne 0 ]; then
    echo "ERROR !!! Deploying chaincode failed"
    exit 1 
  fi 
  popd
  exit 0
}



# Obtain the OS and Architecture string that will be used to select the correct
# native binaries for your platform
OS_ARCH=$(echo "$(uname -s|tr '[:upper:]' '[:lower:]'|sed 's/mingw64_nt.*/windows/')-$(uname -m | sed 's/x86_64/amd64/g')" | awk '{print tolower($0)}')
# timeout duration - the duration the CLI should wait for a response from
# another container before giving up

# Using crpto vs CA. default is cryptogen
CRYPTO="Certificate Authorities"

CLI_TIMEOUT=10
#default for delay
CLI_DELAY=3
# channel name defaults to "mychannel"
CHANNEL_NAME="mychannel"
# use this as the docker compose couch file
COMPOSE_FILE_COUCH_ORG3=docker/docker-compose-couch-org3.yaml
# use this as the default docker-compose yaml definition
COMPOSE_FILE_ORG3=docker/docker-compose-org3.yaml
# certificate authorities compose file
COMPOSE_FILE_CA_ORG3=docker/docker-compose-ca-org3.yaml
# default image tag
IMAGETAG="latest"
# database
DATABASE="leveldb"
echo "testing from script ${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}"

addOrg3 ${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}

