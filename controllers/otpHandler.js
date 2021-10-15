
const otpHandler = (moNumber, otp, socket)=>{

    // moNumber if want send on mobile
    socket.emit("otp",   `Your otp is ${otp}, valid till 1 minutes`);
}

module.exports = otpHandler;