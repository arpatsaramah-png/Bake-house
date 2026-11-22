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
  accountName: "",
  promptPayNumber: "",
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
        setupAuthListeners();
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

// ====================== AUTHENTICATION (GOOGLE LOGIN) ======================
let currentAuthUser = null;
let authStateListeners = [];

function onAuthUserChange(callback) {
  if (typeof callback === "function") {
    authStateListeners.push(callback);
    if (currentAuthUser !== null) {
      callback(currentAuthUser);
    }
  }
}

function notifyAuthUserChange(user) {
  currentAuthUser = user;
  authStateListeners.forEach(cb => {
    try { cb(user); } catch (e) { console.error("Auth listener error:", e); }
  });
}

function extractUserInfo(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || meta.email || "",
    name: meta.full_name || meta.name || (user.email ? user.email.split("@")[0] : "ผู้ใช้งาน"),
    avatar: meta.avatar_url || meta.picture || ""
  };
}

async function setupAuthListeners() {
  if (!supabaseClient) return;

  try {
    // 1. ตรวจสอบและดึง session ทันที (รวมถึงจาก URL hash/query)
    await checkAndSyncAuthUser();

    // 2. ฟัง event การเปลี่ยนแปลงสถานะ
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Supabase Auth Event:", event, session);
      if (session && session.user) {
        notifyAuthUserChange(extractUserInfo(session.user));
      } else if (event === "SIGNED_OUT") {
        notifyAuthUserChange(null);
      }
    });
  } catch (err) {
    console.warn("Auth listeners setup warning:", err);
  }
}

/**
 * ตรวจจับ Token จาก URL (OAuth Callback) หรือ Local Session แล้วซิงก์สถานะ
 */
async function checkAndSyncAuthUser() {
  if (!supabaseClient) return null;

  try {
    // กรณีที่ 1: มี access_token ใน URL Hash (OAuth Callback จาก Google)
    if (window.location.hash && window.location.hash.includes("access_token=")) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token") || "";

      if (accessToken) {
        console.log("🔑 Detected access_token in URL hash, saving session...");
        const { data, error } = await supabaseClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (!error && data?.session?.user) {
          const user = extractUserInfo(data.session.user);
          notifyAuthUserChange(user);
          // ทำความสะอาด URL hash ให้สวยงาม
          try {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
          } catch (e) {}
          return user;
        }
      }
    }

    // กรณีที่ 2: มี auth code ใน URL Query (PKCE Flow)
    if (window.location.search && window.location.search.includes("code=")) {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        console.log("🔑 Detected auth code in URL query, exchanging session...");
        const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code);
        if (!error && data?.session?.user) {
          const user = extractUserInfo(data.session.user);
          notifyAuthUserChange(user);
          try {
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (e) {}
          return user;
        }
      }
    }

    // กรณีที่ 3: ดึง Session จาก LocalStorage ที่บันทึกไว้
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session && session.user) {
      const user = extractUserInfo(session.user);
      notifyAuthUserChange(user);
      return user;
    }

    // กรณีที่ 4: ตรวจสอบจาก getUser() เป็นตัวสำรอง
    const { data: { user: authUser } } = await supabaseClient.auth.getUser();
    if (authUser) {
      const user = extractUserInfo(authUser);
      notifyAuthUserChange(user);
      return user;
    }
  } catch (err) {
    console.warn("Check auth error:", err);
  }

  notifyAuthUserChange(null);
  return null;
}

/**
 * ตรวจสอบและเริ่มต้นเซสชัน Login
 */
async function initAuthSession() {
  await loadSystemConfig();
  if (supabaseClient) {
    return await checkAndSyncAuthUser();
  }
  return currentAuthUser;
}

/**
 * เข้าสู่ระบบด้วย Google ผ่าน Supabase OAuth
 */
async function signInWithGoogle() {
  await loadSystemConfig();
  if (!supabaseClient) {
    alert("⚠️ ระบบยังไม่ได้เชื่อมต่อ Supabase Database กรุณาตรวจสอบการตั้งค่า");
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
  } catch (err) {
    console.error("Google sign in error:", err);
    alert("⚠️ เข้าสู่ระบบด้วย Google ไม่สำเร็จ: " + (err.message || err) + "\n\n(หากยังไม่ได้เปิดใช้งาน Google Provider ใน Supabase ให้ไปที่ Supabase Dashboard -> Authentication -> Providers -> Google)");
  }
}

/**
 * ออกจากระบบ
 */
async function signOutUser() {
  await loadSystemConfig();
  if (supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.warn("Sign out warning:", e);
    }
  }
  notifyAuthUserChange(null);
}

function getCurrentAuthUser() {
  return currentAuthUser;
}

// ====================== DATABASE HELPER FUNCTIONS ======================

