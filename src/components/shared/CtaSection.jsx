
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../LanguageContext';
import { useSiteSettings } from '../SiteSettingsContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function CtaSection() {
  const { language, direction } = useLanguage();
  const { siteSettings } = useSiteSettings();

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;
  
  const title = language === 'he' 
    ? siteSettings?.cta_section_title_he?.trim() 
    : siteSettings?.cta_section_title_en?.trim();
    
  const subtitle = language === 'he' 
    ? siteSettings?.cta_section_subtitle_he
    : siteSettings?.cta_section_subtitle_en;
    
  const buttonText = language === 'he' 
    ? siteSettings?.cta_section_button_he?.trim() 
    : siteSettings?.cta_section_button_en?.trim();

  if (!title && !subtitle?.trim() && !buttonText) {
    return null;
  }

  return (
    <section className="py-20 bg-[var(--primary-color)] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {title}
          </h2>
        )}
        {subtitle && (
          <div 
            className="text-xl mb-8 opacity-90"
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />
        )}
        {buttonText && (
          <Link
            to={createPageUrl('Contact')}
            className="bg-white text-[var(--primary-color)] px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 smooth-transition shadow-elegant hover-lift inline-flex items-center gap-2"
          >
            {buttonText}
            <ArrowIcon className="w-5 h-5" />
          </Link>
        )}
      </div>
    </section>
  );
}
