'use strict';
const shim = require("fabric-shim");
const util = require("util");
const { Contract } = require('fabric-contract-api');

let Organization = {
  orgName: '',
  fullName: '',
  domain: '',
  address: '',
  category: '',
  type: ''
}

let AadharCard = {
  aadharNumber: '',
  fullName: '',
  gender: '',
  dob: '',
  address: '',
  image: ''
}

let PanCard = {
  panNumber: '',
  fullName: '',
  dob: '',
  image: ''
}

let DLCard = {
  DLNumber: '',
  fullName: '',
  dob: '',
  validity:'',
  image1: '',
  image2: ''
}

let orgIndexName = 'org~orgName';
let orgFirstKey = 'org';

let aadharCardIndexName = 'aadhar-card~aadharcardName';
let aadharCardFirstKey = 'aadhar-card';

let panCardIndexName = 'pan-card~pancardName';
let panCardFirstKey = 'pan-card';
let DLIndexName = 'driving-licence~drivinglicenceName';
let DLFirstKey = 'driving-licence';



let Merchant = {
  bankId: '',
  consentShared: '',
  merchantDetails: {
    panNumber: '',
    name: '',
    dob: '',
    country: '',
    phone: '',
    address: '',
    gender: '',
    postalCode: '',
    city: '',
  },
  verificationStatus: {
    panCard: '',
    aadhaarCard: '',
    vkyc: ''
  }
}

let merchantIndexName = 'merchant~Merchant-Index';
let merchantFirstKey = 'merchant';






class ChainCode extends Contract {


  async Init() {

    console.info("==================== Init Chaincode Js  ====================");

  }

  async addOrganization(ctx, orgdetails) {

    console.info("==================== Add Organization ====================");
    orgdetails = JSON.parse(orgdetails);
    let org = Organization;
    org.orgName = orgdetails.orgName;
    org.fullName = orgdetails.fullName;
    org.domain = orgdetails.domain;
    org.address = orgdetails.address;
    org.category = orgdetails.category;
    org.status = orgdetails.status;
    org.type = orgdetails.type;
    


    let orgIndexKey = await ctx.stub.createCompositeKey(orgIndexName, [orgFirstKey, org.orgName]);
    let orgBytes = await ctx.stub.getState(orgIndexKey);

    if (orgBytes.toString()) {
      throw new Error('Organization ' + orgName + ' already exists.');
    }

    orgBytes = Buffer.from(JSON.stringify(org));
    await ctx.stub.putState(orgIndexKey, orgBytes);
    console.info('============= END : Create Organization ===========');

  }

  async getAllOrganizations(ctx) {
    console.info("==================== Get All Organizations ====================");

    let orgInfoIterator = await ctx.stub.getStateByPartialCompositeKey(orgIndexName, [orgFirstKey]);
    let iterate = true;
    let orgs = [];

    while (iterate) {
      let responseRange = await orgInfoIterator.next();
      if (responseRange['value'] == null) {
        iterate = false;
      }
      else {
        let orgData = JSON.parse(responseRange.value.value.toString('utf8'));
        orgs.push(orgData);
      }
    }

    // let orgsBytes = Buffer.from(JSON.stringify(merchants));
    return JSON.stringify(orgs);
  }

  //Get Single Organization Info 
  async getOrganization(ctx, organizationDetails) {
    console.log("organization details", organizationDetails);
    organizationDetails = JSON.parse(organizationDetails);

    let orgName = organizationDetails.orgName;

    console.info("==================== Get Organization Info $orgName ====================");
    let organizationIndexKey = await ctx.stub.createCompositeKey(orgIndexName, [orgFirstKey, orgName]);
    let organizationBytes = await ctx.stub.getState(organizationIndexKey);
    if (!organizationBytes.toString()) {
      throw new Error('Organization ' + orgName + ' not found.');
    }
    return organizationBytes.toString();
  }


  async addAadharCard(ctx, aadharCardDetails) {

    console.info("==================== Add AadharCard ====================");
    aadharCardDetails = JSON.parse(aadharCardDetails);

    let aadharCard = AadharCard;
    aadharCard.aadharNumber = aadharCardDetails.aadharNumber;
    aadharCard.fullName = aadharCardDetails.fullName;
    aadharCard.gender = aadharCardDetails.gender;
    aadharCard.address = aadharCardDetails.address;
    aadharCard.dob = aadharCardDetails.dob;
    aadharCard.image = aadharCardDetails.image;

    let aadharCardIndexKey = await ctx.stub.createCompositeKey(aadharCardIndexName, [aadharCardFirstKey, aadharCard.aadharNumber]);
    let aadharCardBytes = await ctx.stub.getState(aadharCardIndexKey);
    if (aadharCardBytes.toString()) {
      throw new Error('AadharCard ' + aadharNumber + ' already exists.');
    }

    aadharCardBytes = Buffer.from(JSON.stringify(aadharCard));
    await ctx.stub.putState(aadharCardIndexKey, aadharCardBytes);
    console.info('============= END : Create AadharCard ===========');

  }

  async getAllAadharCards(ctx) {
    console.info("==================== Get All AadharCards ====================");

    let aadharCardInfoIterator = await ctx.stub.getStateByPartialCompositeKey(aadharCardIndexName, [aadharCardFirstKey]);
    let iterate = true;
    let aadharCards = [];

    while (iterate) {
      let responseRange = await aadharCardInfoIterator.next();
      if (responseRange['value'] == null) {
        iterate = false;
      }
      else {
        let aadharCardData = JSON.parse(responseRange.value.value.toString('utf8'));
        aadharCards.push(aadharCardData);
      }
    }
    return JSON.stringify(aadharCards);
  }

  //Get Single AadharCard Info 
  async getAadharCard(ctx, aadharCardDetails) {
    console.log("aadharCard details", aadharCardDetails);
    aadharCardDetails = JSON.parse(aadharCardDetails);

    let aadharNumber = aadharCardDetails.aadharNumber;

    console.info("==================== Get AadharCard Info $aadharNumber ====================");
    let aadharCardIndexKey = await ctx.stub.createCompositeKey(aadharCardIndexName, [aadharCardFirstKey, aadharNumber]);
    let aadharCardBytes = await ctx.stub.getState(aadharCardIndexKey);
    if (!aadharCardBytes.toString()) {
      throw new Error('AadharCard ' + aadharNumber + ' not found.');
    }
    return aadharCardBytes.toString();
  }

