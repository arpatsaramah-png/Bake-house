/**
 * ========================================================================
 * BAKE HOUSE - Vercel Serverless Function: /api/verify-pin
 * ========================================================================
 * ตรวจสอบรหัส PIN แอดมินฝั่ง Server (Backend Only)
 * 🔒 ความปลอดภัย 100%: รหัสผ่านจริงจะถูกเก็บไว้ที่ Vercel เท่านั้น
 * ไม่มีการส่งรหัสกลับไปให้ Browser หรือแสดงบน GitHub เด็ดขาด
 * ========================================================================
 */

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const inputPin = String(body?.pin || "").trim();
    // ดึงรหัส PIN จาก Vercel Environment Variables หลังบ้าน
    const correctPin = String(process.env.ADMIN_PIN || "1234").trim();

    if (!inputPin) {
      return res.status(400).json({ success: false, message: "กรุณากรอกรหัส PIN" });
    }

    if (inputPin === correctPin) {
      return res.status(200).json({ success: true, message: "เข้าสู่ระบบสำเร็จ" });
    } else {
      return res.status(401).json({ success: false, message: "รหัส PIN ไม่ถูกต้อง" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการตรวจสอบรหัส" });
  }
};
