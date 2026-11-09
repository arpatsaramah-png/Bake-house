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

  return res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    promptPayNumber: process.env.PROMPTPAY_NUMBER || "0821753706",
    bankName: process.env.BANK_NAME || "ธนาคารกสิกรไทย (KBANK)",
    bankAccount: process.env.BANK_ACCOUNT || "",
    accountName: process.env.ACCOUNT_NAME || "นางสาวอาภัสรา มหันตรัตน์",
    googleSheetWebhookUrl: process.env.GOOGLE_SHEET_WEBHOOK_URL || ""
  });
};
