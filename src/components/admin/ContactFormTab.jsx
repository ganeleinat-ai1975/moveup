import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useSiteSettings } from '../SiteSettingsContext';
import { SiteSettings } from '@/entities/SiteSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Save } from 'lucide-react';

export default function ContactFormTab() {
  const { language, t } = useLanguage();
  const { siteSettings, reloadSettings } = useSiteSettings();
  const [formData, setFormData] = React.useState({
    contact_form_title_he: '',
    contact_form_title_en: '',
    contact_form_subtitle_he: '',
    contact_form_subtitle_en: '',
    contact_form_success_title_he: '',
    contact_form_success_title_en: '',
    contact_form_success_message_he: '',
    contact_form_success_message_en: '',
    contact_form_success_button_he: '',
    contact_form_success_button_en: ''
  });

  React.useEffect(() => {
    if (siteSettings) {
      setFormData({
        contact_form_title_he: siteSettings.contact_form_title_he || 'בואי נכיר!',
        contact_form_title_en: siteSettings.contact_form_title_en || "Let's Connect!",
        contact_form_subtitle_he: siteSettings.contact_form_subtitle_he || 'נשמח לשמוע ממך ולעזור לך לפרוץ קדימה',
        contact_form_subtitle_en: siteSettings.contact_form_subtitle_en || "We'd love to hear from you and help you move forward",
        contact_form_success_title_he: siteSettings.contact_form_success_title_he || 'תודה רבה!',
        contact_form_success_title_en: siteSettings.contact_form_success_title_en || 'Thank You!',
        contact_form_success_message_he: siteSettings.contact_form_success_message_he || 'הפנייה שלך נשלחה בהצלחה. נחזור אלייך בהקדם!',
        contact_form_success_message_en: siteSettings.contact_form_success_message_en || 'Your inquiry has been sent successfully. We will get back to you soon!',
        contact_form_success_button_he: siteSettings.contact_form_success_button_he || 'שלחי פנייה נוספת',
        contact_form_success_button_en: siteSettings.contact_form_success_button_en || 'Send Another Inquiry'
      });
    }
  }, [siteSettings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      if (siteSettings?.id) {
        await SiteSettings.update(siteSettings.id, formData);
      } else {
        await SiteSettings.create(formData);
      }
      await reloadSettings();
      alert(t('הגדרות נשמרו בהצלחה!', 'Settings saved successfully!'));
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t('שגיאה בשמירת הגדרות', 'Error saving settings'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-[var(--primary-color)]" />
        <h2 className="text-2xl font-bold text-[var(--text-color)]">
          {t('ניהול טופס יצירת קשר', 'Contact Form Management')}
        </h2>
      </div>

      {/* כותרת הטופס */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[var(--text-color)]">
            {t('כותרת הטופס', 'Form Title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('כותרת בעברית', 'Title in Hebrew')}
            </label>
            <Input
              value={formData.contact_form_title_he}
              onChange={(e) => handleInputChange('contact_form_title_he', e.target.value)}
              placeholder="בואי נכיר!"
              className="text-right"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('כותרת באנגלית', 'Title in English')}
            </label>
            <Input
              value={formData.contact_form_title_en}
              onChange={(e) => handleInputChange('contact_form_title_en', e.target.value)}
              placeholder="Let's Connect!"
              className="text-left"
              dir="ltr"
            />
          </div>
        </CardContent>
      </Card>

      {/* כותרת משנה */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[var(--text-color)]">
            {t('כותרת משנה', 'Subtitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('כותרת משנה בעברית', 'Subtitle in Hebrew')}
            </label>
            <Textarea
              value={formData.contact_form_subtitle_he}
              onChange={(e) => handleInputChange('contact_form_subtitle_he', e.target.value)}
              placeholder="נשמח לשמוע ממך ולעזור לך לפרוץ קדימה"
              className="text-right"
              dir="rtl"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('כותרת משנה באנגלית', 'Subtitle in English')}
            </label>
            <Textarea
              value={formData.contact_form_subtitle_en}
              onChange={(e) => handleInputChange('contact_form_subtitle_en', e.target.value)}
              placeholder="We'd love to hear from you and help you move forward"
              className="text-left"
              dir="ltr"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* הודעת הצלחה */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[var(--text-color)]">
            {t('הודעת הצלחה', 'Success Message')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('כותרת הודעת הצלחה (עברית)', 'Success Title (Hebrew)')}
            </label>
            <Input
              value={formData.contact_form_success_title_he}
              onChange={(e) => handleInputChange('contact_form_success_title_he', e.target.value)}
              placeholder="תודה רבה!"
              className="text-right"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('כותרת הודעת הצלחה (אנגלית)', 'Success Title (English)')}
            </label>
            <Input
              value={formData.contact_form_success_title_en}
              onChange={(e) => handleInputChange('contact_form_success_title_en', e.target.value)}
              placeholder="Thank You!"
              className="text-left"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('תוכן הודעת הצלחה (עברית)', 'Success Message (Hebrew)')}
            </label>
            <Textarea
              value={formData.contact_form_success_message_he}
              onChange={(e) => handleInputChange('contact_form_success_message_he', e.target.value)}
              placeholder="הפנייה שלך נשלחה בהצלחה. נחזור אלייך בהקדם!"
              className="text-right"
              dir="rtl"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('תוכן הודעת הצלחה (אנגלית)', 'Success Message (English)')}
            </label>
            <Textarea
              value={formData.contact_form_success_message_en}
              onChange={(e) => handleInputChange('contact_form_success_message_en', e.target.value)}
              placeholder="Your inquiry has been sent successfully. We will get back to you soon!"
              className="text-left"
              dir="ltr"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('טקסט כפתור (עברית)', 'Button Text (Hebrew)')}
            </label>
            <Input
              value={formData.contact_form_success_button_he}
              onChange={(e) => handleInputChange('contact_form_success_button_he', e.target.value)}
              placeholder="שלחי פנייה נוספת"
              className="text-right"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('טקסט כפתור (אנגלית)', 'Button Text (English)')}
            </label>
            <Input
              value={formData.contact_form_success_button_en}
              onChange={(e) => handleInputChange('contact_form_success_button_en', e.target.value)}
              placeholder="Send Another Inquiry"
              className="text-left"
              dir="ltr"
            />
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave}
        className="bg-[var(--primary-color)] text-white hover:bg-[var(--secondary-color)] flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {t('שמור הגדרות', 'Save Settings')}
      </Button>
    </div>
  );
}