  async addPanCard(ctx, panCardDetails) {

    console.info("==================== Add PanCard ====================");
    panCardDetails = JSON.parse(panCardDetails);
    let panCard = PanCard;
    panCard.panNumber = panCardDetails.panNumber;
    panCard.fullName = panCardDetails.fullName;
    panCard.dob = panCardDetails.dob;
    panCard.image = panCardDetails.image;

    let panCardIndexKey = await ctx.stub.createCompositeKey(panCardIndexName, [panCardFirstKey, panCard.panNumber]);
    let panCardBytes = await ctx.stub.getState(panCardIndexKey);
    if (panCardBytes.toString()) {
      throw new Error('PanCard ' + panNumber + ' already exists.');
    }

    panCardBytes = Buffer.from(JSON.stringify(panCard));
    await ctx.stub.putState(panCardIndexKey, panCardBytes);
    console.info('============= END : Create PanCard ===========');

  }

  async addDL(ctx, dlCardDetails) {

    console.info("==================== Add PanCard ====================");
    dlCardDetails = JSON.parse(dlCardDetails);
    let dLCard = DLCard;
    dLCard.DLNumber = dlCardDetails.DLNumber;
    dLCard.fullName = dlCardDetails.fullName;
    dLCard.dob = dlCardDetails.dob;
    dLCard.validity= dlCardDetails.validity;
    dLCard.image1 = dlCardDetails.image1;
    dLCard.image2 = dlCardDetails.image2;

    let DLIndexKey = await ctx.stub.createCompositeKey(DLIndexName, [DLFirstKey, dLCard.DLNumber]);
    let DLBytes = await ctx.stub.getState(DLIndexKey);
    if (DLBytes.toString()) {
      throw new Error('Driving Licence ' + DLNumber + ' already exists.');
    }

    DLBytes = Buffer.from(JSON.stringify(dLCard));
    await ctx.stub.putState(DLIndexKey, DLBytes);
    console.info('============= END : Create Driving Licence ===========');

  }

  async getAllPanCards(ctx) {
    console.info("==================== Get All PanCards ====================");

    let panCardInfoIterator = await ctx.stub.getStateByPartialCompositeKey(panCardIndexName, [panCardFirstKey]);
    let iterate = true;
    let panCards = [];

    while (iterate) {
      let responseRange = await panCardInfoIterator.next();
      if (responseRange['value'] == null) {
        iterate = false;
      }
      else {
        let panCardData = JSON.parse(responseRange.value.value.toString('utf8'));
        panCards.push(panCardData);
      }
    }
    return JSON.stringify(panCards);
  }

  async getAllDLs(ctx) {
    console.info("==================== Get All PanCards ====================");

    let dLInfoIterator = await ctx.stub.getStateByPartialCompositeKey(DLIndexName, [DLFirstKey]);
    let iterate = true;
    let dls = [];

    while (iterate) {
      let responseRange = await dLInfoIterator.next();
      if (responseRange['value'] == null) {
        iterate = false;
      }
      else {
        let dlData = JSON.parse(responseRange.value.value.toString('utf8'));
        dls.push(dlData);
      }
    }
    return JSON.stringify(dls);
  }

  //Get Single PanCard Info 
  async getPanCard(ctx, panCardDetails) {
    console.log("panCard details", panCardDetails);
    panCardDetails = JSON.parse(panCardDetails);

    let panNumber = panCardDetails.panNumber;

    console.info("==================== Get PanCard Info $panNumber ====================");
    let panCardIndexKey = await ctx.stub.createCompositeKey(panCardIndexName, [panCardFirstKey, panNumber]);
    let panCardBytes = await ctx.stub.getState(panCardIndexKey);
    if (!panCardBytes.toString()) {
      throw new Error('PanCard ' + panNumber + ' not found.');
    }
    return panCardBytes.toString();
  }

  async getDL(ctx, DLDetails) {
    console.log("panCard details", DLDetails);
    DLDetails = JSON.parse(DLDetails);

    let dlNumber = DLDetails.DLNumber;

    console.info("==================== Get PanCard Info $panNumber ====================");
    let DLIndexKey = await ctx.stub.createCompositeKey(DLIndexName, [DLFirstKey, dlNumber]);
    let dlBytes = await ctx.stub.getState(DLIndexKey);
    if (!dlBytes.toString()) {
      throw new Error('Driving Licence ' + dlNumber + ' not found.');
    }
    return dlBytes.toString();
  }




  async addMerchant(ctx, input) {

    console.info("==================== Add Merchantinfo ====================");

    console.log("merchantDetails", input);

    input = JSON.parse(input);
    console.log("parsing merchantDetails ", input);

    let merchant = Object.create(Merchant);
    merchant.bankId = input.bankId;
    merchant.consentShared = input.consentShared;
    merchant.merchantDetails = input.merchantDetails;
    merchant.verificationStatus = input.verificationStatus

    let panNumber = input.merchantDetails.panNumber;
    let bankId = input.bankId;


    let merchantIndexKey = await ctx.stub.createCompositeKey(merchantIndexName, [merchantFirstKey, panNumber, bankId]);
    console.log("Merchant Index Key", merchantIndexKey);

    //Check if Merchant Already Exists
    let merchantBytes = await ctx.stub.getState(merchantIndexKey);
    if (merchantBytes.toString()) {
      throw new Error('Merchant ' + panNumber + ' already exists.');
    }

    console.log("merchant", merchant);
    merchantBytes = Buffer.from(JSON.stringify(merchant));

    await ctx.stub.putState(merchantIndexKey, merchantBytes);
    return "Successfully Added Merchant";
  }


