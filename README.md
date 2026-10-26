# ResepKita

UTS Pemrograman Web, D4 Manajemen Informatika, Universitas Negeri Surabaya.

- Nama: Wahyu Adi Pratama
- NIM: 25091397067
- Kelompok: 10 (2025B), proposal "Website Resep Makanan (ResepKita)"
- Dosen: Ari Kurniawan, S.Kom., M.T.

## Pembagian pekerjaan (item 2.d)

| Item | Bagian saya |
|------|-------------|
| 2.a | Layout utama `index.html` (header, hero pencarian, beranda resep pilihan, footer) |
| 2.b | Katalog resep: pencarian, filter, urutkan, detail resep, kalkulator porsi, favorit |
| 2.c | Form unggah resep dengan validasi jQuery |

## Struktur file

```
index.html                layout utama (2.a)
pages/katalog.html        halaman konten (2.b), dimuat dengan Ajax
pages/unggah.html         halaman form (2.c), dimuat dengan Ajax
css/style.css             gaya dan responsive (media query)
js/config.js              konfigurasi, aturan validasi, dan state bersama
js/utils.js               fungsi bantu (escape HTML, format angka, pemecah takaran)
js/storage.js             penyimpanan localStorage: favorit dan resep buatan pengguna
js/recipe-modal.js        modal detail resep dan kalkulator porsi
js/catalog.js             kartu resep, pencarian, dan filter (2.b)
js/upload-form.js         baris dinamis, validasi jQuery, dan simpan resep (2.c)
js/main.js                titik masuk: navigasi hash dan pemuatan halaman Ajax (2.a)
data/recipes.json         data contoh resep
images/                   logo dan gambar resep (SVG)
```

Teknologi: HTML, CSS, dan JavaScript dengan jQuery. Belum ada backend dan database.

## Fitur

- Responsive: grid fleksibel, gambar fleksibel, media query, dan menu hamburger di layar kecil.
- Ajax: menu memuat `pages/katalog.html` dan `pages/unggah.html` ke dalam `index.html` memakai `$.load()`. Data resep diambil dengan `$.getJSON()`. URL memakai hash (`#katalog`, `#unggah`) sehingga bisa di-bookmark.
- Katalog: pencarian judul atau bahan (kolom cari di hero), filter kategori, waktu masak, dan kesulitan, urut rating atau tercepat. Klik kartu membuka detail dengan kalkulator porsi yang mengubah takaran bahan otomatis, serta tombol favorit.
- Form unggah: validasi jQuery untuk judul, kategori, kesulitan, deskripsi, porsi, waktu, tipe dan ukuran foto, bahan dan takaran, serta langkah. Setelah lolos, resep disimpan di localStorage browser dan langsung tampil di Katalog Resep dengan rating "Baru".
- Takaran bahan yang diketik pengguna (mis. `2 sdm`, `1 1/2 gelas`) dipecah menjadi angka dan satuan sehingga ikut berubah saat porsi diubah. Takaran tanpa angka (`secukupnya`) atau berupa rentang (`2-3 siung`) ditampilkan apa adanya.

## Penyimpanan lokal

- Resep bawaan dibaca dari `data/recipes.json`. Resep yang diunggah dan daftar favorit disimpan di localStorage (kunci `resepkita_user_recipes` dan `resepkita_favorites`).
- Data hanya ada di browser dan perangkat yang dipakai. Menghapus data situs atau memakai mode privat menghapus resep yang pernah diunggah.
- Foto diperkecil (sisi terpanjang 800 piksel, JPEG) sebelum disimpan karena batas localStorage sekitar 5 MB. Jika penyimpanan penuh, form menampilkan pesan dan isian tidak dihapus.

## Cara menjalankan

Ajax tidak bisa jalan jika `index.html` dibuka langsung (`file://`). Pakai server statis apa saja, misalnya:

1. Ekstensi **Live Server** di VS Code (klik kanan `index.html`, Open with Live Server), atau
2. Ekstrak atau pindahkan folder proyek ini ke dalam direktori htdocs pada instalasi XAMPP (biasanya terletak di C:\xampp\htdocs\). Nyalakan modul Apache melalui XAMPP Control Panel, lalu buka peramban (browser) dan akses http://localhost/nama_folder_proyek (sesuaikan dengan nama folder Anda), atau
3. Hosting statis seperti GitHub Pages. Semua fitur, termasuk form unggah, berjalan karena tidak butuh PHP.

## Konvensi penulisan JavaScript

- Satu file satu tanggung jawab, dimuat berurutan di `index.html` (config, utils, storage, modul fitur, main).
- Tiap modul dibungkus IIFE dengan `'use strict'` dan menerima namespace `window.ResepKita` sebagai `app`.
- Konfigurasi, aturan validasi, dan state bersama dikumpulkan di `config.js`, bukan ditulis ulang di tiap modul.
- Nama fungsi dan variabel deskriptif (`getVisibleRecipes`, `validateMinLength`), fungsi kecil dengan satu tugas.
- Komentar pembuka di setiap file dan pemisah bagian `/* ---------- ... ---------- */`.
- Event pada halaman yang dimuat lewat Ajax memakai delegasi `$(document).on(...)`.
- Setiap modul hanya membuka fungsi yang dipakai modul lain lewat `app.namaModul = { ... }`.

## Catatan

- Gambar resep berupa ilustrasi SVG buatan sendiri.
- Login belum dibuat (di luar cakupan tugas).
- Rujukan: Marcotte, E. (2010). Responsive web design. A List Apart.
