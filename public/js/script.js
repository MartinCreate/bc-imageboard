// console.log("script is linked");

(function () {
    // --------------------------------------- PART 3 below ---------------------------------------//
    Vue.component("image-modal-component", {
        template: "#template",
        props: ["postTitle", "id"],
        mounted: function () {
            var self = this;

            axios
                .get(`/image/${this.id}`)
                .then(function (resp) {
                    console.log("resp.data: ", resp.data);
                    self.image = resp.data[0];
                    self.comments = resp.data[1];

                    console.log("Comments resp.data[1]: ", resp.data[1]);
                })
                .catch(function (err) {
                    console.log("ERROR in axios.get /image/:id : ", err);
                });
        },

        //'data' in a vue.component is a function that returns a new object with each call. why? because each new component should have its own object
        data: function () {
            return {
                poopi: "Mortin",
                count: 0,
                image: {},
                comments: [],

                newComment: "",
                commenter: "",
            };
        },
        methods: {
            closeMe: function () {
                console.log("I am emitting from the component... (child)");
                this.$emit("closing-time");
            },
            submitComment: function (e) {
                console.log("Submitting a comment");
                e.preventDefault(); //prevents submit button in html form from triggering a POST request

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
            },
        },
    });

    // --------------------------------------- PART 3 above ---------------------------------------//

    ////////////////////////////////////////// NEW below ////////////////////////////////////////////
    // Vue.component("first-component", {
    //     template: "#template",
    //     props: ["postTitle", "id"],
    //     mounted: function () {
    //         console.log("postTitle: ", this.postTitle);
    //         console.log("id in mounted of my component: ", this.id);
    //         /* we can now make a request to the server sending the id,
    //         and ask for all the information about that id.
    //         */
    //     },
    //     //'data' in a vue.component is a function. why? because we can have multiple components(??)
    //     data: function () {
    //         return {
    //             poopi: "Mortin",
    //             count: 0,
    //         };
    //     },
    //     methods: {
    //         // //Demo-code below - this code does the same thing as our html p tag that has [@click="selectedFruit = fruit.id"]
    //         // updateSelectedFruit: function (id) {
    //         //     console.log("fruit.id: : ", id);
    //         //     this.selectedFruit = id;
    //         // },
    //         // //Demo-code above
    //         closeMe: function () {
    //             console.log("I am emitting from the component... (child)");
    //             this.$emit("muffin");
    //         },
    //     },
    // });
    ////////////////////////////////////////// NEW above ////////////////////////////////////////////

    new Vue({
        el: "#main",
        data: {
            selectedImage: null,
            name: "msg",
            seen: true,
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
        },

        mounted: function () {
            console.log("my vue has MOUNTED!");

            //"this" lets us access the properties in data:{}
            var self = this;

            axios
                .get("/images")
                .then(function (response) {
                    self.images = response.data;
                })
                .catch(function (err) {
                    console.log("ERROR in axios.get /images: ", err);
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
            },
            handleChange: function (e) {
                console.log("handleChange is running! ");

                //e.target.files[0] selects the file that you just chose to upload
                console.log("file: : ", e.target.files[0]);

                //assign the uploaded file to the this.file property
                this.file = e.target.files[0];
            },
            closeModal: function () {
                // console.log("I am the parent. I will now close the modal");
                this.selectedImage = null;
            },
        },
    });
})();