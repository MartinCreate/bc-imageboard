const aws = require("aws-sdk"); //npm package that we installed. lets us talk to AWS (amazon web services)
const fs = require("fs");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

// //creating object that has permission to talk to amazon (and assigning it to s3)
const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

exports.upload = (req, res, next) => {
    if (!req.file) {
        console.log("ERROR in s3.js upload: req.file isnt there :(");
        return res.sendStatus(500);
    }

    const { filename, mimetype, size, path } = req.file;

    //takes image, and puts it on aws bucket (makes a PUT request to do so. Object means File in aws)
    const promise = s3
        .putObject({
            Bucket: "martinpaul-msg-imageboard",
            ACL: "public-read", //once the file has been uploaded, anyone can see it
            Key: filename, //lets amazon know what the file is called
            Body: fs.createReadStream(path), //the actual file that is sent to amazon
            ContentType: mimetype, //type of file (.png, .jpg, etc.)
            ContentLength: size, //size of file
        })
        .promise();

    promise
        .then(() => {
            // it worked!!!
            console.log("amazon PUT object complete!! everything worked!! :)");
            next();
            fs.unlink(path, () => {}); //(optional) deletes image from 'uploads' directory (and therefore your harddrive), after it was uploaded to amazon
        })
        .catch((err) => {
            console.log("ERROR in upload PUT object in s3.js: ", err);
            res.sendStatus(500);
        });
};
