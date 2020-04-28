//AWS Bucketname: martinpaul-msg-imageboard
/* To check the images on aws, go to
https://s3.console.aws.amazon.com/s3/buckets/martinpaul-msg-imageboard/
*/
const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

////--GET
module.exports.simpleQuery = (query) => {
    return db.query(query);
};

////---------------------------------------- Main Page ----------------------------------------//
////--GET images
module.exports.getImages = () => {
    return db.query(
        `
    SELECT *, (
        SELECT id FROM images
        ORDER BY id ASC
        LIMIT 1
        ) AS lowest_id FROM images
        ORDER BY id DESC
        LIMIT 8`
    );
};

////--GET more images
module.exports.getMoreImages = (lastId) => {
    return db.query(
        `
    SELECT *, (
        SELECT id FROM images
        ORDER BY id ASC
        LIMIT 1
        ) AS lowest_id FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 8`,
        [lastId]
    );
};

///--INSERT into
module.exports.insertImageData = (url, username, title, description) => {
    return db.query(
        `
    INSERT INTO images (url, username, title, description)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
        [url, username, title, description]
    );
};

////---------------------------------------- MODULE ----------------------------------------//
// ////--GET imageinfo
// module.exports.getImageInfo = (id) => {
//     return db.query(`
//     SELECT * FROM images WHERE id = ${id}`);
// };

////--GET imageinfo (with next/prev id)
//prev_id is the higher id, because we're displaying the images in reverse order (newest first). Therefore when we have a modal open, the newer image will be to the left, and since it feels right to call the left image the 'previous' image and the right image the 'next' image, prev_id is the higher number and next_id is the lower number
module.exports.getImageInfo = (id) => {
    return db.query(`
    SELECT *,
    (SELECT id AS prev_id FROM images WHERE id > ${id} ORDER BY id ASC LIMIT 1),
    (SELECT id AS next_id FROM images WHERE id < ${id} ORDER BY id DESC LIMIT 1)
    FROM images WHERE id = ${id}`);
};

////--GET imageComments
module.exports.getImageComments = (id) => {
    return db.query(`
    SELECT * FROM comments
    WHERE img_id = ${id}
    ORDER BY id DESC
    `);
};

///--INSERT Comment
module.exports.insertComment = (comment, username, img_id) => {
    return db.query(
        `
    INSERT INTO comments (comment, username, img_id)
    VALUES ($1, $2, $3)
    RETURNING *`,
        [comment, username, img_id]
    );
};