  async updateMerchant(ctx, input) {
    console.info("==================== Update Merchantinfo ====================");
    console.log(input);

    input = JSON.parse(input);

    console.log("after parse ", input);

    let panNumber = input.merchantDetails.panNumber;
    let bankId = input.bankId;

    let merchantIndexKey = await ctx.stub.createCompositeKey(merchantIndexName, [merchantFirstKey, panNumber, bankId]);
    console.log("Merchant Key", merchantIndexKey);
    let merchantBytes = await ctx.stub.getState(merchantIndexKey);
    console.log("Merchant Bytes", merchantBytes);
    let merchantInfo = JSON.parse(merchantBytes.toString());
    console.log("Existing Merchant", merchantInfo);

    let merchant = Merchant;
    if (panNumber == merchantInfo.merchantDetails.panNumber) {
      merchant.bankId = input.bankId;
      merchant.consentShared = input.consentShared;
      merchant.merchantDetails = input.merchantDetails;
      merchant.verificationStatus = input.verificationStatus;

      console.log("update ", merchant);
      merchantBytes = Buffer.from(JSON.stringify(merchant));
      await ctx.stub.putState(merchantIndexKey, merchantBytes);

      return JSON.stringify(merchant);
    }
    else {
      return `Merchant ${panNumber} not found`
    }
  }

  async getAllMerchants(ctx) {
    console.info("==================== Get All Merchants info ====================");

    let merchantInfoIterator = await ctx.stub.getStateByPartialCompositeKey(merchantIndexName, [merchantFirstKey]);
    let iterate = true;
    let merchants = [];

    while (iterate) {
      let responseRange = await merchantInfoIterator.next();
      if (responseRange['value'] == null) {
        iterate = false;
      }
      else {
        let merchantData = JSON.parse(responseRange.value.value.toString('utf8'));
        merchants.push(merchantData);
      }
    }

    // let orgsBytes = Buffer.from(JSON.stringify(merchants));
    return JSON.stringify(merchants);
  }


  //Get Single Merchant for Bank  
  
  async getSingleMerchantKyc(ctx, input) {
    console.info("==================== Get Sinlge Merchants info ====================");
    input = JSON.parse(input);
    let panNumber = input.panNumber;
    let bankId = input.bankId;
    let merchantIndexKey = await ctx.stub.createCompositeKey(merchantIndexName, [merchantFirstKey, panNumber,bankId]);
    let merchantBytes = await ctx.stub.getState(merchantIndexKey);
    if (!merchantBytes.toString()) {
      throw new Error('Merchant ' + panNumber + ' not found.');
    }

    return merchantBytes.toString();
  }

  //Get all merchant info based on PAN Number 
  async getMerchant(ctx, input) {
    console.info("==================== Get All Merchant VKC ====================");
    input = JSON.parse(input);
    let panNumber = input.panNumber;
    
    let merchantInfoIterator = await ctx.stub.getStateByPartialCompositeKey(merchantIndexName, [merchantFirstKey, panNumber]);
    let iterate = true;
    let merchants = [];

    while (iterate) {
      let responseRange = await merchantInfoIterator.next();
      if (responseRange['value'] == null) {
        iterate = false;
      }
      else {
        let merchantData = JSON.parse(responseRange.value.value.toString('utf8'));
        merchants.push(merchantData);
      }
    }

    // let orgsBytes = Buffer.from(JSON.stringify(merchants));
    return JSON.stringify(merchants);
  }

  //Delete Merchant  
  async deleteMerchant(ctx, input) {
    console.info("==================== Delete Sinlge Merchant info ====================");
    input = JSON.parse(input);
    let panNumber = input.panNumber;
    let bankId=input.bankId;

    let merchantIndexKey = await ctx.stub.createCompositeKey(merchantIndexName, [merchantFirstKey, panNumber,bankId]);
    let merchantBytes = await ctx.stub.getState(merchantIndexKey);
    if (!merchantBytes.toString()) {
      throw new Error('Merchant ' + panNumber + ' not found.');
    }

    await ctx.stub.deleteState(merchantIndexKey);
    return "Successfully Deleted Merchant";
  }



  //>>>>>>>>>>ADD EXTRACTED FIELDS<<<<<<<<<<<<<<<<<<<<<<<<\\
  // async addExtractedFields(ctx, merchantDetails) {
  //   console.info("==================== Update Merchantinfo ====================");
  //   console.log(merchantDetails);

  //   merchantDetails = JSON.parse(merchantDetails);

  //   console.log("after parse ", merchantDetails);
  //   let Merchant_ID = merchantDetails.Merchant_ID;
  //   let Unique_Id = merchantDetails.Unique_Id;
  //   let Acquirer_Bank_Id = merchantDetails.Acquirer_Bank_Id;
  //   let Document_Extracted = merchantDetails.Document_Extracted;
  //   let type = Document_Extracted.type;
  //   let Document_Verification_Status = merchantDetails.Document_Verification_Status;

  //   console.log("Input Type", type);

  //   console.log("Merchant_ID ", Merchant_ID);

  //   let merchantIndexKey = await ctx.stub.createCompositeKey(merchantIndexName, [merchantFirstKey, Merchant_ID, Acquirer_Bank_Id, Unique_Id]);

  //   let merchantBytes = await ctx.stub.getState(merchantIndexKey);
  //   let getmarchent = JSON.parse(merchantBytes.toString());
  //   console.log(getmarchent);

  //   let merchant = MerchantInfo;
  //   console.log("getmarchent.Merchant_Category_Code ", getmarchent.Merchant_Category_Code);
  //   if (Merchant_ID == getmarchent.Merchant_ID) {
  //     merchant.Unique_Id = getmarchent.Unique_Id;
  //     merchant.Merchant_Category_Code = getmarchent.Merchant_Category_Code;
  //     merchant.Merchant_ID = getmarchent.Merchant_ID;
  //     merchant.Documents_Uploaded = getmarchent.Documents_Uploaded;
  //     merchant.Document_Status = getmarchent.Document_Status;
  //     merchant.Conscent_provided = getmarchent.Conscent_provided;
  //     merchant.Document_Names_Array = getmarchent.Document_Names_Array;
  //     merchant.Document_Verification_Status = Document_Verification_Status;
  //     merchant.Comments_From_Acquirer_Bank = getmarchent.Comments_From_Acquirer_Bank;
  //     merchant.Verification_Agency_Id = getmarchent.Verification_Agency_Id;
  //     merchant.Primary_Bank_Id = getmarchent.Primary_Bank_Id;
  //     merchant.Acquirer_Bank_Id = getmarchent.Acquirer_Bank_Id;
  //     merchant.Document_urls = getmarchent.Document_urls;
  //     merchant.Applied_Date = getmarchent.Applied_Date;
  //     merchant.Primary_Bank_Unique_Id = getmarchent.Primary_Bank_Unique_Id
  //     merchant.Verification_Agency_Unique_Id = getmarchent.Verification_Agency_Unique_Id
  //     merchant.Acquirer_Bank_Unique_Id = getmarchent.Acquirer_Bank_Unique_Id

