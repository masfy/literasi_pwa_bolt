/**
 * Lentera - Aplikasi Manajemen Aktivitas Literasi
 * Google Apps Script Backend API
 * 
 * Setup:
 * 1. Buat Google Spreadsheet baru dengan nama "Lentera Database"
 * 2. Buat 5 sheet: Users, Kelas, Aktivitas, Level, Log
 * 3. Copy kode ini ke Apps Script project
 * 4. Deploy sebagai Web App dengan akses "Anyone"
 * 5. Copy URL deployment ke frontend (API_BASE_URL)
 */

// Configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Ganti dengan ID spreadsheet Anda
const JWT_SECRET = 'lentera-secret-key-2024'; // Ganti dengan secret key yang aman

// Helper Functions
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet(sheetName) {
  return getSpreadsheet().getSheetByName(sheetName);
}

function generateId() {
  return Utilities.getUuid();
}

function hashPassword(password) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
    .map(byte => (byte + 256).toString(16).slice(-2))
    .join('');
}

function generateToken(userId, role) {
  const payload = {
    userId: userId,
    role: role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  return Utilities.base64Encode(JSON.stringify(payload));
}

function verifyToken(token) {
  try {
    const payload = JSON.parse(Utilities.base64Decode(token));
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}

function getCurrentUser(request) {
  const authHeader = request.headers['Authorization'] || request.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return verifyToken(token);
}

function formatDateTime() {
  return new Date().toISOString();
}

function addCorsHeaders(response) {
  return {
    ...response,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    }
  };
}

function logActivity(userId, action, detail) {
  const logSheet = getSheet('Log');
  const newRow = [
    generateId(),
    userId,
    action,
    detail,
    formatDateTime()
  ];
  logSheet.appendRow(newRow);
}

// Database Helper Functions
function findRowById(sheet, id, idColumn = 1) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumn - 1] === id) {
      return { row: i + 1, data: data[i] };
    }
  }
  return null;
}

function findRowByField(sheet, field, value, fieldColumn) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][fieldColumn - 1] === value) {
      return { row: i + 1, data: data[i] };
    }
  }
  return null;
}

function arrayToObject(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = row[index];
  });
  return obj;
}

function objectToArray(headers, obj) {
  return headers.map(header => obj[header] || '');
}

// Main Handler Functions
function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
}

