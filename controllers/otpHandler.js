
const otpHandler = (moNumber, otp, token,  socket)=>{
    // moNumber if want send on mobile
    io.to(socket.id).emit("res", {eventName: "otp", data: {msg :`Your otp is ${otp}, valid till 1 minutes`, token}});
}

module.exports = otpHandler;