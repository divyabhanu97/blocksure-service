#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

# This script is designed to be run in the org3cli container as the
# first step of the EYFN tutorial.  It creates and submits a
# configuration transaction to add org3 to the test network
#
CHANNEL_NAME="mychannel"
DELAY="3"
TIMEOUT="10"
VERBOSE="false"
ORG_ADD_NAME="$1"
ORG_ADD_DOMAIN="$2"
PEER_ADD_PORT="$3"
: ${CHANNEL_NAME:="mychannel"}
: ${DELAY:="3"}
: ${TIMEOUT:="10"}
: ${VERBOSE:="false"}
COUNTER=1
MAX_RETRY=5

pushd ./test-network

echo $PWD
orgName=( $(jq -r '.[].orgName' $PWD/organizationdetails/org.json) )
orgDoamin=( $(jq -r '.[].orgDoamin' $PWD/organizationdetails/org.json) )
peerPort=( $(jq -r '.[].peerPort' $PWD/organizationdetails/org.json) )

for (( n=0; n < ${#orgName[*]}; n++))
do
  echo ${orgName[n]} "==" ${ORG_ADD_NAME}

  if [ ${orgName[n]} == ${ORG_ADD_NAME} ] 
   then
      PEER_ADD_PORT=${peerPort[n]}
      break
  fi
done
echo $PEER_ADD_PORT
# import environment variables 
FABRIC_CFG_PATH=$PWD/../config/
. scripts/envVar.sh ${ORG_ADD_NAME} ${ORG_ADD_DOMAIN} ${PEER_ADD_PORT}


# fetchChannelConfig <channel_id> <output_json>
# Writes the current channel config for a given channel to a JSON file
exportorg() {
  ORG_NAME="$1"
  ORG_DOMAIN="$2"
  PEERPORT="$3"
  export ORG_NAME=${ORG_NAME}
  export ORG_DOMAIN=${ORG_DOMAIN}
  export PEERPORT=${PEERPORT}
  echo "exported data" ${ORG_NAME}
}
fetchChannelConfig() {
  ORG=$1
  CHANNEL=$2
  OUTPUT=$3
  
  setOrdererGlobals 

  orgName=( $(jq -r '.[].orgName' $PWD/organizationdetails/org.json) )
  orgDoamin=( $(jq -r '.[].orgDoamin' $PWD/organizationdetails/org.json) )
  peerPort=( $(jq -r '.[].peerPort' $PWD/organizationdetails/org.json) )
  # printf '%s\n' "${arr[@]}"

  echo " details " ${orgName[0]}  ${orgDoamin[0]} ${peerPort[0]}

  # exportorg "${orgName[0]}" "${orgDoamin[0]}" "${peerPort[0]}"
  setGlobals ${orgName[0]}  ${orgDoamin[0]} ${peerPort[0]}
  echo "FABRIC_CFG_PATH" $FABRIC_CFG_PATH
  export FABRIC_CFG_PATH=$FABRIC_CFG_PATH
  echo "Fetching the most recent configuration block for the channel"
  set -x
  peer channel fetch config config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL --tls --cafile $ORDERER_CA
  set +x

  echo "Decoding config block to JSON and isolating config to ${OUTPUT}"
  set -x
  configtxlator proto_decode --input config_block.pb --type common.Block | jq .data.data[0].payload.data.config >"${OUTPUT}"
  set +x
}
 
# createConfigUpdate <channel_id> <original_config.json> <modified_config.json> <output.pb>
# Takes an original and modified config, and produces the config update tx
# which transitions between the two
createConfigUpdate() {
  CHANNEL=$1
  ORIGINAL=$2
  MODIFIED=$3
  OUTPUT=$4

  set -x
  configtxlator proto_encode --input "${ORIGINAL}" --type common.Config >original_config.pb
  configtxlator proto_encode --input "${MODIFIED}" --type common.Config >modified_config.pb
  configtxlator compute_update --channel_id "${CHANNEL}" --original original_config.pb --updated modified_config.pb >config_update.pb
  configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate >config_update.json
  echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . >config_update_in_envelope.json
  configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope >"${OUTPUT}"
  set +x
}

# signConfigtxAsPeerOrg <org> <configtx.pb>
# Set the peerOrg admin of an org and signing the config update
signConfigtxAsPeerOrg() {
  PEERORG=$1
  TX=$2
  orgName=( $(jq -r '.[].orgName' $PWD/organizationdetails/org.json) )
  orgDoamin=( $(jq -r '.[].orgDoamin' $PWD/organizationdetails/org.json) )
  peerPort=( $(jq -r '.[].peerPort' $PWD/organizationdetails/org.json) )

  for (( n=0; n < ${#orgName[*]}; n++))
  do

    echo " details " ${orgName[n]}  ${orgDoamin[n]} ${peerPort[n]}

    # exportorg "${orgName[n]}" "${orgDoamin[n]}" "${peerPort[n]}"

    setGlobals ${orgName[n]}  ${orgDoamin[n]} ${peerPort[n]}
    set -x
      echo
      echo "========= Submitting transaction from a different peer (peer0.${orgName[n]}) which also signs it ========= "
      echo
      peer channel signconfigtx -f "${TX}"
      peer channel update -f org3_update_in_envelope.pb -c ${CHANNEL_NAME} -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${ORDERER_CA}
    set +x

  done
  # exportorg  ${ORG_ADD_NAME}  ${ORG_ADD_DOMAIN} ${PEERPORT}
  echo
  echo "========= Config transaction to add ${ORG_ADD_NAME} to network submitted! =========== "
  echo
}

echo
echo "========= Creating config transaction to add ${ORG_ADD_NAME} to network =========== "
echo

# Fetch the config for the channel, writing it to config.json
fetchChannelConfig 1 ${CHANNEL_NAME} config.json

# Modify the configuration to append the new org
set -x
jq -M  'del(.channel_group.groups.Application.groups.'${ORG_ADD_NAME}'MSP)' config.json  > modified_config.json
set +x

# Compute a config update, based on the differences between config.json and modified_config.json, write it as a transaction to org3_update_in_envelope.pb
createConfigUpdate ${CHANNEL_NAME} config.json modified_config.json org3_update_in_envelope.pb

echo
echo "========= Config transaction to add org3 to network created ===== "
echo

echo "Signing config transaction"
echo
signConfigtxAsPeerOrg 1 org3_update_in_envelope.pb



docker-compose -f $PWD/docker/${ORG_ADD_NAME}/docker-compose-ca.yaml down
docker-compose -f $PWD/docker/${ORG_ADD_NAME}/docker-compose-org.yaml down
docker rm -f $(docker container ls -a -q --filter status=exited)
sudo rm -rf $PWD/docker/$ORG_ADD_NAME/
sudo rm -rf  $PWD/organizations/fabric-ca/$ORG_ADD_NAME/
sudo rm -rf $PWD/organizations/peerOrganizations/$ORG_DOMAIN/
orgName=( $(jq -r '.[].orgName' $PWD/organizationdetails/org.json) )
for (( n=0; n < ${#orgName[*]}; n++))
do 
    if [ ${orgName[n]} == ${ORG_ADD_NAME} ]
     then
        jq -M 'del(.['$n'])' $PWD/organizationdetails/org.json >$PWD/organizationdetails/temp.json
        sudo rm -rf $PWD/../wallet/${ORG_ADD_NAME}*
    fi 
done
cp -r  $PWD/organizationdetails/temp.json  $PWD/organizationdetails/org.json
popd
exit 0
