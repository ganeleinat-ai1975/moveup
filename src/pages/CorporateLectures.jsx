import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useSiteSettings } from '../components/SiteSettingsContext';
import { CorporateLecture } from '@/entities/CorporateLecture';
import { Building2, Clock, Users, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Paperclip, Check } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MediaGallery from '../components/media/MediaGallery';
import HeroVideo from '../components/HeroVideo';
import CtaSection from '../components/shared/CtaSection';
import { getIconComponent } from '../components/icons';
import TopCTABanner from '../components/shared/TopCTABanner';

export default function CorporateLectures() {
  const { language, t, direction } = useLanguage();
  const { siteSettings } = useSiteSettings();
  const [allContent, setAllContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  const [expandedBenefits, setExpandedBenefits] = useState({});
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialTab = searchParams.get('tab') || 'women';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'women';
    setActiveTab(tabFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const publishedContent = await CorporateLecture.filter({ is_published: true }, 'order_index');
        setAllContent(publishedContent || []);
      } catch (error) {
        console.log('No content found');
        setAllContent([]);
      }
      setIsLoading(false);
    };
    loadContent();
  }, []);

  // Scroll to specific card if anchor is present
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && allContent.length > 0) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add highlight effect
          element.classList.add('ring-4', 'ring-[var(--primary-color)]', 'ring-opacity-50');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-[var(--primary-color)]', 'ring-opacity-50');
          }, 3000);
        }
      }, 100);
    }
  }, [allContent, activeTab]);

  const handleCopyLink = (itemId) => {
    const anchor = `#card-${itemId}`;
    const pageUrl = `https://www.moveup.today${window.location.pathname}${window.location.search}`;
    const fullLink = `${pageUrl}${anchor}`;
    navigator.clipboard.writeText(fullLink).then(() => {
        setCopiedLinkId(itemId);
        setTimeout(() => setCopiedLinkId(null), 2500); // Hide message after 2.5 seconds
    });
  };

  const handleContactClick = (title) => {
      const subject = encodeURIComponent(`${t('פנייה מאתר פורצות קדימה לגבי:', 'Inquiry from Move Up website regarding:')} ${title}`);
      window.location.href = `mailto:hello@moveup.today?subject=${subject}`;
  };

  const filteredContent = allContent.filter(item => {
    if (!item.target_audience_group) {
      return activeTab === 'women';
    }
    return item.target_audience_group === activeTab;
  });

  const pageDetails = siteSettings?.corporate_pages?.[activeTab] || {};
  
  // Backward compatibility for media
  const heroMediaKey = `corporate_lectures_${activeTab}`;
  const newHeroMediaKey = `media_corporate_lectures_${activeTab}`;
  
  const heroMedia = siteSettings?.[newHeroMediaKey] || siteSettings?.page_media?.[heroMediaKey] || [];
  
  const heroMediaPositionKey = `media_position_corporate_lectures_${activeTab}`;
  const heroMediaPosition = siteSettings?.[heroMediaPositionKey] || siteSettings?.page_media_position?.[heroMediaKey] || "center center";

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

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

  const TabButton = ({ tabKey, he_text, en_text }) => (
    <Link
      to={createPageUrl(`CorporateLectures?tab=${tabKey}`)}
      className={`px-6 py-3 text-lg font-semibold rounded-full smooth-transition border-2 ${
        activeTab === tabKey
          ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]'
          : 'bg-transparent text-[var(--text-color)] border-gray-300 hover:border-[var(--primary-color)]'
      }`}
    >
      {language === 'he' ? he_text : en_text}
    </Link>
  );

  // Benefits data based on activeTab
  const benefits = [
    {
      iconName: pageDetails?.benefit_1_icon || 'Building2',
      title_he: pageDetails?.benefit_1_title_he,
      title_en: pageDetails?.benefit_1_title_en,
      desc_he: pageDetails?.benefit_1_desc_he,
      desc_en: pageDetails?.benefit_1_desc_en
    },
    {
      iconName: pageDetails?.benefit_2_icon || 'Users',
      title_he: pageDetails?.benefit_2_title_he,
      title_en: pageDetails?.benefit_2_title_en,
      desc_he: pageDetails?.benefit_2_desc_he,
      desc_en: pageDetails?.benefit_2_desc_en
    },
    {
      iconName: pageDetails?.benefit_3_icon || 'Clock',
      title_he: pageDetails?.benefit_3_title_he,
      title_en: pageDetails?.benefit_3_title_en,
      desc_he: pageDetails?.benefit_3_desc_he,
      desc_en: pageDetails?.benefit_3_desc_en
    }
  ];

  return (
    <div className="bg-[var(--background-color)] min-h-screen">
      {/* Top CTA Banner */}
      <TopCTABanner />

      {/* Tabs Navigation */}
      <div className="bg-white py-6">
        <div className="flex justify-center gap-4">
          <TabButton tabKey="women" he_text="לנשים עובדות ומנהלות" en_text="For Women Employees & Managers" />
          <TabButton tabKey="leaders" he_text="לדרג ניהולי" en_text="For Management Level" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden min-h-[60vh] md:min-h-[70vh] flex items-center justify-center">
        {/* Hero Media - Desktop */}
        {heroMedia.length > 0 && (
          <div className="absolute inset-0 z-0 hidden md:block">
            <div className="w-full h-full">
              <HeroVideo
                media={heroMedia}
                className="grid-cols-1 h-full md:h-[70vh] flex items-center justify-center"
                mediaPosition={heroMediaPosition}
                mobileAsImage={false}
              />
            </div>
            <div className="absolute inset-0 bg-white/80 pointer-events-none"></div>
          </div>
        )}

        {/* Hero Media - Mobile */}
        {heroMedia.length > 0 && (
          <div className="absolute inset-0 z-0 block md:hidden">
            <div className="w-full h-full">
              <video
                src={heroMedia[0]?.file_url}
                className="w-full h-full object-cover"
                style={{ objectPosition: heroMediaPosition }}
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

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 pointer-events-none">
          {(pageDetails.title_he?.trim() || pageDetails.title_en?.trim()) && (
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-8 pointer-events-auto">
              {language === 'he' ? pageDetails.title_he : pageDetails.title_en}
            </h1>
          )}
          {(pageDetails.description_he?.trim() || pageDetails.description_en?.trim()) && (
            <div
              className="text-xl text-opacity-80 text-[var(--text-color)] leading-relaxed max-w-3xl mx-auto pointer-events-auto"
              dangerouslySetInnerHTML={{ __html: language === 'he' ? pageDetails.description_he : pageDetails.description_en }}
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
                {t('טוען...', 'Loading...')}
              </p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4">
                {t('בקרוב...', 'Coming Soon...')}
              </h3>
              <p className="text-opacity-70 text-[var(--text-color)]">
                {t('אנחנו מפתחות תוכנים מתקדמים. צרו קשר לפרטים!', "We're developing advanced programs. Contact us for details!")}
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {filteredContent.map((item) => {
                const isExpanded = expandedItems[item.id];
                const description = language === 'he' ? item.description_he : item.description_en;
                const shouldTruncate = description && description.length > 150;

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
                            item.type === 'workshop' ? t('סדנה', 'Workshop') :
                            item.type === 'consulting' ? t('ייעוץ', 'Consulting') :
                            t('הרצאה', 'Lecture')
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

                      <div className="mt-auto pt-6">
                        <div className="space-y-3 mb-6">
                          {(item.duration_he || item.duration_en) && (
                            <div className="flex items-center gap-3 text-sm text-opacity-60 text-[var(--text-color)]">
                              <Clock className="w-4 h-4 text-[var(--primary-color)]" />
                              <span>{language === 'he' ? item.duration_he : item.duration_en}</span>
                            </div>
                          )}
                          {(item.audience_he || item.audience_en) && (
                            <div className="flex items-center gap-3 text-sm text-opacity-60 text-[var(--text-color)]">
                              <Users className="w-4 h-4 text-[var(--primary-color)]" />
                              <span>{language === 'he' ? item.audience_he : item.audience_en}</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleContactClick(language === 'he' ? item.title_he : item.title_en)}
                          className="w-full bg-[var(--primary-color)] text-white py-3 rounded-full font-semibold hover:bg-[var(--secondary-color)] smooth-transition flex items-center justify-center gap-2"
                        >
                          {t('צרו קשר', 'Contact Us')}
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

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {(pageDetails.benefits_title_he?.trim() || pageDetails.benefits_title_en?.trim()) && (
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-4">
                {language === 'he' ? pageDetails.benefits_title_he : pageDetails.benefits_title_en}
              </h2>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const title = language === 'he' ? benefit.title_he : benefit.title_en;
              const desc = language === 'he' ? benefit.desc_he : benefit.desc_en;
              const IconComponent = getIconComponent(benefit.iconName);

              if (!(title?.trim() || desc?.trim())) return null;

              const isExpanded = !!expandedBenefits[index];
              const shouldTruncate = desc && desc.length > 150;

              return (
                <div key={index} className="text-center p-8 bg-[var(--background-color)] rounded-2xl hover-lift smooth-transition">
                  <div className="w-16 h-16 bg-[var(--primary-color)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
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