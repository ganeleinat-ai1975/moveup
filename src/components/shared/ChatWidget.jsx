import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [initError, setInitError] = useState(false);
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

  const isInitRef = useRef(false);

  const initConv = async () => {
    if (isInitRef.current) return;
    isInitRef.current = true;
    try {
      setInitError(false);
      const savedConvId = localStorage.getItem('gali_convId');
      
      if (savedConvId) {
        const loadRes = await base44.functions.invoke("guestChat", { action: "load", convId: savedConvId });
        if (loadRes.data?.success) {
          setConversation({ id: savedConvId });
          setMessages([{ role: 'assistant', content: WELCOME_MSG }, ...loadRes.data.messages]);
          isInitRef.current = false;
          return;
        }
      }

      const res = await base44.functions.invoke("guestChat", { action: "create" });
      if (res.data?.success) {
        localStorage.setItem('gali_convId', res.data.convId);
        setConversation({ id: res.data.convId });
        setMessages([{ role: 'assistant', content: WELCOME_MSG }]);
      } else {
        throw new Error(res.data?.error || "Unknown error creating chat");
      }
    } catch (err) {
      console.error("Failed to create conversation", err);
      setInitError(err?.message || String(err));
    } finally {
      isInitRef.current = false;
    }
  };

  useEffect(() => {
    if (isOpen && !conversation && !initError) {
      initConv();
    }
  }, [isOpen, conversation, initError]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (settings && !settings.is_active) return null;

  const handleSend = async () => {
    if (!input.trim() || !conversation) return;
    
    const userMsg = input.trim();
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const res = await base44.functions.invoke("guestChat", {
        action: "message",
        convId: conversation.id,
        message: userMsg
      });
      
      if (res.data?.success && res.data.messages) {
        setMessages([{ role: 'assistant', content: WELCOME_MSG }, ...res.data.messages]);
      } else {
        console.error("Error from proxy:", res.data?.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]" dir="rtl">
      {isOpen ? (
        <div className={`bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-200 transition-all duration-300 ${isExpanded ? 'w-[calc(100vw-3rem)] md:w-[450px] h-[calc(100vh-3rem)] md:h-[650px]' : 'w-[300px] h-[450px]'}`}>
          <div className="bg-[#005e6c] text-white p-4 flex justify-between items-center shrink-0">
            <div className="font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {settings?.bot_name || 'גלי - פורצות קדימה'}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsExpanded(!isExpanded)} className="text-white hover:text-gray-200 transition-colors" title={isExpanded ? "הקטן" : "הגדל"}>
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 transition-colors" title="סגור">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 relative">
            {!conversation && !initError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#005e6c]" />
              </div>
            )}
            {initError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 p-4 text-center">
                <div className="text-red-500 mb-2">אירעה שגיאה בחיבור לצ'אט</div>
                <div className="text-xs text-gray-500 mb-4 max-w-full overflow-hidden break-words">{typeof initError === 'string' ? initError : ''}</div>
                <button 
                  onClick={initConv}
                  className="bg-[#005e6c] text-white px-4 py-2 rounded-full text-sm hover:bg-[#004b56] transition-colors"
                >
                  נסו שוב
                </button>
              </div>
            )}
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
              disabled={!conversation || initError}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#005e6c] bg-gray-50 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!conversation || initError || loading || !input.trim()}
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