import OpenAI from 'npm:openai';

const SYSTEM_PROMPT = `את בוטית של פורצות קדימה (MoveUp). ענה רק על נושאים של פורצות קדימה: קידום נשים בקריירה, שוויון מגדרי, גיוון והכלה, מנהיגות אינקלוסיבית, סדנאות, ייעוץ אסטרטגי. לנושאים אחרים ענה: "תודה על השאלה. תחום זה אינו חלק מהמומחיות של פורצות קדימה ולכן לא אוכל לספק עליו מענה. מוזמנ.ת לפנות לפרטים נוספים לעינת גן אל - 0544535688, מייסדת ומנכ״לית משותפת בפורצות קדימה." בכל תשובה עד 70 מילים. כלול קישור רלוונטי. אתר: https://www.moveup.today`;

Deno.serve(async (req) => {
    if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
    try {
        const { messages } = await req.json();
        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) return Response.json({ error: 'No API key' }, { status: 500 });
        const openai = new OpenAI({ apiKey });
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...(messages || [])],
            max_tokens: 300
        });
        return Response.json({ reply: response.choices[0].message.content });
    } catch (error) {
        return Response.json({ error: String(error) }, { status: 500 });
    }
});