const { socketIo } = require("../io/io");
const errorsHandler = require("../middleware/errorHandler");
const responseHandler = require("../middleware/responseHandler");
const SingleRoom = require("../models/singleRoomModel");
const { roomIdValidation, sendMessageInputValidation } = require("./validation");

const sendMessage = async (data, decode, socket)=>{

    const {roomId, message} = data
    const {user} = decode;
    const eventName = "sendMessage"

    try{
        const idValid = roomIdValidation(roomId)
        if(!idValid) throw "roomId_is_invalid"

        const {error} = sendMessageInputValidation({message})
        if(error) return responseHandler(socket, eventName, { message: error.details[0].message, success : false });

        const messageFormate = {
            sender: user.id,
            message,
            status:"sent"
        }
        const result = await SingleRoom.findByIdAndUpdate(roomId, {$push:{"room.messages":[messageFormate]}} )

        // * add socket here

        socket.to(roomId).emit("privateMessage", {messageFormate, roomId});
        if(result) return responseHandler(socket, eventName, { message: "Message sent successfully.",  });

    }catch(e){
        console.log(e);
        return errorsHandler(e, eventName, user._id, socket)
    }
    
}

module.exports = {
    sendMessage
}