import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const conv = await base44.agents.createConversation({
            agent_name: "gali",
            metadata: { name: "Test Stream" }
        });
        
        await base44.agents.addMessage(conv, { role: "user", content: "היי" });

        return new Promise((resolve) => {
            let unsub;
            const timeout = setTimeout(() => {
                if (unsub) unsub();
                resolve(Response.json({ error: "Timeout waiting for agent" }));
            }, 10000);

            unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
                const msgs = data.messages || [];
                const lastMsg = msgs[msgs.length - 1];
                if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content.length > 5) {
                    clearTimeout(timeout);
                    unsub();
                    resolve(Response.json({ success: true, msgs }));
                }
            });
        });
    } catch (error) {
        return Response.json({ error: String(error) }, { status: 500 });
    }
});