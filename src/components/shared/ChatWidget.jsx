import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const list = await base44.entities.BotSettings.filter({ is_active: true });
        if (list.length > 0) {
          setSettings(list[0]);
          if (list[0].welcome_message) {
            setMessages([{ role: 'assistant', content: list[0].welcome_message }]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch bot settings', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (settings && !settings.is_active) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg];
      const res = await base44.functions.invoke('chat', { messages: history, sessionId: 'client-session' });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'אופס, משהו השתבש (אולי חסר מפתח API). נסה שוב מאוחר יותר.' }]);
    } finally {
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
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-[#005e6c] text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
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