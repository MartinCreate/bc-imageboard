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
    return db.query(`
    SELECT * FROM images`);
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

////---------------------------------------- for MODULE ----------------------------------------//
////--GET imageinfo
module.exports.getImageInfo = (id) => {
    return db.query(`
    SELECT * FROM images WHERE id = ${id}`);
};

////--GET imageComments
module.exports.getImageComments = (id) => {
    return db.query(`
    SELECT * FROM comments WHERE img_id = ${id}`);
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
