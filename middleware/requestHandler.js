const addContact = require("../controllers/addContact");
const { getTodayQuotes } = require("../controllers/dailyQutes");
const getUserProfileInfo = require("../controllers/getUserProfileInfo");
const login = require("../controllers/login");
const { sendMessage, getChatHistotyById } = require("../controllers/messages");
const { joinPrivateRoom, leaveRoom } = require("../controllers/privateRooms");
const {register, verifyRegisterWithOTP, resendRegisterVerifiedOTP, } = require("../controllers/register");
const { resetPassword, setNewPassword } = require("../controllers/resetPassword");
const errorsHandler = require("./errorHandler");
const responseHandler = require("./responseHandler");
const tokenValidator = require("./token");



const requestHandler = (body, socket)=>{

    try{
        body = typeof(body) === "string" ? JSON.parse(body):body
    }catch(e){
        return responseHandler(socket, "req", { message: 'request data invalid' })
    }
    
    const {eventName, data, token} = body
    
    let decode;
    if(token) {
        decode = tokenValidator(token)
        const {error} = decode
        if(error) {
            errorsHandler(error.error, eventName, "token", socket)
            return responseHandler(socket, eventName, { message: error , error:1});
        }
    }

    switch (eventName){

        case "register":
            register(data, socket);
            break;

        case "verifyRegisterWithOTP":
            verifyRegisterWithOTP(data, socket)
            break;

        case "resendRegisterVerifiedOTP":
            resendRegisterVerifiedOTP(data, socket)
            break;

        case "login":
            login(data, socket);
            break;

        case "resetPassword":
            resetPassword(data, socket)
            break;

        case "setNewPassword":
            setNewPassword(data, decode, socket)
            break;

        case "addContact":
            addContact(data, decode, socket)
            break;
    
        case "joinPrivateRoom":
            joinPrivateRoom(data, decode, socket)
            break;

        case "leaveRoom":
            leaveRoom(data, decode, socket)
            break;
               
        case "sendMessage":
            sendMessage(data, decode, socket)
            break;
        
        case "getChatHistotyById":
            getChatHistotyById(data, decode, socket)
            break;
           
        case "getTodayQuotes":
            getTodayQuotes(socket)
            break;

        case "getUserProfileInfo":
            getUserProfileInfo(decode, socket)
            break;

        default:
            responseHandler(socket, "req", { message: 'Please send valid request' })
            break;
    }
}

module.exports = requestHandler;