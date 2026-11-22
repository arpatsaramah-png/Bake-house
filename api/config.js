/**
 * ========================================================================
 * BAKE HOUSE - Vercel Serverless Function: /api/config
 * ========================================================================
 * ส่งเฉพาะค่า Config สาธารณะสำหรับหน้าร้านเท่านั้น
 * ========================================================================
 */

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Content-Type", "application/json");

  // ค้นหา Supabase Anon / Publishable Key จากตัวแปรแวดล้อมที่เป็นไปได้ทั้งหมด
  const candidateKeys = [
    process.env.SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
    process.env.SUPABASE_KEY,
    process.env.SUPABASE_PUBLISHABLE_KEY
  ];

  let resolvedAnonKey = "";
  for (const k of candidateKeys) {
    if (k && k !== "SUPABASE_ANON_KEY" && k !== "YOUR_SUPABASE_ANON_KEY" && k.trim().length > 10) {
      resolvedAnonKey = k.trim();
      break;
    }
  }

  // หากไม่มีตัวอื่นที่ถูกต้อง ให้ใช้ค่า default เดิม
  if (!resolvedAnonKey && process.env.SUPABASE_ANON_KEY) {
    resolvedAnonKey = process.env.SUPABASE_ANON_KEY;
  }

  return res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    supabaseAnonKey: resolvedAnonKey,
    promptPayNumber: process.env.PROMPTPAY_NUMBER || "",
    bankName: process.env.BANK_NAME || "ธนาคารกสิกรไทย (KBANK)",
    bankAccount: process.env.BANK_ACCOUNT || "",
    accountName: process.env.ACCOUNT_NAME || "",
    googleSheetWebhookUrl: process.env.GOOGLE_SHEET_WEBHOOK_URL || ""
  });
};
