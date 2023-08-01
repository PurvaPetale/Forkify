import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import receipeView from './views/receipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

// if (module.hot) {
//   module.hot.accept();
// }
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    receipeView.renderSpinner();

    //0)Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    //1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //2) loading recipe
    await model.loadRecipe(id);

    //3) Rendering recipe
    receipeView.render(model.state.recipe);
  } catch (err) {
    console.log(err);
    receipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2) Load Search Results
    await model.loadSearchResults(query);

    //3) Render Results
    //console.log(model.state.search.results);
    //resultsView.render(model.state.search.results);

    resultsView.render(model.getSearchResultsPage());

    //4) Render Initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //1) Render NEW Results

  resultsView.render(model.getSearchResultsPage(goToPage));

  //2) Render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update the recipe servings (in state)
  model.updateServings(newServings);

  //Update the rrecipe view
  // receipeView.render(model.state.recipe);
  receipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1) Add/Remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  receipeView.update(model.state.recipe);

  //3) Render bookmark
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();

    //Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render recipe in recipe view
    receipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('❌', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  receipeView.addHandlerRender(controlRecipes);
  receipeView.addHandlerUpadateServings(controlServings);
  receipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
