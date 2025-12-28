import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../LanguageContext';
import { useSiteSettings } from '../SiteSettingsContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function TopCTABanner() {
  const { language, direction } = useLanguage();
  const { siteSettings } = useSiteSettings();

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;
  
  const title = language === 'he' 
    ? siteSettings?.top_cta_title_he?.trim() 
    : siteSettings?.top_cta_title_en?.trim();
    
  const subtitle = language === 'he' 
    ? siteSettings?.top_cta_subtitle_he?.trim() 
    : siteSettings?.top_cta_subtitle_en?.trim();
    
  const buttonText = language === 'he' 
    ? siteSettings?.top_cta_button_he?.trim() 
    : siteSettings?.top_cta_button_en?.trim();

  if (!title && !subtitle && !buttonText) {
    return null;
  }

  const bgColor = siteSettings?.top_cta_bg_color || 'var(--primary-color)';

  return (
    <section 
      className="text-white py-8 md:py-12"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-lg md:text-xl mb-6 opacity-90 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {buttonText && (
          <Link
            to={createPageUrl('Contact')}
            className="inline-flex items-center gap-2 bg-white text-[var(--primary-color)] px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 smooth-transition shadow-elegant hover-lift"
          >
            {buttonText}
            <ArrowIcon className="w-5 h-5" />
          </Link>
        )}
      </div>
    </section>
  );
}