/**
 * ========================================================================
 * BAKE HOUSE - Supabase & System Configuration
 * ========================================================================
 * สำหรับคุณ: arpatsara.mah@tsn.thai-tech.ac.th
 * 
 * นำข้อมูลจาก Supabase Dashboard (https://supabase.com):
 * เมนู Project Settings -> API มาใส่ในนี้:
 * 1. Project URL -> supabaseUrl
 * 2. Project API Keys (anon public) -> supabaseAnonKey
 * ========================================================================
 */

const BAKE_HOUSE_CONFIG = {
  // 1. นำมาจาก Supabase Dashboard -> Project Settings -> API
  supabaseUrl: "https://YOUR-PROJECT-ID.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_PUBLIC_KEY",

  // 2. ข้อมูลการชำระเงินของร้าน (ใช้แสดงในหน้าสั่งซื้อ / QR Code)
  bankName: "ธนาคารกสิกรไทย (KBANK)",
  bankAccount: "123-4-56789-0",
  accountName: "BAKE HOUSE (arpatsara.mah)",
  promptPayNumber: "0812345678", // เบอร์หรือเลขบัตรประชาชนพร้อมเพย์

  // 3. รหัสผ่านเข้าหลังบ้าน Admin Dashboard (admin.html)
  adminPin: "1234",

  // 4. (ตัวเลือกเสริม) Webhook URL ของ Google Sheets Apps Script
  // หากติดตั้ง Web App ใน Google Sheets แล้ว นำ URL มาวางตรงนี้ ข้อมูลจะวิ่งเข้า Sheet ทันที!
  googleSheetWebhookUrl: ""
};

// ตรวจสอบว่าได้กรอกค่า Supabase หรือยัง
function isSupabaseConfigured() {
  return BAKE_HOUSE_CONFIG.supabaseUrl &&
         !BAKE_HOUSE_CONFIG.supabaseUrl.includes("YOUR-PROJECT-ID") &&
         BAKE_HOUSE_CONFIG.supabaseAnonKey &&
         !BAKE_HOUSE_CONFIG.supabaseAnonKey.includes("YOUR_SUPABASE_ANON");
}

// สร้าง Supabase Client
let supabaseClient = null;
if (typeof supabase !== "undefined" && isSupabaseConfigured()) {
  try {
    supabaseClient = supabase.createClient(
      BAKE_HOUSE_CONFIG.supabaseUrl,
      BAKE_HOUSE_CONFIG.supabaseAnonKey
    );
    console.log("🟢 BAKE HOUSE: Connected to Supabase successfully!");
  } catch (err) {
    console.error("🔴 Failed to initialize Supabase client:", err);
  }
} else {
  console.log("🟡 BAKE HOUSE: Running in local fallback mode (configure Supabase in supabase-config.js)");
}

// ====================== DATABASE HELPER FUNCTIONS ======================

/**
 * 1. ดึงรายการสินค้าทั้งหมดจาก Supabase
 */
async function getDbProducts() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(item => ({
          ...item,
          best: Boolean(item.is_best)
        }));
      }
    } catch (e) {
      console.warn("⚠️ Cannot fetch from Supabase, falling back to local products:", e.message);
    }
  }
  // Fallback คืนค่าข้อมูลเริ่มต้นใน JS
  return null;
}

/**
 * 2. บันทึกคำสั่งซื้อใหม่ลง Supabase & ซิงก์ Google Sheets
 */
async function saveDbOrder(orderData) {
  let savedOrder = null;

  if (supabaseClient) {
    try {
      const payload = {
        order_number: orderData.orderNumber,
        customer_name: orderData.name,
        customer_phone: orderData.phone,
        customer_email: orderData.email || "",
        customer_address: orderData.address,
        province: orderData.province || "",
        postal_code: orderData.postalCode || "",
        items: orderData.items,
        subtotal: orderData.subtotal,
        shipping_fee: orderData.shippingFee,
        discount: orderData.discount || 0,
        total_amount: orderData.totalAmount,
        payment_method: orderData.paymentMethod,
        payment_status: orderData.paymentStatus || "pending",
        order_status: orderData.orderStatus || "pending",
        slip_url: orderData.slipUrl || "",
        notes: orderData.notes || ""
      };

      const { data, error } = await supabaseClient
        .from("orders")
        .insert([payload])
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
      } else {
        savedOrder = data && data[0] ? data[0] : payload;
        console.log("✅ Order saved to Supabase:", savedOrder);
      }
    } catch (err) {
      console.error("Error inserting order to Supabase:", err);
    }
  }

  // เก็บไว้ใน LocalStorage เป็นสำรองเสมอ
  try {
    const existingOrders = JSON.parse(localStorage.getItem("bake_house_orders") || "[]");
    existingOrders.unshift({
      ...orderData,
      created_at: new Date().toISOString()
    });
    localStorage.setItem("bake_house_orders", JSON.stringify(existingOrders));
  } catch (e) {
    console.error("Failed to save order to localStorage:", e);
  }

  // ซิงก์ไปยัง Google Sheet ทันที (หากตั้งค่า Webhook ไว้)
  if (BAKE_HOUSE_CONFIG.googleSheetWebhookUrl) {
    syncToGoogleSheet(orderData);
  }

  return savedOrder || orderData;
}

