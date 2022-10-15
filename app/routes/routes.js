// var authentication = require('../../config/authentication');
//const keycloak = require('../../config/keycloak-config.js').getKeycloak();


function setUp(router, controllers) {
    
    //Organization
    router.post('/apis/v1/organizations', controllers.organizationController.signupOrganization);
    router.get('/apis/v1/organizations', controllers.organizationController.getAllOrganizations);

    //AadharCard
    router.post('/apis/v1/aadhar-cards',controllers.aadharCardController.addAadharCard);
    router.get('/apis/v1/aadhar-cards',controllers.aadharCardController.getAllAadharCards);
    router.get('/apis/v1/aadhar-cards/:aadharNumber',controllers.aadharCardController.getAadharCard);

    //PanCard
    router.post('/apis/v1/pan-cards',controllers.panCardController.addPanCard);
    router.get('/apis/v1/pan-cards',controllers.panCardController.getAllPanCards);
    router.get('/apis/v1/pan-cards/:panNumber',controllers.panCardController.getPanCard);

    //DrivingLicence
    router.post('/apis/v1/driving-licences',controllers.DLController.addDrivingLicence);
    router.get('/apis/v1/driving-licences',controllers.DLController.getAllDrivingLicences);
    router.get('/apis/v1/driving-licences/:DLNumber',controllers.DLController.getDrivingLicence);
    
    //Merchant
    router.post('/apis/v1/merchants',controllers.merchantController.addMerchant);
    router.put('/apis/v1/merchants/:panNumber',controllers.merchantController.updateMerchant);
    router.get('/apis/v1/merchants',controllers.merchantController.getAllMerchants);
    router.get('/apis/v1/merchants/:panNumber',controllers.merchantController.getMerchant);
    router.get('/apis/v1/merchants/:panNumber/:bankId',controllers.merchantController.getSingleMerchantKyc);
    router.delete('/apis/v1/merchants/:panNumber/:bankId',controllers.merchantController.deleteMerchant);
    

    }

module.exports.setUp = setUp;