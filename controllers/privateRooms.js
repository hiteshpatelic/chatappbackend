const errorsHandler = require('../middleware/errorHandler');
const responseHandler = require('../middleware/responseHandler');
const SingleRoom = require('../models/singleRoomModel');
const { roomIdValidation, joinPrivateInputValidation } = require('./validation');

const joinPrivateRoom = async (data, decode, socket) =>{

    const eventName = "joinPrivateRoom"
    const {user} = decode
    try{
        socket.join(data)
    }catch(e){
        console.log(e);
        return errorsHandler(e, eventName, user.id, socket)
    }
}

const leaveRoom = async (data, decode, socket) =>{

    const {roomId} = data
    const {user} = decode;
    const eventName = "leaveRoom"
    
    try{
        const idValid = roomIdValidation(roomId)
        if(!idValid) throw "roomId_is_invalid"

        const findRoom  = await SingleRoom.findById(roomId);
        if(!findRoom) throw  "room_leaved_failed"

        if(findRoom){
            socket.leave(roomId)
            return responseHandler(socket, eventName, { message: "room leaved successfully"})
        }
    
    }catch(e){
        return errorsHandler(e, eventName, user.id, socket)
    }
}


module.exports = {
    joinPrivateRoom,
    leaveRoom
}