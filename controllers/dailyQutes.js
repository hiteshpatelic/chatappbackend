const { default: axios } = require("axios");
const responseHandler = require("../middleware/responseHandler");

exports.getTodayQuotes = async(socket) =>{
    const quote = await axios
    .get("https://zenquotes.io/api/today")

    if(quote)return responseHandler(socket, "getTodayQuotes", { message: quote.data[0].q, author: quote.data[0].a })
}