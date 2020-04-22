// console.log("script is linked");

(function () {
    new Vue({
        el: "#main",
        data: {
            name: "msg",
            seen: true,
            // cities: [],
            images: [],
        },
        mounted: function () {
            console.log("my vue has MOUNTED!");

            console.log("this OUTSIDE axios: ", this);

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

            // //the route in here has to match the app.get(/route) in index.js
            // axios.get("/cities").then(function (response) {
            //     // console.log("response from /cities: ", response.data);
            //     /*The "this" object in here is no longer the same "this" object that is outside of here.
            //         We need to store it in a variable, e.g. "self", and then we can use it in here.
            //         */
            //     console.log("this INSIDE axios: ", this);

            //     //Assign the data from our GET request to the 'cities' property in our 'data' property (note: the 'data' in the line below is not the same 'data' property in this file)
            //     self.cities = response.data;
            // });
        },
        methods: {
            myFunction: function () {
                console.log("myFunction is runnning!");
            },
        },
    });
})();
