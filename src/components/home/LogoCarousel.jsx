import React, { useState } from 'react';
import { useSiteSettings } from '@/components/SiteSettingsContext';
import { useLanguage } from '@/components/LanguageContext';
import { Play, Pause } from 'lucide-react';

export default function LogoCarousel() {
  const { siteSettings } = useSiteSettings();
  const { language } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);

  const logos = siteSettings?.media_logo_carousel_logos || [];
  const title = language === 'he'
    ? siteSettings?.logo_carousel_title_he
    : siteSettings?.logo_carousel_title_en;
  const bgColor = siteSettings?.logo_carousel_bg_color || '#ffffff';
  const controlsEnabled = siteSettings?.logo_carousel_controls_enabled;

  if (!logos || logos.length === 0) return null;

  return (
    <section 
      className="py-8 md:py-12 overflow-hidden relative"
      style={{ backgroundColor: bgColor }}
    >
      <style>{`
        /* --- Desktop Animations --- */
        @keyframes scroll-desktop-left {
          from { transform: translateX(0%); }
          to { transform: translateX(-50%); }
        }
        @keyframes scroll-desktop-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0%); }
        }
        .desktop-track {
          display: flex;
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          will-change: transform;
        }
        .desktop-track-left {
          animation: scroll-desktop-left 80s linear infinite;
        }
        .desktop-track-right {
          animation: scroll-desktop-right 80s linear infinite;
        }

        /* --- Mobile Animations --- */
        @media (max-width: 768px) {
          .mobile-track {
            animation: scroll-desktop-left 40s linear infinite; /* Reusing the same keyframe */
            will-change: transform;
          }
        }

        /* --- Reduced Motion --- */
        @media (prefers-reduced-motion: reduce) {
          .desktop-track, .mobile-track {
            animation: none !important;
          }
        }
      `}</style>
      
      {title?.trim() && (
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-color)]">
            {title}
          </h2>
        </div>
      )}

      <div className="relative">
        {controlsEnabled && (
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm"
            title={isPaused ? (language === 'he' ? 'המשך' : 'Resume') : (language === 'he' ? 'עצור' : 'Pause')}
          >
            {isPaused ? <Play className="w-5 h-5 text-gray-700" /> : <Pause className="w-5 h-5 text-gray-700" />}
          </button>
        )}

        {/* --- Desktop View (2 rows) - NEW STABLE LOGIC --- */}
        <div className="hidden md:block">
          {[0, 1].map((rowIndex) => {
            const midPoint = Math.ceil(logos.length / 2);
            const rowLogos = rowIndex === 0 ? logos.slice(0, midPoint) : logos.slice(midPoint);
            if (rowLogos.length === 0) return null;

            return (
              <div key={rowIndex} className="h-20 mb-4 overflow-hidden relative">
                <div
                  className={`desktop-track ${rowIndex === 0 ? 'desktop-track-left' : 'desktop-track-right'}`}
                  style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                >
                  {/* Render logos twice for seamless loop */}
                  {[...rowLogos, ...rowLogos].map((logo, i) => (
                    <div key={`d-${rowIndex}-${i}`} className="flex-shrink-0 w-40 mx-4 flex items-center justify-center transition-all">
                      <img src={logo.file_url} alt={language === 'he' ? logo.alt_he : logo.alt_en} className="max-w-full max-h-full object-contain" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- Mobile View (3 rows) - The stable solution */}
        <div className="block md:hidden">
          {[0, 1, 2].map((rowIndex) => {
            const chunkSize = Math.ceil(logos.length / 3);
            const rowLogos = logos.slice(rowIndex * chunkSize, (rowIndex + 1) * chunkSize);
            if (rowLogos.length === 0) return null;

            return (
              <div key={rowIndex} className="h-16 mb-2 overflow-hidden relative">
                <div 
                  className="absolute top-0 left-0 h-full flex mobile-track"
                  style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                >
                  {/* Render logos twice for seamless loop */}
                  {[...rowLogos, ...rowLogos].map((logo, i) => (
                    <div key={`m-${rowIndex}-${i}`} className="flex-shrink-0 w-32 mx-3 flex items-center justify-center">
                      <img src={logo.file_url} alt={language === 'he' ? logo.alt_he : logo.alt_en} className="max-w-full max-h-full object-contain" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-current to-transparent opacity-20 pointer-events-none" style={{ color: bgColor }}></div>
        <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-current to-transparent opacity-20 pointer-events-none" style={{ color: bgColor }}></div>
      </div>
    </section>
  );
}