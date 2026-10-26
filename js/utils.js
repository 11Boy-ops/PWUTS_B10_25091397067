/**
 * Fungsi bantu yang dipakai lintas modul: aman-teks, format angka,
 * pencarian data, alamat gambar, dan pemecah teks takaran.
 */
(function (app) {
  'use strict';

  /** Mengubah teks menjadi aman untuk disisipkan ke HTML, termasuk di dalam atribut. */
  function escapeHtml(text) {
    var safeText = $('<i>').text(text == null ? '' : text).html();
    return safeText.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Membulatkan maksimal 2 desimal tanpa nol di belakang (1.50 menjadi "1.5"). */
  function formatNumber(value) {
    return String(+value.toFixed(2));
  }

  function findCategoryName(categoryId) {
    var category = app.data.categories.filter(function (item) {
      return item.id == categoryId;
    })[0];
    return category ? category.name : '';
  }

  function findRecipe(recipeId) {
    return app.data.recipes.filter(function (recipe) {
      return recipe.id == recipeId;
    })[0];
  }

  /**
   * Gambar bawaan berupa nama file di folder images/, sedangkan foto dari
   * form unggah berupa data URL yang disimpan langsung di localStorage.
   */
  function resolveImageUrl(image) {
    return /^data:image\//.test(image) ? image : 'images/' + image;
  }

  /** Resep yang baru diunggah belum punya rating (0), jadi ditampilkan "Baru". */
  function formatRatingLabel(rating) {
    return rating > 0 ? String(rating) : 'Baru';
  }

  /* ---------- Takaran ---------- */

  /** Mengubah "2", "2,5", "1/2", atau "1 1/2" menjadi angka. Hasil NaN jika tidak valid. */
  function toNumber(text) {
    return text.split(/\s+/).reduce(function (total, part) {
      if (part.indexOf('/') < 0) { return total + parseFloat(part.replace(',', '.')); }
      var fraction = part.split('/');
      return total + (+fraction[1] ? +fraction[0] / +fraction[1] : NaN);
    }, 0);
  }

  /**
   * Memecah teks takaran dari form menjadi angka dan satuan agar bisa diskalakan
   * oleh kalkulator porsi: "2 sdm" menjadi { quantity: 2, unit: 'sdm' } dan
   * "1 1/2 gelas" menjadi { quantity: 1.5, unit: 'gelas' }. Teks tanpa angka di
   * depan ("secukupnya") atau berupa rentang ("2-3 siung") tidak bisa diskalakan,
   * sehingga quantity bernilai null dan unit berisi teks aslinya.
   */
  function parseQuantity(text) {
    var original = $.trim(text);
    var match = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)\s*(.*)$/.exec(original);
    var isRange = match && /^[-–]\s*\d/.test(match[2]);
    var value = match ? toNumber(match[1]) : NaN;

    if (!match || isRange || !(value > 0)) { return { quantity: null, unit: original }; }
    return { quantity: value, unit: match[2] };
  }

  app.utils = {
    escapeHtml: escapeHtml,
    formatNumber: formatNumber,
    findCategoryName: findCategoryName,
    findRecipe: findRecipe,
    resolveImageUrl: resolveImageUrl,
    formatRatingLabel: formatRatingLabel,
    parseQuantity: parseQuantity
  };
})(window.ResepKita);
