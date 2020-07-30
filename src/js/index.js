import Search from "./models/Search"
import Recipe from "./models/Recipe"
import List from "./models/List"
import Likes from "./models/Likes"
import * as searchView from "./views/searchView"
import * as recipeView from "./views/recipeView"
import * as listView from "./views/listView"
import * as likesView from "./views/likesView"
import { elements, renderLoader, clearLoader } from "./views/base"

// Global state of the App

// Search object

// Shopping list object

// Liked recipes

const state = {}

//SEARCH CONTROLLER

const controlSearch = async () => {
    //get query from view
    const query = searchView.getInput()

    if(query){
        //new search and add to state
        state.search = new Search(query)

        //prepare UI search
        searchView.clearInput()
        searchView.clearResults()
        renderLoader(elements.searchRes)

        try{
            //search for recipe
            await state.search.getResults()
            clearLoader()
            
            //render results on UI
            searchView.renderResults(state.search.result) 
        }catch(err){
            alert("something wrong with the search...")
            clearLoader()
        }
    }
}

elements.searchBtn.addEventListener("submit", (e) => {
    e.preventDefault()
    controlSearch()
})

elements.searchResPages.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-inline")
    if(btn){
        const goToPage = Number(btn.dataset.goto)
        searchView.clearResults()
        searchView.renderResults(state.search.result, goToPage)
    }
});

//RECIPE CONTROLLER
const controlRecipe = async () => {
    //get id from URL
    const id = window.location.hash.replace("#", "")
    if(id){
        //prepare UI for id changes
        recipeView.clearRecipe()
        renderLoader(elements.recipe)
        //highlight selected
        if(state.search) searchView.highlightSelected(id)
        //create new recipe object
        state.recipe = new Recipe(id) 

        try {
            //get recipe data and parse ingredient
            await state.recipe.getRecipe()
            state.recipe.parseIngredients()
            //calculate the serving and time
            state.recipe.calculateCookTime()
            state.recipe.calculateServings()

            //render the recipe
            clearLoader()
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id))  
        }catch(err){
            alert("Error processing recipe")
        }  
    }
}

["hashchange", "load"].forEach(event => 
    window.addEventListener(event, controlRecipe)
);

//list control
const controlList = () => {
    //create a new list if there is none yet
    if(!state.list) state.list = new List()
    //add each ingredient to the list
    state.recipe.ingredients.forEach(ing => {
        const item = state.list.addItem(ing.count, ing.unit, ing.ingredient)
        listView.renderItem(item)
    })
}

//handling delete and update the list
elements.shopping.addEventListener("click",  e => {
    const id = e.target.closest(".shopping__item").dataset.itemid
    //handle the delete btn
    if(e.target.matches(".shopping__delete, .shopping__delete *")){
        state.list.deleteItem(id)
        listView.deleteItem(id)
    }else if(e.target.matches(".shopping__count-value")){
        const value = parseFloat(e.target.value)
        state.list.updateCount(id, value)
    }
})

//likes control
const controlLike = () => {
    //create new likes if none yet
    if(!state.likes) state.likes = new Likes()
    const currentID = state.recipe.id

    //user has NOT yet like the current ID
    if(!state.likes.isLiked(currentID)){
        //add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )
        //toggle the like button
        likesView.toggleLikeBtn(true)
        //add like to the UI
        likesView.renderLike(newLike)
    //user HAS liked the current ID
    }else {
        //remove like from the state
        state.likes.deleteLike(currentID)
        //toggle the like button
        likesView.toggleLikeBtn(false)
        //remove like from the UI
        likesView.deleteLike(currentID)
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes())
}

//restore liked recipe on page load
window.addEventListener("load", () => {
    state.likes = new Likes()
    state.likes.readStorage()
    likesView.toggleLikeMenu(state.likes.getNumLikes())
    state.likes.likes.forEach(like => likesView.renderLike(like))
})

//handling recipe button clicks
elements.recipe.addEventListener("click", e => {
    if(e.target.matches(".btn-decrease, .btn-decrease *")){
        if(state.recipe.servings > 1){
            state.recipe.updateServings("dec")
            recipeView.updateServingsIngredients(state.recipe)
        } 
    }else if(e.target.matches(".btn-increase, .btn-increase *")){
        state.recipe.updateServings("inc")
        recipeView.updateServingsIngredients(state.recipe)
    }else if(e.target.matches(".recipe__btn--add, recipe__btn--add *")){
        controlList()
    }else if(e.target.matches(".recipe__love, .recipe__love *")){
        controlLike()
    }
})