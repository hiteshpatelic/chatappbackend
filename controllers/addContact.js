const responseHandler = require("../middleware/responseHandler");
const Users = require('../models/usersModel.js');
const SingleRoom = require('../models/singleRoomModel.js');
const errorsHandler = require('../middleware/errorHandler.js');
const { addContactInputValidation } = require("./validation");



const addContact = async (data, decode, socket)=>{

    const {username, moNumber} = data
    const eventName = "addContact"
    const {user} = decode;

    try{

        const {error} = addContactInputValidation(data)
        if(error) return responseHandler(socket, eventName, { message: error.details[0].message, success : false });

        const findContact = await Users.findOne({moNumber:Number(moNumber)})
        if(!findContact) throw "number_is_Not_Using_Service"

        const findSelfContact = await Users.findById( user.id );
        if(findSelfContact.moNumber === Number(moNumber)) throw "self"

        if(findSelfContact.contactList){
            const allreadyExistsContctList = findSelfContact.contactList.filter(e=> e.id === findContact._id.toHexString())
            if(allreadyExistsContctList[0] !== undefined) throw "duplicate"
        }
        
        const findifRoomIsExist = await SingleRoom.findOne({
            $or: [
                {"room.users": {$all: [ [findSelfContact.moNumber, Number(moNumber) ] ]} },
                {"room.users": {$all: [ [Number(moNumber), findSelfContact.moNumber ] ]} } 
            ]
        });
        
        if(findifRoomIsExist) {
            await Users.findByIdAndUpdate( user.id, {$push:{contactList:[ { username, id: findContact._id, profilePicture:findContact.profilePicture, roomId: findifRoomIsExist._id }]}} ).select('moNumber');
            return responseHandler(socket, eventName, { message: "Contact added successfully.",  success : true })
        }  
        // * create room bitween two user 
        if(!findifRoomIsExist) {
            const getRoomid= await SingleRoom.create({
                room:{
                    users:[findSelfContact.moNumber, Number(moNumber) ],
                }
            })
            await Users.findByIdAndUpdate( user.id, {$push:{contactList:[ { username, id: findContact._id, profilePicture:findContact.profilePicture, roomId: getRoomid._id }]}} ).select('moNumber');
            return responseHandler(socket, eventName, { message: "Contact added successfully.",  success : true })
        } 
                 
        
    }catch(e){
        return errorsHandler(e, eventName, user.id, socket);
    }
}

module.exports = addContact;