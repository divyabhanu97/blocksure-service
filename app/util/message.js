const twilio = require('twilio');

let accountSid = 'AC22d982af95f94272ad4a109d8d779a04';
let authToken = '2e8f78e35e7a93a01f90d38994daf230';

const twilioClient = new twilio(accountSid, authToken);

const Message = {
    sendMessage: sendMessage
};

function sendMessage(vkycileNumber, message) {
    return new Promise((resolve, reject) => {
        // resolve("message sent");
        twilioClient.messages.create({
            body: message,
            to: '+91' + vkycileNumber,  // Text this number
            from: '+15702730909' // From a valid Twilio number
        }, function (err, data) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else resolve("message Sent to",vkycileNumber);
            
        });
    });
}

module.exports = Message;