(function () {
    Vue.component("image-modal-component", {
        template: "#template",
        props: ["postTitle", "id"],

        mounted: function () {
            var self = this;

            this.axiosModal(this.id, self, "mounted");
        },

        //// ----------------------NEW below -------------------- //
        //'watch' detects when values in props change and triggers the specified function
        watch: {
            //whenever our image id changes, this function will run (it checks the 'props: ' above above)
            id: function () {
                var self = this;
                console.log("image id changed", this.id);

                this.axiosModal(this.id, self, "watch.id");
            },
        },
        //// ----------------------NEW above -------------------- //

        //'data' in a vue.component is a function that returns a new object with each call. why? because each new component should have its own object
        data: function () {
            return {
                count: 0, //possibly get rid of this
                image: {},
                comments: [],

                newComment: "",
                commenter: "",
            };
        },
        methods: {
            closeMe: function () {
                // console.log("I am emitting from the component... (child)");
                this.$emit("closing-time");
            },
            submitComment: function () {
                console.log("Submitting a comment");

                var self = this;
                console.log("this in submitComment: ", this);

                var commentInfo = {
                    newComment: this.newComment,
                    commenter: this.commenter,
                    img_id: this.id,
                };

                console.log("comment in Submitcomment: ", commentInfo);

                axios
                    .post("/submit-comment", commentInfo) //sends commentInfo along with post request
                    .then(function (resp) {
                        console.log(
                            "resp.data[0] from POST /submit-comment: ",
                            resp.data[0]
                        );
                        self.comments.unshift(resp.data[0]);
                    })
                    .catch(function (err) {
                        console.log("ERROR in POST /submit-comment: ", err);
                    });

                // this.comment = "";
                // this.username = "";
            },
            axiosModal: function (thisId, self, errorLocation) {
                axios
                    .get(`/image/${thisId}`)
                    .then(function (resp) {
                        // console.log("resp.data: ", resp.data);
                        if (resp.data[0] == null || resp.data == "nonsense") {
                            self.$emit("closing-time");
                        } else {
                            self.image = resp.data[0];
                            self.comments = resp.data[1];
                        }

                        // console.log("Comments resp.data[1]: ", resp.data[1]);
                    })
                    .catch(function (err) {
                        console.log(
                            `ERROR in ${errorLocation} axios.get /image/:id : `,
                            err
                        );
                    });
            },
        },
    });

    //// ----------------------------------------- MAIN Vue instance --------------------------------------//
    new Vue({
        el: "#main",
        data: {
            // selectedImage: null,
            //// ----------------------NEW below -------------------- //
            selectedImage: location.hash.slice(1),
            lastId: null,
            //// ----------------------NEW above -------------------- //
            name: "msg",
            seen: true,
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
        },

        mounted: function () {
            var self = this; //"this" lets us access the properties in data:{}
            console.log("my vue has MOUNTED!");

            axios
                .get("/images")
                .then(function (resp) {
                    self.images = resp.data;
                    //// ----------------------NEW below -------------------- //

                    self.eraseMoreButtonIfEnd(resp, self);
                    // self.$emit("checkScrollEvent");
                    // self.checkScroll();
                    //// ----------------------NEW above -------------------- //
                })
                .catch(function (err) {
                    console.log("ERROR in axios.get /images: ", err);
                });

            window.addEventListener("hashchange", function () {
                // console.log("hash change has fired!!");
                // console.log("location.hash: ", location.hash);

                self.selectedImage = location.hash.slice(1);
            });
        },
        methods: {
            handleClick: function (e) {
                e.preventDefault(); //prevents submit button in html form from triggering a POST request
                console.log("this: ", this);

                var self = this;
                var formData = new FormData();

                //the append() method comes from FormData. it lets us add properties in append('key', value) pairs
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                //console.logging formData won't show us these properties (even though it does have them)

                axios
                    .post("/upload", formData) //sends formData along with post request
                    .then(function (resp) {
                        console.log("resp from POST /upload: ", resp);
                        self.images.unshift(resp.data.rows[0]);
                    })
                    .catch(function (err) {
                        console.log("ERROR in POST /upload: ", err);
                    });
            }, //  <-- handleClick end
            handleChange: function (e) {
                console.log("handleChange is running! ");

                //assign the file you want to upload to the this.file property
                this.file = e.target.files[0];
            },
            closeModal: function () {
                // console.log("I am the parent. I will now close the modal");
                location.hash = "";
                this.selectedImage = null;
            },
            //// ----------------------NEW below -------------------- //

            moreImages: function () {
                var self = this;
                axios
                    .get(`/more-images/${this.lastId}`)
                    .then(function (resp) {
                        for (var i = 0; i < resp.data.length; i++) {
                            self.images.push(resp.data[i]);
                        }

                        self.eraseMoreButtonIfEnd(resp, self);
                    })
                    .catch(function (err) {
                        console.log(
                            "ERROR in GET /more-images/this.lastId: ",
                            err
                        );
                    });
            },
            eraseMoreButtonIfEnd: function (resp, self) {
                var lastImage = resp.data[resp.data.length - 1];

                if (lastImage.lowest_id == lastImage.id) {
                    document.getElementById("more-button").style.visibility =
                        "hidden";

                    self.lastId = null;
                    console.log("SUCCESS END OF IMAGES!!");
                } else {
                    console.log("SUCCESS!!");
                    self.lastId = lastImage.id;
                }
            },
            checkScroll: function () {
                var self = this;
                console.log("window.innerHeight: ", window.innerHeight);
                console.log("window.pageYOffset: ", window.pageYOffset);

                // console.log(
                //     "document.scrollTop: ",
                //     document.getElementsByTagName("body")[0].clientHeight
                // );

                /*with vanilla Javascript we can find the height of the document in various ways (different browsers calculate height differently)
                we want to choose the highest 'height value'(which is what jQuery does). We can do this as follows
                (curtesy of Borgar on stackoverflow:
                    https://stackoverflow.com/questions/1145850/how-to-get-height-of-entire-document-with-javascript
                    )
                */
                var body = document.body,
                    html = document.documentElement;

                //'height' == $(document).height()  is true
                var height = Math.max(
                    body.scrollHeight,
                    body.offsetHeight,
                    html.clientHeight,
                    html.scrollHeight,
                    html.offsetHeight
                );

                var hasReachedEnd = window.pageYOffset + window.innerHeight;

                if (height - hasReachedEnd <= 200) {
                    axios.get("/more-images").then(function (resp) {
                        console.log("resp in get /more-images: ", resp);
                        self.checkScroll();
                    });
                } else {
                    setTimeout(this.checkScroll(), 1000);
                }
            },
            //// ----------------------NEW above -------------------- //
        },
    });

    // function infiniteScroll() {
    //     //change this if() condition. I want a couple buttons ("More" & "infinite Scroll") that allows the user to choose
    //     if (location.search == "?scroll=infinitely") {
    //         hideMoreButton();

    //         checkScroll();
    //     }
    // }
})();
