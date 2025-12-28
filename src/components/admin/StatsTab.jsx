import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { useSiteSettings } from '../SiteSettingsContext';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, Mail, Send } from 'lucide-react';

export default function StatsTab() {
  const { language, t } = useLanguage();
  const { siteSettings, reloadSettings } = useSiteSettings();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStat, setNewStat] = useState({
    value: '',
    label_he: '',
    label_en: ''
  });
  const [totalNewslettersSent, setTotalNewslettersSent] = useState(0);
  const [totalEmailsSent, setTotalEmailsSent] = useState(0);

  useEffect(() => {
    if (siteSettings) {
      loadStats();
      loadNewsletterStats();
    }
  }, [siteSettings]);

  const loadStats = () => {
    if (siteSettings?.stats) {
      setStats(siteSettings.stats);
    } else {
      setStats([]);
    }
    setLoading(false);
  };

  const loadNewsletterStats = async () => {
    try {
      const logs = await base44.entities.NewsletterLogs.list();
      
      const successfulNewsletters = logs.filter(log => 
        log.status === 'נשלח בהצלחה' || (log.status && String(log.status).startsWith('נשלח חלקית'))
      );
      setTotalNewslettersSent(successfulNewsletters.length);

      const totalEmails = logs.reduce((sum, log) => {
        if (log.status === 'נשלח בהצלחה' || (log.status && String(log.status).startsWith('נשלח חלקית'))) {
          return sum + (log.recipients_count || 0);
        }
        return sum;
      }, 0);
      setTotalEmailsSent(totalEmails);
    } catch (error) {
      console.error('Error loading newsletter stats:', error);
    }
  };

  const handleSiteSettingChange = async (key, value) => {
    if (!siteSettings?.id) {
      console.error('Site settings ID is missing, cannot update.');
      alert(t('שגיאה: הגדרות האתר אינן זמינות.', 'Error: Site settings not available.'));
      return;
    }
    try {
      await base44.entities.SiteSettings.update(siteSettings.id, {
        [key]: value
      });
      await reloadSettings();
    } catch (error) {
      console.error(`Error updating site setting ${key}:`, error);
      alert(t('שגיאה בעדכון הגדרה', 'Error updating setting'));
    }
  };

  const handleAddStat = async () => {
    if (!newStat.value || !newStat.label_he || !newStat.label_en) {
      alert(t('אנא מלא/י את כל השדות עבור הנתון החדש.', 'Please fill in all fields for the new stat.'));
      return;
    }
    if (!siteSettings?.id) {
      console.error('Site settings ID is missing, cannot add stat.');
      alert(t('שגיאה: הגדרות האתר אינן זמינות.', 'Error: Site settings not available.'));
      return;
    }

    try {
      const updatedStats = [...(siteSettings.stats || []), newStat];
      await base44.entities.SiteSettings.update(siteSettings.id, {
        stats: updatedStats
      });
      await reloadSettings();
      setNewStat({ value: '', label_he: '', label_en: '' });
      alert(t('הסטטיסטיקה נוספה בהצלחה!', 'Stat added successfully!'));
    } catch (error) {
      console.error('Error adding stat:', error);
      alert(t('שגיאה בהוספת הסטטיסטיקה', 'Error adding stat'));
    }
  };

  const handleDeleteStat = async (index) => {
    if (!confirm(t('האם את/ה בטוח/ה שברצונך למחוק סטטיסטיקה זו?', 'Are you sure you want to delete this stat?'))) {
      return;
    }
    if (!siteSettings?.id) {
      console.error('Site settings ID is missing, cannot delete stat.');
      alert(t('שגיאה: הגדרות האתר אינן זמינות.', 'Error: Site settings not available.'));
      return;
    }

    try {
      const updatedStats = (siteSettings.stats || []).filter((_, i) => i !== index);
      await base44.entities.SiteSettings.update(siteSettings.id, {
        stats: updatedStats
      });
      await reloadSettings();
      alert(t('הסטטיסטיקה נמחקה בהצלחה', 'Stat deleted successfully'));
    } catch (error) {
      console.error('Error deleting stat:', error);
      alert(t('שגיאה במחיקת הסטטיסטיקה', 'Error deleting stat'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-color)] mb-4">
          {t('סטטיסטיקות ניוזלטר', 'Newsletter Statistics')}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-2">
                  {t('ניוזלטרים שנשלחו', 'Newsletters Sent')}
                </p>
                <p className="text-4xl font-bold text-blue-900">{totalNewslettersSent}</p>
              </div>
              <Mail className="w-12 h-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-2">
                  {t('סה"כ מיילים שנשלחו', 'Total Emails Sent')}
                </p>
                <p className="text-4xl font-bold text-green-900">{totalEmailsSent.toLocaleString()}</p>
              </div>
              <Send className="w-12 h-12 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[var(--text-color)] mb-4">
          {t('ניהול סטטיסטיקות לאתר', 'Manage Site Statistics')}
        </h2>

        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{t('אזור סטטיסטיקות', 'Stats Section Settings')}</h3>
          <p className="mt-1 text-sm text-gray-500 mb-6">{t('שלוט על סעיף הסטטיסטיקות בדף הבית ובעמוד ההמלצות.', 'Control the stats section on the homepage and testimonials page.')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label htmlFor="home_stats_section_bg_color" className="text-sm font-medium">{t('צבע רקע לאזור', 'Background Color')}</label>
            <div className="flex items-center gap-2">
              <input
                id="home_stats_section_bg_color"
                type="color"
                value={siteSettings?.home_stats_section_bg_color || ''}
                onChange={(e) => handleSiteSettingChange('home_stats_section_bg_color', e.target.value)}
                className="p-1 h-10 w-14 block bg-white border border-gray-300 rounded-md cursor-pointer"
              />
              <Input
                type="text"
                value={siteSettings?.home_stats_section_bg_color || ''}
                onChange={(e) => handleSiteSettingChange('home_stats_section_bg_color', e.target.value)}
                placeholder="#005e6c"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="home_stats_section_text_color" className="text-sm font-medium">{t('צבע טקסט', 'Text Color')}</label>
            <div className="flex items-center gap-2">
              <input
                id="home_stats_section_text_color"
                type="color"
                value={siteSettings?.home_stats_section_text_color || '#ffffff'}
                onChange={(e) => handleSiteSettingChange('home_stats_section_text_color', e.target.value)}
                className="p-1 h-10 w-14 block bg-white border border-gray-300 rounded-md cursor-pointer"
              />
              <Input
                type="text"
                value={siteSettings?.home_stats_section_text_color || '#ffffff'}
                onChange={(e) => handleSiteSettingChange('home_stats_section_text_color', e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <div className="space-y-2">
              <label htmlFor="stats_section_title_he" className="text-sm font-medium">{t('כותרת אזור סטטיסטיקות (עברית)', 'Stats Section Title (Hebrew)')}</label>
              <Input
                id="stats_section_title_he"
                value={siteSettings?.stats_section_title_he || ''}
                onChange={(e) => handleSiteSettingChange('stats_section_title_he', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="stats_section_title_en" className="text-sm font-medium">{t('כותרת אזור סטטיסטיקות (אנגלית)', 'Stats Section Title (English)')}</label>
              <Input
                id="stats_section_title_en"
                value={siteSettings?.stats_section_title_en || ''}
                onChange={(e) => handleSiteSettingChange('stats_section_title_en', e.target.value)}
              />
            </div>
        </div>

        <div className="space-y-4 mb-8 p-4 border rounded-md bg-gray-50">
          <h3 className="text-md font-medium">{t('הוסף נתון סטטיסטי חדש', 'Add New Statistic')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder={t('ערך (מספר/טקסט)', 'Value (number/text)')}
              value={newStat.value}
              onChange={(e) => setNewStat({ ...newStat, value: e.target.value })}
            />
            <Input
              placeholder={t('תווית (עברית)', 'Label (Hebrew)')}
              value={newStat.label_he}
              onChange={(e) => setNewStat({ ...newStat, label_he: e.target.value })}
            />
            <Input
              placeholder={t('תווית (אנגלית)', 'Label (English)')}
              value={newStat.label_en}
              onChange={(e) => setNewStat({ ...newStat, label_en: e.target.value })}
            />
          </div>
          <Button onClick={handleAddStat}>{t('הוסף נתון', 'Add Stat')}</Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-md font-medium">{t('נתונים סטטיסטיים קיימים', 'Existing Statistics')}</h3>
          {(stats || []).length === 0 ? (
            <p className="text-gray-500">{t('אין נתונים סטטיסטיים זמינים.', 'No statistics available.')}</p>
          ) : (
            (stats || []).map((stat, index) => (
              <div key={index} className="flex flex-col md:flex-row items-start gap-4 p-4 border rounded-md bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                    <Input
                        placeholder={t('ערך (מספר/טקסט)', 'Value (number/text)')}
                        value={stat.value || ''}
                        disabled 
                    />
                    <Input
                        placeholder={t('תווית (עברית)', 'Label (Hebrew)')}
                        value={stat.label_he || ''}
                        disabled
                    />
                    <Input
                        placeholder={t('תווית (אנגלית)', 'Label (English)')}
                        value={stat.label_en || ''}
                        disabled
                    />
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteStat(index)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}