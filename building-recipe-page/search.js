// /VARIABLES------------------------------------------------------------------------------
let INGREDIENTS = []

//FUNCTIONS -------------------------------------------------------------------------------
function addItems(){
    // Gets the value of the new ingredient from user input
    let newIngredient = $(".form-control").val()    
    // Resets the value of the input. 
    $(".form-control").val('')                      
    // Pushes the new input in into the array of inputs
    INGREDIENTS.push(newIngredient)                 
    $(".ingredients-container").append(`<div id=${INGREDIENTS.indexOf(`${newIngredient}`)} class="ingredient-wrapper"><button class="btn btn-outline-secondary" value="${newIngredient}" type="button" onclick="deleteIngredient(this.value)">X</button><span class='ingredient'>\t${newIngredient}</span></div>`);
    // Makes an API call each time a user inputs a new ingredient
    callApi()                                       
}

function deleteIngredient(ingredient){
    let idOfIngredientToRemove = INGREDIENTS.indexOf(`${ingredient}`)
    INGREDIENTS.splice(idOfIngredientToRemove,1);
    $(`#${idOfIngredientToRemove}`).remove();
    callApi()
}

function callApi(){
    $(".results-container-child").remove()  // This removes old data by removing the child container
    // Then we append a new child to the parent div so organizeDataInUI() function can append to.
    $(".results-container-parent").append('<div class="results-container-child"></div>')// creates a new fresh container
    if(INGREDIENTS.length === 0){
        return
    }else{
        var ingredientslist = ''
        for(let i=0; i<INGREDIENTS.length; i++){
            ingredientslist+= `&allowedIngredient=${INGREDIENTS[i]}`
        }
        $.ajax({url:`http://api.yummly.com/v1/api/recipes?_app_id=ab4906ff&_app_key=25c71a2c8b446d9ef17b082ae3451972&requirePictures=true${ingredientslist}`}).done(function(response) {
            console.log('RESPONSE: ', response)
            organizeDataInUI(response)
          });
    }
}

function organizeDataInUI(response){
    if(response){
        if(response.totalMatchCount === 0 || INGREDIENTS.length === 0 ){
            return 
        }else{
            for(let i=0; i<response.matches.length; i++){
                console.log(`response.matches[${i}].flavors: `, response.matches[i].flavors)
                $(`.results-container-child`).append(`
                    <div class="recipe-container">
                        <p class="recipe-name">${response.matches[i].recipeName}</p>
                        <p class="recipe-source">SOURCE: ${response.matches[i].sourceDisplayName}</p>
                        <ul class="recipe-ingredients-${i}"></ul>
                        <div class="recipe-image-container"><img class="recipe-image" src="${response.matches[i].imageUrlsBySize['90']}"></div>
                        <p class="recipe-rating"> RATING : ${response.matches[i].rating}</p>
                        <p> TIME TO MAKE : ${converNumberOfSecondToReadeableString(response.matches[i].totalTimeInSeconds)} seconds</p>
                        <div class="recipe-flavors"">
                            <ul class="recipe-flavors-ul">
                                <li class="recipe-flavors-li" > Bitter  : ${ response.matches[i].flavors !== null ? response.matches[i].flavors['bitter']  : 'N/A'}   </li>
                                <li class="recipe-flavors-li" > Meaty   : ${ response.matches[i].flavors !== null ? response.matches[i].flavors['meaty']   : 'N/A'}   </li>
                                <li class="recipe-flavors-li" > Piquant : ${ response.matches[i].flavors !== null ? response.matches[i].flavors['piquant'] : 'N/A'}   </li>
                                <li class="recipe-flavors-li" > Salty   : ${ response.matches[i].flavors !== null ? response.matches[i].flavors['salty']   : 'N/A'}   </li>
                                <li class="recipe-flavors-li" > Sour    : ${ response.matches[i].flavors !== null ? response.matches[i].flavors['sour']    : 'N/A'}   </li>
                                <li class="recipe-flavors-li" > Sweet   : ${ response.matches[i].flavors !== null ? response.matches[i].flavors['sweet']   : 'N/A'}   </li>
                            </ul>    
                        </div>
                        <div class="recipe-heart-container">
                            <?xml version="1.0" ?>
                                <svg  class="recipe-heart-svg" height="24" version="1.1" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
                                    <g transform="translate(0 -1028.4)">
                                        <path d="m7 1031.4c-1.5355 0-3.0784 0.5-4.25 1.7-2.3431 2.4-2.2788 6.1 0 8.5l9.25 9.8 9.25-9.8c2.279-2.4 2.343-6.1 0-8.5-2.343-2.3-6.157-2.3-8.5 0l-0.75 0.8-0.75-0.8c-1.172-1.2-2.7145-1.7-4.25-1.7z" fill="#c0392b"/>
                                    </g>
                                </svg>
                        </div>
                    <div>            
                `)
                for(let j=0; j<response.matches[i].ingredients.length; j++){
                    $(`.recipe-ingredients-${i}`).append(`<li class="recipe-ingredient">${response.matches[i].ingredients[j]}</li>`)
                }
            }
        }
    }
}

function converNumberOfSecondToReadeableString(someNumberOfSeconds){
    var date = new Date(null);
    date.setSeconds(someNumberOfSeconds); // specify value for SECONDS here
    return date.toISOString().substr(11, 8);
}
Collapse

