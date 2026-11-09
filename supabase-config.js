/**
 * ========================================================================
 * BAKE HOUSE - Supabase & System Configuration Loader
 * ========================================================================
 * สถาปัตยกรรมความปลอดภัยระดับสูง (Option A):
 * - ไม่มีการฝัง API Key หรือ URL ตรงๆ ในไฟล์นี้
 * - ระบบจะดึงค่าอัตโนมัติจาก Vercel Environment Variables ผ่าน /api/config
 * - ทำให้ Push ขึ้น GitHub ได้ปลอดภัย 100% และย้ายไปเขียนคอมเครื่องไหนก็ทำงานต่อได้ทันที
 * ========================================================================
 */

let BAKE_HOUSE_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  bankName: "ธนาคารกสิกรไทย (KBANK)",
  bankAccount: "",
  accountName: "นางสาวอาภัสรา มหันตรัตน์",
  promptPayNumber: "0821753706",
  googleSheetWebhookUrl: ""
};

let supabaseClient = null;
let configPromise = null;

/**
 * โหลดค่า Configuration จาก Vercel Serverless Function (/api/config)
 */
async function loadSystemConfig() {
  if (configPromise) return configPromise;

  configPromise = (async () => {
    try {
      // 1. ดึงค่าจาก Vercel Environment Variables
      const res = await fetch("/api/config");
      if (res.ok) {
        const cloudConfig = await res.json();
        BAKE_HOUSE_CONFIG = { ...BAKE_HOUSE_CONFIG, ...cloudConfig };
      }
    } catch (e) {
      console.log("ℹ️ Running in offline or local mode without /api endpoint");
    }

    // 2. ถ้ามีการบันทึกค่าไว้ใน LocalStorage สำหรับทดสอบบนเครื่อง ให้ดึงมาใช้ร่วมด้วย
    try {
      const localCustom = localStorage.getItem("bake_house_local_config");
      if (localCustom) {
        BAKE_HOUSE_CONFIG = { ...BAKE_HOUSE_CONFIG, ...JSON.parse(localCustom) };
      }
    } catch (err) {}

    // 3. เริ่มต้น Supabase Client เมื่อได้รับ URL และ Key
    if (typeof supabase !== "undefined" && isSupabaseConfigured()) {
      try {
        supabaseClient = supabase.createClient(
          BAKE_HOUSE_CONFIG.supabaseUrl,
          BAKE_HOUSE_CONFIG.supabaseAnonKey
        );
        console.log("🟢 BAKE HOUSE: Connected to Supabase via Vercel Cloud Config!");
      } catch (err) {
        console.error("🔴 Failed to initialize Supabase client:", err);
      }
    } else {
      console.log("🟡 BAKE HOUSE: Running with fallback data (configure Vercel Environment Variables)");
    }

    return BAKE_HOUSE_CONFIG;
  })();

  return configPromise;
}

// โหลดทันทีในเบื้องหลัง
loadSystemConfig();

// ตรวจสอบว่าได้ตั้งค่า Supabase หรือยัง
function isSupabaseConfigured() {
  return BAKE_HOUSE_CONFIG.supabaseUrl &&
         !BAKE_HOUSE_CONFIG.supabaseUrl.includes("YOUR-PROJECT-ID") &&
         BAKE_HOUSE_CONFIG.supabaseAnonKey &&
         !BAKE_HOUSE_CONFIG.supabaseAnonKey.includes("YOUR_SUPABASE_ANON");
}

// ====================== DATABASE HELPER FUNCTIONS ======================

/**
 * 1. ดึงรายการสินค้าทั้งหมดจาก Supabase
 */
async function getDbProducts() {
  await loadSystemConfig();

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
  return null;
}

/**
 * 2. บันทึกคำสั่งซื้อใหม่ลง Supabase & ซิงก์ Google Sheets
 */
async function saveDbOrder(orderData) {
  await loadSystemConfig();
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

  // ซิงก์ไปยัง Google Sheet ทันทีแบบ Real-time
  syncToGoogleSheet(orderData);

  return savedOrder || orderData;
}

/**
 * 3. ค้นหาสถานะคำสั่งซื้อด้วย รหัสคำสั่งซื้อ หรือ เบอร์โทรศัพท์
 */
async function trackDbOrder(query) {
  await loadSystemConfig();
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  if (supabaseClient) {
    try {
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
  await loadSystemConfig();

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
  await loadSystemConfig();

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
  await loadSystemConfig();

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
 * 7. ส่งข้อมูลไปยัง Google Sheets Webhook แบบ Real-time
 */
async function syncToGoogleSheet(orderData) {
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

  // 1. ส่งผ่าน Vercel Serverless Function (/api/sync-order) ให้หลังบ้านยิงเข้า Google Sheet ทันที
  try {
    fetch("/api/sync-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(res => res.json()).then(res => {
      console.log("⚡ Real-time order pushed via /api/sync-order:", res);
    }).catch(err => {
      console.warn("Serverless sync-order warning:", err);
    });
  } catch (err) {}

  // 2. ถ้ามี webhook url ที่หน้าบ้านด้วย ให้ยิงสำรองแบบ text/plain (เลี่ยง CORS)
  if (BAKE_HOUSE_CONFIG && BAKE_HOUSE_CONFIG.googleSheetWebhookUrl) {
    try {
      fetch(BAKE_HOUSE_CONFIG.googleSheetWebhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      });
      console.log("📤 Direct order pushed to Google Sheet Webhook");
    } catch (e) {
      console.warn("Direct Google Sheet sync failed:", e);
    }
  }
}
