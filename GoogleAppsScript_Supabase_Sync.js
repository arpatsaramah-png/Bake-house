/**
 * ========================================================================
 * BAKE HOUSE - Google Sheets Sync & Real-time Webhook Script
 * ========================================================================
 * จัดทำเพื่อ: คุณ arpatsara.mah@tsn.thai-tech.ac.th
 * ระบบ: BAKE HOUSE Bakery E-commerce
 * 
 * วิธีการติดตั้งใน Google Sheets:
 * 1. เปิด Google Sheets ขึ้นมา 1 แผ่น (ตั้งชื่อว่า Bake House Database)
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) -> "Apps Script"
 * 3. ลบโค้ดเดิมทั้งหมดออก แล้วนำโค้ดในไฟล์นี้ไปวาง
 * 4. ใส่ SUPABASE_URL และ SUPABASE_ANON_KEY ของคุณด้านล่าง
 * 5. กดปุ่ม "บันทึก" (รูปแผ่นดิสก์)
 * 6. เลือกฟังก์ชัน "setupSheets" แล้วกดปุ่ม "เรียกใช้" (Run) 1 ครั้งเพื่อให้สิทธิ์และสร้างแผ่นงาน
 * 7. (ตัวเลือกเสริมสำหรับ Real-time): กด "การทำให้ใช้งานได้" (Deploy) -> "การทำให้ใช้งานได้ใหม่" (New deployment) 
 *    -> เลือกประเภท "เว็บแอป" (Web app) -> ให้สิทธิ์ทุกคน (Anyone) -> จะได้ Webhook URL นำไปใส่ใน supabase-config.js
 * ========================================================================
 */

// ====================== ตั้งค่าเชื่อมต่อ SUPABASE ======================
const CONFIG = {
  // นำค่ามาจาก Supabase Project Settings -> API
  SUPABASE_URL: "https://rkacacxxbffodnkvhqri.supabase.co", // Project URL ของคุณ
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY", // เปลี่ยนเป็น anon public key ของคุณ
  
  // ชื่อชีตต่างๆ
  SHEET_ORDERS: "📦 คำสั่งซื้อ (Orders)",
  SHEET_PRODUCTS: "🥐 รายการสินค้า (Products)",
  SHEET_CONTACTS: "💬 ติดต่อสอบถาม (Contacts)",
  SHEET_DASHBOARD: "📊 สรุปยอดขาย (Dashboard)"
};


/**
 * สร้างเมนูพิเศษบนแถบเครื่องมือของ Google Sheets อัตโนมัติเมื่อเปิดไฟล์
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🥐 BAKE HOUSE System")
    .addItem("🔄 ดึงข้อมูลคำสั่งซื้อทั้งหมด (Sync Orders)", "syncOrdersFromSupabase")
    .addItem("🥐 ดึงข้อมูลสินค้าทั้งหมด (Sync Products)", "syncProductsFromSupabase")
    .addItem("💬 ดึงข้อความติดต่อทั้งหมด (Sync Contacts)", "syncContactsFromSupabase")
    .addSeparator()
    .addItem("✨ ติดตั้งชีตและสร้างหัวตาราง (Setup Sheets)", "setupSheets")
    .addItem("📊 คำนวณสรุปยอดขาย (Update Dashboard)", "updateDashboard")
    .addSeparator()
    .addItem("⏰ ตั้งเวลาอัปเดตอัตโนมัติ (ทุก 15 นาที)", "scheduleAutoSync")
    .addToUi();
}


/**
 * 1. สร้างชีตและหัวตารางให้พร้อมใช้งานอัตโนมัติ
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // --- 1. ชีตคำสั่งซื้อ ---
  let sheetOrders = ss.getSheetByName(CONFIG.SHEET_ORDERS);
  if (!sheetOrders) {
    sheetOrders = ss.insertSheet(CONFIG.SHEET_ORDERS);
  }
  const orderHeaders = [
    "วัน-เวลาสั่งซื้อ", "รหัสคำสั่งซื้อ", "ชื่อลูกค้า", "เบอร์โทร", "อีเมล", 
    "ที่อยู่จัดส่ง", "จังหวัด", "รหัสไปรษณีย์", "รายการสินค้าที่สั่ง", 
    "ยอดสินค้า (฿)", "ค่าส่ง (฿)", "ส่วนลด (฿)", "ยอดชำระสุทธิ (฿)", 
    "วิธีชำระเงิน", "สถานะชำระเงิน", "สถานะคำสั่งซื้อ", "ลิงก์สลิป/สลิป", "หมายเหตุ"
  ];
  sheetOrders.getRange(1, 1, 1, orderHeaders.length).setValues([orderHeaders]);
  formatHeaderRow(sheetOrders, orderHeaders.length, "#6B4534", "#FFFFFF");
  sheetOrders.setFrozenRows(1);

  // --- 2. ชีตสินค้า ---
  let sheetProducts = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);
  if (!sheetProducts) {
    sheetProducts = ss.insertSheet(CONFIG.SHEET_PRODUCTS);
  }
  const productHeaders = [
    "ID", "ชื่อสินค้า", "หมวดหมู่", "ราคา (฿)", "คะแนนรีวิว", 
    "สินค้าขายดี?", "คงเหลือสต็อก", "เปิดขายอยู่หรือไม่", "ลิงก์รูปภาพ", "รายละเอียดสินค้า"
  ];
  sheetProducts.getRange(1, 1, 1, productHeaders.length).setValues([productHeaders]);
  formatHeaderRow(sheetProducts, productHeaders.length, "#C99458", "#FFFFFF");
  sheetProducts.setFrozenRows(1);

  // --- 3. ชีตติดต่อ ---
  let sheetContacts = ss.getSheetByName(CONFIG.SHEET_CONTACTS);
  if (!sheetContacts) {
    sheetContacts = ss.insertSheet(CONFIG.SHEET_CONTACTS);
  }
  const contactHeaders = ["วัน-เวลา", "ชื่อผู้ส่ง", "อีเมล", "เบอร์โทร", "ข้อความ", "สถานะ"];
  sheetContacts.getRange(1, 1, 1, contactHeaders.length).setValues([contactHeaders]);
  formatHeaderRow(sheetContacts, contactHeaders.length, "#8A7A72", "#FFFFFF");
  sheetContacts.setFrozenRows(1);

  // --- 4. ชีตสรุปยอด Dashboard ---
  let sheetDash = ss.getSheetByName(CONFIG.SHEET_DASHBOARD);
  if (!sheetDash) {
    sheetDash = ss.insertSheet(CONFIG.SHEET_DASHBOARD);
  }
  setupDashboardLayout(sheetDash);

  SpreadSpreadsheetAlert("สร้างชีตและหัวตารางสำหรับ BAKE HOUSE เรียบร้อยแล้ว!");
}


/**
 * 2. ฟังก์ชันดึงคำสั่งซื้อจาก Supabase มาใส่ Google Sheets
 */
