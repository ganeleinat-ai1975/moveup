import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Accessibility, Type, Contrast, Link as LinkIcon, Eye, X, EyeOff } from 'lucide-react';

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, direction } = useLanguage();
  
  const [settings, setSettings] = useState({
    largeText: 0, // 0, 1, 2 (normal, large, extra large)
    highContrast: false,
    highlightLinks: false,
    readableFont: false,
    stopAnimations: false
  });

  useEffect(() => {
    // Apply Large Text
    const html = document.documentElement;
    html.classList.remove('text-large', 'text-xlarge');
    if (settings.largeText === 1) html.classList.add('text-large');
    if (settings.largeText === 2) html.classList.add('text-xlarge');

    // Apply High Contrast
    if (settings.highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }

    // Apply Highlight Links
    if (settings.highlightLinks) {
      html.classList.add('highlight-links');
    } else {
      html.classList.remove('highlight-links');
    }

    // Apply Readable Font
    if (settings.readableFont) {
      html.classList.add('readable-font');
    } else {
      html.classList.remove('readable-font');
    }

    // Apply Stop Animations
    if (settings.stopAnimations) {
      html.classList.add('stop-animations');
    } else {
      html.classList.remove('stop-animations');
    }
  }, [settings]);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const cycleTextSize = () => {
    setSettings(prev => ({ ...prev, largeText: (prev.largeText + 1) % 3 }));
  };

  const resetSettings = () => {
    setSettings({
      largeText: 0,
      highContrast: false,
      highlightLinks: false,
      readableFont: false,
      stopAnimations: false
    });
  };

  const positionClass = direction === 'rtl' ? 'right-0' : 'left-0';
  const translateClass = !isOpen 
    ? (direction === 'rtl' ? 'translate-x-1/2' : '-translate-x-1/2') 
    : 'translate-x-0';
  const buttonRadiusClass = direction === 'rtl' ? 'rounded-l-xl' : 'rounded-r-xl';
  const panelMarginClass = direction === 'rtl' ? 'mr-4 sm:mr-6' : 'ml-4 sm:ml-6';

  return (
    <>
      <style>{`
        html.text-large { font-size: 110% !important; }
        html.text-xlarge { font-size: 120% !important; }
        
        html.high-contrast {
          filter: contrast(1.5) grayscale(1) !important;
        }

        html.highlight-links a {
          text-decoration: underline !important;
          text-decoration-color: #ff0000 !important;
          text-decoration-thickness: 3px !important;
          color: #000000 !important;
        }

        html.readable-font * {
          font-family: Arial, Helvetica, sans-serif !important;
        }

        html.stop-animations * {
          animation: none !important;
          transition: none !important;
        }
      `}</style>
      
      <div className={`fixed bottom-24 ${positionClass} z-[9999] flex flex-col ${direction === 'rtl' ? 'items-end' : 'items-start'} transition-transform duration-300 ${translateClass}`}>
        {isOpen && (
          <div className={`bg-white rounded-2xl shadow-elegant p-4 mb-4 w-64 border border-gray-200 animate-fade-in ${panelMarginClass}`}>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-gray-800">{t('תפריט נגישות', 'Accessibility Menu')}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={cycleTextSize}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${settings.largeText > 0 ? 'bg-[var(--primary-color)] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <Type className="w-5 h-5" />
                <span className="text-sm font-medium">{t('הגדלת טקסט', 'Increase Text')} {settings.largeText > 0 && `(${settings.largeText})`}</span>
              </button>

              <button 
                onClick={() => toggleSetting('highContrast')}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${settings.highContrast ? 'bg-[var(--primary-color)] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <Contrast className="w-5 h-5" />
                <span className="text-sm font-medium">{t('ניגודיות גבוהה', 'High Contrast')}</span>
              </button>

              <button 
                onClick={() => toggleSetting('highlightLinks')}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${settings.highlightLinks ? 'bg-[var(--primary-color)] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <LinkIcon className="w-5 h-5" />
                <span className="text-sm font-medium">{t('הדגשת קישורים', 'Highlight Links')}</span>
              </button>

              <button 
                onClick={() => toggleSetting('readableFont')}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${settings.readableFont ? 'bg-[var(--primary-color)] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">{t('גופן קריא', 'Readable Font')}</span>
              </button>

              <button 
                onClick={() => toggleSetting('stopAnimations')}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${settings.stopAnimations ? 'bg-[var(--primary-color)] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <EyeOff className="w-5 h-5" />
                <span className="text-sm font-medium">{t('עצירת אנימציות', 'Stop Animations')}</span>
              </button>
            </div>
            
            <div className="mt-4 pt-3 border-t">
              <button 
                onClick={resetSettings}
                className="w-full text-center text-sm text-[var(--primary-color)] font-medium hover:underline"
              >
                {t('איפוס הגדרות', 'Reset Settings')}
              </button>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-[var(--primary-color)] text-white w-14 h-14 shadow-lg flex items-center ${direction === 'rtl' ? 'justify-start pl-3' : 'justify-end pr-3'} hover:bg-[var(--secondary-color)] transition-all ${buttonRadiusClass}`}
          aria-label={t('אפשרויות נגישות', 'Accessibility Options')}
          title={t('אפשרויות נגישות', 'Accessibility Options')}
        >
          <Accessibility className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}