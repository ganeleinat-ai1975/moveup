import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useSiteSettings } from '../components/SiteSettingsContext';
import { Testimonial } from '@/entities/Testimonial';
import { Star, Quote } from 'lucide-react';
// This import might become redundant if MediaGallery is fully replaced by HeroVideo for this specific use-case, but keeping it for safety if it's used elsewhere or for fallback.
import HeroVideo from '../components/HeroVideo'; // New import
import TopCTABanner from '../components/shared/TopCTABanner';
import CtaSection from '../components/shared/CtaSection';
import StatsSection from '../components/shared/StatsSection';

export default function Testimonials() {
  const { language, t } = useLanguage();
  const { siteSettings } = useSiteSettings();
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      setIsLoading(true);
      try {
        const publishedTestimonials = await Testimonial.filter({ is_published: true });
        setContent(publishedTestimonials || []);
      } catch (e) {
        console.error("Failed to load testimonials", e);
        setContent([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadTestimonials();
  }, []);

  const testimonialsMedia = siteSettings?.media_testimonials || siteSettings?.page_media?.testimonials || [];
  const testimonialsMediaPosition = siteSettings?.media_position_testimonials || siteSettings?.page_media_position?.testimonials || "center center";

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-[var(--background-color)] min-h-screen">
      {/* Top CTA Banner */}
      <TopCTABanner />

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden min-h-[60vh] md:min-h-[70vh] flex items-center justify-center">
        {/* Hero Media - Desktop */}
        {testimonialsMedia && testimonialsMedia.length > 0 && (
          <div className="absolute inset-0 z-0 hidden md:block">
            {/* The HeroVideo component itself should manage its dimensions within its parent container */}
            <HeroVideo 
              media={testimonialsMedia} 
              className="w-full h-full" // Ensure HeroVideo's root element fills its container
              mediaPosition={testimonialsMediaPosition}
              mobileAsImage={false}
            />
            <div className="absolute inset-0 bg-white/80 pointer-events-none"></div>
          </div>
        )}

        {/* Hero Media - Mobile */}
        {testimonialsMedia && testimonialsMedia.length > 0 && (
          <div className="absolute inset-0 z-0 block md:hidden">
            <div className="w-full h-full">
              <video
                src={testimonialsMedia[0]?.file_url}
                className="w-full h-full object-cover"
                style={{ objectPosition: testimonialsMediaPosition }}
                autoPlay
                loop
                muted
                playsInline
                webkit-playsinline="true"
                preload="metadata"
              />
            </div>
            <div className="absolute inset-0 bg-white/80 pointer-events-none"></div>
          </div>
        )}
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          {(siteSettings?.testimonials_page_title_he?.trim() || siteSettings?.testimonials_page_title_en?.trim()) && (
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-8">
              {language === 'he' ? siteSettings.testimonials_page_title_he : siteSettings.testimonials_page_title_en}
            </h1>
          )}
          {(siteSettings?.testimonials_description_he?.trim() || siteSettings?.testimonials_description_en?.trim()) && (
            <div
              className="text-xl text-opacity-80 text-[var(--text-color)] leading-relaxed max-w-3xl mx-auto"
              dangerouslySetInnerHTML={{ __html: language === 'he' ? siteSettings.testimonials_description_he : siteSettings.testimonials_description_en }}
            />
          )}
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center text-[var(--text-color)]">
              {language === 'he'
                ? (siteSettings?.general_loading_he || 'טוען המלצות...')
                : (siteSettings?.general_loading_en || 'Loading testimonials...')
              }
            </div>
          ) : content.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-elegant p-8 flex flex-col text-center">
                  {item.photo_url && (
                    <img src={item.photo_url} alt={language === 'he' ? item.name_he : item.name_en} className="w-20 h-20 rounded-full mx-auto -mt-16 mb-4 border-4 border-white object-cover"/>
                  )}
                  <div className="flex justify-center items-center gap-1 mb-4">
                    {renderStars(item.rating)}
                  </div>

                  <Quote className="w-8 h-8 text-[var(--primary-color)] mb-4 mx-auto" />

                  <div
                    className="text-opacity-80 text-[var(--text-color)] leading-relaxed italic mb-6 flex-grow"
                    dangerouslySetInnerHTML={{ __html: language === 'he' ? item.text_he : item.text_en}}
                  />

                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-xl font-bold text-[var(--text-color)]">
                      {language === 'he' ? item.name_he : item.name_en}
                    </h4>
                    <p className="text-opacity-60 text-[var(--text-color)]">
                      {language === 'he' ? item.title_he : item.title_en}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              {t('עדיין אין המלצות להצגה.', 'No testimonials to display yet.')}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />
      {/* New Cta Section */}
      <CtaSection />
    </div>
  );
}