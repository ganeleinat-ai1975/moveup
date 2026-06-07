import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const conv = await base44.agents.createConversation({
            agent_name: "gali",
            metadata: { name: "Test Conv" }
        });
        
        await base44.agents.addMessage(conv, { role: "user", content: "היי" });

        // wait 5 seconds
        await new Promise(r => setTimeout(r, 5000));

        const updatedConv = await base44.agents.getConversation(conv.id);

        return Response.json({ success: true, messages: updatedConv.messages });
    } catch (error) {
        return Response.json({ error: String(error) }, { status: 500 });
    }
});