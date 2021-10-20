const { getUserProfile } = require("../common/dbquery");
const errorsHandler = require("../middleware/errorHandler");
const responseHandler = require("../middleware/responseHandler");
const {Image} = require("../models/index").default;
const { roomIdValidation } = require("./validation");


const getUserProfileInfo = async (decode, socket) =>{

    const {user} = decode;
    const eventName = "getUserProfileInfo"

    try{
        const id = roomIdValidation(user.id)
        if(!id) throw "userNotFound";

        if(id) {
            const userinfo = await getUserProfile("User", user.id);
            if(!userinfo) throw "userNotFound"
            if(userinfo)return responseHandler(socket, eventName, userinfo )
        }

    }catch(e){
        return errorsHandler(e, eventName, user.id, socket)
    }
}

module.exports = getUserProfileInfo;