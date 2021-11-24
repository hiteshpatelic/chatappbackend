

const responseHandler = (socket, eventName, data,)=>{
    return io.to(socket.id).emit("res", {eventName, data});
}

module.exports = responseHandler;