function syncOrdersFromSupabase() {
  if (!checkSupabaseConfig()) return;

  const url = `${CONFIG.SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`;
  const options = {
    method: "GET",
    headers: {
      "apikey": CONFIG.SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    if (statusCode !== 200) {
      Logger.log("Error response: " + response.getContentText());
      SpreadSpreadsheetAlert(`เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase (Status: ${statusCode}) โปรดตรวจสอบ URL และ Key`);
      return;
    }

    const orders = JSON.parse(response.getContentText());
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_ORDERS);
    if (!sheet) {
      SpreadSpreadsheetAlert("ไม่พบแผ่นงานคำสั่งซื้อ กรุณากด Setup Sheets ก่อน");
      return;
    }

    // ล้างข้อมูลเดิมตั้งแต่แถวที่ 2
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 18).clearContent();
    }

    if (!orders || orders.length === 0) {
      SpreadSpreadsheetAlert("ยังไม่มีข้อมูลคำสั่งซื้อใน Supabase");
      return;
    }

    const rows = orders.map(order => {
      // จัดรูปแบบรายการสินค้า
      let itemsText = "";
      if (Array.isArray(order.items)) {
        itemsText = order.items.map(it => `${it.name} (x${it.quantity}) - ฿${it.price * it.quantity}`).join("\n");
      } else if (typeof order.items === 'object') {
        itemsText = JSON.stringify(order.items);
      }

      const dateStr = order.created_at ? Utilities.formatDate(new Date(order.created_at), "GMT+7", "yyyy-MM-dd HH:mm:ss") : "";

      return [
        dateStr,
        order.order_number || "",
        order.customer_name || "",
        order.customer_phone || "",
        order.customer_email || "",
        order.customer_address || "",
        order.province || "",
        order.postal_code || "",
        itemsText,
        Number(order.subtotal || 0),
        Number(order.shipping_fee || 0),
        Number(order.discount || 0),
        Number(order.total_amount || 0),
        translatePaymentMethod(order.payment_method),
        translatePaymentStatus(order.payment_status),
        translateOrderStatus(order.order_status),
        order.slip_url || "",
        order.notes || ""
      ];
    });

    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    sheet.autoResizeColumns(1, 18);
    updateDashboard();

    SpreadSpreadsheetAlert(`ดึงข้อมูลคำสั่งซื้อสำเร็จทั้งหมด ${rows.length} รายการ!`);
  } catch (error) {
    Logger.log("Exception: " + error.toString());
    SpreadSpreadsheetAlert("เกิดข้อผิดพลาด: " + error.message);
  }
}


/**
 * 3. ฟังก์ชันดึงสินค้าจาก Supabase มาใส่ Google Sheets
 */
