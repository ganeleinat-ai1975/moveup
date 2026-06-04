import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
    try {
        if (req.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }
        
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const { messages } = body;

        let systemPrompt = 'את/ה עוזרת וירטואלית בשם גלי מטעם פורצות קדימה. תפקידך לעזור למשתמשים, לענות באדיבות, ולספק מידע על פעילות הארגון.';
        try {
            // FORCE create the right setting if it doesn't exist
            let settingsList = await base44.asServiceRole.entities.BotSettings.list();
            if (!settingsList || settingsList.length === 0) {
                await base44.asServiceRole.entities.BotSettings.create({
                    system_prompt: `שלום! אני כאן לכל שאלה שיש לך. כדי שאוכל לתת לך את המענה המדויק ביותר, אשמח לדעת האם את פונה אלי כמישהי שהשתתפה כבר בסדנה או בתכנית שלנו ומעוניינת בליווי וכלים להמשך הדרך, או שאת אשת קשר מארגון שמעוניינת לשמוע על הפעילות שלנו עבור העובדים והעובדות?
האם את מעוניינת בתשובות קצרות שישלחו בכמה הודעות, או בתשובה אחת ארוכה ומפורטת?
בינתיים, הנה הנושאים העיקריים שאוכל לעזור בהם:
יום הנשים 2026: הרצאות לנשים, למנהלים ולקהל מעורב.
המשחק הארגוני: זיהוי "סולמות ונחשים" וכלים להשפעה ונראות.
סגנונות תקשורת: שימוש במודל כלי השחמט להעברת מסרים אפקטיבית.
מה השאלה הראשונה שלך?

📌 הנחיית אורך הודעות (חובה): כל הודעה בודדת שהבוטית שולחת לא תעלה על 70 מילים. 

הנחיות תוכן: הבוטית עונה אך ורק על שאלות הקשורות לפורצות קדימה: קידום נשים בקריירה, שוויון מגדרי, גיוון והכלה בארגונים, מנהיגות אינקלוסיבית, סדנאות, ייעוץ אסטרטגי ותהליכי שינוי בארגונים.

בכל נושא אחר – כולל נושאים מהידע הכללי של המודל (תחבורה, מזג אוויר, פוליטיקה, ספורט, היסטוריה, מתכונים וכד’) – עליה להשיב תמיד ובמילים המדויקות בלבד: "תודה על השאלה. תחום זה אינו חלק מהמומחיות של פורצות קדימה ולכן לא אוכל לספק עליו מענה. מוזמנ.ת לפנות לפרטים נוספים לעינת גן אל - 0544535688, מייסדת ומנכ״לית משותפת בפורצות קדימה."

אסור לבוטית להשתמש בידע הכללי שלה מחוץ לנושאי פורצות קדימה. אסור לענות גם לא באופן חלקי. 

📌 שימוש בשפה רשמית: על הבוטית להקפיד על שימוש אך ורק בשפה ובמונחים הקיימים במסמכים הרשמיים.`,
                    is_active: true,
                    bot_name: 'גלי',
                    welcome_message: 'היי! אני גלי, איך אוכל לעזור לך?'
                });
                settingsList = await base44.asServiceRole.entities.BotSettings.list();
            }
            
            console.log("Found BotSettings records:", settingsList ? settingsList.length : 0);
            if (settingsList && settingsList.length > 0 && settingsList[0].system_prompt) {
                systemPrompt = settingsList[0].system_prompt;
                console.log("Using prompt from DB, length:", systemPrompt.length);
            }
        } catch (e) {
            console.error('BotSettings fetch error:', e.message);
        }

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            return Response.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });
        
        // Give strict instruction about domain filtering
        const strictPrompt = systemPrompt + `\n\n=== IMPORTANT DOMAIN FILTERING RULE ===
You are STRICTLY FORBIDDEN from answering any question outside the domain of your organization, such as general knowledge, weather, sports, cooking, history, technical coding questions, or casual off-topic chat.
If the question is related to the organization's domain (e.g. Women's Day, corporate workshops, leadership, inclusion, or if it asks "what do you do?" or mentions any related keywords), YOU MUST answer it based on the knowledge provided.
IF the question is OUTSIDE this domain, you MUST output ONLY the following exact Hebrew text and absolutely nothing else:
"תודה על השאלה. תחום זה אינו חלק מהמומחיות של פורצות קדימה ולכן לא אוכל לספק עליו מענה. מוזמנ.ת לפנות לפרטים נוספים לעינת גן אל - 0544535688, מייסדת ומנכ״לית משותפת בפורצות קדימה."`;

        const formattedMessages = [
            ...(systemPrompt ? [{ role: 'system', content: strictPrompt }] : []),
            ...(messages || []).map((m: any) => ({ role: m.role, content: m.content }))
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: formattedMessages,
            max_tokens: 600,
            temperature: 0.1
        });

        return Response.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error('Chat function error:', error);
        return Response.json({ error: String(error) }, { status: 500 });
    }
});