/**
 * 3. ค้นหาสถานะคำสั่งซื้อด้วย รหัสคำสั่งซื้อ หรือ เบอร์โทรศัพท์
 */
async function trackDbOrder(query) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  if (supabaseClient) {
    try {
      // ค้นหาทั้งจาก order_number หรือ customer_phone
      const { data, error } = await supabaseClient
        .from("orders")
        .select("*")
        .or(`order_number.ilike.%${cleanQuery}%,customer_phone.ilike.%${cleanQuery}%`)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn("Track order error:", e);
    }
  }

  // Fallback: ค้นหาจาก LocalStorage
  const localOrders = JSON.parse(localStorage.getItem("bake_house_orders") || "[]");
  return localOrders.filter(o => 
    (o.orderNumber && o.orderNumber.toLowerCase().includes(cleanQuery.toLowerCase())) ||
    (o.phone && o.phone.includes(cleanQuery))
  );
}

/**
 * 4. บันทึกข้อความติดต่อลง Supabase
 */
async function saveDbContact(contactData) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("contacts")
        .insert([{
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone || "",
          message: contactData.message,
          status: "unread"
        }]);

      if (error) console.error("Contact error:", error);
      else return true;
    } catch (e) {
      console.error("Save contact exception:", e);
    }
  }

  // LocalStorage Fallback
  const contacts = JSON.parse(localStorage.getItem("bake_house_contacts") || "[]");
  contacts.unshift({ ...contactData, created_at: new Date().toISOString() });
  localStorage.setItem("bake_house_contacts", JSON.stringify(contacts));
  return true;
}

/**
 * 5. ดึงออเดอร์ทั้งหมดสำหรับแอดมิน (admin.html)
 */
async function getAdminOrders() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) return data;
    } catch (e) {
      console.warn("Get admin orders error:", e);
    }
  }
  return JSON.parse(localStorage.getItem("bake_house_orders") || "[]");
}

/**
 * 6. อัปเดตสถานะออเดอร์ (แอดมิน)
 */
async function updateDbOrderStatus(orderId, newStatus) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("orders")
        .update({ order_status: newStatus })
        .eq("id", orderId);

      if (!error) return true;
    } catch (e) {
      console.error("Update status error:", e);
    }
  }

  // LocalStorage Fallback
  const localOrders = JSON.parse(localStorage.getItem("bake_house_orders") || "[]");
  const target = localOrders.find(o => o.id === orderId || o.orderNumber === orderId);
  if (target) {
    target.order_status = newStatus;
    localStorage.setItem("bake_house_orders", JSON.stringify(localOrders));
    return true;
  }
  return false;
}

/**
 * 7. ส่งข้อมูลไปยัง Google Sheets Webhook
 */
async function syncToGoogleSheet(orderData) {
  if (!BAKE_HOUSE_CONFIG.googleSheetWebhookUrl) return;

  try {
    await fetch(BAKE_HOUSE_CONFIG.googleSheetWebhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_number: orderData.orderNumber,
        customer_name: orderData.name,
        customer_phone: orderData.phone,
        customer_email: orderData.email || "",
        customer_address: orderData.address,
        province: orderData.province || "",
        postal_code: orderData.postalCode || "",
        items: orderData.items,
        subtotal: orderData.subtotal,
        shipping_fee: orderData.shippingFee,
        discount: orderData.discount || 0,
        total_amount: orderData.totalAmount,
        payment_method: orderData.paymentMethod,
        payment_status: orderData.paymentStatus || "pending",
        order_status: orderData.orderStatus || "pending",
        slip_url: orderData.slipUrl || "",
        notes: orderData.notes || ""
      })
    });
    console.log("📤 Order data pushed to Google Sheet Webhook");
  } catch (e) {
    console.warn("Google Sheet sync failed:", e);
  }
}
