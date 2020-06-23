# Imageboard

This r/doodles imageboard is a sketch-themed, single-page, Vue.js web application for uploading and commenting on images.

Design by Martin Paul

## Features

-   Upload image and give it:
    -title
    -description
    -username
-   Post comment on image and provied commenter-name
-   Newly uploaded/posted image/comment is immediately rendered on page without needing to reload page
-   Infinite-scroll for viewing uploaded images
-   Modal for viewing image and related comments
-   View next/prev image in modal by clicking left/right arrow

## Tech Stack

-   Vue.js
-   Node.js
-   Express
-   Amazon Web Services - for storing the uploaded images
-   PostgreSQL - for storing
    -image: title, description, username, upload-date
    -comment: text, username, comment-date

### Screenshots

![](./public/screenshots/1.png)
![](./public/screenshots/2.png)
![](./public/screenshots/3.png)
![](./public/screenshots/4.png)
![](./public/screenshots/5.png)