  //     merchant.Time_Stamp = new Date();

  //     var flag = false;
  //     var localindex = -1;

  //     for (var i = 0; i < getmarchent.Document_Extracted.length; i++) {
  //       if (getmarchent.Document_Extracted[i].type === type) {
  //         flag = true;
  //         localindex = i;
  //         break;
  //       }
  //     }
  //     console.log("flag ", flag);
  //     console.log("index ", localindex);
  //     if (flag) {
  //       getmarchent.Document_Extracted[localindex] = Document_Extracted;
  //       console.log("Index FOund", localindex);
  //     }
  //     else {
  //       getmarchent.Document_Extracted.push(Document_Extracted);
  //       console.log("Index Not FOund", localindex);
  //     }

  //     merchant.Document_Extracted = getmarchent.Document_Extracted;


  //     console.log("update ", merchant);
  //     merchantBytes = Buffer.from(JSON.stringify(merchant));
  //     merchantIndexKey = await ctx.stub.createCompositeKey(merchantIndexName, [merchantFirstKey, Merchant_ID, Acquirer_Bank_Id, Unique_Id]);
  //     await ctx.stub.putState(merchantIndexKey, merchantBytes);

  //     return JSON.stringify(merchant);
  //   }
  //   // else {
  //   //   return `${MerchantInfoUpdate.Merchant_ID} id not found`
  //   // }

  // }






  //Get Merchant Info for Single Request 
  // async getMerchant(ctx, merchantDetails) {
  //   console.log("merchantDetails", merchantDetails);
  //   merchantDetails = JSON.parse(merchantDetails);

  //   let MId = merchantDetails.Merchant_ID
  //   let Unique_Id = merchantDetails.Unique_Id;
  //   let Acquirer_Bank_Id = merchantDetails.Acquirer_Bank_Id;

  //   console.info("==================== Get Merchant Info $MId ====================");
  //   let merchantIndexKey = await ctx.stub.createCompositeKey(merchantIndexName, [merchantFirstKey, MId, Acquirer_Bank_Id, Unique_Id]);
  //   let merchantBytes = await ctx.stub.getState(merchantIndexKey);
  //   if (!merchantBytes.toString()) {
  //     throw new Error('Organization ' + MId + ' not found.');
  //   }

  //   return merchantBytes.toString();
  // }

  //Get Merchant Info for single Acquirer Bank 

  // async getAllMerchantSingleAcquirerBank(ctx, merchantDetails) {
  //   console.log("merchantDetails", merchantDetails);
  //   merchantDetails = JSON.parse(merchantDetails);

  //   let MId = merchantDetails.Merchant_ID
  //   let Acquirer_Bank_Id = merchantDetails.Acquirer_Bank_Id;

  //   console.log("merchantDetails after parse", merchantDetails);
  //   console.log("MID", MId);
  //   console.log("Acquirer_Bank_Id", Acquirer_Bank_Id);


  //   let merchantInfoIterator = await ctx.stub.getStateByPartialCompositeKey(merchantIndexName, [merchantFirstKey, MId, Acquirer_Bank_Id]);

  //   let iterate = true;
  //   let merchants = [];

  //   while (iterate) {
  //     let responseRange = await merchantInfoIterator.next();
  //     if (responseRange['value'] == null) {
  //       console.log("False");
  //       iterate = false;
  //     }
  //     else {
  //       console.log("True");
  //       let MerchantData = JSON.parse(responseRange.value.value.toString('utf8'));
  //       merchants.push(MerchantData);
  //     }
  //   }

  //   // let orgsBytes = Buffer.from(JSON.stringify(merchants));
  //   return JSON.stringify(merchants);
  // }


  // async showHistory(ctx, merchantDetails) {
  //   console.info("==================== Get showHistory ====================");
  //   merchantDetails = JSON.parse(merchantDetails);
  //   // if (params.length != 1) {
  //   //   throw new Error('Incorrect number of arguments. Expecting 1 [ BagId ]. ');
  //   // }

  //   let MId = merchantDetails.Merchant_ID;
  //   let Unique_Id = merchantDetails.Unique_Id;
  //   let Acquirer_Bank_Id = merchantDetails.Acquirer_Bank_Id;

  //   let merchantIndexKey = await ctx.stub.createCompositeKey(merchantIndexName, [merchantFirstKey, MId, Acquirer_Bank_Id, Unique_Id]);
  //   console.log("bagtrackIndexKey", merchantIndexKey);
  //   const promiseOfIterator = ctx.stub.getHistoryForKey(merchantIndexKey);


  //   const results = [];
  //   for await (const keyMod of promiseOfIterator) {
  //     console.log("KeyMod", keyMod);
  //     const resp = {
  //       timestamp: keyMod.timestamp,
  //       txid: keyMod.txId
  //     }
  //     if (keyMod.is_delete) {
  //       resp.data = 'KEY DELETED';
  //     } else {
  //       resp.data = JSON.parse(keyMod.value.toString('utf8'));
  //     }
  //     console.log("Response", resp);
  //     results.push(resp);
  //   }

  //   return JSON.stringify(results);
  // }


  // async getAllMerchantsInfoshowHistory(ctx) {
  //   console.info("==================== Get All Merchants info ====================");

  //   let merchantInfoIterator = await ctx.stub.getStateByPartialCompositeKey(merchantIndexName, [merchantFirstKey]);
  //   let iterate = true;
  //   let merchants = [];

