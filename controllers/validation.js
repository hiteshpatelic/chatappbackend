const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const mongoose = require('mongoose');


    const mobileNumberLengthErrorHandler = ()=>{
        return {
            error: {
                details:[
                    {
                        message: "Mobile number must be 10 digits"
                    }
                ]
            }
        }
    }

const complexPasswordErrorHandler = ()=>{
    return {
        error: {
            details:[
                {
                    message: "Password must contain one upercase letter one lowercase letter one number and one symbol, also min 8 character, Exapmle B$[8wMkN"
                }
            ]
        }
    }
}

const registerInputValidation = (data)=>{

    const schema = Joi.object({
        username: Joi.string().min(3).required(),
        moNumber: Joi.number().integer().min(1111111111).max(9999999999).required(),
        password: Joi.string().required()
    })
    const {error} = passwordComplexity().validate(data.password);
    if(error) return complexPasswordErrorHandler()

    const result = schema.validate(data)
    if(result.error && result.error.details[0].context.key === "moNumber"){
        return mobileNumberLengthErrorHandler()
    }
    return result
}

const verifyRegisterOtpInputValidation = (data) =>{
    return Joi.object({
        otp:Joi.number().integer().min(100000).max(999999).required()
    }).unknown().validate(data);
}

const loginInputValidation = (data) =>{

    const schema = Joi.object({
        moNumber: Joi.number().integer().min(1111111111).max(9999999999).required(),
        password: Joi.string().required()
    })

    const {error} = passwordComplexity().validate(data.password);
    if(error) return complexPasswordErrorHandler()
    
    const result = schema.validate(data)
    if(result.error && result.error.details[0].context.key === "moNumber"){
        return mobileNumberLengthErrorHandler()
    }
    return result
}

const setNewPasswordInputValidation = (data)=>{
    const schema = Joi.object({
        otp:Joi.number().integer().min(100000).max(999999).required(),
        password: Joi.string().required()
    })

    const {error} = passwordComplexity().validate(data.newPassword);
    if(error) return complexPasswordErrorHandler()

    const result = schema.validate(data)
    return result
}

const tokenDataValidation = (data) =>{
    
    return Joi.object({
        id: Joi.string().required(),
        username: Joi.string().required(),
        iat: Joi.number().required(),
        exp: Joi.number().required()
    }).validate(data)
}

const joinPrivateInputValidation = (data) =>{

    return Joi.object({
        userNumber : Joi.number().integer().min(1111111111).max(9999999999).required(),
        reciverNumber: Joi.number().integer().min(1111111111).max(9999999999).required()
    }).validate(data);
}

const roomIdValidation = (data) =>{
    return mongoose.Types.ObjectId.isValid(data);
}

const addContactInputValidation = (data) =>{
    const schema = Joi.object({
        username: Joi.string().required().min(3),
        moNumber: Joi.number().integer().min(1111111111).max(9999999999).required(),
    })
    const result = schema.validate(data)
    if(result.error && result.error.details[0].context.key === "moNumber"){
        return mobileNumberLengthErrorHandler()
    }
    return result

}

const sendMessageInputValidation  =(data) =>{
    return Joi.object({
        message : Joi.string().required().min(1)
    }).validate(data)
}

module.exports = {
    registerInputValidation,
    loginInputValidation,
    setNewPasswordInputValidation,
    verifyRegisterOtpInputValidation,
    tokenDataValidation,
    joinPrivateInputValidation,
    roomIdValidation,
    addContactInputValidation,
    sendMessageInputValidation
}