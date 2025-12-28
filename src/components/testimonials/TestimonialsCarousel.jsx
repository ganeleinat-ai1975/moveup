import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { useSiteSettings } from '../SiteSettingsContext';
import { Testimonial } from '@/entities/Testimonial';
import { Star, Quote, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TestimonialsCarousel() {
  const { language, t, direction } = useLanguage();
  const { siteSettings } = useSiteSettings();
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const publishedTestimonials = await Testimonial.filter({ is_published: true });
        setTestimonials(publishedTestimonials);
      } catch (error) {
        console.log('No testimonials found', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTestimonials();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex(prev => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <section 
        className="py-20"
        style={{ backgroundColor: siteSettings?.testimonials_carousel_bg_color || '#f9fafb' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section 
      className="py-20"
      style={{ 
        backgroundColor: siteSettings?.testimonials_carousel_bg_color || '#f9fafb',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: siteSettings?.testimonials_carousel_text_color || 'var(--text-color)' }}
          >
            {language === 'he' 
              ? (siteSettings?.testimonials_carousel_title_he || 'מה אומרות עלינו')
              : (siteSettings?.testimonials_carousel_title_en || 'What they say about us')
            }
          </h2>
          <div 
            className="text-lg text-opacity-70"
            style={{ color: siteSettings?.testimonials_carousel_text_color || 'var(--text-color)' }}
            dangerouslySetInnerHTML={{__html: language === 'he'
              ? (siteSettings?.testimonials_carousel_subtitle_he || '')
              : (siteSettings?.testimonials_carousel_subtitle_en || '')
            }}
          />
        </div>

        <div className="relative">
          {/* Main testimonial card */}
          <div className="bg-white rounded-2xl shadow-elegant p-8 md:p-12 text-center min-h-[300px] flex flex-col justify-center">
            {currentTestimonial.photo_url && (
              <img 
                src={currentTestimonial.photo_url} 
                alt={language === 'he' ? currentTestimonial.name_he : currentTestimonial.name_en} 
                className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
              />
            )}
            
            <div className="flex justify-center items-center gap-1 mb-6">
              {renderStars(currentTestimonial.rating)}
            </div>
            
            <Quote className="w-8 h-8 text-[var(--primary-color)] mb-6 mx-auto" />
            
            <div 
              className="text-lg text-opacity-80 text-[var(--text-color)] mb-8 leading-relaxed italic max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{__html: language === 'he' ? currentTestimonial.text_he : currentTestimonial.text_en}}
            />
            
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-xl font-bold text-[var(--text-color)] mb-2">
                {language === 'he' ? currentTestimonial.name_he : currentTestimonial.name_en}
              </h4>
              <p className="text-opacity-60 text-[var(--text-color)]">
                {language === 'he' ? currentTestimonial.title_he : currentTestimonial.title_en}
              </p>
            </div>
          </div>

          {/* Navigation arrows - HIDDEN ON MOBILE, VISIBLE ON DESKTOP */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={direction === 'rtl' ? goToNext : goToPrevious}
                className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover-lift"
              >
                <ChevronLeft className="w-6 h-6 text-[var(--primary-color)]" />
              </button>
              
              <button
                onClick={direction === 'rtl' ? goToPrevious : goToNext}
                className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover-lift"
              >
                <ChevronRight className="w-6 h-6 text-[var(--primary-color)]" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {testimonials.length > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-[var(--primary-color)] scale-110' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Button to testimonials page */}
        {(siteSettings?.testimonials_carousel_button_text_he?.trim() || siteSettings?.testimonials_carousel_button_text_en?.trim()) && (
          <div className="text-center mt-8">
            <Link
              to={createPageUrl('Testimonials')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white hover:opacity-90 smooth-transition shadow-elegant hover-lift"
              style={{
                backgroundColor: siteSettings?.testimonials_carousel_button_bg_color || 'var(--primary-color)',
                color: siteSettings?.testimonials_carousel_button_text_color || '#ffffff'
              }}
            >
              {language === 'he' ? siteSettings.testimonials_carousel_button_text_he : siteSettings.testimonials_carousel_button_text_en}
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}