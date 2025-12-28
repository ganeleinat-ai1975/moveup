import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useSiteSettings } from '../components/SiteSettingsContext';
import { BlogPost } from '@/entities/BlogPost';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import MediaGallery from '../components/media/MediaGallery';
import TopCTABanner from '../components/shared/TopCTABanner';
import HeroVideo from '../components/HeroVideo';

export default function Blog() {
  const { language, t, direction } = useLanguage();
  const { siteSettings } = useSiteSettings();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // טוען את הפוסטים
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const blogPosts = await BlogPost.filter({ is_published: true }, 'order_index');
      setPosts(blogPosts);
    } catch (error) {
      console.log('No blog posts found yet', error);
    }
    setIsLoading(false);
  };

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const blogMedia = siteSettings?.media_blog || siteSettings?.page_media?.blog || [];
  const blogMediaPosition = siteSettings?.media_position_blog || siteSettings?.page_media_position?.blog || "center center";

  return (
    <div className="bg-[var(--background-color)] min-h-screen">
      {/* Top CTA Banner */}
      <TopCTABanner />

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden min-h-[60vh] md:min-h-[70vh] flex items-center justify-center">
        {/* Hero Media - Desktop */}
        {blogMedia && blogMedia.length > 0 && (
          <div className="absolute inset-0 z-0 hidden md:block">
            <div className="w-full h-full">
              <HeroVideo 
                media={blogMedia} 
                className="grid-cols-1 h-full md:h-[70vh] flex items-center justify-center"
                mediaPosition={blogMediaPosition}
                mobileAsImage={false}
              />
            </div>
            <div className="absolute inset-0 bg-white/80 pointer-events-none"></div>
          </div>
        )}

        {/* Hero Media - Mobile */}
        {blogMedia && blogMedia.length > 0 && (
          <div className="absolute inset-0 z-0 block md:hidden">
            <div className="w-full h-full">
              <video
                src={blogMedia[0]?.file_url}
                className="w-full h-full object-cover"
                style={{ objectPosition: blogMediaPosition }}
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
          {(siteSettings?.blog_page_title_he?.trim() || siteSettings?.blog_page_title_en?.trim()) && (
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-8 pointer-events-auto">
              {language === 'he' ? siteSettings.blog_page_title_he : siteSettings.blog_page_title_en}
            </h1>
          )}
          {(siteSettings?.blog_description_he?.trim() || siteSettings?.blog_description_en?.trim()) && (
            <div 
              className="text-xl text-opacity-80 text-[var(--text-color)] leading-relaxed pointer-events-auto"
              dangerouslySetInnerHTML={{ __html: language === 'he' ? siteSettings.blog_description_he : siteSettings.blog_description_en }}
            />
          )}
        </div>
      </section>

      {/* Blog Posts */}
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
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4">
                  {language === 'he' 
                    ? (siteSettings?.general_coming_soon_he || 'בקרוב...') 
                    : (siteSettings?.general_coming_soon_en || 'Coming Soon...')
                  }
                </h3>
                <p className="text-opacity-70 text-[var(--text-color)] mb-8">
                  {t(
                    'אנחנו עובדות על תכנים מרתקים שיעזרו לך בדרך להצלחה. חזרי בקרוב!',
                    "We're working on exciting content that will help you on your path to success. Come back soon!"
                  )}
                </p>
                <Link
                  to={createPageUrl('Contact')}
                  className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-full font-semibold hover:bg-[var(--secondary-color)] smooth-transition inline-flex items-center gap-2"
                >
                  {language === 'he' 
                    ? (siteSettings?.general_stay_updated_he || 'הישארי מעודכנת') 
                    : (siteSettings?.general_stay_updated_en || 'Stay Updated')
                  }
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl shadow-elegant hover-lift smooth-transition overflow-hidden">
                  {post.featured_image && (
                    <div className="aspect-video bg-gray-200 overflow-hidden flex items-center justify-center">
                      <img
                        src={post.featured_image}
                        alt={language === 'he' ? post.title_he : post.title_en}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  )}

                  <MediaGallery 
                    media={post.media_gallery} 
                    className="grid-cols-1 place-items-center px-6 pt-6"
                  />
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-opacity-60 text-[var(--text-color)] mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {post.publish_date ? format(new Date(post.publish_date), 'dd/MM/yyyy') : ''}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-[var(--text-color)] mb-3 line-clamp-2">
                      {language === 'he' ? post.title_he : post.title_en}
                    </h2>
                    
                    <div 
                      className="text-opacity-70 text-[var(--text-color)] mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: language === 'he' ? post.excerpt_he : post.excerpt_en }}
                    />
                    
                    {post.external_link ? (
                      <a
                        href={post.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--primary-color)] font-semibold hover:text-[var(--secondary-color)] smooth-transition flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {post.external_link.includes('youtube') || post.external_link.includes('video') ? 
                          (language === 'he' 
                            ? (siteSettings?.general_watch_video_he || 'צפה בסרטון') 
                            : (siteSettings?.general_watch_video_en || 'Watch Video')
                          ) : 
                          (language === 'he' 
                            ? (siteSettings?.general_read_more_he || 'קרא עוד') 
                            : (siteSettings?.general_read_more_en || 'Read More')
                          )
                        }
                      </a>
                    ) : (
                      // This button needs to be a Link or handle navigation to the post details page.
                      // For now, it's just a button. If a specific internal route is desired, 
                      // it should be added here. Assuming there isn't one defined yet for blog post details.
                      // If there was a route like /blog/:slug, it would be:
                      // <Link to={createPageUrl(`Blog/${post.slug}`)} className="...">
                      <button className="text-[var(--primary-color)] font-semibold hover:text-[var(--secondary-color)] smooth-transition flex items-center gap-2">
                        {language === 'he' 
                          ? (siteSettings?.general_read_more_he || 'קרא עוד') 
                          : (siteSettings?.general_read_more_en || 'Read More')
                        }
                        <ArrowIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}