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
CHANNEL_NAME="$1"
DELAY="$2"
TIMEOUT="$3"
VERBOSE="$4"
ORG_ADD_NAME="$5"
ORG_ADD_DOMAIN="$6"
PEER_ADD_PORT="$7"
: ${CHANNEL_NAME:="mychannel"}
: ${DELAY:="3"}
: ${TIMEOUT:="10"}
: ${VERBOSE:="false"}
COUNTER=1
MAX_RETRY=5


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

joinChannelWithRetry() {
  ORG=$1
  # exportorg ${ORG_ADD_NAME} ${ORG_ADD_DOMAIN} ${PEER_ADD_PORT}
  setGlobals ${ORG_ADD_NAME} ${ORG_ADD_DOMAIN} ${PEER_ADD_PORT}

  set -x
  peer channel join -b $CHANNEL_NAME.block >&log.txt
  res=$?
  set +x 
  cat log.txt
  if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
    COUNTER=$(expr $COUNTER + 1)
    echo "peer0.org${ORG} failed to join the channel, Retry after $DELAY seconds"
    sleep $DELAY
    joinChannelWithRetry $PEER $ORG
  else
    COUNTER=1
  fi
  verifyResult $res "After $MAX_RETRY attempts, peer0.org${ORG} has failed to join channel '$CHANNEL_NAME' "
}

echo
echo "========= Creating config transaction to add ${ORG_ADD_NAME} to network =========== "
echo

# Fetch the config for the channel, writing it to config.json
fetchChannelConfig 1 ${CHANNEL_NAME} config.json

# Modify the configuration to append the new org
set -x
jq -s '.[0] * {"channel_group":{"groups":{"Application":{"groups": {"'${ORG_ADD_NAME}'MSP":.[1]}}}}}' config.json ./organizations/peerOrganizations/${ORG_ADD_DOMAIN}/${ORG_ADD_NAME}.json > modified_config.json
jq '.channel_group.groups.Application.groups.'${ORG_ADD_NAME}'MSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.'${ORG_ADD_DOMAIN}'","port": '${PEER_ADD_PORT}'}]},"version": "0"}}' modified_config.json > modified_anchor_config.json

cp -r ./modified_anchor_config.json ./modified_config.json 
set +x 


# Compute a config update, based on the differences between config.json and modified_config.json, write it as a transaction to org3_update_in_envelope.pb
createConfigUpdate ${CHANNEL_NAME} config.json modified_config.json org3_update_in_envelope.pb

echo
echo "========= Config transaction to add org3 to network created ===== "
echo

echo "Signing config transaction"
echo
signConfigtxAsPeerOrg 1 org3_update_in_envelope.pb

echo
echo "###############################################################"
echo "############### Have ${ORG_ADD_NAME} peers join network ##################"
echo "###############################################################"

echo "Fetching channel config block from orderer..."
set -x
peer channel fetch 0 $CHANNEL_NAME.block -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME --tls --cafile $ORDERER_CA >&log.txt
res=$?
set +x
cat log.txt
verifyResult $res "Fetching config block from orderer has Failed"

joinChannelWithRetry 1


exit 0
