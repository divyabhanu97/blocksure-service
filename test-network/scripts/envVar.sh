#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This is a collection of bash functions used by different scripts
ORG_NAME="$1"
ORG_DOMAIN="$2"
PEERPORT="$3"

echo  "${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}  in env"

export CORE_PEER_TLS_ENABLED=true 
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export PEER0_CA=${PWD}/organizations/peerOrganizations/${ORG_DOMAIN}/peers/peer0.${ORG_DOMAIN}/tls/ca.crt
# export PEER0_ORG2_CA=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
# export PEER0_ORG3_CA=${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt

# Set OrdererOrg.Admin globals
setOrdererGlobals() {
  export CORE_PEER_LOCALMSPID="OrdererMSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/ordererOrganizations/example.com/users/Admin@example.com/msp
}

# Set environment variables for the peer org
setGlobals() {
 
  ORG_NAME="$1"
  ORG_DOMAIN="$2"
  PEERPORT="$3"
  echo "set Globals"
  echo ${ORG_NAME} ${ORG_DOMAIN}  ${PEERPORT}
  export CORE_PEER_LOCALMSPID="${ORG_NAME}MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_CA
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/${ORG_DOMAIN}/users/Admin@${ORG_DOMAIN}/msp
  export CORE_PEER_ADDRESS=localhost:${PEERPORT}

  echo "CORE_PEER_LOCALMSPID " $CORE_PEER_LOCALMSPID
  echo "CORE_PEER_TLS_ROOTCERT_FILE" $CORE_PEER_TLS_ROOTCERT_FILE
  echo "CORE_PEER_MSPCONFIGPATH" $CORE_PEER_MSPCONFIGPATH
  echo "CORE_PEER_ADDRESS " $CORE_PEER_ADDRESS
  echo "ORDERER_CA" $ORDERER_CA
  echo "CORE_PEER_TLS_ENABLED" $CORE_PEER_TLS_ENABLED

  if [ "$VERBOSE" == "true" ]; then
    env | grep CORE
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {

  PEER_CONN_PARMS=""
  PEERS=""

  orgName=( $(jq -r '.[].orgName' $PWD/organizationdetails/org.json) )
  orgDoamin=( $(jq -r '.[].orgDoamin' $PWD/organizationdetails/org.json) )
  peerPort=( $(jq -r '.[].peerPort' $PWD/organizationdetails/org.json) )

  for (( n=0; n < ${#orgName[*]}; n++))
  do
    PEER0_CA=${PWD}/organizations/peerOrganizations/${orgDoamin[n]}/peers/peer0.${orgDoamin[n]}/tls/ca.crt
  # while [ "$#" -gt 0 ]; do
    setGlobals ${orgName[n]} ${orgDoamin[n]} ${peerPort[n]}
    PEER="peer0.${orgName[n]}"
    echo "PEER Address " $CORE_PEER_ADDRESS
    ## Set peer adresses
    PEERS="$PEERS $PEER"
    PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses $CORE_PEER_ADDRESS"
    ## Set path to TLS certificate
    TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER0_CA")
    PEER_CONN_PARMS="$PEER_CONN_PARMS $TLSINFO"
    # shift by one to get to the next organization
    shift
  done
  # remove leading space for output
  PEERS="$(echo -e "$PEERS" | sed -e 's/^[[:space:]]*//')"
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo
    exit 1
  fi 
}
