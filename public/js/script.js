(function () {
    Vue.component("image-modal-component", {
        template: "#template",
        props: ["postTitle", "id"],

        mounted: function () {
            var self = this;

            this.axiosModal(this.id, self, "mounted");
        },
        watch: {
            //'watch' detects when values in props change and triggers the specified function
            //whenever our image id changes, this function will run (it checks the 'props: ' above)
            id: function () {
                var self = this;
                console.log("image id changed", this.id);

                this.axiosModal(this.id, self, "watch.id");
            },
        },
        data: function () {
            //'data' in a vue.component returns a new object for each call so each new component has its own data object
            return {
                count: 0, //possibly get rid of this
                image: {},
                comments: [],

                newComment: "",
                commenter: "",
            };
        },
        methods: {
            axiosModal: function (thisId, self, errorLocation) {
                //Request the data needed for current modal
                axios
                    .get(`/image/${thisId}`)
                    .then(function (resp) {
                        //handle url inputs that don't match any image_id in database
                        if (resp.data[0] == null || resp.data == "nonsense") {
                            self.$emit("closing-time");
                        } else {
                            self.image = resp.data[0];
                            self.comments = resp.data[1];

                            if (!self.image.next_id) {
                                console.log("WE HERE NOW");
                                document.getElementById(
                                    "next-icon"
                                ).style.visibility = "hidden";
                            }

                            var im = self.image;
                            self.hideShowNextPrev("prev-icon", im.prev_id);
                            self.hideShowNextPrev("next-icon", im.next_id);
                        }
                    })
                    .catch(function (err) {
                        console.log(
                            `ERROR in ${errorLocation} axios.get /image/:id : `,
                            err
                        );
                    });
            },
            submitComment: function () {
                var self = this;

                var commentInfo = {
                    newComment: this.newComment,
                    commenter: this.commenter,
                    img_id: this.id,
                };

                axios
                    .post("/submit-comment", commentInfo) //sends commentInfo along with post request
                    .then(function (resp) {
                        //Assign query-response-data to this vue-component's data.comments
                        self.comments.unshift(resp.data[0]);
                    })
                    .then(function () {
                        //Clear Input fields
                        self.newComment = "";
                        self.commenter = "";
                    })
                    .catch(function (err) {
                        console.log("ERROR in POST /submit-comment: ", err);
                    });
            },
            closeMe: function () {
                // To close modal we need selectedImage: null, but only the parent can access that property, so to close the modal from within the modal (i.e. by clicking the X button) we must emit an event that runs the function in parent vue instance that can change selectedImage to null.
                this.$emit("closing-time");
            },
            prevImg: function () {
                //Note: images are displayed in reverse order (newest image/highest id first). therefore, when we go to the left/previous image, we want the numerically higher id. To avoid confusion with the names I called the numerically lower id the next_id and the numerically higher id the prev_id

                location.hash = this.image.prev_id;
            },
            nextImg: function () {
                //Note: see prevImg note

                location.hash = this.image.next_id;
            },
            hideShowNextPrev: function (elemName, propName) {
                if (!propName) {
                    document.getElementById(elemName).style.visibility =
                        "hidden";
                } else {
                    document.getElementById(elemName).style.visibility =
                        "visible";
                }
            },
        },
    });

    //// ----------------------------------------- MAIN Vue instance --------------------------------------//
    new Vue({
        el: "#main",
        data: {
            selectedImage: location.hash.slice(1),
            lastId: null,
            name: "msg",
            seen: true, //leftover from demo?
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            notHidden: true, // for keeping checkScroll <-> infiniteScroll loop going
            chooseImgHasEvent: false,
        },

        mounted: function () {
            //"this" lets us access the properties in data:{}
            var self = this; //assigning "this" to self, lets us .this within .then() functions
            console.log("my vue has MOUNTED!");

            axios
                .get("/images")
                .then(function (resp) {
                    self.images = resp.data;
                    self.hideMoreButtonIfEnd(resp, self);
                })
                .catch(function (err) {
                    console.log("ERROR in axios.get /images: ", err);
                });

            //If the url after /# changes, assign the value after /# to selectedImage to display the image who's id corresponds to that value
            window.addEventListener("hashchange", function () {
                self.selectedImage = location.hash.slice(1);
            });
        },
        methods: {
            submitImage: function (e) {
                var self = this;
                e.preventDefault(); //prevents submit button in html form from triggering a POST request

                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                //the append() method comes from FormData. it lets us add properties in append('key', value) pairs
                //console.logging formData won't show us these properties (even though it does have them)

                axios
                    .post("/upload", formData) //sends formData along with post request
                    .then(function (resp) {
                        //Add query-response data to this Vue-instance's data object. shows new image in imageboard without having to reload the page
                        self.images.unshift(resp.data.rows[0]);
                    })
                    .then(function () {
                        self.clearData(self);
                        document.getElementById("error-message").innerHTML = "";
                    })
                    .catch(function (err) {
                        console.log("ERROR in POST /upload: ", err);
                        self.clearData(self);
                        document.getElementById("error-message").innerHTML =
                            "Woops, looks like something went wrong with the upload</br>(max image size: 2mb)";
                    });
            }, //  <-- submitImage end
            handleImgFile: function (e) {
                console.log("handleImgFile is running! ");

                //assign the file you want to upload to the this.file property
                this.file = e.target.files[0];
            },
            closeModal: function () {
                //This function executes upon "closing-time" event
                location.hash = "";
                this.selectedImage = null;
            },
            chooseImgButton: function () {
                var self = this;
                /* idea for code below, from:
                https://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/
                */
                var input = document.getElementById("choose-image");
                var label = document.getElementById("choose-img-label")
                    .innerHTML;
                var labelVal = input.innerHTML;

                if (!self.chooseImgHasEvent) {
                    input.addEventListener("change", function (e) {
                        var fileName = "";
                        fileName = e.target.value;

                        if (fileName) {
                            //fileName had C:/fakepath/ at the beginning, so I slice it off here
                            fileName = fileName.slice(12);
                            label.innerHTML = fileName;
                        } else {
                            label.innerHTML = labelVal;
                        }
                        self.chooseImgHasEvent = true;
                    });
                    console.log(
                        "This should only show up once, for the first uploaded image of the session"
                    );
                }
            },
            moreImages: function () {
                var self = this;
                axios
                    .get(`/more-images/${this.lastId}`)
                    .then(function (resp) {
                        for (var i = 0; i < resp.data.length; i++) {
                            self.images.push(resp.data[i]);
                        }

                        self.hideMoreButtonIfEnd(resp, self);
                    })
                    // .then(function () {
                    //     //Optional. might disable for presentation
                    //     var scroll = window.pageYOffset + 180;
                    //     window.scrollTo({
                    //         top: scroll,
                    //         behavior: "smooth",
                    //     });
                    // })
                    .then(function () {
                        //Keep the infinite-scroll loop going (notHidden gets set to false in checkScroll and checkScroll only runs if we click the infinit-scroll-button, which hides the 'More' button)
                        if (!self.notHidden) {
                            self.infiniteScroll();
                        }
                    })
                    .catch(function (err) {
                        console.log(
                            "ERROR in GET /more-images/this.lastId: ",
                            err
                        );
                    });
            },
            hideMoreButtonIfEnd: function (resp, self) {
                var lastImage = resp.data[resp.data.length - 1];

                if (lastImage.lowest_id == lastImage.id) {
                    this.hideMoreButton();
                    self.lastId = null;
                } else {
                    self.lastId = lastImage.id;
                }
            },
            checkScroll: function () {
                this.notHidden = false;
                /*with vanilla Javascript we can find the height of the document in various ways (different browsers calculate height differently)
                we want to choose the highest 'height' value(which is what jQuery does with $(document).height()). We can do this as follows
                (curtesy of Borgar on stackoverflow:
                    https://stackoverflow.com/questions/1145850/how-to-get-height-of-entire-document-with-javascript
                    )
                Important: this only works if we assign 'var height' AFTER our axios.get("/images") chain has finished rendering the images to our page (the setTimeout in infiniteScroll takes care of this). Otherwise 'height' will equal the height of the page before the imageboard has loaded (which means distanceToEnd will always equal 0, causing your if...else to keep triggering moreImages() until the entire databse is loaded even if you're not scrolling).
                */

                //------------ Borgar's code below -------//
                var body = document.body,
                    html = document.documentElement;
                var height = Math.max(
                    body.scrollHeight,
                    body.offsetHeight,
                    html.clientHeight,
                    html.scrollHeight,
                    html.offsetHeight
                );
                //------------ Borgar's code above -------//

                var distanceToEnd =
                    height - window.pageYOffset - window.innerHeight;

                //lastId gets set to null if the last image file in our database (i.e. with the lowest id) has been loaded to the page
                if (distanceToEnd < 100 && this.lastId) {
                    this.moreImages();
                } else if (this.lastId) {
                    this.infiniteScroll();
                }
            },
            infiniteScroll: function () {
                //this if-block code only runs once (notHidden is set to false after first infiniteScroll <-> checkScroll loop)
                if (this.notHidden) {
                    document.getElementById("scrollOn").style.visibility =
                        "visible";
                    document.getElementById(
                        "infinite-scroll"
                    ).style.visibility = "hidden";
                    this.hideMoreButton();
                }

                setTimeout(this.checkScroll, 1000);
            },
            hideMoreButton: function () {
                var styling = document.getElementById("more-button").style;
                styling.visibility = "hidden";
                styling.postion = "fixed";
                styling.zIndex = -10;
                styling.margin = 0;
                styling.padding = 0;
                styling.fontSize = "1px";
            },
            clearData: function (self) {
                //Clear image input fields and other things
                self.title = "";
                self.description = "";
                self.username = "";
                document.getElementById("choose-img-label").innerHTML =
                    "Choose an image ...";
                self.file = null;
            },
            //// ----------------------NEW above -------------------- //
        },
    });
})();
