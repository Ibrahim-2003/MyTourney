require('dotenv').config();
const aws = require("aws-sdk");
const fs = require('fs');

const spacesName = process.env.SPACES_NAME;
const accessKeyId = process.env.CDN_KEY;
const secretAccessKey = process.env.CDN_SECRET;


const spacesEndpoint = new aws.Endpoint(process.env.CDN_ENDPOINT);
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});

//Upload to Spaces
function upload(file){
    const filestream = fs.createReadStream(file.path);

    const uploadParams = {
        Bucket: spacesName,
        Body: filestream,
        Key: file.filename,
        ACL: 'public-read'
    }

    return s3.upload(uploadParams).promise()
}

exports.upload = upload

//Download from Spaces

function download(file){
    const downloadParams = {
        Key: file,
        Bucket: spacesName
    }

    return s3.getObject(downloadParams).createReadStream()
}

exports.download = download