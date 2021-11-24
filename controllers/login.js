const responseHandler = require("../middleware/responseHandler");
const { loginInputValidation } = require('./validation');
const bcrypt = require('bcrypt');
const Users = require("../models/usersModel");
const jwt = require('jsonwebtoken');
const errorsHandler = require("../middleware/errorHandler");
require('dotenv').config();

const login = async(data, socket)=>{

    const { moNumber, password } = data;
    const eventName = "login"
    const {error} = loginInputValidation(data) 
    if(error) return responseHandler(socket, eventName, { message: error.details[0].message, error:0, });

    try{
        const getUser = await Users.findOne({moNumber});
        if(!getUser)  throw "userNotFound";
        
        if(getUser){
            if(!getUser.verified) throw "user_not_verified"
            const checkPassword = bcrypt.compareSync(password, getUser.password);
            if (!checkPassword) throw "passwordNotMach"
            const jsonToken = jwt.sign({
                id: getUser._id,
                username :getUser.username
              },  process.env.JWT_TOKEN, { expiresIn: 60*60 });

            return responseHandler(socket, eventName, {message: "login Successfully.",  error:0, token: jsonToken})
        }
    }catch(e){
        return errorsHandler(e, eventName, moNumber, socket)
    }
    
}

module.exports = login;