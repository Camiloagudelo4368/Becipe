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

var database = firebase.database();
var favoritesRef = database.ref("/favorites");
var userId = "";
var userActive

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // console.log(user)
        // console.log(user.uid);   // this prints fine
        // console.log(user.displayName);   // this prints fine

        $("#userName").text("Hello " + user.displayName);
        userId = user.uid;
        $(".signInSignUpLinks").hide();
        userActive = true;
        $("#favoritesLink").show();

    } else {
        $(".signInSignUpLinks").show();
        userActive = false;
        $("#favoritesLink").hide();
        // No user is signed in.
    }
});

// ---------------------------------------------------------------------- //

var favoritesRecipeIdList = [];
var favoritesRecipeIdListUrl = '';
var _urlEmptyFavImage = "assets/images/empty_heart.png";
var _urlFilledFavImage = "assets/images/heart-filled.png";
var allowedIngredients = [];
var onFavorites = false;


$(document).ready(function () {
    $.ajaxSetup({ cache: false });
});

/**
 *
Create buttons of the elements in an array  
 * @param {*} _array array of srings with the elements to be created
 */
function createButtons(_array) {

    $("#txtSearch").val("");

    $(".images").empty();

    // clear the buttons div to create everything again
    $(".buttons").empty();

    _array.forEach(_element => {
        _element = _element.toLowerCase();

        $(".buttons").prepend(`<button id="btn${_element}" class="btnIngredient btn btn-outline-info" data-original="${_element}" onmouseout="changeToNameBtn('btn${_element}')" onmouseover="changeToDeleteBtn('btn${_element}')" onclick="deleteIngredient('btn${_element}')">${_element}`);

        searchRecipe();
    });
}

// change the bottom text to delete
function changeToDeleteBtn(elementId) {
    $("#" + elementId).text("Delete");
}

// change to he original text
function changeToNameBtn(elementId) {
    var name = $("#" + elementId).attr("data-original");

    $("#" + elementId).text(name);
}

// deleet ingredient function
function deleteIngredient(elementId) {
    var name = $("#" + elementId).attr("data-original");
    var index = allowedIngredients.indexOf(name);

    allowedIngredients.splice(index, 1);
    excludedIngredients.push(name);

    createButtons(allowedIngredients);
}

// Event to create butttons
$("#insert").on("click", function (event) {
    event.preventDefault();

    var _text = $("#txtSearch").val();

    // if the text is not empty then execute it
    if (_text.trim() !== "") {

        // if the button does not exist then create it
        if (allowedIngredients.indexOf(_text) === -1) {

            // Insert the input value into the array
            allowedIngredients.push(_text);

            // call function to create the buttons
            createButtons(allowedIngredients);

            onFavorites = false;

        }
        else {
            // show message on modal
            $('#modalMessage-body').text('The ingredient is already on the list', ['danger'])
            $('#modalMessage').modal("show")
        }
    }
    else {
        // show message on modal
        $('#modalMessage-body').text('Please insert an ingredient', ['danger'])
        $('#modalMessage').modal("show")
    }
})

// Clear the search fields
$("#clearText").on("click", function (event) {
    $("#txtSearch").val("");
    allowedIngredients.empty();
})

