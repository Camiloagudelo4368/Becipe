 // Camilo to retrieve the user sign in information
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCbP-jTtItFgvCAAW62n6ieMTpnYlBVtOk",
        authDomain: "becipe-9368d.firebaseapp.com",
        databaseURL: "https://becipe-9368d.firebaseio.com",
        projectId: "becipe-9368d",
        storageBucket: "",
        messagingSenderId: "543729845832"
    };

    firebase.initializeApp(config);

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
        //   alert(" User is signed in.")
            console.log(user)
            console.log(user.uid);   // this prints fine
            // console.log(user.displayName);   // this prints fine

            $("#userName").text("Hello " + user.displayName);

        } else {
          // No user is signed in.
        }
      });

// ---------------------------------------------------------------------- //
    
    var allowedIngredients = [];

    var excludedIngredients = [
        "rice",
        "beef",
        "chicken",
        "pork",
        "carrot",
        "apple"
    ];

    /**
     *
    Create buttons of the elements in an array  
     * @param {*} _array array of srings with the elements to be created
     */
    function createButtons(_array) {

        _array.forEach(_element => {

            $(".buttons").prepend(`<button class="btnCity btn btn-outline-info">${_element}`);
        });

    }

    createButtons(allowedIngredients);

    // Event to create butttons
    $("#insert").on("click", function (event) {
        event.preventDefault();

        let _text = $("#txtSearch").val();

        // if the text is not empty then execute it
        if (_text.trim() !== "") {

            // if the button does not exist then create it
            if (allowedIngredients.indexOf(_text) === -1) {

                // Insert the input value into the array
                allowedIngredients.push(_text);

                // clear the buttons div to create everithind again
                $(".buttons").empty();

                // call function to create the buttons
                createButtons(allowedIngredients);

                $("#txtSearch").val("");

                $(".images").empty();

                searchRecipe();

            }
            else {
                alert("The ingredient is already on the list");
            }
        }
        else {
            alert("Please insert an ingredient");
        }
    })

    $("#clearText").on("click", function (event) {
        $("#txtSearch").val("");
    })

    // click event of every element with the class btnCity
    // $(document).on("click", ".btnCity", event => {
function searchRecipe(){
        event.preventDefault();

        if (allowedIngredients.length === 0) {
            return
        }
        else {
            var allowedIngredientsUrl = ''
            var excludedIngredientsUrl = ''

            for (var i = 0; i < allowedIngredients.length; i++) {
                // Add allowed ingredients
                allowedIngredientsUrl += "&allowedIngredient=" + allowedIngredients[i]
            };

            // store the index of element to be remove from excluded ingredients
            var idOfIngredientToRemove = excludedIngredients.indexOf(allowedIngredients[i]);

            // delete allowed ingredient from excluded ingredients list
            excludedIngredients.splice(idOfIngredientToRemove, 1);


            for (var i = 0; i < excludedIngredients.length; i++) {

                //Format the url to send it into API request as excluded elements 
                excludedIngredientsUrl += "&excludedIngredient=" + excludedIngredients[i]
            };
            console.log("https://api.yummly.com/v1/api/recipes?_app_id=ab4906ff&_app_key=25c71a2c8b446d9ef17b082ae3451972&requirePictures=true" + allowedIngredientsUrl + excludedIngredientsUrl);
            // Call the API
            $.ajax({
                method: "GET",
                url: "https://api.yummly.com/v1/api/recipes?_app_id=ab4906ff&_app_key=25c71a2c8b446d9ef17b082ae3451972&requirePictures=true" + allowedIngredientsUrl + excludedIngredientsUrl

            })
            // ).then(response => {
            //     organizeDataInUI(response);
            // });
            .then(function (response) {

                console.log(response)

                // store the array from the response
                var _data = response.matches;

                for (var i = 0; i < _data.length; i++) {

                    // variable to store the element
                    var _element = _data[i];

                    var _urlStillGif = _element.imageUrlsBySize['90'];
                    var _urlYumm = "http://www.yummly.com/recipe/" + _element.id +"";
                    var _rating = _element.rating;
                    var _title = _element.recipeName;


                    $(".images").append(
                        `<div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                        <div class="card_content card text-center">
                        <div class="card-header">
                        ${_title}
                        </div>
                        <div class="card-body">
                            <blockquote class="blockquote mb-0">
                                <img id="img${i}" class="responseImage card-img-top" src="${_urlStillGif}" active="0" data-still="${_urlYumm}">    
                                <footer class="blockquote-footer"><cite title="Source Title">Rating: ${_rating}</cite></footer>
                            </blockquote>
                        </div>
                        </div>
                    </div>`);
                }
            })
        }

    };

    // event for each image
    $(document).on("click", ".responseImage", event => {

        var _imageId = event.currentTarget.id;
        // console.log(_imageId)

        var _image = $("#" + _imageId);
        window.location.href = _image.attr("data-still");

    });

    
    function clearSearch(){
        $(".images").empty();
        $(".buttons").empty();
        allowedIngredients = [];
        excludedIngredients = [];
    }
// });