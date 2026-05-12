exports.handler = async function (event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { email, name, gap } = payload;

  if (!email || !name) {
    return { statusCode: 400, body: 'Missing fields' };
  }

  // API key lives ONLY here — pulled from Netlify environment variable
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = 3;

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
          SCORECARD_GAP: gap || ''
        },
        listIds: [BREVO_LIST_ID],
        updateEnabled: true
      })
    });

    // 201 = created, 204 = already exists & updated — both are success
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
