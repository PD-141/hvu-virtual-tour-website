const { json, method, verifyToken, readAnalytics } = require('../_lib/common');
module.exports = async (req, res) => {
  if (!method(req, res, 'GET')) return;
  if (!verifyToken(req)) return json(res, 401, { error: 'unauthorized' });
  try {
    const data = await readAnalytics();
    const labels = Object.keys(data.daily || {}).sort().slice(-14);
    return json(res, 200, { total: data.total || 0, labels, values: labels.map(x => data.daily[x] || 0), byImage: data.byImage || {} });
  } catch { return json(res, 503, { error: 'analytics_storage_unavailable' }); }
};
