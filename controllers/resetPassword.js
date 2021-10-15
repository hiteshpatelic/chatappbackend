const otpHandler = require("./otpHandler");
const responseHandler = require("../middleware/responseHandler");
const OTP = require("../models/otpModel");
const Users = require('../models/usersModel');
const bcrypt = require('bcrypt');
const { setNewPasswordInputValidation } = require("./validation");
const errorsHandler = require("../middleware/errorHandler");
const jwt = require('jsonwebtoken');



const resetPassword = async(data, socket)=>{

    const { moNumber } = data;
    const eventName = "resetPassword"
    try{
        if(moNumber<10 && moNumber>10) throw "invalid_number"
        const findUser = await Users.findOne({moNumber}).select({'moNumber':1, "username":1})
        console.log(findUser);
        if(!findUser) throw "not_regiterd_user"

        const jsonToken = jwt.sign({
            id: findUser._id.toHexString(),
            username : findUser.username
          },  process.env.JWT_TOKEN, { expiresIn: 60*60 });

          console.log(findUser);
        const findOldOtp = await OTP.findOne({moNumber, fromWhere : eventName});
        if(findOldOtp){
            // return otpHandler(moNumber, findOldOtp.otp, socket)
            throw "otp_alredy_sented"
        } 

        const genreateOTP = new OTP({
            otp: Math.floor(100000 + Math.random() * 900000), moNumber: findUser._id, fromWhere : eventName
        })
        const otp = await genreateOTP.save()

        // * add otp is send on your mobile number, response
        // otpHandler(moNumber, otp.otp, socket)
       
        return responseHandler(socket, eventName, {message: "OTP sent succsessfully.", token:jsonToken})
    }catch(e){
        return errorsHandler(e, eventName, moNumber, socket)
    }
}

const setNewPassword = async(data, decode, socket)=>{

    const {otp, password } = data;
    const {user} = decode;

    const eventName = "setNewPassword"
    try{
        const {error} = setNewPasswordInputValidation(data)
        if(error) return responseHandler(socket, eventName, { message: error.details[0].message });

        const getOtp = await OTP.findOne({otp, moNumber:user.id, fromWhere : "resetPassword"})
        if(!getOtp) throw "otp_expired";

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const updateUserPassword = await  Users.findByIdAndUpdate(user.id,{password: hash})
        
        await OTP.findOneAndDelete({moNumber:user.id, otp});
        if(!updateUserPassword) throw "password_not_change"
        return responseHandler(socket, eventName, {message: "Password changed succsessfully."})

    }catch(e){
        console.log(e);
        return errorsHandler(e, eventName, user.id, socket)
    }
}

module.exports = {
    resetPassword,
    setNewPassword
}