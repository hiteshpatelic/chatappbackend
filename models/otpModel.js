const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OTP = new Schema({
    otp: {type:Number, required:true},
    moNumber:{type:String, required:true},
    fromWhere: {type:String, required:true},
    expireAt: {
        type: Date,
        default: Date.now,
        index: { "expireAfterSeconds" : 35 },
    }
})

module.exports = mongoose.model('OTP', OTP)