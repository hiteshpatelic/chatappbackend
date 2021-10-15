const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SingleRoom = new Schema(
    {
        room:{
            users : [],
            messages :[
                {
                    sender: {type:String},
                    message:{type:String},
                    status:{type:String},
                    created_date: Date
                }
            ]
        }
    }
)

module.exports = mongoose.model('SingleRoom', SingleRoom);