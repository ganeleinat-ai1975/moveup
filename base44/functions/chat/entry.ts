import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
    try {
        if (req.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }
        
        const base44 = createClientFromRequest(req);
        const { messages, sessionId } = await req.json();

        const settingsList = await base44.asServiceRole.entities.BotSettings.filter({ is_active: true });
        
        if (!settingsList || settingsList.length === 0) {
            return Response.json({ error: 'No active BotSettings found' }, { status: 404 });
        }
        
        const settings = settingsList[0];

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