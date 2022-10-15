#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)

    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s/\${ORG_DOMAIN}/$6/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.json
}

ORG=${ORG_NAME}
ORG_DOMAIN=${ORG_DOMAIN}
P0PORT=${PEERPORT}
CAPORT=${CAPORT}
PEERPEM=$PWD/organizations/peerOrganizations/${ORG_DOMAIN}/tlsca/tlsca.${ORG_DOMAIN}-cert.pem
CAPEM=$PWD/organizations/peerOrganizations/${ORG_DOMAIN}/ca/ca.${ORG_DOMAIN}-cert.pem

 
echo "$(json_ccp $ORG  $P0PORT $CAPORT $PEERPEM $CAPEM ${ORG_DOMAIN})" > $PWD/organizations/peerOrganizations/${ORG_DOMAIN}/connection-${ORG_NAME}.json
