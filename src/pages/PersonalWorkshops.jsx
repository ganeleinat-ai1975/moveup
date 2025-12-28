import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useSiteSettings } from '../components/SiteSettingsContext';
import { PersonalWorkshop } from '@/entities/PersonalWorkshop';
import { Users, Clock, Star, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Paperclip, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MediaGallery from '../components/media/MediaGallery';
import CtaSection from '../components/shared/CtaSection';
import TopCTABanner from '../components/shared/TopCTABanner';
import HeroVideo from '../components/HeroVideo';
import { getIconComponent } from '../components/icons';

export default function PersonalWorkshops() {
  const { language, t, direction } = useLanguage();
  const { siteSettings } = useSiteSettings();
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  const [expandedBenefits, setExpandedBenefits] = useState({});
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const publishedContent = await PersonalWorkshop.filter({ is_published: true }, 'order_index');
        setContent(publishedContent || []);
      } catch (error) {
        console.log('No content found');
        setContent([]);
      }
      setIsLoading(false);
    };
    loadContent();
  }, []);

  // Scroll to specific card if anchor is present
  useEffect(() => {
    // Only attempt to scroll if content has loaded and we have a hash in the URL
    if (!isLoading && content.length > 0) {
      const hash = window.location.hash;
      if (hash) {
        // Use a slight delay to ensure the DOM elements are fully rendered after content state update
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add highlight effect
            element.classList.add('ring-4', 'ring-[var(--primary-color)]', 'ring-opacity-50');
            setTimeout(() => {
              element.classList.remove('ring-4', 'ring-[var(--primary-color)]', 'ring-opacity-50');
            }, 3000); // Remove highlight after 3 seconds
          }
        }, 100); // Small delay
      }
    }
  }, [content, isLoading]); // Depend on content and isLoading to ensure data is ready

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const toggleBenefitExpansion = (benefitIndex) => {
    setExpandedBenefits(prev => ({
      ...prev,
      [benefitIndex]: !prev[benefitIndex]
    }));
  };

  const handleCopyLink = (itemId) => {
    const anchor = `#card-${itemId}`;
    const fullLink = `https://www.moveup.today${window.location.pathname}${anchor}`;
    navigator.clipboard.writeText(fullLink).then(() => {
        setCopiedLinkId(itemId);
        setTimeout(() => setCopiedLinkId(null), 2500); // Hide message after 2.5 seconds
    });
  };

  const handleContactClick = (title) => {
      const subject = encodeURIComponent(`${t('פנייה מאתר פורצות קדימה לגבי', 'Inquiry from MoveUp website regarding')}: ${title}`);
      window.location.href = `mailto:hello@moveup.today?subject=${subject}`;
  };

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const personalWorkshopsMedia = siteSettings?.media_personal_workshops || siteSettings?.page_media?.personal_workshops || [];
  const personalWorkshopsMediaPosition = siteSettings?.media_position_personal_workshops || siteSettings?.page_media_position?.personal_workshops || "center center";

  // Benefits data for personal workshops
  const benefits = [
    {
      iconName: siteSettings?.personal_benefit_1_icon || 'Users',
      title_he: siteSettings?.personal_benefit_1_title_he,
      title_en: siteSettings?.personal_benefit_1_title_en,
      desc_he: siteSettings?.personal_benefit_1_desc_he,
      desc_en: siteSettings?.personal_benefit_1_desc_en
    },
    {
      iconName: siteSettings?.personal_benefit_2_icon || 'Star',
      title_he: siteSettings?.personal_benefit_2_title_he,
      title_en: siteSettings?.personal_benefit_2_title_en,
      desc_he: siteSettings?.personal_benefit_2_desc_he,
      desc_en: siteSettings?.personal_benefit_2_desc_en
    },
    {
      iconName: siteSettings?.personal_benefit_3_icon || 'Clock',
      title_he: siteSettings?.personal_benefit_3_title_he,
      title_en: siteSettings?.personal_benefit_3_title_en,
      desc_he: siteSettings?.personal_benefit_3_desc_he,
      desc_en: siteSettings?.personal_benefit_3_desc_en
    }
  ];

  return (
    <div className="bg-[var(--background-color)] min-h-screen">
      {/* Top CTA Banner */}
      <TopCTABanner />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-white overflow-hidden">
        {/* Hero Media - Desktop */}
        {personalWorkshopsMedia && personalWorkshopsMedia.length > 0 && (
          <div className="absolute inset-0 z-0 hidden md:block">
            <div className="w-full h-full">
              <HeroVideo
                media={personalWorkshopsMedia}
                className="grid-cols-1 h-full md:h-[70vh] flex items-center justify-center"
                mediaPosition={personalWorkshopsMediaPosition}
                mobileAsImage={false}
              />
            </div>
            <div className="absolute inset-0 bg-white/80 pointer-events-none"></div>
          </div>
        )}

        {/* Hero Media - Mobile */}
        {personalWorkshopsMedia && personalWorkshopsMedia.length > 0 && (
          <div className="absolute inset-0 z-0 block md:hidden">
            <div className="w-full h-full">
              <video
                src={personalWorkshopsMedia[0]?.file_url}
                className="w-full h-full object-cover"
                style={{ objectPosition: personalWorkshopsMediaPosition }}
                autoPlay
                loop
                muted
                playsInline
                webkitPlaysinline="true"
                preload="metadata"
              />
            </div>
            <div className="absolute inset-0 bg-white/80 pointer-events-none"></div>
          </div>
        )}

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 pointer-events-none">
          {(siteSettings?.personal_page_title_he?.trim() || siteSettings?.personal_page_title_en?.trim()) && (
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-8 pointer-events-auto">
              {language === 'he' ? siteSettings.personal_page_title_he : siteSettings.personal_page_title_en}
            </h1>
          )}
          {(siteSettings?.personal_description_he?.trim() || siteSettings?.personal_description_en?.trim()) && (
            <div
              className="text-xl text-opacity-80 text-[var(--text-color)] leading-relaxed max-w-3xl mx-auto pointer-events-auto"
              dangerouslySetInnerHTML={{ __html: language === 'he' ? siteSettings.personal_description_he : siteSettings.personal_description_en }}
            />
          )}
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto"></div>
              <p className="mt-4 text-opacity-60 text-[var(--text-color)]">
                {language === 'he'
                  ? (siteSettings?.general_loading_he || 'טוען...')
                  : (siteSettings?.general_loading_en || 'Loading...')
                }
              </p>
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4">
                {language === 'he'
                  ? (siteSettings?.general_coming_soon_he || 'בקרוב...')
                  : (siteSettings?.general_coming_soon_en || 'Coming Soon...')
                }
              </h3>
              <p className="text-opacity-70 text-[var(--text-color)]">
                {t('אנחנו עובדות על תוכנים מרתקים. חזרי בקרוב!', "We're working on exciting content. Come back soon!")}
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {content.map((item) => {
                const isExpanded = expandedItems[item.id];
                const description = language === 'he' ? item.description_he : item.description_en;
                const shouldTruncate = description && description.replace(/<[^>]*>/g, '').length > 150;

                return (
                <div
                  key={item.id}
                  id={`card-${item.id}`}
                  className="bg-white rounded-2xl shadow-elegant hover-lift smooth-transition overflow-hidden flex flex-col"
                >
                  <MediaGallery
                    media={item.media_gallery}
                    className="grid-cols-1 aspect-video"
                  />

                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 text-sm rounded-full ${
                          item.type === 'workshop' ? 'bg-blue-100 text-blue-800' :
                          item.type === 'consulting' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                      }`}>
                        {
                          item.type === 'workshop'
                              ? (language === 'he' ? (siteSettings?.general_workshop_he || 'סדנה') : (siteSettings?.general_workshop_en || 'Workshop'))
                          : item.type === 'consulting'
                              ? (language === 'he' ? (siteSettings?.general_consulting_he || 'ייעוץ') : (siteSettings?.general_consulting_en || 'Consulting'))
                          : (language === 'he' ? (siteSettings?.general_lecture_he || 'הרצאה') : (siteSettings?.general_lecture_en || 'Lecture'))
                        }
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[var(--text-color)] mb-4">
                      {language === 'he' ? item.title_he : item.title_en}
                    </h3>

                    <div className="text-opacity-70 text-[var(--text-color)] mb-6 leading-relaxed">
                        <div
                          dangerouslySetInnerHTML={{ __html: description || '' }}
                          className={shouldTruncate && !isExpanded ? 'line-clamp-3' : ''}
                        />
                        {shouldTruncate && (
                          <button
                            onClick={() => toggleExpanded(item.id)}
                            className="text-[var(--primary-color)] hover:text-[var(--secondary-color)] font-medium mt-2 flex items-center gap-1 transition-colors"
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

                    <div className="mt-auto pt-6"> {/* This will push content above it and stick buttons to the bottom */}
                      <div className="space-y-3 mb-6">
                        {(item.duration_he || item.duration_en) && (
                          <div className="flex items-center gap-3 text-sm text-opacity-60 text-[var(--text-color)]">
                            <Clock className="w-4 h-4 text-[var(--primary-color)]" />
                            <span>{language === 'he' ? item.duration_he : item.duration_en}</span>
                          </div>
                        )}
                        {item.participants && (
                          <div className="flex items-center gap-3 text-sm text-opacity-60 text-[var(--text-color)]">
                            <Users className="w-4 h-4 text-[var(--primary-color)]" />
                            <span>
                              {item.participants} {language === 'he'
                                ? (siteSettings?.general_participants_he || 'משתתפות')
                                : (siteSettings?.general_participants_en || 'participants')
                              }
                            </span>
                          </div>
                        )}
                        {(item.price_he || item.price_en) && (
                          <div className="flex items-center gap-3 text-sm text-opacity-60 text-[var(--text-color)]">
                            <Star className="w-4 h-4 text-[var(--primary-color)]" />
                            <span className="font-semibold text-[var(--primary-color)]">{language === 'he' ? item.price_he : item.price_en}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleContactClick(language === 'he' ? item.title_he : item.title_en)}
                        className="w-full bg-[var(--primary-color)] text-white py-3 rounded-full font-semibold hover:bg-[var(--secondary-color)] smooth-transition flex items-center justify-center gap-2"
                      >
                        {language === 'he'
                          ? (siteSettings?.general_register_he || 'צרו קשר')
                          : (siteSettings?.general_register_en || 'Contact Us')
                        }
                        <ArrowIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleCopyLink(item.id)}
                        className="w-full mt-3 text-sm text-[var(--primary-color)] hover:underline flex items-center justify-center gap-1 transition-all duration-300"
                        disabled={copiedLinkId === item.id}
                      >
                        {copiedLinkId === item.id ? (
                            <>
                                <Check className="w-4 h-4" />
                                {t('הקישור הועתק!', 'Link Copied!')}
                            </>
                        ) : (
                            <>
                                <Paperclip className="w-4 h-4" />
                                {t('שתפו קישור', 'Share Link')}
                            </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Recommendations Button Section */}
      {(siteSettings?.personal_show_testimonials_button && (siteSettings?.personal_testimonials_button_text_he?.trim() || siteSettings?.personal_testimonials_button_text_en?.trim())) && (
        <section className="pb-20 text-center">
          <Link
            to={createPageUrl('Testimonials')}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-[var(--primary-color)] rounded-full hover:bg-[var(--secondary-color)] smooth-transition shadow-lg"
          >
            {language === 'he'
              ? (siteSettings?.personal_testimonials_button_text_he || 'לקרוא המלצות')
              : (siteSettings?.personal_testimonials_button_text_en || 'Read Testimonials')
            }
            <ArrowIcon className={`w-5 h-5 ml-2 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
          </Link>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {(siteSettings?.personal_benefits_title_he?.trim() || siteSettings?.personal_benefits_title_en?.trim()) && (
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-4">
                {language === 'he' ? siteSettings.personal_benefits_title_he : siteSettings.personal_benefits_title_en}
              </h2>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const title = language === 'he' ? benefit.title_he : benefit.title_en;
              const desc = language === 'he' ? benefit.desc_he : benefit.desc_en;
              // Strip HTML tags for character count check
              const cleanDesc = desc ? desc.replace(/<[^>]*>/g, '') : '';
              const IconComponent = getIconComponent(benefit.iconName);

              if (!(title?.trim() || desc?.trim())) return null;

              const isExpanded = !!expandedBenefits[index];
              const shouldTruncate = cleanDesc.length > 150;

              return (
                <div key={index} className="text-center p-8 bg-[var(--background-color)] rounded-2xl hover-lift smooth-transition">
                  <div className="w-16 h-16 bg-[var(--primary-color)] rounded-full flex items-center justify-center mx-auto mb-6">
                    {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
                  </div>
                  {title?.trim() && (
                    <h3 className="text-xl font-bold text-[var(--text-color)] mb-4">
                      {title}
                    </h3>
                  )}
                  {desc?.trim() && (
                    <div className="text-opacity-70 text-[var(--text-color)] leading-relaxed">
                      <div
                        className={shouldTruncate && !isExpanded ? 'line-clamp-3' : ''}
                        dangerouslySetInnerHTML={{ __html: desc }}
                      />
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleBenefitExpansion(index)}
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
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CtaSection />
    </div>
  );
}