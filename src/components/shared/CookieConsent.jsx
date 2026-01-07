import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const { t, direction } = useLanguage();

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie_consent_accepted');
      if (consent !== 'true') {
        // Use a small delay to prevent layout shifts on load and let the main content render first
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('cookie_consent_accepted', 'true');
      setShowBanner(false);
    } catch (error) {
      console.error("Could not write to localStorage:", error);
      // Still hide the banner for this session if localStorage is blocked
      setShowBanner(false);
    }
  };

  if (!showBanner) {
    return null;
  }

  // Move to the opposite side to avoid collision with the chat widget
  const positionClass = direction === 'rtl' ? 'left-4 sm:left-6' : 'right-4 sm:right-6';

  return (
    <div
      className={`fixed bottom-4 ${positionClass} max-w-sm w-[calc(100%-2rem)] sm:w-auto bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-elegant z-[1000] animate-fade-in`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Cookie className="w-8 h-8 text-[var(--primary-color)] mt-1" />
        </div>
        <div>
          <p className="text-sm text-[var(--text-color)] leading-relaxed mb-4">
            {t(
              'אנחנו משתמשות בקבצי קוקיז, כדי לשפר את חוויית הגלישה באתר. לחיצה על אישור הינה הסכמה לכך.',
              'We use cookies to enhance your browsing experience. By clicking "Accept", you consent to our use of cookies.'
            )}
          </p>
          <Button
            onClick={handleAccept}
            className="w-full sm:w-auto bg-[var(--primary-color)] text-white hover:bg-[var(--secondary-color)]"
            size="sm"
          >
            {t('אישור', 'Accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}