
const getValueFromKey = (key) =>
    new Promise((resolved, rejected)=>{
        rClient.GET(key, (err, res)=>{
            console.log(res ,5);
            if(res) return resolved(JSON.parse(res))
            return resolved(err)
        })
    }).catch(e=>console.log(e));

const setValueInKey = (key, value) =>
    new Promise((resolved, rejected)=>{
        rClient.SET(key, JSON.stringify(value), (err, res)=>{
            console.log(res, 14);
            if(res) return resolved(res)
            return resolved(err)
        })
    }).catch(e=>console.log(e));

const setMultipleValueInList =(key, value)=>
    new Promise((resolved, rejected)=>{
        rClient.RPUSH(key, ...value, (err, res)=>{
            console.log(res, 23);
            if(res) return resolved(res)
            return resolved(err)
        })
    }).catch(e=>console.log(e));

const getAllValueFromList =(key)=>
    new Promise((resolved, rejected)=>{
        rClient.LRANGE(key, 0, -1, (err, res)=>{
            console.log(res, 32);
            if(res) return resolved(res)
            return resolved(err)
        })
    }).catch(e=>console.log(e));


module.exports = {
    getValueFromKey,
    setValueInKey,
    setMultipleValueInList,
    getAllValueFromList
}