const DEFAULT_BAKERY_PRODUCTS = [
  {
    id: 1,
    name: "Butter Croissant",
    category: "Croissant",
    price: 65,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=85",
    description: "ครัวซองต์เนยสด หอมกรอบนอก นุ่มด้านใน ผลิตด้วยเนยฝรั่งเศสแท้",
    rating: 5,
    best: true,
    stock: 50
  },
  {
    id: 2,
    name: "Milk Bread",
    category: "Bread",
    price: 55,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85",
    description: "ขนมปังนมสด เนื้อนุ่มฟู หอมกลิ่นนมฮอกไกโด",
    rating: 5,
    best: true,
    stock: 40
  },
  {
    id: 3,
    name: "Chocolate Cake",
    category: "Cake",
    price: 350,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=85",
    description: "เค้กช็อกโกแลตเนื้อนุ่ม รสชาติเข้มข้น ดาร์กช็อกโกแลตแท้",
    rating: 5,
    best: true,
    stock: 20
  },
  {
    id: 4,
    name: "Chocolate Cookie",
    category: "Cookie",
    price: 45,
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=85",
    description: "คุกกี้ช็อกโกแลตชิป หอมเนยและช็อกโกแลต กรอบนอกนุ่มใน",
    rating: 5,
    best: true,
    stock: 60
  },
  {
    id: 5,
    name: "Chocolate Croissant",
    category: "Croissant",
    price: 75,
    image: "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=800&q=85",
    description: "ครัวซองต์สอดไส้ช็อกโกแลตเข้มข้น หอมละมุน",
    rating: 5,
    stock: 30
  },
  {
    id: 6,
    name: "Almond Croissant",
    category: "Croissant",
    price: 85,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85",
    description: "ครัวซองต์อัลมอนด์กรอบ หอมมัน โรยอัลมอนด์สไลซ์แน่นๆ",
    rating: 5,
    stock: 35
  },
  {
    id: 7,
    name: "Strawberry Cake",
    category: "Cake",
    price: 380,
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=85",
    description: "เค้กสตรอว์เบอร์รีครีมสด หวานละมุน สตรอว์เบอร์รีสดลูกโต",
    rating: 5,
    stock: 15
  },
  {
    id: 8,
    name: "Vanilla Cake",
    category: "Cake",
    price: 320,
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=85",
    description: "เค้กวานิลลาหอมละมุน กลิ่นมาดากัสการ์วานิลลาแท้",
    rating: 5,
    stock: 20
  },
  {
    id: 9,
    name: "Birthday Cake",
    category: "Cake",
    price: 450,
    image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=800&q=85",
    description: "เค้กวันเกิดดีไซน์สวยสำหรับโอกาสพิเศษ",
    rating: 5,
    stock: 10
  },
  {
    id: 10,
    name: "Butter Cookie",
    category: "Cookie",
    price: 40,
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=85",
    description: "คุกกี้เนยสด หอมกรอบ ละลายในปาก",
    rating: 5,
    stock: 50
  },
  {
    id: 11,
    name: "Matcha Cookie",
    category: "Cookie",
    price: 50,
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=85",
    description: "คุกกี้ชาเขียวมัทฉะอุจิแท้ หอมกลิ่นชาเขียวเข้มข้น",
    rating: 5,
    stock: 45
  },
  {
    id: 12,
    name: "Brownie",
    category: "Bakery",
    price: 55,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?auto=format&fit=crop&w=800&q=85",
    description: "บราวนี่ช็อกโกแลตฟัดจ์ เนื้อหนึบเข้มข้น ดาร์กช็อก 70%",
    rating: 5,
    stock: 40
  },
  {
    id: 13,
    name: "Muffin",
    category: "Bakery",
    price: 45,
    image: "https://images.unsplash.com/photo-1558304970-abd589baebe5?auto=format&fit=crop&w=800&q=85",
    description: "มัฟฟินบลูเบอร์รีเนื้อนุ่ม หอมอบใหม่จากเตา",
    rating: 5,
    stock: 30
  },
  {
    id: 14,
    name: "Danish",
    category: "Bakery",
    price: 65,
    image: "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=800&q=85",
    description: "เดนิชเพสตรี้ผลไม้ แป้งกรอบนอกนุ่มใน คัสตาร์ดหอมหวาน",
    rating: 5,
    stock: 25
  },
  {
    id: 15,
    name: "Macaron",
    category: "Bakery",
    price: 60,
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=85",
    description: "มาการองฝรั่งเศสหลากหลายรสชาติ สีสันสวยงาม ไส้แน่น",
    rating: 5,
    stock: 60
  },
  {
    id: 16,
    name: "Chocolate Bread",
    category: "Bread",
    price: 60,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85",
    description: "ขนมปังช็อกโกแลตนุ่มหนึบ สอดไส้ลาวาเข้มข้น",
    rating: 5,
    stock: 30
  },
  {
    id: 17,
    name: "Cream Bread",
    category: "Bread",
    price: 60,
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=85",
    description: "ขนมปังไส้ครีมคัสตาร์ด เนื้อนุ่ม ไส้ครีมหอมละมุน",
    rating: 5,
    stock: 35
  }
];

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
  return DEFAULT_BAKERY_PRODUCTS;
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
