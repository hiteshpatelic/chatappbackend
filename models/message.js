const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Message = new Schema({
    sender: {type:String, required:true},
    message:{type:String, required:true},
    status: {type:String, enum : ['sent','read'], default: 'sent'}
}, {
    timestamps: true
})

module.exports = mongoose.model('Message', Message)