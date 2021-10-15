const responseHandler = require("./responseHandler")
const { createLogger, format, transports } = require('winston');
const ErrorLogs = require("../models/logs/log");
const { combine, timestamp, printf } = format;
require('winston-mongodb');


const myFormat = printf(({ message, eventName, moNumber, timestamp }) => {
    return `${timestamp} [${moNumber}] [${eventName}] : ${message}`;
});

const logger = createLogger({
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.File({
            filename: 'errors.log',
            level: 'error'
        }),
        // new transports.MongoDB({ 
        //     db: process.env.MONGO_URI, 
        //     collection: 'log',
        //     level : 'debug',
        // })
    ]
})

const errorsHandler = async (e, eventName, moNumber, socket) =>{
    
    const error = { eventName, moNumber, message: e} 
    try{
        await ErrorLogs.create({
            userInfo: moNumber,
            fromWhere: eventName,
            error: e
        })
        logger.error(error);
    }catch(er){
        return responseHandler(socket, eventName, { message: "Somthing went wrong, Please try again" });
    }
    
    if(e === "E11000") return responseHandler(socket, eventName, { message: "Mobile number alredy exist, Please use another number!", error:1});
    if(e === "invalid_number") return responseHandler(socket, eventName, {message: "Enter correct 10 digit mobile number", error:1})
    if(e === "user_already_verified")  return responseHandler(socket, eventName, {message: "Mobile number is already verified, Please Login.", error:1})
    if(e === "otp_expired") return responseHandler(socket, eventName, {message: "Your otp is expired Or invalid, Please resend", error:1})
    if(e === "not_verified") return responseHandler(socket, eventName, {message: "Verification Failed, Please try again", error:1})
    if(e === 'not_regiterd_user') return responseHandler(socket, eventName, {message: "Number is not registerd, Please register first", error:1})
    if(e === "number_is_Not_Using_Service") return responseHandler(socket, eventName, { message: "User is not on chat app , send invitaion to him", error:1 })
    if(e === "self") return responseHandler(socket, eventName, { message: "Please do not add self contact.", error:1 })
    if(e === "duplicate") return responseHandler(socket, eventName, { message: "Contact alredy exists", error:1 })
    if(e === "userNotFound") return responseHandler(socket, eventName, {message: "Mobile number dose not exist, Please register first.", error:1})
    if(e === "user_not_verified") return responseHandler(socket, eventName, {message: "Mobile number is not verified, Please verified first", error:1})
    if(e === "passwordNotMach") return responseHandler(socket, eventName, {message: "Password dose not match, Please enter correct password.", error:1})
    if(e === "password_not_change") return responseHandler(socket, eventName, {message: "Password not changed, Please try again", error:1})
    if(e === "invalid_roomId") return responseHandler(socket, eventName, {message: "Room not found, Make sure your reciver contact detail is right", error:1})
    if(e === "given_number_is_invalid") return responseHandler(socket, eventName, {message: "Please check both mobile number & try again", error:1})
    if(e === "roomId_is_invalid") return responseHandler(socket, eventName, {message: "RoomId is Invalid!", error:1})
    if(e === "room_leaved_failed") return responseHandler(socket, eventName, {message: "Room Leaving failed, Invalid Room", error:1})
    if(e === "otp_alredy_sented") return responseHandler(socket, eventName, {message: "OTP already sended, Please check on mobile.", error:1})

    if(e) return responseHandler(socket, eventName, { message: "Somthing went wrong, Please try again", error:1 });
    
}

module.exports = errorsHandler