const {default : models} = require('../models/index');

exports.getMobileNumber = async (model, id)=>{
   return await models[model].findById(id).select('moNumber');
}

exports.getUserProfile = async (model, id)=>{
   return await models[model].findById(id).select(['moNumber', "username", 'contactList', "groupList", "profilePicture"  ]);
}

