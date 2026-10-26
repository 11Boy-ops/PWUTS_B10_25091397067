/**
 * Konfigurasi dan state bersama aplikasi ResepKita.
 * Semua modul JavaScript lain mengakses objek global window.ResepKita.
 */
window.ResepKita = {
  config: {
    dataUrl: 'data/recipes.json',
    pagesPath: 'pages/',
    favoritesStorageKey: 'resepkita_favorites',
    userRecipesStorageKey: 'resepkita_user_recipes',
    featuredRecipeCount: 3,
    defaultPage: 'beranda',

    // Judul hero untuk setiap halaman. Kunci = nama halaman di hash URL.
    pageTitles: {
      beranda: 'Resep Rumahan Favorit Keluarga',
      katalog: 'Katalog Resep',
      unggah: 'Bagikan Resepmu'
    },

    // Aturan validasi form unggah
    validation: {
      titleMinLength: 5,
      descriptionMinLength: 20,
      stepMinLength: 10,
      servings: { min: 1, max: 50 },
      cookTimeMinutes: { min: 1, max: 600 },
      photoMaxBytes: 2 * 1024 * 1024,
      photoAllowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxRowsPerList: 20
    },

    // Foto diperkecil sebelum disimpan agar muat di localStorage (batas sekitar 5 MB)
    photoStorage: {
      maxDimension: 800,   // sisi terpanjang, dalam piksel
      jpegQuality: 0.8
    },

    // Batas porsi pada kalkulator di detail resep
    portionLimits: { min: 1, max: 50 }
  },

  // Diisi oleh main.js setelah data JSON dimuat (digabung dengan resep buatan pengguna)
  data: null,

  // Kondisi filter katalog saat ini
  filters: {
    keyword: '',
    categoryId: 0,      // 0 = semua kategori
    maxCookTime: 0,     // 0 = semua waktu
    difficulty: '',     // '' = semua tingkat
    sortBy: 'rating'    // 'rating' atau 'time'
  }
};
