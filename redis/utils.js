
const getValueFromKey = (key) =>
    new Promise((resolved, rejected)=>{
        rClient.GET(key, (err, res)=>{
            if(res) return resolved(JSON.parse(res))
            return resolved(err)
        })
    }).catch(e=>console.log(e));

const setValueInKey = (key, value) =>
    new Promise((resolved, rejected)=>{
        rClient.SET(key, JSON.stringify(value), (err, res)=>{
            if(res) return resolved(res)
            return resolved(err)
        })
    }).catch(e=>console.log(e));

const setMultipleValueInList =(key, value)=>
    new Promise((resolved, rejected)=>{
        console.log(21, key, value);
        rClient.RPUSH(key, ...value, (err, res)=>{
            if(res) return resolved(res)
            return resolved(err)
        })
    }).catch(e=>console.log(e));

const setSingleValueInList =(key, value)=>
    new Promise((resolved, rejected)=>{
        rClient.RPUSH(key, value, (err, res)=>{
            if(res) return resolved(res)
            return resolved(err)
        })
    }).catch(e=>console.log(e));

const getAllValueFromList =(key)=>
    new Promise((resolved, rejected)=>{
        rClient.LRANGE(key, 0, -1, (err, res)=>{
            if(res) return resolved(res)
            return resolved(err)
        })
    }).catch(e=>console.log(e));


module.exports = {
    getValueFromKey,
    setValueInKey,
    setMultipleValueInList,
    getAllValueFromList,
    setSingleValueInList
}