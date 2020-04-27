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
// ////--GET images
// module.exports.getImages = () => {
//     return db.query(`
//     SELECT * FROM images`);
// };

//// ----------------------NEW below -------------------- //
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
        LIMIT 2`
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
        LIMIT 2`,
        [lastId]
    );
};

//// ----------------------NEW above -------------------- //

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
////--GET imageinfo
module.exports.getImageInfo = (id) => {
    return db.query(`
    SELECT * FROM images WHERE id = ${id}`);
};

//// ----------------------NEW changed below (added ORDER BY id DESC)-------------------- //
////--GET imageComments
module.exports.getImageComments = (id) => {
    return db.query(`
    SELECT * FROM comments
    WHERE img_id = ${id}
    ORDER BY id DESC
    `);
};
//// ----------------------NEW changed above -------------------- //

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
