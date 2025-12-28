import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useSiteSettings } from '../components/SiteSettingsContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, ArrowRight, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import MediaGallery from '../components/media/MediaGallery';
import CtaSection from '../components/shared/CtaSection';
import LogoCarousel from '../components/home/LogoCarousel';
import { getIconComponent } from '../components/icons';
import StatsSection from '../components/shared/StatsSection';
import TestimonialsCarousel from '../components/testimonials/TestimonialsCarousel';
import WorkshopsCarousel from '../components/home/WorkshopsCarousel';

export default function Home() {
  const { language, t, direction } = useLanguage();
  const { siteSettings } = useSiteSettings();
  const [expandedFeatures, setExpandedFeatures] = useState({});

  const homeMedia = siteSettings?.media_home || siteSettings?.page_media?.home || [];
  const homeMediaPosition = siteSettings?.media_position_home || siteSettings?.page_media_position?.home || "center center";

  const toggleFeatureExpansion = (index) => {
    setExpandedFeatures(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const features = [
    {
      iconName: siteSettings?.feature_1_icon || 'Users',
      title_he: siteSettings?.feature_1_title_he,
      title_en: siteSettings?.feature_1_title_en,
      desc_he: siteSettings?.feature_1_desc_he,
      desc_en: siteSettings?.feature_1_desc_en,
      button_text_he: siteSettings?.feature_1_button_text_he,
      button_text_en: siteSettings?.feature_1_button_text_en,
      button_link: siteSettings?.feature_1_button_link,
    },
    {
      iconName: siteSettings?.feature_2_icon || 'TrendingUp',
      title_he: siteSettings?.feature_2_title_he,
      title_en: siteSettings?.feature_2_title_en,
      desc_he: siteSettings?.feature_2_desc_he,
      desc_en: siteSettings?.feature_2_desc_en,
      button_text_he: siteSettings?.feature_2_button_text_he,
      button_text_en: siteSettings?.feature_2_button_text_en,
      button_link: siteSettings?.feature_2_button_link,
    },
    {
      iconName: siteSettings?.feature_3_icon || 'Award',
      title_he: siteSettings?.feature_3_title_he,
      title_en: siteSettings?.feature_3_title_en,
      desc_he: siteSettings?.feature_3_desc_he,
      desc_en: siteSettings?.feature_3_desc_en,
      button_text_he: siteSettings?.feature_3_button_text_he,
      button_text_en: siteSettings?.feature_3_button_text_en,
      button_link: siteSettings?.feature_3_button_link,
    },
  ];

  // AI Bot Feature - now managed via SiteSettings
  if (siteSettings?.feature_4_enabled) {
    features.push({
      iconName: siteSettings?.feature_4_icon || 'Users',
      title_he: siteSettings?.feature_4_title_he,
      title_en: siteSettings?.feature_4_title_en,
      desc_he: siteSettings?.feature_4_desc_he,
      desc_en: siteSettings?.feature_4_desc_en,
      button_text_he: siteSettings?.feature_4_button_text_he,
      button_text_en: siteSettings?.feature_4_button_text_en,
      button_link: siteSettings?.feature_4_button_link,
      is_external: true, // Bot feature is always external
      bot_image: siteSettings?.feature_4_bot_image
    });
  }

  return (
    <div className="bg-[var(--background-color)]">
      {/* Hero Section */}
      <section className="bg-[var(--background-color)] text-center animate-fade-in">

        {/* --- DESKTOP VIEW --- */}
        <div className="hidden md:block py-12 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {(siteSettings?.hero_title_he?.trim() || siteSettings?.hero_title_en?.trim()) && (
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--text-color)] mb-4 leading-tight">
                <span className="gradient-text">
                  {language === 'he' ? siteSettings.hero_title_he : siteSettings.hero_title_en}
                </span>
              </h1>
            )}
            
            {(siteSettings?.hero_subtitle_he?.trim() || siteSettings?.hero_subtitle_en?.trim()) && (
              <div 
                className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed"
                style={{ color: siteSettings?.hero_subtitle_color || 'var(--text-color)' }}
                dangerouslySetInnerHTML={{ __html: language === 'he' ? siteSettings.hero_subtitle_he : siteSettings.hero_subtitle_en }}
              />
            )}
          </div>

          {homeMedia && homeMedia.length > 0 && (
            <div className="px-4 sm:px-6 lg:px-8 my-8">
              <div className="mx-auto" style={{ maxWidth: 'calc(100vw - 64px)' }}>
                <div className="rounded-2xl shadow-elegant overflow-hidden">
                  <MediaGallery 
                    media={homeMedia} 
                    className="grid-cols-1 aspect-video mt-0 gap-0"
                    mediaPosition={homeMediaPosition}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {(siteSettings?.hero_cta_primary_he?.trim() || siteSettings?.hero_cta_primary_en?.trim()) && (
                  <Link
                    to={createPageUrl('CorporateLectures')}
                    className="bg-[var(--primary-color)] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[var(--secondary-color)] smooth-transition shadow-elegant hover-lift flex items-center gap-2"
                  >
                    {language === 'he' ? siteSettings.hero_cta_primary_he : siteSettings.hero_cta_primary_en}
                    <ArrowIcon className="w-5 h-5" />
                  </Link>
                )}
                
                {(siteSettings?.hero_cta_secondary_he?.trim() || siteSettings?.hero_cta_secondary_en?.trim()) && (
                  <Link
                    to={createPageUrl('About')}
                    className="bg-white text-[var(--primary-color)] px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 smooth-transition shadow-elegant hover-lift"
                  >
                    {language === 'he' ? siteSettings.hero_cta_secondary_he : siteSettings.hero_cta_secondary_en}
                  </Link>
                )}
              </div>
          </div>
        </div>

        {/* --- MOBILE VIEW --- */}
        <div className="md:hidden py-12">
            <div className="px-4">
                {(siteSettings?.hero_title_he?.trim() || siteSettings?.hero_title_en?.trim()) && (
                    <h1 className="text-4xl font-bold text-[var(--text-color)] mb-4 leading-tight">
                        <span className="gradient-text">
                            {language === 'he' ? siteSettings.hero_title_he : siteSettings.hero_title_en}
                        </span>
                    </h1>
                )}
                {(siteSettings?.hero_subtitle_he?.trim() || siteSettings?.hero_subtitle_en?.trim()) && (
                    <div 
                    className="text-xl mb-8 leading-relaxed"
                    style={{ color: siteSettings?.hero_subtitle_color || 'var(--text-color)' }}
                    dangerouslySetInnerHTML={{ __html: language === 'he' ? siteSettings.hero_subtitle_he : siteSettings.hero_subtitle_en }}
                    />
                )}
            </div>

            {homeMedia && homeMedia.length > 0 && (
                <div className="w-full my-8">
                    <div className="rounded-2xl shadow-elegant overflow-hidden aspect-[4/3] mx-4">
                        <MediaGallery 
                            media={homeMedia} 
                            className="grid-cols-1 h-full w-full mt-0 gap-0"
                            mediaPosition={homeMediaPosition}
                        />
                    </div>
                </div>
            )}
            
            <div className="px-4">
                <div className="flex flex-col gap-4 justify-center items-center">
                {(siteSettings?.hero_cta_primary_he?.trim() || siteSettings?.hero_cta_primary_en?.trim()) && (
                    <Link
                    to={createPageUrl('CorporateLectures')}
                    className="bg-[var(--primary-color)] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[var(--secondary-color)] smooth-transition shadow-elegant hover-lift flex items-center gap-2"
                    >
                    {language === 'he' ? siteSettings.hero_cta_primary_he : siteSettings.hero_cta_primary_en}
                    <ArrowIcon className="w-5 h-5" />
                    </Link>
                )}
                
                {(siteSettings?.hero_cta_secondary_he?.trim() || siteSettings?.hero_cta_secondary_en?.trim()) && (
                    <Link
                    to={createPageUrl('About')}
                    className="bg-white text-[var(--primary-color)] px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 smooth-transition shadow-elegant hover-lift"
                    >
                    {language === 'he' ? siteSettings.hero_cta_secondary_he : siteSettings.hero_cta_secondary_en}
                    </Link>
                )}
                </div>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {(siteSettings?.features_title_he?.trim() || siteSettings?.features_title_en?.trim()) && (
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-4">
                {language === 'he' ? siteSettings.features_title_he : siteSettings.features_title_en}
              </h2>
            )}
            {(siteSettings?.features_subtitle_he?.trim() || siteSettings?.features_subtitle_en?.trim()) && (
              <div 
                className="text-xl text-opacity-70 text-[var(--text-color)] max-w-2xl mx-auto"
                dangerouslySetInnerHTML={{ __html: language === 'he' ? siteSettings.features_subtitle_he : siteSettings.features_subtitle_en }}
              />
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const title = language === 'he' ? feature.title_he : feature.title_en;
              const desc = language === 'he' ? feature.desc_he : feature.desc_en;
              const IconComponent = getIconComponent(feature.iconName);
              
              const buttonText = language === 'he' ? feature.button_text_he : feature.button_text_en;
              const buttonLink = feature.is_external ? feature.button_link : (feature.button_link ? createPageUrl(feature.button_link) : createPageUrl('Contact'));

              const isExpanded = !!expandedFeatures[index];
              const shouldTruncate = desc && desc.length > 150;

              // Only render feature if it has any title or description content (after trimming for check)
              if (!(title?.trim() || desc?.trim())) return null;
              
              return (
                <div key={index} className="flex flex-col text-center p-8 bg-[var(--background-color)] rounded-2xl hover-lift smooth-transition relative overflow-hidden">
                  {/* Special styling for bot card */}
                  {feature.bot_image && (
                    <div className="absolute inset-0 opacity-5">
                      <img src={feature.bot_image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex-grow relative z-10"> {/* This div will take up available space, pushing the button to the bottom */}
                    <div className="w-16 h-16 bg-[var(--primary-color)] rounded-full flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    {title?.trim() && ( // Check for trimmed title for rendering
                      <h3 className="text-xl font-bold text-[var(--text-color)] mb-4">
                        {title}
                      </h3>
                    )}
                    {desc?.trim() && ( // Check for trimmed description for rendering
                      <div className="text-opacity-70 text-[var(--text-color)] leading-relaxed">
                        <div
                          className={shouldTruncate && !isExpanded ? 'line-clamp-3' : ''}
                          dangerouslySetInnerHTML={{ __html: desc || '' }}
                        />
                        {shouldTruncate && (
                          <button
                            onClick={() => toggleFeatureExpansion(index)}
                            className="text-[var(--primary-color)] hover:text-[var(--secondary-color)] font-medium mt-2 flex items-center justify-center gap-1 transition-colors w-full"
                          >
                            {isExpanded ? (
                              <>
                                {t('הצג פחות', 'Show Less')}
                                <ChevronUp className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                {t('הצג עוד', 'Show More')}
                                <ChevronDown className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Render button only if buttonText is provided */}
                  {buttonText?.trim() && (
                    <div className="mt-6 relative z-10">
                      {feature.is_external ? (
                        <a
                          href={buttonLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-[var(--secondary-color)] smooth-transition inline-flex items-center gap-2"
                        >
                          {buttonText}
                          <ArrowIcon className="w-4 h-4" />
                        </a>
                      ) : (
                        <Link
                          to={buttonLink}
                          className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-[var(--secondary-color)] smooth-transition inline-flex items-center gap-2"
                        >
                          {buttonText}
                          <ArrowIcon className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Features Media Gallery */}
          <MediaGallery 
            media={siteSettings?.page_media?.home_features} 
            className="grid-cols-2 lg:grid-cols-3 mt-12"
            mediaPosition={siteSettings?.page_media_position?.home_features || "center center"}
          />
        </div>
      </section>

      {/* Workshops Carousel */}
      <WorkshopsCarousel />

      {/* Logo Carousel */}
      <LogoCarousel />

      {/* Testimonials Carousel */}
      <TestimonialsCarousel />

      {/* Stats Section */}
      <StatsSection />

      {/* Contact Form CTA Section - NEW */}
      <section 
        className="py-20"
        style={{ backgroundColor: siteSettings?.contact_page_form_cta_bg_color || '#ffffff' }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[var(--text-color)] mb-4">
            {language === 'he' 
              ? (siteSettings?.contact_page_form_cta_title_he || 'רוצה לכתוב לנו?')
              : (siteSettings?.contact_page_form_cta_title_en || 'Want to write to us?')
            }
          </h2>
          <div 
            className="text-xl text-opacity-70 text-[var(--text-color)] mb-8"
            dangerouslySetInnerHTML={{ __html: language === 'he'
              ? (siteSettings?.contact_page_form_cta_subtitle_he || 'יש לך שאלה, רעיון לשיתוף פעולה או שאת פשוט רוצה להגיד שלום? לחצי על הכפתור ומלאי את הטופס.')
              : (siteSettings?.contact_page_form_cta_subtitle_en || 'Have a question, an idea for collaboration, or just want to say hello? Click the button and fill out the form.')
            }}
          />
          <Link
            to={createPageUrl('ContactForm')}
            className="bg-[var(--primary-color)] text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 smooth-transition shadow-elegant hover-lift inline-flex items-center gap-2"
            style={{
              backgroundColor: siteSettings?.contact_page_form_cta_button_bg_color || 'var(--primary-color)',
              color: siteSettings?.contact_page_form_cta_button_text_color || '#ffffff'
            }}
          >
            <Edit3 className="w-5 h-5" />
            {language === 'he'
              ? (siteSettings?.contact_page_form_cta_button_he || 'למילוי טופס יצירת קשר')
              : (siteSettings?.contact_page_form_cta_button_en || 'Fill out the contact form')
            }
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <CtaSection />
    </div>
  );
}