const responseHandler = require("../middleware/responseHandler");
const Users = require('../models/usersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {registerInputValidation, verifyRegisterOtpInputValidation} = require('./validation');
const OTP = require("../models/otpModel");
const otpHandler = require("./otpHandler");
const errorsHandler = require("../middleware/errorHandler");
const tokenValidator = require("../middleware/token");
const uploadFile = require("./uploadfile");


const register = async (data, socket)=>{

    const { username, moNumber, password, profilePicture } = data;
    const eventName = "register"
    const {error} = registerInputValidation(data)
    if(error) return responseHandler(socket, eventName, { message: error.details[0].message, error : 1 });
 
    try{
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const user = new Users({username, moNumber, password:hash})
        const data = await uploadFile(profilePicture, user._id)
                
        user.profilePicture = data.link
        const result = await user.save()
        const genreateOTP = new OTP({
            otp: Math.floor(100000 + Math.random() * 900000), moNumber:user._id.toHexString(), fromWhere : "register"
        })
        const otp =await genreateOTP.save()
        const jsonToken = jwt.sign({
            id: user._id,
            username : username
          },  process.env.JWT_TOKEN, { expiresIn: 60*60 });

        otpHandler(moNumber, otp.otp, socket)
        if(result && otp) return responseHandler(socket, eventName,  { message:"Otp sent succsessfully, Please verify your number", error : 0, token: jsonToken})
        
    }catch(e){
        if(e.message.indexOf("E11000") === 0){
            // * E11000 is duplicate error key
            // * crash when found duplicate key 
            return errorsHandler( "E11000", eventName, moNumber, socket)
        }
        return errorsHandler( e, eventName, moNumber, socket)
    }
}

const verifyRegisterWithOTP = async(data, socket)=>{

    const { token, otp } = data;
    const eventName = "verifyRegisterWithOTP"
    
    const {error, user} = tokenValidator(token)
    if(error) {
        errorsHandler(error.error, eventName, "token", socket)
        return responseHandler(socket, eventName, { message: error });
    }

    try{
        const {error} = verifyRegisterOtpInputValidation(data)
        if(error) return responseHandler(socket, eventName, { message: error.details[0].message, success : false });
    
        const findUser = await Users.findById(user.id);
        if(!findUser) throw "not_regiterd_user"
        if(findUser.verified) throw "user_already_verified"

        const getOtp = await OTP.findOne({otp, moNumber: user.id, fromWhere : "register"})
        if(!getOtp) throw "otp_expired";

        const updateUserVerifiedField = await  Users.findByIdAndUpdate(user.id,{verified: true})
        if(!updateUserVerifiedField) throw "not_verified"

        await OTP.findOneAndDelete({moNumber: user.id, otp});
        return responseHandler(socket, eventName, {message: "Verified succsessfully..."})

    }catch(e){
        return errorsHandler( e, eventName, user.id, socket)
    }
}

const resendRegisterVerifiedOTP = async(data, socket) =>{
    
    const { number : moNumber } = data;
    const eventName = "resendRegisterVerifiedOTP"
    try{


        if(moNumber<10 && moNumber>10) throw "invalid_number"
        const findUser = await Users.findOne({moNumber});

        if(!findUser) throw "not_regiterd_user"
        if(findUser.verified) throw "user_already_verified"

        const findOldOtp = await OTP.findOne({moNumber, fromWhere : "register"});
        // *  add message if want message already sented!!!!!
        if(findOldOtp) return otpHandler(moNumber, findOldOtp.otp, socket)

        const genreateOTP = new OTP({
            otp: Math.floor(100000 + Math.random() * 900000), moNumber, fromWhere : "register"
        })
        const otp = await genreateOTP.save()
        otpHandler(moNumber, otp.otp, socket)

        return responseHandler(socket, "resendRegisterVerifiedOTP",  { message:"Otp sent succsessfully, Please check on your mobile number", })

    }catch(e){
        return errorsHandler( e, eventName, moNumber, socket)
    }

}

module.exports = {
    register,
    verifyRegisterWithOTP,
    resendRegisterVerifiedOTP
}