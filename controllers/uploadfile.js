const AWS = require('aws-sdk');

const uploadFile = async (datas, id)=>{

    let s3bucket = new AWS.S3({
        accessKeyId: process.env.S3_API_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
        Bucket: process.env.S3_BUCKET_NAME
    });
    s3bucket.createBucket(function () {
        var params = {
            Key: `${id.toHexString()}.png`, 
            Body: datas,
            Bucket: process.env.S3_BUCKET_NAME,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg',
            ACL: 'public-read'
        };
        s3bucket.putObject(params, function (err, data) {
            if (err) { 
                console.log(err);
                console.log('Error uploading data: ', data); 
              }
        });
    });
    return {
        link : `https://chatappic.s3.amazonaws.com/${id.toHexString()}.png`
    }
}

module.exports = uploadFile;