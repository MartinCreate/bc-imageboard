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
    limits: {
        fileSize: 2097152, //limits uploaded filesize to be 2mb max
    },
});
//////////////////////// DON'T TOUCH above - IMAGE UPLOAD BIOLDERPLATE /////////////////////////////

////------------------------------ MIDDLEWARE -----------------------------------------------//
app.use(express.json()); //body parsing middleware. detects JSON body that axios sends, parses it, and makes the resulting object be req.body (used here in app.post("/submit-comment", ...))
app.use(express.static("./public"));

//--Not really middleware
//credit for this cleanTime function goes to Carlotta ;) (for figuring out how to use Intl.DateTimeFormat)
const cleanTime = (uploadTime) => {
    return (uploadTime = new Intl.DateTimeFormat("en-GB", {
        // weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        // second: "numeric",
        hour12: false,
        timeZone: "Etc/GMT-2",
    }).format(uploadTime));
};

////------------------------------ MAIN PAGE ------------------------------------------------------------------------------//

////----- GET images --------------//
app.get("/images", (req, res) => {
    db.getImages()
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log("ERROR in GET /images getImages(): ", err);
        });
});

////----- GET More images --------------//
app.get("/more-images/:lastId", (req, res) => {
    db.getMoreImages(req.params.lastId)
        .then(({ rows }) => {
            console.log("rows: ", rows);
            res.json(rows);
        })
        .catch((err) => {
            console.log("ERROR in GET /more-images/:lastId: ", err);
        });
});

////------------------------------ MODULE ------------------------------------------------------------------------------//

////----- GET IMAGE- and COMMENT INFO --------------//
app.get("/image/:imageId", (req, res) => {
    db.getImageInfo(req.params.imageId)
        .then(({ rows }) => {
            const imgInfo = rows[0];
            imgInfo.created_at = cleanTime(rows[0].created_at) + " GMT+2";

            console.log("imgInfo SHOULD HAVE prev and next id: ", imgInfo);

            return [imgInfo, req.params.imageId];
        })
        .then((infoAndId) => {
            db.getImageComments(infoAndId[1])
                .then(({ rows }) => {
                    for (let i = 0; i < rows.length; i++) {
                        rows[i].created_at =
                            cleanTime(rows[i].created_at) + " GMT+2";
                    }
                    const imageInfoAndComments = [infoAndId[0], rows];
                    //Send image & comments to script.js
                    // console.log("img and comments: ", imageInfoAndComments);
                    res.json(imageInfoAndComments);
                })
                .catch((err) => {
                    console.log("ERROR in getImageComments: ", err);
                });
        })
        .catch((err) => {
            console.log("ERROR in GET /images getImages(): ", err);

            //Closes modal if we fail to get a response
            res.json("nonsense");
        });
});

////----- SUBMIT COMMENT --------------//
app.post("/submit-comment", (req, res) => {
    const bod = req.body;

    db.insertComment(bod.newComment, bod.commenter, bod.img_id).then(
        ({ rows }) => {
            rows[0].created_at = cleanTime(rows[0].created_at) + " GMT+2";
            res.json(rows);
        }
    );
});

////------------------------------ SUBMIT IMAGE is pushed: Upload to AWS -----------------------------------------------//
//uploader.single('propertyKey from formData') runs the multer code from the boilerplate above
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    const bod = req.body;

    if (req.file) {
        db.insertImageData(
            "https://s3.amazonaws.com/martinpaul-msg-imageboard/" +
                req.file.filename,
            bod.username,
            bod.title,
            bod.description
        ).then(({ rows }) => {
            //Send INSERT data back to vue in script.js
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
