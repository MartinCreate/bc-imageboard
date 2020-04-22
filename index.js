const express = require("express");
const app = express();
const db = require("./db");

app.get("/images", (req, res) => {
    db.getImages()
        .then((images) => {
            console.log("images.rows: ", images.rows);
            let arr = images.rows;
            let rev = arr.reverse();
            return rev;
        })
        .then((images) => {
            // console.log("images: ", images);
            res.json(images);
        })
        .catch((err) => {
            console.log("ERROR in GET /images getImages(): ", err);
        });
});

app.use(express.static("./public"));

app.listen(8080, () => console.log("IB server listening..."));
