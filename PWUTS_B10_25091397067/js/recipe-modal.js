/**
 * Modal detail resep: foto, bahan, langkah, kalkulator porsi, dan favorit.
 * Dibuka dengan mengklik kartu resep (di beranda maupun katalog).
 */
(function (app) {
  'use strict';

  var utils = app.utils;
  var storage = app.storage;
  var limits = app.config.portionLimits;
  var $modal, $body;
  var currentRecipe = null;
  var currentServings = 0;

  /* ---------- Penyusun HTML ---------- */

  function buildRatingStars(rating) {
    var filled = Math.round(rating);
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  }

  function buildMeta(recipe) {
    return '<p class="meta">' +
      '<span>' + utils.findCategoryName(recipe.categoryId) + '</span>' +
      '<span>⏱ ' + recipe.cookTime + ' menit</span>' +
      '<span>Tingkat: ' + utils.escapeHtml(recipe.difficulty) + '</span>' +
      '<span class="star">' + buildRatingStars(recipe.rating) + ' ' + utils.formatRatingLabel(recipe.rating) + '</span>' +
      '</p>';
  }

  function buildFavoriteButton() {
    var label = storage.isFavorite(currentRecipe.id) ? '♥ Tersimpan di favorit' : '♡ Simpan ke favorit';
    return '<button id="fav" class="btn ghost sm">' + label + '</button>';
  }

  function buildPortionControl() {
    return '<span class="calc">Porsi ' +
      '<button class="pm" data-d="-1" aria-label="Kurangi porsi">−</button>' +
      '<b>' + currentServings + '</b>' +
      '<button class="pm" data-d="1" aria-label="Tambah porsi">+</button>' +
      '</span>';
  }

  /** Takaran yang tidak berangka (mis. "secukupnya") ditampilkan apa adanya. */
  function buildIngredientLabel(ingredient, scale) {
    if (ingredient.quantity == null) { return ingredient.unit; }
    return $.trim(utils.formatNumber(ingredient.quantity * scale) + ' ' + ingredient.unit);
  }

  function buildIngredientSection() {
    var scale = currentServings / currentRecipe.servings;
    var items = currentRecipe.ingredients.map(function (ingredient) {
      return '<li><b>' + utils.escapeHtml(buildIngredientLabel(ingredient, scale)) + '</b> ' +
        utils.escapeHtml(ingredient.name) + '</li>';
    });
    return '<h3>Bahan ' + buildPortionControl() + '</h3><ul>' + items.join('') + '</ul>';
  }

  function buildStepSection() {
    var items = currentRecipe.steps.map(function (step) {
      return '<li>' + utils.escapeHtml(step) + '</li>';
    });
    return '<h3>Langkah</h3><ol>' + items.join('') + '</ol>';
  }

  /* ---------- Tampilan ---------- */

  function render() {
    $body.html(
      '<img class="mimg" src="' + utils.escapeHtml(utils.resolveImageUrl(currentRecipe.image)) + '" alt="">' +
      '<h2>' + utils.escapeHtml(currentRecipe.title) + '</h2>' +
      buildMeta(currentRecipe) +
      '<p>' + utils.escapeHtml(currentRecipe.description) + '</p>' +
      buildFavoriteButton() +
      buildIngredientSection() +
      buildStepSection()
    );
  }

  function open(recipeId) {
    currentRecipe = utils.findRecipe(recipeId);
    currentServings = currentRecipe.servings;
    render();
    $modal.addClass('on');
    $('body').css('overflow', 'hidden');
    $modal.find('.x').focus();
  }

  function close() {
    $modal.removeClass('on');
    $('body').css('overflow', '');
  }

  function changeServings(step) {
    currentServings = Math.max(limits.min, Math.min(limits.max, currentServings + step));
    render();
  }

  /* ---------- Event ---------- */

  $(function () {
    $modal = $('#modal');
    $body = $('#mbody');

    $(document).on('click', '.card', function () {
      open($(this).data('id'));
    });

    $(document).on('keydown', '.card', function (event) {
      if (event.key === 'Enter') { open($(this).data('id')); }
    });

    $(document).on('click', '.pm', function () {
      changeServings(+$(this).data('d'));
    });

    $(document).on('click', '#fav', function () {
      storage.toggleFavorite(currentRecipe.id);
      render();
    });

    // Klik area gelap atau tombol silang menutup modal
    $modal.on('click', function (event) {
      if (event.target === this || $(event.target).hasClass('x')) { close(); }
    });

    $(document).on('keydown', function (event) {
      if (event.key === 'Escape') { close(); }
    });
  });

  app.recipeModal = { open: open, close: close };
})(window.ResepKita);