// search recipe function
var searchRecipe = function () {
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

            // store the index of element to be remove from excluded ingredients
            var idOfIngredientToRemove = excludedIngredients.indexOf(allowedIngredients[i]);

            if (idOfIngredientToRemove !== -1) {
                // delete allowed ingredient from excluded ingredients list
                excludedIngredients.splice(idOfIngredientToRemove, 1);
            }
        };

        for (var i = 0; i < excludedIngredients.length; i++) {

            //Format the url to send it into API request as excluded elements 
            excludedIngredientsUrl += "&excludedIngredient=" + excludedIngredients[i]
        };

        // console.log("Allowed: " + allowedIngredients);
        // console.log("Excluded: " + excludedIngredients);

        // Call the API
        $.ajax({
            // url: "https://api.yummly.com/v1/api/recipes?_app_id=ab4906ff&_app_key=25c71a2c8b446d9ef17b082ae3451972&requirePictures=true&q=" + allowedIngredients.pop() + allowedIngredientsUrl + excludedIngredientsUrl,
            url: "https://api.yummly.com/v1/api/recipes?_app_id=ab4906ff&_app_key=25c71a2c8b446d9ef17b082ae3451972&requirePictures=true&q=" + lastOnArray(allowedIngredients),
            method: "GET",
            dataType: "JSONP"
        })
            .then(function (response) {

                $(".images").empty();

                // store the array from the response
                var _data = response.matches;

                for (var i = 0; i < _data.length; i++) {

                    // variable to store the element
                    var _element = _data[i];

                    var _urlImage = _element.imageUrlsBySize['90'];
                    var _urlYumm = "https://www.yummly.com/recipe/" + _element.id + "";
                    var _rating = _element.rating;
                    var _title = _element.recipeName;

                    var elementId = _element.id;

                    if (userActive) {
                        $(".images").append(
                            `<div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                        <div class=" card_content card text-center">
                            <div class="card-header">
                                ${_title}
                            </div>
                            <div class="card-body">
                                <img id="img${i}" class="responseImage card-img-top" src="${_urlImage}" active="0" data-web="${_urlYumm}">                        
                            </div>
                            <div class="card-footer text-muted">
                                <div class="row">
                                    <div class="col-6 text-left">
                                        Rating: ${_rating}
                                    </div>
                                    <div class="col-6 text-right">
                                        <img id="favImg${i}" class="favImage" onclick="addFavorites('${elementId.trim()}', 'favImg${i}')" src="${_urlEmptyFavImage}" active="0">
                                    </div>
                                </div>                                                
                            </div>
                        </div>
                    </div>`);
                    }
                    else {
                        $(".images").append(
                            `<div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                        <div class=" card_content card text-center">
                            <div class="card-header">
                                ${_title}
                            </div>
                            <div class="card-body">
                                <img id="img${i}" class="responseImage card-img-top" src="${_urlImage}" active="0" data-web="${_urlYumm}">                        
                            </div>
                            <div class="card-footer text-muted">
                                <div class="row">
                                    <div class="col-6 text-left">
                                        Rating: ${_rating}
                                    </div>                                    
                                </div>                                                
                            </div>
                        </div>
                    </div>`);
                    }
                }
            })
    }
};

// event for each image
$(document).on("click", ".responseImage", event => {

    var _imageId = event.currentTarget.id;

    var _image = $("#" + _imageId);
    window.location.href = _image.attr("data-web");

});

/**
 *
Add recipe to my favorites on firebase  *
 * @param {*} recipeId id of the recipe to be saved
 */
function addFavorites(recipeId, imgId) {

    var active = $("#" + imgId).attr("active")

    if (active === "0") {
        // New object type favorite
        var newFav = {
            userId: userId,
            recipeId: recipeId
        }

        // insert object into the database
        favoritesRef.push(newFav);

        $("#" + imgId).attr("src", _urlFilledFavImage);
        $("#" + imgId).attr("active", "1")
    }
    else {
        var _key = '';
        var leadsRef = database.ref('favorites');

        leadsRef.on('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {

                if (userId === childSnapshot.val().userId && recipeId === childSnapshot.val().recipeId) {
                    childSnapshot.ref.remove();
                    $("#" + imgId).attr("src", _urlEmptyFavImage);
                }
            });
        });

        $("#" + imgId).attr("src", _urlEmptyFavImage);
        $("#" + imgId).attr("active", "0")

        if (onFavorites) {
            retrieveFavorites();
        }
    }
}

// Retrieve the favorites recipes and populate them in same way the original search
$("#favoritesLink").on("click", event => {
    event.preventDefault();

    retrieveFavorites();
    onFavorites = true;

    $(".favImage").attr("active", "1")
    $(".buttons").empty();
    allowedIngredients = []
    $("#txtSearch").val('');

})

// Search for favorites from firebase
function retrieveFavorites() {

    favoritesRecipeIdList = [];

    var favoritesRef = database.ref('favorites');

    favoritesRef.on('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {

            if (userId === childSnapshot.val().userId) {
                // Insert the recipe id to the array
                favoritesRecipeIdList.push(childSnapshot.val().recipeId);
            }
        });
    });
    // call ajax function after 1 second to resolve priority conflicts
    setTimeout(callAjax, 1000);
}

