import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const SiteSettingsContext = createContext();

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

export const SiteSettingsProvider = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSiteSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all new settings entities in parallel
      const [
        globalRes, homeRes, aboutRes, personalRes, corporateRes,
        testimonialsRes, podcastRes, blogRes, contactRes
      ] = await Promise.all([
        base44.entities.GlobalSettings.list('-updated_date', 1),
        base44.entities.HomePageSettings.list('-updated_date', 1),
        base44.entities.AboutPageSettings.list('-updated_date', 1),
        base44.entities.PersonalPageSettings.list('-updated_date', 1),
        base44.entities.CorporatePageSettings.list('-updated_date', 1),
        base44.entities.TestimonialsPageSettings.list('-updated_date', 1),
        base44.entities.PodcastPageSettings.list('-updated_date', 1),
        base44.entities.BlogPageSettings.list('-updated_date', 1),
        base44.entities.ContactPageSettings.list('-updated_date', 1)
      ]);

      // Helper to get first item or empty object
      const getFirst = (arr) => arr && arr.length > 0 ? arr[0] : {};

      const global = getFirst(globalRes);
      const home = getFirst(homeRes);
      const about = getFirst(aboutRes);
      const personal = getFirst(personalRes);
      const corporate = getFirst(corporateRes);
      const testimonials = getFirst(testimonialsRes);
      const podcast = getFirst(podcastRes);
      const blog = getFirst(blogRes);
      const contact = getFirst(contactRes);

      // Fallback: If GlobalSettings is empty, try legacy SiteSettings
      if (Object.keys(global).length === 0) {
         console.log("New entities empty, trying legacy SiteSettings...");
         const legacyRes = await base44.entities.SiteSettings.list();
         if (legacyRes && legacyRes.length > 0) {
             setSiteSettings(legacyRes[0]);
         } else {
             setSiteSettings(null);
         }
      } else {
          // Build page_media and page_media_position objects from new structure
          const pageMedia = {
            home: home.media_home || [],
            home_features: home.media_home_features || [],
            about: about.media_about || [],
            personal_workshops: personal.media_personal_workshops || [],
            corporate_lectures_women: corporate.media_corporate_lectures_women || [],
            corporate_lectures_leaders: corporate.media_corporate_lectures_leaders || [],
            testimonials: testimonials.media_testimonials || [],
            podcast: podcast.media_podcast || [],
            blog: blog.media_blog || [],
            contact: contact.media_contact || [],
            logo_carousel_logos: global.media_logo_carousel_logos || []
          };

          const pageMediaPosition = {
            home: home.media_position_home,
            home_features: home.media_position_home_features,
            about: about.media_position_about,
            personal_workshops: personal.media_position_personal_workshops,
            corporate_lectures_women: corporate.media_position_corporate_lectures_women,
            corporate_lectures_leaders: corporate.media_position_corporate_lectures_leaders,
            testimonials: testimonials.media_position_testimonials,
            podcast: podcast.media_position_podcast,
            blog: blog.media_position_blog,
            contact: contact.media_position_contact
          };

          // Merge all settings into one object to maintain backward compatibility
          const mergedSettings = {
            ...global,
            ...home,
            ...about,
            ...personal,
            ...corporate,
            ...testimonials,
            ...podcast,
            ...blog,
            ...contact,
            page_media: pageMedia,
            page_media_position: pageMediaPosition,
            // Preserve IDs of individual records for updates if needed later
            id: global.id,
            global_id: global.id,
            home_id: home.id,
            about_id: about.id,
            personal_id: personal.id,
            corporate_id: corporate.id,
            testimonials_id: testimonials.id,
            podcast_id: podcast.id,
            blog_id: blog.id,
            contact_id: contact.id
          };
          setSiteSettings(mergedSettings);
      }

    } catch (error) {
      console.log('Error loading settings:', error);
      setSiteSettings(null);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSiteSettings();
  }, [loadSiteSettings]);

  const value = {
    siteSettings,
    reloadSettings: loadSiteSettings,
    loading
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};