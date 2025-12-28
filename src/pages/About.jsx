import React from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useSiteSettings } from '../components/SiteSettingsContext';
import HeroVideo from '../components/HeroVideo';
import MediaGallery from '../components/media/MediaGallery'; // This import is no longer used for mobile hero media
import TopCTABanner from '../components/shared/TopCTABanner';
import CtaSection from '../components/shared/CtaSection';
import { Loader2 } from 'lucide-react';

export default function About() {
  const { language, t } = useLanguage();
  const { siteSettings } = useSiteSettings();

  if (!siteSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--primary-color)]" />
      </div>
    );
  }

  const {
    about_page_title_he, about_page_title_en,
    about_intro_text_he, about_intro_text_en,
    about_intro_section_bg_color, about_intro_text_color,
    about_mission_title_he, about_mission_title_en,
    about_mission_text_he, about_mission_text_en,
    managers_section_title_he, managers_section_title_en,
    managers,
    page_media, page_media_position,
    media_about, media_position_about,
    managers_section_bg_color, managers_section_text_color, managers_section_title_color, primary_color
  } = siteSettings;

  const aboutMedia = media_about || page_media?.about || [];
  const aboutMediaPosition = media_position_about || page_media_position?.about || "center center";

  return (
    <div className="bg-[var(--background-color)] min-h-screen">
      <TopCTABanner />

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden min-h-[60vh] md:min-h-[70vh] flex items-center justify-center">
        {/* Hero Media - Desktop */}
        {(aboutMedia && aboutMedia.length > 0) && (
          <div className="absolute inset-0 z-0 hidden md:block">
            <HeroVideo 
              media={aboutMedia} 
              className="grid-cols-1"
              mediaPosition={aboutMediaPosition}
              mobileAsImage={false}
            />
            <div className="absolute inset-0 bg-white/80 pointer-events-none"></div>
          </div>
        )}

        {/* Hero Media - Mobile */}
        {(aboutMedia && aboutMedia.length > 0) && (
          <div className="absolute inset-0 z-0 block md:hidden">
            <div className="w-full h-full">
              <video
                src={aboutMedia[0]?.file_url}
                className="w-full h-full object-cover"
                style={{ objectPosition: aboutMediaPosition }}
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

        {/* Title container: Adjusted as per outline */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 pointer-events-none">
          {(about_page_title_he?.trim() || about_page_title_en?.trim()) && (
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-8 pointer-events-auto">
              {language === 'he' ? about_page_title_he : about_page_title_en}
            </h1>
          )}
        </div>
      </section>

      {/* Intro Text Section */}
      {(about_intro_text_he?.trim() || about_intro_text_en?.trim()) && (
        <section 
          className="py-12 md:py-20"
          style={{
            backgroundColor: about_intro_section_bg_color || 'var(--background-color)',
            color: about_intro_text_color || 'var(--text-color)'
          }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: language === 'he' ? about_intro_text_he : about_intro_text_en }}
            />
          </div>
        </section>
      )}

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-8">
            {language === 'he' ? about_mission_title_he : about_mission_title_en}
          </h2>
          <div
            className="text-lg text-opacity-70 text-[var(--text-color)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: language === 'he' ? about_mission_text_he : about_mission_text_en }}
          />
        </div>
      </section>

      {/* Managers Section */}
      {managers && managers.length > 0 && (
        <section 
          className="py-20"
          style={{
            backgroundColor: managers_section_bg_color || '#ffffff',
            color: managers_section_text_color || 'var(--text-color)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 
                className="text-3xl md:text-4xl font-bold"
                style={{ color: managers_section_title_color || primary_color || 'var(--primary-color)' }}
              >
                {language === 'he' ? managers_section_title_he : managers_section_title_en}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {managers.map((manager, index) => (
                <div key={index} className="pt-16">
                  <div className="bg-white rounded-2xl shadow-elegant p-8 text-center hover-lift smooth-transition h-full">
                    {(manager.manager_media && manager.manager_media.length > 0) && (
                      <img
                        src={manager.manager_media[0].file_url}
                        alt={language === 'he' ? manager.manager_name_he : manager.manager_name_en}
                        className="w-32 h-32 rounded-full mx-auto mb-6 object-cover object-top border-4 border-white shadow-lg -mt-16"
                      />
                    )}
                    <h3 className="text-xl font-bold mb-4" style={{ color: managers_section_title_color || primary_color || 'var(--primary-color)' }}>
                      {language === 'he' ? manager.manager_name_he : manager.manager_name_en}
                    </h3>
                    <div
                      className="leading-relaxed opacity-90"
                      dangerouslySetInnerHTML={{ __html: language === 'he' ? manager.manager_desc_he : manager.manager_desc_en }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <CtaSection />
    </div>
  );
}