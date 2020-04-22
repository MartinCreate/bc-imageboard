const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

////--GET images
module.exports.getImages = () => {
    return db.query(`
    SELECT * FROM images`);
};
