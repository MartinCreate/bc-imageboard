// console.log("script is linked");

(function () {
    new Vue({
        el: "#main",
        data: {
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

            // console.log("this OUTSIDE axios: ", this);

            //the "this" is the way in which we can access
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
                //conosle.logging formData won't show us these properties (even though it does have them), but more on that later

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

                //assign the uploaded file to this.file
                this.file = e.target.files[0];
            },
        },
    });
})();
