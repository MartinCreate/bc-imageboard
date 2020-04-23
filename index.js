//AWS Bucketname: martinpaul-msg-imageboard
/* To check the images on aws, go to
https://s3.console.aws.amazon.com/s3/buckets/martinpaul-msg-imageboard/
*/
const express = require("express");
const app = express();
const db = require("./db");
const s3 = require("./s3");

//////////////////////// DON'T TOUCH below - IMAGE UPLOAD BIOLDERPLATE /////////////////////////////
//npm packages we installed
const multer = require("multer"); //saves our files to our harddrive
const uidSafe = require("uid-safe"); //creates random string to give each file a unique name
//core node module
const path = require("path");

const diskStorage = multer.diskStorage({
    //where on harddrive files will be saved
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    //makes sure each file we upload has a different name. uidSafe creates a random 24-character name
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        }); //this adds the original filepath and extention to the 24-character-random-name
    },
});

const uploader = multer({
    storage: diskStorage,
    //limits uploaded filesize to be 2mb max
    limits: {
        fileSize: 2097152,
    },
});
//////////////////////// DON'T TOUCH above - IMAGE UPLOAD BIOLDERPLATE /////////////////////////////

app.use(express.static("./public"));
////------------------------------ Page is loaded: GET tabledata -----------------------------------------------//

app.get("/images", (req, res) => {
    db.getImages()
        .then((images) => {
            let arr = images.rows;
            let rev = arr.reverse();
            return rev;
        })
        .then((images) => {
            res.json(images);
        })
        .catch((err) => {
            console.log("ERROR in GET /images getImages(): ", err);
        });
});

////------------------------------ Submit button is pushed: Upload to AWS -----------------------------------------------//
//uploader.single('propertyKey from formData') runs the multer code from the boilerplate above
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    const bod = req.body;
    console.log("file: ", req.file); //info about file we just uploaded, including filename and such
    console.log("input: ", req.body); //input fields from the client

    if (req.file) {
        db.insertImageData(
            "https://s3.amazonaws.com/martinpaul-msg-imageboard/" +
                req.file.filename,
            bod.username,
            bod.title,
            bod.description
        ).then(({ rows }) => {
            //Send INSERT data back to script.js
            res.json({
                rows,
            });
        });
    } else {
        res.json({
            success: false,
        });
    }
});

app.listen(8080, () => console.log("IB server listening..."));
