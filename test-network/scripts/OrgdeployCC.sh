
ORG_NAME="$7"
ORG_DOMAIN="$8"
PEERPORT="$9"
CHANNEL_NAME="$1"
CC_SRC_LANGUAGE="$2"
VERSION="$3"
DELAY="$4" 
MAX_RETRY="$5"
VERBOSE="$6"
: ${CHANNEL_NAME:="mychannel"}
: ${CC_SRC_LANGUAGE:="javascript"}
: ${VERSION:="1"}
: ${DELAY:="3"}
: ${MAX_RETRY:="5"}
: ${VERBOSE:="false"}
CC_SRC_LANGUAGE=`echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:]`

FABRIC_CFG_PATH=$PWD/../config/

if [ "$CC_SRC_LANGUAGE" = "go" -o "$CC_SRC_LANGUAGE" = "golang" ] ; then
	CC_RUNTIME_LANGUAGE=golang
	CC_SRC_PATH="../chaincode/fabcar/go/"

	echo Vendoring Go dependencies ...
	pushd ../chaincode/fabcar/go
	GO111MODULE=on go mod vendor
	popd
	echo Finished vendoring Go dependencies

elif [ "$CC_SRC_LANGUAGE" = "javascript" ]; then
	CC_RUNTIME_LANGUAGE=node # chaincode runtime language is node.js
	CC_SRC_PATH="../chaincode/fabcar/javascript/"
else
	echo The chaincode language ${CC_SRC_LANGUAGE} is not supported by this script
	echo Supported chaincode languages are: go, java, javascript, and typescript
	exit 1
fi

# import utils
# export ORG_NAME="marchent"
# export ORG_DOMAIN="marchent.com"
# export PEERPORT="8051"
. scripts/envVar.sh ${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}

exportorg() {
  ORG_NAME="$1"
  ORG_DOMAIN="$2"
  PEERPORT="$3"
  export ORG_NAME=${ORG_NAME}
  export ORG_DOMAIN=${ORG_DOMAIN}
  export PEERPORT=${PEERPORT}
  export PEER0_CA=${PWD}/organizations/peerOrganizations/${ORG_DOMAIN}/peers/peer0.${ORG_DOMAIN}/tls/ca.crt
  echo "exported data" ${ORG_NAME}
}
 
packageChaincode() {
  ORG=$1
  setGlobals ${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}
  set -x
  peer lifecycle chaincode package fabcar.tar.gz --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} --label fabcar_${VERSION} >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Chaincode packaging on peer0.org${ORG} has failed"
  echo "===================== Chaincode is packaged on peer0.org${ORG} ===================== "
  echo
}

# installChaincode PEER ORG
installChaincode() {
      ORG=$1
      # exportorg "${ORG_NAME}" "${ORG_DOMAIN}" "${PEERPORT}"
      setGlobals ${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}
      echo ${ORG_DOMAIN}
      echo ${ORG_NAME}
      set -x
      peer lifecycle chaincode install fabcar.tar.gz >&log.txt
      res=$? 
      set +x
      cat log.txt
      verifyResult $res "Chaincode installation on peer0.org${ORG} has failed"
      echo "===================== Chaincode is installed on peer0.org${ORG} ===================== "
      echo
}

# queryInstalled PEER ORG
queryInstalled() {
  ORG=$1
  setGlobals ${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}
  set -x
  peer lifecycle chaincode queryinstalled >&log.txt
  res=$?
  set +x
  cat log.txt
	PACKAGE_ID=$(sed -n "/fabcar_${VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
  verifyResult $res "Query installed on peer0.org${ORG} has failed"
  echo PackageID is ${PACKAGE_ID}
  echo "===================== Query installed successful on peer0.org${ORG} on channel ===================== "
  echo
}

# approveForMyOrg VERSION PEER ORG
approveForMyOrg() {

    # exportorg "${ORG_NAME}" "${ORG_DOMAIN}" "${PEERPORT}"
    setGlobals ${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}
    set -x
    
    peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA --channelID $CHANNEL_NAME  --name fabcar --version ${VERSION} --init-required --package-id ${PACKAGE_ID} --sequence ${VERSION} >&log.txt
    set +x
    cat log.txt
    verifyResult $res "Chaincode definition approved on peer0.org${ORG} on channel '$CHANNEL_NAME' failed"
    echo "===================== Chaincode definition approved on peer0.org${ORG} on channel '$CHANNEL_NAME' ===================== "
    echo
}



# queryCommitted ORG
queryCommitted() {

  # exportorg "${ORG_NAME}" "${ORG_DOMAIN}" "${PEERPORT}"
  setGlobals ${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}
  EXPECTED_RESULT="Version: ${VERSION}, Sequence: ${VERSION}, Endorsement Plugin: escc, Validation Plugin: vscc"
  echo "===================== Querying chaincode definition on peer0.org${ORG} on channel '$CHANNEL_NAME'... ===================== "
	local rc=1
	local COUNTER=1
	# continue to poll
  # we either get a successful response, or reach MAX RETRY
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
    sleep $DELAY
    echo "Attempting to Query committed status on peer0.org${ORG}, Retry after $DELAY seconds."
    set -x
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name fabcar >&log.txt
    res=$?
    set +x
    cat log.txt
		test $res -eq 0 && VALUE=$(cat log.txt | grep -o '^Version: [0-9], Sequence: [0-9], Endorsement Plugin: escc, Validation Plugin: vscc')
    test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
		COUNTER=$(expr $COUNTER + 1)
	done
  echo
  cat log.txt
  if test $rc -eq 0; then
    echo "===================== Query chaincode definition successful on peer0.org${ORG} on channel '$CHANNEL_NAME' ===================== "
		echo
  else
    echo "!!!!!!!!!!!!!!! After $MAX_RETRY attempts, Query chaincode definition result on peer0.org${ORG} is INVALID !!!!!!!!!!!!!!!!"
    echo
    exit 1
  fi
}

## at first we package the chaincode
packageChaincode 1

## Install chaincode on peer0.org1 and peer0.org2
echo "Installing chaincode on peer0.${ORG_NAME}..."
installChaincode 1
## query whether the chaincode is installed
queryInstalled 1
## approve the definition for org1
approveForMyOrg 1

echo "Succcessfully added the Org ${ORG_NAME}"
## query on both orgs to see that the definition committed successfully
# queryCommitted 1
exit 0