  //   while (iterate) {
  //     let responseRange = await merchantInfoIterator.next();
  //     if (responseRange['value'] == null) {
  //       iterate = false;
  //     }
  //     else {
  //       let MerchantData = JSON.parse(responseRange.value.value.toString('utf8'));
  //       console.log(MerchantData);
  //       let merchantIndexKey = await ctx.stub.createCompositeKey(merchantIndexName, [merchantFirstKey, MerchantData.Merchant_ID]);
  //       // console.log("bagtrackIndexKey",merchantIndexKey);
  //       let merchantBytes = await ctx.stub.getHistoryForKey(merchantIndexKey);
  //       // console.log("bagtrackBytes",merchantBytes);
  //       let iterate = true;
  //       while (iterate) {
  //         let responseRange = await merchantBytes.next();
  //         if (responseRange['value'] == null) {
  //           iterate = false;
  //         }
  //         else {
  //           console.log(responseRange.value.toString('utf8'));
  //           let card = JSON.parse(responseRange.value.value.toString('utf8'));
  //           // cards.push(card);
  //           merchants.push(card);
  //         }
  //       }
  //     }
  //   }

  //   // let orgsBytes = Buffer.from(JSON.stringify(merchants));
  //   return JSON.stringify(merchants);
  // }

  // async getOnlyUploadedMerchentInfo(ctx) {
  //   console.info("==================== Get All Merchants info ====================");

  //   let merchantInfoIterator = await ctx.stub.getStateByPartialCompositeKey(merchantIndexName, [merchantFirstKey]);
  //   let iterate = true;
  //   let merchants = [];

  //   while (iterate) {
  //     let responseRange = await merchantInfoIterator.next();
  //     if (responseRange['value'] == null) {
  //       iterate = false;
  //     }
  //     else {
  //       let MerchantData = JSON.parse(responseRange.value.value.toString('utf8'));
  //       if (MerchantData.Document_Status == "U") {
  //         merchants.push(MerchantData);
  //       }

  //     }
  //   }
  //   // let orgsBytes = Buffer.from(JSON.stringify(merchants));
  //   return JSON.stringify(merchants);
  // }


  // To create chaincode for new orgs

  // async dummy(ctx) {
  //   console.info("==================== Dummy ====================");

  //   return "Invoke testing succefully done";
  // }




  // //>>>>>>>>>STAKEHOLDER CHAINCODE<<<<<<<<<<<<<<<<<<<<<<<<<<\\


  // //>>>>>>>>>>>>ADD STAKEHOLDER INFO<<<<<<<<<<<<<<<\\

  // // async addStakeHolder(ctx, stakeHolderDetails) {

  // //   console.info("==================== Add Stake Holder ====================");
  // //   console.log("Stake Holder Details", stakeHolderDetails);
  // //   stakeHolderDetails = JSON.parse(stakeHolderDetails);
  // //   console.log("parsing Stake Holder details ", stakeHolderDetails);

  // //   let type = stakeHolderDetails.Type;
  // //   let typeId = stakeHolderDetails.Type + '_ID';


  // //   console.log("typeId", typeId);
  // //   var timestamp = new Date();
  // //   stakeHolderDetails.Time_Stamp = timestamp;

  // //   let stakeHolder_bytes = Buffer.from(JSON.stringify(stakeHolderDetails));
  // //   let stakeHolderIndexKey = await ctx.stub.createCompositeKey(type + '~' + stakeHolderIndexName, [stakeHolderFirstKey, typeId, stakeHolderDetails.Merchant_ID, stakeHolderDetails.Unique_Id]);
  // //   await ctx.stub.putState(stakeHolderIndexKey, stakeHolder_bytes);

  // //   return "Successfully added Stake Holder Information"
  // // }


  // // //>>>>>>>>>>>>GET ALL STAKE HOLDER DETAILS<<<<<<<<<<<<<<<\\
  // // async getAllStakeHolderInfo(ctx, stakeHolder) {
  // //   console.info("==================== Get All Stake Holders Info ====================");
  // //   stakeHolder = JSON.parse(stakeHolder);
  // //   let type = stakeHolder.Type;
  // //   console.info("Type", type);

  // //   let iterator = await ctx.stub.getStateByPartialCompositeKey(type + '~' + stakeHolderIndexName, [stakeHolderFirstKey]);
  // //   let iterate = true;
  // //   let stakeHolders = [];

  // //   while (iterate) {
  // //     let responseRange = await iterator.next();
  // //     if (responseRange['value'] == null) {
  // //       iterate = false;
  // //     }
  // //     else {
  // //       let stakeHolderData = JSON.parse(responseRange.value.value.toString('utf8'));
  // //       stakeHolders.push(stakeHolderData);
  // //     }
  // //   }
  // //   return JSON.stringify(stakeHolders);
  // // }


  // // //>>>>>>>>>>>>GET ALL STAKE HOLDER DETAILS For Single Merchant<<<<<<<<<<<<<<<\\
  // // async getAllInfoForMerchant(ctx, stakeHolder) {
  // //   console.info("==================== Get All Stake Holders Info For Single Merchant ====================");
  // //   stakeHolder = JSON.parse(stakeHolder);
  // //   let type = stakeHolder.Type;
  // //   let Merchant_ID = stakeHolder.Merchant_ID;
  // //   let stakeHolderId = stakeHolder.Type + '_ID';
  // //   console.log("After Parse", stakeHolder);

  // //   console.info("Type", type);
  // //   console.info("MID", Merchant_ID);
  // //   console.info("STID", stakeHolderId);
  // //   let iterator = await ctx.stub.getStateByPartialCompositeKey(type + '~' + stakeHolderIndexName, [stakeHolderFirstKey, stakeHolderId, Merchant_ID]);
  // //   let iterate = true;
  // //   let stakeHolders = [];

  // //   while (iterate) {
  // //     let responseRange = await iterator.next();
  // //     if (responseRange['value'] == null) {
  // //       iterate = false;
  // //     }
  // //     else {
  // //       let stakeHolderData = JSON.parse(responseRange.value.value.toString('utf8'));
  // //       stakeHolders.push(stakeHolderData);
  // //     }
  // //   }
  // //   return JSON.stringify(stakeHolders);
  // // }

  // // //>>>>>>>>>>>>>>>>>>UPDATE STAKE HOLDER DETAILS<<<<<<<<<<<<<<<<<<<<<<<<<<<<\\ 
  // // async updateStakeHolder(ctx, stakeHolderDetails) {
  // //   console.info("==================== Update Stake Holder Info ====================");
  // //   console.log(stakeHolderDetails);

