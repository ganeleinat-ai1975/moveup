import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    console.log("sendToSupabase invoked");
    
    // חובה: אתחול Base44 client
    const base44 = createClientFromRequest(req);

    // קבלת payload כפי שנשלח מ-base44.functions.invoke
    const {
      first_name,
      last_name,
      email,
      phone,
      organization,
      message
    } = base44.payload;

    const name = `${first_name} ${last_name}`.trim();

    const SUPABASE_API_KEY = Deno.env.get("SUPABASE_API_KEY");
    if (!SUPABASE_API_KEY) {
      return Response.json(
        { error: "SUPABASE_API_KEY not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://pokolplkzkzbihruraxck.supabase.co/rest/v1/contacts",
      {
        method: "POST",
        headers: {
          "apikey": SUPABASE_API_KEY,
          "Authorization": `Bearer ${SUPABASE_API_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          name,
          first_name,
          last_name,
          email,
          phone,
          organization,
          message
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: "Supabase insert failed", details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    return Response.json({ success: true, data });

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});