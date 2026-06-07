import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [conversation, setConversation] = useState(null);
  const messagesEndRef = useRef(null);

  const WELCOME_MSG = "שלום! אני כאן לכל שאלה שיש לך. כדי שאוכל לתת לך את המענה המדויק ביותר, אשמח לדעת האם את פונה אלי כמישהי שהשתתפה כבר בסדנה או בתכנית שלנו ומעוניינת בליווי וכלים להמשך הדרך, או שאת אשת קשר מארגון שמעוניינת לשמוע על הפעילות שלנו עבור העובדים והעובדות?";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const list = await base44.entities.BotSettings.filter({ is_active: true });
        if (list.length > 0) {
          setSettings(list[0]);
        }
      } catch (err) {
        console.error('Failed to fetch bot settings', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (isOpen && !conversation) {
      const initConv = async () => {
        try {
          const conv = await base44.agents.createConversation({
            agent_name: "gali",
            metadata: { name: "Web Chat" }
          });
          setConversation(conv);
          setMessages([{ role: 'assistant', content: WELCOME_MSG }]);
        } catch (err) {
          console.error("Failed to create conversation", err);
        }
      };
      initConv();
    }
  }, [isOpen, conversation]);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      if (data.messages) {
        setMessages([{ role: 'assistant', content: WELCOME_MSG }, ...data.messages]);
        
        const lastMsg = data.messages[data.messages.length - 1];
        if (lastMsg && lastMsg.role === 'user') {
          setLoading(true);
        } else if (lastMsg && lastMsg.role === 'assistant') {
          // If the assistant is reasoning or preparing the message, content might be empty
          if (!lastMsg.content) {
            setLoading(true);
          } else {
            setLoading(false);
          }
        }
      }
    });
    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (settings && !settings.is_active) return null;

  const handleSend = async () => {
    if (!input.trim() || !conversation) return;
    
    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMsg
      });
      
      // Fallback: clear loading state if no response after 20 seconds
      setTimeout(() => {
        setLoading(prev => prev ? false : prev);
      }, 20000);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]" dir="rtl">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-xl w-[300px] overflow-hidden flex flex-col border border-gray-200 h-[450px]">
          <div className="bg-[#005e6c] text-white p-4 flex justify-between items-center">
            <div className="font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {settings?.bot_name || 'גלי - פורצות קדימה'}
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => {
              if (msg.role === 'assistant' && !msg.content) return null;
              return (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-[#005e6c] text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}`}>
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline font-semibold" />,
                        p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0 leading-relaxed" />,
                        ul: ({ node, ...props }) => <ul {...props} className="list-disc mr-4 mb-2" />,
                        li: ({ node, ...props }) => <li {...props} className="mb-1" />
                      }}
                    >
                      {msg.content || ''}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            )})}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-500 p-3 rounded-2xl rounded-bl-none max-w-[85%] shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="כתבו הודעה..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#005e6c] bg-gray-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-[#005e6c] text-white p-2 rounded-full hover:bg-[#004b56] transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5 rtl:-scale-x-100 p-0.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#005e6c] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-[#004b56] transition-transform hover:scale-105"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}
    </div>
  );
}