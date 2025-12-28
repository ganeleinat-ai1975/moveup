import React from 'react';
import { useLanguage } from '../LanguageContext';

export default function MediaGallery({ media, className = "", mediaPosition = "center center", mobileAsImage = false }) {
  const { language } = useLanguage();
  
  if (!media || media.length === 0) return null;

  const sortedMedia = media.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  return (
    <div className={`grid gap-4 mt-6 ${className}`}>
      {sortedMedia.map((item, index) => (
        <div key={index} className="relative overflow-hidden rounded-lg shadow-elegant">
          {item.type === 'image' ? (
            <img
              src={item.file_url}
              alt={language === 'he' ? (item.alt_he || '') : (item.alt_en || '')}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              style={{ objectPosition: mediaPosition }}
              loading="lazy"
            />
          ) : (
            <div className="relative">
              {/* Check if we should show as image on mobile and if it's mobile */}
              {mobileAsImage && item.poster_url ? (
                <>
                  {/* Mobile version - show poster image */}
                  <div className="block md:hidden">
                    <img
                      src={item.poster_url}
                      alt={language === 'he' ? (item.alt_he || 'Video poster') : (item.alt_en || 'Video poster')}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: mediaPosition }}
                      loading="lazy"
                    />
                  </div>
                  {/* Desktop version - show video */}
                  <div className="hidden md:block">
                    <video
                      src={item.file_url}
                      className="w-full h-full object-contain"
                      style={{ objectPosition: mediaPosition }}
                      autoPlay
                      loop
                      muted
                      playsInline
                      webkitPlaysinline="true"
                      preload="metadata"
                    />
                  </div>
                </>
              ) : (
                /* Show video for all cases where mobileAsImage is false or no poster */
                <video
                  src={item.file_url}
                  className="w-full h-full object-contain"
                  style={{ objectPosition: mediaPosition }}
                  autoPlay
                  loop
                  muted
                  playsInline
                  webkit-playsinline="true"
                  preload="metadata"
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}