//VARIABLES------------------------------------------------------------------------------
let INGREDIENTS = []

//FUNCTIONS -------------------------------------------------------------------------------
function addItems(){
    let newIngredient = $(".form-control").val()    //Gets the value of the new ingredient from user input
    $(".form-control").val('')                      // resets the value of the input. 
    INGREDIENTS.push(newIngredient)                 // pushes the new input in into the array of inputs
    $(".ingredients-container").append(`<div id=${INGREDIENTS.indexOf(`${newIngredient}`)} class="ingredient-wrapper"><button class="btn btn-outline-secondary" value="${newIngredient}" type="button" onclick="deleteIngredient(this.value)">X</button><span class='ingredient'>\t${newIngredient}</span></div>`);
    callApi()                                       // Makes an API call each time a user inputs a new ingredient
}

function deleteIngredient(ingredient){
    let idOfIngredientToRemove = INGREDIENTS.indexOf(`${ingredient}`)
    INGREDIENTS.splice(idOfIngredientToRemove,1);
    $(`#${idOfIngredientToRemove}`).remove();
    callApi()
}

function callApi(){
    if(INGREDIENTS.length === 0){
        return
    }else{
        var ingredientslist = ''
        for(let i=0; i<INGREDIENTS.length; i++){
            ingredientslist+= `&allowedIngredient=${INGREDIENTS[i]}`
        }
        console.log("ingredientslist: ", ingredientslist)
        $.ajax({
            url: `http://api.yummly.com/v1/api/recipes?_app_id=ab4906ff&_app_key=25c71a2c8b446d9ef17b082ae3451972&requirePictures=true${ingredientslist}`,
          }).done(function(response) {
            console.log("API call response : ",response)
            organizeDataInUI(response)
          });
    }
}

function organizeDataInUI(response){
    if(response){
        if(response.totalMatchCount === 0 || INGREDIENTS.length === 0 ){
            return 
        }else{
            console.log("response.matches.length : ", response.matches.length)
            console.log("response.matches: ",response.matches)
            for(let i=0; i<response.matches.length; i++){
                
                $(`.resutls-container`).append(`
                    <div>
                        <p class="recipe-name">${response.matches[i].recipeName}</p>
                        <ul id="recipe-ingredients-${i}"></ul>
                        <div class="recipe-image-container">
                            <img src="${response.matches[i].imageUrlsBySize['90']}">
                        </div>
                        <p>${response.matches[i].rating}</p>
                        <p>It takes: ${converNumberOfSecondToReadeableString(response.matches[i].totalTimeInSeconds)} to</p>
                    <div>            
                `)
                for(let j=0; j<response.matches[i].ingredients.length; j++){
                    console.log(`response.matches[${i}].ingredients[${j}]: `,response.matches[i].ingredients[j])
                    $(`#recipe-ingredients-${i}`).append(`<li class="Item">${response.matches[i].ingredients[j]}</li>`)
                }
                console.log('\n\n----------------------')
            }
        }
    }
}

function converNumberOfSecondToReadeableString(someNumberOfSeconds){
    var date = new Date(null);
    date.setSeconds(someNumberOfSeconds); // specify value for SECONDS here
    return date.toISOString().substr(11, 8);
}

document.getElementById("delet").onclick = function () {
    document.getElementById("ingredient").innerHTML = "";
};