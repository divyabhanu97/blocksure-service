ORG_NAME="$7"
ORG_DOMAIN="$8"
PEERPORT="$9"
echo  "${ORG_NAME} ${ORG_DOMAIN} ${PEERPORT}  in deploy cc"


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

CHANNEL_NAME=( $(jq -r '.channelName' $PWD/../config/hfcConfig.json) )
CC_SRC_PATH=( $(jq -r '.CC_SRC_PATH' $PWD/../config/hfcConfig.json) )
CC_RUNTIME_LANGUAGE="node"

# CC_SRC_LANGUAGE=`echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:]`

FABRIC_CFG_PATH=$PWD/../config/

# if [ "$CC_SRC_LANGUAGE" = "go" -o "$CC_SRC_LANGUAGE" = "golang" ] ; then
# 	CC_RUNTIME_LANGUAGE=golang
# 	CC_SRC_PATH="../chaincode/fabcar/go/"

# 	echo Vendoring Go dependencies ...
# 	pushd ../chaincode/fabcar/go
# 	GO111MODULE=on go mod vendor
# 	popd
# 	echo Finished vendoring Go dependencies

# elif [ "$CC_SRC_LANGUAGE" = "javascript" ]; then
# 	CC_RUNTIME_LANGUAGE=node # chaincode runtime language is node.js
# 	CC_SRC_PATH="../chaincode/fabcar/javascript/"

# elif [ "$CC_SRC_LANGUAGE" = "java" ]; then
# 	CC_RUNTIME_LANGUAGE=java
# 	CC_SRC_PATH="../chaincode/fabcar/java/build/install/fabcar"

# 	echo Compiling Java code ...
# 	pushd ../chaincode/fabcar/java
# 	./gradlew installDist
# 	popd
# 	echo Finished compiling Java code

# elif [ "$CC_SRC_LANGUAGE" = "typescript" ]; then
# 	CC_RUNTIME_LANGUAGE=node # chaincode runtime language is node.js
# 	CC_SRC_PATH="../chaincode/fabcar/typescript/"

# 	echo Compiling TypeScript code into JavaScript ...
# 	pushd ../chaincode/fabcar/typescript
# 	npm install
# 	npm run build
# 	popd
# 	echo Finished compiling TypeScript code into JavaScript

# else
# 	echo The chaincode language ${CC_SRC_LANGUAGE} is not supported by this script
# 	echo Supported chaincode languages are: go, java, javascript, and typescript
# 	exit 1
# fi


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
  echo $PWD
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

# commitChaincodeDefinition VERSION PEER ORG (PEER ORG)...
commitChaincodeDefinition() {

  parsePeerConnectionParameters
  res=$?
  verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

  # while 'peer chaincode' command can get the orderer endpoint from the
  # peer (if join was successful), let's supply it directly as we know
  # it using the "-o" option
  set -x
  peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA --channelID $CHANNEL_NAME  --name fabcar $PEER_CONN_PARMS --version ${VERSION} --sequence ${VERSION} --init-required >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Chaincode definition commit failed on peer0.org${ORG} on channel '$CHANNEL_NAME' failed"
  echo "===================== Chaincode definition committed on channel '$CHANNEL_NAME' ===================== "
  echo
}

chaincodeInvokeInit() {
  parsePeerConnectionParameters
  res=$?
  verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

  # while 'peer chaincode' command can get the orderer endpoint from the
  # peer (if join was successful), let's supply it directly as we know
  # it using the "-o" option
  set -x
  # peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n fabcar $PEER_CONN_PARMS --isInit -c '{"function":"initLedger","Args":[]}' >&log.txt
  peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n fabcar $PEER_CONN_PARMS --isInit -c '{"function":"Init","Args":[]}' >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Invoke execution on $PEERS failed "
  echo "===================== Invoke transaction successful on $PEERS on channel '$CHANNEL_NAME' ===================== "
  echo
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

## now that we know for sure both orgs have approved, commit the definition
commitChaincodeDefinition 1

## Invoke the chaincode
chaincodeInvokeInit 1
exit 0
