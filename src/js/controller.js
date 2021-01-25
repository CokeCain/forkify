import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js'
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import PaginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

//import { render } from 'sass';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';


/* if (module.hot) {
  module.hot.accept();
} */

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////



const controlRecipes = async function () {
  try {

    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    //0. Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // 1. loading recipe
    await model.loadRecipe(id);

    // 2. rendering recipe
    recipeView.render(model.state.recipe);

    //controlServings();


  }
  catch (err) {
    // console.log(`this is our error: ${err} `);
    //throw err;
    recipeView.renderError(); console.log(err);
  };
}

//controlRecipes();

/* window.addEventListener('hashchange', controlRecipes);
window.addEventListener('load', controlRecipes); */

// window.addEventListener('hashchange', controlRecipes);

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResults(query);
    //console.log(model.state.search.results);
    //resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    PaginationView.render(model.state.search);

  }
  catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {

  // render new results
  resultsView.render(model.getSearchResultsPage(goToPage));
  //render new pagination buttons
  PaginationView.render(model.state.search);

};

const controlServings = function (newServings) {
  //update recipe servings (in state)
  model.updateServings(newServings);

  //update the recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);

};

const controlAddBookmark = function () {

  // 1. add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2. update recipe view
  recipeView.update(model.state.recipe);

  // 3. render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function (newRecipe) {
  try {

    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    //change id in the URL

    window.history.pushState(null, '', `#${model.state.recipe.id}`);


    setTimeout(() => {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000);

  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
  //console.log(newRecipe);
}


const newFeature = function () {
  console.log('testing continuous integration');
}

const init = function () {
  //  console.log(controlRecipes);
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);

  searchView.addHandlerSearch(controlSearchResults);

  PaginationView.addHandlerClick(controlPagination);

  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();