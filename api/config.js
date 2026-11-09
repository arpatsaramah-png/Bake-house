/**
 * ========================================================================
 * BAKE HOUSE - Vercel Serverless Function: /api/config
 * ========================================================================
 * ดึงค่า Configuration จาก Vercel Environment Variables
 * เพื่อความปลอดภัยสูงสุด: โค้ดบน GitHub จะไม่มี API Key หรือรหัสลับหลุดออกไป
 * ========================================================================
 */

module.exports = (req, res) => {
  // ตั้งค่า CORS และ Header
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Content-Type", "application/json");

  // อ่านค่าจาก Vercel Cloud Environment Variables
  return res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    adminPin: process.env.ADMIN_PIN || "1234",
    promptPayNumber: process.env.PROMPTPAY_NUMBER || "0812345678",
    bankName: process.env.BANK_NAME || "ธนาคารกสิกรไทย (KBANK)",
    bankAccount: process.env.BANK_ACCOUNT || "123-4-56789-0",
    accountName: process.env.ACCOUNT_NAME || "BAKE HOUSE (arpatsara.mah)",
    googleSheetWebhookUrl: process.env.GOOGLE_SHEET_WEBHOOK_URL || ""
  });
};
