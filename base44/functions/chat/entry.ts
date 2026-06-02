import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
    try {
        if (req.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }
        
        const base44 = createClientFromRequest(req);
        const { messages, sessionId } = await req.json();

        // Get bot settings (using service role to allow public users to read it if RLS blocks, though it's public anyway)
        const settingsList = await base44.asServiceRole.entities.BotSettings.list();
        const settings = settingsList[0] || {
            system_prompt: 'את/ה עוזרת וירטואלית.',
            is_active: true,
            bot_name: 'גלי'
        };

        if (!settings.is_active) {
            return Response.json({ reply: 'הצ\'אט לא פעיל כרגע.' });
        }

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            return Response.json({ error: 'OPENAI_API_KEY is not set in environment variables' }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });
        
        const formattedMessages = [
            { role: 'system', content: settings.system_prompt },
            ...(messages || []).map(m => ({ role: m.role, content: m.content }))
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: formattedMessages
        });

        return Response.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error('Chat error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});