function syncProductsFromSupabase() {
  if (!checkSupabaseConfig()) return;

  const url = `${CONFIG.SUPABASE_URL}/rest/v1/products?select=*&order=id.asc`;
  const options = {
    method: "GET",
    headers: {
      "apikey": CONFIG.SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() !== 200) {
      SpreadSpreadsheetAlert(`ไม่สามารถดึงข้อมูลสินค้าได้: ${response.getContentText()}`);
      return;
    }

    const products = JSON.parse(response.getContentText());
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 10).clearContent();
    }

    const rows = products.map(p => [
      p.id,
      p.name || "",
      p.category || "",
      Number(p.price || 0),
      Number(p.rating || 5),
      p.is_best ? "★ ขายดี" : "-",
      p.stock || 0,
      p.is_active ? "เปิดขาย" : "ปิดชั่วคราว",
      p.image || "",
      p.description || ""
    ]);

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
      sheet.autoResizeColumns(1, 10);
    }

    SpreadSpreadsheetAlert(`ดึงข้อมูลสินค้าสำเร็จ ${rows.length} รายการ!`);
  } catch (error) {
    SpreadSpreadsheetAlert("เกิดข้อผิดพลาด: " + error.message);
  }
}


/**
 * 4. ฟังก์ชันดึงข้อความติดต่อจาก Supabase
 */
function syncContactsFromSupabase() {
  if (!checkSupabaseConfig()) return;

  const url = `${CONFIG.SUPABASE_URL}/rest/v1/contacts?select=*&order=created_at.desc`;
  const options = {
    method: "GET",
    headers: {
      "apikey": CONFIG.SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() !== 200) {
      SpreadSpreadsheetAlert(`ไม่สามารถดึงข้อความติดต่อได้: ${response.getContentText()}`);
      return;
    }

    const contacts = JSON.parse(response.getContentText());
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_CONTACTS);
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 6).clearContent();
    }

    const rows = contacts.map(c => [
      c.created_at ? Utilities.formatDate(new Date(c.created_at), "GMT+7", "yyyy-MM-dd HH:mm:ss") : "",
      c.name || "",
      c.email || "",
      c.phone || "-",
      c.message || "",
      c.status || "unread"
    ]);

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
      sheet.autoResizeColumns(1, 6);
    }

    SpreadSpreadsheetAlert(`ดึงข้อความติดต่อสำเร็จ ${rows.length} รายการ!`);
  } catch (error) {
    SpreadSpreadsheetAlert("เกิดข้อผิดพลาด: " + error.message);
  }
}


/**
 * 5. Webhook: รับข้อมูลออเดอร์ใหม่แบบเรียลไทม์จากหน้าเว็บ (POST endpoint)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "No data received" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_ORDERS);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Sheet not found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    let itemsText = "";
    if (Array.isArray(data.items)) {
      itemsText = data.items.map(it => `${it.name} (x${it.quantity}) - ฿${it.price * it.quantity}`).join("\n");
    } else if (typeof data.items === 'object') {
      itemsText = JSON.stringify(data.items);
    }

    const dateStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");

    const newRow = [
      dateStr,
      data.order_number || "",
      data.customer_name || "",
      data.customer_phone || "",
      data.customer_email || "",
      data.customer_address || "",
      data.province || "",
      data.postal_code || "",
      itemsText,
      Number(data.subtotal || 0),
      Number(data.shipping_fee || 0),
      Number(data.discount || 0),
      Number(data.total_amount || 0),
      translatePaymentMethod(data.payment_method),
      translatePaymentStatus(data.payment_status || "pending"),
      translateOrderStatus(data.order_status || "pending"),
      data.slip_url || "",
      data.notes || ""
    ];

    sheet.appendRow(newRow);
    updateDashboard();

    return ContentService.createTextOutput(JSON.stringify({ status: "success", order_number: data.order_number }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * 6. คำนวณสรุป Dashboard ยอดขายและสถิติ
 */
function updateDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName(CONFIG.SHEET_DASHBOARD);
  const orderSheet = ss.getSheetByName(CONFIG.SHEET_ORDERS);
  if (!dashSheet || !orderSheet) return;

  const lastRow = orderSheet.getLastRow();
  let totalRevenue = 0;
  let totalOrders = 0;
  let pendingOrders = 0;
  let bakingOrders = 0;
  let completedOrders = 0;

  if (lastRow > 1) {
    const data = orderSheet.getRange(2, 1, lastRow - 1, 16).getValues();
    totalOrders = data.length;
    data.forEach(row => {
      const totalAmount = Number(row[12]) || 0;
      const status = String(row[15] || "").toLowerCase();
      totalRevenue += totalAmount;

      if (status.includes("รอ") || status.includes("pending")) pendingOrders++;
      else if (status.includes("อบ") || status.includes("baking")) bakingOrders++;
      else if (status.includes("สำเร็จ") || status.includes("completed")) completedOrders++;
    });
  }

  dashSheet.getRange("B4").setValue(totalOrders);
  dashSheet.getRange("C4").setValue(`฿${totalRevenue.toLocaleString()}`);
  dashSheet.getRange("D4").setValue(pendingOrders);
  dashSheet.getRange("E4").setValue(bakingOrders);
  dashSheet.getRange("F4").setValue(completedOrders);
  dashSheet.getRange("B10").setValue(`อัปเดตล่าสุด: ${Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss")}`);
}


