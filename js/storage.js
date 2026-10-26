/**
 * Penyimpanan data di browser (localStorage), menggantikan server dan database:
 * resep favorit dan resep yang diunggah pengguna lewat form.
 * Data hanya ada di browser dan perangkat yang sama.
 */
(function (app) {
  'use strict';

  var config = app.config;

  /* ---------- Baca dan tulis JSON ---------- */

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  /** Mengembalikan false jika penyimpanan penuh atau tidak tersedia (mode privat). */
  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  /* ---------- Favorit ---------- */

  function loadFavoriteIds() {
    var ids = readJson(config.favoritesStorageKey, []);
    return $.isArray(ids) ? ids : [];
  }

  function isFavorite(recipeId) {
    return loadFavoriteIds().indexOf(recipeId) > -1;
  }

  function toggleFavorite(recipeId) {
    var ids = loadFavoriteIds();
    var position = ids.indexOf(recipeId);
    if (position > -1) {
      ids.splice(position, 1);
    } else {
      ids.push(recipeId);
    }
    writeJson(config.favoritesStorageKey, ids);
  }

  /* ---------- Resep buatan pengguna ---------- */

  /** Data yang rusak atau diubah manual dibuang agar tidak merusak tampilan katalog. */
  function isValidRecipe(recipe) {
    return !!recipe && recipe.id != null &&
      typeof recipe.title === 'string' && typeof recipe.image === 'string' &&
      typeof recipe.servings === 'number' && typeof recipe.cookTime === 'number' &&
      $.isArray(recipe.ingredients) && $.isArray(recipe.steps);
  }

  function loadUserRecipes() {
    var recipes = readJson(config.userRecipesStorageKey, []);
    return $.isArray(recipes) ? recipes.filter(isValidRecipe) : [];
  }

  /** Menambahkan satu resep. Mengembalikan false jika penyimpanan browser penuh. */
  function saveUserRecipe(recipe) {
    var recipes = loadUserRecipes();
    recipes.push(recipe);
    return writeJson(config.userRecipesStorageKey, recipes);
  }

  app.storage = {
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite,
    loadUserRecipes: loadUserRecipes,
    saveUserRecipe: saveUserRecipe
  };
})(window.ResepKita);
