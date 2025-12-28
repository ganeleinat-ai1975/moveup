Deno.serve(async (req) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      organization,
      message
    } = await req.json();

    const name = `${first_name} ${last_name}`;

    const SUPABASE_API_KEY = Deno.env.get("SUPABASE_API_KEY");

    if (!SUPABASE_API_KEY) {
      return Response.json({ error: 'SUPABASE_API_KEY not configured' }, { status: 500 });
    }

    const response = await fetch("https://pokolplkzkzbihruraxck.supabase.co/rest/v1/contacts", {
      method: "POST",
      headers: {
        "apikey": SUPABASE_API_KEY,
        "Authorization": `Bearer ${SUPABASE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        first_name,
        last_name,
        phone,
        organization,
        message
      })
    });

    const data = await response.json();
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});