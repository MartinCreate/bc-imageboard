# Imageboard

This r/doodles imageboard is a sketch-themed, single-page, Vue.js web application for uploading and commenting on images. For demonstration purposes the images and their titles, descriptions and usersnames were taken from the top-posts of reddit.com/r/doodles.

Design by Martin Paul

## Features

-   Upload image and give it a title, description and username
-   Post comment on image and provide commenter-name
-   Newly uploaded/posted image/comment is immediately rendered on page without needing to reload page
-   Infinite-scroll for viewing uploaded images
-   Modal for viewing clicked-on image and related comments
-   View next/prev image in modal by clicking left/right arrow

## Tech Stack

-   Vue.js
-   Node.js
-   Express
-   Amazon Web Services - for storing the uploaded images
-   PostgreSQL - for storing
    -   image: title, description, username, upload-date
    -   comment: text, username, comment-date

### Screenshots

-   Main Page
    ![](./public/screenshots/1.png)
    ![](./public/screenshots/2.png)
-   Modal
    ![](./public/screenshots/3.png)
    ![](./public/screenshots/4.png)
    ![](./public/screenshots/5.png)
