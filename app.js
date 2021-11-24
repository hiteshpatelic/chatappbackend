const express = require("express");
const winston = require("winston");
const {connectRedis} = require('./redis/redis');
const app = express();
const server = require('http').createServer(app)
require('dotenv').config();
require('./config/db')();
const {socketIo} = require('./io/io');
const requestHandler = require("./middleware/requestHandler");
app.use(express.json());
require('winston-mongodb');
connectRedis();


winston.exceptions.handle(new winston.transports.MongoDB({ db: process.env.MONGO_URI, collection: 'criticalError',level : 'debug' }))

app.get("/", (req, res) => {
  res.send("Server working 🔥");
});

const io = socketIo(server, { cors: { origin: "*" } });

io.on("connection", socket => {
    socket.on("req", body => {

      global.io =io 
      requestHandler(body, socket, io);
    });
    socket.on("disconnect", () => {
      // try{
      //   rClient.flushdb( function (err, succeeded) {
      //     console.log(succeeded); // will be true if successfull
      //   }); 
      // }catch(e){
      //   console.log(e);
      // }
    });
    
});

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`Server running on port : ${port} 🔥`));