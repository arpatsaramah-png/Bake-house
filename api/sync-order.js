/**
 * ========================================================================
 * BAKE HOUSE - Vercel Serverless Function: /api/sync-order
 * ========================================================================
 * ส่งข้อมูลออเดอร์ใหม่เข้า Google Sheets Web App ทันทีแบบ Real-time
 * รันบน Node.js Backend: ไม่มีปัญหาติด CORS และตาม Redirect 302 ให้อัตโนมัติ
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
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(200).json({ status: "skipped", message: "No GOOGLE_SHEET_WEBHOOK_URL configured" });
  }

  try {
    let orderData = req.body;
    if (typeof orderData === "string") {
      try {
        orderData = JSON.parse(orderData);
      } catch (e) {
        orderData = {};
      }
    }

    // ยิงตรงเข้า Google Apps Script Web App
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    const responseText = await response.text();
    return res.status(200).json({ status: "success", googleResponse: responseText });
  } catch (err) {
    console.error("Error forwarding to Google Sheet:", err);
    return res.status(500).json({ status: "error", message: err.toString() });
  }
};