  // //   stakeHolderDetails = JSON.parse(stakeHolderDetails);
  // //   console.log("after parse ", stakeHolderDetails);

  // //   let Document_Extracted = stakeHolderDetails.Document_Extracted;
  // //   let Action = stakeHolderDetails.Action;

  // //   let type = stakeHolderDetails.type;
  // //   let Merchant_ID = stakeHolderDetails.Merchant_ID;
  // //   let Unique_Id = stakeHolderDetails.Unique_Id;
  // //   let stakeHolderId = stakeHolderDetails.type + '_ID';
  // //   console.log("stakeHolderId", stakeHolderId);

  // //   let stakeHolderIndexKey = await ctx.stub.createCompositeKey(type + '~' + stakeHolderIndexName, [stakeHolderFirstKey, stakeHolderId, Merchant_ID, Unique_Id]);

  // //   let stakeHolder_bytes = await ctx.stub.getState(stakeHolderIndexKey);
  // //   let stakeHolder = JSON.parse(stakeHolder_bytes.toString());

  // //   if (Merchant_ID == stakeHolder.Merchant_ID) {
  // //     stakeHolder.Document_Extracted = Document_Extracted;
  // //     stakeHolder.Action = Action;
  // //     console.log("update ", stakeHolder);
  // //     let stakeHolderBytes = Buffer.from(JSON.stringify(stakeHolder));

  // //     await ctx.stub.putState(stakeHolderIndexKey, stakeHolderBytes);

  // //     return JSON.stringify(stakeHolder);
  // //   }

  // // }



  // // //>>>>>>>>>>>>>>>>>>SET DOC URL FOR STAKE HOLDER DETAILS<<<<<<<<<<<<<<<<<<<<<<<<<<<<\\ 
  // // async setUrlForStakeHolder(ctx, stakeHolderDetails) {
  // //   console.info("==================== Update Stake Holder Info ====================");
  // //   console.log(stakeHolderDetails);

  // //   stakeHolderDetails = JSON.parse(stakeHolderDetails);
  // //   console.log("after parse ", stakeHolderDetails);

  // //   let Document_URL = stakeHolderDetails.Document_URL;
  // //   let type = stakeHolderDetails.type;
  // //   let Merchant_ID = stakeHolderDetails.Merchant_ID;
  // //   let Unique_Id = stakeHolderDetails.Unique_Id;
  // //   let Merchant_Category_Code = stakeHolderDetails.Merchant_Category_Code;
  // //   let stakeHolderId = stakeHolderDetails.type + '_ID';
  // //   console.log("stakeHolderId", stakeHolderId);

  // //   let stakeHolderIndexKey = await ctx.stub.createCompositeKey(type + '~' + stakeHolderIndexName, [stakeHolderFirstKey, stakeHolderId, Merchant_ID, Unique_Id]);

  // //   let stakeHolder_bytes = await ctx.stub.getState(stakeHolderIndexKey);
  // //   let stakeHolder = JSON.parse(stakeHolder_bytes.toString());

  // //   if (Merchant_ID == stakeHolder.Merchant_ID) {
  // //     stakeHolder.Document_URL = Document_URL;
  // //     stakeHolder.Merchant_Category_Code = Merchant_Category_Code;
  // //     console.log("update ", stakeHolder);
  // //     let stakeHolderBytes = Buffer.from(JSON.stringify(stakeHolder));

  // //     await ctx.stub.putState(stakeHolderIndexKey, stakeHolderBytes);

  // //     return JSON.stringify(stakeHolder);
  // //   }

  // // }

  // // //>>>>>>>>>>>>>>>>>>UPDATE STATUS FOR STAKE HOLDER DETAILS<<<<<<<<<<<<<<<<<<<<<<<<<<<<\\ 
  // // async updateStatusForStakeHolder(ctx, stakeHolderDetails) {
  // //   console.info("==================== Update Stake Holder Status ====================");
  // //   console.log(stakeHolderDetails);

  // //   stakeHolderDetails = JSON.parse(stakeHolderDetails);
  // //   console.log("after parse ", stakeHolderDetails);

  // //   let Action = stakeHolderDetails.Action;
  // //   let type = stakeHolderDetails.type;
  // //   let Merchant_ID = stakeHolderDetails.Merchant_ID;
  // //   let Unique_Id = stakeHolderDetails.Unique_Id;
  // //   let stakeHolderId = stakeHolderDetails.type + '_ID';
  // //   console.log("stakeHolderId", stakeHolderId);

  // //   let stakeHolderIndexKey = await ctx.stub.createCompositeKey(type + '~' + stakeHolderIndexName, [stakeHolderFirstKey, stakeHolderId, Merchant_ID, Unique_Id]);

  // //   let stakeHolder_bytes = await ctx.stub.getState(stakeHolderIndexKey);
  // //   let stakeHolder = JSON.parse(stakeHolder_bytes.toString());

  // //   if (Merchant_ID == stakeHolder.Merchant_ID) {
  // //     stakeHolder.Action = Action;
  // //     stakeHolder.Time_Stamp = new Date();
  // //     console.log("update ", stakeHolder);
  // //     let stakeHolderBytes = Buffer.from(JSON.stringify(stakeHolder));

  // //     await ctx.stub.putState(stakeHolderIndexKey, stakeHolderBytes);

  // //     return JSON.stringify(stakeHolder);
  // //   }

  // // }



  // // //>>>>>>>>>>>GET SINGLE STAKE HOLDER DETAILS<<<<<<<<<<<<<<<<<<<<<<<<<<<<\\
  // // async getSingleStakeHolder(ctx, input) {
  // //   input = JSON.parse(input);
  // //   let type = input.type;
  // //   let stakeHolderId = input.type + '_ID'
  // //   let Merchant_ID = input.Merchant_ID;
  // //   let Unique_Id = input.Unique_Id;
  // //   console.log("STAKEHOLDER ID= " + stakeHolderId + " Merchant ID= " + Merchant_ID);

