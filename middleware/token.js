const jwt = require('jsonwebtoken');
const { tokenDataValidation } = require('../controllers/validation');
require('dotenv').config()


const tokenValidator = (token)=>{

    try {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        if(decoded) {

            const {error} = tokenDataValidation(decoded)
            if(error) return { error: "Token data invalid, Please login again", user: undefined }

            return { user: decoded }
        }
         
    } catch(err) {
        if(err.message === "jwt expired") return { error: "Token expired, Please login again", user: undefined }
        return { error: "Invalid token, Unauthorised Access!", user: undefined }
    }
}
module.exports = tokenValidator;