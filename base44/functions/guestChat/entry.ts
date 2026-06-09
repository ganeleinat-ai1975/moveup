import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });
        }

        const base44 = createClientFromRequest(req);
        const { action, convId, message } = await req.json();

        if (action === 'load') {
            try {
                const conv = await base44.asServiceRole.agents.getConversation(convId);
                return Response.json({ success: true, messages: conv.messages || [] });
            } catch (e) {
                return Response.json({ success: false, error: e.message });
            }
        }

        if (action === 'create') {
            const conv = await base44.asServiceRole.agents.createConversation({
                agent_name: "gali",
                metadata: { name: "Guest User" }
            });
            return Response.json({ success: true, convId: conv.id });
        } 
        
        if (action === 'message') {
            let conv = await base44.asServiceRole.agents.getConversation(convId);
            await base44.asServiceRole.agents.addMessage(conv, {
                role: "user",
                content: message
            });

            // Poll until assistant replies and the message stops growing
            let lastContent = null;
            let stableCount = 0;
            let finalMessages = [];

            for (let i = 0; i < 20; i++) {
                await new Promise(r => setTimeout(r, 1000));
                conv = await base44.asServiceRole.agents.getConversation(convId);
                finalMessages = conv.messages || [];
                const lastMsg = finalMessages[finalMessages.length - 1];

                if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content) {
                    if (lastContent === lastMsg.content) {
                        stableCount++;
                        if (stableCount >= 2) {
                            // Stable for 2 seconds, assume done
                            break;
                        }
                    } else {
                        lastContent = lastMsg.content;
                        stableCount = 0;
                    }
                }
            }

            return Response.json({ success: true, messages: finalMessages });
        }

        return Response.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        return Response.json({ error: error.message || String(error) }, { status: 500 });
    }
});