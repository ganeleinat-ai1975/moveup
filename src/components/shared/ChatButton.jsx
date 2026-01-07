import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Wait for alice-and-bot widget to load
    const checkWidget = setInterval(() => {
      if (window.aliceAndBot) {
        clearInterval(checkWidget);
      }
    }, 100);

    return () => clearInterval(checkWidget);
  }, []);

  const toggleChat = () => {
    if (window.aliceAndBot && window.aliceAndBot.toggleChat) {
      window.aliceAndBot.toggleChat();
      setIsOpen(!isOpen);
    }
  };

  return (
    <button
      onClick={toggleChat}
      className="fixed bottom-6 z-50 bg-[#005E6C] text-white px-6 py-3 rounded-full shadow-2xl hover:bg-[#004d59] transition-all duration-300 flex items-center gap-2 font-semibold text-lg hover:scale-105"
      style={{
        [language === 'he' ? 'left' : 'right']: '24px',
        backgroundColor: '#005E6C'
      }}
    >
      <MessageCircle className="w-5 h-5" />
      <span>{language === 'he' ? 'גלי הבוטית' : 'Discover the Bot'}</span>
    </button>
  );
}