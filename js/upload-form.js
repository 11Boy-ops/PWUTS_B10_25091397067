/**
 * Halaman Unggah Resep (item 2.c): baris bahan dan langkah dinamis,
 * validasi jQuery sebelum submit, lalu penyimpanan resep ke localStorage.
 */
(function (app) {
  'use strict';

  var utils = app.utils;
  var storage = app.storage;
  var rules = app.config.validation;
  var photoSettings = app.config.photoStorage;
  var PHOTO_FAILED_MESSAGE = 'Foto tidak bisa diproses. Coba pilih foto lain.';
  var STORAGE_FULL_MESSAGE = 'Resep gagal disimpan karena penyimpanan browser penuh atau dinonaktifkan (mode privat). Coba foto yang lebih kecil.';

  /* ---------- Baris bahan dan langkah ---------- */

  function buildIngredientRow() {
    return '<div class="row">' +
      '<input name="ingredient_name[]" placeholder="Nama bahan" aria-label="Nama bahan">' +
      '<input name="quantity[]" placeholder="Takaran, mis. 2 sdm" aria-label="Takaran">' +
      '<button type="button" class="del" aria-label="Hapus bahan">×</button></div>';
  }

  function buildStepRow() {
    return '<div class="row">' +
      '<textarea name="instruction[]" rows="2" placeholder="Tulis langkah memasak" aria-label="Langkah"></textarea>' +
      '<button type="button" class="del" aria-label="Hapus langkah">×</button></div>';
  }

  function resetRows() {
    $('#listB').html(buildIngredientRow());
    $('#listL').html(buildStepRow());
  }

  function addRow(listSelector, buildRow) {
    var $list = $(listSelector);
    if ($list.children().length < rules.maxRowsPerList) { $list.append(buildRow()); }
  }

  /** Dipanggil setiap kali halaman unggah selesai dimuat lewat Ajax. */
  function init() {
    var options = app.data.categories.map(function (category) {
      return '<option value="' + category.id + '">' + category.name + '</option>';
    });
    $('#category_id').append(options.join(''));
    resetRows();
  }

  /* ---------- Validasi ---------- */

  function getField(name) {
    return $('#formResep').find('[name="' + name + '"]');
  }

  function clearErrors() {
    $('#formResep .invalid').removeClass('invalid');
    $('#formResep .err').text('');
  }

  /** Menandai field salah dan menampilkan pesannya. Selalu mengembalikan false. */
  function markInvalid($element, message) {
    $element.addClass('invalid');
    $element.closest('.fg').find('.err').first().text(message);
    return false;
  }

  function validateMinLength(name, minLength, message) {
    var $field = getField(name);
    return $.trim($field.val()).length >= minLength || markInvalid($field, message);
  }

  function validateSelected(name, message) {
    var $field = getField(name);
    return !!$field.val() || markInvalid($field, message);
  }

  function validateNumberInRange(name, range, message) {
    var $field = getField(name);
    var value = +$field.val();
    return (value >= range.min && value <= range.max) || markInvalid($field, message);
  }

  function validatePhoto() {
    var $field = getField('photo');
    var file = $field[0].files[0];
    if (!file) { return markInvalid($field, 'Pilih foto resep.'); }
    if (rules.photoAllowedTypes.indexOf(file.type) < 0) {
      return markInvalid($field, 'Format foto harus JPG, PNG, atau WEBP.');
    }
    if (file.size > rules.photoMaxBytes) { return markInvalid($field, 'Ukuran foto maksimal 2 MB.'); }
    return true;
  }

  /** Setiap baris bahan wajib punya nama dan takaran. */
  function validateIngredients() {
    var isValid = true;
    $('#listB .row').each(function () {
      var hasEmptyInput = false;
      $(this).find('input').each(function () {
        if (!$.trim(this.value)) { $(this).addClass('invalid'); hasEmptyInput = true; }
      });
      if (hasEmptyInput) {
        $('#gB .err').text('Nama bahan dan takaran wajib diisi di setiap baris.');
        isValid = false;
        return false;   // berhenti di baris pertama yang salah
      }
    });
    return isValid;
  }

  /** Setiap langkah wajib minimal stepMinLength karakter. */
  function validateSteps() {
    var isValid = true;
    $('#listL textarea').each(function () {
      if ($.trim(this.value).length < rules.stepMinLength) {
        $(this).addClass('invalid');
        $('#gL .err').text('Setiap langkah minimal ' + rules.stepMinLength + ' karakter.');
        isValid = false;
        return false;
      }
    });
    return isValid;
  }

  function validateForm() {
    clearErrors();
    // Semua validator dijalankan agar seluruh kesalahan tampil sekaligus
    var results = [
      validateMinLength('title', rules.titleMinLength, 'Judul minimal ' + rules.titleMinLength + ' karakter.'),
      validateSelected('category_id', 'Pilih kategori resep.'),
      validateSelected('difficulty', 'Pilih tingkat kesulitan.'),
      validateMinLength('description', rules.descriptionMinLength, 'Deskripsi minimal ' + rules.descriptionMinLength + ' karakter.'),
      validateNumberInRange('servings', rules.servings, 'Isi porsi antara ' + rules.servings.min + ' sampai ' + rules.servings.max + '.'),
      validateNumberInRange('cook_time', rules.cookTimeMinutes, 'Isi waktu antara ' + rules.cookTimeMinutes.min + ' sampai ' + rules.cookTimeMinutes.max + ' menit.'),
      validatePhoto(),
      validateIngredients(),
      validateSteps()
    ];
    var isValid = results.every(Boolean);
    if (!isValid) { $('#formResep .invalid').first().focus(); }
    return isValid;
  }

  /* ---------- Foto ---------- */

  /** Menggambar ulang foto ke canvas dengan sisi terpanjang dibatasi, lalu mengubahnya ke data URL JPEG. */
  function shrinkImage(image) {
    var scale = Math.min(1, photoSettings.maxDimension / Math.max(image.width, image.height));
    var canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    var context = canvas.getContext('2d');
    context.fillStyle = '#fff';   // latar putih agar PNG transparan tidak menjadi hitam di JPEG
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', photoSettings.jpegQuality);
  }

  /**
   * Foto asli (maks. 2 MB) terlalu besar untuk localStorage, jadi diperkecil dulu.
   * Mengembalikan promise yang berisi data URL.
   */
  function readPhoto(file) {
    var result = $.Deferred();
    var reader = new FileReader();

    reader.onload = function (event) {
      var image = new Image();
      image.onload = function () {
        try { result.resolve(shrinkImage(image)); } catch (error) { result.reject(); }
      };
      image.onerror = function () { result.reject(); };
      image.src = event.target.result;
    };
    reader.onerror = function () { result.reject(); };
    reader.readAsDataURL(file);

    return result.promise();
  }

  /* ---------- Penyimpanan lokal ---------- */

  /** Id unik berbasis waktu, jauh di atas id resep bawaan (1, 2, 3, ...). */
  function generateRecipeId() {
    return Date.now();
  }

  /** Mengumpulkan isi form menjadi objek resep dengan struktur yang sama seperti data/recipes.json. */
  function buildRecipe(photoDataUrl) {
    var ingredients = $('#listB .row').map(function () {
      var $inputs = $(this).find('input');
      var amount = utils.parseQuantity($inputs.eq(1).val());
      return { name: $.trim($inputs.eq(0).val()), quantity: amount.quantity, unit: amount.unit };
    }).get();

    var steps = $('#listL textarea').map(function () {
      return $.trim(this.value);
    }).get();

    return {
      id: generateRecipeId(),
      title: $.trim(getField('title').val()),
      categoryId: +getField('category_id').val(),
      image: photoDataUrl,
      cookTime: +getField('cook_time').val(),
      difficulty: getField('difficulty').val(),
      servings: +getField('servings').val(),
      rating: 0,
      description: $.trim(getField('description').val()),
      ingredients: ingredients,
      steps: steps
    };
  }

  function showMessage(type, text) {
    $('#hasil').attr('class', 'note ' + (type === 'success' ? 'ok' : 'bad')).text(text).prop('hidden', false);
  }

  function resetForm(form) {
    form.reset();
    $('#prev').prop('hidden', true);
    resetRows();
  }

  function saveRecipe(form) {
    var $button = $('#kirim').prop('disabled', true).text('Menyimpan...');
    var file = getField('photo')[0].files[0];

    readPhoto(file)
      .done(function (photoDataUrl) {
        var recipe = buildRecipe(photoDataUrl);
        if (!storage.saveUserRecipe(recipe)) {
          showMessage('error', STORAGE_FULL_MESSAGE);
          return;
        }
        app.data.recipes.push(recipe);   // langsung tampil di katalog tanpa memuat ulang
        showMessage('success', 'Resep berhasil disimpan di browser ini dan sudah tampil di Katalog Resep.');
        resetForm(form);
      })
      .fail(function () { showMessage('error', PHOTO_FAILED_MESSAGE); })
      .always(function () { $button.prop('disabled', false).text('Simpan Resep'); });
  }

  /* ---------- Event (delegasi, karena halaman dimuat dinamis) ---------- */

  $(document).on('click', '#addB', function () { addRow('#listB', buildIngredientRow); });
  $(document).on('click', '#addL', function () { addRow('#listL', buildStepRow); });

  // Baris terakhir tidak boleh dihapus
  $(document).on('click', '.del', function () {
    var $row = $(this).closest('.row');
    if ($row.parent().children().length > 1) { $row.remove(); }
  });

  // Pesan error hilang begitu pengguna memperbaiki isian
  $(document).on('input change', '#formResep .invalid', function () {
    $(this).removeClass('invalid').closest('.fg').find('.err').text('');
  });

  $(document).on('change', '#photo', function () {
    var file = this.files[0];
    if (!file || !/^image\//.test(file.type)) { $('#prev').prop('hidden', true); return; }
    var reader = new FileReader();
    reader.onload = function (event) { $('#prev').attr('src', event.target.result).prop('hidden', false); };
    reader.readAsDataURL(file);
  });

  $(document).on('submit', '#formResep', function (event) {
    event.preventDefault();
    if (validateForm()) { saveRecipe(this); }
  });

  app.uploadForm = { init: init };
})(window.ResepKita);
