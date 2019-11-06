import Search from "./models/Serach"
import List from "./models/List"
import * as likesView from "./view/likesView"
import {elements, renderLoader,clearLoader } from "./view/base";
import * as recipeView from "./view/recipeView";
import * as searchView from "./view/searchView";
import * as listView from "./view/listView";

import Recipe from "./models/Recipe";
import Likes from "./models/Likes";


/**the global state for the app
 * search object
 * current recip object
 * shoppin g list obj
 * liked recipe
*/
const state = {};
/**
 * Search Controler
 */

const controlSearch = async () =>{
    /**
     * get query from view
     * 
     */
    const query = searchView.getInput();
    // todo
    if(query) {
        state.search = new Search(query);
    }
    // prepare the ui for result
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    try{
    // search for recipe
    await state.search.getResults()
    
    // render resuults in ui
    clearLoader();
    searchView.renderResults(state.search.result);
    }
    catch(error){
        alert("somting went wrong in seraching the product....");
        clearLoader();
    }
}

elements.searchForm.addEventListener("submit", e=>{
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener("click",e =>{
    const btn = e.target.closest(".btn-inline");
    if (btn){
        const goToPage = parseInt(btn.dataset.goto,10);
        searchView.clearResults();
        searchView.renderResults(state.search.result,goToPage);
    } 
})

/**
 * Recipe Controler
 */
/*
const r = new Recipe(41470);
r.getRecipe();
console.log(r);
*/
const controlRecipe=  async () =>{
    // get id from url
    const id = window.location.hash.replace("#","");
    if (id){
        // prepare ui for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        //highlight selected search item
        if (state.search) searchView.highlightSelected(id);
        // create new recipe obj.
        state.recipe = new Recipe(id);
        // TESTING
        window.r = state.recipe;
        try {
            //get recipe data and pars ingredints
            await state.recipe.getRecipe();
           // console.log(state.recipe.ingrediens);
            state.recipe.parseIngredints ();

            //calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        }
        catch(error) {
            alert("somting went wrong- in index.js...." + error);
        }
    }
}




["hashchange", "load"].forEach(event => window.addEventListener(event, controlRecipe));
/**
 * list controler
 * 
 */

 const controlList = () =>{
    // create new list if the is none yet
    if (!state.list) state.list = new List();
    // add ingredints to the list and to ui
    state.recipe.ingrediens.forEach(el =>{
        const item = state.list.addItem(el.count, el.unit, el.ingredint);  
        listView.renderItem(item);
    })
 };

 //handle delete and update events
 elements.shooping.addEventListener("click", e => {
    const id =  e.target.closest(".shopping__item").dataset.itemid;
   
    // handle delete button
    if (e.target.matches(".shopping__delete , .shopping__delete *")){
        // delete from state
        state.list.deleteItem(id);
        //delete from ui
        listView.deleteItem(id);
    }else if (e.target.matches(".shooping__count-value")){
        const val = parseFloat(e.target.value);
        state.list.updateCount(id,val);
    }

 });
/**
 * 
 * likes controler
 */




const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const curId = state.recipe.id;
    //user has not yet liked cur recipe
    if (!state.likes.isLiked(curId)){
        // add like to the state
        const newLike = state.likes.addLike(
            curId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // toggle the like button
        likesView.toggleLikeBtn(true);

        //add like to ui list
        likesView.renderLike(newLike);
    }//user has yet liked cur recipe
    else{
        // remove like from state
        state.likes.deleteLike(curId);
        // toggle the like button
        likesView.toggleLikeBtn(false);
        //remove like to ui list
        likesView.deleteLike(curId);
    }
    likesView.toggleLikeMenu (state.likes.getNumLikes());

}

// Restore likes recipes in page load
window.addEventListener("load",() =>{
    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu (state.likes.getNumLikes());
    state.likes.likes.forEach(like => likesView.renderLike(like));
} )


// handeling recipe buuton clicks 
elements.recipe.addEventListener("click", e=>{
    if (e.target.matches(".btn-decrease, .btn-decrease *")){
        // decrese is clicker
        if (state.recipe.servings >1){
            state.recipe.updateServings("dec");
           recipeView.updateServingsIngredints(state.recipe);
        }
    }else if (e.target.matches(".btn-increase, .btn-increase *")){
        // increase is clicker
        state.recipe.updateServings("inc");
        recipeView.updateServingsIngredints(state.recipe);
    }else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")){
        controlList();
    }else if (e.target.matches(".recipe__love, .recipe__love *")){
        controlLike();
    }
});



