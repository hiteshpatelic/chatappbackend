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
            const allreadyExistsContctList = findSelfContact.contactList.filter(e=> Number(e.moNumber) === Number(moNumber))
            if(allreadyExistsContctList[0] !== undefined) throw "duplicate"
        }

        // * store in contact in user contactList 
        const addContact = await Users.findByIdAndUpdate( user.id, {$push:{contactList:[ { username, moNumber }]}} ).select('moNumber');
        if(addContact) {
            const findifRoomIsExist = await SingleRoom.findOne({
                $or: [
                    {"room.users": {$all: [ [addContact.moNumber, moNumber ] ]} },
                    {"room.users": {$all: [ [moNumber, addContact.moNumber ] ]} } 
                ]
            });
            // * create room bitween two user 
            if(!findifRoomIsExist) {
                await SingleRoom.create({
                    room:{
                        users:[addContact.moNumber, moNumber ],
                    }
                })
            } 
            return responseHandler(socket, eventName, { message: "Contact added successfully.",  success : true })
        }
    }catch(e){
        return errorsHandler(e, eventName, user.id, socket);
    }
}

module.exports = addContact;