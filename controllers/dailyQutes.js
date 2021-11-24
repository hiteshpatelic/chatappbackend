const { default: axios } = require("axios");
const responseHandler = require("../middleware/responseHandler");
const { setMultipleValueInList, getAllValueFromList } = require("../redis/utils");

exports.getTodayQuotes = async(socket) =>{

    const getChatFromRedis = await getAllValueFromList("quote");
    if(getChatFromRedis[0])return responseHandler(socket, "getTodayQuotes", { message: getChatFromRedis[0], author: getChatFromRedis[1] })

    const quote = await axios
    .get("https://zenquotes.io/api/today")
    await setMultipleValueInList("quote", [quote.data[0].q, quote.data[0].a])

    if(quote)return responseHandler(socket, "getTodayQuotes", { message: quote.data[0].q, author: quote.data[0].a })
}