const webpush = require('web-push');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { subscription, delay = 10 } = req.body || {};
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ ok: false, error: 'No subscription in request body' });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,        // must be mailto:you@example.com or an https:// URL
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  // wait so you have time to close the app
  await new Promise(r => setTimeout(r, Math.min(Number(delay), 20) * 1000));

  try {
    const r = await webpush.sendNotification(
      subscription,
      JSON.stringify({ title: 'Push test', body: 'Delivered at ' + new Date().toISOString() }),
      { TTL: 60, urgency: 'high' }
    );
    res.json({ ok: true, status: r.statusCode });
  } catch (e) {
    res.status(500).json({ ok: false, status: e.statusCode, body: e.body });
  }
};
