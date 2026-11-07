# 🥐 BAKE HOUSE — Freshly Baked, Made with Love

> เว็บไซต์ร้านเบเกอรี่ออนไลน์ระบบเต็มรูปแบบ (E-Commerce Web Application) พร้อมเชื่อมต่อฐานข้อมูล **Supabase**, ซิงก์แสดงผลผ่าน **Google Sheets**, ใช้งานระบบควบคุมเวอร์ชันผ่าน **GitHub** และเตรียมพร้อมสำหรับการเผยแพร่สู่ **Vercel**

---

## 📋 ข้อมูลระบบและบัญชีผู้พัฒนา
- **ผู้รับผิดชอบงาน:** `arpatsara.mah@tsn.thai-tech.ac.th`
- **GitHub Repository:** [https://github.com/arpatsaramah-png/Bake-house](https://github.com/arpatsaramah-png/Bake-house)
- **แพลตฟอร์มฐานข้อมูล:** Supabase PostgreSQL Database
- **แพลตฟอร์มโฮสติ้ง:** Vercel Hosting
- **ระบบสเปรดชีตแสดงผล:** Google Sheets (ผ่าน Google Apps Script)

---

## 🌟 ฟังก์ชันหลักของระบบ (Features)

### 🛒 หน้าร้าน (Customer Storefront - `index.html`)
1. **แคตตาล็อกเบเกอรี่สดใหม่:** จัดหมวดหมู่สินค้าชัดเจน (ขนมปัง Bread, ครัวซองต์ Croissant, เค้ก Cake, คุกกี้ Cookie, เบเกอรี่ Bakery)
2. **ระบบค้นหาและกรองสินค้า:** ค้นหาตามชื่อ รายละเอียดสินค้า หรือหมวดหมู่ได้แบบเรียลไทม์
3. **ตะกร้าสินค้า (Smart Shopping Cart):** ปรับจำนวนสินค้า คำนวณยอดรวม ยอดค่าจัดส่ง และระบบโค้ดคูปองส่วนลด (`WELCOME10`, `BAKE20`, `DISCOUNT50`)
4. **ระบบสั่งซื้อและชำระเงินจริง (Checkout System):**
   - กรอกชื่อ เบอร์โทร อีเมล ที่อยู่จัดส่ง และหมายเหตุ
   - ชำระเงินผ่าน **PromptPay QR Code** อัตโนมัติคำนวณตามยอดสั่งซื้อจริง
   - ชำระเงินผ่านการโอนบัญชีธนาคาร พร้อมปุ่มคัดลอกเลขบัญชี
   - ชำระเงินปลายทาง (Cash on Delivery)
   - ระบบอัปโหลดและพรีวิวสลิปโอนเงิน (Payment Slip Upload)
5. **ระบบติดตามสถานะคำสั่งซื้อ (Live Order Tracking):**
   - ค้นหาด้วย **รหัสคำสั่งซื้อ (เช่น BH261108-xxxx)** หรือ **เบอร์โทรศัพท์**
   - แสดงความคืบหน้าแบบ Timeline สวยงาม 5 ขั้นตอน:
     `ได้รับคำสั่งซื้อแล้ว` ➔ `ยืนยันออเดอร์` ➔ `กำลังอบสดใหม่ 🥐` ➔ `กำลังจัดส่ง 🛵` ➔ `จัดส่งสำเร็จ ✓`
6. **แบบฟอร์มติดต่อร้าน:** ส่งคำถาม ข้อความ หรือสั่งทำพิเศษ บันทึกตรงเข้าสู่ฐานข้อมูล

---

### ⚙️ ระบบจัดการหลังบ้าน (Admin Dashboard - `admin.html`)
1. **ระบบความปลอดภัยรหัส PIN:** ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต (รหัส PIN เริ่มต้น: `1234` ปรับแก้ได้ใน `supabase-config.js`)
2. **แดชบอร์ดสรุปยอดขาย (KPI Metrics):**
   - จำนวนออเดอร์ทั้งหมด
   - ยอดขายรวมสุทธิ (฿)
   - จำนวนออเดอร์ที่รอดำเนินการ / กำลังอบขนม / จัดส่งสำเร็จ
3. **จัดการออเดอร์ลูกค้าแบบเรียลไทม์:**
   - เปลี่ยนสถานะออเดอร์จาก Dropdown ได้ทันที (ข้อมูลจะอัปเดตตรงไปยัง Supabase)
   - ตรวจสอบสลิปโอนเงินของลูกค้าผ่านหน้าต่างป๊อปอัป
   - กรองดูออเดอร์ตามสถานะ
4. **ส่งออกข้อมูล (Export to CSV):** ดาวน์โหลดข้อมูลคำสั่งซื้อทั้งหมดเป็นไฟล์ `.csv` ด้วยคลิกเดียว

---

## 🗂 โครงสร้างไฟล์ในโปรเจกต์ (Project Structure)

```
Bake house/
├── index.html                           # หน้าร้านหลัก BAKE HOUSE
├── style.css                            # ไฟล์ CSS ตกแต่งเว็บไซต์ (ธีมเบเกอรี่)
├── script.js                            # ตรรกะการทำงานหน้าร้าน ตะกร้าสินค้า และสั่งซื้อ
├── admin.html                           # ระบบจัดการหลังบ้านสำหรับเจ้าของร้าน
├── supabase-config.js                   # ไฟล์ตั้งค่าเชื่อมต่อ Supabase & Google Sheets
├── supabase_setup.sql                   # สคริปต์ SQL สร้าง Table, RLS และข้อมูลเริ่มต้น
├── GoogleAppsScript_Supabase_Sync.js    # สคริปต์เชื่อมต่อ Google Sheets & Webhook
├── vercel.json                          # ไฟล์คอนฟิกสำหรับการ Deploy บน Vercel
├── package.json                         # ข้อมูลแพ็กเกจโปรเจกต์
├── .gitignore                           # รายการไฟล์ที่ไม่ต้องนำขึ้น Git
└── README.md                            # เอกสารแนะนำและคู่มือการใช้งาน
```

---

## 🚀 คู่มือการติดตั้งและใช้งานทีละขั้นตอน (Step-by-Step Guide)

### ขั้นตอนที่ 1: ติดตั้งฐานข้อมูล Supabase
1. เข้าไปที่ [https://supabase.com](https://supabase.com) แล้วลงชื่อเข้าใช้งานด้วยอีเมล `arpatsara.mah@tsn.thai-tech.ac.th`
2. กดปุ่ม **"New Project"** ตั้งชื่อโปรเจกต์ เช่น `bake-house` และตั้งรหัสผ่านฐานข้อมูล
3. เมื่อระบบสร้างฐานข้อมูลเสร็จ ไปที่เมนูด้านซ้ายเลือก **"SQL Editor"**
4. กด **"New Query"** แล้วเปิดไฟล์ [supabase_setup.sql](supabase_setup.sql) ในโปรเจกต์ คัดลอกโค้ดทั้งหมดไปวาง แล้วกดปุ่ม **"Run"**
5. ระบบจะสร้างตาราง `products`, `orders`, `contacts`, `coupons` พร้อมเติมข้อมูลเบเกอรี่ 17 เมนูเริ่มต้นและตั้งค่านโยบายความปลอดภัย (RLS) ให้เรียบร้อย
6. ไปที่เมนู **"Project Settings" (รูปฟันเฟือง)** ➔ **"API"**
   - คัดลอก **Project URL** (เช่น `https://xyz.supabase.co`)
   - คัดลอก **Project API Keys** ตัวที่เป็น `anon` `public`
7. นำค่าทั้ง 2 มาวางลงในไฟล์ [supabase-config.js](supabase-config.js):
   ```javascript
   const BAKE_HOUSE_CONFIG = {
     supabaseUrl: "https://xyz.supabase.co",      // ใส่ Project URL ของคุณ
     supabaseAnonKey: "eyJhbGciOi...",           // ใส่ anon public key ของคุณ
     adminPin: "1234",
     promptPayNumber: "0812345678",             // เบอร์พร้อมเพย์ของร้าน
     ...
   };
   ```

---

### ขั้นตอนที่ 2: เชื่อมต่อ Google Sheets สำหรับแสดงและซิงก์ข้อมูล
1. เปิด [Google Sheets](https://sheets.new) สร้างสเปรดชีตใหม่ (ตั้งชื่อว่า `Bake House Database`)
2. ไปที่เมนู **"ส่วนขยาย" (Extensions)** ➔ **"Apps Script"**
3. ลบโค้ดเดิมออกทั้งหมด แล้วเปิดไฟล์ [GoogleAppsScript_Supabase_Sync.js](GoogleAppsScript_Supabase_Sync.js) คัดลอกโค้ดทั้งหมดมาวาง
4. แก้ไขค่าตัวแปรด้านบนสุด:
   ```javascript
   const CONFIG = {
     SUPABASE_URL: "https://xyz.supabase.co", // ใส่ Project URL เดียวกัน
     SUPABASE_ANON_KEY: "eyJhbGciOi...",      // ใส่ anon public key เดียวกัน
     ...
   };
   ```
5. กดปุ่ม **"บันทึก" (Save)**
6. ตรงช่องเลือกฟังก์ชันด้านบน เลือกฟังก์ชัน `setupSheets` แล้วกดปุ่ม **"เรียกใช้" (Run)** 1 ครั้ง (กดยอมรับสิทธิ์การเข้าถึง) ชีตจะสร้างแท็บคำสั่งซื้อ, สินค้า, ติดต่อ และแดชบอร์ดสรุปยอดขายให้อัตโนมัติ
7. บนหน้า Google Sheets จะมีเมนูใหม่ชื่อ **"🥐 BAKE HOUSE System"** เพิ่มขึ้นมา สามารถกดดึงข้อมูลหรือตั้งเวลาอัปเดตอัตโนมัติทุก 15 นาทีได้ทันที!
8. *(ตัวเลือกเสริมสำหรับ Real-time Sync)*: ในหน้า Apps Script กด **"การทำให้ใช้งานได้" (Deploy)** ➔ **"การทำให้ใช้งานได้ใหม่" (New deployment)** ➔ เลือก **"เว็บแอป" (Web app)** ➔ ตรง "ผู้ที่มีสิทธิ์เข้าถึง" เลือก **"ทุกคน" (Anyone)** ➔ คัดลอก Webhook URL นำมาวางใน `googleSheetWebhookUrl` ในไฟล์ `supabase-config.js` ข้อมูลออเดอร์ใหม่จะวิ่งเข้าชีตทันทีที่สั่งซื้อ!

---

### ขั้นตอนที่ 3: เผยแพร่เว็บไซต์ขึ้น Vercel (Deploy to Vercel)
1. เข้าไปที่ [https://vercel.com](https://vercel.com)
2. กด **"Add New..."** ➔ **"Project"**
3. เลือก Import จาก GitHub Repository: `arpatsaramah-png/Bake-house`
4. ส่วน **Framework Preset** ให้เลือกเป็น `Other`
5. กดปุ่ม **"Deploy"**
6. ภายใน 30 วินาที เว็บไซต์จะออนไลน์พร้อมโดเมน HTTPS ทันที เช่น `https://bake-house-xxxx.vercel.app`

---

## 🏷 โค้ดส่วนลดโปรโมชั่น (Promotion Coupons)
ลูกค้าสามารถนำไปกรอกในช่อง "โค้ดส่วนลด" ในตะกร้าสินค้า:
- `WELCOME10`: ลดทันที 10% เมื่อสั่งซื้อ
- `BAKE20`: ลดทันที 20% เมื่อสั่งซื้อครบ ฿300 ขึ้นไป
- `DISCOUNT50`: ลดทันที ฿50 เมื่อสั่งซื้อครบ ฿250 ขึ้นไป

---

## 📞 ข้อมูลติดต่อร้าน
- **ร้านเบเกอรี่:** BAKE HOUSE
- **ที่อยู่:** อำเภอลำลูกกา จังหวัดปทุมธานี
- **อีเมล:** `arpatsara.mah@tsn.thai-tech.ac.th`
- **เวลาทำการ:** เปิดบริการทุกวัน 08:00 - 19:00 น.
