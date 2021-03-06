const { Iot } = require("aws-sdk");
const errorsHandler = require("../middleware/errorHandler");
const responseHandler = require("../middleware/responseHandler");
const SingleRoom = require("../models/singleRoomModel");
const Message = require("../models/message");
const { setValueInKey, getValueFromKey, setMultipleValueInList, setSingleValueInList, getAllValueFromList } = require("../redis/utils");
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

      const messageData = new Message({
        sender: user.id,
        message,
        status: "sent",
      })
    
    // ! check user is partner in room or not
    
    const result = await SingleRoom.findByIdAndUpdate(roomId, {
      $push: { "room.messages": [messageData] },
    });

    await setSingleValueInList(roomId, JSON.stringify(messageData))
    // * add socket here
    var rooms = io.sockets.adapter.rooms;
    let knowMemberOfList
    if (rooms) {
      rooms.forEach(function(values, index) {
        if(index === roomId){
            values.forEach((value, index)=>{
                if(socket.id === value){
                    knowMemberOfList = true
                }else{
                    console.log('you are not member of this room');
                }
            })
        }
      })    
    }
    if(result && knowMemberOfList ){  
      socket.to(`${roomId}`).emit("res", {
        eventName: "newMessage",
        data: { messageFormate: {...messageData._doc, roomId} },
      });
    }

  } catch (e) {
    console.log(e);
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
    const getChatFromRedis = await getAllValueFromList (roomId);
   
    if (getChatFromRedis[0]){
      const resposeObj = {
        room: {
          messages: getChatFromRedis.map((message)=>JSON.parse(message))
        },
        _id : roomId
      }
      return responseHandler(socket, eventName, resposeObj);
    } 

    const result = await SingleRoom.findById(roomId).select("room.messages");

    result.room.messages.forEach(async (messgae) => {
      await setSingleValueInList(roomId, JSON.stringify(messgae))
    });

    if (!result) throw "e";
    return responseHandler(socket, eventName, result);
  } catch (e) {
    console.log(e);
    return errorsHandler(e, eventName, user._id, socket);
  }
};

module.exports = {
  sendMessage,
  getChatHistotyById,
};