function handleRequest(e, method) {
  try {
    const path = e.parameter.path || '';
    const body = e.postData ? JSON.parse(e.postData.contents) : {};
    
    // Route handling
    let response;
    
    if (method === 'POST' && path === 'login') {
      response = handleLogin(body);
    } else if (method === 'POST' && path === 'logout') {
      response = handleLogout(e);
    } else if (method === 'GET' && path === 'me') {
      response = handleGetMe(e);
    } else if (path.startsWith('kelas')) {
      response = handleKelasRoutes(e, method, path, body);
    } else if (path.startsWith('siswa')) {
      response = handleSiswaRoutes(e, method, path, body);
    } else if (path.startsWith('aktivitas')) {
      response = handleAktivitasRoutes(e, method, path, body);
    } else if (path.startsWith('level')) {
      response = handleLevelRoutes(e, method, path, body);
    } else if (path.startsWith('leaderboard')) {
      response = handleLeaderboard(e);
    } else if (path.startsWith('stats')) {
      response = handleStats(e, path);
    } else if (path.startsWith('rekap')) {
      response = handleRekap(e);
    } else {
      response = { success: false, message: 'Endpoint tidak ditemukan' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Server error: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
  }
}

// Authentication Handlers
function handleLogin(body) {
  const { username, password } = body;
  
  if (!username || !password) {
    return { success: false, message: 'Username dan password harus diisi' };
  }
  
  const userSheet = getSheet('Users');
  const headers = userSheet.getRange(1, 1, 1, userSheet.getLastColumn()).getValues()[0];
  const userRow = findRowByField(userSheet, 'username', username, 5); // username di kolom 5
  
  if (!userRow) {
    return { success: false, message: 'Username tidak ditemukan' };
  }
  
  const user = arrayToObject(headers, userRow.data);
  const hashedPassword = hashPassword(password);
  
  if (user.password_hash !== hashedPassword && user.password_hash !== password) {
    return { success: false, message: 'Password salah' };
  }
  
  if (!user.aktif) {
    return { success: false, message: 'Akun tidak aktif' };
  }
  
  const token = generateToken(user.id, user.role);
  
  logActivity(user.id, 'LOGIN', `User ${username} login`);
  
  return {
    success: true,
    token: token,
    user: {
      id: user.id,
      role: user.role,
      nama: user.nama,
      email: user.email,
      username: user.username,
      kelas_id: user.kelas_id,
      aktif: user.aktif
    }
  };
}

function handleLogout(e) {
  const currentUser = getCurrentUser(e);
  if (!currentUser) {
    return { success: false, message: 'Token tidak valid' };
  }
  
  logActivity(currentUser.userId, 'LOGOUT', 'User logout');
  return { success: true };
}

function handleGetMe(e) {
  const currentUser = getCurrentUser(e);
  if (!currentUser) {
    return { success: false, message: 'Token tidak valid' };
  }
  
  const userSheet = getSheet('Users');
  const headers = userSheet.getRange(1, 1, 1, userSheet.getLastColumn()).getValues()[0];
  const userRow = findRowById(userSheet, currentUser.userId);
  
  if (!userRow) {
    return { success: false, message: 'User tidak ditemukan' };
  }
  
  const user = arrayToObject(headers, userRow.data);
  
  return {
    success: true,
    data: {
      id: user.id,
      role: user.role,
      nama: user.nama,
      email: user.email,
      username: user.username,
      kelas_id: user.kelas_id,
      aktif: user.aktif,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
}

// Kelas Handlers
function handleKelasRoutes(e, method, path, body) {
  const currentUser = getCurrentUser(e);
  if (!currentUser) {
    return { success: false, message: 'Token tidak valid' };
  }
  
  if (currentUser.role !== 'guru') {
    return { success: false, message: 'Akses ditolak' };
  }
  
  if (method === 'GET' && path === 'kelas') {
    return handleGetKelas();
  } else if (method === 'POST' && path === 'kelas') {
    return handleCreateKelas(body, currentUser);
  } else if (method === 'PUT' && path.startsWith('kelas/')) {
    const id = path.split('/')[1];
    return handleUpdateKelas(id, body, currentUser);
  } else if (method === 'DELETE' && path.startsWith('kelas/')) {
    const id = path.split('/')[1];
    return handleDeleteKelas(id, currentUser);
  }
  
  return { success: false, message: 'Endpoint tidak ditemukan' };
}

function handleGetKelas() {
  const kelasSheet = getSheet('Kelas');
  const data = kelasSheet.getDataRange().getValues();
  const headers = data[0];
  const kelas = [];
  
  for (let i = 1; i < data.length; i++) {
    kelas.push(arrayToObject(headers, data[i]));
  }
  
  return { success: true, data: kelas };
}

function handleCreateKelas(body, currentUser) {
  const { nama_kelas } = body;
  
  if (!nama_kelas) {
    return { success: false, message: 'Nama kelas harus diisi' };
  }
  
  const kelasSheet = getSheet('Kelas');
  const newKelas = {
    id: generateId(),
    nama_kelas: nama_kelas,
    wali_guru_id: currentUser.userId,
    created_at: formatDateTime(),
    updated_at: formatDateTime()
  };
  
  const headers = ['id', 'nama_kelas', 'wali_guru_id', 'created_at', 'updated_at'];
  kelasSheet.appendRow(objectToArray(headers, newKelas));
  
  logActivity(currentUser.userId, 'CREATE', `Membuat kelas ${nama_kelas}`);
  
  return { success: true, data: newKelas };
}

function handleUpdateKelas(id, body, currentUser) {
  const kelasSheet = getSheet('Kelas');
  const kelasRow = findRowById(kelasSheet, id);
  
  if (!kelasRow) {
    return { success: false, message: 'Kelas tidak ditemukan' };
  }
  
  const headers = kelasSheet.getRange(1, 1, 1, kelasSheet.getLastColumn()).getValues()[0];
  const updatedKelas = arrayToObject(headers, kelasRow.data);
  
  Object.keys(body).forEach(key => {
    if (key !== 'id' && key !== 'created_at') {
      updatedKelas[key] = body[key];
    }
  });
  updatedKelas.updated_at = formatDateTime();
  
  const newRow = objectToArray(headers, updatedKelas);
  kelasSheet.getRange(kelasRow.row, 1, 1, headers.length).setValues([newRow]);
  
  logActivity(currentUser.userId, 'UPDATE', `Mengupdate kelas ${updatedKelas.nama_kelas}`);
  
  return { success: true, data: updatedKelas };
}

function handleDeleteKelas(id, currentUser) {
  const kelasSheet = getSheet('Kelas');
  const kelasRow = findRowById(kelasSheet, id);
  
  if (!kelasRow) {
    return { success: false, message: 'Kelas tidak ditemukan' };
  }
  
  kelasSheet.deleteRow(kelasRow.row);
  
  logActivity(currentUser.userId, 'DELETE', `Menghapus kelas ID: ${id}`);
  
  return { success: true };
}

// Siswa Handlers
function handleSiswaRoutes(e, method, path, body) {
  const currentUser = getCurrentUser(e);
  if (!currentUser) {
    return { success: false, message: 'Token tidak valid' };
  }
  
  if (currentUser.role !== 'guru') {
    return { success: false, message: 'Akses ditolak' };
  }
  
  if (method === 'GET' && path === 'siswa') {
    const kelasId = e.parameter.kelas_id;
    return handleGetSiswa(kelasId);
  } else if (method === 'POST' && path === 'siswa') {
    return handleCreateSiswa(body, currentUser);
  } else if (method === 'PUT' && path.startsWith('siswa/')) {
    const id = path.split('/')[1];
    return handleUpdateSiswa(id, body, currentUser);
  } else if (method === 'POST' && path.includes('/reset-password')) {
    const id = path.split('/')[1];
    return handleResetPassword(id, currentUser);
  } else if (method === 'PATCH' && path.includes('/aktif')) {
    const id = path.split('/')[1];
    return handleToggleActive(id, body, currentUser);
  }
  
  return { success: false, message: 'Endpoint tidak ditemukan' };
}

function handleGetSiswa(kelasId) {
  const userSheet = getSheet('Users');
  const data = userSheet.getDataRange().getValues();
  const headers = data[0];
  const siswa = [];
  
  for (let i = 1; i < data.length; i++) {
    const user = arrayToObject(headers, data[i]);
    if (user.role === 'siswa' && (!kelasId || user.kelas_id === kelasId)) {
      siswa.push(user);
    }
  }
  
  return { success: true, data: siswa };
}

function handleCreateSiswa(body, currentUser) {
  const { nama, email, username, kelas_id } = body;
  
  if (!nama || !email || !username || !kelas_id) {
    return { success: false, message: 'Semua field harus diisi' };
  }
  
  // Check if username already exists
  const userSheet = getSheet('Users');
  const existingUser = findRowByField(userSheet, 'username', username, 5);
  if (existingUser) {
    return { success: false, message: 'Username sudah digunakan' };
  }
  
  const newSiswa = {
    id: generateId(),
    role: 'siswa',
    nama: nama,
    email: email,
    username: username,
    password_hash: hashPassword('password123'), // Default password
    kelas_id: kelas_id,
    aktif: true,
    created_at: formatDateTime(),
    updated_at: formatDateTime()
  };
  
  const headers = ['id', 'role', 'nama', 'email', 'username', 'password_hash', 'kelas_id', 'aktif', 'created_at', 'updated_at'];
  userSheet.appendRow(objectToArray(headers, newSiswa));
  
  logActivity(currentUser.userId, 'CREATE', `Membuat siswa ${nama}`);
  
  return { success: true, data: newSiswa };
}

function handleUpdateSiswa(id, body, currentUser) {
  const userSheet = getSheet('Users');
  const userRow = findRowById(userSheet, id);
  
  if (!userRow) {
    return { success: false, message: 'Siswa tidak ditemukan' };
  }
  
  const headers = userSheet.getRange(1, 1, 1, userSheet.getLastColumn()).getValues()[0];
  const updatedSiswa = arrayToObject(headers, userRow.data);
  
  Object.keys(body).forEach(key => {
    if (key !== 'id' && key !== 'created_at' && key !== 'role') {
      updatedSiswa[key] = body[key];
    }
  });
  updatedSiswa.updated_at = formatDateTime();
  
  const newRow = objectToArray(headers, updatedSiswa);
  userSheet.getRange(userRow.row, 1, 1, headers.length).setValues([newRow]);
  
  logActivity(currentUser.userId, 'UPDATE', `Mengupdate siswa ${updatedSiswa.nama}`);
  
  return { success: true, data: updatedSiswa };
}

function handleResetPassword(id, currentUser) {
  const userSheet = getSheet('Users');
  const userRow = findRowById(userSheet, id);
  
  if (!userRow) {
    return { success: false, message: 'Siswa tidak ditemukan' };
  }
  
  const headers = userSheet.getRange(1, 1, 1, userSheet.getLastColumn()).getValues()[0];
  const passwordIndex = headers.indexOf('password_hash');
  const updatedAtIndex = headers.indexOf('updated_at');
  
  userSheet.getRange(userRow.row, passwordIndex + 1).setValue(hashPassword('password123'));
  userSheet.getRange(userRow.row, updatedAtIndex + 1).setValue(formatDateTime());
  
  logActivity(currentUser.userId, 'RESET_PASSWORD', `Reset password siswa ID: ${id}`);
  
  return { success: true };
}

function handleToggleActive(id, body, currentUser) {
  const userSheet = getSheet('Users');
  const userRow = findRowById(userSheet, id);
  
  if (!userRow) {
    return { success: false, message: 'Siswa tidak ditemukan' };
  }
  
  const headers = userSheet.getRange(1, 1, 1, userSheet.getLastColumn()).getValues()[0];
  const aktifIndex = headers.indexOf('aktif');
  const updatedAtIndex = headers.indexOf('updated_at');
  
  userSheet.getRange(userRow.row, aktifIndex + 1).setValue(body.aktif);
  userSheet.getRange(userRow.row, updatedAtIndex + 1).setValue(formatDateTime());
  
  logActivity(currentUser.userId, 'TOGGLE_ACTIVE', `Toggle active siswa ID: ${id} to ${body.aktif}`);
  
  return { success: true };
}

// Aktivitas Handlers
function handleAktivitasRoutes(e, method, path, body) {
  const currentUser = getCurrentUser(e);
  if (!currentUser) {
    return { success: false, message: 'Token tidak valid' };
  }
  
  if (method === 'GET' && path === 'aktivitas') {
    return handleGetAktivitas(e, currentUser);
  } else if (method === 'POST' && path === 'aktivitas') {
    return handleCreateAktivitas(body, currentUser);
  } else if (method === 'PUT' && path.includes('/verify')) {
    const id = path.split('/')[1];
    return handleVerifyAktivitas(id, body, currentUser);
  }
  
  return { success: false, message: 'Endpoint tidak ditemukan' };
}

function handleGetAktivitas(e, currentUser) {
  const aktivitasSheet = getSheet('Aktivitas');
  const userSheet = getSheet('Users');
  const data = aktivitasSheet.getDataRange().getValues();
  const userData = userSheet.getDataRange().getValues();
  const headers = data[0];
  const userHeaders = userData[0];
  const aktivitas = [];
  
  // Create user lookup
  const userLookup = {};
  for (let i = 1; i < userData.length; i++) {
    const user = arrayToObject(userHeaders, userData[i]);
    userLookup[user.id] = user.nama;
  }
  
  for (let i = 1; i < data.length; i++) {
    const item = arrayToObject(headers, data[i]);
    
    // Filter based on role
    if (currentUser.role === 'siswa' && item.siswa_id !== currentUser.userId) {
      continue;
    }
    
    // Apply filters
    const status = e.parameter.status;
    const kelasId = e.parameter.kelas_id;
    const q = e.parameter.q;
    
    if (status && item.status !== status) continue;
    if (kelasId && item.kelas_id !== kelasId) continue;
    if (q && !item.judul_bacaan.toLowerCase().includes(q.toLowerCase()) && 
        !item.penulis_sumber.toLowerCase().includes(q.toLowerCase())) continue;
    
    item.siswa_nama = userLookup[item.siswa_id] || 'Unknown';
    aktivitas.push(item);
  }
  
  return { success: true, data: aktivitas };
}

function handleCreateAktivitas(body, currentUser) {
  if (currentUser.role !== 'siswa') {
    return { success: false, message: 'Hanya siswa yang dapat membuat aktivitas' };
  }
  
  const {
    judul_bacaan, jenis_bacaan, penulis_sumber, tanggal_baca,
    durasi_menit, ringkasan, refleksi, bukti_url, kelas_id
  } = body;
  
  if (!judul_bacaan || !jenis_bacaan || !penulis_sumber || !tanggal_baca || 
      !durasi_menit || !ringkasan || !refleksi) {
    return { success: false, message: 'Semua field wajib harus diisi' };
  }
  
  const newAktivitas = {
    id: generateId(),
    siswa_id: currentUser.userId,
    kelas_id: kelas_id,
    judul_bacaan: judul_bacaan,
    jenis_bacaan: jenis_bacaan,
    penulis_sumber: penulis_sumber,
    tanggal_baca: tanggal_baca,
    durasi_menit: parseInt(durasi_menit),
    ringkasan: ringkasan,
    refleksi: refleksi,
    bukti_url: bukti_url || '',
    status: 'Menunggu',
    catatan_verifikasi: '',
    verifikator_id: '',
    verifikasi_at: '',
    poin: 0,
    created_at: formatDateTime(),
    updated_at: formatDateTime()
  };
  
  const aktivitasSheet = getSheet('Aktivitas');
  const headers = ['id', 'siswa_id', 'kelas_id', 'judul_bacaan', 'jenis_bacaan', 'penulis_sumber', 
                   'tanggal_baca', 'durasi_menit', 'ringkasan', 'refleksi', 'bukti_url', 'status', 
                   'catatan_verifikasi', 'verifikator_id', 'verifikasi_at', 'poin', 'created_at', 'updated_at'];
  
  aktivitasSheet.appendRow(objectToArray(headers, newAktivitas));
  
  logActivity(currentUser.userId, 'CREATE', `Membuat aktivitas ${judul_bacaan}`);
  
  return { success: true, data: newAktivitas };
}

function handleVerifyAktivitas(id, body, currentUser) {
  if (currentUser.role !== 'guru') {
    return { success: false, message: 'Hanya guru yang dapat memverifikasi aktivitas' };
  }
  
  const { status, catatan } = body;
  
  if (!status || (status !== 'Disetujui' && status !== 'Ditolak')) {
    return { success: false, message: 'Status tidak valid' };
  }
  
  if (status === 'Ditolak' && !catatan) {
    return { success: false, message: 'Catatan penolakan harus diisi' };
  }
  
  const aktivitasSheet = getSheet('Aktivitas');
  const aktivitasRow = findRowById(aktivitasSheet, id);
  
  if (!aktivitasRow) {
    return { success: false, message: 'Aktivitas tidak ditemukan' };
  }
  
  const headers = aktivitasSheet.getRange(1, 1, 1, aktivitasSheet.getLastColumn()).getValues()[0];
  const aktivitas = arrayToObject(headers, aktivitasRow.data);
  
  // Calculate points if approved
  let poin = 0;
  if (status === 'Disetujui') {
    poin = parseInt(aktivitas.durasi_menit);
    // Bonus for detailed summary (>= 50 words)
    const wordCount = aktivitas.ringkasan.split(/\s+/).length;
    if (wordCount >= 50) {
      poin += Math.floor(poin * 0.2); // 20% bonus
    }
    poin = Math.max(1, poin); // Minimum 1 point
  }
  
  const updatedAktivitas = {
    ...aktivitas,
    status: status,
    catatan_verifikasi: catatan || '',
    verifikator_id: currentUser.userId,
    verifikasi_at: formatDateTime(),
    poin: poin,
    updated_at: formatDateTime()
  };
  
  const newRow = objectToArray(headers, updatedAktivitas);
  aktivitasSheet.getRange(aktivitasRow.row, 1, 1, headers.length).setValues([newRow]);
  
  logActivity(currentUser.userId, 'VERIFY', `${status} aktivitas ${aktivitas.judul_bacaan}`);
  
  return { success: true, data: updatedAktivitas };
}

// Level Handlers
function handleLevelRoutes(e, method, path, body) {
  const currentUser = getCurrentUser(e);
  if (!currentUser) {
    return { success: false, message: 'Token tidak valid' };
  }
  
  if (method === 'GET' && path === 'level') {
    return handleGetLevel();
  } else if (currentUser.role === 'guru') {
    if (method === 'POST' && path === 'level') {
      return handleCreateLevel(body, currentUser);
    } else if (method === 'PUT' && path.startsWith('level/')) {
      const id = path.split('/')[1];
      return handleUpdateLevel(id, body, currentUser);
    } else if (method === 'DELETE' && path.startsWith('level/')) {
      const id = path.split('/')[1];
      return handleDeleteLevel(id, currentUser);
    }
  }
  
  return { success: false, message: 'Endpoint tidak ditemukan' };
}

function handleGetLevel() {
  const levelSheet = getSheet('Level');
  const data = levelSheet.getDataRange().getValues();
  const headers = data[0];
  const levels = [];
  
  for (let i = 1; i < data.length; i++) {
    levels.push(arrayToObject(headers, data[i]));
  }
  
  return { success: true, data: levels };
}

function handleCreateLevel(body, currentUser) {
  const { nama_level, min_poin, max_poin, deskripsi } = body;
  
  if (!nama_level || min_poin === undefined || max_poin === undefined) {
    return { success: false, message: 'Nama level, min poin, dan max poin harus diisi' };
  }
  
  const newLevel = {
    id: generateId(),
    nama_level: nama_level,
    min_poin: parseInt(min_poin),
    max_poin: parseInt(max_poin),
    deskripsi: deskripsi || ''
  };
  
  const levelSheet = getSheet('Level');
  const headers = ['id', 'nama_level', 'min_poin', 'max_poin', 'deskripsi'];
  levelSheet.appendRow(objectToArray(headers, newLevel));
  
  logActivity(currentUser.userId, 'CREATE', `Membuat level ${nama_level}`);
  
  return { success: true, data: newLevel };
}

function handleUpdateLevel(id, body, currentUser) {
  const levelSheet = getSheet('Level');
  const levelRow = findRowById(levelSheet, id);
  
  if (!levelRow) {
    return { success: false, message: 'Level tidak ditemukan' };
  }
  
  const headers = levelSheet.getRange(1, 1, 1, levelSheet.getLastColumn()).getValues()[0];
  const updatedLevel = arrayToObject(headers, levelRow.data);
  
  Object.keys(body).forEach(key => {
    if (key !== 'id') {
      if (key === 'min_poin' || key === 'max_poin') {
        updatedLevel[key] = parseInt(body[key]);
      } else {
        updatedLevel[key] = body[key];
      }
    }
  });
  
  const newRow = objectToArray(headers, updatedLevel);
  levelSheet.getRange(levelRow.row, 1, 1, headers.length).setValues([newRow]);
  
  logActivity(currentUser.userId, 'UPDATE', `Mengupdate level ${updatedLevel.nama_level}`);
  
  return { success: true, data: updatedLevel };
}

function handleDeleteLevel(id, currentUser) {
  const levelSheet = getSheet('Level');
  const levelRow = findRowById(levelSheet, id);
  
  if (!levelRow) {
    return { success: false, message: 'Level tidak ditemukan' };
  }
  
  levelSheet.deleteRow(levelRow.row);
  
  logActivity(currentUser.userId, 'DELETE', `Menghapus level ID: ${id}`);
  
  return { success: true };
}

// Leaderboard Handler
function handleLeaderboard(e) {
  const currentUser = getCurrentUser(e);
  if (!currentUser) {
    return { success: false, message: 'Token tidak valid' };
  }
  
  const kelasId = e.parameter.kelas_id;
  if (!kelasId) {
    return { success: false, message: 'Kelas ID harus diisi' };
  }
  
  const userSheet = getSheet('Users');
  const aktivitasSheet = getSheet('Aktivitas');
  const levelSheet = getSheet('Level');
  
  const userData = userSheet.getDataRange().getValues();
  const aktivitasData = aktivitasSheet.getDataRange().getValues();
  const levelData = levelSheet.getDataRange().getValues();
  
  const userHeaders = userData[0];
  const aktivitasHeaders = aktivitasData[0];
  const levelHeaders = levelData[0];
  
  // Get students in class
  const siswaInKelas = [];
  for (let i = 1; i < userData.length; i++) {
    const user = arrayToObject(userHeaders, userData[i]);
    if (user.role === 'siswa' && user.kelas_id === kelasId) {
      siswaInKelas.push(user);
    }
  }
  
  // Get levels
  const levels = [];
  for (let i = 1; i < levelData.length; i++) {
    levels.push(arrayToObject(levelHeaders, levelData[i]));
  }
  levels.sort((a, b) => a.min_poin - b.min_poin);
  
  // Calculate leaderboard
  const leaderboard = [];
  for (const siswa of siswaInKelas) {
    let totalPoin = 0;
    let totalDurasi = 0;
    let jumlahAktivitas = 0;
    
    for (let i = 1; i < aktivitasData.length; i++) {
      const aktivitas = arrayToObject(aktivitasHeaders, aktivitasData[i]);
      if (aktivitas.siswa_id === siswa.id && aktivitas.status === 'Disetujui') {
        totalPoin += parseInt(aktivitas.poin) || 0;
        totalDurasi += parseInt(aktivitas.durasi_menit) || 0;
        jumlahAktivitas++;
      }
    }
    
    // Determine level
    let level = levels[0];
    for (const l of levels) {
      if (totalPoin >= l.min_poin && (l.max_poin === -1 || totalPoin <= l.max_poin)) {
        level = l;
      }
    }
    
    leaderboard.push({
      siswa_id: siswa.id,
      nama: siswa.nama,
      total_poin: totalPoin,
      level: level,
      total_durasi: totalDurasi,
      jumlah_aktivitas: jumlahAktivitas
    });
  }
  
  // Sort leaderboard
  leaderboard.sort((a, b) => {
    if (a.total_poin !== b.total_poin) return b.total_poin - a.total_poin;
    if (a.total_durasi !== b.total_durasi) return b.total_durasi - a.total_durasi;
    return b.jumlah_aktivitas - a.jumlah_aktivitas;
  });
  
  // Add positions
  leaderboard.forEach((entry, index) => {
    entry.posisi = index + 1;
  });
  
  return { success: true, data: leaderboard };
}

// Stats Handlers
function handleStats(e, path) {
  const currentUser = getCurrentUser(e);
  if (!currentUser) {
    return { success: false, message: 'Token tidak valid' };
  }
  
  if (path === 'stats-dashboard-guru' && currentUser.role === 'guru') {
    return handleGuruStats(e);
  } else if (path === 'stats-dashboard-siswa' && currentUser.role === 'siswa') {
    return handleSiswaStats(currentUser);
  }
  
  return { success: false, message: 'Endpoint tidak ditemukan' };
}

function handleGuruStats(e) {
  const kelasSheet = getSheet('Kelas');
  const userSheet = getSheet('Users');
  const aktivitasSheet = getSheet('Aktivitas');
  
  const kelasData = kelasSheet.getDataRange().getValues();
  const userData = userSheet.getDataRange().getValues();
  const aktivitasData = aktivitasSheet.getDataRange().getValues();
  
  const userHeaders = userData[0];
  const aktivitasHeaders = aktivitasData[0];
  
  let totalKelas = kelasData.length - 1; // Exclude header
  let totalSiswa = 0;
  let aktivitasMenunggu = 0;
  let aktivitasDisetujuiBulanIni = 0;
  
  // Count students
  for (let i = 1; i < userData.length; i++) {
    const user = arrayToObject(userHeaders, userData[i]);
    if (user.role === 'siswa') {
      totalSiswa++;
    }
  }
  
  // Count activities
  const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  for (let i = 1; i < aktivitasData.length; i++) {
    const aktivitas = arrayToObject(aktivitasHeaders, aktivitasData[i]);
    if (aktivitas.status === 'Menunggu') {
      aktivitasMenunggu++;
    }
    if (aktivitas.status === 'Disetujui' && aktivitas.verifikasi_at && 
        aktivitas.verifikasi_at.startsWith(thisMonth)) {
      aktivitasDisetujuiBulanIni++;
    }
  }
  
  return {
    success: true,
    data: {
      total_kelas: totalKelas,
      total_siswa: totalSiswa,
      aktivitas_menunggu: aktivitasMenunggu,
      aktivitas_disetujui_bulan_ini: aktivitasDisetujuiBulanIni
    }
  };
}

function handleSiswaStats(currentUser) {
  const aktivitasSheet = getSheet('Aktivitas');
  const levelSheet = getSheet('Level');
  
  const aktivitasData = aktivitasSheet.getDataRange().getValues();
  const levelData = levelSheet.getDataRange().getValues();
  
  const aktivitasHeaders = aktivitasData[0];
  const levelHeaders = levelData[0];
  
  let totalPoin = 0;
  let aktivitasDisetujui = 0;
  let aktivitasMenunggu = 0;
  let aktivitasDitolak = 0;
  
  // Calculate student stats
  for (let i = 1; i < aktivitasData.length; i++) {
    const aktivitas = arrayToObject(aktivitasHeaders, aktivitasData[i]);
    if (aktivitas.siswa_id === currentUser.userId) {
      if (aktivitas.status === 'Disetujui') {
        totalPoin += parseInt(aktivitas.poin) || 0;
        aktivitasDisetujui++;
      } else if (aktivitas.status === 'Menunggu') {
        aktivitasMenunggu++;
      } else if (aktivitas.status === 'Ditolak') {
        aktivitasDitolak++;
      }
    }
  }
  
  // Get levels and determine current level
  const levels = [];
  for (let i = 1; i < levelData.length; i++) {
    levels.push(arrayToObject(levelHeaders, levelData[i]));
  }
  levels.sort((a, b) => a.min_poin - b.min_poin);
  
  let currentLevel = levels[0];
  for (const level of levels) {
    if (totalPoin >= level.min_poin && (level.max_poin === -1 || totalPoin <= level.max_poin)) {
      currentLevel = level;
    }
  }
  
  return {
    success: true,
    data: {
      total_poin: totalPoin,
      level_saat_ini: currentLevel,
      aktivitas_disetujui: aktivitasDisetujui,
      aktivitas_menunggu: aktivitasMenunggu,
      aktivitas_ditolak: aktivitasDitolak
    }
  };
}

// Rekap Handler
function handleRekap(e) {
  const currentUser = getCurrentUser(e);
  if (!currentUser || currentUser.role !== 'guru') {
    return { success: false, message: 'Akses ditolak' };
  }
  
  return handleGetAktivitas(e, currentUser);
}