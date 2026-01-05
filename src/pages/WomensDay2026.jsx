import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useSiteSettings } from '../components/SiteSettingsContext';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2, ArrowLeft, ArrowRight, Clock, Users, Share2, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaGallery from '../components/media/MediaGallery';
import CtaSection from '../components/shared/CtaSection';
import { getIconComponent } from '../components/icons';

export default function WomensDay2026() {
  const { language, t, direction } = useLanguage();
  const { siteSettings } = useSiteSettings();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLectures, setExpandedLectures] = useState({});
  const [expandedBenefits, setExpandedBenefits] = useState({});

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    loadLectures();
  }, [siteSettings]);

  const loadLectures = async () => {
    setLoading(true);
    try {
      const featuredIds = siteSettings?.featured_lecture_ids || [];
      if (featuredIds.length > 0) {
        const allLectures = await base44.entities.CorporateLecture.filter({ is_published: true });
        const featured = allLectures.filter(lecture => featuredIds.includes(lecture.id));
        // Sort by order in featured_lecture_ids array
        featured.sort((a, b) => featuredIds.indexOf(a.id) - featuredIds.indexOf(b.id));
        setLectures(featured);
      }
    } catch (error) {
      console.error('Error loading lectures:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLectureExpansion = (id) => {
    setExpandedLectures(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBenefitExpansion = (index) => {
    setExpandedBenefits(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const copyLink = (lectureId) => {
    const url = `${window.location.origin}${createPageUrl('WomensDay2026')}#card-${lectureId}`;
    navigator.clipboard.writeText(url);
    alert(t('הקישור הועתק ללוח', 'Link copied to clipboard'));
  };

  const contactUs = () => {
    window.location.href = `mailto:${siteSettings?.contact_email || ''}`;
  };

  const benefits = [
    {
      iconName: siteSettings?.benefit_1_icon || 'Target',
      title_he: siteSettings?.benefit_1_title_he,
      title_en: siteSettings?.benefit_1_title_en,
      desc_he: siteSettings?.benefit_1_desc_he,
      desc_en: siteSettings?.benefit_1_desc_en,
    },
    {
      iconName: siteSettings?.benefit_2_icon || 'Users',
      title_he: siteSettings?.benefit_2_title_he,
      title_en: siteSettings?.benefit_2_title_en,
      desc_he: siteSettings?.benefit_2_desc_he,
      desc_en: siteSettings?.benefit_2_desc_en,
    },
    {
      iconName: siteSettings?.benefit_3_icon || 'Award',
      title_he: siteSettings?.benefit_3_title_he,
      title_en: siteSettings?.benefit_3_title_en,
      desc_he: siteSettings?.benefit_3_desc_he,
      desc_en: siteSettings?.benefit_3_desc_en,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden min-h-[60vh] md:min-h-[70vh] flex items-center justify-center">
        {/* Hero Media - Desktop */}
        {(siteSettings?.media_womens_day_2026 && siteSettings.media_womens_day_2026.length > 0) && (
          <div className="absolute inset-0 z-0 hidden md:block">
            <MediaGallery 
              media={siteSettings.media_womens_day_2026} 
              className="h-full"
              mediaPosition={siteSettings.media_position_womens_day_2026 || "center center"}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent"></div>
          </div>
        )}

        {/* Hero Media - Mobile */}
        {(siteSettings?.media_womens_day_2026 && siteSettings.media_womens_day_2026.length > 0) && (
          <div className="absolute inset-0 z-0 block md:hidden">
            <div className="w-full h-full">
              <video
                src={siteSettings.media_womens_day_2026[0]?.file_url}
                className="w-full h-full object-cover"
                style={{ objectPosition: siteSettings.media_position_womens_day_2026 || "center center" }}
                autoPlay
                loop
                muted
                playsInline
                webkit-playsinline="true"
                preload="metadata"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent"></div>
          </div>
        )}

        {/* Title container */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {language === 'he' 
              ? (siteSettings?.page_title_he || 'יום הנשים 2026')
              : (siteSettings?.page_title_en || "Women's Day 2026")
            }
          </h1>
        </div>

        {/* Description Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div 
            className="text-lg md:text-xl text-[var(--text-color)] leading-relaxed text-center"
            dangerouslySetInnerHTML={{ 
              __html: language === 'he' 
                ? (siteSettings?.description_he || '') 
                : (siteSettings?.description_en || '') 
            }}
          />
        </div>
      </section>

      {/* Lectures Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-[var(--primary-color)]" />
            </div>
          ) : lectures.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">
                {t('בקרוב...', 'Coming Soon...')}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {lectures.map((lecture) => {
                const title = language === 'he' ? lecture.title_he : lecture.title_en;
                const description = language === 'he' ? lecture.description_he : lecture.description_en;
                const duration = language === 'he' ? lecture.duration_he : lecture.duration_en;
                const audience = language === 'he' ? lecture.audience_he : lecture.audience_en;
                
                const isExpanded = !!expandedLectures[lecture.id];
                const shouldTruncate = description && description.length > 200;

                return (
                  <div
                    key={lecture.id}
                    id={`card-${lecture.id}`}
                    className="bg-[var(--background-color)] rounded-2xl overflow-hidden shadow-elegant hover-lift smooth-transition scroll-mt-24"
                  >
                    {lecture.media_gallery && lecture.media_gallery.length > 0 && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <MediaGallery 
                          media={lecture.media_gallery}
                          className="h-full"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-[var(--primary-color)] text-white text-sm font-medium rounded-full">
                          {lecture.type === 'workshop' && t('סדנה', 'Workshop')}
                          {lecture.type === 'lecture' && t('הרצאה', 'Lecture')}
                          {lecture.type === 'consulting' && t('ייעוץ', 'Consulting')}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-[var(--text-color)] mb-3">
                        {title}
                      </h3>

                      <div className="text-[var(--text-color)] opacity-80 mb-4 leading-relaxed">
                        <div
                          className={shouldTruncate && !isExpanded ? 'line-clamp-3' : ''}
                          dangerouslySetInnerHTML={{ __html: description || '' }}
                        />
                        {shouldTruncate && (
                          <button
                            onClick={() => toggleLectureExpansion(lecture.id)}
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

                      {(duration || audience) && (
                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-[var(--text-color)] opacity-70">
                          {duration && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{duration}</span>
                            </div>
                          )}
                          {audience && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{audience}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={contactUs}
                          className="flex-1 bg-[var(--primary-color)] text-white px-6 py-3 rounded-full font-semibold hover:bg-[var(--secondary-color)] smooth-transition flex items-center justify-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          {t('צרי קשר', 'Contact')}
                        </button>
                        <button
                          onClick={() => copyLink(lecture.id)}
                          className="bg-white border-2 border-[var(--primary-color)] text-[var(--primary-color)] px-4 py-3 rounded-full font-semibold hover:bg-[var(--primary-color)] hover:text-white smooth-transition"
                          title={t('שתפי קישור', 'Share Link')}
                        >
                          <Share2 className="w-5 h-5" />
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
      {(siteSettings?.benefits_title_he || siteSettings?.benefits_title_en) && (
        <section className="py-16 bg-[var(--background-color)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--text-color)] mb-12">
              {language === 'he' 
                ? (siteSettings?.benefits_title_he || '')
                : (siteSettings?.benefits_title_en || '')
              }
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const title = language === 'he' ? benefit.title_he : benefit.title_en;
                const desc = language === 'he' ? benefit.desc_he : benefit.desc_en;
                const IconComponent = getIconComponent(benefit.iconName);
                
                if (!(title?.trim() || desc?.trim())) return null;

                const isExpanded = !!expandedBenefits[index];
                const shouldTruncate = desc && desc.length > 150;

                return (
                  <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg hover-lift smooth-transition">
                    <div className="w-16 h-16 bg-[var(--primary-color)] rounded-full flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    {title?.trim() && (
                      <h3 className="text-xl font-bold text-[var(--text-color)] mb-4">
                        {title}
                      </h3>
                    )}
                    {desc?.trim() && (
                      <div className="text-[var(--text-color)] opacity-70 leading-relaxed">
                        <div
                          className={shouldTruncate && !isExpanded ? 'line-clamp-3' : ''}
                          dangerouslySetInnerHTML={{ __html: desc || '' }}
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
      )}

      {/* Share Link Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Button
            onClick={() => {
              const url = 'https://moveup.today' + createPageUrl('WomensDay2026');
              navigator.clipboard.writeText(url);
              alert(t('הקישור הועתק ללוח', 'Link copied to clipboard'));
            }}
            className="bg-[var(--primary-color)] text-white px-8 py-4 rounded-full font-semibold hover:bg-[var(--secondary-color)] smooth-transition shadow-elegant hover-lift flex items-center gap-2 mx-auto"
          >
            <Share2 className="w-5 h-5" />
            {t('קישור "פורצות קדימה ביום הנשים הבנ״ל"', 'Share "Breaking Forward at International Women\'s Day"')}
          </Button>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}