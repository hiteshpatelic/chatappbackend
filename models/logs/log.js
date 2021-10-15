
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Mixed = mongoose.Schema.Types.Mixed;

const ErrorLogs = Schema({
    userInfo: {type:String, require:true},
    fromWhere : {type:String, require:true},
    error: { type: Mixed, require:true},
    date: { type: Date, index: { expires: '3d' }}
}, { timestamps: { createdAt: 'created_at' } })

module.exports =  mongoose.model("Logs", ErrorLogs)