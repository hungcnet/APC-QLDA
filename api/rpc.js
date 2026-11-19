// Proxy: trình duyệt -> /api/rpc (Vercel) -> Apps Script Web App (doPost)
// Giấu link /exec khỏi trình duyệt và tránh lỗi CORS.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: { code: 'BAD', message: 'Chỉ nhận POST' } });
  const url = process.env.GAS_URL;
  if (!url) return res.status(500).json({ ok: false, error: { code: 'ERR', message: 'Chưa cấu hình biến môi trường GAS_URL trên Vercel.' } });
  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      redirect: 'follow'
    });
    const text = await r.text();
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(text);
  } catch (e) {
    return res.status(502).json({ ok: false, error: { code: 'NET', message: 'Không gọi được Apps Script: ' + (e && e.message) } });
  }
};
