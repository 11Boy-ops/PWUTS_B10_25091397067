/**
 * Titik masuk aplikasi (item 2.a): memuat data resep, mengatur navigasi
 * berbasis hash (#beranda, #katalog, #unggah), dan memuat halaman lewat Ajax.
 */
(function (app) {
  'use strict';

  var config = app.config;
  var filters = app.filters;

  // Fungsi yang dijalankan setelah halaman Ajax selesai dimuat
  var pageInitializers = {
    katalog: function () { app.catalog.init(); },
    unggah: function () { app.uploadForm.init(); }
  };

  var $homeSection, $pageContent, $mainMenu, $menuToggle, $hero;

  function getCurrentPageName() {
    var name = (location.hash || '#' + config.defaultPage).slice(1);
    return config.pageTitles[name] ? name : config.defaultPage;
  }

  function updateNavigation(pageName) {
    $mainMenu.find('a').removeClass('on').filter('[href="#' + pageName + '"]').addClass('on');
    $mainMenu.removeClass('open');
    $menuToggle.attr('aria-expanded', false);
  }

  function updateHero(pageName) {
    $('#judul').text(config.pageTitles[pageName]);
    $hero.toggleClass('mini', pageName !== config.defaultPage);
    $('#cariHero').toggle(pageName !== 'unggah');
  }

  function showHome() {
    $pageContent.prop('hidden', true).empty();
    $homeSection.prop('hidden', false);
  }

  /** Teknik Ajax: memuat pages/<nama>.html ke dalam layout utama. */
  function loadPageWithAjax(pageName) {
    $homeSection.prop('hidden', true);
    $pageContent.prop('hidden', false).html('<p class="load">Memuat halaman...</p>')
      .load(config.pagesPath + pageName + '.html', function (response, status) {
        if (status === 'error') {
          $pageContent.html('<p class="load">Halaman gagal dimuat. Jalankan lewat server lokal (lihat README).</p>');
          return;
        }
        pageInitializers[pageName]();
      });
  }

  function showPage() {
    var pageName = getCurrentPageName();
    updateNavigation(pageName);
    updateHero(pageName);
    window.scrollTo(0, 0);

    if (pageName === config.defaultPage) { showHome(); } else { loadPageWithAjax(pageName); }
  }

  function renderFeaturedRecipes() {
    var topRated = app.data.recipes.slice().sort(function (a, b) { return b.rating - a.rating; });
    $('#feat').html(topRated.slice(0, config.featuredRecipeCount).map(app.catalog.renderCard).join(''));
  }

  /** Resep bawaan dari JSON digabung dengan resep yang pernah diunggah di browser ini. */
  function loadRecipeData() {
    $.getJSON(config.dataUrl)
      .done(function (data) {
        data.recipes = data.recipes.concat(app.storage.loadUserRecipes());
        app.data = data;
        renderFeaturedRecipes();
        showPage();
      })
      .fail(function () {
        $homeSection.prop('hidden', false)
          .html('<p class="load">Data gagal dimuat. Jalankan lewat server lokal (lihat README).</p>');
      });
  }

  function bindEvents() {
    $(window).on('hashchange', function () { if (app.data) { showPage(); } });

    $menuToggle.on('click', function () {
      var isOpen = $mainMenu.toggleClass('open').hasClass('open');
      $(this).attr('aria-expanded', isOpen);
    });

    // Pencarian di hero: langsung memfilter jika katalog sedang terbuka
    $('#cariHero').on('submit', function (event) {
      event.preventDefault();
      filters.keyword = $('#q').val();
      if (location.hash === '#katalog') { app.catalog.render(); } else { location.hash = '#katalog'; }
    });

    $('#q').on('input', function () {
      filters.keyword = this.value;
      app.catalog.render();
    });
  }

  $(function () {
    $homeSection = $('#home');
    $pageContent = $('#konten');
    $mainMenu = $('#menu');
    $menuToggle = $('#burger');
    $hero = $('.hero');

    bindEvents();
    loadRecipeData();
  });
})(window.ResepKita);
