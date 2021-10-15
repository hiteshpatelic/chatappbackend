const {default : models} = require('../models/index');

exports.getMobileNumber = async (model, id)=>{
   return await modules[model].findByID(id).select('moNumber');
}