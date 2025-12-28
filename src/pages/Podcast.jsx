import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useSiteSettings } from '../components/SiteSettingsContext';
import { PodcastEpisode } from '@/entities/PodcastEpisode';
import { PlayCircle, Clock, Calendar, Headphones, Music, Youtube, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import MediaGallery from '../components/media/MediaGallery';
import HeroVideo from '../components/HeroVideo';
import TopCTABanner from '../components/shared/TopCTABanner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

/** טקסט מתקפל עם "הצג עוד/פחות" */
function CollapsibleText({
  text = '',
  lines = 5,
  moreLabel = 'Show more',
  lessLabel = 'Show less',
}) {
  const [expanded, setExpanded] = React.useState(false);
  if (!text?.trim()) return null;
  const canCollapse = text.length > 140;

  return (
    <div className="mb-4">
      <div 
        className={`${expanded ? '' : `line-clamp-${lines}`} text-opacity-70 text-[var(--text-color)] leading-relaxed`}
        dangerouslySetInnerHTML={{ __html: text || ''}}
      />
      {canCollapse && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-[var(--primary-color)] font-semibold hover:text-[var(--secondary-color)] smooth-transition"
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  );
}

export default function Podcast() {
  const { language, t, direction } = useLanguage();
  const { siteSettings } = useSiteSettings();
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // שינוי הסדר - עולה במקום יורד כדי שהמבוא יהיה ראשון
        const published = await PodcastEpisode.filter({ is_published: true }, 'order_index');
        setEpisodes(published);
      } catch (e) {
        console.log('No episodes found', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const platformIcons = { spotify: Music, apple: Headphones, youtube: Youtube, google: Smartphone };
  const platformColors = { spotify: '#1DB954', apple: '#A855F7', youtube: '#FF0000', google: '#4285F4' };

  const podcastMedia = siteSettings?.media_podcast || siteSettings?.page_media?.podcast || [];
  const podcastMediaPosition = siteSettings?.media_position_podcast || siteSettings?.page_media_position?.podcast || "center center";

  return (
    <div className="min-h-screen" style={{ backgroundColor: siteSettings?.podcast_bg_color || '#f8f9fa' }}>
      {/* Top CTA Banner */}
      <TopCTABanner />

      {/* Hero */}
      <section className="relative bg-white overflow-hidden min-h-[60vh] md:min-h-[70vh] flex items-center justify-center">
        {/* Hero Media - Desktop */}
        {podcastMedia && podcastMedia.length > 0 && (
          <div className="absolute inset-0 z-0 hidden md:block">
            <div className="w-full h-full">
              <HeroVideo
                media={podcastMedia}
                className="grid-cols-1 h-full md:h-[70vh] flex items-center justify-center"
                mediaPosition={podcastMediaPosition}
                mobileAsImage={false}
              />
            </div>
            <div className="absolute inset-0 bg-white/80 pointer-events-none" />
          </div>
        )}

        {/* Hero Media - Mobile */}
        {podcastMedia && podcastMedia.length > 0 && (
          <div className="absolute inset-0 z-0 block md:hidden">
            <div className="w-full h-full">
              <video
                src={podcastMedia[0]?.file_url}
                className="w-full h-full object-cover"
                style={{ objectPosition: podcastMediaPosition }}
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
          {(siteSettings?.podcast_page_title_he?.trim() || siteSettings?.podcast_page_title_en?.trim()) && (
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-8 pointer-events-auto">
              {language === 'he' ? siteSettings.podcast_page_title_he : siteSettings.podcast_page_title_en}
            </h1>
          )}
          {(siteSettings?.podcast_description_he?.trim() || siteSettings?.podcast_description_en?.trim()) && (
            <div 
              className="text-xl text-opacity-80 text-[var(--text-color)] leading-relaxed max-w-3xl mx-auto mb-8 pointer-events-auto"
              dangerouslySetInnerHTML={{ __html: language === 'he' ? siteSettings.podcast_description_he : siteSettings.podcast_description_en}}
            />
          )}

          {/* Platform Links */}
          <div className="flex flex-wrap justify-center gap-4 pointer-events-auto">
            {[
              { key: 'spotify', url: siteSettings?.podcast_spotify_url, label: 'Spotify' },
              { key: 'apple',   url: siteSettings?.podcast_apple_url,   label: 'Apple Podcasts' },
              { key: 'youtube', url: siteSettings?.podcast_youtube_url, label: 'YouTube' },
              { key: 'google',  url: siteSettings?.podcast_google_url,  label: 'Google Podcasts' },
            ].map(p => {
              if (!p.url?.trim()) return null;
              const Icon = platformIcons[p.key];
              return (
                <a
                  key={p.key}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold hover:opacity-90 smooth-transition shadow-elegant hover-lift"
                  style={{ backgroundColor: platformColors[p.key] }}
                >
                  <Icon className="w-5 h-5" />
                  {p.label}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Episodes */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto" />
              <p className="mt-4 text-opacity-60 text-[var(--text-color)]">
                {language === 'he' ? (siteSettings?.general_loading_he || 'טוען פרקים...') : (siteSettings?.general_loading_en || 'Loading episodes...')}
              </p>
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4">
                {language === 'he' ? (siteSettings?.general_coming_soon_he || 'בקרוב...') : (siteSettings?.general_coming_soon_en || 'Coming Soon...')}
              </h3>
              <p className="text-opacity-70 text-[var(--text-color)]">
                {t('אנחנו עובדות על פרקים מרתקים. הישארו מעודכנים!', "We're working on exciting episodes. Stay tuned!")}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {episodes.map((episode, index) => {
                const hasLinks = [episode.spotify_url, episode.apple_url, episode.youtube_url, episode.google_url].some(u => u && u.trim());
                
                return (
                  <div key={episode.id} className="bg-white rounded-2xl shadow-elegant hover-lift smooth-transition overflow-hidden flex flex-col">
                    {/* Featured Image */}
                    {episode.featured_image && (
                      <div className="aspect-video bg-gray-200 overflow-hidden flex items-center justify-center">
                        <img
                          src={episode.featured_image}
                          alt={language === 'he' ? episode.title_he : episode.title_en}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <span className="bg-[var(--primary-color)] text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {episode.episode_number === 0
                            ? (language === 'he' ? 'מבוא' : 'Intro')
                            : `${language === 'he' ? (siteSettings?.general_episode_he || 'פרק') : (siteSettings?.general_episode_en || 'Episode')} ${episode.episode_number}`}
                        </span>

                        {episode.duration && (
                          <div className="flex items-center gap-1 text-sm text-opacity-60 text-[var(--text-color)]">
                            <Clock className="w-4 h-4" />
                            <span>{episode.duration}</span>
                          </div>
                        )}

                        {episode.publish_date && (
                          <div className="flex items-center gap-1 text-sm text-opacity-60 text-[var(--text-color)]">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(episode.publish_date), 'dd/MM/yyyy')}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-[var(--text-color)] mb-3">
                        {language === 'he' ? episode.title_he : episode.title_en}
                      </h3>

                      <div className="flex-grow">
                        <CollapsibleText
                          text={language === 'he' ? (episode.description_he || '') : (episode.description_en || '')}
                          lines={5}
                          moreLabel={language === 'he' ? 'הצג עוד' : 'Show more'}
                          lessLabel={language === 'he' ? 'הצג פחות' : 'Show less'}
                        />
                      </div>

                      {hasLinks && (
                        <div className="flex justify-center mt-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold hover:opacity-90 smooth-transition shadow-lg bg-green-500 hover:bg-green-600">
                                <PlayCircle className="w-8 h-8" />
                                <span className="text-xl">{language === 'he' ? 'האזנה לפרק' : 'Listen to Episode'}</span>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-56">
                              {[
                                { key: 'spotify', url: episode.spotify_url, icon: Music, label: 'Spotify' },
                                { key: 'apple',   url: episode.apple_url,   icon: Headphones, label: 'Apple Podcasts' },
                                { key: 'youtube', url: episode.youtube_url, icon: Youtube, label: 'YouTube' },
                                { key: 'google',  url: episode.google_url,  icon: Smartphone, label: 'Google Podcasts' },
                              ].map(p => p.url?.trim() ? (
                                <DropdownMenuItem key={p.key} asChild>
                                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer w-full p-2">
                                    <p.icon className="w-4 h-4" />
                                    <span>{p.label}</span>
                                  </a>
                                </DropdownMenuItem>
                              ) : null)}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                    
                    {/* Gallery */}
                    <MediaGallery
                      media={episode.media_gallery}
                      className="grid-cols-1 place-items-center px-6 pb-6"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}