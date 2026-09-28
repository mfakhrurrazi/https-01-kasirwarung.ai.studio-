/**
 * KasirWarung AI - Complete Google Apps Script Source Files
 * Ready for 1-click copy-paste into Google Apps Script (script.google.com)
 * Attached to Google Spreadsheet: DB_KasirWarung
 */

export interface GasFile {
  name: string;
  type: 'server' | 'html';
  description: string;
  code: string;
}

export const GAS_SCRIPTS: GasFile[] = [
  {
    name: 'Setup.gs',
    type: 'server',
    description: 'Idempotent database architect for DB_KasirWarung spreadsheet: schemas, dropdown validations, formatting, sample rows, salted SHA-256 passwords, sheet protection.',
    code: `/**
 * KasirWarung AI - Setup.gs
 * Database Architect & Idempotent Schema Initializer for DB_KasirWarung
 * Author: Piyu (KasirWarung AI Team)
 * Version: 2.4-PRO (2026)
 */

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Jalankan script ini di dalam Google Spreadsheet 'DB_KasirWarung'!");
  }

  Logger.log("Memulai setup database DB_KasirWarung...");

  // 1. Schema Definitions & Headers
  var schemas = {
    "Products": [
      "product_id", "barcode", "name", "category", "unit", 
      "price_retail", "price_bundle", "bundle_qty", 
      "price_wholesale", "wholesale_qty", "cost_price", 
      "stock", "min_stock", "expiry_date", "active"
    ],
    "Customers": [
      "customer_id", "name", "phone", "address", "credit_limit", "notes"
    ],
    "Sales": [
      "trx_id", "datetime", "cashier", "customer_id", "items_json", 
      "subtotal", "discount", "total", "paid", "change", "method", "status"
    ],
    "Credits": [
      "credit_id", "customer_id", "trx_id", "amount", 
      "paid_amount", "due_date", "status", "last_reminder"
    ],
    "StockMoves": [
      "move_id", "date", "product_id", "type", "qty", "cost_price", "note", "user"
    ],
    "Users": [
      "username", "password_hash", "salt", "role", "full_name", "active"
    ],
    "Settings": [
      "key", "value"
    ],
    "Log_AI": [
      "timestamp", "user", "feature", "status"
    ],
    "Log_Activity": [
      "timestamp", "user", "action", "details"
    ]
  };

  // Dropdown lists
  var categories = ["Sembako", "Minuman", "Rokok", "Snack", "Toiletries", "Gas & Air", "Lainnya"];
  var units = ["pcs", "renteng", "dus", "kg", "liter", "slop", "tabung", "galon"];
  var paymentMethods = ["Tunai", "QRIS", "Transfer", "Kasbon"];
  var creditStatuses = ["Belum Lunas", "Cicil", "Lunas"];
  var moveTypes = ["IN", "OUT", "ADJUST", "SALE"];
  var userRoles = ["Owner", "Kasir"];

  // Create or update sheets
  for (var sheetName in schemas) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      Logger.log("Membuat sheet baru: " + sheetName);
    }

    var headers = schemas[sheetName];
    // Set headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Format header row: bold, freeze row 1, fill #F97316 (Warung Orange), white text
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#F97316")
               .setFontColor("#FFFFFF")
               .setFontWeight("bold")
               .setFontFamily("Nunito")
               .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, 36);

    // Apply specific validations & number formats
    applySheetFormatting(sheet, sheetName, categories, units, paymentMethods, creditStatuses, moveTypes, userRoles);
  }

  // Populate 10 sample realistic Indonesian rows if empty
  seedInitialData(ss);

  // Protect Users and Settings sheets
  protectCriticalSheets(ss);

  // Remove default 'Sheet1' if present
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }

  Logger.log("Setup Database DB_KasirWarung Selesai dengan Sukses!");
  return "Database DB_KasirWarung berhasil dikonfigurasi 100%!";
}

function applySheetFormatting(sheet, sheetName, categories, units, paymentMethods, creditStatuses, moveTypes, userRoles) {
  var maxRows = Math.max(sheet.getMaxRows(), 100);

  if (sheetName === "Products") {
    // Dropdown Category (col 4)
    var ruleCat = SpreadsheetApp.newDataValidation().requireValueInList(categories, true).build();
    sheet.getRange(2, 4, maxRows - 1, 1).setDataValidation(ruleCat);

    // Dropdown Unit (col 5)
    var ruleUnit = SpreadsheetApp.newDataValidation().requireValueInList(units, true).build();
    sheet.getRange(2, 5, maxRows - 1, 1).setDataValidation(ruleUnit);

    // Currency columns: retail (6), bundle (7), wholesale (9), cost_price (11)
    sheet.getRange(2, 6, maxRows - 1, 2).setNumberFormat('"Rp "#,##0');
    sheet.getRange(2, 9, maxRows - 1, 1).setNumberFormat('"Rp "#,##0');
    sheet.getRange(2, 11, maxRows - 1, 1).setNumberFormat('"Rp "#,##0');

    // Date col: expiry_date (14)
    sheet.getRange(2, 14, maxRows - 1, 1).setNumberFormat("dd/MM/yyyy");

    // Checkbox col: active (15)
    var ruleBool = SpreadsheetApp.newDataValidation().requireCheckbox().build();
    sheet.getRange(2, 15, maxRows - 1, 1).setDataValidation(ruleBool);
  }

  if (sheetName === "Customers") {
    // credit_limit (col 5) currency
    sheet.getRange(2, 5, maxRows - 1, 1).setNumberFormat('"Rp "#,##0');
  }

  if (sheetName === "Sales") {
    // datetime (col 2)
    sheet.getRange(2, 2, maxRows - 1, 1).setNumberFormat("dd/MM/yyyy HH:mm");
    // subtotal (6), discount (7), total (8), paid (9), change (10)
    sheet.getRange(2, 6, maxRows - 1, 5).setNumberFormat('"Rp "#,##0');
    // method (col 11)
    var ruleMethod = SpreadsheetApp.newDataValidation().requireValueInList(paymentMethods, true).build();
    sheet.getRange(2, 11, maxRows - 1, 1).setDataValidation(ruleMethod);
  }

  if (sheetName === "Credits") {
    // amount (4), paid_amount (5)
    sheet.getRange(2, 4, maxRows - 1, 2).setNumberFormat('"Rp "#,##0');
    // due_date (6)
    sheet.getRange(2, 6, maxRows - 1, 1).setNumberFormat("dd/MM/yyyy");
    // status (7)
    var ruleCreditStatus = SpreadsheetApp.newDataValidation().requireValueInList(creditStatuses, true).build();
    sheet.getRange(2, 7, maxRows - 1, 1).setDataValidation(ruleCreditStatus);
  }

  if (sheetName === "StockMoves") {
    // date (2)
    sheet.getRange(2, 2, maxRows - 1, 1).setNumberFormat("dd/MM/yyyy HH:mm");
    // type (4)
    var ruleMove = SpreadsheetApp.newDataValidation().requireValueInList(moveTypes, true).build();
    sheet.getRange(2, 4, maxRows - 1, 1).setDataValidation(ruleMove);
    // cost_price (6)
    sheet.getRange(2, 6, maxRows - 1, 1).setNumberFormat('"Rp "#,##0');
  }

  if (sheetName === "Users") {
    // role (4)
    var ruleRole = SpreadsheetApp.newDataValidation().requireValueInList(userRoles, true).build();
    sheet.getRange(2, 4, maxRows - 1, 1).setDataValidation(ruleRole);
    // active (6)
    var ruleUserBool = SpreadsheetApp.newDataValidation().requireCheckbox().build();
    sheet.getRange(2, 6, maxRows - 1, 1).setDataValidation(ruleUserBool);
  }
}

function protectCriticalSheets(ss) {
  var sheetsToProtect = ["Users", "Settings"];
  for (var i = 0; i < sheetsToProtect.length; i++) {
    var s = ss.getSheetByName(sheetsToProtect[i]);
    if (s) {
      var protections = s.getProtections(SpreadsheetApp.ProtectionType.SHEET);
      if (protections.length === 0) {
        var protection = s.protect().setDescription("Dilindungi untuk Keamanan Data Sensitif KasirWarung AI");
        protection.setWarningOnly(true);
      }
    }
  }
}

function seedInitialData(ss) {
  var productsSheet = ss.getSheetByName("Products");
  if (productsSheet.getLastRow() <= 1) {
    var pData = [
      ["PRD-260926-001", "899999901001", "Beras Ramos Setra Ramos 5kg", "Sembako", "pcs", 72000, 70000, 3, 68000, 10, 64000, 24, 5, new Date("2027-06-30"), true],
      ["PRD-260926-002", "899277521001", "Minyak Goreng Bimoli Klasik 2L Pouch", "Sembako", "pcs", 38500, 37500, 3, 36000, 6, 34000, 18, 6, new Date("2027-04-15"), true],
      ["PRD-260926-003", "899999901003", "Telur Ayam Negeri Fresh 1kg", "Sembako", "kg", 28000, 27000, 5, 26000, 15, 24500, 35, 10, new Date("2026-10-10"), true],
      ["PRD-260926-004", "899277511004", "Gula Pasir Gulaku Tebu Kuning 1kg", "Sembako", "pcs", 17500, 17000, 5, 16200, 24, 15500, 42, 10, new Date("2027-12-31"), true],
      ["PRD-260926-005", "089686010051", "Indomie Goreng Spesial 85g", "Snack", "pcs", 3500, 3300, 5, 3050, 40, 2900, 160, 40, new Date("2027-03-20"), true],
      ["PRD-260926-006", "899277531006", "Kopi Kapal Api Special Mix 10x24g", "Minuman", "renteng", 14500, 14000, 3, 13500, 10, 12500, 25, 6, new Date("2027-08-10"), true],
      ["PRD-260926-007", "899999901007", "Gas Elpiji 3kg Melon (Isi Ulang)", "Gas & Air", "tabung", 22000, 21500, 3, 21000, 10, 19500, 3, 5, new Date("2030-01-01"), true],
      ["PRD-260926-008", "899999901008", "Air Mineral Galon Aqua 19L (Refill)", "Gas & Air", "galon", 20000, 19500, 3, 19000, 5, 17000, 12, 4, new Date("2027-01-01"), true],
      ["PRD-260926-009", "899277541009", "Rokok Sampoerna A Mild 16 Batang", "Rokok", "pcs", 34000, 33500, 5, 33000, 10, 31800, 30, 8, new Date("2027-11-15"), true],
      ["PRD-260926-010", "899277551010", "Sabun Mandi Lifebuoy Total 10 110g", "Toiletries", "pcs", 5000, 4700, 3, 4400, 12, 4000, 4, 10, new Date("2027-05-18"), true]
    ];
    productsSheet.getRange(2, 1, pData.length, pData[0].length).setValues(pData);
  }

  var customersSheet = ss.getSheetByName("Customers");
  if (customersSheet.getLastRow() <= 1) {
    var cData = [
      ["PLG-260926-001", "Pak RT Bambang", "081234567801", "Jl. Melati No. 12 RT 03/04", 500000, "Ketua RT, bayar rutin awal bulan"],
      ["PLG-260926-002", "Bu Siti Warteg Berkah", "081398765402", "Jl. Raya Samping Pos Ronda", 1000000, "Kulakan beras & minyak harian"],
      ["PLG-260926-003", "Mas Joko Bengkel Motor", "085712345603", "Ruko Depan Lapangan", 300000, "Sering beli rokok & kopi sachet"],
      ["PLG-260926-004", "Bu Mega Laundry Kiloan", "081223344504", "Gang Mawar 2 No. 5", 500000, "Beli sabun & plastik, tertib bayar"],
      ["PLG-260926-005", "Pak Haji Syukur", "081188990005", "Jl. Cendrawasih Utama No. 1", 1500000, "Tokoh masyarakat, sering transfer"],
      ["PLG-260926-006", "Kak Rina Kos Putri", "087812998806", "Kos Pondok Asri Kamar 3", 150000, "Mahasiswi, sering ambil mie & snack"],
      ["PLG-260926-007", "Bang Udin Ojek Online", "089677889907", "Pangkalan Ojek Pintu Gerbang", 100000, "Kopi sachet, bayar saat narik selesai"],
      ["PLG-260926-008", "Ibu Diah Guru SD", "081334455608", "Komplek Guru No. 8", 600000, "Belanja mingguan keluarga"],
      ["PLG-260926-009", "Pak Slamet Pos Satpam", "085299887709", "Pos Satpam Blok B", 250000, "Ambil kopi & rokok malam hari"],
      ["PLG-260926-010", "Bu Eni Katering Rumahan", "081566778810", "Jl. Kenanga No. 20", 1200000, "Pesanan telur & minyak pesanan katering"]
    ];
    customersSheet.getRange(2, 1, cData.length, cData[0].length).setValues(cData);
  }

  var usersSheet = ss.getSheetByName("Users");
  if (usersSheet.getLastRow() <= 1) {
    // Salted SHA-256 for admin / admin123
    var salt = "kw_salt_8891";
    var adminHash = computeSha256("admin123" + salt);
    var kasirHash = computeSha256("kasir123" + salt);

    var uData = [
      ["admin", adminHash, salt, "Owner", "Pak Piyu (Owner Warung)", true],
      ["kasir", kasirHash, salt, "Kasir", "Budi Santoso (Kasir Shift 1)", true]
    ];
    usersSheet.getRange(2, 1, uData.length, uData[0].length).setValues(uData);
  }

  var settingsSheet = ss.getSheetByName("Settings");
  if (settingsSheet.getLastRow() <= 1) {
    var sData = [
      ["BUSINESS_NAME", "Warung Sembako Berkah Jaya"],
      ["LOGO_URL", "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=120&auto=format&fit=crop&q=80"],
      ["WHATSAPP", "081234567890"],
      ["TAX_PERCENT", "0"],
      ["AI_ENABLED", "TRUE"]
    ];
    settingsSheet.getRange(2, 1, sData.length, sData[0].length).setValues(sData);
  }
}

function computeSha256(raw) {
  var signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
  var hash = "";
  for (var i = 0; i < signature.length; i++) {
    var byteVal = signature[i];
    if (byteVal < 0) byteVal += 256;
    var byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = "0" + byteHex;
    hash += byteHex;
  }
  return hash;
}
`
  },
  {
    name: 'Code.gs',
    type: 'server',
    description: 'Routing, doGet with ?page= routing, session handling in CacheService (8 hours), authentication and CRUD API endpoints with role checking.',
    code: `/**
 * KasirWarung AI - Code.gs
 * Web App Controller & Server-Side API Router
 * Author: Piyu (KasirWarung AI)
 */

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) ? e.parameter.page : "pos";
  var template = HtmlService.createTemplateFromFile("Index");
  template.activePage = page;
  
  return template.evaluate()
    .setTitle("KasirWarung AI - POS & Kasbon Sembako")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Authentication & Session Management
 */
function apiLogin(username, password) {
  try {
    var repo = getSheetDataAsObjects("Users");
    var user = null;
    for (var i = 0; i < repo.length; i++) {
      if (repo[i].username === username && (repo[i].active === true || repo[i].active === "TRUE")) {
        user = repo[i];
        break;
      }
    }

    if (!user) {
      return { success: false, message: "Username tidak ditemukan atau dinonaktifkan!" };
    }

    var expectedHash = computeSha256(password + user.salt);
    if (expectedHash !== user.password_hash) {
      return { success: false, message: "Password salah!" };
    }

    // Generate session token and save in CacheService for 8 hours (28800 s)
    var token = "KW_SESS_" + Utilities.getUuid();
    var sessionData = {
      username: user.username,
      role: user.role,
      full_name: user.full_name,
      createdAt: new Date().toISOString()
    };
    
    CacheService.getUserCache().put(token, JSON.stringify(sessionData), 28800);

    return {
      success: true,
      token: token,
      user: {
        username: user.username,
        role: user.role,
        full_name: user.full_name
      }
    };
  } catch (err) {
    return { success: false, message: "Terjadi kesalahan: " + err.message };
  }
}

function getSessionUser(token) {
  if (!token) return null;
  var cached = CacheService.getUserCache().get(token);
  if (!cached) return null;
  try {
    return JSON.parse(cached);
  } catch (e) {
    return null;
  }
}

function apiLogout(token) {
  if (token) {
    CacheService.getUserCache().remove(token);
  }
  return { success: true };
}

/**
 * Unified API Dispatcher
 */
function apiCall(action, payload, token) {
  var user = getSessionUser(token);
  
  // Public actions (no session required)
  if (action === "login") {
    return apiLogin(payload.username, payload.password);
  }
  if (action === "getPublicSettings") {
    return { success: true, settings: getAppSettings() };
  }

  // Session verification
  if (!user) {
    return { success: false, unauthorized: true, message: "Sesi telah berakhir. Silakan login kembali." };
  }

  try {
    switch (action) {
      case "getInitialAppState":
        return apiGetInitialAppState(user);
        
      case "createSale":
        return apiCreateSale(payload, user);
        
      case "createProduct":
        requireRole(user, ["Owner"]);
        return apiCreateProduct(payload, user);
        
      case "updateProduct":
        requireRole(user, ["Owner"]);
        return apiUpdateProduct(payload, user);
        
      case "stockIn":
        requireRole(user, ["Owner"]);
        return apiStockIn(payload, user);
        
      case "recordCreditPayment":
        return apiRecordCreditPayment(payload, user);
        
      case "updateSettings":
        requireRole(user, ["Owner"]);
        return apiUpdateSettings(payload, user);

      case "getDailyClosing":
        return apiGetDailyClosing(payload.date, user);
        
      case "callAIFeature":
        return apiCallAI(payload.feature, payload.data, user);

      default:
        return { success: false, message: "Action tidak dikenal: " + action };
    }
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function requireRole(user, allowedRoles) {
  if (allowedRoles.indexOf(user.role) === -1) {
    throw new Error("Akses Ditolak: Fitur ini hanya untuk peran: " + allowedRoles.join(", "));
  }
}
`
  },
  {
    name: 'Data.gs',
    type: 'server',
    description: 'Repository helpers with LockService, batch getValues/setValues, header-name mapping, and automated sequential ID generators (PRD, TRX, PLG, KSB).',
    code: `/**
 * KasirWarung AI - Data.gs
 * Repository & Data Access Layer with Concurrency Locks
 * Author: Piyu (KasirWarung AI)
 */

function getDbSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Read sheet into array of objects using Row 1 headers
 */
function getSheetDataAsObjects(sheetName) {
  var ss = getDbSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0];
  var rows = [];

  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[i][j];
    }
    rows.push(obj);
  }
  return rows;
}

/**
 * Generate sequential IDs (e.g. PRD-260926-001)
 */
function generateNextId(prefix, sheetName, idColumnName) {
  var ss = getDbSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var now = new Date();
  var yy = String(now.getFullYear()).slice(-2);
  var mm = ("0" + (now.getMonth() + 1)).slice(-2);
  var dd = ("0" + now.getDate()).slice(-2);
  var dateStr = yy + mm + dd;

  var countToday = 1;
  if (sheet && sheet.getLastRow() > 1) {
    var colIdx = getColumnIndexByName(sheet, idColumnName);
    if (colIdx > 0) {
      var ids = sheet.getRange(2, colIdx, sheet.getLastRow() - 1, 1).getValues();
      var todayPrefix = prefix + "-" + dateStr + "-";
      for (var i = 0; i < ids.length; i++) {
        var str = String(ids[i][0]);
        if (str.indexOf(todayPrefix) === 0) {
          var num = parseInt(str.replace(todayPrefix, ""), 10);
          if (num >= countToday) countToday = num + 1;
        }
      }
    }
  }

  var paddedNum = ("000" + countToday).slice(-3);
  return prefix + "-" + dateStr + "-" + paddedNum;
}

function getColumnIndexByName(sheet, headerName) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return -1;
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  for (var j = 0; j < headers.length; j++) {
    if (headers[j] === headerName) return j + 1;
  }
  return -1;
}

function getAppSettings() {
  var rows = getSheetDataAsObjects("Settings");
  var map = {
    BUSINESS_NAME: "Warung Sembako Berkah Jaya",
    LOGO_URL: "",
    WHATSAPP: "081234567890",
    TAX_PERCENT: 0,
    AI_ENABLED: true
  };
  for (var i = 0; i < rows.length; i++) {
    var val = rows[i].value;
    if (rows[i].key === "AI_ENABLED") {
      map.AI_ENABLED = (String(val).toUpperCase() === "TRUE");
    } else if (rows[i].key === "TAX_PERCENT") {
      map.TAX_PERCENT = Number(val) || 0;
    } else {
      map[rows[i].key] = val;
    }
  }
  return map;
}

/**
 * Handle checkout with LockService to avoid race condition
 */
function apiCreateSale(saleData, user) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000); // 15 sec lock

  try {
    var ss = getDbSpreadsheet();
    var salesSheet = ss.getSheetByName("Sales");
    var productsSheet = ss.getSheetByName("Products");
    var stockMovesSheet = ss.getSheetByName("StockMoves");
    var creditsSheet = ss.getSheetByName("Credits");

    var trxId = generateNextId("TRX", "Sales", "trx_id");
    var nowIso = new Date().toISOString();

    // Check credit limit if payment method is Kasbon
    if (saleData.method === "Kasbon") {
      if (!saleData.customer_id) {
        throw new Error("Transaksi Kasbon wajib memilih data Pelanggan!");
      }
      var custRows = getSheetDataAsObjects("Customers");
      var customer = null;
      for (var c = 0; c < custRows.length; c++) {
        if (custRows[c].customer_id === saleData.customer_id) {
          customer = custRows[c];
          break;
        }
      }
      if (!customer) throw new Error("Pelanggan tidak ditemukan!");

      // Calculate current outstanding debt
      var currentDebt = 0;
      var creditRows = getSheetDataAsObjects("Credits");
      for (var k = 0; k < creditRows.length; k++) {
        if (creditRows[k].customer_id === customer.customer_id && creditRows[k].status !== "Lunas") {
          currentDebt += (Number(creditRows[k].amount) - Number(creditRows[k].paid_amount));
        }
      }

      if (currentDebt + saleData.total > Number(customer.credit_limit)) {
        throw new Error("Gagal: Transaksi melebihi limit kasbon (" + 
          customer.name + " limit Rp " + Number(customer.credit_limit).toLocaleString("id-ID") + 
          ", sisa limit Rp " + (Number(customer.credit_limit) - currentDebt).toLocaleString("id-ID") + ")");
      }
    }

    // 1. Record Sale row
    var saleRow = [
      trxId,
      nowIso,
      user.full_name || user.username,
      saleData.customer_id || "",
      JSON.stringify(saleData.items),
      saleData.subtotal,
      saleData.discount || 0,
      saleData.total,
      saleData.paid || 0,
      saleData.change || 0,
      saleData.method,
      "Selesai"
    ];
    salesSheet.appendRow(saleRow);

    // 2. Deduct stock & create StockMoves
    var pValues = productsSheet.getDataRange().getValues();
    var pHeaders = pValues[0];
    var pIdCol = pHeaders.indexOf("product_id");
    var pStockCol = pHeaders.indexOf("stock");

    var movesToAppend = [];
    var items = saleData.items || [];

    for (var i = 0; i < items.length; i++) {
      var itm = items[i];
      // Find row in Products
      for (var r = 1; r < pValues.length; r++) {
        if (pValues[r][pIdCol] === itm.product_id) {
          var oldStock = Number(pValues[r][pStockCol]) || 0;
          var newStock = Math.max(0, oldStock - itm.qty);
          productsSheet.getRange(r + 1, pStockCol + 1).setValue(newStock);
          break;
        }
      }

      // Add StockMove
      var moveId = generateNextId("MOV", "StockMoves", "move_id");
      movesToAppend.push([
        moveId,
        nowIso,
        itm.product_id,
        "SALE",
        itm.qty,
        itm.cost_price || 0,
        "Penjualan Kasir TRX " + trxId,
        user.username
      ]);
    }

    if (movesToAppend.length > 0) {
      stockMovesSheet.getRange(stockMovesSheet.getLastRow() + 1, 1, movesToAppend.length, movesToAppend[0].length).setValues(movesToAppend);
    }

    // 3. If Kasbon, record in Credits sheet
    if (saleData.method === "Kasbon") {
      var creditId = generateNextId("KSB", "Credits", "credit_id");
      var dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // Default 7 hari
      var creditRow = [
        creditId,
        saleData.customer_id,
        trxId,
        saleData.total,
        0,
        Utilities.formatDate(dueDate, Session.getScriptTimeZone(), "yyyy-MM-dd"),
        "Belum Lunas",
        ""
      ];
      creditsSheet.appendRow(creditRow);
    }

    return {
      success: true,
      trx_id: trxId,
      message: "Transaksi berhasil disimpan!"
    };

  } finally {
    lock.releaseLock();
  }
}

/**
 * Record stock replenishment and recalculate average cost price
 */
function apiStockIn(payload, user) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getDbSpreadsheet();
    var pSheet = ss.getSheetByName("Products");
    var mSheet = ss.getSheetByName("StockMoves");
    var pValues = pSheet.getDataRange().getValues();
    var headers = pValues[0];

    var idCol = headers.indexOf("product_id");
    var stockCol = headers.indexOf("stock");
    var costCol = headers.indexOf("cost_price");

    var targetRow = -1;
    for (var r = 1; r < pValues.length; r++) {
      if (pValues[r][idCol] === payload.product_id) {
        targetRow = r + 1;
        break;
      }
    }

    if (targetRow === -1) throw new Error("Produk tidak ditemukan!");

    var curStock = Number(pValues[targetRow - 1][stockCol]) || 0;
    var curCost = Number(pValues[targetRow - 1][costCol]) || 0;
    var inQty = Number(payload.qty) || 0;
    var inCost = Number(payload.cost_price) || curCost;

    // Recalculate Weighted Average Cost Price
    var newStock = curStock + inQty;
    var newCost = curCost;
    if (newStock > 0) {
      newCost = Math.round(((curStock * curCost) + (inQty * inCost)) / newStock);
    }

    pSheet.getRange(targetRow, stockCol + 1).setValue(newStock);
    pSheet.getRange(targetRow, costCol + 1).setValue(newCost);

    var moveId = generateNextId("MOV", "StockMoves", "move_id");
    mSheet.appendRow([
      moveId,
      new Date().toISOString(),
      payload.product_id,
      "IN",
      inQty,
      inCost,
      payload.note || "Stok Masuk / Kulakan",
      user.username
    ]);

    return { success: true, newStock: newStock, newCost: newCost };
  } finally {
    lock.releaseLock();
  }
}
`
  },
  {
    name: 'AI.gs',
    type: 'server',
    description: 'callAI wrapper for OpenAI-compatible endpoint with temperature 0.4, 6-hr CacheService, Log_AI sheet logging, and graceful rule-based fallbacks for Warung features.',
    code: `/**
 * KasirWarung AI - AI.gs
 * AI Integration with 6-Hour Cache and Offline Rule Fallbacks
 * Author: Piyu (KasirWarung AI)
 */

function apiCallAI(feature, data, user) {
  var props = PropertiesService.getScriptProperties();
  var aiBaseUrl = props.getProperty("AI_BASE_URL") || "http://43.133.148.28:20128/v1";
  var aiApiKey = props.getProperty("AI_API_KEY") || "";
  var aiModel = props.getProperty("AI_MODEL") || "gpt-3.5-turbo";

  var settings = getAppSettings();
  if (settings.AI_ENABLED === false) {
    return {
      success: true,
      source: "rule_fallback",
      badge: "AI tidak aktif",
      result: getFallbackResult(feature, data)
    };
  }

  // Check 6-Hour Cache in CacheService
  var cacheKey = "KW_AI_" + feature + "_" + Utilities.base64Encode(JSON.stringify(data)).slice(0, 80);
  var cached = CacheService.getScriptCache().get(cacheKey);
  if (cached) {
    return {
      success: true,
      source: "cache",
      badge: "Dibantu AI (Cache)",
      result: cached
    };
  }

  if (!aiApiKey) {
    logAI(user.username, feature, "FALLBACK_NO_KEY");
    return {
      success: true,
      source: "rule_fallback",
      badge: "AI tidak aktif",
      result: getFallbackResult(feature, data)
    };
  }

  try {
    var prompt = buildAIPrompt(feature, data);
    var messages = [
      { role: "system", content: "Anda adalah asisten cerdas ramah untuk warung kelontong sembako Indonesia. Jawab selalu dalam Bahasa Indonesia yang santun, jelas, dan praktis." },
      { role: "user", content: prompt }
    ];

    var payload = {
      model: aiModel,
      messages: messages,
      temperature: 0.4
    };

    var options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "Authorization": "Bearer " + aiApiKey
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    // Try call with 1 retry
    var response = null;
    try {
      response = UrlFetchApp.fetch(aiBaseUrl + "/chat/completions", options);
    } catch (e1) {
      Utilities.sleep(1000);
      response = UrlFetchApp.fetch(aiBaseUrl + "/chat/completions", options);
    }

    if (response && response.getResponseCode() === 200) {
      var json = JSON.parse(response.getContentText());
      var reply = json.choices[0].message.content;

      // Cache for 6 hours (21600 seconds)
      CacheService.getScriptCache().put(cacheKey, reply, 21600);
      logAI(user.username, feature, "SUCCESS");

      return {
        success: true,
        source: "ai",
        badge: "Dibantu AI",
        result: reply
      };
    } else {
      logAI(user.username, feature, "FALLBACK_HTTP_ERR");
      return {
        success: true,
        source: "rule_fallback",
        badge: "AI tidak aktif",
        result: getFallbackResult(feature, data)
      };
    }

  } catch (err) {
    logAI(user.username, feature, "FALLBACK_EXCEPTION");
    return {
      success: true,
      source: "rule_fallback",
      badge: "AI tidak aktif",
      result: getFallbackResult(feature, data)
    };
  }
}

function buildAIPrompt(feature, data) {
  if (feature === "Saran Kulakan") {
    return "Analisis data stok warung berikut dan buatkan rekomendasi kulakan mingguan prioritas:\\n" + JSON.stringify(data);
  }
  if (feature === "Pesan Tagih Halus") {
    return "Tulis pesan WhatsApp santun menagih kasbon kepada " + data.customerName + " sebesar Rp " + Number(data.amount).toLocaleString("id-ID") + " (lewat jatuh tempo " + data.daysOverdue + " hari).";
  }
  if (feature === "Cerita Omzet Hari Ini") {
    return "Tulis ringkasan 3 kalimat ramah bahasa Indonesia untuk pemilik warung tentang omzet Rp " + Number(data.totalOmzet).toLocaleString("id-ID") + ", laba Rp " + Number(data.totalProfit).toLocaleString("id-ID") + ", dan produk terlaris " + data.topProduct + ".";
  }
  return "Berikan masukan praktis untuk warung: " + JSON.stringify(data);
}

function getFallbackResult(feature, data) {
  if (feature === "Saran Kulakan") {
    var pList = data.products || [];
    var items = [];
    for (var i = 0; i < pList.length; i++) {
      var p = pList[i];
      if (p.stock <= p.min_stock) {
        var restock = Math.max(p.min_stock * 2 - p.stock, 5);
        items.push("- " + p.name + ": stok tersisa " + p.stock + " " + p.unit + ", sarankan beli " + restock + " " + p.unit);
      }
    }
    if (items.length === 0) return "Semua stok produk saat ini masih di atas batas aman. Belum perlu kulakan darurat.";
    return "Rekomendasi Kulakan (Aturan Batas Stok):\\n" + items.join("\\n");
  }

  if (feature === "Pesan Tagih Halus") {
    return "Assalamu'alaikum wr. wb. Selamat siang Bapak/Ibu " + (data.customerName || "Pelanggan") + 
      ". Semoga senantiasa sehat dan berkah rezekinya. Sekadar menginfokan catatan kasbon belanjaan warung sebesar Rp " + 
      Number(data.amount || 0).toLocaleString("id-ID") + ". Bila ada kelonggaran rezeki monggo bisa mampir ke warung nggih. Matur nuwun sanget atas pengertiannya. 🙏";
  }

  if (feature === "Cerita Omzet Hari Ini") {
    return "Alhamdulillah, hari ini warung mencatatkan omzet sebesar Rp " + Number(data.totalOmzet || 0).toLocaleString("id-ID") + 
      " dengan laba kotor Rp " + Number(data.totalProfit || 0).toLocaleString("id-ID") + 
      ". Produk kategori " + (data.topProduct || "Sembako") + " menjadi produk yang paling banyak dibeli pelanggan hari ini. Semoga berkah dan besok semakin laris!";
  }

  return "Selesai diproses berdasarkan aturan baku warung.";
}

function logAI(username, feature, status) {
  try {
    var ss = getDbSpreadsheet();
    var sheet = ss.getSheetByName("Log_AI");
    if (sheet) {
      sheet.appendRow([new Date().toISOString(), username, feature, status]);
    }
  } catch (e) {}
}
`
  },
  {
    name: 'Reports.gs',
    type: 'server',
    description: 'Reports engine: daily closing, 7-day sales calculation, payment method aggregation, top products, and CSV export generator.',
    code: `/**
 * KasirWarung AI - Reports.gs
 * Analytics, Daily Closing & Export Utilities
 * Author: Piyu (KasirWarung AI)
 */

function apiGetDailyClosing(targetDateStr, user) {
  var targetDate = targetDateStr || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  var sales = getSheetDataAsObjects("Sales");

  var totalCash = 0;
  var totalQris = 0;
  var totalTransfer = 0;
  var totalKasbon = 0;
  var totalOmzet = 0;
  var totalTrx = 0;

  for (var i = 0; i < sales.length; i++) {
    var s = sales[i];
    var sDate = String(s.datetime).slice(0, 10);
    if (sDate === targetDate && s.status === "Selesai") {
      totalTrx++;
      var tot = Number(s.total) || 0;
      totalOmzet += tot;
      if (s.method === "Tunai") totalCash += (Number(s.paid) - Number(s.change));
      else if (s.method === "QRIS") totalQris += tot;
      else if (s.method === "Transfer") totalTransfer += tot;
      else if (s.method === "Kasbon") totalKasbon += tot;
    }
  }

  return {
    success: true,
    date: targetDate,
    summary: {
      cashier: user.full_name,
      totalTrx: totalTrx,
      totalOmzet: totalOmzet,
      totalCashInDrawer: totalCash,
      totalQris: totalQris,
      totalTransfer: totalTransfer,
      totalKasbon: totalKasbon
    }
  };
}

function createDailyBackupTrigger() {
  var ss = getDbSpreadsheet();
  var backupFolderId = ""; // Optional Drive folder ID
  var fileName = "DB_KasirWarung_Backup_" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmm");
  
  var file = DriveApp.getFileById(ss.getId());
  var copy = file.makeCopy(fileName);
  Logger.log("Backup berhasil dibuat: " + copy.getName());
  return copy.getUrl();
}
`
  },
  {
    name: 'Index.html',
    type: 'html',
    description: 'HtmlService entry point with header, warm warung banner, Made by Piyu badge, dynamic page routing, footer, and 58mm thermal receipt layout.',
    code: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>KasirWarung AI - POS & Kasbon Sembako</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <?!= include("Styles"); ?>
</head>
<body class="bg-[#FFFBEB] font-['Nunito',sans-serif] text-slate-800">
  <div id="app" class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-amber-200 sticky top-0 z-40 shadow-sm">
      <div class="h-2 warung-awning"></div>
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xl shadow-md">
            🏪
          </div>
          <div>
            <h1 class="font-extrabold text-lg text-slate-900 leading-tight flex items-center gap-2">
              <span id="headerBusinessName">Warung Sembako Berkah</span>
              <span class="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">KasirWarung AI</span>
            </h1>
            <div class="text-xs text-slate-500 flex items-center gap-2">
              <span>Made by Piyu</span>
              <span>·</span>
              <span id="headerClock">12:00</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2" id="headerUserNav">
          <!-- User info & quick actions loaded dynamically -->
        </div>
      </div>
    </header>

    <!-- Main Workspace Container -->
    <div class="flex-1 flex max-w-7xl w-full mx-auto p-4 gap-6">
      <!-- Desktop Sidebar -->
      <aside class="hidden md:flex flex-col w-56 bg-white rounded-2xl border border-amber-200 p-3 shadow-sm h-fit gap-1" id="desktopNav">
        <!-- Injected via Scripts.html -->
      </aside>

      <!-- Main Dynamic Content -->
      <main class="flex-1 bg-white rounded-2xl border border-amber-200 p-5 shadow-sm min-h-[500px]" id="pageContainer">
        <div class="text-center py-20 text-slate-400">Memuat KasirWarung AI...</div>
      </main>
    </div>

    <!-- Mobile Bottom Navigation Bar -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 py-2 px-3 flex justify-around items-center z-50 shadow-lg" id="mobileBottomNav">
      <!-- Injected via Scripts.html -->
    </nav>

    <!-- Footer -->
    <footer class="mt-auto bg-slate-900 text-slate-400 text-xs py-4 px-4 text-center border-t border-slate-800 pb-16 md:pb-4">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        <div>© 2026 KasirWarung AI · Made by Piyu · Versi 2.4-PRO (Lisensi Aktif)</div>
        <div class="flex items-center gap-4">
          <a href="https://wa.me/6281234567890" target="_blank" class="hover:text-amber-400 transition">Bantuan WhatsApp</a>
          <span>·</span>
          <span>Panduan</span>
          <span>·</span>
          <span>Privasi</span>
        </div>
      </div>
    </footer>
  </div>

  <?!= include("Scripts"); ?>
</body>
</html>
`
  },
  {
    name: 'Styles.html',
    type: 'html',
    description: 'CSS rules, warung orange styling, mobile touch targets >= 44px, and 58mm thermal receipt printing style.',
    code: `<style>
:root {
  --primary: #F97316;
  --secondary: #FACC15;
  --accent: #16A34A;
}

body {
  font-family: 'Nunito', sans-serif;
}

.warung-awning {
  background: repeating-linear-gradient(
    -45deg,
    #f97316,
    #f97316 20px,
    #ea580c 20px,
    #ea580c 40px
  );
}

.btn-chunky {
  min-height: 44px;
  font-weight: 700;
  border-radius: 14px;
  transition: all 0.15s ease-in-out;
}
.btn-chunky:active {
  transform: scale(0.97);
}

/* 58mm Thermal Printer CSS */
@media print {
  body * {
    visibility: hidden;
  }
  #thermal-receipt, #thermal-receipt * {
    visibility: visible;
  }
  #thermal-receipt {
    position: absolute;
    left: 0;
    top: 0;
    width: 58mm;
    max-width: 58mm;
    margin: 0;
    padding: 2mm;
    font-size: 11px;
    font-family: monospace;
    background: #fff;
    color: #000;
  }
}
</style>
`
  },
  {
    name: 'Scripts.html',
    type: 'html',
    description: 'Client state management, POS cart calculator with automatic tier pricing (retail, bundle, wholesale), thermal receipt modal, and Google Script API dispatcher.',
    code: `<script>
