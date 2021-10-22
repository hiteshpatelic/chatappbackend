const mongoose = require('mongoose');


const ContactList = {
    username:{type:String, required: true, min:3, max:15},
    id:{type:String, required: true},
    profilePicture:{type:String, required: true},
    roomId:{type:String, required: true}
}

const GroupList = {
    groupname:{type:String, required: true, min:3, max:15},
    groupId:{type:String, required: true}
}

const Users = new mongoose.Schema(
    {
        username: {type:String, required: true, min:3, max:15},
        moNumber: {type: Number,  required: true,  unique: true },
        password: {type:String, required: true, min:8, max:20 },
        verified: {type:Boolean, default:false},
        contactList : [ContactList], 
        groupList : [GroupList],
        profilePicture: {type:String, required: true }
    }
)

module.exports = mongoose.model('Users', Users)