// ajax function to call API
function callAjax() {
    $(".images").empty();
    for (var i = 0; i < favoritesRecipeIdList.length; i++) {

        $.ajax({
            url: "https://api.yummly.com/v1/api/recipe/" + favoritesRecipeIdList[i] + "?_app_id=ab4906ff&_app_key=25c71a2c8b446d9ef17b082ae3451972&requirePictures=true",
            method: "GET"
        })
            .then(function (response) {
                // store the array from the response
                var _data = response;

                // variable to store the element
                var _element = _data;

                var _urlImage = _element.images[0].imageUrlsBySize['90']
                var _urlYumm = "https://www.yummly.com/recipe/" + _element.id + "";
                var _rating = _element.rating;
                var _title = _element.name;

                var elementId = _element.id;

                $(".images").append(
                    `<div class="col-lg-6 col-md-12 col-sm-12 col-xs-12">
                <div class=" card_content card text-center">
                    <div class="card-header">
                        ${_title}
                    </div>
                    <div class="card-body">
                        <img id="img${i}" class="responseImage card-img-top" src="${_urlImage}" active="0" data-web="${_urlYumm}">                        
                    </div>
                    <div class="card-footer text-muted">
                        <div class="row">
                            <div class="col-6 text-left">
                                Rating: ${_rating}
                            </div>
                            <div class="col-6 text-right">
                                <img id="favImg${i}" class="favImage" onclick="addFavorites('${elementId.trim()}', 'favImg${i}')" src="${_urlFilledFavImage}" active="1">
                            </div>
                        </div>                                                
                    </div>
                </div>
            </div>`);
            })
    }
}

function clearSearch() {
    $(".images").empty();
    $(".buttons").empty();
    $("#txtSearch").val("");
    allowedIngredients = [];
}


/**
 *Returns the last element on an array
 *
 * @param {*} _array array
 * @returns
 */
function lastOnArray(_array){
    return _array[_array.length - 1];
}

