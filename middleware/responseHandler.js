

const responseHandler = (socket, eventName, data)=>{
    return socket.emit("res", {eventName, data});
}

module.exports = responseHandler;