/**
 * 7. ตั้งเวลาให้ทำงานอัตโนมัติทุก 15 นาที
 */
function scheduleAutoSync() {
  // ลบ Trigger เดิมออกก่อน
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === "syncOrdersFromSupabase") {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger("syncOrdersFromSupabase")
    .timeBased()
    .everyMinutes(15)
    .create();

  SpreadSpreadsheetAlert("ตั้งเวลาซิงก์ข้อมูลอัตโนมัติจาก Supabase ทุกๆ 15 นาทีเรียบร้อยแล้ว!");
}


// ====================== Helper Functions ======================

function formatHeaderRow(sheet, numCols, bgColor, fontColor) {
  const range = sheet.getRange(1, 1, 1, numCols);
  range.setBackground(bgColor)
       .setFontColor(fontColor)
       .setFontWeight("bold")
       .setHorizontalAlignment("center")
       .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 35);
}

function setupDashboardLayout(sheet) {
  sheet.clear();
  sheet.setColumnWidth(1, 40);
  sheet.setColumnWidth(2, 180);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 180);
  sheet.setColumnWidth(5, 180);
  sheet.setColumnWidth(6, 180);

  sheet.getRange("B2:F2").merge()
       .setValue("🥐 BAKE HOUSE - แดชบอร์ดสรุปยอดขายและคำสั่งซื้อ")
       .setBackground("#3E2920")
       .setFontColor("#FFFFFF")
       .setFontSize(16)
       .setFontWeight("bold")
       .setHorizontalAlignment("center");
  sheet.setRowHeight(2, 45);

  const cardHeaders = [["จำนวนออเดอร์ทั้งหมด", "ยอดขายรวมสุทธิ", "รอการยืนยัน", "กำลังอบขนม", "จัดส่งสำเร็จ"]];
  sheet.getRange("B3:F3").setValues(cardHeaders)
       .setBackground("#6B4534")
       .setFontColor("#FFFFFF")
       .setFontWeight("bold")
       .setHorizontalAlignment("center");

  sheet.getRange("B4:F4").setValues([[0, "฿0", 0, 0, 0]])
       .setFontSize(18)
       .setFontWeight("bold")
       .setHorizontalAlignment("center")
       .setBackground("#FFF8EE");
  sheet.setRowHeight(4, 50);

  sheet.getRange("B6:F6").merge()
       .setValue("💡 คำแนะนำ: กดเมนู '🥐 BAKE HOUSE System' ด้านบนเพื่อซิงก์ข้อมูลล่าสุด หรือตั้งเวลาอัตโนมัติ")
       .setFontColor("#6B4534")
       .setFontStyle("italic");
}

function translatePaymentMethod(method) {
  if (method === "promptpay") return "พร้อมเพย์ (PromptPay QR)";
  if (method === "transfer") return "โอนเงินผ่านธนาคาร";
  if (method === "cod") return "เก็บเงินปลายทาง (COD)";
  return method || "โอนเงิน";
}

function translatePaymentStatus(status) {
  if (status === "paid") return "ชำระเงินแล้ว ✓";
  if (status === "verified") return "ตรวจสอบแล้ว ✓";
  return "รอตรวจสอบ ⏳";
}

function translateOrderStatus(status) {
  if (status === "confirmed") return "ยืนยันออเดอร์แล้ว";
  if (status === "baking") return "กำลังอบสดใหม่ 🥐";
  if (status === "delivering") return "กำลังจัดส่ง 🛵";
  if (status === "completed") return "จัดส่งสำเร็จ ✓";
  if (status === "cancelled") return "ยกเลิกคำสั่งซื้อ ✗";
  return "รอดำเนินการ ⏳";
}

function checkSupabaseConfig() {
  if (CONFIG.SUPABASE_URL.includes("YOUR-PROJECT-ID") || CONFIG.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY")) {
    SpreadSpreadsheetAlert("⚠️ กรุณาใส่ SUPABASE_URL และ SUPABASE_ANON_KEY ในโค้ด Apps Script ให้ถูกต้องก่อนใช้งาน");
    return false;
  }
  return true;
}

function SpreadSpreadsheetAlert(message) {
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {
    Logger.log(message);
  }
}
