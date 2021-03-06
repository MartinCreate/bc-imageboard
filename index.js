//AWS Bucketname: martinpaul-msg-imageboard
/* To check the images on aws, go to
https://s3.console.aws.amazon.com/s3/buckets/martinpaul-msg-imageboard/
*/

const express = require("express");
const app = express();
const db = require("./db");
const s3 = require("./s3");

//////////////////////// DON'T TOUCH below - IMAGE UPLOAD BIOLDERPLATE /////////////////////////////
const multer = require("multer"); //saves our files to our harddrive
const uidSafe = require("uid-safe"); //creates random string to give each file a unique name
const path = require("path"); //core node module

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
app.use(express.json());
app.use(express.static("./public"));

//--Not really middleware
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
        // timeZone: "Etc/GMT-2",
        timeZone: "UTC",
    }).format(uploadTime));
};

////------------------------------ MAIN PAGE ------------------------------------------------------------------------------//

app.get("/images", (req, res) => {
    db.getImages()
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log("ERROR in GET /images getImages(): ", err);
        });
});

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
            console.log("rows[0] in get /image/:imageId: ", rows[0]);
            const imgInfo = rows[0];
            imgInfo.created_at = cleanTime(rows[0].created_at);

            return [imgInfo, req.params.imageId];
        })
        .then((infoAndId) => {
            db.getImageComments(infoAndId[1])
                .then(({ rows }) => {
                    for (let i = 0; i < rows.length; i++) {
                        rows[i].created_at = cleanTime(rows[i].created_at);
                    }
                    const imageInfoAndComments = [infoAndId[0], rows];
                    //Send image & comments to script.js
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
            rows[0].created_at = cleanTime(rows[0].created_at);
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

app.listen(process.env.PORT || 8080, () =>
    console.log("imageboard server listening...")
);