var excludedIngredients =
    [
        "Butter",
        "Butter oil",
        "Cheese",
        "Cheese food",
        "Cheese spread",
        "Cream",
        "Eggnog",
        "Sour dressing",
        "Milk",
        "Cream substitute",
        "Dessert topping",
        "Sour cream",
        "Milk substitutes",
        "Milk shakes",
        "Whey",
        "Yogurt",
        "Egg",
        "Egg substitute",
        "Cheese substitute",
        "Cheese sauce",
        "USDA Commodity",
        "Parmesan cheese topping",
        "Reddi Wip Fat Free Whipped Topping",
        "Egg Mix",
        "Cheese product",
        "Protein supplement",
        "Dulce de Leche",
        "Ice cream",
        "Ice cream sandwich",
        "Ice cream cookie sandwich",
        "Ice cream cone",
        "Fat free ice cream",
        "Milk dessert bar",
        "Nutritional supplement for people with diabetes",
        "Dairy",
        "Ice cream bar",
        "Queso cotija",
        "Spices",
        "Basil",
        "Dill weed",
        "Mustard",
        "Salt",
        "Vinegar",
        "Thyme",
        "Vanilla extract",
        "Capers",
        "Horseradish",
        "Rosemary",
        "Peppermint",
        "Spearmint",
        "PACE",
        "Seasoning mix",
        "Babyfood",
        "Zwieback",
        "Infant formula",
        "Child formula",
        "Baby food",
        "Toddler formula",
        "Fat",
        "Lard",
        "Salad dressing",
        "Sandwich spread",
        "Shortening",
        "Oil",
        "Margarine",
        "Margarine-like",
        "Vegetable oil",
        "Shortening bread",
        "Shortening cake mix",
        "Shortening industrial",
        "Shortening frying (heavy duty)",
        "Shortening confectionery",
        "Shortening household soybean (hydrogenated) and palm",
        "Fish oil",
        "Meat drippings (lard",
        "Animal fat",
        "Margarine-like spread with yogurt",
        "Margarine Spread",
        "Margarine-like shortening",
        "USDA Commodity Food",
        "Margarine-like spread",
        "Margarine-like vegetable-oil spread",
        "Dressing",
        "Mayonnaise",
        "Chicken",
        "Canada Goose",
        "Duck",
        "Goose",
        "Guinea hen",
        "Pheasant",
        "Quail",
        "Squab",
        "Turkey",
        "Turkey from whole",
        "Pate de foie gras",
        "Turkey and gravy",
        "Turkey patties",
        "Turkey breast",
        "Turkey thigh",
        "Turkey roast",
        "Turkey sticks",
        "Poultry",
        "Ground turkey",
        "Chicken patty",
        "Chicken breast tenders",
        "USDA Commodity Chicken",
        "Ruffed Grouse",
        "Emu",
        "Ostrich",
        "Soup",
        "CAMPBELL'S Red and White",
        "HEALTHY REQUEST",
        "CAMPBELL'S",
        "Sauce",
        "Gravy",
        "Split pea soup",
        "Split pea with ham soup",
        "PREGO Pasta",
        "P REGO Pasta",
        "Fish broth",
        "Potato soup",
        "Barbecue loaf",
        "Beerwurst",
        "Sausage",
        "Blood sausage",
        "Bockwurst",
        "Bologna",
        "Bratwurst",
        "Braunschweiger (a liver sausage)",
        "Brotwurst",
        "Cheesefurter",
        "Chicken roll",
        "Chicken spread",
        "Chorizo",
        "Corned beef loaf",
        "Dutch brand loaf",
        "Frankfurter",
        "Ham",
        "Ham salad spread",
        "Ham and cheese loaf or roll",
        "Ham and cheese spread",
        "Headcheese",
        "Kielbasa",
        "Knackwurst",
        "Lebanon bologna",
        "Liver cheese",
        "Liver sausage",
        "Luncheon meat",
        "Roast beef",
        "Mortadella",
        "Olive loaf",
        "Pastrami",
        "Pate",
        "Peppered loaf",
        "Pepperoni",
        "Pickle and pimiento loaf",
        "Polish sausage",
        "Luxury loaf",
        "Mother's loaf",
        "Picnic loaf",
        "Pork sausage",
        "Pork and beef sausage",
        "Turkey sausage",
        "Poultry salad sandwich spread",
        "Salami",
        "Smoked link sausage",
        "Thuringer",
        "Turkey ham",
        "Turkey roll",
        "Honey roll sausage",
        "Luncheon sausage",
        "New england brand sausage",
        "OSCAR MAYER",
        "OSCAR MAYER. Bologna (Wisconsin made ring)",
        "LOUIS RICH",
        "Turkey bacon",
        "BUTCHER BOY MEATS",
        "CARL BUDDIG",
        "CARL BUDDIG. Cooked Smoked Beef Pastrami",
        "HORMEL SPAM",
        "HORMEL Pillow Pak Sliced Turkey Pepperoni",
        "HORMEL WRANGLER Beef Franks",
        "Liverwurst spread",
        "Roast beef spread",
        "Swisswurst",
        "Bacon and beef sticks",
        "Yachtwurst",
        "Chicken breast",
        "Oven-roasted chicken breast roll",
        "Macaroni and cheese loaf",
        "Scrapple",
        "Beef sausage",
        "Pork and turkey sausage",
        "Meatballs",
        "Cereals ready-to-eat",
        "Cereals",
        "Milk and cereal bar",
        "Rice and Wheat cereal bar",
        "Incaparina",
        "Acerola",
        "Acerola juice",
        "Apples",
        "Apple juice",
        "Applesauce",
        "Apricots",
        "Apricot nectar",
        "Avocados",
        "Bananas",
        "Blackberries",
        "Blackberry juice",
        "Cherries",
        "Blueberries",
        "Boysenberries",
        "Breadfruit",
        "Carambola",
        "Carissa",
        "Cherimoya",
        "Crabapples",
        "Cranberries",
        "Cranberry sauce",
        "Cranberry-orange relish",
        "Currants",
        "Custard-apple",
        "Dates",
        "Elderberries",
        "Figs",
        "Fruit cocktail",
        "Fruit salad",
        "Gooseberries",
        "Grapefruit",
        "Grapefruit juice",
        "Grapes",
        "Grape juice",
        "Groundcherries",
        "Guavas",
        "Guava sauce",
        "Jackfruit",
        "Java-plum",
        "Jujube",
        "Kiwifruit",
        "Kumquats",
        "Lemons",
    ]