import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useSiteSettings } from '../SiteSettingsContext';

export default function StatsSection({ backgroundColor }) {
  const { language } = useLanguage();
  const { siteSettings } = useSiteSettings();

  const statsTitle = language === 'he' ? siteSettings?.stats_section_title_he : siteSettings?.stats_section_title_en;
  const stats = siteSettings?.stats || [];

  if (!stats || stats.length === 0) {
      return null;
  }

  return (
    <section 
      className="py-20"
      style={{ 
        backgroundColor: backgroundColor || siteSettings?.home_stats_section_bg_color || 'var(--primary-color)',
        color: siteSettings?.home_stats_section_text_color || '#ffffff'
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {statsTitle && (
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12"
                style={{ color: 'inherit' }}
            >
                {statsTitle}
            </h2>
        )}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => {
            const value = stat.value?.trim();
            const label = language === 'he' ? stat.label_he?.trim() : stat.label_en?.trim();
            
            if (!value && !label) return null;
            
            return (
              <div key={index} className="text-center">
                {value && (
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {value}
                  </div>
                )}
                {label && (
                  <div 
                    className="text-lg opacity-90"
                  >
                    {label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}