  // //   console.info("==================== Get Stake Holder Info!! MID= $Merchant_ID and StakeHolderID= $ stakeHolderId ====================");
  // //   let stakeHolderIndexKey = await ctx.stub.createCompositeKey(type + '~' + stakeHolderIndexName, [stakeHolderFirstKey, stakeHolderId, Merchant_ID, Unique_Id]);
  // //   let stakeHolderBytes = await ctx.stub.getState(stakeHolderIndexKey);
  // //   if (!stakeHolderBytes.toString()) {
  // //     throw new Error('Merchant M_ID= ' + Merchant_ID + ' Stake Holder ID= ' + stakeHolderId + ' not found.');
  // //   }
  // //   return JSON.stringify(stakeHolderBytes.toString());
  // // }



  // // //GET STAKEHOLDER HISTORY
  // // async getStakeHolderHistory(ctx, input) {
  // //   console.info("==================== Get StakeHolder History ====================");
  // //   input = JSON.parse(input);
  // //   let type = input.type;
  // //   let stakeHolderId = input.type + '_ID';
  // //   let Merchant_ID = input.Merchant_ID;
  // //   let Unique_Id = input.Unique_Id;
  // //   console.log("STAKEHOLDER ID= " + stakeHolderId + " Merfchant ID= " + Merchant_ID);

  // //   console.info("==================== Get Stake Holder History!! MID= $Merchant_ID and StakeHolderID= $ stakeHolderId ====================");
  // //   let stakeHolderIndexKey = await ctx.stub.createCompositeKey(type + '~' + stakeHolderIndexName, [stakeHolderFirstKey, stakeHolderId, Merchant_ID, Unique_Id]);
  // //   const promiseOfIterator = ctx.stub.getHistoryForKey(stakeHolderIndexKey);


  // //   const results = [];
  // //   for await (const keyMod of promiseOfIterator) {
  // //     console.log("KeyMod", keyMod);
  // //     const resp = {
  // //       timestamp: keyMod.timestamp,
  // //       txid: keyMod.txId
  // //     }
  // //     if (keyMod.is_delete) {
  // //       resp.data = 'KEY DELETED';
  // //     } else {
  // //       resp.data = JSON.parse(keyMod.value.toString('utf8'));
  // //     }
  // //     console.log("Response", resp);
  // //     results.push(resp);
  // //   }

  // //   return JSON.stringify(results);
  // // }






  // //>>>>>>>>>>>>>>>>>ACQUIRER BANK<<<<<<<<<<<<<<<<<<<<\\\\

  // async addMerchantAcquirerBank(ctx, acquirerBankData) {
  //   console.info("==================== Add Merchant Acquirer Bank ====================");
  //   console.log("Acquirer-Bank Data --> ", acquirerBankData);
  //   acquirerBankData = JSON.parse(acquirerBankData);
  //   let acquirerBank = AcquirerBank;

  //   acquirerBank.Unique_Id = acquirerBankData.Unique_Id
  //   acquirerBank.Acquirer_Bank_ID = acquirerBankData.Acquirer_Bank_ID;
  //   acquirerBank.Merchant_ID = acquirerBankData.Merchant_ID;
  //   acquirerBank.Merchant_Category_Code = acquirerBankData.Merchant_Category_Code;
  //   acquirerBank.Action = acquirerBankData.Action;
  //   acquirerBank.Time_Stamp = new Date();
  //   acquirerBank.Comparision_Result = acquirerBankData.Comparision_Result;
  //   acquirerBank.Comparision_Result_Hash = acquirerBankData.Comparision_Result_Hash;
  //   acquirerBank.Document_Status = acquirerBankData.Document_Status;
  //   acquirerBank.Merchant_Unique_Id = acquirerBankData.Merchant_Unique_Id;
  //   acquirerBank.Primary_Bank_Unique_Id = acquirerBankData.Primary_Bank_Unique_Id;
  //   acquirerBank.Verification_Agency_Unique_Id = acquirerBankData.Verification_Agency_Unique_Id;

  //   console.log("AcquirerBank --> ", acquirerBank);
  //   let acquirerBankBytes = Buffer.from(JSON.stringify(acquirerBank));
  //   let acquirerBankIndexKey = await ctx.stub.createCompositeKey(acquirerBankIndexName, [acquirerBankFirstKey, acquirerBank.Acquirer_Bank_ID, acquirerBank.Merchant_ID, acquirerBank.Unique_Id]);
  //   await ctx.stub.putState(acquirerBankIndexKey, acquirerBankBytes);
  //   return "Acquirer Bank Successfully Added";
  // }

  // //==================== GET Every Merchant Acquirer Bank Information ====================\\
  // async getAllMerchantAcquirerBankInfo(ctx) {
  //   console.info("==================== Get All Merchant Acquirer Bank Information ====================");

  //   let acquirerBankInfoIterator = await ctx.stub.getStateByPartialCompositeKey(acquirerBankIndexName, [acquirerBankFirstKey]);
  //   let iterate = true;
  //   let acquirerBanks = [];

  //   while (iterate) {
  //     let responseRange = await acquirerBankInfoIterator.next();
  //     if (responseRange['value'] == null) {
  //       iterate = false;
  //     }
  //     else {
  //       let acquirerBankData = JSON.parse(responseRange.value.value.toString('utf8'));
  //       acquirerBanks.push(acquirerBankData);
  //     }
  //   }
  //   return JSON.stringify(acquirerBanks);
  // }


  // //==================== Get Merchant Acquirer Bank Information ====================\\
  // async getMerchantAcquirerBankInfo(ctx, acquirerBankData) {
  //   console.info("==================== Get Merchant Acquirer Bank Information ====================");
  //   console.log("Acquirer Bank Input Data --> ", acquirerBankData);
  //   acquirerBankData = JSON.parse(acquirerBankData);

  //   let abMID = acquirerBankData.Merchant_ID;
  //   let abID = acquirerBankData.Acquirer_Bank_ID;
  //   let Unique_Id = acquirerBankData.Unique_Id;
  //   console.info("==================== Get Acquirer Bank Info for Merchant $abMID ====================");
  //   let acquirerBankIndexKey = await ctx.stub.createCompositeKey(acquirerBankIndexName, [acquirerBankFirstKey, abID, abMID, Unique_Id]);
  //   let acquirerBankBytes = await ctx.stub.getState(acquirerBankIndexKey);
  //   if (!acquirerBankBytes.toString()) {
  //     throw new Error('Acquirer Bank for Merchant ' + abID + ' not found.');
  //   }
  //   return acquirerBankBytes.toString();
  // }

