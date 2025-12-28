import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { useSiteSettings } from '../SiteSettingsContext';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WorkshopCard = ({ workshop, language, direction }) => {
  const {
    title_he, title_en,
    description_he, description_en,
    media_gallery, link_to, original_id
  } = workshop;

  const title = language === 'he' ? title_he : title_en;
  const description = language === 'he' ? description_he : description_en;
  const featuredMedia = media_gallery?.[0]; // Changed from featuredImage to featuredMedia

  const truncateText = (text, length) => {
    if (!text) return '';
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    return cleanText.length > length ? cleanText.substring(0, length) + '...' : cleanText;
  };

  const linkWithAnchor = `${link_to}#card-${original_id}`;

  return (
    <div className="flex-shrink-0 w-80 sm:w-72 md:w-80 p-3">
      <Link to={linkWithAnchor} className="block">
        <div 
            className="bg-white rounded-2xl shadow-lg overflow-hidden h-full group smooth-transition hover:shadow-xl hover:-translate-y-2"
        >
          <div className="aspect-square overflow-hidden relative">
            {featuredMedia ? (
              featuredMedia.type === 'video' ? ( // Check if the media is a video
                <video
                  src={featuredMedia.file_url}
                  className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                  autoPlay
                  loop
                  muted
                  playsInline
                  webkitPlaysinline="true" // For iOS Safari compatibility
                  preload="metadata"
                  aria-label={title}
                />
              ) : ( // Otherwise, assume it's an image
                <img 
                  src={featuredMedia.file_url} 
                  alt={title} 
                  className="w-full h-full object-cover group-hover:scale-105 smooth-transition" 
                  loading="lazy" 
                />
              )
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center">
                <span className="text-white text-2xl font-bold">MOVEUP</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 smooth-transition"></div>
          </div>
          
          <div className="p-4 text-center">
            <h3 className="text-lg font-bold text-[var(--text-color)] mb-2 leading-tight">
              {title}
            </h3>
            <p 
              className="text-sm text-opacity-70 text-[var(--text-color)] leading-relaxed line-clamp-2"
            >
              {truncateText(description, 60)}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default function WorkshopsCarousel() {
  const { language, direction, t } = useLanguage();
  const { siteSettings } = useSiteSettings();
  const [workshops, setWorkshops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (!siteSettings) return;

    const loadWorkshops = async () => {
      setIsLoading(true);
      try {
        const corporate = await base44.entities.CorporateLecture.filter({ is_published: true });
        let allWorkshops = corporate.map(item => ({
            id: 'c-' + item.id,
            original_id: item.id,
            title_he: item.title_he,
            title_en: item.title_en,
            description_he: item.description_he,
            description_en: item.description_en,
            media_gallery: item.media_gallery,
            link_to: createPageUrl(`CorporateLectures?tab=${item.target_audience_group || 'women'}`),
            order_index: item.order_index || 99
        }));

        if (siteSettings.workshops_carousel_show_personal) {
          const personal = await base44.entities.PersonalWorkshop.filter({ is_published: true });
          const mappedPersonal = personal.map(item => ({
              id: 'p-' + item.id,
              original_id: item.id,
              title_he: item.title_he,
              title_en: item.title_en,
              description_he: item.description_he,
              description_en: item.description_en,
              media_gallery: item.media_gallery || (item.image_url ? [{ type: 'image', file_url: item.image_url, alt_he: item.title_he || '', alt_en: item.title_en || '', order_index: 0 }] : []),
              link_to: createPageUrl('PersonalWorkshops'),
              order_index: item.order_index || 99
          }));
          allWorkshops = [...allWorkshops, ...mappedPersonal];
        }

        // NEW SORTING LOGIC
        let sortedWorkshops = [...allWorkshops]; // Create a mutable copy for sorting
        if (siteSettings.carousel_items_order && siteSettings.carousel_items_order.length > 0) {
            const orderMap = new Map(siteSettings.carousel_items_order.map((item, index) => [item.id, index]));
            
            sortedWorkshops.sort((a, b) => {
                const posA = orderMap.get(a.id);
                const posB = orderMap.get(b.id);

                // Check if both are in custom order
                if (posA !== undefined && posB !== undefined) {
                    return posA - posB;
                }
                // If only 'a' is in custom order, 'a' comes first
                if (posA !== undefined) {
                    return -1;
                }
                // If only 'b' is in custom order, 'b' comes first (meaning 'a' comes after 'b')
                if (posB !== undefined) {
                    return 1;
                }
                // If neither are in custom order, fallback to default order_index
                return (a.order_index || 99) - (b.order_index || 99);
            });
        } else {
            // Fallback to default sort if no custom order is set
            sortedWorkshops.sort((a, b) => (a.order_index || 99) - (b.order_index || 99));
        }

        setWorkshops(sortedWorkshops);

      } catch (error) {
        console.error("Failed to load workshops", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadWorkshops();
  }, [siteSettings]);
  
  const scroll = (direction) => {
    if (carouselRef.current) {
        const scrollAmount = carouselRef.current.offsetWidth * 0.8;
        carouselRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  };

  if (!siteSettings?.workshops_carousel_enabled || isLoading) {
    return null;
  }
  
  if (workshops.length === 0) {
      return null;
  }

  return (
    <section 
      className="py-12 md:py-20" 
      style={{ backgroundColor: siteSettings.workshops_carousel_bg_color || 'var(--background-color)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <h2 
            className="text-2xl md:text-4xl font-bold mb-3 md:mb-4"
            style={{ color: siteSettings.workshops_carousel_text_color || 'var(--text-color)' }}
          >
            {language === 'he' ? (siteSettings.workshops_carousel_title_he || 'מה נוכל לעשות ביחד?') : (siteSettings.workshops_carousel_title_en || 'What can we do together?')}
          </h2>
          <div 
            className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed ${!siteSettings.workshops_carousel_text_color && 'text-opacity-70'}`}
            style={{ color: siteSettings.workshops_carousel_text_color || 'var(--text-color)' }}
            dangerouslySetInnerHTML={{ __html: language === 'he' ? (siteSettings.workshops_carousel_subtitle_he || '') : (siteSettings.workshops_carousel_subtitle_en || '')}}
          />
        </div>

        {/* Carousel */}
        <div className="relative">
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto pb-4 -mx-3 snap-x snap-mandatory gap-2 md:gap-0"
            style={{ 
              scrollbarWidth: 'none', 
              '-ms-overflow-style': 'none',
              scrollPaddingLeft: '16px',
              scrollPaddingRight: '16px'
            }}
          >
            {workshops.map(workshop => (
               <div key={workshop.id} className="snap-start">
                 <WorkshopCard workshop={workshop} language={language} direction={direction} />
               </div>
            ))}
          </div>

          {/* Navigation Buttons - Hidden on mobile */}
          <button
            onClick={() => scroll(direction === 'rtl' ? 1 : -1)}
            aria-label={t('הקודם','Previous')}
            className="hidden md:flex absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 transform bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-200 items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-[var(--primary-color)]" />
          </button>
          <button
            onClick={() => scroll(direction === 'rtl' ? -1 : 1)}
            aria-label={t('הבא','Next')}
            className="hidden md:flex absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 transform bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-200 items-center justify-center"
          >
            <ChevronRight className="w-6 h-6 text-[var(--primary-color)]" />
          </button>
        </div>
      </div>
    </section>
  );
}