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

        let commonObjectForDataPush = {
            username, 
            id: findContact._id, 
            profilePicture:findContact.profilePicture, 
            number:Number(moNumber)
        }

        if(findSelfContact.contactList){
            const allreadyExistsContctList = findSelfContact.contactList.filter(e=> e.id === findContact._id.toHexString()|| e.username === "unKnown")
            if(allreadyExistsContctList[0] !== undefined) {
                if ( allreadyExistsContctList[0].username === "unKnown"){
                    allreadyExistsContctList[0].username = username
                    await Users.findOneAndUpdate( {_id: user.id, "contactList.id": allreadyExistsContctList[0].id}, {"contactList.$.username" : username})
                    return responseHandler(socket, eventName, { message: "Contact added successfully.", 
                     data: {...commonObjectForDataPush, _id:allreadyExistsContctList[0]._id ,roomId:allreadyExistsContctList[0].roomId} })

                }else{
                   throw "duplicate"
                }
            }
        }
        const findifRoomIsExist = await SingleRoom.findOne({
            $or: [
                {"room.users": {$all: [ [findSelfContact._id.toHexString(), findContact._id.toHexString()] ]} },
                {"room.users": {$all: [ [findContact._id.toHexString(), findSelfContact._id.toHexString() ] ]} } 
            ]
        });
        if(findifRoomIsExist) {
            await Users.findByIdAndUpdate( user.id, 
                {
                    $push:{
                        contactList:[ 
                            { ...commonObjectForDataPush, roomId: findifRoomIsExist._id }
                        ]
                    }
                } );
            await Users.findByIdAndUpdate( findContact._id.toHexString(), {$push:{contactList:[ { 
                id: findSelfContact._id, 
                profilePicture:findSelfContact.profilePicture, 
                number:findSelfContact.moNumber,
                roomId:findifRoomIsExist._id,
                username: "unKnown"

            }]}})
            return responseHandler(socket, eventName, { message: "Contact added successfully.",  data: {...commonObjectForDataPush, _id:findifRoomIsExist._id, roomId: findifRoomIsExist._id} })
        }  
        // * create room bitween two user 
        if(!findifRoomIsExist) {
            const roomId = await SingleRoom.create({
                room:{
                    users:[findSelfContact._id.toHexString(), findContact._id.toHexString() ],
                }
            })
            await Users.findByIdAndUpdate( user.id, {$push:{contactList:[ { ...commonObjectForDataPush,roomId:roomId._id }]}} );
            await Users.findByIdAndUpdate( findContact._id.toHexString(), {$push:{contactList:[ { 
                id: findSelfContact._id, 
                profilePicture:findSelfContact.profilePicture, 
                number:findSelfContact.moNumber,
                roomId:roomId._id,
                username: "unKnown"

            }]}})
            return responseHandler(socket, eventName, { message: "Contact added successfully.",  data: {...commonObjectForDataPush, _id:roomId._id ,roomId:roomId._id} })
        } 
                 
        
    }catch(e){
        console.log(e);
        return errorsHandler(e, eventName, user.id, socket);
    }
}

module.exports = addContact;