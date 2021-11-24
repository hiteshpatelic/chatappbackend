const redis = require("redis")

const connectRedis = () =>{
    try{
        const client = redis.createClient({
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT)
          })
        client.on("connect", () => {
            global.rClient = client
            console.log("Connected To Redis...");
        });
        client.on("error", function(error) {
            console.error("[Redis] connection error:", error);
        });
    }catch(e){
        console.log(e);
    }
}

module.exports = {
    connectRedis
}

