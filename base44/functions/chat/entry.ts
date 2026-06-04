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

        // Fetch bot settings
        let systemPrompt = '';
        try {
            const settingsList = await base44.entities.BotSettings.list();
            if (settingsList && settingsList.length > 0) {
                systemPrompt = settingsList[0].system_prompt || '';
            }
        } catch (e) {
            console.error('BotSettings fetch error:', e.message);
        }

        const apiKey = Deno.env.get('OPENAI_API_KEY');
        if (!apiKey) {
            return Response.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });
        
        const formattedMessages = [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...(messages || []).map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }))
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: formattedMessages,
            max_tokens: 300
        });

        return Response.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error('Chat function error:', error);
        return Response.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }
});
