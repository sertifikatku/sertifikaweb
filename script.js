// =====================================================
// SertifKu - Login Mahasiswa & Pengurus
// Data disimpan di localStorage (browser)
// =====================================================

// Nama penyimpanan di browser
var KEY_DATA = 'sertifku_data';
var KEY_LOGIN = 'sertifku_login';

// Akun pengurus (demo)
var USERNAME_PENGURUS = 'pengurus';
var PASSWORD_PENGURUS = 'admin123';

// Variabel global
var dataSertifikat = []; // semua sertifikat
var userLogin = null;    // user yang sedang login
var rolePilihan = 'mahasiswa'; // tab login yang dipilih


// ---------- Fungsi bantu ----------

// Mengambil elemen berdasarkan id
function ambil(id) {
  return document.getElementById(id);
}

// Mengubah tanggal 2026-03-14 menjadi 14 Maret 2026
function formatTanggal(tgl) {
  var bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var bagian = tgl.split('-');
  return parseInt(bagian[2]) + ' ' + bulan[parseInt(bagian[1]) - 1] + ' ' + bagian[0];
}

// Supaya teks yang diketik tidak merusak HTML
function amankan(teks) {
  var div = document.createElement('div');
  div.textContent = teks;
  return div.innerHTML.replace(/"/g, '&quot;');
}

function adalahPengurus() {
  return userLogin.role === 'pengurus';
}


// ---------- Data ----------

// Membuat gambar sertifikat contoh (untuk data awal)
function buatGambarSertifikat(judul, nama, penyelenggara) {
  var canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 636;
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fffdf7';
  ctx.fillRect(0, 0, 900, 636);
  ctx.strokeStyle = '#6d4cff';
  ctx.lineWidth = 10;
  ctx.strokeRect(24, 24, 852, 588);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#2b2350';
  ctx.font = 'bold 44px Georgia';
  ctx.fillText('SERTIFIKAT', 450, 130);
  ctx.font = '22px Georgia';
  ctx.fillText('diberikan kepada', 450, 200);
  ctx.font = 'bold 40px Georgia';
  ctx.fillText(nama, 450, 270);
  ctx.font = '22px Georgia';
  ctx.fillText('atas partisipasi dalam kegiatan', 450, 335);
  ctx.font = 'bold 28px Georgia';
  ctx.fillText(judul, 450, 395, 760);
  ctx.font = '20px Georgia';
  ctx.fillText(penyelenggara, 450, 520);

  return canvas.toDataURL('image/jpeg', 0.85);
}

// Data awal (contoh) supaya sertifikat sudah tertera
function buatDataAwal() {
  var contoh = [
    ['Segi Bayu Pratiwi', '2517000006', 'Seminar Nasional Teknologi Informasi', 'Seminar / Webinar', '2026-03-14', 'Himpunan Mahasiswa Informatika'],
    ['Segi Bayu Pratiwi', '2517000006', 'Juara 1 UI/UX Design Competition', 'Lomba / Kompetisi', '2026-06-02', 'Fakultas Ilmu Komputer'],
    ['Segi Bayu Pratiwi', '2517000006', 'Panitia Dies Natalis', 'Organisasi / Kepanitiaan', '2026-08-21', 'BEM Universitas'],
    ['Budi Santoso', '2517000007', 'Workshop Web Development', 'Pelatihan / Workshop', '2026-05-10', 'Lab Rekayasa Perangkat Lunak']
  ];
  var hasil = [];
  for (var i = 0; i < contoh.length; i++) {
    var c = contoh[i];
    hasil.push({
      id: 'awal' + i,
      nama: c[0],
      nim: c[1],
      judul: c[2],
      kategori: c[3],
      tanggal: c[4],
      penyelenggara: c[5],
      gambar: buatGambarSertifikat(c[2], c[0], c[5]),
      waktuTambah: Date.now() - (contoh.length - i) * 1000
    });
  }
  return hasil;
}

function simpanData() {
  try {
    localStorage.setItem(KEY_DATA, JSON.stringify(dataSertifikat));
    return true;
  } catch (e) {
    return false; // penyimpanan penuh
  }
}

function muatData() {
  var tersimpan = localStorage.getItem(KEY_DATA);
  if (tersimpan) {
    dataSertifikat = JSON.parse(tersimpan);
  } else {
    dataSertifikat = buatDataAwal();
    simpanData();
  }
}

// Memperkecil gambar supaya muat di penyimpanan browser
function kecilkanGambar(file, selesai) {
  var reader = new FileReader();
  reader.onload = function () {
    var img = new Image();
    img.onload = function () {
      var skala = 1200 / Math.max(img.width, img.height);
      if (skala > 1) skala = 1;
      var canvas = document.createElement('canvas');
      canvas.width = img.width * skala;
      canvas.height = img.height * skala;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      selesai(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = function () { selesai(null); };
    img.src = reader.result;
  };
  reader.onerror = function () { selesai(null); };
  reader.readAsDataURL(file);
}

// Sertifikat yang boleh dilihat user yang login
function ambilSertifikatUser() {
  var hasil = [];
  for (var i = 0; i < dataSertifikat.length; i++) {
    var s = dataSertifikat[i];
    // Pengurus lihat semua, mahasiswa hanya yang NIM-nya sama
    if (adalahPengurus() || s.nim === userLogin.nim) {
      hasil.push(s);
    }
  }
  // Urutkan dari yang terbaru
  hasil.sort(function (a, b) { return b.waktuTambah - a.waktuTambah; });
  return hasil;
}


// ---------- Login ----------

// Pindah tab Mahasiswa / Pengurus
function pilihRole(role) {
  rolePilihan = role;
  var tombol = document.querySelectorAll('.role-tab');
  for (var i = 0; i < tombol.length; i++) {
    if (tombol[i].getAttribute('data-role') === role) {
      tombol[i].classList.add('active');
    } else {
      tombol[i].classList.remove('active');
    }
  }

  if (role === 'pengurus') {
    ambil('lblNama').textContent = 'Username';
    ambil('lblNim').textContent = 'Password';
    ambil('loginNama').placeholder = 'Username pengurus';
    ambil('loginNim').placeholder = 'Password';
    ambil('loginNim').type = 'password';
    ambil('demoNote').textContent = 'Demo pengurus: pengurus / admin123';
  } else {
    ambil('lblNama').textContent = 'Nama lengkap';
    ambil('lblNim').textContent = 'Nomor Induk Mahasiswa (NIM)';
    ambil('loginNama').placeholder = 'Contoh: Segi Bayu Pratiwi';
    ambil('loginNim').placeholder = 'Masukkan NIM';
    ambil('loginNim').type = 'text';
    ambil('demoNote').textContent = 'Demo mahasiswa: Segi Bayu Pratiwi / 2517000006';
  }
  ambil('loginError').textContent = '';
}

var tabRole = document.querySelectorAll('.role-tab');
for (var t = 0; t < tabRole.length; t++) {
  tabRole[t].onclick = function () {
    pilihRole(this.getAttribute('data-role'));
  };
}

ambil('loginForm').onsubmit = function (e) {
  e.preventDefault();
  var isi1 = ambil('loginNama').value.trim();
  var isi2 = ambil('loginNim').value.trim();

  if (rolePilihan === 'pengurus') {
    // Cek akun pengurus
    if (isi1 !== USERNAME_PENGURUS || isi2 !== PASSWORD_PENGURUS) {
      ambil('loginError').textContent = 'Username atau password salah.';
      return;
    }
    userLogin = { role: 'pengurus', nama: 'Pengurus', nim: 'Admin' };
  } else {
    // Cari mahasiswa berdasarkan NIM
    var ketemu = null;
    for (var i = 0; i < dataSertifikat.length; i++) {
      if (dataSertifikat[i].nim === isi2) {
        ketemu = dataSertifikat[i];
        break;
      }
    }
    if (ketemu === null) {
      ambil('loginError').textContent = 'NIM belum terdaftar. Hubungi pengurus untuk menambahkan sertifikatmu.';
      return;
    }
    if (ketemu.nama.toLowerCase().indexOf(isi1.toLowerCase()) === -1) {
      ambil('loginError').textContent = 'Nama tidak cocok dengan NIM tersebut.';
      return;
    }
    userLogin = { role: 'mahasiswa', nama: ketemu.nama, nim: isi2 };
  }

  localStorage.setItem(KEY_LOGIN, JSON.stringify(userLogin));
  ambil('loginForm').reset();
  ambil('loginError').textContent = '';
  masukAplikasi();
};

ambil('btnLogout').onclick = function () {
  localStorage.removeItem(KEY_LOGIN);
  userLogin = null;
  document.body.classList.remove('is-pengurus');
  ambil('appPage').classList.remove('active');
  ambil('loginPage').classList.add('active');
};


// ---------- Tampilan aplikasi ----------

function masukAplikasi() {
  ambil('loginPage').classList.remove('active');
  ambil('appPage').classList.add('active');

  ambil('userName').textContent = userLogin.nama;
  ambil('userNim').textContent = userLogin.nim;
  ambil('userAvatar').textContent = userLogin.nama.charAt(0).toUpperCase();
  ambil('welcomeName').textContent = userLogin.nama.split(' ')[0];

  if (adalahPengurus()) {
    document.body.classList.add('is-pengurus');
    ambil('roleLabel').textContent = 'Menu pengurus';
    ambil('navCertText').textContent = 'Kelola sertifikat';
    ambil('certViewTitle').textContent = 'Kelola sertifikat';
    ambil('certViewSub').textContent = 'Tambah dan kelola sertifikat semua mahasiswa.';
    ambil('welcomeSub').textContent = 'Masukkan sertifikat mahasiswa sesuai nama dan NIM.';
    ambil('bannerTitle').textContent = 'Catat pencapaian setiap mahasiswa.';
    ambil('bannerSub').textContent = 'Sertifikat yang kamu tambahkan langsung muncul di akun mahasiswa terkait.';
    ambil('statThirdTitle').textContent = 'Jumlah mahasiswa';
  } else {
    document.body.classList.remove('is-pengurus');
    ambil('roleLabel').textContent = 'Menu mahasiswa';
    ambil('navCertText').textContent = 'Sertifikat saya';
    ambil('certViewTitle').textContent = 'Sertifikat saya';
    ambil('certViewSub').textContent = 'Lihat dan unduh sertifikat atas namamu.';
    ambil('welcomeSub').textContent = 'Berikut sertifikat kegiatan yang sudah dicatat pengurus untukmu.';
    ambil('bannerTitle').textContent = 'Setiap pengalaman punya cerita.';
    ambil('bannerSub').textContent = 'Unduh sertifikatmu kapan pun dibutuhkan.';
    ambil('statThirdTitle').textContent = 'Terbaru ditambahkan';
  }

  pindahHalaman('dashboard');
}

// Pindah antara Dashboard dan daftar sertifikat
function pindahHalaman(nama) {
  var menu = document.querySelectorAll('.nav-item');
  for (var i = 0; i < menu.length; i++) {
    if (menu[i].getAttribute('data-view') === nama) {
      menu[i].classList.add('active');
    } else {
      menu[i].classList.remove('active');
    }
  }

  if (nama === 'dashboard') {
    ambil('dashboardView').classList.add('active');
    ambil('sertifikatView').classList.remove('active');
    ambil('breadcrumbCurrent').textContent = 'Dashboard';
  } else {
    ambil('dashboardView').classList.remove('active');
    ambil('sertifikatView').classList.add('active');
    ambil('breadcrumbCurrent').textContent = ambil('navCertText').textContent;
  }
  tampilkanSemua();
}

var menuNav = document.querySelectorAll('.nav-item');
for (var m = 0; m < menuNav.length; m++) {
  menuNav[m].onclick = function () {
    pindahHalaman(this.getAttribute('data-view'));
  };
}

ambil('linkSeeAll').onclick = function (e) {
  e.preventDefault();
  pindahHalaman('sertifikat');
};

// Membuat HTML untuk satu kartu sertifikat
function buatKartu(s) {
  var html = '';
  html += '<article class="cert-card">';
  html += '<img src="' + s.gambar + '" alt="' + amankan(s.judul) + '" class="cert-thumb" onclick="lihatSertifikat(\'' + s.id + '\')">';
  html += '<div class="cert-info">';
  html += '<span class="badge">' + amankan(s.kategori) + '</span>';
  html += '<h4>' + amankan(s.judul) + '</h4>';
  html += '<p class="text-muted">' + amankan(s.penyelenggara) + ' | ' + formatTanggal(s.tanggal) + '</p>';
  if (adalahPengurus()) {
    html += '<p class="cert-owner">' + amankan(s.nama) + ' (' + amankan(s.nim) + ')</p>';
  }
  html += '</div>';
  html += '<div class="cert-actions">';
  html += '<button class="btn-secondary" onclick="lihatSertifikat(\'' + s.id + '\')">Lihat</button>';
  html += '<a class="btn-primary" href="' + s.gambar + '" download="' + amankan(s.judul) + ' - ' + amankan(s.nama) + '.jpg">Unduh</a>';
  if (adalahPengurus()) {
    html += '<button class="btn-danger" onclick="hapusSertifikat(\'' + s.id + '\')">Hapus</button>';
  }
  html += '</div>';
  html += '</article>';
  return html;
}

// Menampilkan semua data ke layar
function tampilkanSemua() {
  if (userLogin === null) return;

  var milikUser = ambilSertifikatUser();

  // Hitung kategori yang berbeda
  var kategoriBeda = [];
  for (var i = 0; i < milikUser.length; i++) {
    if (kategoriBeda.indexOf(milikUser[i].kategori) === -1) {
      kategoriBeda.push(milikUser[i].kategori);
    }
  }

  ambil('statTotal').textContent = milikUser.length;
  ambil('statCategory').textContent = kategoriBeda.length;

  if (adalahPengurus()) {
    // Hitung jumlah mahasiswa (NIM berbeda)
    var daftarNim = [];
    for (var j = 0; j < dataSertifikat.length; j++) {
      if (daftarNim.indexOf(dataSertifikat[j].nim) === -1) {
        daftarNim.push(dataSertifikat[j].nim);
      }
    }
    ambil('statLatest').textContent = daftarNim.length;
  } else if (milikUser.length > 0) {
    ambil('statLatest').textContent = milikUser[0].judul;
  } else {
    ambil('statLatest').textContent = '-';
  }

  // Daftar terbaru (maksimal 3) di dashboard
  var pesanKosong = '<p class="empty">Belum ada sertifikat.</p>';
  var htmlTerbaru = '';
  for (var k = 0; k < milikUser.length && k < 3; k++) {
    htmlTerbaru += buatKartu(milikUser[k]);
  }
  ambil('recentList').innerHTML = htmlTerbaru || pesanKosong;

  // Daftar lengkap + pencarian + filter kategori
  var kataCari = ambil('searchInput').value.toLowerCase().trim();
  var kategoriDipilih = ambil('categoryFilter').value;
  var htmlSemua = '';
  for (var n = 0; n < milikUser.length; n++) {
    var s = milikUser[n];
    var gabungan = (s.judul + ' ' + s.penyelenggara + ' ' + s.nama + ' ' + s.nim).toLowerCase();
    var cocokKategori = (kategoriDipilih === 'ALL' || s.kategori === kategoriDipilih);
    var cocokCari = (gabungan.indexOf(kataCari) !== -1);
    if (cocokKategori && cocokCari) {
      htmlSemua += buatKartu(s);
    }
  }
  ambil('allCertList').innerHTML = htmlSemua || '<p class="empty">Tidak ada sertifikat yang cocok.</p>';

  if (window.lucide) lucide.createIcons();
}

ambil('searchInput').oninput = tampilkanSemua;
ambil('categoryFilter').onchange = tampilkanSemua;


// ---------- Lihat & hapus sertifikat ----------

function lihatSertifikat(id) {
  var daftar = ambilSertifikatUser(); // hanya yang boleh dilihat user ini
  for (var i = 0; i < daftar.length; i++) {
    if (daftar[i].id === id) {
      ambil('previewTitle').textContent = daftar[i].judul;
      ambil('previewImg').src = daftar[i].gambar;
      ambil('imageModal').classList.add('open');
    }
  }
}

ambil('btnCloseImageModal').onclick = function () {
  ambil('imageModal').classList.remove('open');
};

function hapusSertifikat(id) {
  if (!adalahPengurus()) return;
  if (!confirm('Hapus sertifikat ini?')) return;

  var baru = [];
  for (var i = 0; i < dataSertifikat.length; i++) {
    if (dataSertifikat[i].id !== id) {
      baru.push(dataSertifikat[i]);
    }
  }
  dataSertifikat = baru;
  simpanData();
  tampilkanSemua();
}


// ---------- Tambah sertifikat (khusus pengurus) ----------

function tutupModalTambah() {
  ambil('certModal').classList.remove('open');
}

var tombolTambah = document.querySelectorAll('.open-modal-btn');
for (var b = 0; b < tombolTambah.length; b++) {
  tombolTambah[b].onclick = function () {
    if (!adalahPengurus()) return;
    ambil('addCertForm').reset();
    ambil('modalError').textContent = '';
    ambil('certModal').classList.add('open');
  };
}

ambil('btnCloseModal').onclick = tutupModalTambah;
ambil('btnCancelModal').onclick = tutupModalTambah;

ambil('addCertForm').onsubmit = function (e) {
  e.preventDefault();
  if (!adalahPengurus()) return;

  var nama = ambil('certNama').value.trim();
  var nim = ambil('certNim').value.trim();

  // Cek: NIM yang sama harus punya nama yang sama
  for (var i = 0; i < dataSertifikat.length; i++) {
    if (dataSertifikat[i].nim === nim && dataSertifikat[i].nama.toLowerCase() !== nama.toLowerCase()) {
      ambil('modalError').textContent = 'NIM ' + nim + ' sudah terdaftar atas nama ' + dataSertifikat[i].nama + '. Periksa kembali nama atau NIM.';
      return;
    }
  }

  var file = ambil('certFile').files[0];
  kecilkanGambar(file, function (hasilGambar) {
    if (hasilGambar === null) {
      ambil('modalError').textContent = 'File gambar tidak bisa dibaca. Coba file lain.';
      return;
    }

    var sertifikatBaru = {
      id: 'c' + Date.now(),
      nama: nama,
      nim: nim,
      judul: ambil('certTitle').value.trim(),
      kategori: ambil('certCategory').value,
      tanggal: ambil('certDate').value,
      penyelenggara: ambil('certOrganizer').value.trim(),
      gambar: hasilGambar,
      waktuTambah: Date.now()
    };

    dataSertifikat.push(sertifikatBaru);
    if (!simpanData()) {
      dataSertifikat.pop();
      ambil('modalError').textContent = 'Penyimpanan browser penuh. Hapus sertifikat lama atau pakai gambar lebih kecil.';
      return;
    }

    tutupModalTambah();
    tampilkanSemua();
  });
};


// ---------- Mulai program ----------

muatData();

// Kalau sebelumnya sudah login, langsung masuk
var loginTersimpan = localStorage.getItem(KEY_LOGIN);
if (loginTersimpan) {
  userLogin = JSON.parse(loginTersimpan);
  masukAplikasi();
}

if (window.lucide) lucide.createIcons();