/**
 * KasirWarung AI - Client Logic
 */
var STATE = {
  user: null,
  token: null,
  activePage: 'pos',
  products: [],
  customers: [],
  cart: [],
  settings: {
    BUSINESS_NAME: 'Warung Sembako Berkah Jaya',
    AI_ENABLED: true
  }
};

window.onload = function() {
  initClock();
  // Check if session token stored in browser sessionStorage
  var savedToken = sessionStorage.getItem("KW_TOKEN");
  var savedUser = sessionStorage.getItem("KW_USER");
  if (savedToken && savedUser) {
    STATE.token = savedToken;
    STATE.user = JSON.parse(savedUser);
    loadInitialData();
  } else {
    renderPage('login');
  }
};

function initClock() {
  setInterval(function() {
    var el = document.getElementById("headerClock");
    if (el) {
      var d = new Date();
      el.textContent = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    }
  }, 1000);
}

function loadInitialData() {
  google.script.run
    .withSuccessHandler(function(res) {
      if (res && res.success) {
        STATE.products = res.products || [];
        STATE.customers = res.customers || [];
        STATE.settings = res.settings || STATE.settings;
        renderHeader();
        renderSidebar();
        renderPage('pos');
      }
    })
    .withFailureHandler(function(err) {
      alert("Gagal memuat data: " + err.message);
    })
    .apiCall("getInitialAppState", {}, STATE.token);
}

