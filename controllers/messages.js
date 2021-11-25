const { Iot } = require("aws-sdk");
const errorsHandler = require("../middleware/errorHandler");
const responseHandler = require("../middleware/responseHandler");
const SingleRoom = require("../models/singleRoomModel");
const { setValueInKey, getValueFromKey } = require("../redis/utils");
const {
  roomIdValidation,
  sendMessageInputValidation,
} = require("./validation");

const sendMessage = async (data, decode, socket, io) => {
  const { roomId, message } = data;
  const { user } = decode;
  const eventName = "sendMessage";

  try {
    const idValid = roomIdValidation(roomId);
    if (!idValid) throw "roomId_is_invalid";

    const { error } = sendMessageInputValidation({ message });
    if (error)
      return responseHandler(socket, eventName, {
        message: error.details[0].message,
        success: false,
      });

    const messageFormate = {
      sender: user.id,
      message,
      status: "sent",
    };

    // ! check user is partner in room or not
    
    const result = await SingleRoom.findByIdAndUpdate(roomId, {
      $push: { "room.messages": [messageFormate] },
    });

    // * add socket here
    var rooms = io.sockets.adapter.rooms;
    // let knowMemberOfList = true
    // if (rooms) {
    //     rooms.forEach(function(values, index) {
    //       console.log(index, values);
            
    //         if(index === roomId){
    //             values.forEach((value, index)=>{
    //                 socket.to(`${value}`).emit("res", {
    //                   eventName: "newMessage",
    //                   data: { messageFormate },
    //                 });
    //                 if(socket.id === value){
    //                     knowMemberOfList = true
    //                 }else{
    //                     console.log('you are not member of this room');
    //                 }
    //             })
    //         }else{
    //             console.log('no Room Found');
    //         }
    //       })    
    // }
    if(result){  
      socket.to(`${roomId}`).emit("res", {
        eventName: "newMessage",
        data: { messageFormate },
      });
    }

  } catch (e) {
    return errorsHandler(e, eventName, user._id, socket);
  }
};

const getChatHistotyById = async (data, decode, socket) => {
  const { id, roomId } = data;
  const { user } = decode;
  const eventName = "getChatHistotyById";

  try {
    const idValid = roomIdValidation(id);
    if (!idValid) throw "userNotFound";
    const getChatFromRedis = await getValueFromKey (roomId);
    if (getChatFromRedis) return responseHandler(socket, eventName, getChatFromRedis);

    const result = await SingleRoom.findById(roomId).select("room.messages");
    await setValueInKey(result._id.toHexString(), result)
    if (!result) throw "e";
    return responseHandler(socket, eventName, result);
  } catch (e) {
    
    return errorsHandler(e, eventName, user._id, socket);
  }
};

module.exports = {
  sendMessage,
  getChatHistotyById,
};