  // //==================== Get All Merchants of an Acquirer Bank ====================\\
  // async getAllMerchantsForAB(ctx, aqBankDetails) {
  //   console.info("==================== Get All Merchants for a particular Acquirer Bank ====================");
  //   console.log("Input", aqBankDetails);
  //   let abID = JSON.parse(aqBankDetails).Acquirer_Bank_ID;
  //   console.log("AB ID", abID);
  //   let merchantABInfoIterator = await ctx.stub.getStateByPartialCompositeKey(acquirerBankIndexName, [acquirerBankFirstKey, abID]);
  //   let iterate = true;
  //   let acquirerBankMerchants = [];

  //   while (iterate) {
  //     let responseRange = await merchantABInfoIterator.next();
  //     console.log("Response", responseRange);
  //     if (responseRange['value'] == null) {
  //       iterate = false;
  //     }
  //     else {
  //       let acquirerBankMerchant = JSON.parse(responseRange.value.value.toString('utf8'));
  //       acquirerBankMerchants.push(acquirerBankMerchant);
  //     }
  //   }
  //   console.log("Sending Result", acquirerBankMerchants);
  //   return JSON.stringify(acquirerBankMerchants);
  // }


  // //==================== Update Merchant Acquirer Bank Information ====================\\
  // async updateMerchantAB(ctx, acquirerBankData) {
  //   console.info("==================== Update Merchant Acquirer Bank Inoformation ====================");
  //   acquirerBankData = JSON.parse(acquirerBankData);
  //   console.log("After Parse -->", acquirerBankData);

  //   let Merchant_ID = acquirerBankData.Merchant_ID;
  //   let Acquirer_Bank_ID = acquirerBankData.Acquirer_Bank_ID;
  //   let Unique_Id = acquirerBankData.Unique_Id;
  //   let Action = acquirerBankData.Action;
  //   let Comparision_Result = acquirerBankData.Comparision_Result;
  //   let Comparision_Result_Hash = acquirerBankData.Comparision_Result_Hash;
  //   let Document_Status = acquirerBankData.Document_Status;

  //   console.log("Merchant_ID ", Merchant_ID);
  //   console.log("Acquirer_Bank_ID ", Acquirer_Bank_ID);

  //   let acquirerBankIndexKey = await ctx.stub.createCompositeKey(acquirerBankIndexName, [acquirerBankFirstKey, Acquirer_Bank_ID, Merchant_ID, Unique_Id]);
  //   let acquirerBankBytes = await ctx.stub.getState(acquirerBankIndexKey);
  //   let getMerchant = acquirerBankBytes.toString();
  //   getMerchant = JSON.parse(getMerchant);

  //   let merchantAB = AcquirerBank;
  //   console.log("getmarchent.Merchant_ID", getMerchant.Merchant_ID);

  //   if (Merchant_ID == getMerchant.Merchant_ID) {
  //     merchantAB.Acquirer_Bank_ID = getMerchant.Acquirer_Bank_ID;
  //     merchantAB.Merchant_ID = getMerchant.Merchant_ID;
  //     merchantAB.Unique_Id = getMerchant.Unique_Id;
  //     merchantAB.Merchant_Category_Code = getMerchant.Merchant_Category_Code;
  //     merchantAB.Action = Action;
  //     merchantAB.Time_Stamp = new Date();
  //     merchantAB.Comparision_Result = Comparision_Result;
  //     merchantAB.Comparision_Result_Hash = Comparision_Result_Hash;
  //     merchantAB.Document_Status = Document_Status;
  //     merchantAB.Merchant_Unique_Id = getMerchant.Merchant_Unique_Id;
  //     merchantAB.Primary_Bank_Unique_Id = getMerchant.Primary_Bank_Unique_Id;
  //     merchantAB.Verification_Agency_Unique_Id = getMerchant.Verification_Agency_Unique_Id;



  //     console.log("Update ", merchantAB);
  //     acquirerBankBytes = Buffer.from(JSON.stringify(merchantAB));
  //     acquirerBankIndexKey = await ctx.stub.createCompositeKey(acquirerBankIndexName, [acquirerBankFirstKey, Acquirer_Bank_ID, Merchant_ID, Unique_Id]);
  //     await ctx.stub.putState(acquirerBankIndexKey, acquirerBankBytes);
  //     return JSON.stringify(merchantAB);
  //   }
  // }


  // //>>>>>>>>>>>>>>>>>>UPDATE STATUS FOR ACQUIRER BANK<<<<<<<<<<<<<<<<<<<<<<<<<<<<\\ 
  // async updateStatusForAcquirerBank(ctx, aqBankDetails) {
  //   console.info("==================== Update Acquirer Bank Status ====================");
  //   console.log(aqBankDetails);

  //   aqBankDetails = JSON.parse(aqBankDetails);
  //   console.log("after parse ", aqBankDetails);

  //   let Action = aqBankDetails.Action;
  //   let Unique_Id = aqBankDetails.Unique_Id;
  //   let Merchant_ID = aqBankDetails.Merchant_ID;
  //   let Acquirer_Bank_ID = aqBankDetails.Acquirer_Bank_ID;
  //   let acquirerBankIndexKey = await ctx.stub.createCompositeKey(acquirerBankIndexName, [acquirerBankFirstKey, Acquirer_Bank_ID, Merchant_ID, Unique_Id]);

  //   let acquirerBank_bytes = await ctx.stub.getState(acquirerBankIndexKey);
  //   let acquirerBank = JSON.parse(acquirerBank_bytes.toString());

  //   if (Merchant_ID == acquirerBank.Merchant_ID) {
  //     acquirerBank.Action = Action;
  //     acquirerBank.Time_Stamp = new Date();
  //     console.log("update ", acquirerBank);

  //     let acquirerBankBytes = Buffer.from(JSON.stringify(acquirerBank));

  //     await ctx.stub.putState(acquirerBankIndexKey, acquirerBankBytes);

  //     return JSON.stringify(acquirerBank);
  //   }

  // }





}

module.exports = ChainCode;
