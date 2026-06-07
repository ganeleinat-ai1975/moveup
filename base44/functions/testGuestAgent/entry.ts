import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // Do NOT use asServiceRole
        const conv = await base44.agents.createConversation({
            agent_name: "gali",
            metadata: { name: "Guest Test" }
        });
        
        await base44.agents.addMessage(conv, { role: "user", content: "היי" });

        return Response.json({ success: true, convId: conv.id });
    } catch (error) {
        return Response.json({ error: String(error) }, { status: 500 });
    }
});