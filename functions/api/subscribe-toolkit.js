export async function onRequestPost(context) {
  const { request, env } = context;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { email, name, tier } = payload;

  if (!email || !name) {
    return new Response('Missing fields', { status: 400 });
  }

  const BREVO_API_KEY = env.BREVO_API_KEY;
  const BREVO_LIST_ID = 11; // ← Toolkit Leads list (not Scorecard list 3)

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        email,
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
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const err = await response.json();
    console.error('Brevo error:', err);
    return new Response(JSON.stringify({ success: false }), { status: 500 });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
