/**
 * Halaman Katalog Resep (item 2.b): kartu resep, pencarian, filter, dan urutan.
 * Dipakai juga oleh beranda untuk menampilkan kartu resep pilihan.
 */
(function (app) {
  'use strict';

  var utils = app.utils;
  var filters = app.filters;

  function renderCard(recipe) {
    return '<article class="card" tabindex="0" data-id="' + recipe.id + '">' +
      '<img src="' + utils.escapeHtml(utils.resolveImageUrl(recipe.image)) + '" alt="' + utils.escapeHtml(recipe.title) + '">' +
      '<div class="cb">' +
        '<span class="tag">' + utils.findCategoryName(recipe.categoryId) + '</span>' +
        '<h3>' + utils.escapeHtml(recipe.title) + '</h3>' +
        '<p class="meta">' +
          '<span>⏱ ' + recipe.cookTime + ' menit</span>' +
          '<span>🍽 ' + recipe.servings + ' porsi</span>' +
          '<span class="star">★ ' + utils.formatRatingLabel(recipe.rating) + '</span>' +
        '</p>' +
      '</div></article>';
  }

  /* ---------- Penyaringan ---------- */

  function matchesKeyword(recipe, keyword) {
    if (!keyword) { return true; }
    var ingredientNames = recipe.ingredients.map(function (item) { return item.name; }).join(' ');
    return (recipe.title + ' ' + ingredientNames).toLowerCase().indexOf(keyword) > -1;
  }

  function matchesFilters(recipe, keyword) {
    return (!filters.categoryId || recipe.categoryId == filters.categoryId) &&
      (!filters.maxCookTime || recipe.cookTime <= filters.maxCookTime) &&
      (!filters.difficulty || recipe.difficulty === filters.difficulty) &&
      matchesKeyword(recipe, keyword);
  }

  function sortRecipes(recipes) {
    var byRating = function (a, b) { return b.rating - a.rating; };
    var byCookTime = function (a, b) { return a.cookTime - b.cookTime; };
    return recipes.sort(filters.sortBy === 'rating' ? byRating : byCookTime);
  }

  function getVisibleRecipes() {
    var keyword = $.trim(filters.keyword).toLowerCase();
    var matched = app.data.recipes.filter(function (recipe) {
      return matchesFilters(recipe, keyword);
    });
    return sortRecipes(matched);
  }

  /* ---------- Tampilan ---------- */

  function render() {
    var $grid = $('#grid');
    if (!$grid.length) { return; }   // halaman katalog belum dimuat

    var recipes = getVisibleRecipes();
    $grid.html(recipes.map(renderCard).join(''));
    $('#empty').prop('hidden', recipes.length > 0);
    $('#count').text(recipes.length + ' resep ditemukan');
  }

  function highlightActiveCategory() {
    $('.chip').removeClass('on')
      .filter('[data-c="' + filters.categoryId + '"]').addClass('on');
  }

  function renderCategoryChips() {
    var names = ['Semua'].concat(app.data.categories.map(function (category) { return category.name; }));
    // Indeks chip sama dengan id kategori (0 = Semua, 1..n = kategori)
    $('#chips').html(names.map(function (name, index) {
      return '<button type="button" class="chip" data-c="' + index + '">' + name + '</button>';
    }).join(''));
  }

  /** Dipanggil setiap kali halaman katalog selesai dimuat lewat Ajax. */
  function init() {
    renderCategoryChips();
    $('#fTime').val(filters.maxCookTime);
    $('#fDiff').val(filters.difficulty);
    $('#fSort').val(filters.sortBy);
    highlightActiveCategory();
    render();
  }

  /* ---------- Event (delegasi, karena halaman dimuat dinamis) ---------- */

  $(document).on('click', '.chip', function () {
    filters.categoryId = +$(this).data('c');
    highlightActiveCategory();
    render();
  });

  $(document).on('change', '#fTime, #fDiff, #fSort', function () {
    filters.maxCookTime = +$('#fTime').val();
    filters.difficulty = $('#fDiff').val();
    filters.sortBy = $('#fSort').val();
    render();
  });

  app.catalog = { init: init, render: render, renderCard: renderCard };
})(window.ResepKita);
