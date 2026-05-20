exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { email, name, tier } = payload;

  if (!email || !name) {
    return { statusCode: 400, body: 'Missing fields' };
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = 11; // ← Toolkit Leads list

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          FIRSTNAME: name,
          TOOLKIT_TIER: tier || '',
          LEAD_SOURCE: 'TOOLKIT_WAITLIST'
        },
        listIds: [BREVO_LIST_ID],
        updateEnabled: true
      })
    });

    if (response.status === 201 || response.status === 204) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    const err = await response.json();
    console.error('Brevo error:', err);
    return { statusCode: 500, body: JSON.stringify({ success: false }) };

  } catch (error) {
    console.error('Function error:', error);
    return { statusCode: 500, body: JSON.stringify({ success: false }) };
  }
};
