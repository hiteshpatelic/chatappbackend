const redis = require("redis")

const connectRedis = () =>{
    try{
        const client = redis.createClient(process.env.REDIS_URL)
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

