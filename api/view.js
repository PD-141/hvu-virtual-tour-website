const { json, method, readAnalytics, writeAnalytics } = require('./_lib/common');
module.exports = async (req, res) => {
  if (!method(req, res, 'POST')) return;
  const floor = Number(req.body && req.body.floor), image = Number(req.body && req.body.image);
  if (!Number.isInteger(floor) || floor < 1 || floor > 100 || !Number.isInteger(image) || image < 1 || image > 1000) return json(res, 400, { error: 'bad_request' });
  try {
    const data = await readAnalytics();
    const day = new Date().toISOString().slice(0, 10);
    const key = `Tầng ${floor} · Ảnh ${image}`;
    data.total = (data.total || 0) + 1;
    data.byImage = data.byImage || {}; data.daily = data.daily || {};
    data.byImage[key] = (data.byImage[key] || 0) + 1;
    data.daily[day] = (data.daily[day] || 0) + 1;
    await writeAnalytics(data);
    return json(res, 200, { ok: true });
  } catch (e) { return json(res, 503, { error: 'analytics_storage_unavailable' }); }
};