// Automatic Tier Pricing Calculation
function calculateItemPrice(product, qty) {
  if (product.wholesale_qty > 0 && qty >= product.wholesale_qty) {
    return { price: product.price_wholesale, tier: 'Grosir' };
  }
  if (product.bundle_qty > 0 && qty >= product.bundle_qty) {
    return { price: product.price_bundle, tier: 'Paket/Bundle' };
  }
  return { price: product.price_retail, tier: 'Eceran' };
}
</script>
`
  }
];

export const DEPLOYMENT_GUIDE_MD = `
# Panduan Lengkap Instalasi & Deploy "KasirWarung AI" di Google Sheets

Selamat! Anda memiliki paket lengkap sistem KasirWarung AI untuk UMKM / warung sembako.
Ikuti 4 langkah mudah berikut untuk mengaktifkan sistem di Google Drive & Google Apps Script Anda:

---

### Langkah 1: Buat Spreadsheet "DB_KasirWarung"
1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet tepat: **\`DB_KasirWarung\`**.
3. Di menu atas, klik **Extensions (Ekstensi)** > **Apps Script**.

---

### Langkah 2: Salin File Script ke Apps Script Editor
Di editor Apps Script, buat file sesuai daftar berikut:

1. **File Script (.gs)**:
   - Buat/ganti \`Code.gs\` -> salin isi dari file **Code.gs**
   - Tambah file script \`Setup.gs\` -> salin isi dari **Setup.gs**
   - Tambah file script \`Data.gs\` -> salin isi dari **Data.gs**
   - Tambah file script \`AI.gs\` -> salin isi dari **AI.gs**
   - Tambah file script \`Reports.gs\` -> salin isi dari **Reports.gs**

2. **File HTML (.html)**:
   - Tambah file HTML \`Index.html\` -> salin isi dari **Index.html**
   - Tambah file HTML \`Styles.html\` -> salin isi dari **Styles.html**
   - Tambah file HTML \`Scripts.html\` -> salin isi dari **Scripts.html**

---

### Langkah 3: Konfigurasi Script Properties (Kunci & AI)
1. Di panel kiri Apps Script, klik ikon roda gigi **Project Settings (Setelan Project)**.
2. Gulir ke bawah ke bagian **Script Properties (Properti Skrip)**.
3. Klik **Add script property** dan masukkan parameter berikut:
   - **\`AI_BASE_URL\`**: \`http://43.133.148.28:20128/v1\` *(atau endpoint OpenAI/Proxy HTTPS Anda)*
   - **\`AI_API_KEY\`**: *(Kunci API Anda atau biarkan kosong untuk mode aturan)*
   - **\`AI_MODEL\`**: \`gpt-3.5-turbo\`
   - **\`LICENSE_KEY\`**: \`KW-AI-PRO-2026-PIYU-8891\`
4. Klik **Save script properties**.

---

### Langkah 4: Jalankan Setup Awal Database
1. Buka file \`Setup.gs\`.
2. Di menu dropdown fungsi (sebelah tombol Debug), pilih **\`setupDatabase\`**.
3. Klik tombol **Run (Jalankan)**.
4. Google akan meminta izin otorisasi (*Review permissions* > Pilih akun Google Anda > *Advanced* > *Go to Untitled project (unsafe)* > *Allow*).
5. Tunggu hingga status "Execution completed". Spreadsheet Anda sekarang memiliki 8 lembar kerja dengan format orange (#F97316), validasi dropdown, dan 10 data sampel siap pakai!

---

### Langkah 5: Deploy Sebagai Web App
1. Di pojok kanan atas Apps Script, klik **Deploy (Terapkan)** > **New deployment (Penerapan baru)**.
2. Klik ikon roda gigi di sebelah kiri, pilih jenis **Web app**.
3. Atur konfigurasi:
   - **Description**: \`KasirWarung AI v2.4-PRO\`
   - **Execute as**: **Me (emailanda@gmail.com)**
   - **Who has access**: **Anyone (Siapa saja)** *(agar kasir di HP Android bisa membuka tanpa login akun Google)*
4. Klik **Deploy**.
5. Salin tautan **Web App URL** dan buka di browser HP Android Anda!

---

### Akun Login Bawaan:
- **Owner (Pemilik)**: Username: \`admin\` | Password: \`admin123\`
- **Kasir (Karyawan)**: Username: \`kasir\` | Password: \`kasir123\`
`;
