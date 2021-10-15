
const mongoose = require("mongoose");
require('dotenv').config()

const connectDB = ()=>{

  const db = process.env.MONGO_URI
  
  mongoose.connect( db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log("💻 Mondodb Connected"))
  .catch(err => console.error(err));
    
}
module.exports = connectDB;