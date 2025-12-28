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
          // Merge all settings into one object to maintain backward compatibility
          const mergedSettings = {
            ...global,
            ...getFirst(homeRes),
            ...getFirst(aboutRes),
            ...getFirst(personalRes),
            ...getFirst(corporateRes),
            ...getFirst(testimonialsRes),
            ...getFirst(podcastRes),
            ...getFirst(blogRes),
            ...getFirst(contactRes),
            // Preserve IDs of individual records for updates if needed later (custom logic would be needed)
            id: global.id, // Main ID usually used
            global_id: global.id,
            home_id: getFirst(homeRes).id,
            about_id: getFirst(aboutRes).id,
            // ... etc
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