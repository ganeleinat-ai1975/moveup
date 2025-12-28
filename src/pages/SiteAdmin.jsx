import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useSiteSettings } from '../components/SiteSettingsContext';
import { base44 } from '@/api/base44Client';
import { exportToGoogleSheets } from "@/functions/exportToGoogleSheets";
import { exportData } from "@/functions/exportData";
import { BlogPost } from '@/entities/BlogPost';
import { Testimonial } from '@/entities/Testimonial';
import { PersonalWorkshop } from '@/entities/PersonalWorkshop';
import { CorporateLecture } from '@/entities/CorporateLecture';
import { PodcastEpisode } from '@/entities/PodcastEpisode';
import { UploadFile } from '@/integrations/Core';
import {
  Save, Plus, Edit, Trash2, Palette, Type, Eye, Search, BarChart3, Code, Star, MessageSquare, Users,
  Building2, Briefcase, Home, Loader2, Image as ImageIcon, PanelBottom, Images, Mic, List, Info, User,
  Book, Mail, ArrowDown, Menu, Phone, Share2, Cog, Video as VideoIcon, TrendingUp, Award, Settings, FileText,
  Calendar, CheckCircle, ChevronDown, ChevronUp, Globe, Send, SlidersHorizontal, UserCircle, Youtube, BookOpen, X,
  Download, FileJson, Table, Database
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';


// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import MediaUploader from '../components/media/MediaUploader';
import MediaPositionSelector from '../components/media/MediaPositionSelector';
import IconSelector from '../components/admin/IconSelector';
import RichTextEditor from '../components/admin/RichTextEditor';
import CarouselOrderEditor from '../components/admin/CarouselOrderEditor';


const Section = ({ title, children, t }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">{title}</h3>
    {children}
  </div>
);

const InputField = ({ label, value, onChange, type = 'text', placeholder = '', className = '' }) => (
  <div>
    <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{label}</Label>
    <Input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`${className}`} />
  </div>
);

const RichTextField = ({ label, value, onChange }) => (
  <div>
    <Label className="block text-sm font-medium text-[var(--text-color)] mb-1">{label}</Label>
    <RichTextEditor value={value} onChange={onChange} />
  </div>
);

const ColorField = ({ label, value, onChange, t }) => (
  <div>
    <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{label}</Label>
    <Input type="color" value={value} onChange={onChange} className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg" />
  </div>
);

const AdminImageUploader = ({ value, onChange, label, t }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      onChange(file_url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(t('שגיאה בהעלאת הקובץ', 'File upload failed'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{label}</Label>
      <div className="flex items-center gap-4">
        <Label htmlFor={`upload-button-${label}`} className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[var(--secondary-color)] transition-colors text-sm">
          {isUploading ? t('מעלה...', 'Uploading...') : (value ? t('החלף תמונה', 'Replace Image') : t('העלה תמונה', 'Upload Image'))}
          <Input
            id={`upload-button-${label}`}
            type="file"
            accept="image/*,.svg"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
            disabled={isUploading}
          />
        </Label>
        {value && (
          <div className="p-2 border rounded-lg bg-gray-100">
            <img src={value} alt="Preview" className="h-10 w-auto object-contain" />
          </div>
        )}
      </div>
    </div>
  );
};


const SaveSettingsButton = ({ isSaving, handleSaveSettings, t }) => (
  <div className="pt-6">
    <Button
      onClick={handleSaveSettings}
      disabled={isSaving}
      className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--secondary-color)] smooth-transition flex items-center gap-2"
    >
      <Save className="w-4 h-4" />
      {isSaving ? t('שומר...', 'Saving...') : t('שמור הגדרות', 'Save Settings')}
    </Button>
  </div>
);


const BasicSettingsTab = ({ settings, onFieldChange, isSaving, handleSaveSettings, t }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-[var(--text-color)]">
      {t('הגדרות כלליות', 'General Settings')}
    </h2>

    <Section title={t('מידע בסיסי', 'Basic Information')} t={t}>
      <div className="grid md:grid-cols-2 gap-6">
        <InputField label={t('שם האתר - טקסט חלופי (עברית)', 'Site Name - Alt Text (Hebrew)')} value={settings.site_title_he || ''} onChange={(e) => onFieldChange('site_title_he', e.target.value)} placeholder="MOVEUP" />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('שם האתר - טקסט חלופי (אנגלית)', 'Site Name - Alt Text (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.site_title_en || ''}
            onChange={(e) => onFieldChange('site_title_en', e.target.value)}
            placeholder="MOVEUP"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <InputField label={t('משפט תיאור (עברית)', 'Tagline (Hebrew)')} value={settings.tagline_he || ''} onChange={(e) => onFieldChange('tagline_he', e.target.value)} placeholder="פורצות קדימה - העצמה אישית ומקצועית" />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('משפט תיאור (אנגלית)', 'Tagline (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.tagline_en || ''}
            onChange={(e) => onFieldChange('tagline_en', e.target.value)}
            placeholder="Breaking Forward - Personal and Professional Empowerment"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <AdminImageUploader label={t('לוגו (עברית)', 'Logo (Hebrew)')} value={settings.logo_url_he || ''} onChange={(url) => onFieldChange('logo_url_he', url)} t={t} />
        <AdminImageUploader label={t('לוגו (אנגלית)', 'Logo (English)')} value={settings.logo_url_en || ''} onChange={(url) => onFieldChange('logo_url_en', url)} t={t} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('אייקון - לא מופיע באתר', 'Favicon - Not visible on site')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.favicon_url || ''}
            onChange={(e) => onFieldChange('favicon_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
      </div>
    </Section>

    <Section title={t('בנר CTA עליון', 'Top CTA Banner')} t={t}>
      <div className="mb-6">
        <ColorField label={t('צבע רקע הבאנר', 'Banner Background Color')} value={settings.top_cta_bg_color || ''} onChange={(e) => onFieldChange('top_cta_bg_color', e.target.value)} t={t} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <InputField label={t('כותרת (עברית)', 'Title (Hebrew)')} value={settings.top_cta_title_he || ''} onChange={(e) => onFieldChange('top_cta_title_he', e.target.value)} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('כותרת (אנגלית)', 'Title (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.top_cta_title_en || ''}
            onChange={(e) => onFieldChange('top_cta_title_en', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <InputField label={t('כותרת משנה (עברית)', 'Subtitle (Hebrew)')} value={settings.top_cta_subtitle_he || ''} onChange={(e) => onFieldChange('top_cta_subtitle_he', e.target.value)} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('כותרת משנה (אנגלית)', 'Subtitle (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.top_cta_subtitle_en || ''}
            onChange={(e) => onFieldChange('top_cta_subtitle_en', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <InputField label={t('טקסט כפתור (עברית)', 'Button Text (Hebrew)')} value={settings.top_cta_button_he || ''} onChange={(e) => onFieldChange('top_cta_button_he', e.target.value)} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('טקסט כפתור (אנגלית)', 'Button Text (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.top_cta_button_en || ''}
            onChange={(e) => onFieldChange('top_cta_button_en', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
      </div>
    </Section>
    <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
  </div>
);

const ColorsAndFontsTab = ({ settings, onFieldChange, isSaving, handleSaveSettings, t }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-[var(--text-color)]">
      {t('עיצוב ואסתטיקה', 'Design & Aesthetics')}
    </h2>

    <Section title={t('צבעי האתר', 'Site Colors')} t={t}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <ColorField label={t('צבע ראשי', 'Primary Color')} value={settings.primary_color || ''} onChange={(e) => onFieldChange('primary_color', e.target.value)} t={t} />
        <ColorField label={t('צבע משני', 'Secondary Color')} value={settings.secondary_color || ''} onChange={(e) => onFieldChange('secondary_color', e.target.value)} t={t} />
        <ColorField label={t('צבע הדגשה', 'Accent Color')} value={settings.accent_color || ''} onChange={(e) => onFieldChange('accent_color', e.target.value)} t={t} />
        <ColorField label={t('צבע טקסט', 'Text Color')} value={settings.text_color || ''} onChange={(e) => onFieldChange('text_color', e.target.value)} t={t} />
        <ColorField label={t('צבע רקע', 'Background Color')} value={settings.background_color || ''} onChange={(e) => onFieldChange('background_color', e.target.value)} t={t} />
        <ColorField label={t('צבע רקע פוטר', 'Footer Background Color')} value={settings.footer_background_color || ''} onChange={(e) => onFieldChange('footer_background_color', e.target.value)} t={t} />
        <ColorField label={t('צבע טקסט פוטר', 'Footer Text Color')} value={settings.footer_text_color || ''} onChange={(e) => onFieldChange('footer_text_color', e.target.value)} t={t} />
        <ColorField label={t('צבע כותרות הפוטר', 'Footer Title Color')} value={settings.footer_title_color || ''} onChange={(e) => onFieldChange('footer_title_color', e.target.value)} t={t} />
        <ColorField label={t('צבע תפריט אדמין בהדר', 'Header Admin Menu Color')} value={settings.header_admin_menu_color || ''} onChange={(e) => onFieldChange('header_admin_menu_color', e.target.value)} t={t} />
      </div>
    </Section>

    <Section title={t('גופנים', 'Fonts')} t={t}>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('גופן עברית', 'Hebrew Font')}
          </Label>
          <select
            value={settings.font_family_he || 'Rubik'}
            onChange={(e) => onFieldChange('font_family_he', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 font-sans`}
          >
            <option value="Rubik">Rubik</option>
            <option value="Assistant">Assistant</option>
            <option value="Heebo">Heebo</option>
            <option value="Frank Ruhl Libre">Frank Ruhl Libre</option>
          </select>
        </div>
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('גופן אנגלית', 'English Font')}
          </Label>
          <select
            dir="ltr"
            value={settings.font_family_en || 'Inter'}
            onChange={(e) => onFieldChange('font_family_en', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 font-sans text-left`}
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Poppins">Poppins</option>
          </select>
        </div>
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('גודל גופן בסיסי', 'Base Font Size')}
          </Label>
          <select
            value={settings.font_size_base || '16px'}
            onChange={(e) => onFieldChange('font_size_base', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 font-sans`}
          >
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
          </select>
        </div>
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('עובי גופן מודגש', 'Bold Font Weight')}
          </Label>
          <select
            value={settings.font_weight_bold || '700'}
            onChange={(e) => onFieldChange('font_weight_bold', e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 font-sans`}
          >
            <option value="600">600</option>
            <option value="700">700</option>
            <option value="800">800</option>
            <option value="900">900</option>
          </select>
        </div>
      </div>
    </Section>
    <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
  </div>
);

const NavigationTab = ({ settings, onFieldChange, isSaving, handleSaveSettings, t }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-[var(--text-color)]">
      {t('ניהול שמות הדפים בניווט', 'Manage Page Names in Navigation')}
    </h2>
    <Section title={t('שמות דפים עבור תפריט הניווט', 'Page Names for Navigation Menu')} t={t}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <InputField label={t('דף הבית (עברית)', 'Home Page (Hebrew)')} value={settings.nav_home_he || ''} onChange={(e) => onFieldChange('nav_home_he', e.target.value)} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('Home Page (אנגלית)', 'Home Page (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.nav_home_en || ''}
            onChange={(e) => onFieldChange('nav_home_en', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <InputField label={t('אודות (עברית)', 'About (Hebrew)')} value={settings.nav_about_he || ''} onChange={(e) => onFieldChange('nav_about_he', e.target.value)} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('About (אנגלית)', 'About (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.nav_about_en || ''}
            onChange={(e) => onFieldChange('nav_about_en', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <InputField label={t('לפרטיות (עברית)', 'Personal (Hebrew)')} value={settings.nav_personal_he || ''} onChange={(e) => onFieldChange('nav_personal_he', e.target.value)} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('Personal (אנגלית)', 'Personal (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.nav_personal_en || ''}
            onChange={(e) => onFieldChange('nav_personal_en', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <InputField label={t('לארגונים (עברית)', 'Corporate (Hebrew)')} value={settings.nav_corporate_he || ''} onChange={(e) => onFieldChange('nav_corporate_he', e.target.value)} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('Corporate (אנגלית)', 'Corporate (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.nav_corporate_en || ''}
            onChange={(e) => onFieldChange('nav_corporate_en', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <InputField label={t('המלצות (עברית)', 'Testimonials (Hebrew)')} value={settings.nav_testimonials_he || ''} onChange={(e) => onFieldChange('nav_testimonials_he', e.target.value)} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('Testimonials (אנגלית)', 'Testimonials (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.nav_testimonials_en || ''}
            onChange={(e) => onFieldChange('nav_testimonials_en', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <InputField label={t('פודקסט (עברית)', 'Podcast (Hebrew)')} value={settings.nav_podcast_he || ''} onChange={(e) => onFieldChange('nav_podcast_he', e.target.value)} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('Podcast (אנגלית)', 'Podcast (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.nav_podcast_en || ''}
            onChange={(e) => onFieldChange('nav_podcast_en', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <InputField label={t('בלוג (עברית)', 'Blog (Hebrew)')} value={settings.nav_blog_he || ''} onChange={(e) => onFieldChange('nav_blog_he', e.target.value)} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('Blog (אנגלית)', 'Blog (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.nav_blog_en || ''}
            onChange={(e) => onFieldChange('nav_blog_en', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <InputField label={t('צור קשר (עברית)', 'Contact (Hebrew)')} value={settings.nav_contact_he || ''} onChange={(e) => onFieldChange('nav_contact_he', e.target.value)} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('Contact (אנגלית)', 'Contact (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={settings.nav_contact_en || ''}
            onChange={(e) => onFieldChange('nav_contact_en', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
      </div>
    </Section>
    <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
  </div>
);


const HomePageTab = ({ settings, onFieldChange, onMediaChange, onMediaPositionChange, isSaving, handleSaveSettings, t, onRichTextChange }) => {
  const features = useMemo(() => [
    { key: 1, icon: settings.feature_1_icon || 'Users', title_he: settings.feature_1_title_he, title_en: settings.feature_1_title_en, desc_he: settings.feature_1_desc_he, desc_en: settings.feature_1_desc_en, button_text_he: settings.feature_1_button_text_he, button_text_en: settings.feature_1_button_text_en, button_link: settings.feature_1_button_link },
    { key: 2, icon: settings.feature_2_icon || 'TrendingUp', title_he: settings.feature_2_title_he, title_en: settings.feature_2_title_en, desc_he: settings.feature_2_desc_he, desc_en: settings.feature_2_desc_en, button_text_he: settings.feature_2_button_text_he, button_text_en: settings.feature_2_button_text_en, button_link: settings.feature_2_button_link },
    { key: 3, icon: settings.feature_3_icon || 'Award', title_he: settings.feature_3_title_he, title_en: settings.feature_3_title_en, desc_he: settings.feature_3_desc_he, desc_en: settings.feature_3_desc_en, button_text_he: settings.feature_3_button_text_he, button_text_en: settings.feature_3_button_text_en, button_link: settings.feature_3_button_link }
  ], [settings]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[var(--text-color)]">
        {t('הגדרות עמוד הבית', 'Homepage Settings')}
      </h2>

      <Accordion type="single" collapsible className="w-full bg-white rounded-lg shadow-sm">
        <AccordionItem value="hero">
          <AccordionTrigger>{t('אזור פתיחה (Hero)', 'Hero Section')}</AccordionTrigger>
          <AccordionContent className="space-y-6 p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('כותרת ראשית (עברית)', 'Main Title (Hebrew)')} value={settings.hero_title_he || ''} onChange={(e) => onFieldChange('hero_title_he', e.target.value)} placeholder="פורצות קדימה" />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כותרת ראשית (אנגלית)', 'Main Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={settings.hero_title_en || ''}
                  onChange={(e) => onFieldChange('hero_title_en', e.target.value)}
                  placeholder="Breaking Forward"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <RichTextField label={t('כותרת משנה (עברית)', 'Subtitle (Hebrew)')} value={settings.hero_subtitle_he || ''} onChange={(value) => onRichTextChange('hero_subtitle_he', value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('כותרת משנה (אנגלית)', 'Subtitle (English)')}</Label>
                <div dir="ltr">
                  <RichTextEditor value={settings.hero_subtitle_en || ''} onChange={(value) => onRichTextChange('hero_subtitle_en', value)} />
                </div>
              </div>
            </div>
            <ColorField label={t('צבע כותרת משנה', 'Subtitle Color')} value={settings.hero_subtitle_color || ''} onChange={(e) => onFieldChange('hero_subtitle_color', e.target.value)} t={t} />
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('כפתור ראשי (עברית)', 'Primary Button (Hebrew)')} value={settings.hero_cta_primary_he || ''} onChange={(e) => onFieldChange('hero_cta_primary_he', e.target.value)} placeholder="הסדנאות שלנו" />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כפתור ראשי (אנגלית)', 'Primary Button (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={settings.hero_cta_primary_en || ''}
                  onChange={(e) => onFieldChange('hero_cta_primary_en', e.target.value)}
                  placeholder="Our Workshops"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
              <InputField label={t('כפתור משני (עברית)', 'Secondary Button (Hebrew)')} value={settings.hero_cta_secondary_he || ''} onChange={(e) => onFieldChange('hero_cta_secondary_he', e.target.value)} placeholder="קראי עלינו" />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כפתור משני (אנגלית)', 'Secondary Button (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={settings.hero_cta_secondary_en || ''}
                  onChange={(e) => onFieldChange('hero_cta_secondary_en', e.target.value)}
                  placeholder="Learn About Us"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">{t('מדיה לאזור הראשי (Hero)', 'Hero Section Media')}</h3>
            <MediaUploader
              media={settings.page_media || {}}
              sectionKey="home"
              onMediaChange={(updatedMedia) => onMediaChange('home', updatedMedia.home)}
            />
            <div className="mt-6">
              <MediaPositionSelector
                currentPosition={settings.page_media_position?.home || 'center center'}
                onPositionChange={(position) => onMediaPositionChange('home', position)}
                previewImage={settings.page_media?.home?.[0]?.file_url}
                t={t}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features">
          <AccordionTrigger>{t('אזור היתרונות', 'Features Section')}</AccordionTrigger>
          <AccordionContent className="space-y-6 p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('כותרת ראשית (עברית)', 'Main Title (Hebrew)')} value={settings.features_title_he || ''} onChange={(e) => onFieldChange('features_title_he', e.target.value)} t={t} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כותרת ראשית (אנגלית)', 'Main Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={settings.features_title_en || ''}
                  onChange={(e) => onFieldChange('features_title_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <RichTextField label={t('כותרת משנה (עברית)', 'Subtitle (Hebrew)')} value={settings.features_subtitle_he || ''} onChange={(value) => onRichTextChange('features_subtitle_he', value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('כותרת משנה (אנגלית)', 'Subtitle (English)')}</Label>
                <div dir="ltr">
                  <RichTextEditor value={settings.features_subtitle_en || ''} onChange={(value) => onRichTextChange('features_subtitle_en', value)} />
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full border rounded-lg mt-6">
              {features.map((feature) => (
                <AccordionItem value={`feature-${feature.key}`} key={feature.key}>
                  <AccordionTrigger className="px-4">{t(`יתרון ${feature.key}`, `Feature ${feature.key}`)}: {feature.title_he || ''}</AccordionTrigger>
                  <AccordionContent className="p-4 border-t space-y-4">
                    <h4 className="text-md font-medium text-[var(--text-color)] mb-2">{t('אייקון', 'Icon')}</h4>
                    <IconSelector selectedIcon={feature.icon} onIconSelect={(iconName) => onFieldChange(`feature_${feature.key}_icon`, iconName)} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField label={t('כותרת (עברית)', 'Title (Hebrew)')} value={feature.title_he || ''} onChange={(e) => onFieldChange(`feature_${feature.key}_title_he`, e.target.value)} t={t} />
                      <div>
                        <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                          {t('כותרת (אנגלית)', 'Title (English)')}
                        </Label>
                        <Input
                          type="text"
                          dir="ltr"
                          value={feature.title_en || ''}
                          onChange={(e) => onFieldChange(`feature_${feature.key}_title_en`, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <RichTextField label={t('תיאור (עברית)', 'Description (Hebrew)')} value={feature.desc_he || ''} onChange={(value) => onRichTextChange(`feature_${feature.key}_desc_he`, value)} />
                      <div>
                        <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תיאור (אנגלית)', 'Description (English)')}</Label>
                        <div dir="ltr">
                          <RichTextEditor value={feature.desc_en || ''} onChange={(value) => onRichTextChange(`feature_${feature.key}_desc_en`, value)} />
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4 mt-4 grid md:grid-cols-2 gap-4">
                        <div>
                            <InputField label={t('טקסט כפתור (עברית)', 'Button Text (Hebrew)')} value={feature.button_text_he || ''} onChange={(e) => onFieldChange(`feature_${feature.key}_button_text_he`, e.target.value)} t={t} />
                        </div>
                        <div>
                          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                            {t('טקסט כפתור (אנגלית)', 'Button Text (English)')}
                          </Label>
                          <Input
                            type="text"
                            dir="ltr"
                            value={feature.button_text_en || ''}
                            onChange={(e) => onFieldChange(`feature_${feature.key}_button_text_en`, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                          />
                        </div>
                        <div className="md:col-span-2">
                           <div>
                            <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                              {t('קישור כפתור (שם העמוד)', 'Button Link (Page Name)')}
                            </Label>
                            <Input
                              type="text"
                              dir="ltr"
                              value={feature.button_link || ''}
                              onChange={(e) => onFieldChange(`feature_${feature.key}_button_link`, e.target.value)}
                              placeholder="Contact"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                            />
                           </div>
                        </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
              <AccordionItem value="feature-4">
                <AccordionTrigger className="px-4">{t('יתרון 4: בוטית פורצות', 'Feature 4: Breakthrough Bot')}</AccordionTrigger>
                <AccordionContent className="p-4 border-t space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="feature_4_enabled" checked={settings.feature_4_enabled === true} onCheckedChange={(checked) => onFieldChange('feature_4_enabled', checked)} />
                    <Label htmlFor="feature_4_enabled">{t('הצג את הפיצ\'ר של הבוטית', 'Show Bot Feature')}</Label>
                  </div>
                  <h4 className="text-md font-medium text-[var(--text-color)] mb-2">{t('אייקון', 'Icon')}</h4>
                  <IconSelector selectedIcon={settings.feature_4_icon || 'Users'} onIconSelect={(icon) => onFieldChange('feature_4_icon', icon)} />
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField label={t('כותרת (עברית)', 'Title (Hebrew)')} value={settings.feature_4_title_he || ''} onChange={(e) => onFieldChange('feature_4_title_he', e.target.value)} t={t} />
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('כותרת (אנגלית)', 'Title (English)')}
                      </Label>
                      <Input
                        type="text"
                        dir="ltr"
                        value={settings.feature_4_title_en || ''}
                        onChange={(e) => onFieldChange('feature_4_title_en', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <RichTextField label={t('תיאור (עברית)', 'Description (Hebrew)')} value={settings.feature_4_desc_he || ''} onChange={(value) => onRichTextChange('feature_4_desc_he', value)} />
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תיאור (אנגלית)', 'Description (English)')}</Label>
                      <div dir="ltr">
                        <RichTextEditor value={settings.feature_4_desc_en || ''} onChange={(value) => onRichTextChange('feature_4_desc_en', value)} />
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4 mt-4 grid md:grid-cols-2 gap-4">
                      <div>
                          <InputField label={t('טקסט כפתור (עברית)', 'Button Text (Hebrew)')} value={settings.feature_4_button_text_he || ''} onChange={(e) => onFieldChange('feature_4_button_text_he', e.target.value)} t={t} />
                      </div>
                      <div>
                        <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                          {t('טקסט כפתור (אנגלית)', 'Button Text (English)')}
                        </Label>
                        <Input
                          type="text"
                          dir="ltr"
                          value={settings.feature_4_button_text_en || ''}
                          onChange={(e) => onFieldChange(`feature_4_button_text_en`, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                        />
                      </div>
                      <div className="md:col-span-2">
                         <div>
                          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                            {t('קישור כפתור (חיצוני)', 'Button Link (External)')}
                          </Label>
                          <Input
                            type="text"
                            dir="ltr"
                            value={settings.feature_4_button_link || ''}
                            onChange={(e) => onFieldChange(`feature_4_button_link`, e.target.value)}
                            placeholder="https://external-bot-link.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                          />
                         </div>
                      </div>
                  </div>
                  <AdminImageUploader label={t('תמונת רקע לכרטיס הבוטית', 'Bot Card Background Image URL')} value={settings.feature_4_bot_image || ''} onChange={(url) => onFieldChange('feature_4_bot_image', url)} t={t} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">{t('מedia לסקשן יתרונות', 'Features Section Media')}</h3>
              <MediaUploader
                media={settings.page_media || {}}
                sectionKey="home_features"
                onMediaChange={(updatedMedia) => onMediaChange('home_features', updatedMedia.home_features)}
              />
              <div className="mt-6">
                <MediaPositionSelector
                  currentPosition={settings.page_media_position?.home_features || 'center center'}
                  onPositionChange={(position) => onMediaPositionChange('home_features', position)}
                  previewImage={settings.page_media?.home_features?.[0]?.file_url}
                  t={t}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="workshops-carousel">
          <AccordionTrigger>{t('הגדרות קרוסלת סדנאות', 'Workshops Carousel Settings')}</AccordionTrigger>
          <AccordionContent className="space-y-6 p-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-white rounded-md border">
                <Label htmlFor="workshops-carousel-enabled" className="text-gray-700 font-medium cursor-pointer">
                  {t('הצג קרוסלה בעמוד הבית', 'Show carousel on homepage')}
                </Label>
                <Switch
                  id="workshops-carousel-enabled"
                  checked={settings.workshops_carousel_enabled || false}
                  onCheckedChange={(value) => onFieldChange('workshops_carousel_enabled', value)}
                />
              </div>
              {/* Added new switch for personal workshops */}
              <div className="flex items-center justify-between p-3 bg-white rounded-md border">
                <Label htmlFor="workshops-carousel-show-personal" className="text-gray-700 font-medium cursor-pointer">
                  {t('הצג סדנאות פרטיות בקרוסלה', 'Show Personal Workshops in Carousel')}
                </Label>
                <Switch
                  id="workshops-carousel-show-personal"
                  checked={settings.workshops_carousel_show_personal || false}
                  onCheckedChange={(value) => onFieldChange('workshops_carousel_show_personal', value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label={t('כותרת ראשית (עברית)', 'Main Title (Hebrew)')} value={settings.workshops_carousel_title_he || ''} onChange={(e) => onFieldChange('workshops_carousel_title_he', e.target.value)} />
                <div>
                  <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                    {t('כותרת ראשית (אנגלית)', 'Main Title (English)')}
                  </Label>
                  <Input
                    type="text"
                    dir="ltr"
                    value={settings.workshops_carousel_title_en || ''}
                    onChange={(e) => onFieldChange('workshops_carousel_title_en', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                  />
                </div>
                <RichTextField label={t('כותרת משנה (עברית)', 'Subtitle (Hebrew)')} value={settings.workshops_carousel_subtitle_he || ''} onChange={(value) => onRichTextChange('workshops_carousel_subtitle_he', value)} />
                <div>
                  <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('כותרת משנה (אנגלית)', 'Subtitle (English)')}</Label>
                  <div dir="ltr">
                    <RichTextEditor value={settings.workshops_carousel_subtitle_en || ''} onChange={(value) => onRichTextChange('workshops_carousel_subtitle_en', value)} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <ColorField label={t('צבע רקע', 'Background Color')} value={settings.workshops_carousel_bg_color || ''} onChange={(e) => onFieldChange('workshops_carousel_bg_color', e.target.value)} t={t} />
                <ColorField label={t('צבע טקסט לכותרות', 'Titles Text Color')} value={settings.workshops_carousel_text_color || ''} onChange={(e) => onFieldChange('workshops_carousel_text_color', e.target.value)} t={t} />
                <ColorField label={t('צבע רקע לכרטיסייה', 'Card Background Color')} value={settings.workshops_carousel_card_bg_color || ''} onChange={(e) => onFieldChange('workshops_carousel_card_bg_color', e.target.value)} t={t} />
              </div>
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('סדר הפריטים בקרוסלה', 'Carousel Item Order')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('גרור ושחרר כדי לסדר מחדש את הפריטים שיופיעו בקרוסלה. הסדר יישמר אוטומטית.', 'Drag and drop to reorder the items that will appear in the carousel. The order will be saved automatically.')}
                </p>
                <CarouselOrderEditor
                    siteSettings={settings}
                    onSettingsChange={onFieldChange}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Testimonials Carousel Section */}
        <AccordionItem value="testimonials-carousel">
          <AccordionTrigger>{t('אזור המלצות (דף הבית)', 'Testimonials Section (Homepage)')}</AccordionTrigger>
          <AccordionContent className="space-y-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label={t('כותרת ראשית (עברית)', 'Main Title (Hebrew)')} value={settings.testimonials_carousel_title_he || ''} onChange={(e) => onFieldChange('testimonials_carousel_title_he', e.target.value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כותרת ראשית (אנגלית)', 'Main Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={settings.testimonials_carousel_title_en || ''}
                  onChange={(e) => onFieldChange('testimonials_carousel_title_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
              <RichTextField label={t('כותרת משנה (עברית)', 'Subtitle (Hebrew)')} value={settings.testimonials_carousel_subtitle_he || ''} onChange={(value) => onRichTextChange('testimonials_carousel_subtitle_he', value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('כותרת משנה (אנגלית)', 'Subtitle (English)')}</Label>
                <div dir="ltr">
                  <RichTextEditor value={settings.testimonials_carousel_subtitle_en || ''} onChange={(value) => onRichTextChange('testimonials_carousel_subtitle_en', value)} />
                </div>
              </div>
              <ColorField label={t('צבע רקע', 'Background Color')} value={settings.testimonials_carousel_bg_color || ''} onChange={(e) => onFieldChange('testimonials_carousel_bg_color', e.target.value)} t={t} />
              <ColorField label={t('צבע טקסט', 'Text Color')} value={settings.testimonials_carousel_text_color || ''} onChange={(e) => onFieldChange('testimonials_carousel_text_color', e.target.value)} t={t} />
            </div>

            <div className="pt-4 mt-4 border-t">
              <h5 className="font-medium text-lg">{t('כפתור לדף המלצות', 'Button to Testimonials Page')}</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                 <InputField label={t('טקסט כפתור (עברית)', 'Button Text (Hebrew)')} value={settings.testimonials_carousel_button_text_he || ''} onChange={(e) => onFieldChange('testimonials_carousel_button_text_he', e.target.value)} />
                 <div>
                   <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                     {t('טקסט כפתור (אנגלית)', 'Button Text (English)')}
                   </Label>
                   <Input
                     type="text"
                     dir="ltr"
                     value={settings.testimonials_carousel_button_text_en || ''}
                     onChange={(e) => onFieldChange('testimonials_carousel_button_text_en', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                   />
                 </div>
                 <ColorField label={t('צבע רקע כפתור', 'Button Background Color')} value={settings.testimonials_carousel_button_bg_color || ''} onChange={(e) => onFieldChange('testimonials_carousel_button_bg_color', e.target.value)} t={t} />
                 <ColorField label={t('צבע טקסט כפתור', 'Button Text Color')} value={settings.testimonials_carousel_button_text_color || ''} onChange={(e) => onFieldChange('testimonials_carousel_button_text_color', e.target.value)} t={t} />
              </div>
            </div>

          </AccordionContent>
        </AccordionItem>

        {/* Stats Section */}
        <AccordionItem value="stats-section">
          <AccordionTrigger>{t('אזור סטטיסטיקות', 'Stats Section')}</AccordionTrigger>
          <AccordionContent className="space-y-6 p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('כותרת אזור סטטיסטיקות (עברית)', 'Stats Section Title (Hebrew)')} value={settings.stats_section_title_he || ''} onChange={(e) => onFieldChange('stats_section_title_he', e.target.value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כותרת אזור סטטיסטיקות (אנגלית)', 'Stats Section Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={settings.stats_section_title_en || ''}
                  onChange={(e) => onFieldChange('stats_section_title_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <ColorField label={t('צבע רקע לאזור', 'Background Color for Section')} value={settings.home_stats_section_bg_color || ''} onChange={(e) => onFieldChange('home_stats_section_bg_color', e.target.value)} t={t}/>
            {(settings.stats || []).map((stat, index) => (
              <div key={index} className="border p-4 rounded-lg flex items-center gap-4">
                <div className="grid md:grid-cols-3 gap-4 flex-grow">
                  <InputField label={t('ערך (מספר/טקסט)', 'Value (Number/Text)')} value={stat.value || ''} onChange={(e) => onFieldChange(`stats.${index}.value`, e.target.value)} />
                  <InputField label={t('תווית (עברית)', 'Label (Hebrew)')} value={stat.label_he || ''} onChange={(e) => onFieldChange(`stats.${index}.label_he`, e.target.value)} />
                  <div>
                    <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                      {t('תווית (אנגלית)', 'Label (English)')}
                    </Label>
                    <Input
                      type="text"
                      dir="ltr"
                      value={stat.label_en || ''}
                      onChange={(e) => onFieldChange(`stats.${index}.label_en`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                    />
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onFieldChange('stats', settings.stats.filter((_, i) => i !== index))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button onClick={() => onFieldChange('stats', [...(settings.stats || []), { value: '', label_he: '', label_en: '' }])}>
              <Plus className="w-4 h-4 mr-2" /> {t('הוסף סטטיסטיקה', 'Add Stat')}
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Call to Action Section */}
        <AccordionItem value="cta-section">
          <AccordionTrigger>{t('אזור קריאה לפעולה', 'Call to Action Section')}</AccordionTrigger>
          <AccordionContent className="space-y-6 p-4">
            <div className="grid md:grid-cols-2 gap-6">
              <InputField label={t('כותרת (עברית)', 'Title (Hebrew)')} value={settings.cta_section_title_he || ''} onChange={(e) => onFieldChange('cta_section_title_he', e.target.value)} placeholder="מוכנה להתחיל את המסע שלך?" />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כותרת (אנגלית)', 'Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={settings.cta_section_title_en || ''}
                  onChange={(e) => onFieldChange('cta_section_title_en', e.target.value)}
                  placeholder="Ready to Start Your Journey?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <RichTextField label={t('כותרת משנה (עברית)', 'Subtitle (Hebrew)')} value={settings.cta_section_subtitle_he || ''} onChange={(value) => onRichTextChange('cta_section_subtitle_he', value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('כותרת משנה (אנגלית)', 'Subtitle (English)')}</Label>
                <div dir="ltr">
                  <RichTextEditor value={settings.cta_section_subtitle_en || ''} onChange={(value) => onRichTextChange('cta_section_subtitle_en', value)} />
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <InputField label={t('טקסט כפתור (עברית)', 'Button Text (Hebrew)')} value={settings.cta_section_button_he || ''} onChange={(e) => onFieldChange('cta_section_button_he', e.target.value)} placeholder="צרי קשר עכשיו" />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('טקסט כפתור (אנגלית)', 'Button Text (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={settings.cta_section_button_en || ''}
                  onChange={(e) => onFieldChange('cta_section_button_en', e.target.value)}
                  placeholder="Contact Us Now"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
    </div>
  );
};

const AboutPageTab = ({ settings, handleUpdate, onMediaChange, onMediaPositionChange, isSaving, handleSaveSettings, t, onManagerChange, onAddManager, onRemoveManager, onRichTextChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[var(--text-color)]">
        {t('הגדרות עמוד אודות', 'About Page Settings')}
      </h2>

      <Section title={t('תוכן ראשי ומשימה', 'Main Content & Mission')} t={t}>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <InputField label={t('כותרת עמוד (עברית)', 'Page Title (Hebrew)')} value={settings.about_page_title_he || ''} onChange={(e) => handleUpdate('about_page_title_he', e.target.value)} placeholder="אודותינו" />
          <div>
            <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('כותרת עמוד (אנגלית)', 'Page Title (English)')}
            </Label>
            <Input
              type="text"
              dir="ltr"
              value={settings.about_page_title_en || ''}
              onChange={(e) => handleUpdate('about_page_title_en', e.target.value)}
              placeholder="About Us"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
            />
          </div>
          <RichTextField label={t('טקסט פתיחה (עברית)', 'Intro Text (Hebrew)')} value={settings.about_intro_text_he || ''} onChange={(value) => onRichTextChange('about_intro_text_he', value)} />
          <div>
            <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('טקסט פתיחה (אנגלית)', 'Intro Text (English)')}</Label>
            <div dir="ltr">
              <RichTextEditor value={settings.about_intro_text_en || ''} onChange={(value) => onRichTextChange('about_intro_text_en', value)} />
            </div>
          </div>
          
          <ColorField label={t('צבע רקע אזור טקסט פתיחה', 'Intro Text Section BG Color')} value={settings.about_intro_section_bg_color || ''} onChange={(e) => handleUpdate('about_intro_section_bg_color', e.target.value)} t={t} />
          <ColorField label={t('צבע טקסט אזור טקסט פתיחה', 'Intro Text Section Text Color')} value={settings.about_intro_text_color || ''} onChange={(e) => handleUpdate('about_intro_text_color', e.target.value)} t={t} />
          
          <InputField label={t('כותרת משימה (עברית)', 'Mission Title (Hebrew)')} value={settings.about_mission_title_he || ''} onChange={(e) => handleUpdate('about_mission_title_he', e.target.value)} placeholder="המשימה שלנו" />
          <div>
            <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('כותרת משימה (אנגלית)', 'Mission Title (English)')}
            </Label>
            <Input
              type="text"
              dir="ltr"
              value={settings.about_mission_title_en || ''}
              onChange={(e) => handleUpdate('about_mission_title_en', e.target.value)}
              placeholder="Our Mission"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
            />
          </div>
          <RichTextField label={t('טקסט משימה (עברית)', 'Mission Text (Hebrew)')} value={settings.about_mission_text_he || ''} onChange={(value) => onRichTextChange('about_mission_text_he', value)} />
          <div>
            <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('טקסט משימה (אנגלית)', 'Mission Text (English)')}</Label>
            <div dir="ltr">
              <RichTextEditor value={settings.about_mission_text_en || ''} onChange={(value) => onRichTextChange('about_mission_text_en', value)} />
            </div>
          </div>
        </div>
      </Section>

      <Section title={t('מדיה לאזור הראשי (Hero)', 'Hero Section Media')} t={t}>
        <MediaUploader
          media={settings.page_media || {}}
          sectionKey="about"
          onMediaChange={(updatedMedia) => onMediaChange('about', updatedMedia.about)}
        />
        <div className="mt-6">
          <MediaPositionSelector
            currentPosition={settings.page_media_position?.about || 'center center'}
            onPositionChange={(position) => onMediaPositionChange('about', position)}
            previewImage={settings.page_media?.about?.[0]?.file_url}
            t={t}
          />
        </div>
      </Section>

      <Section title={t('אזור המנהלות', 'Managers Section')} t={t}>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <InputField label={t('כותרת האזור (עברית)', 'Section Title (Hebrew)')} value={settings.managers_section_title_he || ''} onChange={(e) => handleUpdate('managers_section_title_he', e.target.value)} />
          <div>
            <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('כותרת האזור (אנגלית)', 'Section Title (English)')}
            </Label>
            <Input
              type="text"
              dir="ltr"
              value={settings.managers_section_title_en || ''}
              onChange={(e) => handleUpdate('managers_section_title_en', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <ColorField label={t('צבע רקע האזור', 'Background Color')} value={settings.managers_section_bg_color || ''} onChange={(e) => handleUpdate('managers_section_bg_color', e.target.value)} t={t} />
          <ColorField label={t('צבע טקסט', 'Text Color')} value={settings.managers_section_text_color || ''} onChange={(e) => handleUpdate('managers_section_text_color', e.target.value)} t={t} />
          <ColorField label={t('צבע כותרת', 'Title Color')} value={settings.managers_section_title_color || ''} onChange={(e) => handleUpdate('managers_section_title_color', e.target.value)} t={t} />
        </div>

        <div className="space-y-4">
          {(settings.managers || []).map((manager, index) => (
            <div key={manager.id || index} className="border rounded-lg p-4 space-y-4 relative">
              <h4 className="font-semibold">{t('מנהלת', 'Manager')} #{index + 1}</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <InputField label={t('שם (עברית)', 'Name (Hebrew)')} value={manager.manager_name_he || ''} onChange={(e) => onManagerChange(index, 'manager_name_he', e.target.value)} />
                <div>
                  <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                    {t('שם (אנגלית)', 'Name (English)')}
                  </Label>
                  <Input
                    type="text"
                    dir="ltr"
                    value={manager.manager_name_en || ''}
                    onChange={(e) => onManagerChange(index, 'manager_name_en', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                  />
                </div>
              </div>
              {/* Added Display Order for manager */}
              <InputField label={t('סדר הצגה', 'Display Order')} type="number" value={manager.order_index || 0} onChange={(e) => onManagerChange(index, 'order_index', parseInt(e.target.value) || 0)} />
              <div className="grid md:grid-cols-2 gap-4">
                <RichTextField label={t('טקסט (עברית)', 'Text (Hebrew)')} value={manager.manager_desc_he || ''} onChange={(value) => onManagerChange(index, 'manager_desc_he', onRichTextChange('', value, true))} />
                <div>
                  <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('טקסט (אנגלית)', 'Text (English)')}</Label>
                  <div dir="ltr">
                    <RichTextEditor value={manager.manager_desc_en || ''} onChange={(value) => onManagerChange(index, 'manager_desc_en', onRichTextChange('', value, true))} />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('תמונת מנהלת', 'Manager Image')}
                </Label>
                <MediaUploader
                  media={{ manager_media: manager.manager_media || [] }}
                  sectionKey={`manager_media_${index}`} // Unique key for each manager's media
                  onMediaChange={(updatedMedia) => onManagerChange(index, 'manager_media', updatedMedia[`manager_media_${index}`] || [])}
                />
              </div>
              <div className="mt-4">
                <MediaPositionSelector
                  currentPosition={manager.manager_media_position || 'center center'}
                  onPositionChange={(position) => onManagerChange(index, 'manager_media_position', position)}
                  previewImage={manager.manager_media?.[0]?.file_url}
                  t={t}
                />
              </div>
              <Button
                onClick={() => onRemoveManager(index)}
                className="absolute top-2 left-2 text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-full"
                variant="ghost" size="icon"
                aria-label={t('מחק מנהלת', 'Delete Manager')}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button onClick={onAddManager} className="mt-4 bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('הוסף מנהלת', 'Add Manager')}
        </Button>
      </Section>
      <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
    </div>
  );
};

function PersonalPageSettings({ settings, handleUpdate, onMediaChange, onMediaPositionChange, isSaving, handleSaveSettings, t, onRichTextChange }) {
  const firstImage = settings?.page_media?.personal_workshops?.[0]?.file_url;

  const onMediaChangeInternal = useCallback((sectionKey, mediaArray) => {
    handleUpdate('page_media', { ...settings.page_media, [sectionKey]: mediaArray });
  }, [settings.page_media, handleUpdate]);

  const onMediaPositionChangeInternal = useCallback((sectionKey, position) => {
    handleUpdate('page_media_position', { ...settings.page_media_position, [sectionKey]: position });
  }, [settings.page_media_position, handleUpdate]);


  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[var(--text-color)]">
        {t('הגדרות עמוד "לפרטיות"', 'Personal Page Settings')}
      </h2>

      <Section title={t('אזור עליון (Hero)', 'Hero Section')} t={t}>
        <div className="grid md:grid-cols-2 gap-6">
          <InputField label={t('כותרת עמוד (עברית)', 'Page Title (Hebrew)')} value={settings.personal_page_title_he || ''} onChange={(e) => handleUpdate('personal_page_title_he', e.target.value)} placeholder="סדנאות לפרטיות" />
          <div>
            <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('כותרת עמוד (אנגלית)', 'Page Title (English)')}
            </Label>
            <Input
              type="text"
              dir="ltr"
              value={settings.personal_page_title_en || ''}
              onChange={(e) => handleUpdate('personal_page_title_en', e.target.value)}
              placeholder="Personal Workshops"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
            />
          </div>
          <RichTextField label={t('תיאור עמוד (עברית)', 'Page Description (Hebrew)')} value={settings.personal_description_he || ''} onChange={(value) => onRichTextChange('personal_description_he', value)} />
          <div>
            <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תיאור עמוד (אנגלית)', 'Page Description (English)')}</Label>
            <div dir="ltr">
              <RichTextEditor value={settings.personal_description_en || ''} onChange={(value) => onRichTextChange('personal_description_en', value)} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <MediaUploader
            media={settings.page_media || {}}
            sectionKey="personal_workshops"
            onMediaChange={(updatedMedia) => onMediaChangeInternal('personal_workshops', updatedMedia.personal_workshops)}
          />
        </div>
        <div className="mt-6">
          <MediaPositionSelector
            currentPosition={settings.page_media_position?.personal_workshops || 'center center'}
            onPositionChange={(position) => onMediaPositionChangeInternal('personal_workshops', position)}
            previewImage={firstImage}
            t={t}
          />
        </div>
      </Section>

      <Section title={t("אזור יתרונות", "Benefits Area")} t={t}>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
            <InputField
                label={t("כותרת אזור יתרונות (עברית)", "Benefits Area Title (Hebrew)")}
                value={settings.personal_benefits_title_he || ''}
                onChange={(e) => handleUpdate('personal_benefits_title_he', e.target.value)}
            />
            <div>
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                {t("כותרת אזור יתרונות (אנגלית)", "Benefits Area Title (English)")}
              </Label>
              <Input
                type="text"
                dir="ltr"
                value={settings.personal_benefits_title_en || ''}
                onChange={(e) => handleUpdate('personal_benefits_title_en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
              />
            </div>
        </div>

        <Accordion type="single" collapsible className="w-full mt-4">
            {[1, 2, 3].map(i => (
                <AccordionItem key={i} value={`benefit-${i}`}>
                    <AccordionTrigger className="px-4">{t(`יתרון ${i}`, `Benefit ${i}`)}</AccordionTrigger>
                    <AccordionContent className="space-y-4 p-4">
                        <h4 className="text-md font-medium text-[var(--text-color)] mb-2">{t('אייקון', 'Icon')}</h4>
                        <IconSelector
                            selectedIcon={settings[`personal_benefit_${i}_icon`] || 'CheckCircle'}
                            onIconSelect={(iconName) => handleUpdate(`personal_benefit_${i}_icon`, iconName)}
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                            <InputField label={t('כותרת (עברית)', 'Title (Hebrew)')} value={settings[`personal_benefit_${i}_title_he`] || ''} onChange={(e) => handleUpdate(`personal_benefit_${i}_title_he`, e.target.value)} />
                            <div>
                              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                                {t('כותרת (אנגלית)', 'Title (English)')}
                              </Label>
                              <Input
                                type="text"
                                dir="ltr"
                                value={settings[`personal_benefit_${i}_title_en`] || ''}
                                onChange={(e) => handleUpdate(`personal_benefit_${i}_title_en`, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                              />
                            </div>
                        </div>
                        <RichTextField label={t('תיאור (עברית)', 'Description (Hebrew)')} value={settings[`personal_benefit_${i}_desc_he`] || ''} onChange={(value) => onRichTextChange(`personal_benefit_${i}_desc_he`, value)} />
                        <div>
                          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תיאור (אנגלית)', 'Description (English)')}</Label>
                          <div dir="ltr">
                            <RichTextEditor value={settings[`personal_benefit_${i}_desc_en`] || ''} onChange={(value) => onRichTextChange(`personal_benefit_${i}_desc_en`, value)} />
                          </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </Section>
      <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
    </div>
  );
}

const CorporatePageTab = ({ settings, handleSettingsChange, onMediaChange, onMediaPositionChange, isSaving, handleSaveSettings, t, onCorporatePageChange, onRichTextChange }) => {
    const [activeTab, setActiveTab] = useState('women'); // State for corporate sub-tabs

    const pageKey = activeTab === 'women' ? 'women' : 'leaders';
    const corporatePages = settings.corporate_pages || { women: {}, leaders: {} };
    const pageData = corporatePages[pageKey] || {};

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--text-color)]">
              {t('הגדרות עמוד "לארגונים"', 'Corporate Page Settings')}
            </h2>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="women">{t('לנשים עובדות ומנהלות', 'For Working Women & Managers')}</TabsTrigger>
                    <TabsTrigger value="leaders">{t('לדרג ניהולי', 'For Management Level')}</TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab} className="pt-4 space-y-6">
                    <Section title={t(`הגדרות עמוד 'לארגונים - ${t(pageKey === 'women' ? 'נשים' : 'מנהלים', pageKey === 'women' ? 'Women' : 'Leaders')}'`, `Page Settings 'Corporate - ${pageKey === 'women' ? 'Women' : 'Leaders'}'`)} t={t}>
                        <div className="grid md:grid-cols-2 gap-4">
                            <InputField
                                label={t("כותרת ראשית (עברית)", "Main Title (Hebrew)")}
                                value={pageData.title_he || ''}
                                onChange={(e) => onCorporatePageChange(pageKey, 'title_he', e.target.value)}
                            />
                            <div>
                              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                                {t("כותרת ראשית (אנגלית)", "Main Title (English)")}
                              </Label>
                              <Input
                                type="text"
                                dir="ltr"
                                value={pageData.title_en || ''}
                                onChange={(e) => onCorporatePageChange(pageKey, 'title_en', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                              />
                            </div>
                        </div>
                        <RichTextField
                            label={t("תיאור (עברית)", "Description (Hebrew)")}
                            value={pageData.description_he || ''}
                            onChange={(value) => onCorporatePageChange(pageKey, 'description_he', onRichTextChange('', value, true))}
                        />
                        <div>
                          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t("תיאור (אנגלית)", "Description (English)")}</Label>
                          <div dir="ltr">
                            <RichTextEditor
                                value={pageData.description_en || ''}
                                onChange={(value) => onCorporatePageChange(pageKey, 'description_en', onRichTextChange('', value, true))}
                            />
                          </div>
                        </div>
                    </Section>

                    <Section title={t('מmedia לעמוד (Hero)', 'Page Media (Hero)')} t={t}>
                        <MediaUploader
                            media={settings.page_media || {}}
                            sectionKey={pageKey === 'women' ? 'corporate_lectures_women' : 'corporate_lectures_leaders'}
                            onMediaChange={(updatedMedia) => onMediaChange(pageKey === 'women' ? 'corporate_lectures_women' : 'corporate_lectures_leaders', updatedMedia[pageKey === 'women' ? 'corporate_lectures_women' : 'corporate_lectures_leaders'])}
                        />
                        <div className="mt-6">
                            <MediaPositionSelector
                                currentPosition={settings.page_media_position?.[pageKey === 'women' ? 'corporate_lectures_women' : 'corporate_lectures_leaders'] || 'center center'}
                                onPositionChange={(position) => onMediaPositionChange(pageKey === 'women' ? 'corporate_lectures_women' : 'corporate_lectures_leaders', position)}
                                previewImage={settings.page_media?.[pageKey === 'women' ? 'corporate_lectures_women' : 'corporate_lectures_leaders']?.[0]?.file_url}
                                t={t}
                            />
                        </div>
                    </Section>

                    <Section title={t("אזור יתרונות", "Benefits Area")} t={t}>
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <InputField
                                label={t("כותרת אזור יתרונות (עברית)", "Benefits Area Title (Hebrew)")}
                                value={pageData.benefits_title_he || ''}
                                onChange={(e) => onCorporatePageChange(pageKey, 'benefits_title_he', e.target.value)}
                            />
                            <div>
                              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                                {t("כותרת אזור יתרונות (אנגלית)", "Benefits Area Title (English)")}
                              </Label>
                              <Input
                                type="text"
                                dir="ltr"
                                value={pageData.benefits_title_en || ''}
                                onChange={(e) => onCorporatePageChange(pageKey, 'benefits_title_en', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                              />
                            </div>
                        </div>

                        <Accordion type="single" collapsible className="w-full mt-4">
                            {[1, 2, 3].map(i => (
                                <AccordionItem key={i} value={`benefit-${i}`}>
                                    <AccordionTrigger className="px-4">{t(`יתרון ${i}`, `Benefit ${i}`)}</AccordionTrigger>
                                    <AccordionContent className="space-y-4 p-4">
                                        <h4 className="text-md font-medium text-[var(--text-color)] mb-2">{t('אייקון', 'Icon')}</h4>
                                        <IconSelector
                                            selectedIcon={pageData[`benefit_${i}_icon`]}
                                            onIconSelect={(icon) => onCorporatePageChange(pageKey, `benefit_${i}_icon`, icon)}
                                        />
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <InputField label={t('כותרת (עברית)', 'Title (Hebrew)')} value={pageData[`benefit_${i}_title_he`] || ''} onChange={(e) => onCorporatePageChange(pageKey, `benefit_${i}_title_he`, e.target.value)} />
                                            <div>
                                              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                                                {t('כותרת (אנגלית)', 'Title (English)')}
                                              </Label>
                                              <Input
                                                type="text"
                                                dir="ltr"
                                                value={pageData[`benefit_${i}_title_en`] || ''}
                                                onChange={(e) => onCorporatePageChange(pageKey, `benefit_${i}_title_en`, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                                              />
                                            </div>
                                        </div>
                                        <RichTextField label={t('תיאור (עברית)', 'Description (Hebrew)')} value={pageData[`benefit_${i}_desc_he`] || ''} onChange={(value) => onCorporatePageChange(pageKey, `benefit_${i}_desc_he`, onRichTextChange('', value, true))} />
                                        <div>
                                          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תיאור (אנגלית)', 'Description (English)')}</Label>
                                          <div dir="ltr">
                                            <RichTextEditor value={pageData[`benefit_${i}_desc_en`] || ''} onChange={(value) => onCorporatePageChange(pageKey, `benefit_${i}_desc_en`, onRichTextChange('', value, true))} />
                                          </div>
                                        </div>
                                    </AccordionContent>
                               - </AccordionItem>
                            ))}
                        </Accordion>
                    </Section>
                </TabsContent>
            </Tabs>
            <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
        </div>
    );
};

const TestimonialsPageTab = ({ settings, handleUpdate, onMediaChange, onMediaPositionChange, isSaving, handleSaveSettings, t, onRichTextChange }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--text-color)]">
              {t('הגדרות עמוד המלצות', 'Testimonials Page Settings')}
            </h2>
            <Section title={t('תוכן עיקרי', 'Main Content')} t={t}>
                <div className="grid md:grid-cols-2 gap-4">
                    <InputField label={t('כותרת עמוד (עברית)', 'Page Title (Hebrew)')} value={settings.testimonials_page_title_he || ''} onChange={(e) => handleUpdate('testimonials_page_title_he', e.target.value)} placeholder="לקוחות ממליצים" />
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('כותרת עמוד (אנגלית)', 'Page Title (English)')}
                      </Label>
                      <Input
                        type="text"
                        dir="ltr"
                        value={settings.testimonials_page_title_en || ''}
                        onChange={(e) => handleUpdate('testimonials_page_title_en', e.target.value)}
                        placeholder="Client Testimonials"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                </div>
                <RichTextField label={t('תיאור העמוד (עברית)', 'Page Description (Hebrew)')} value={settings.testimonials_description_he || ''} onChange={(value) => onRichTextChange('testimonials_description_he', value)} />
                <div>
                  <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תיאור העמוד (אנגלית)', 'Page Description (English)')}</Label>
                  <div dir="ltr">
                    <RichTextEditor value={settings.testimonials_description_en || ''} onChange={(value) => onRichTextChange('testimonials_description_en', value)} />
                  </div>
                </div>
            </Section>

            <Section title={t('מדיה לעמוד (Hero)', 'Page Media (Hero)')} t={t}>
                <MediaUploader
                    media={settings.page_media || {}}
                    sectionKey="testimonials"
                    onMediaChange={(updatedMedia) => onMediaChange('testimonials', updatedMedia.testimonials)}
                />
                <div className="mt-6">
                    <MediaPositionSelector
                        currentPosition={settings.page_media_position?.testimonials || 'center center'}
                        onPositionChange={(position) => onMediaPositionChange('testimonials', position)}
                        previewImage={settings.page_media?.testimonials?.[0]?.file_url}
                        t={t}
                    />
                </div>
            </Section>
            <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
        </div>
    );
};

const BlogPageTab = ({ settings, handleUpdate, onMediaChange, onMediaPositionChange, isSaving, handleSaveSettings, t, onRichTextChange }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--text-color)]">
              {t('הגדרות עמוד בלוג', 'Blog Page Settings')}
            </h2>
            <Section title={t('תוכן עמוד בלוג', 'Blog Page Content')} t={t}>
                <div className="grid md:grid-cols-2 gap-4">
                    <InputField label={t('כותרת עמוד בלוג (עברית)', 'Blog Page Title (Hebrew)')} value={settings.blog_page_title_he || ''} onChange={(e) => handleUpdate('blog_page_title_he', e.target.value)} placeholder="בלוג וכתבות" />
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('כותרת עמוד בלוג (אנגלית)', 'Blog Page Title (English)')}
                      </Label>
                      <Input
                        type="text"
                        dir="ltr"
                        value={settings.blog_page_title_en || ''}
                        onChange={(e) => handleUpdate('blog_page_title_en', e.target.value)}
                        placeholder="Blog & Articles"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                </div>
                <RichTextField label={t('תיאור עמוד בלוג (עברית)', 'Blog Page Description (Hebrew)')} value={settings.blog_description_he || ''} onChange={(value) => onRichTextChange('blog_description_he', value)} />
                <div>
                  <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תיאור עמוד בלוג (אנגלית)', 'Blog Page Description (English)')}</Label>
                  <div dir="ltr">
                    <RichTextEditor value={settings.blog_description_en || ''} onChange={(value) => onRichTextChange('blog_description_en', value)} />
                  </div>
                </div>
            </Section>

            <Section title={t('מדיה לעמוד בלוג (Hero)', 'Blog Page Media (Hero)')} t={t}>
                <MediaUploader
                    media={settings.page_media || {}}
                    sectionKey="blog"
                    onMediaChange={(updatedMedia) => onMediaChange('blog', updatedMedia.blog)}
                />
                <div className="mt-6">
                    <MediaPositionSelector
                        currentPosition={settings.page_media_position?.blog || 'center center'}
                        onPositionChange={(position) => onMediaPositionChange('blog', position)}
                        previewImage={settings.page_media?.blog?.[0]?.file_url}
                        t={t}
                    />
                </div>
            </Section>
            <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
        </div>
    );
};

const PodcastPageTab = ({ settings, handleUpdate, onMediaChange, onMediaPositionChange, isSaving, handleSaveSettings, t, onRichTextChange }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--text-color)]">
              {t('הגדרות עמוד פודקסט', 'Podcast Page Settings')}
            </h2>
            <Section title={t('תוכן עמוד פודקסט', 'Podcast Page Content')} t={t}>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <InputField label={t('כותרת עמוד (עברית)', 'Page Title (Hebrew)')} value={settings.podcast_page_title_he || ''} onChange={(e) => handleUpdate('podcast_page_title_he', e.target.value)} placeholder="פודקסט פורצות קדימה" />
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('כותרת עמוד (אנגלית)', 'Page Title (English)')}
                      </Label>
                      <Input
                        type="text"
                        dir="ltr"
                        value={settings.podcast_page_title_en || ''}
                        onChange={(e) => handleUpdate('podcast_page_title_en', e.target.value)}
                        placeholder="Breaking Forward Podcast"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                    <RichTextField label={t('תיאור עמוד (עברית)', 'Page Description (Hebrew)')} value={settings.podcast_description_he || ''} onChange={(value) => onRichTextChange('podcast_description_he', value)} />
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תיאור עמוד (אנגלית)', 'Page Description (English)')}</Label>
                      <div dir="ltr">
                        <RichTextEditor value={settings.podcast_description_en || ''} onChange={(value) => onRichTextChange('podcast_description_en', value)} />
                      </div>
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-[var(--text-color)] mt-6 mb-4">{t('קישורים לפלטפורמות', 'Platform Links')}</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('קישור לספוטיפיי', 'Spotify URL')}
                      </Label>
                      <Input
                        type="url"
                        dir="ltr"
                        value={settings.podcast_spotify_url || ''}
                        onChange={(e) => handleUpdate('podcast_spotify_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('קישור לאפל פודקסט', 'Apple Podcasts URL')}
                      </Label>
                      <Input
                        type="url"
                        dir="ltr"
                        value={settings.podcast_apple_url || ''}
                        onChange={(e) => handleUpdate('podcast_apple_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('קישור ליוטיוב', 'YouTube URL')}
                      </Label>
                      <Input
                        type="url"
                        dir="ltr"
                        value={settings.podcast_youtube_url || ''}
                        onChange={(e) => handleUpdate('podcast_youtube_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('קישור לגוגל פודקסט', 'Google Podcasts URL')}
                      </Label>
                      <Input
                        type="url"
                        dir="ltr"
                        value={settings.podcast_google_url || ''}
                        onChange={(e) => handleUpdate('podcast_google_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-[var(--text-color)] mt-6 mb-4">{t('עיצוב ומדיה', 'Design & Media')}</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <ColorField label={t('צבע רקע העמוד', 'Page Background Color')} value={settings.podcast_bg_color || ''} onChange={(e) => handleUpdate('podcast_bg_color', e.target.value)} t={t} />
                </div>

                <MediaUploader
                    media={settings.page_media || {}}
                    sectionKey="podcast"
                    onMediaChange={(updatedMedia) => onMediaChange('podcast', updatedMedia.podcast)}
                />
                <div className="mt-6">
                    <MediaPositionSelector
                        currentPosition={settings.page_media_position?.podcast || 'center center'}
                        onPositionChange={(position) => onMediaPositionChange('podcast', position)}
                        previewImage={settings.page_media?.podcast?.[0]?.file_url}
                        t={t}
                    />
                </div>
            </Section>
            <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
        </div>
    );
};

const ContactPageTab = ({ settings, handleUpdate, onMediaChange, onMediaPositionChange, isSaving, handleSaveSettings, t, onRichTextChange }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--text-color)]">
              {t('הגדרות עמוד צור קשר', 'Contact Page Settings')}
            </h2>

            <Section title={t('תוכן עמוד צור קשר', 'Contact Page Content')} t={t}>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <InputField label={t('כותרת עמוד (עברית)', 'Page Title (Hebrew)')} value={settings.contact_page_title_he || ''} onChange={(e) => handleUpdate('contact_page_title_he', e.target.value)} placeholder="צור קשר" />
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('כותרת עמוד (אנגלית)', 'Page Title (English)')}
                      </Label>
                      <Input
                        type="text"
                        dir="ltr"
                        value={settings.contact_page_title_en || ''}
                        onChange={(e) => handleUpdate('contact_page_title_en', e.target.value)}
                        placeholder="Contact Us"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <RichTextField label={t('כותרת משנה (עברית)', 'Subtitle (Hebrew)')} value={settings.contact_page_subtitle_he || ''} onChange={(value) => onRichTextChange('contact_page_subtitle_he', value)} />
                  <div>
                    <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('כותרת משנה (אנגלית)', 'Subtitle (English)')}</Label>
                    <div dir="ltr">
                      <RichTextEditor value={settings.contact_page_subtitle_en || ''} onChange={(value) => onRichTextChange('contact_page_subtitle_en', value)} />
                    </div>
                  </div>
                </div>
            </Section>

            <Section title={t('פרטי יצירת קשר', 'Contact Details')} t={t}>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('טלפון ליצירת קשר', 'Contact Phone')}
                      </Label>
                      <Input
                        type="text"
                        dir="ltr"
                        value={settings.contact_phone || ''}
                        onChange={(e) => handleUpdate('contact_phone', e.target.value)}
                        placeholder="050-1234567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('אימייל ליצירת קשר', 'Contact Email')}
                      </Label>
                      <Input
                        type="email"
                        dir="ltr"
                        value={settings.contact_email || ''}
                        onChange={(e) => handleUpdate('contact_email', e.target.value)}
                        placeholder="info@moveup.today"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('מספר WhatsApp (עם קוד מדינה)', 'WhatsApp Number (עם קוד מדינה)')}
                      </Label>
                      <Input
                        type="text"
                        dir="ltr"
                        value={settings.contact_whatsapp || ''}
                        onChange={(e) => handleUpdate('contact_whatsapp', e.target.value)}
                        placeholder="972501234567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                        {t('💡 הערה: הכנס את מספר הוואטסאפ עם קוד המדינה (ללא + או רווחים). לדוגרה: 972501234567', '💡 Note: Enter WhatsApp number with country code (without + or spaces). Example: 972501234567')}
                    </p>
                </div>
            </Section>

            <Section title={t('אזור הנעה לפעולה (טופס יצירת קשר)', 'CTA Section (Contact Form)')} t={t}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label={t('כותרת ראשית (עברית)', 'Main Title (Hebrew)')} value={settings.contact_page_form_cta_title_he || ''} onChange={(e) => handleUpdate('contact_page_form_cta_title_he', e.target.value)} />
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('כותרת ראשית (אנגלית)', 'Main Title (English)')}
                      </Label>
                      <Input
                        type="text"
                        dir="ltr"
                        value={settings.contact_page_form_cta_title_en || ''}
                        onChange={(e) => handleUpdate('contact_page_form_cta_title_en', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                    <RichTextField label={t('כותרת משנה (עברית)', 'Subtitle (Hebrew)')} value={settings.contact_page_form_cta_subtitle_he || ''} onChange={(value) => onRichTextChange('contact_page_form_cta_subtitle_he', value)} />
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('כותרת משנה (אנגלית)', 'Subtitle (English)')}</Label>
                      <div dir="ltr">
                        <RichTextEditor value={settings.contact_page_form_cta_subtitle_en || ''} onChange={(value) => onRichTextChange('contact_page_form_cta_subtitle_en', value)} />
                      </div>
                    </div>
                    <InputField label={t('טקסט כפתור (עברית)', 'Button Text (Hebrew)')} value={settings.contact_page_form_cta_button_he || ''} onChange={(e) => handleUpdate('contact_page_form_cta_button_he', e.target.value)} />
                    <div>
                      <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                        {t('טקסט כפתור (אנגלית)', 'Button Text (English)')}
                      </Label>
                      <Input
                        type="text"
                        dir="ltr"
                        value={settings.contact_page_form_cta_button_en || ''}
                        onChange={(e) => handleUpdate('contact_page_form_cta_button_en', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                      />
                    </div>
                    <ColorField label={t('צבע רקע לאזור', 'Section Background Color')} value={settings.contact_page_form_cta_bg_color || ''} onChange={(e) => handleUpdate('contact_page_form_cta_bg_color', e.target.value)} t={t} />
                    <ColorField label={t('צבע רקע לכפתור', 'Button Background Color')} value={settings.contact_page_form_cta_button_bg_color || ''} onChange={(e) => handleUpdate('contact_page_form_cta_button_bg_color', e.target.value)} t={t} />
                    <ColorField label={t('צבע טקסט בכפתור', 'Button Text Color')} value={settings.contact_page_form_cta_button_text_color || ''} onChange={(e) => handleUpdate('contact_page_form_cta_button_text_color', e.target.value)} t={t} />
                </div>
            </Section>

            <Section title={t('מדיה לעמוד (Hero)', 'Page Media (Hero)')} t={t}>
                <MediaUploader
                    media={settings.page_media || {}}
                    sectionKey="contact"
                    onMediaChange={(updatedMedia) => onMediaChange('contact', updatedMedia.contact)}
                />
                <div className="mt-6">
                    <MediaPositionSelector
                        currentPosition={settings.page_media_position?.contact || 'center center'}
                        onPositionChange={(position) => onMediaPositionChange('contact', position)}
                        previewImage={settings.page_media?.contact?.[0]?.file_url}
                        t={t}
                    />
                </div>
            </Section>
            <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
        </div>
    );
};

const PagesTab = ({ siteSettings, handleSettingsChange, isSaving, handleSaveSettings, t, onManagerChange, onAddManager, onRemoveManager, onCorporatePageChange, onRichTextChange }) => {
  const [activePageSubTab, setActivePageSubTab] = useState('about');

  const pageSubTabs = useMemo(() => [
    { id: 'about', label: t('אודות', 'About'), icon: Info },
    { id: 'personal', label: t('פרטיות', 'Personal'), icon: User },
    { id: 'corporate', label: t('ארגונים', 'Corporate'), icon: Building2 },
    { id: 'testimonials', label: t('המלצות', 'Testimonials'), icon: Star },
    { id: 'blog', label: t('בלוג', 'Blog'), icon: Book },
    { id: 'podcast', label: t('פודקסט', 'Podcast'), icon: Mic },
    { id: 'contact', label: t('צור קשר', 'Contact'), icon: Mail },
    { id: 'footer', label: t('פוטר', 'Footer'), icon: ArrowDown },
    { id: 'logo-carousel', label: t('קרוסלת לוגואים', 'Logo Carousel'), icon: Images },
  ], [t]);

  const onMediaChange = useCallback((sectionKey, mediaArray) => {
    handleSettingsChange('page_media', { ...siteSettings.page_media, [sectionKey]: mediaArray });
  }, [siteSettings.page_media, handleSettingsChange]);

  const onMediaPositionChange = useCallback((sectionKey, position) => {
    handleSettingsChange('page_media_position', { ...siteSettings.page_media_position, [sectionKey]: position });
  }, [siteSettings.page_media_position, handleSettingsChange]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[var(--text-color)]">
        {t('ניהול עמודים', 'Page Management')}
      </h2>

      <div className="flex bg-gray-100 p-1 rounded-lg flex-wrap gap-2">
        {pageSubTabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActivePageSubTab(tab.id)}
            className={`flex-1 min-w-[120px] px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activePageSubTab === tab.id ? 'bg-[var(--primary-color)] text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
            variant="ghost"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {activePageSubTab === 'about' && <AboutPageTab settings={siteSettings} handleUpdate={handleSettingsChange} onMediaChange={onMediaChange} onMediaPositionChange={onMediaPositionChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} onManagerChange={onManagerChange} onAddManager={onAddManager} onRemoveManager={onRemoveManager} onRichTextChange={onRichTextChange} />}
      {/* Updated PersonalPageSettings props */}
      {activePageSubTab === 'personal' && <PersonalPageSettings settings={siteSettings} handleUpdate={handleSettingsChange} onMediaChange={onMediaChange} onMediaPositionChange={onMediaPositionChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} onRichTextChange={onRichTextChange} />}
      {activePageSubTab === 'corporate' && <CorporatePageTab settings={siteSettings} handleSettingsChange={handleSettingsChange} onMediaChange={onMediaChange} onMediaPositionChange={onMediaPositionChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} onCorporatePageChange={onCorporatePageChange} onRichTextChange={onRichTextChange} />}
      {activePageSubTab === 'testimonials' && <TestimonialsPageTab settings={siteSettings} handleUpdate={handleSettingsChange} onMediaChange={onMediaChange} onMediaPositionChange={onMediaPositionChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} onRichTextChange={onRichTextChange} />}
      {activePageSubTab === 'blog' && <BlogPageTab settings={siteSettings} handleUpdate={handleSettingsChange} onMediaChange={onMediaChange} onMediaPositionChange={onMediaPositionChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} onRichTextChange={onRichTextChange} />}
      {activePageSubTab === 'podcast' && <PodcastPageTab settings={siteSettings} handleUpdate={handleSettingsChange} onMediaChange={onMediaChange} onMediaPositionChange={onMediaPositionChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} onRichTextChange={onRichTextChange} />}
      {activePageSubTab === 'contact' && <ContactPageTab settings={siteSettings} handleUpdate={handleSettingsChange} onMediaChange={onMediaChange} onMediaPositionChange={onMediaPositionChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} onRichTextChange={onRichTextChange} />}


      {activePageSubTab === 'footer' && (
        <div className="space-y-6">
          <Section title={t('צבעי פוטר', 'Footer Colors')} t={t}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <ColorField label={t('צבע רקע הפוטר', 'Footer Background Color')} value={siteSettings.footer_background_color || ''} onChange={(e) => handleSettingsChange('footer_background_color', e.target.value)} t={t} />
              <ColorField label={t('צבע טקסט הפוטר', 'Footer Text Color')} value={siteSettings.footer_text_color || ''} onChange={(e) => handleSettingsChange('footer_text_color', e.target.value)} t={t} />
              <ColorField label={t('צבע כותרות הפוטר', 'Footer Titles Color')} value={siteSettings.footer_title_color || ''} onChange={(e) => handleSettingsChange('footer_title_color', e.target.value)} t={t} />
            </div>
          </Section>

          <Section title={t('לוגו לפוטר', 'Footer Logo')} t={t}>
            <p className="text-sm text-gray-600 mb-6">
              {t('כאן ניתן להעלות לוגo ייעודי לפוטר, שמתאים לרקע הכהה. אם לא תעלו לוגו כאן, יוצג הלוגo הראשי מההגדרות הכלליות.', 'Here you can upload a dedicated logo for the footer, suitable for a dark background. If you don\'t upload a logo here, the main logo from the General Settings will be displayed.')}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <AdminImageUploader
                label={t('לוגו לפוטר (עברית)', 'Footer Logo (Hebrew)')}
                value={siteSettings.footer_logo_url_he || ''}
                onChange={(url) => handleSettingsChange('footer_logo_url_he', url)}
                t={t}
              />
              <AdminImageUploader
                label={t('לוגו לפוטר (אנגלית)', 'Footer Logo (English)')}
                value={siteSettings.footer_logo_url_en || ''}
                onChange={(url) => handleSettingsChange('footer_logo_url_en', url)}
                t={t}
              />
            </div>
          </Section>

          <Section title={t('כותרות וטקסטים', 'Titles & Texts')} t={t}>
            <p className="text-sm text-gray-600 mb-6">
              {t('כאן ניתן לערוך את הכותרות והטקסטים שמופיעים בפוטר. את פרטי יצירת הקשר והרשתות החברתיות ניתן לערוך בלשונית "צור קשר".', 'Here you can edit the titles and texts that appear in the footer. Contact details and social networks can be edited in the "Contact" tab.')}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <InputField label={t('כותרת עמודת ניווט (עברית)', 'Navigation Column Title (Hebrew)')} value={siteSettings.footer_nav_title_he || ''} onChange={(e) => handleSettingsChange('footer_nav_title_he', e.target.value)} placeholder="ניווט" />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כותרת עמודת ניווט (אנגלית)', 'Navigation Column Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={siteSettings.footer_nav_title_en || ''}
                  onChange={(e) => handleSettingsChange('footer_nav_title_en', e.target.value)}
                  placeholder="Navigation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
              <InputField label={t('כותרת עמודת צור קשר (עברית)', 'Contact Column Title (Hebrew)')} value={siteSettings.footer_contact_title_he || ''} onChange={(e) => handleSettingsChange('footer_contact_title_he', e.target.value)} placeholder="צרו קשר" />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כותרת עמודת צור קשר (אנגלית)', 'Contact Column Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={siteSettings.footer_contact_title_en || ''}
                  onChange={(e) => handleSettingsChange('footer_contact_title_en', e.target.value)}
                  placeholder="Contact Us"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
              <InputField label={t('כותרת עמודת רשתות חברתיות (עברית)', 'Social Column Title (Hebrew)')} value={siteSettings.footer_social_title_he || ''} onChange={(e) => handleSettingsChange('footer_social_title_he', e.target.value)} placeholder="עקבו אחרינו" />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כותרת עמודת רשתות חברתיות (אנגלית)', 'Social Column Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={siteSettings.footer_social_title_en || ''}
                  onChange={(e) => handleSettingsChange('footer_social_title_en', e.target.value)}
                  placeholder="Follow Us"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
              <RichTextField label={t('טקסט זכויות יוצרים (עברית)', 'Copyright Text (Hebrew)')} value={siteSettings.footer_copyright_he || ''} onChange={(value) => onRichTextChange('footer_copyright_he', value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('טקסט זכויות יוצרים (אנגלית)', 'Copyright Text (English)')}</Label>
                <div dir="ltr">
                  <RichTextEditor value={siteSettings.footer_copyright_en || ''} onChange={(value) => onRichTextChange('footer_copyright_en', value)} />
                </div>
              </div>
            </div>
          </Section>

          <Section title={t('קישור לבוטית', 'Bot Link')} t={t}>
            <div className="flex items-center space-x-2 mb-4">
                <Switch id="footer_bot_link_enabled" checked={siteSettings.footer_bot_link_enabled === true} onCheckedChange={(checked) => handleSettingsChange('footer_bot_link_enabled', checked)} />
                <Label htmlFor="footer_bot_link_enabled">{t('הצג קישור לבוטית בפוטר', 'Show Bot Link in Footer')}</Label>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <InputField label={t('טקסט קישור (עברית)', 'Link Text (Hebrew)')} value={siteSettings.footer_bot_link_text_he || ''} onChange={(e) => handleSettingsChange('footer_bot_link_text_he', e.target.value)} />
                <div>
                  <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                    {t('טקסט קישור (אנגלית)', 'Link Text (English)')}
                  </Label>
                  <Input
                    type="text"
                    dir="ltr"
                    value={siteSettings.footer_bot_link_text_en || ''}
                    onChange={(e) => handleSettingsChange('footer_bot_link_text_en', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                    {t('כתובת URL של הבוטית', 'Bot URL')}
                  </Label>
                  <Input
                    type="text"
                    dir="ltr"
                    value={siteSettings.footer_bot_link_url || ''}
                    onChange={(e) => handleSettingsChange('footer_bot_link_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                  />
                </div>
            </div>
          </Section>
          <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
        </div>
      )}

      {activePageSubTab === 'logo-carousel' && (
        <div className="space-y-6">
          <Section title={t('הגדרות קרוסלת לוגואים', 'Logo Carousel Settings')} t={t}>
            <InputField label={t('כותרת הקרוסלה (עברית)', 'Carousel Title (Hebrew)')} value={siteSettings.logo_carousel_title_he || ''} onChange={(e) => handleSettingsChange('logo_carousel_title_he', e.target.value)} />
            <div>
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                {t('כותרת הקרוסלה (אנגלית)', 'Carousel Title (English)')}
              </Label>
              <Input
                type="text"
                dir="ltr"
                value={siteSettings.logo_carousel_title_en || ''}
                onChange={(e) => handleSettingsChange('logo_carousel_title_en', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
              />
            </div>
            <ColorField label={t('צבע רקע', 'Background Color')} value={siteSettings.logo_carousel_bg_color || ''} onChange={(e) => handleSettingsChange('logo_carousel_bg_color', e.target.value)} t={t} />

            <div>
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('סוג אנימציה', 'Animation Type')}</Label>
              <select
                value={siteSettings.logo_carousel_animation || 'scroll'}
                onChange={(e) => handleSettingsChange('logo_carousel_animation', e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 font-sans text-left`}
                dir="ltr"
              >
                <option value="scroll">{t('גלילה', 'Scroll')}</option>
                <option value="fade">{t('הופעה הדרגתית (Fade)', 'Fade')}</option>
              </select>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <Label htmlFor="controls-enabled" className="text-sm font-medium text-[var(--text-color)] cursor-pointer">
                {t('הצג כפתורי שליטה ידנית (במצב גלילה)', 'Show Manual Controls (in scroll mode)')}
              </Label>
              <Switch
                id="controls-enabled"
                checked={siteSettings.logo_carousel_controls_enabled || false}
                onCheckedChange={(value) => handleSettingsChange('logo_carousel_controls_enabled', value)}
              />
            </div>
          </Section>

          <Section title={t('לוגואים', 'Logos')} t={t}>
            <MediaUploader
              media={siteSettings.page_media || {}}
              sectionKey="logo_carousel_logos"
              onMediaChange={(updatedMedia) => onMediaChange('logo_carousel_logos', updatedMedia.logo_carousel_logos)}
            />
          </Section>
          <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
        </div>
      )}
    </div>
  );
};

const ContactFormTab = ({ siteSettings, handleSettingsChange, isSaving, handleSaveSettings, t, onRichTextChange }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-[var(--text-color)]">
      {t('הגדרות טופס יצירת קשר', 'Contact Form Settings')}
    </h2>

    <Section title={t('סטטוס טופס ופרטי הטקסט', 'Form Status & Text Details')} t={t}>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="contact_form_enabled" className="block text-sm font-medium text-[var(--text-color)] mb-2 cursor-pointer">
            {t('הפעל טופס יצירת קשר', 'Enable Contact Form')}
          </Label>
          <Switch
            id="contact_form_enabled"
            checked={siteSettings.contact_form_enabled ?? true} // Default to true if not set
            onCheckedChange={(value) => handleSettingsChange('contact_form_enabled', value)}
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <InputField label={t('כותרת הטופס (עברית)', 'Form Title (Hebrew)')} value={siteSettings.contact_form_title_he || ''} onChange={(e) => handleSettingsChange('contact_form_title_he', e.target.value)} placeholder="צרו קשר" />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('כותרת הטופס (אנגלית)', 'Form Title (English)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={siteSettings.contact_form_title_en || ''}
            onChange={(e) => handleSettingsChange('contact_form_title_en', e.target.value)}
            placeholder="Contact Us"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <RichTextField label={t('כותרת משנה (עברית)', 'Subtitle (Hebrew)')} value={siteSettings.contact_form_subtitle_he || ''} onChange={(value) => onRichTextChange('contact_form_subtitle_he', value)} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('כותרת משנה (אנגלית)', 'Subtitle (English)')}</Label>
          <div dir="ltr">
            <RichTextEditor value={siteSettings.contact_form_subtitle_en || ''} onChange={(value) => onRichTextChange('contact_form_subtitle_en', value)} />
          </div>
        </div>
        <RichTextField label={t('הודעת הצלחה (עברית)', 'Success Message (Hebrew)')} value={siteSettings.contact_form_success_message_he || ''} onChange={(value) => onRichTextChange('contact_form_success_message_he', value)} />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('הודעת הצלחה (אנגלית)', 'Success Message (English)')}</Label>
          <div dir="ltr">
            <RichTextEditor value={siteSettings.contact_form_success_message_en || ''} onChange={(value) => onRichTextChange('contact_form_success_message_en', value)} />
          </div>
        </div>
      </div>
    </Section>

    <Section title={t('הגדרות מתקדמות לטופס', 'Advanced Form Settings')} t={t}>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('אימייל לקבלת פניות', 'Recipient Email')}
          </Label>
          <Input
            type="email"
            dir="ltr"
            value={siteSettings.contact_form_email_recipient || ''}
            onChange={(e) => handleSettingsChange('contact_form_email_recipient', e.target.value)}
            placeholder="info@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('שם שדה Honeypot (להגנה מספאם)', 'Honeypot Field Name (for spam protection)')}
          </Label>
          <Input
            type="text"
            dir="ltr"
            value={siteSettings.contact_form_honeypot_field || ''}
            onChange={(e) => handleSettingsChange('contact_form_honeypot_field', e.target.value)}
            placeholder="address"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
      </div>
    </Section>

    <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
  </div>
);


const MediaTab = ({ siteSettings, handleSettingsChange, isSaving, handleSaveSettings, t }) => {
  const onMediaChange = useCallback((sectionKey, mediaArray) => {
    handleSettingsChange('page_media', { ...siteSettings.page_media, [sectionKey]: mediaArray });
  }, [siteSettings.page_media, handleSettingsChange]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[var(--text-color)]">
        {t('מדיה ותמונות', 'Media & Images')}
      </h2>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
          {t('העלאת קבצי מדיה כלליים', 'Upload General Media Files')}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t('כאן ניתן להעלות קבצי תמונה וסרטונים לשימוש כללי באתר. תמונות ספציפיות לעמודים או קרוסלות נמצאות בלשוניות המתאימות.', 'Here you can upload general image and video files for use across the site. Page-specific images or carousel images are located in their respective tabs.')}
        </p>
        <MediaUploader
          media={siteSettings.page_media || {}}
          sectionKey="general_media" // A generic key for general media
          onMediaChange={(updatedMedia) => onMediaChange('general_media', updatedMedia.general_media)}
          isGeneralUploader={true}
          t={t}
        />
      </div>
    <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
  </div>
  );
};

const SocialTab = ({ siteSettings, handleSettingsChange, isSaving, handleSaveSettings, t }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-[var(--text-color)]">
      {t('הגדרות רשתות חברתיות', 'Social Media Settings')}
    </h2>
    <Section title={t('קישורי רשתות חברתיות', 'Social Media Links')} t={t}>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('אינסטגרם', 'Instagram')}
          </Label>
          <Input
            type="url"
            dir="ltr"
            value={siteSettings.instagram_url || ''}
            onChange={(e) => handleSettingsChange('instagram_url', e.target.value)}
            placeholder="https://instagram.com/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('לינקדאין', 'LinkedIn')}
          </Label>
          <Input
            type="url"
            dir="ltr"
            value={siteSettings.linkedin_url || ''}
            onChange={(e) => handleSettingsChange('linkedin_url', e.target.value)}
            placeholder="https://linkedin.com/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('פייסבוק', 'Facebook')}
          </Label>
          <Input
            type="url"
            dir="ltr"
            value={siteSettings.facebook_url || ''}
            onChange={(e) => handleSettingsChange('facebook_url', e.target.value)}
            placeholder="https://facebook.com/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('יוטיוב', 'YouTube')}
          </Label>
          <Input
            type="url"
            dir="ltr"
            value={siteSettings.youtube_url || ''}
            onChange={(e) => handleSettingsChange('youtube_url', e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
          />
        </div>
      </div>
    </Section>
    <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
  </div>
);

const AdvancedTab = ({ siteSettings, handleSettingsChange, isSaving, handleSaveSettings, t }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-[var(--text-color)]">
      {t('הגדרות מתקדמות', 'Advanced Settings')}
    </h2>
    <Section title={t('קוד מותאם אישית', 'Custom Code')} t={t}>
      <Textarea label={t('CSS מותאם אישית', 'Custom CSS')} value={siteSettings.custom_css || ''} onChange={(e) => handleSettingsChange('custom_css', e.target.value)} placeholder="/* הוסף כאן קוד CSS מותאם אישית */" />
      <Textarea label={t('JavaScript מותאם אישית', 'Custom JavaScript')} value={siteSettings.custom_js || ''} onChange={(e) => handleSettingsChange('custom_js', e.target.value)} placeholder="// הוסף כאן קוד JavaScript מותאם אישית" />
    </Section>
    <SaveSettingsButton isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />
  </div>
);

const BackupTab = ({ t }) => {
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);

  const handleSheetsExport = async () => {
    setIsExportingSheets(true);
    try {
      const response = await exportToGoogleSheets();
      const data = response.data;
      
      if (data.success && data.spreadsheetUrl) {
         window.open(data.spreadsheetUrl, '_blank');
         alert(t('הייצוא הושלם בהצלחה! הגיליון נפתח בחלון חדש.', 'Export completed! The sheet opened in a new window.'));
      } else {
         throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error("Export failed:", error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert(`${t('שגיאה בייצוא לגוגל שיטס:', 'Export failed:')} ${errorMessage}`);
    } finally {
      setIsExportingSheets(false);
    }
  };

  const handleJsonExport = async () => {
    setIsExportingJson(true);
    try {
      const response = await exportData();
      // Create a blob from the response data
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `site-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("JSON Export failed:", error);
      alert(t('שגיאה בייצוא JSON.', 'JSON Export failed.'));
    } finally {
      setIsExportingJson(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[var(--text-color)]">
        {t('גיבוי וייצוא נתונים', 'Backup & Export Data')}
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Section title={t('ייצוא לגוגל שיטס', 'Export to Google Sheets')} t={t}>
          <p className="text-sm text-gray-600 mb-4">
            {t('ייצא את כל נתוני האתר (הגדרות, פוסטים, המלצות וכו\') לגיליון גוגל שיטס מסודר. נוח לצפייה ולעריכה ידנית.', 'Export all site data (settings, posts, testimonials, etc.) to an organized Google Sheet. Convenient for viewing and manual editing.')}
          </p>
          <Button 
            onClick={handleSheetsExport} 
            disabled={isExportingSheets}
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            {isExportingSheets ? <Loader2 className="w-4 h-4 animate-spin" /> : <Table className="w-4 h-4" />}
            {isExportingSheets ? t('מייצא...', 'Exporting...') : t('ייצא לגוגל שיטס', 'Export to Google Sheets')}
          </Button>
        </Section>

        <Section title={t('ייצוא לקובץ JSON (גיבוי מלא)', 'Export to JSON (Full Backup)')} t={t}>
          <p className="text-sm text-gray-600 mb-4">
            {t('הורד קובץ גיבוי מלא של כל נתוני האתר בפורמט JSON. קובץ זה מכיל את המידע הגולמי ומומלץ לשמור אותו לצרכי שחזור עתידיים.', 'Download a full backup file of all site data in JSON format. This file contains raw data and is recommended for future recovery needs.')}
          </p>
          <Button 
            onClick={handleJsonExport} 
            disabled={isExportingJson}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            {isExportingJson ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />}
            {isExportingJson ? t('מכין קובץ...', 'Preparing File...') : t('הורד גיבוי JSON', 'Download JSON Backup')}
          </Button>
        </Section>
      </div>
    </div>
  );
};


function TestimonialsTab({ t }) {
  const [testimonials, setTestimonials] = useState([]);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadTestimonials = useCallback(async () => {
    try {
      const data = await Testimonial.list();
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error loading testimonials:", error);
      setTestimonials([]);
    }
  }, []);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const handleInputChange = (field, value) => {
    // Prevent storing empty p tags from quill for rich text fields
    let cleanedValue = value;
    if (['text_he', 'text_en'].includes(field) && typeof value === 'string' && value === '<p><br></p>') {
      cleanedValue = '';
    }
    setEditingTestimonial(prev => ({...prev, [field]: cleanedValue}));
  };

  const handleAddNewTestimonial = () => {
    setEditingTestimonial({
      name_he: '', name_en: '', title_he: '', title_en: '',
      text_he: '', text_en: '', rating: 5, photo_url: '', is_published: true
    });
  };

  const handleSaveTestimonial = async () => {
    setIsSaving(true);
    try {
      if (editingTestimonial.id) {
        // Exclude read-only fields for update
        const { id, created_date, updated_date, created_by, ...updateData } = editingTestimonial;
        await Testimonial.update(id, updateData);
      } else {
        await Testimonial.create(editingTestimonial);
      }
      await loadTestimonials();
      setEditingTestimonial(null);
      alert(t('ההמלצה נשמרה בהצלחה!', 'Testimonial saved successfully!'));
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert(t('שגיאה בשמירת ההמלצה', 'Error saving testimonial'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTestimonial = async (testimonialId) => {
    if (confirm(t('האם אתה בטוח שברצונך למחוק את ההמלצה?', 'Are you sure you want to delete this testimonial?'))) {
      try {
        await Testimonial.delete(testimonialId);
        await loadTestimonials();
        alert(t('ההמלצה נמחקקה בהצלחה!', 'Testimonial deleted successfully!'));
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        alert(t('שגיאה במחיקת ההמלצה', 'Error deleting testimonial'));
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[var(--text-color)]">
          {t('ניהול המלצות', 'Manage Testimonials')}
        </h2>
        <Button
          onClick={handleAddNewTestimonial}
          className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('הוסף המלצה חדשה', 'Add New Testimonial')}
        </Button>
      </div>

      {editingTestimonial && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
            {editingTestimonial.id ? t('ערוך המלצה', 'Edit Testimonial') : t('הוסף המלצה חדשה', 'Add New Testimonial')}
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('שם הממליצ/ה (עברית)', "Recommender's Name (Hebrew)")} value={editingTestimonial.name_he || ''} onChange={(e) => handleInputChange('name_he', e.target.value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('שם הממליצ/ה (אנגלית)', "Recommender's Name (English)")}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={editingTestimonial.name_en || ''}
                  onChange={(e) => handleInputChange('name_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('תפקיד (עברית)', 'Title (Hebrew)')} value={editingTestimonial.title_he || ''} onChange={(e) => handleInputChange('title_he', e.target.value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('תפקיד (אנגלית)', 'Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={editingTestimonial.title_en || ''}
                  onChange={(e) => handleInputChange('title_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <RichTextField label={t('תוכן ההמלצה (עברית)', 'Testimonial Text (Hebrew)')} value={editingTestimonial.text_he || ''} onChange={(value) => handleInputChange('text_he', value)} />
            <div>
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תוכן ההמלצה (אנגלית)', 'Testimonial Text (English)')}</Label>
              <div dir="ltr">
                <RichTextEditor value={editingTestimonial.text_en || ''} onChange={(value) => handleInputChange('text_en', value)} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{t('דירוג', 'Rating')}</Label>
                <select
                  value={editingTestimonial.rating || 5}
                  onChange={(e) => handleInputChange('rating', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 font-sans`}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} {t('כוכבים', 'stars')}</option>
                  ))}
                </select>
              </div>
              <AdminImageUploader label={t('תמונת פרופיל', 'Profile Photo')} value={editingTestimonial.photo_url || ''} onChange={(url) => handleInputChange('photo_url', url)} t={t} />
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch id="is-published" checked={editingTestimonial.is_published} onCheckedChange={(checked) => handleInputChange('is_published', checked)} />
              <Label htmlFor="is-published">{t('פורסם באתר', 'Published on site')}</Label>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleSaveTestimonial} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? t('שומר...', 'Saving...') : (editingTestimonial.id ? t('עדכן המלצה', 'Update Testimonial') : t('שמור המלצה', 'Save Testimonial'))}
              </Button>
              <Button variant="outline" onClick={() => setEditingTestimonial(null)}>{t('ביטול', 'Cancel')}</Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[var(--text-color)]">
            {t('המלצות קיימות', 'Existing Testimonials')}
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {testimonial.photo_url && (
                  <img src={testimonial.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                )}
                <div>
                  <h4 className="font-medium text-[var(--text-color)]">
                    {t('לשפה הנוכחית', 'Current Language') === 'he' ? testimonial.name_he : testimonial.name_en}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t('לשפה הנוכחית', 'Current Language') === 'he' ? testimonial.title_he : testimonial.title_en}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${testimonial.is_published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {testimonial.is_published ? t('פורסם', 'Published') : t('לא פורסם', 'Not Published')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setEditingTestimonial(testimonial)} className="text-blue-600 hover:text-blue-800">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteTestimonial(testimonial.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function PodcastEpisodesTab({ t }) {
  const { language } = useLanguage();
  const [podcastEpisodes, setPodcastEpisodes] = useState([]);
  const [editingPodcastEpisode, setEditingPodcastEpisode] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false); // New state for image upload

  const loadEpisodes = useCallback(async () => {
    try {
      const data = await PodcastEpisode.list('-publish_date');
      setPodcastEpisodes(data || []);
    } catch (error) {
      console.error("Error loading podcast episodes:", error);
      setPodcastEpisodes([]);
    }
  }, []);

  useEffect(() => {
    loadEpisodes();
  }, [loadEpisodes]);

  const handleInputChange = (field, value) => {
    // Prevent storing empty p tags from quill for rich text fields
    let cleanedValue = value;
    if (['description_he', 'description_en'].includes(field) && typeof value === 'string' && value === '<p><br></p>') {
      cleanedValue = '';
    }
    setEditingPodcastEpisode(prev => ({ ...prev, [field]: cleanedValue }));
  };

  const handleMediaChange = (mediaGallery) => {
    setEditingPodcastEpisode(prev => ({ ...prev, media_gallery: mediaGallery }));
  };

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setIsUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      // Update the episode state with the new image URL
      setEditingPodcastEpisode(prev => ({ ...prev, featured_image: file_url }));
    } catch (error) {
      console.error("Upload failed:", error);
      alert(t('שגיאה בהעלאת הקובץ', 'File upload failed'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveFeaturedImage = () => {
    setEditingPodcastEpisode(prev => ({ ...prev, featured_image: '' })); // Clear the featured image
  };

  const handleAddNewPodcastEpisode = () => {
    const nextEpisodeNumber = podcastEpisodes.length > 0 ? Math.max(...podcastEpisodes.map(p => p.episode_number || 0)) + 1 : 1;
    setEditingPodcastEpisode({
      title_he: '',
      title_en: '',
      episode_number: nextEpisodeNumber,
      order_index: (podcastEpisodes?.length || 0) + 1, // Added order_index
      description_he: '',
      description_en: '',
      is_published: true,
      publish_date: new Date().toISOString().split('T')[0],
      duration: '00:00',
      featured_image: '',
      spotify_url: '',
      apple_url: '',
      youtube_url: '',
      google_url: '',
      media_gallery: []
    });
  };

  const handleSavePodcastEpisode = async () => {
    setIsSaving(true);
    try {
      if (editingPodcastEpisode.id) {
        const { id, created_date, updated_date, created_by, ...updateData } = editingPodcastEpisode;
        await PodcastEpisode.update(id, updateData);
      } else {
        await PodcastEpisode.create(editingPodcastEpisode);
      }
      await loadEpisodes();
      setEditingPodcastEpisode(null);
      alert(t('הפרק נשמר בהצלחה!', 'Episode saved successfully!'));
    } catch (error) {
      console.error('Error saving podcast episode:', error);
      alert(t('שגיאה בשמירת הפרק', 'Error saving episode'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePodcastEpisode = async (itemId) => {
    if (confirm(t('האם אתה בטוח שברצונך למחוק את הפרק הזה?', 'Are you sure you want to delete this episode?'))) {
      try {
        await PodcastEpisode.delete(itemId);
        await loadEpisodes();
        alert(t('הפרק נמחק בהצלחה!', 'Episode deleted successfully!'));
      } catch (error) {
        console.error("Error deleting episode:", error);
        alert(t('שגיאה במחיקת הפרק', 'Error deleting episode'));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[var(--text-color)]">
          {t('ניהול פרקי פודקסט', 'Manage Podcast Episodes')}
        </h2>
        <Button
          onClick={handleAddNewPodcastEpisode}
          className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('הוסף פרק חדש', 'Add New Episode')}
        </Button>
      </div>

      {editingPodcastEpisode && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
            {editingPodcastEpisode.id ? t('ערוך פרק', 'Edit Episode') : t('הוסף פרק חדש', 'Add New Episode')}
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('כותרת (עברית)', 'Title (Hebrew)')} value={editingPodcastEpisode.title_he || ''} onChange={(e) => handleInputChange('title_he', e.target.value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כותרת (אנגלית)', 'Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={editingPodcastEpisode.title_en || ''}
                  onChange={(e) => handleInputChange('title_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <RichTextField label={t('תיאור (עברית)', 'Description (Hebrew)')} value={editingPodcastEpisode.description_he || ''} onChange={(value) => handleInputChange('description_he', value)} />
            <div>
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תיאור (אנגלית)', 'Description (English)')}</Label>
              <div dir="ltr">
                <RichTextEditor value={editingPodcastEpisode.description_en || ''} onChange={(value) => handleInputChange('description_en', value)} />
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4"> {/* Changed to md:grid-cols-4 */}
              <InputField type="number" label={t('מספר פרק', 'Episode Number')} value={editingPodcastEpisode.episode_number || ''} onChange={(e) => handleInputChange('episode_number', parseInt(e.target.value) || 0)} min="1" />
              <InputField type="number" label={t('סדר הצגה', 'Display Order')} value={editingPodcastEpisode.order_index || 0} onChange={(e) => handleInputChange('order_index', parseInt(e.target.value) || 0)} /> {/* Added */}
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('משך (לדוגמה: 45:30)', 'Duration (e.g., 45:30)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={editingPodcastEpisode.duration || ''}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('תאריך פרסום', 'Publish Date')}
                </Label>
                <Input
                  type="date"
                  dir="ltr"
                  value={editingPodcastEpisode.publish_date || ''}
                  onChange={(e) => handleInputChange('publish_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                {t('תמונה ראשית/קאבר', 'Featured Image/Cover')}
              </Label>
              {editingPodcastEpisode.featured_image ? (
                <div className="relative w-full mb-4 rounded-lg overflow-hidden border border-gray-200" style={{ maxHeight: '200px' }}>
                  <img src={editingPodcastEpisode.featured_image} alt="Featured" className="w-full h-full object-contain" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full p-1 bg-red-500 text-white hover:bg-red-600"
                    onClick={handleRemoveFeaturedImage}
                    title={t('הסר תמונה', 'Remove Image')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-2">{t('אין תמונה ראשית נבחרה.', 'No featured image selected.')}</p>
              )}
              <Label htmlFor="featured_image_upload_input" className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[var(--secondary-color)] transition-colors text-sm flex items-center justify-center w-fit">
                {isUploadingImage ? t('מעלה...', 'Uploading...') : (editingPodcastEpisode.featured_image ? t('החלף תמונה', 'Replace Image') : t('העלה תמונה', 'Upload Image'))}
                <Input
                  id="featured_image_upload_input"
                  type="file"
                  accept="image/*,.svg"
                  className="hidden"
                  onChange={handleFeaturedImageUpload}
                  disabled={isUploadingImage}
                />
              </Label>
              {isUploadingImage && <p className="text-sm text-gray-500 mt-1">{t('מעלה תמונה...', 'Uploading image...')}</p>}
            </div>

            <div className="mt-4">
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                {t('גלריית מדיה לפרק', 'Episode Media Gallery')}
              </Label>
              <MediaUploader
                media={{ media_gallery: editingPodcastEpisode.media_gallery || [] }}
                sectionKey="media_gallery"
                onMediaChange={(updatedMedia) => handleMediaChange(updatedMedia.media_gallery)}
              />
            </div>

            <h3 className="text-lg font-semibold text-[var(--text-color)] mt-6 mb-4">{t('קישורים לפלטפורמות', 'Platform Links')}</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('קישור לספוטיפיי', 'Spotify URL')}
                </Label>
                <Input
                  type="url"
                  dir="ltr"
                  value={editingPodcastEpisode.spotify_url || ''}
                  onChange={(e) => handleInputChange('spotify_url', e.target.value)}
                  placeholder="https://open.spotify.com/episode/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('קישור לאפל פודקסט', 'Apple Podcasts URL')}
                </Label>
                <Input
                  type="url"
                  dir="ltr"
                  value={editingPodcastEpisode.apple_url || ''}
                  onChange={(e) => handleInputChange('apple_url', e.target.value)}
                  placeholder="https://podcasts.apple.com/us/podcast/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('קישור ליוטיוב', 'YouTube URL')}
                </Label>
                <Input
                  type="url"
                  dir="ltr"
                  value={editingPodcastEpisode.youtube_url || ''}
                  onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('קישור לגוגל פודקסט', 'Google Podcasts URL')}
                </Label>
                <Input
                  type="url"
                  dir="ltr"
                  value={editingPodcastEpisode.google_url || ''}
                  onChange={(e) => handleInputChange('google_url', e.target.value)}
                  placeholder="https://podcasts.google.com/feed/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>

            <div className="flex items-center mt-6">
              <Switch
                checked={editingPodcastEpisode.is_published ?? true}
                onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                id="is-published"
              />
              <Label htmlFor="is-published" className="ml-2 text-sm text-[var(--text-color)] cursor-pointer">
                {t('פורסם באתר', 'Published on site')}
              </Label>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleSavePodcastEpisode}
                disabled={isSaving}
                className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--secondary-color)] smooth-transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? t('שומר...', 'Saving...') : (editingPodcastEpisode.id ? t('עדכן פרק', 'Update Episode') : t('שמור פרק', 'Save Episode'))}
              </Button>
              {editingPodcastEpisode.id && (
                <Button
                  onClick={() => setEditingPodcastEpisode(null)}
                  variant="outline"
                  className="px-6 py-3 rounded-lg font-semibold"
                >
                  {t('ביטול', 'Cancel')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[var(--text-color)]">
            {t('פרקים קיימים', 'Existing Episodes')}
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {podcastEpisodes.map((episode) => (
            <div key={episode.id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium text-[var(--text-color)]">
                  {language === 'he' ? episode.title_he : episode.title_en}
                </h4>
                <p className="text-sm text-gray-600">
                  {t('פרק', 'Episode')} {episode.episode_number} • {format(new Date(episode.publish_date), 'dd/MM/yyyy', { locale: language === 'he' ? he : undefined })} • {episode.duration}
                </p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${episode.is_published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {episode.is_published ? t('פורסם', 'Published') : t('לא פורסם', 'Not Published')}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setEditingPodcastEpisode(episode)} className="text-blue-600 hover:text-blue-800">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeletePodcastEpisode(episode.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function BlogPostsTab({ t }) {
  const { language } = useLanguage();
  const [blogPosts, setBlogPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      const data = await BlogPost.list('-publish_date');
      setBlogPosts(data || []);
    } catch (error) {
      console.error("Error loading blog posts:", error);
      setBlogPosts([]);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleInputChange = (field, value) => {
    // Prevent storing empty p tags from quill for rich text fields
    let cleanedValue = value;
    if (['excerpt_he', 'excerpt_en', 'content_he', 'content_en'].includes(field) && typeof value === 'string' && value === '<p><br></p>') {
      cleanedValue = '';
    }
    setEditingPost(prev => ({ ...prev, [field]: cleanedValue }));
  };

  const handleMediaChange = (mediaGallery) => {
    setEditingPost(prev => ({ ...prev, media_gallery: mediaGallery }));
  };

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setIsUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      setEditingPost(prev => ({ ...prev, featured_image: file_url }));
    } catch (error) {
      console.error("Upload failed:", error);
      alert(t('שגיאה בהעלאת הקובץ', 'File upload failed'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddNewPost = () => {
    setEditingPost({
      title_he: '',
      title_en: '',
      is_published: true,
      publish_date: new Date().toISOString().split('T')[0],
      content_he: '',
      content_en: '',
      excerpt_he: '',
      excerpt_en: '',
      featured_image: '',
      external_link: '',
      order_index: (blogPosts?.length || 0) + 1,
      media_gallery: []
    });
  };

  const handleSavePost = async () => {
    setIsSaving(true);
    try {
      if (editingPost.id) {
        const { id, created_date, updated_date, created_by, ...updateData } = editingPost;
        await BlogPost.update(id, updateData);
      } else {
        await BlogPost.create(editingPost);
      }
      await loadPosts();
      setEditingPost(null);
      alert(t('הפוסט נשמר בהצלחה!', 'Post saved successfully!'));
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert(t('שגיאה בשמירת הפוסט', 'Error saving post'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async (itemId) => {
    if (confirm(t('האם אתה בטוח שברצונך למחוק את הפוסט הזה?', 'Are you sure you want to delete this post?'))) {
      try {
        await BlogPost.delete(itemId);
        await loadPosts();
        alert(t('הפוסט נמחק בהצלחה!', 'Post deleted successfully!'));
      } catch (error) {
        console.error("Error deleting post:", error);
        alert(t('שגיאה במחיקת הפוסט', 'Error deleting post'));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[var(--text-color)]">
          {t('ניהול בלוג', 'Manage Blog')}
        </h2>
        <Button
          onClick={handleAddNewPost}
          className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('הוסף פוסט חדש', 'Add New Post')}
        </Button>
      </div>

      {editingPost && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
            {editingPost.id ? t('ערוך פוסט', 'Edit Post') : t('הוסף פריט חדש', 'Add New Item')}
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('כותרת (עברית)', 'Title (Hebrew)')} value={editingPost.title_he || ''} onChange={(e) => handleInputChange('title_he', e.target.value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כותרת (אנגלית)', 'Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={editingPost.title_en || ''}
                  onChange={(e) => handleInputChange('title_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <RichTextField label={t('תקציר (עברית)', 'Excerpt (Hebrew)')} value={editingPost.excerpt_he || ''} onChange={(value) => handleInputChange('excerpt_he', value)} />
            <div>
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תקציר (אנגלית)', 'Excerpt (English)')}</Label>
              <div dir="ltr">
                <RichTextEditor value={editingPost.excerpt_en || ''} onChange={(value) => handleInputChange('excerpt_en', value)} />
              </div>
            </div>
            <RichTextField label={t('תוכן מלא (עברית)', 'Full Content (Hebrew)')} value={editingPost.content_he || ''} onChange={(value) => handleInputChange('content_he', value)} />
            <div>
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תוכן מלא (אנגלית)', 'Full Content (English)')}</Label>
              <div dir="ltr">
                <RichTextEditor value={editingPost.content_en || ''} onChange={(value) => handleInputChange('content_en', value)} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('תאריך פרסום', 'Publish Date')}
                </Label>
                <Input
                  type="date"
                  dir="ltr"
                  value={editingPost.publish_date || ''}
                  onChange={(e) => handleInputChange('publish_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
              {/* Added Display Order for Blog Post */}
              <InputField type="number" label={t('סדר הצגה', 'Display Order')} value={editingPost.order_index || 0} onChange={(e) => handleInputChange('order_index', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                {t('קישור חיצוני (יוטיוב/מאמר)', 'External Link (YouTube/Article)')}
              </Label>
              <Input
                type="url"
                dir="ltr"
                value={editingPost.external_link || ''}
                onChange={(e) => handleInputChange('external_link', e.target.value)}
                placeholder="https://youtube.com/... or https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
              />
            </div>

            <div className="mt-4">
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                {t('תמונה ראשית/קאבר', 'Featured Image/Cover')}
              </Label>
              {editingPost.featured_image ? (
                <div className="relative w-full mb-4 rounded-lg overflow-hidden border border-gray-200" style={{ maxHeight: '200px' }}>
                  <img src={editingPost.featured_image} alt="Featured" className="w-full h-full object-contain" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full p-1 bg-red-500 text-white hover:bg-red-600"
                    onClick={() => handleInputChange('featured_image', '')}
                    title={t('הסר תמונה', 'Remove Image')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-2">{t('אין תמונה ראשית נבחרה.', 'No featured image selected.')}</p>
              )}
              <Label htmlFor="featured_image_upload_input" className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[var(--secondary-color)] transition-colors text-sm flex items-center justify-center w-fit">
                {isUploadingImage ? t('מעלה...', 'Uploading...') : (editingPost.featured_image ? t('החלף תמונה', 'Replace Image') : t('העלה תמונה', 'Upload Image'))}
                <Input
                  id="featured_image_upload_input"
                  type="file"
                  accept="image/*,.svg"
                  className="hidden"
                  onChange={handleFeaturedImageUpload}
                  disabled={isUploadingImage}
                />
              </Label>
              {isUploadingImage && <p className="text-sm text-gray-500 mt-1">{t('מעלה תמונה...', 'Uploading image...')}</p>}
            </div>

            <div className="mt-4">
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                {t('גלריית מדיה לפוסט', 'Post Media Gallery')}
              </Label>
              <MediaUploader
                media={{ media_gallery: editingPost.media_gallery || [] }}
                sectionKey="media_gallery"
                onMediaChange={(updatedMedia) => handleMediaChange(updatedMedia.media_gallery)}
              />
            </div>

            <div className="flex items-center mt-6">
              <Switch
                checked={editingPost.is_published ?? true}
                onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                id="is-published"
              />
              <Label htmlFor="is-published" className="ml-2 text-sm text-[var(--text-color)] cursor-pointer">
                {t('פורסם באתר', 'Published on site')}
              </Label>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleSavePost}
                disabled={isSaving}
                className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--secondary-color)] smooth-transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? t('שומר...', 'Saving...') : (editingPost.id ? t('עדכן פוסט', 'Update Post') : t('שמור פוסט', 'Save Post'))}
              </Button>
              {editingPost.id && (
                <Button
                  onClick={() => setEditingPost(null)}
                  variant="outline"
                  className="px-6 py-3 rounded-lg font-semibold"
                >
                  {t('ביטול', 'Cancel')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[var(--text-color)]">
            {t('פוסטים קיימים', 'Existing Posts')}
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {blogPosts.map((post) => (
            <div key={post.id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <h4 className="font-medium text-[var(--text-color)]">
                  {language === 'he' ? post.title_he : post.title_en}
                </h4>
                <div
                  className="text-sm text-gray-600 line-clamp-1"
                  dangerouslySetInnerHTML={{__html: language === 'he' ? post.excerpt_he : post.excerpt_en}}
                />
                <p className="text-sm text-gray-500">{format(new Date(post.publish_date), 'dd/MM/yyyy', { locale: language === 'he' ? he : undefined })}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${post.is_published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {post.is_published ? t('פורסם', 'Published') : t('לא פורסם', 'Not Published')}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setEditingPost(post)} className="text-blue-600 hover:text-blue-800">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function PersonalWorkshopsTab({ t }) {
  const { language } = useLanguage();
  const [workshops, setWorkshops] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // Renamed to editingItem
  const [isSaving, setIsSaving] = useState(false);

  const loadWorkshops = useCallback(async () => {
    try {
      const data = await PersonalWorkshop.list('order_index');
      setWorkshops(data || []);
    } catch (error) {
      console.error("Error loading personal workshops:", error);
      setWorkshops([]);
    }
  }, []);

  useEffect(() => {
    loadWorkshops();
  }, [loadWorkshops]);

  const handleInputChange = (field, value) => {
    // Prevent storing empty p tags from quill for rich text fields
    let cleanedValue = value;
    if (['description_he', 'description_en'].includes(field) && typeof value === 'string' && value === '<p><br></p>') {
      cleanedValue = '';
    }
    setEditingItem(prev => ({ ...prev, [field]: cleanedValue }));
  };

  const handleMediaChange = (mediaGallery) => {
    setEditingItem(prev => ({ ...prev, media_gallery: mediaGallery }));
  };

  const handleAddNewWorkshop = () => {
    setEditingItem({
      type: 'workshop',
      title_he: '',
      title_en: '',
      description_he: '',
      description_en: '',
      is_published: true,
      duration_he: '',
      duration_en: '',
      participants: '',
      price_he: '',
      price_en: '',
      order_index: (workshops?.length || 0) + 1,
      media_gallery: []
    });
  };

  const handleSaveWorkshop = async () => {
    setIsSaving(true);
    try {
      if (editingItem.id) {
        const { id, created_date, updated_date, created_by, ...updateData } = editingItem;
        await PersonalWorkshop.update(id, updateData);
      } else {
        await PersonalWorkshop.create(editingItem);
      }
      await loadWorkshops();
      setEditingItem(null);
      alert(t('הסדנה נשמרה בהצלחה!', 'Workshop saved successfully!'));
    } catch (error) {
      console.error('Error saving personal workshop:', error);
      alert(t('שגיאה בשמירת הסדנה', 'Error saving workshop'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkshop = async (itemId) => {
    if (confirm(t('האם אתה בטוח שברצונך למחוק את הסדנה הזו?', 'Are you sure you want to delete this workshop?'))) {
      try {
        await PersonalWorkshop.delete(itemId);
        await loadWorkshops();
        alert(t('הסדנה נמחקה בהצלחה!', 'Workshop deleted successfully!'));
      } catch (error) {
        console.error("Error deleting workshop:", error);
        alert(t('שגיאה במחיקת הסדנה', 'Error deleting workshop'));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[var(--text-color)]">
          {t('ניהול סדנאות לפרטיות', 'Manage Personal Workshops')}
        </h2>
        <Button
          onClick={handleAddNewWorkshop}
          className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('הוסף סדנה חדשה', 'Add New Workshop')}
        </Button>
      </div>

      {editingItem && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
            {editingItem.id ? t('ערוך פריט', 'Edit Item') : t('הוסף פריט חדש', 'Add New Item')}
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('כותרת (עברית)', 'Title (Hebrew)')} value={editingItem.title_he || ''} onChange={(e) => handleInputChange('title_he', e.target.value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כותרת (אנגלית)', 'Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={editingItem.title_en || ''}
                  onChange={(e) => handleInputChange('title_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            
            <div>
              <Label>{t('סוג תוכן', 'Content Type')}</Label>
              <Select value={editingItem?.type || ''} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger><SelectValue placeholder={t('בחר סוג', 'Select Type')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture">{t('הרצאה', 'Lecture')}</SelectItem>
                  <SelectItem value="workshop">{t('סדנה', 'Workshop')}</SelectItem>
                  <SelectItem value="consulting">{t('ייעוץ', 'Consulting')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <RichTextField label={t('תיאור (עברית)', 'Description (Hebrew)')} value={editingItem.description_he || ''} onChange={(value) => handleInputChange('description_he', value)} />
            <div>
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תיאור (אנגלית)', 'Description (English)')}</Label>
              <div dir="ltr">
                <RichTextEditor value={editingItem.description_en || ''} onChange={(value) => handleInputChange('description_en', value)} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('משך (עברית)', 'Duration (Hebrew)')} value={editingItem.duration_he || ''} onChange={(e) => handleInputChange('duration_he', e.target.value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('משך (אנגלית)', 'Duration (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={editingItem.duration_en || ''}
                  onChange={(e) => handleInputChange('duration_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('מספר משתתפים', 'Number of Participants')} value={editingItem.participants || ''} onChange={(e) => handleInputChange('participants', e.target.value)} placeholder="8-12" />
              <InputField label={t('מחיר (עברית)', 'Price (Hebrew)')} value={editingItem.price_he || ''} onChange={(e) => handleInputChange('price_he', e.target.value)} placeholder="לפי בקשה" />
            </div>
            <div>
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                {t('מחיר (אנגלית)', 'Price (English)')}
              </Label>
              <Input
                type="text"
                dir="ltr"
                value={editingItem.price_en || ''}
                onChange={(e) => handleInputChange('price_en', e.target.value)}
                placeholder="Upon request"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
              />
            </div>
            <InputField label={t('סדר הצגה', 'Display Order')} type="number" value={editingItem.order_index || 0} onChange={(e) => handleInputChange('order_index', parseInt(e.target.value) || 0)} />

            <div className="mt-4">
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                {t('גלריית מדיה לפריט', 'Item Media Gallery')}
              </Label>
              <MediaUploader
                media={{ media_gallery: editingItem.media_gallery || [] }}
                sectionKey="media_gallery"
                onMediaChange={(updatedMedia) => handleMediaChange(updatedMedia.media_gallery)}
              />
            </div>

            <div className="flex items-center mt-6">
              <Switch
                checked={editingItem.is_published ?? true}
                onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                id="is-published"
              />
              <Label htmlFor="is-published" className="ml-2 text-sm text-[var(--text-color)] cursor-pointer">
                {t('פורסם באתר', 'Published on site')}
              </Label>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleSaveWorkshop}
                disabled={isSaving}
                className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--secondary-color)] smooth-transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? t('שומר...', 'Saving...') : (editingItem.id ? t('עדכן סדנה', 'Update Workshop') : t('שמור סדנה', 'Save Workshop'))}
              </Button>
              {editingItem.id && (
                <Button
                  onClick={() => setEditingItem(null)}
                  variant="outline"
                  className="px-6 py-3 rounded-lg font-semibold"
                >
                  {t('ביטול', 'Cancel')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[var(--text-color)]">
            {t('סדנאות קיימות', 'Existing Workshops')}
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {workshops.map((workshop) => (
            <div key={workshop.id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    workshop.type === 'workshop' ? 'bg-blue-100 text-blue-800' :
                    workshop.type === 'consulting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800' // Default to lecture/other if not workshop/consulting
                  }`}>
                    {workshop.type === 'workshop' ? t('סדנה', 'Workshop') :
                    workshop.type === 'consulting' ? t('ייעוץ', 'Consulting') :
                    t('הרצאה', 'Lecture')}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${workshop.is_published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {workshop.is_published ? t('פורסם', 'Published') : t('לא פורסם', 'Not Published')}
                  </span>
                </div>
                <h4 className="font-medium text-[var(--text-color)]">
                  {language === 'he' ? workshop.title_he : workshop.title_en}
                </h4>
                <div
                  className="text-sm text-gray-600 line-clamp-1"
                  dangerouslySetInnerHTML={{ __html: language === 'he' ? workshop.description_he : workshop.description_en }}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setEditingItem(workshop)} className="text-blue-600 hover:text-blue-800">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteWorkshop(workshop.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function CorporateLecturesTab({ t }) {
  const { language } = useLanguage();
  const [lectures, setLectures] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // Renamed to editingItem
  const [isSaving, setIsSaving] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'women', 'leaders'

  const loadLectures = useCallback(async () => {
    try {
      const data = await CorporateLecture.list('order_index');
      setLectures(data || []);
    } catch (error) {
      console.error("Error loading corporate lectures:", error);
      setLectures([]);
    }
  }, []);

  useEffect(() => {
    loadLectures();
  }, [loadLectures]);

  const handleInputChange = (field, value) => {
    // Prevent storing empty p tags from quill for rich text fields
    let cleanedValue = value;
    if (['description_he', 'description_en'].includes(field) && typeof value === 'string' && value === '<p><br></p>') {
      cleanedValue = '';
    }
    setEditingItem(prev => ({ ...prev, [field]: cleanedValue }));
  };

  const handleMediaChange = (mediaGallery) => {
    setEditingItem(prev => ({ ...prev, media_gallery: mediaGallery }));
  };

  const handleAddNewLecture = () => {
    setEditingItem({
      target_audience_group: 'women', // Default for new lectures
      type: 'lecture',
      title_he: '',
      title_en: '',
      description_he: '',
      description_en: '',
      is_published: true,
      duration_he: '',
      duration_en: '',
      audience_he: '',
      audience_en: '',
      button_text_he: '',
      button_text_en: '',
      button_link: '',
      order_index: (lectures?.length || 0) + 1,
      media_gallery: []
    });
  };

  const handleSaveLecture = async () => {
    setIsSaving(true);
    try {
      if (editingItem.id) {
        const { id, created_date, updated_date, created_by, ...updateData } = editingItem;
        await CorporateLecture.update(id, updateData);
      } else {
        await CorporateLecture.create(editingItem);
      }
      await loadLectures();
      setEditingItem(null);
      alert(t('ההרצאה נשמרה בהצלחה!', 'Lecture saved successfully!'));
    } catch (error) {
      console.error('Error saving corporate lecture:', error);
      alert(t('שגיאה בשמירת ההרצאה', 'Error saving lecture'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLecture = async (itemId) => {
    if (confirm(t('האם אתה בטוח שברצונך למחוק את ההרצאה הזו?', 'Are you sure you want to delete this lecture?'))) {
      try {
        await CorporateLecture.delete(itemId);
        await loadLectures();
        alert(t('ההרצאה נמחקקה בהצלחה!', 'Lecture deleted successfully!'));
      } catch (error) {
        console.error("Error deleting lecture:", error);
        alert(t('שגיאה במחיקת ההרצאה', 'Error deleting lecture'));
      }
    }
  };

  const filteredLectures = lectures.filter(lecture => filter === 'all' || lecture.target_audience_group === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[var(--text-color)]">
          {t('ניהול הרצאות לארגונים', 'Manage Corporate Lectures')}
        </h2>
        <Button
          onClick={handleAddNewLecture}
          className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('הוסף הרצאה חדשה', 'Add New Lecture')}
        </Button>
      </div>

      {editingItem && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
            {editingItem.id ? t('ערוך פריט', 'Edit Item') : t('הוסף פריט חדש', 'Add New Item')}
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>{t('קהל יעד', 'Target Audience')}</Label>
                <Select value={editingItem.target_audience_group || ''} onValueChange={(value) => handleInputChange('target_audience_group', value)}>
                  <SelectTrigger><SelectValue placeholder={t('בחר קהל יעד', 'Select Audience')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="women">{t('נשים עובדות ומנהלות', 'Women Employees & Managers')}</SelectItem>
                    <SelectItem value="leaders">{t('דרג ניהולי', 'Management Level')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('סוג תוכן', 'Content Type')}</Label>
                <Select value={editingItem?.type || ''} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger><SelectValue placeholder={t('בחר סוג', 'Select Type')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">{t('הרצאה', 'Lecture')}</SelectItem>
                    <SelectItem value="workshop">{t('סדנה', 'Workshop')}</SelectItem>
                    <SelectItem value="consulting">{t('ייעוץ', 'Consulting')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <InputField type="number" label={t('סדר הצגה', 'Order Index')} value={editingItem.order_index || 0} onChange={(e) => handleInputChange('order_index', parseInt(e.target.value, 10))} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('כותרת (עברית)', 'Title (Hebrew)')} value={editingItem.title_he || ''} onChange={(e) => handleInputChange('title_he', e.target.value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כותרת (אנגלית)', 'Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={editingItem.title_en || ''}
                  onChange={(e) => handleInputChange('title_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <RichTextField label={t('תיאור (עברית)', 'Description (Hebrew)')} value={editingItem.description_he || ''} onChange={(value) => handleInputChange('description_he', value)} />
            <div>
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{t('תיאור (אנגלית)', 'Description (English)')}</Label>
              <div dir="ltr">
                <RichTextEditor value={editingItem.description_en || ''} onChange={(value) => handleInputChange('description_en', value)} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('משך (עברית)', 'Duration (Hebrew)')} value={editingItem.duration_he || ''} onChange={(e) => handleInputChange('duration_he', e.target.value)} />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('משך (אנגלית)', 'Duration (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={editingItem.duration_en || ''}
                  onChange={(e) => handleInputChange('duration_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('קהל יעד (עברית)', 'Target Audience (Hebrew)')} value={editingItem.audience_he || ''} onChange={(e) => handleInputChange('audience_he', e.target.value)} placeholder="20-200 משתתפים" />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('קהל יעד (אנגלית)', 'Target Audience (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={editingItem.audience_en || ''}
                  onChange={(e) => handleInputChange('audience_en', e.target.value)}
                  placeholder="20-200 participants"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <InputField label={t('טקסט כפתור (עברית)', 'Button Text (Hebrew)')} value={editingItem.button_text_he || ''} onChange={(e) => handleInputChange('button_text_he', e.target.value)} placeholder="לפרטים נוספים" />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('טקסט כפתור (אנגלית)', 'Button Text (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={editingItem.button_text_en || ''}
                  onChange={(e) => handleInputChange('button_text_en', e.target.value)}
                  placeholder="More Details"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('קישור כפתור', 'Button Link')}
                </Label>
                <Input
                  type="url"
                  dir="ltr"
                  value={editingItem.button_link || ''}
                  onChange={(e) => handleInputChange('button_link', e.target.value)}
                  placeholder="https://example.com/details"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                {t('גלריית מדיה לפריט', 'Item Media Gallery')}
              </Label>
              <MediaUploader
                media={{ media_gallery: editingItem.media_gallery || [] }}
                sectionKey="media_gallery"
                onMediaChange={(updatedMedia) => handleMediaChange(updatedMedia.media_gallery)}
              />
            </div>

            <div className="flex items-center mt-6">
              <Switch
                checked={editingItem.is_published ?? true}
                onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                id="is-published"
              />
              <Label htmlFor="is-published" className="ml-2 text-sm text-[var(--text-color)] cursor-pointer">
                {t('פורסם באתר', 'Published on site')}
              </Label>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleSaveLecture}
                disabled={isSaving}
                className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--secondary-color)] smooth-transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? t('שומר...', 'Saving...') : (editingItem.id ? t('עדכן הרצאה', 'Update Lecture') : t('שמור הרצאה', 'Save Lecture'))}
              </Button>
              {editingItem.id && (
                <Button
                  onClick={() => setEditingItem(null)}
                  variant="outline"
                  className="px-6 py-3 rounded-lg font-semibold"
                >
                  {t('ביטול', 'Cancel')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[var(--text-color)]">
            {t('הרצאות קיימות', 'Existing Lectures')}
          </h3>
          <div className="flex gap-2 mt-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-[var(--primary-color)] text-white' : ''}
            >
              {t('כל ההרצאות', 'All Lectures')}
            </Button>
            <Button
              variant={filter === 'women' ? 'default' : 'outline'}
              onClick={() => setFilter('women')}
              className={filter === 'women' ? 'bg-[var(--primary-color)] text-white' : ''}
            >
              {t('לנשים עובדות ומנהלות', 'For Working Women & Managers')}
            </Button>
            <Button
              variant={filter === 'leaders' ? 'default' : 'outline'}
              onClick={() => setFilter('leaders')}
              className={filter === 'leaders' ? 'bg-[var(--primary-color)] text-white' : ''}
            >
              {t('לדרג ניהולי', 'For Management Level')}
            </Button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredLectures.map((lecture) => (
            <div key={lecture.id} className="px-6 py-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lecture.type === 'workshop' ? 'bg-blue-100 text-blue-800' :
                    lecture.type === 'consulting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {lecture.type === 'workshop' ? t('סדנה', 'Workshop') :
                    lecture.type === 'consulting' ? t('ייעוץ', 'Consulting') :
                    t('הרצאה', 'Lecture')}
                  </span>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${lecture.is_published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {lecture.is_published ? t('פורסם', 'Published') : t('לא פורסם', 'Not Published')}
                  </span>
                  {lecture.target_audience_group && (
                    <span className={`px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800`}>
                      {lecture.target_audience_group === 'women' ? t('לנשים', 'For Women') : t('לדרג ניהולי', 'For Leaders')}
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-[var(--text-color)]">
                  {language === 'he' ? lecture.title_he : lecture.title_en}
                </h4>
                <div
                  className="text-sm text-gray-600 line-clamp-1"
                  dangerouslySetInnerHTML={{ __html: language === 'he' ? lecture.description_he : lecture.description_en }}
                />
                {lecture.button_link && (
                  <a href={lecture.button_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm mt-1 block">
                    {language === 'he' ? lecture.button_text_he || t('קישור', 'Link') : lecture.button_text_en || t('Link', 'Link')}
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setEditingItem(lecture)} className="text-blue-600 hover:text-blue-800">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteLecture(lecture.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function SiteAdmin() {
  const { language, t } = useLanguage();
  const { siteSettings: contextSettings, reloadSettings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState('basic');
  const [siteSettings, setSiteSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const tabs = useMemo(() => [
    { key: 'basic', label: t('הגדרות בסיסיות', 'Basic Settings'), icon: Settings },
    { key: 'colors', label: t('צבעים וגופנים', 'Colors & Fonts'), icon: Palette },
    { key: 'navigation', label: t('ניווט ותפריטים', 'Navigation & Menus'), icon: Menu },
    { key: 'homepage', label: t('עמוד הבית', 'Homepage'), icon: Home },
    { key: 'pages', label: t('ניהול עמודים', 'Page Management'), icon: FileText },
    { key: 'contact-form', label: t('טופס יצירת קשר', 'Contact Form'), icon: MessageSquare },
    { key: 'media', label: t('מדיה ותמונות', 'Media & Images'), icon: ImageIcon },
    { key: 'social', label: t('רשתות חברתיות', 'Social Media'), icon: Share2 },
    { key: 'backup', label: t('גיבוי וייצוא', 'Backup & Export'), icon: Download },
    { key: 'advanced', label: t('הגדרות מתקדמות', 'Advanced Settings'), icon: Cog },
    { key: 'manage-testimonials', label: t('ניהול המלצות', 'Manage Testimonials'), icon: Star },
    { key: 'manage-personal', label: t('ניהול לפרטיות', 'Manage Personal'), icon: Briefcase },
    { key: 'manage-corporate', label: t('ניהול לארגונים', 'Manage Corporate'), icon: Building2 },
    { key: 'manage-blog', label: t('ניהול בלוג', 'Manage Blog'), icon: FileText },
    { key: 'manage-podcast', label: t('ניהול פודקסט', 'Manage Podcast'), icon: Mic }
  ], [t]);


  useEffect(() => {
    const initAndLoad = async () => {
      if (contextSettings) {
        const defaultPageMedia = {
          home: [], home_features: [], about: [],
          personal_workshops: [], testimonials: [],
          blog: [], contact: [], podcast: [],
          logo_carousel_logos: [],
          corporate_lectures_women: [],
          corporate_lectures_leaders: [],
          general_media: [],
        };
        
        const defaultPageMediaPosition = {
          home: "center center", home_features: "center center", about: "center center", 
          personal_workshops: "center center", 
          testimonials: "center center", 
          blog: "center center", contact: "center center", podcast: "center center",
          corporate_lectures_women: "center center",
          corporate_lectures_leaders: "center center",
        };

        const defaultCorporatePageSettings = {
            title_he: '', title_en: '', description_he: '', description_en: '',
            benefits_title_he: '', benefits_title_en: '',
            benefit_1_title_he: '', benefit_1_title_en: '', benefit_1_desc_he: '', benefit_1_desc_en: '', benefit_1_icon: 'Users',
            benefit_2_title_he: '', benefit_2_title_en: '', benefit_2_desc_he: '', benefit_2_desc_en: '', benefit_2_icon: 'TrendingUp',
            benefit_3_title_he: '', benefit_3_title_en: '', benefit_3_desc_he: '', benefit_3_desc_en: '', benefit_3_icon: 'Award',
        };
        
        setSiteSettings(prev => ({
          ...contextSettings,
          managers: (contextSettings.managers || []).map(manager => ({
            ...manager,
            manager_media: manager.manager_media || [],
            manager_media_position: manager.manager_media_position || 'center center',
            order_index: manager.order_index || 0 // Initialize order_index
          })),
          page_media: {
            ...defaultPageMedia,
            home: contextSettings.media_home || [],
            home_features: contextSettings.media_home_features || [],
            about: contextSettings.media_about || [],
            personal_workshops: contextSettings.media_personal_workshops || [],
            testimonials: contextSettings.media_testimonials || [],
            blog: contextSettings.media_blog || [],
            contact: contextSettings.media_contact || [],
            podcast: contextSettings.media_podcast || [],
            logo_carousel_logos: contextSettings.media_logo_carousel_logos || [],
            corporate_lectures_women: contextSettings.media_corporate_lectures_women || [],
            corporate_lectures_leaders: contextSettings.media_corporate_lectures_leaders || [],
            ...(contextSettings.page_media || {})
          },
          page_media_position: {
            ...defaultPageMediaPosition,
            home: contextSettings.media_position_home || defaultPageMediaPosition.home,
            home_features: contextSettings.media_position_home_features || defaultPageMediaPosition.home_features,
            about: contextSettings.media_position_about || defaultPageMediaPosition.about,
            personal_workshops: contextSettings.media_position_personal_workshops || defaultPageMediaPosition.personal_workshops,
            testimonials: contextSettings.media_position_testimonials || defaultPageMediaPosition.testimonials,
            blog: contextSettings.media_position_blog || defaultPageMediaPosition.blog,
            contact: contextSettings.media_position_contact || defaultPageMediaPosition.contact,
            podcast: contextSettings.media_position_podcast || defaultPageMediaPosition.podcast,
            corporate_lectures_women: contextSettings.media_position_corporate_lectures_women || defaultPageMediaPosition.corporate_lectures_women,
            corporate_lectures_leaders: contextSettings.media_position_corporate_lectures_leaders || defaultPageMediaPosition.corporate_lectures_leaders,
            ...(contextSettings.page_media_position || {})
          },
          corporate_pages: {
            women: {
                ...defaultCorporatePageSettings,
                ...(contextSettings.corporate_pages?.women || {})
            },
            leaders: {
                ...defaultCorporatePageSettings,
                ...(contextSettings.corporate_pages?.leaders || {})
            },
          },
          stats: contextSettings.stats || [],
          logo_carousel_controls_enabled: contextSettings.logo_carousel_controls_enabled ?? false,
          logo_carousel_animation: contextSettings.logo_carousel_animation || 'scroll',
          top_cta_title_he: contextSettings.top_cta_title_he || '',
          top_cta_title_en: contextSettings.top_cta_title_en || '',
          top_cta_subtitle_he: contextSettings.top_cta_subtitle_he || '',
          top_cta_subtitle_en: contextSettings.top_cta_subtitle_en || '',
          top_cta_button_he: contextSettings.top_cta_button_he || '',
          top_cta_button_en: contextSettings.top_cta_button_en || '',
          top_cta_bg_color: contextSettings.top_cta_bg_color || '',
          header_admin_menu_color: contextSettings.header_admin_menu_color || '',
          contact_form_enabled: contextSettings.contact_form_enabled ?? true,
          contact_form_title_he: contextSettings.contact_form_title_he || '',
          contact_form_title_en: contextSettings.contact_form_title_en || '',
          contact_form_subtitle_he: contextSettings.contact_form_subtitle_he || '',
          contact_form_subtitle_en: contextSettings.contact_form_subtitle_en || '',
          contact_form_success_message_he: contextSettings.contact_form_success_message_he || '',
          contact_form_success_message_en: contextSettings.contact_form_success_message_en || '',
          contact_form_email_recipient: contextSettings.contact_form_email_recipient || '',
          contact_form_honeypot_field: contextSettings.contact_form_honeypot_field || '',
          testimonials_carousel_title_he: contextSettings.testimonials_carousel_title_he || '',
          testimonials_carousel_title_en: contextSettings.testimonials_carousel_title_en || '',
          testimonials_carousel_subtitle_he: contextSettings.testimonials_carousel_subtitle_he || '',
          testimonials_carousel_subtitle_en: contextSettings.testimonials_carousel_subtitle_en || '',
          testimonials_carousel_bg_color: contextSettings.testimonials_carousel_bg_color || '#f9fafb',
          testimonials_carousel_text_color: contextSettings.testimonials_carousel_text_color || '#2e2e2e',
          testimonials_carousel_button_text_he: contextSettings.testimonials_carousel_button_text_he || '', // NEW
          testimonials_carousel_button_text_en: contextSettings.testimonials_carousel_button_text_en || '', // NEW
          testimonials_carousel_button_bg_color: contextSettings.testimonials_carousel_button_bg_color || '#005e6c', // NEW
          testimonials_carousel_button_text_color: contextSettings.testimonials_carousel_button_text_color || '#ffffff', // NEW
          workshops_carousel_enabled: contextSettings.workshops_carousel_enabled ?? false,
          workshops_carousel_show_personal: contextSettings.workshops_carousel_show_personal ?? false, // Added new setting
          workshops_carousel_title_he: contextSettings.workshops_carousel_title_he || '',
          workshops_carousel_title_en: contextSettings.workshops_carousel_title_en || '',
          workshops_carousel_subtitle_he: contextSettings.workshops_carousel_subtitle_he || '',
          workshops_carousel_subtitle_en: contextSettings.workshops_carousel_subtitle_en || '',
          workshops_carousel_bg_color: contextSettings.workshops_carousel_bg_color || '#ffffff',
          workshops_carousel_text_color: contextSettings.workshops_carousel_text_color || '#2e2e2e',
          workshops_carousel_card_bg_color: contextSettings.workshops_carousel_card_bg_color || '#ffffff',
          contact_page_form_cta_title_he: contextSettings.contact_page_form_cta_title_he || '',
          contact_page_form_cta_title_en: contextSettings.contact_page_form_cta_title_en || '',
          contact_page_form_cta_subtitle_he: contextSettings.contact_page_form_cta_subtitle_he || '',
          contact_page_form_cta_subtitle_en: contextSettings.contact_page_form_cta_subtitle_en || '',
          contact_page_form_cta_button_he: contextSettings.contact_page_form_cta_button_he || '',
          contact_page_form_cta_button_en: contextSettings.contact_page_form_cta_button_en || '',
          contact_page_form_cta_bg_color: contextSettings.contact_page_form_cta_bg_color || '#ffffff',
          contact_page_form_cta_button_bg_color: contextSettings.contact_page_form_cta_button_bg_color || '#005e6c',
          contact_page_form_cta_button_text_color: contextSettings.contact_page_form_cta_button_text_color || '#ffffff',
          feature_1_button_text_he: contextSettings.feature_1_button_text_he || '',
          feature_1_button_text_en: contextSettings.feature_1_button_text_en || '',
          feature_1_button_link: contextSettings.feature_1_button_link || '',
          feature_2_button_text_he: contextSettings.feature_2_button_text_he || '',
          feature_2_button_text_en: contextSettings.feature_2_button_text_en || '',
          feature_2_button_link: contextSettings.feature_2_button_link || '',
          feature_3_button_text_he: contextSettings.feature_3_button_text_he || '',
          feature_3_button_text_en: contextSettings.feature_3_button_text_en || '',
          feature_3_button_link: contextSettings.feature_3_button_link || '',
          // New bot feature fields
          feature_4_enabled: contextSettings.feature_4_enabled ?? false,
          feature_4_icon: contextSettings.feature_4_icon || 'Users',
          feature_4_title_he: contextSettings.feature_4_title_he || '',
          feature_4_title_en: contextSettings.feature_4_title_en || '',
          feature_4_desc_he: contextSettings.feature_4_desc_he || '',
          feature_4_desc_en: contextSettings.feature_4_desc_en || '',
          feature_4_button_text_he: contextSettings.feature_4_button_text_he || '',
          feature_4_button_text_en: contextSettings.feature_4_button_text_en || '',
          feature_4_button_link: contextSettings.feature_4_button_link || '',
          feature_4_bot_image: contextSettings.feature_4_bot_image || '',
          // New footer bot link fields
          footer_bot_link_enabled: contextSettings.footer_bot_link_enabled ?? false,
          footer_bot_link_text_he: contextSettings.footer_bot_link_text_he || '',
          footer_bot_link_text_en: contextSettings.footer_bot_link_text_en || '',
          footer_bot_link_url: contextSettings.footer_bot_link_url || '',
          home_stats_section_title_he: contextSettings.home_stats_section_title_he || '',
          home_stats_section_title_en: contextSettings.home_stats_section_title_en || '',
          home_stats_section_bg_color: contextSettings.home_stats_section_bg_color || '',
          home_stat_1_number: contextSettings.home_stat_1_number || '',
          home_stat_1_text_he: contextSettings.home_stat_1_text_he || '',
          home_stat_1_text_en: contextSettings.home_stat_1_text_en || '',
          home_stat_2_number: contextSettings.home_stat_2_number || '',
          home_stat_2_text_he: contextSettings.home_stat_2_text_he || '',
          home_stat_2_text_en: contextSettings.home_stat_2_text_en || '',
          home_stat_3_number: contextSettings.home_stat_3_number || '',
          home_stat_3_text_he: contextSettings.home_stat_3_text_he || '',
          home_stat_3_text_en: contextSettings.home_stat_3_text_en || '',
          // --- Start of PersonalPageSettings specific initializations ---
          personal_benefits_title_he: contextSettings.personal_benefits_title_he || '',
          personal_benefits_title_en: contextSettings.personal_benefits_title_en || '',
          personal_benefit_1_icon: contextSettings.personal_benefit_1_icon || 'CheckCircle',
          personal_benefit_1_title_he: contextSettings.personal_benefit_1_title_he || '',
          personal_benefit_1_title_en: contextSettings.personal_benefit_1_title_en || '',
          personal_benefit_1_desc_he: contextSettings.personal_benefit_1_desc_he || '',
          personal_benefit_1_desc_en: contextSettings.personal_benefit_1_desc_en || '',
          personal_benefit_2_icon: contextSettings.personal_benefit_2_icon || 'CheckCircle',
          personal_benefit_2_title_he: contextSettings.personal_benefit_2_title_he || '',
          personal_benefit_2_title_en: contextSettings.personal_benefit_2_title_en || '',
          personal_benefit_2_desc_he: contextSettings.personal_benefit_2_desc_he || '',
          personal_benefit_2_desc_en: contextSettings.personal_benefit_2_desc_en || '',
          personal_benefit_3_icon: contextSettings.personal_benefit_3_icon || 'CheckCircle',
          personal_benefit_3_title_he: contextSettings.personal_benefit_3_title_he || '',
          personal_benefit_3_title_en: contextSettings.personal_benefit_3_title_en || '',
          personal_benefit_3_desc_he: contextSettings.personal_benefit_3_desc_he || '',
          personal_benefit_3_desc_en: contextSettings.personal_benefit_3_desc_en || '',
          // --- End of PersonalPageSettings specific initializations ---
          about_intro_section_bg_color: contextSettings.about_intro_section_bg_color || '', // New field initialization
          about_intro_text_color: contextSettings.about_intro_text_color || '', // New field initialization
          carousel_order: contextSettings.carousel_order || [], // Initialize carousel_order array
        }));
        setIsLoading(false);
      }
    };
    initAndLoad();
  }, [contextSettings]);

  const handleSettingsChange = useCallback((key, value) => {
    setSiteSettings(prev => {
      const newSettings = { ...prev };
      if (key.includes('.')) {
        const parts = key.split('.');
        let current = newSettings;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        current[parts[parts.length - 1]] = value;
      } else {
        newSettings[key] = value;
      }
      return newSettings;
    });
  }, []);

  const handleRichTextChange = useCallback((field, value, isNested = false) => {
    // Prevent storing empty p tags from quill
    const cleanValue = value === '<p><br></p>' ? '' : value;
    if (isNested) {
      return cleanValue; // Return cleaned value for nested updates (e.g., manager_desc)
    }
    handleSettingsChange(field, cleanValue);
  }, [handleSettingsChange]);

  const handleCorporatePageChangeFromSiteAdmin = useCallback((tabKey, field, value) => {
    const updatedCorporatePages = {
      ...(siteSettings.corporate_pages || {}),
      [tabKey]: {
        ...(siteSettings.corporate_pages?.[tabKey] || {}),
        [field]: value
      }
    };
    handleSettingsChange('corporate_pages', updatedCorporatePages);
  }, [siteSettings.corporate_pages, handleSettingsChange]);

  const handleManagerChangeFromSiteAdmin = useCallback((index, field, value) => {
    const newManagers = [...(siteSettings.managers || [])];
    if (newManagers[index]) { // Ensure manager exists at index
        newManagers[index] = { ...newManagers[index], [field]: value };
    }
    handleSettingsChange('managers', newManagers);
  }, [siteSettings.managers, handleSettingsChange]);

  const addManagerFromSiteAdmin = useCallback(() => {
    const newManager = {
      manager_name_he: '', manager_name_en: '', manager_desc_he: '', manager_desc_en: '',
      order_index: (siteSettings.managers?.length || 0) + 1,
      manager_media: [], manager_media_position: 'center center'
    };
    handleSettingsChange('managers', [...(siteSettings.managers || []), newManager]);
  }, [siteSettings.managers, handleSettingsChange]);

  const removeManagerFromSiteAdmin = useCallback((index) => {
    if (window.confirm(t('האם אתה בטוח שברצונך למחוק מנהלת זו?', 'Are you sure you want to delete this manager?'))) {
      const updatedManagers = [...siteSettings.managers];
      updatedManagers.splice(index, 1);
      handleSettingsChange('managers', updatedManagers);
    }
  }, [siteSettings.managers, handleSettingsChange, t]);

  const handleSaveSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      const s = siteSettings;

      // 1. GlobalSettings
      const globalData = {
        site_title_he: s.site_title_he, site_title_en: s.site_title_en,
        tagline_he: s.tagline_he, tagline_en: s.tagline_en,
        logo_url_he: s.logo_url_he, logo_url_en: s.logo_url_en,
        footer_logo_url_he: s.footer_logo_url_he, footer_logo_url_en: s.footer_logo_url_en,
        primary_color: s.primary_color, secondary_color: s.secondary_color,
        accent_color: s.accent_color, text_color: s.text_color, background_color: s.background_color,
        header_admin_menu_color: s.header_admin_menu_color,
        font_family_he: s.font_family_he, font_family_en: s.font_family_en,
        font_size_base: s.font_size_base, font_weight_bold: s.font_weight_bold,
        newsletter_groups: s.newsletter_groups,
        // Nav
        nav_home_he: s.nav_home_he, nav_home_en: s.nav_home_en,
        nav_about_he: s.nav_about_he, nav_about_en: s.nav_about_en,
        nav_personal_he: s.nav_personal_he, nav_personal_en: s.nav_personal_en,
        nav_corporate_he: s.nav_corporate_he, nav_corporate_en: s.nav_corporate_en,
        nav_testimonials_he: s.nav_testimonials_he, nav_testimonials_en: s.nav_testimonials_en,
        nav_podcast_he: s.nav_podcast_he, nav_podcast_en: s.nav_podcast_en,
        nav_blog_he: s.nav_blog_he, nav_blog_en: s.nav_blog_en,
        nav_contact_he: s.nav_contact_he, nav_contact_en: s.nav_contact_en,
        // Contact Info
        contact_phone: s.contact_phone, contact_email: s.contact_email, contact_whatsapp: s.contact_whatsapp,
        // Social
        instagram_url: s.instagram_url, linkedin_url: s.linkedin_url,
        facebook_url: s.facebook_url, youtube_url: s.youtube_url,
        // Footer
        footer_background_color: s.footer_background_color,
        footer_text_color: s.footer_text_color, footer_title_color: s.footer_title_color,
        footer_nav_title_he: s.footer_nav_title_he, footer_nav_title_en: s.footer_nav_title_en,
        footer_contact_title_he: s.footer_contact_title_he, footer_contact_title_en: s.footer_contact_title_en,
        footer_social_title_he: s.footer_social_title_he, footer_social_title_en: s.footer_social_title_en,
        footer_copyright_he: s.footer_copyright_he, footer_copyright_en: s.footer_copyright_en,
        footer_bot_link_enabled: s.footer_bot_link_enabled,
        footer_bot_link_text_he: s.footer_bot_link_text_he, footer_bot_link_text_en: s.footer_bot_link_text_en,
        footer_bot_link_url: s.footer_bot_link_url,
        // General Labels
        general_loading_he: s.general_loading_he, general_loading_en: s.general_loading_en,
        general_coming_soon_he: s.general_coming_soon_he, general_coming_soon_en: s.general_coming_soon_en,
        general_stay_updated_he: s.general_stay_updated_he, general_stay_updated_en: s.general_stay_updated_en,
        general_read_more_he: s.general_read_more_he, general_read_more_en: s.general_read_more_en,
        general_watch_video_he: s.general_watch_video_he, general_watch_video_en: s.general_watch_video_en,
        general_workshop_he: s.general_workshop_he, general_workshop_en: s.general_workshop_en,
        general_consulting_he: s.general_consulting_he, general_consulting_en: s.general_consulting_en,
        general_lecture_he: s.general_lecture_he, general_lecture_en: s.general_lecture_en,
        general_participants_he: s.general_participants_he, general_participants_en: s.general_participants_en,
        general_register_he: s.general_register_he, general_register_en: s.general_register_en,
        general_phone_he: s.general_phone_he, general_phone_en: s.general_phone_en,
        general_email_he: s.general_email_he, general_email_en: s.general_email_en,
        general_send_message_he: s.general_send_message_he, general_send_message_en: s.general_send_message_en,
        general_episode_he: s.general_episode_he, general_episode_en: s.general_episode_en,
        // Logo Carousel
        logo_carousel_title_he: s.logo_carousel_title_he, logo_carousel_title_en: s.logo_carousel_title_en,
        logo_carousel_bg_color: s.logo_carousel_bg_color,
        logo_carousel_controls_enabled: s.logo_carousel_controls_enabled,
        logo_carousel_animation: s.logo_carousel_animation,
        media_logo_carousel_logos: s.page_media?.logo_carousel_logos || []
      };

      // 2. HomePageSettings
      const homeData = {
        top_cta_title_he: s.top_cta_title_he, top_cta_title_en: s.top_cta_title_en,
        top_cta_subtitle_he: s.top_cta_subtitle_he, top_cta_subtitle_en: s.top_cta_subtitle_en,
        top_cta_button_he: s.top_cta_button_he, top_cta_button_en: s.top_cta_button_en,
        top_cta_bg_color: s.top_cta_bg_color,
        hero_title_he: s.hero_title_he, hero_title_en: s.hero_title_en,
        hero_subtitle_he: s.hero_subtitle_he, hero_subtitle_en: s.hero_subtitle_en,
        hero_subtitle_color: s.hero_subtitle_color,
        hero_cta_primary_he: s.hero_cta_primary_he, hero_cta_primary_en: s.hero_cta_primary_en,
        hero_cta_secondary_he: s.hero_cta_secondary_he, hero_cta_secondary_en: s.hero_cta_secondary_en,
        features_title_he: s.features_title_he, features_title_en: s.features_title_en,
        features_subtitle_he: s.features_subtitle_he, features_subtitle_en: s.features_subtitle_en,
        // Features 1-4
        feature_1_icon: s.feature_1_icon, feature_1_title_he: s.feature_1_title_he, feature_1_title_en: s.feature_1_title_en,
        feature_1_desc_he: s.feature_1_desc_he, feature_1_desc_en: s.feature_1_desc_en,
        feature_1_button_text_he: s.feature_1_button_text_he, feature_1_button_text_en: s.feature_1_button_text_en, feature_1_button_link: s.feature_1_button_link,
        feature_2_icon: s.feature_2_icon, feature_2_title_he: s.feature_2_title_he, feature_2_title_en: s.feature_2_title_en,
        feature_2_desc_he: s.feature_2_desc_he, feature_2_desc_en: s.feature_2_desc_en,
        feature_2_button_text_he: s.feature_2_button_text_he, feature_2_button_text_en: s.feature_2_button_text_en, feature_2_button_link: s.feature_2_button_link,
        feature_3_icon: s.feature_3_icon, feature_3_title_he: s.feature_3_title_he, feature_3_title_en: s.feature_3_title_en,
        feature_3_desc_he: s.feature_3_desc_he, feature_3_desc_en: s.feature_3_desc_en,
        feature_3_button_text_he: s.feature_3_button_text_he, feature_3_button_text_en: s.feature_3_button_text_en, feature_3_button_link: s.feature_3_button_link,
        feature_4_enabled: s.feature_4_enabled, feature_4_icon: s.feature_4_icon,
        feature_4_title_he: s.feature_4_title_he, feature_4_title_en: s.feature_4_title_en,
        feature_4_desc_he: s.feature_4_desc_he, feature_4_desc_en: s.feature_4_desc_en,
        feature_4_button_text_he: s.feature_4_button_text_he, feature_4_button_text_en: s.feature_4_button_text_en, feature_4_button_link: s.feature_4_button_link,
        feature_4_bot_image: s.feature_4_bot_image,
        // Carousels
        testimonials_carousel_title_he: s.testimonials_carousel_title_he, testimonials_carousel_title_en: s.testimonials_carousel_title_en,
        testimonials_carousel_subtitle_he: s.testimonials_carousel_subtitle_he, testimonials_carousel_subtitle_en: s.testimonials_carousel_subtitle_en,
        testimonials_carousel_bg_color: s.testimonials_carousel_bg_color, testimonials_carousel_text_color: s.testimonials_carousel_text_color,
        testimonials_carousel_button_text_he: s.testimonials_carousel_button_text_he, testimonials_carousel_button_text_en: s.testimonials_carousel_button_text_en,
        testimonials_carousel_button_bg_color: s.testimonials_carousel_button_bg_color, testimonials_carousel_button_text_color: s.testimonials_carousel_button_text_color,
        workshops_carousel_enabled: s.workshops_carousel_enabled, workshops_carousel_show_personal: s.workshops_carousel_show_personal,
        workshops_carousel_title_he: s.workshops_carousel_title_he, workshops_carousel_title_en: s.workshops_carousel_title_en,
        workshops_carousel_subtitle_he: s.workshops_carousel_subtitle_he, workshops_carousel_subtitle_en: s.workshops_carousel_subtitle_en,
        workshops_carousel_bg_color: s.workshops_carousel_bg_color, workshops_carousel_text_color: s.workshops_carousel_text_color,
        workshops_carousel_card_bg_color: s.workshops_carousel_card_bg_color,
        carousel_items_order: s.carousel_items_order,
        // CTA & Stats
        cta_section_title_he: s.cta_section_title_he, cta_section_title_en: s.cta_section_title_en,
        cta_section_subtitle_he: s.cta_section_subtitle_he, cta_section_subtitle_en: s.cta_section_subtitle_en,
        cta_section_button_he: s.cta_section_button_he, cta_section_button_en: s.cta_section_button_en,
        home_stats_section_bg_color: s.home_stats_section_bg_color, home_stats_section_text_color: s.home_stats_section_text_color,
        stats_section_title_he: s.stats_section_title_he, stats_section_title_en: s.stats_section_title_en,
        stats: s.stats,
        // Media
        media_home: s.page_media?.home || [],
        media_home_features: s.page_media?.home_features || [],
        media_position_home: s.page_media_position?.home,
        media_position_home_features: s.page_media_position?.home_features
      };

      // 3. AboutPageSettings
      const aboutData = {
        about_page_title_he: s.about_page_title_he, about_page_title_en: s.about_page_title_en,
        about_intro_text_he: s.about_intro_text_he, about_intro_text_en: s.about_intro_text_en,
        about_intro_section_bg_color: s.about_intro_section_bg_color, about_intro_text_color: s.about_intro_text_color,
        about_mission_title_he: s.about_mission_title_he, about_mission_title_en: s.about_mission_title_en,
        about_mission_text_he: s.about_mission_text_he, about_mission_text_en: s.about_mission_text_en,
        managers_section_title_he: s.managers_section_title_he, managers_section_title_en: s.managers_section_title_en,
        managers_section_bg_color: s.managers_section_bg_color, managers_section_text_color: s.managers_section_text_color,
        managers_section_title_color: s.managers_section_title_color,
        managers: s.managers,
        media_about: s.page_media?.about || [],
        media_position_about: s.page_media_position?.about
      };

      // 4. PersonalPageSettings
      const personalData = {
        personal_page_title_he: s.personal_page_title_he, personal_page_title_en: s.personal_page_title_en,
        personal_description_he: s.personal_description_he, personal_description_en: s.personal_description_en,
        personal_show_testimonials_button: s.personal_show_testimonials_button,
        personal_testimonials_button_text_he: s.personal_testimonials_button_text_he, personal_testimonials_button_text_en: s.personal_testimonials_button_text_en,
        personal_benefits_title_he: s.personal_benefits_title_he, personal_benefits_title_en: s.personal_benefits_title_en,
        personal_benefit_1_icon: s.personal_benefit_1_icon,
        personal_benefit_1_title_he: s.personal_benefit_1_title_he, personal_benefit_1_title_en: s.personal_benefit_1_title_en,
        personal_benefit_1_desc_he: s.personal_benefit_1_desc_he, personal_benefit_1_desc_en: s.personal_benefit_1_desc_en,
        personal_benefit_2_icon: s.personal_benefit_2_icon,
        personal_benefit_2_title_he: s.personal_benefit_2_title_he, personal_benefit_2_title_en: s.personal_benefit_2_title_en,
        personal_benefit_2_desc_he: s.personal_benefit_2_desc_he, personal_benefit_2_desc_en: s.personal_benefit_2_desc_en,
        personal_benefit_3_icon: s.personal_benefit_3_icon,
        personal_benefit_3_title_he: s.personal_benefit_3_title_he, personal_benefit_3_title_en: s.personal_benefit_3_title_en,
        personal_benefit_3_desc_he: s.personal_benefit_3_desc_he, personal_benefit_3_desc_en: s.personal_benefit_3_desc_en,
        media_personal_workshops: s.page_media?.personal_workshops || [],
        media_position_personal_workshops: s.page_media_position?.personal_workshops
      };

      // 5. CorporatePageSettings
      const corporateData = {
        corporate_pages: s.corporate_pages,
        media_corporate_lectures_women: s.page_media?.corporate_lectures_women || [],
        media_corporate_lectures_leaders: s.page_media?.corporate_lectures_leaders || [],
        media_position_corporate_lectures_women: s.page_media_position?.corporate_lectures_women,
        media_position_corporate_lectures_leaders: s.page_media_position?.corporate_lectures_leaders
      };

      // 6. TestimonialsPageSettings
      const testimonialsData = {
        testimonials_page_title_he: s.testimonials_page_title_he, testimonials_page_title_en: s.testimonials_page_title_en,
        testimonials_description_he: s.testimonials_description_he, testimonials_description_en: s.testimonials_description_en,
        media_testimonials: s.page_media?.testimonials || [],
        media_position_testimonials: s.page_media_position?.testimonials
      };

      // 7. PodcastPageSettings
      const podcastData = {
        podcast_page_title_he: s.podcast_page_title_he, podcast_page_title_en: s.podcast_page_title_en,
        podcast_description_he: s.podcast_description_he, podcast_description_en: s.podcast_description_en,
        podcast_bg_color: s.podcast_bg_color,
        podcast_spotify_url: s.podcast_spotify_url, podcast_apple_url: s.podcast_apple_url,
        podcast_youtube_url: s.podcast_youtube_url, podcast_google_url: s.podcast_google_url,
        media_podcast: s.page_media?.podcast || [],
        media_position_podcast: s.page_media_position?.podcast
      };

      // 8. BlogPageSettings
      const blogData = {
        blog_page_title_he: s.blog_page_title_he, blog_page_title_en: s.blog_page_title_en,
        blog_description_he: s.blog_description_he, blog_description_en: s.blog_description_en,
        media_blog: s.page_media?.blog || [],
        media_position_blog: s.page_media_position?.blog
      };

      // 9. ContactPageSettings
      const contactData = {
        contact_page_title_he: s.contact_page_title_he, contact_page_title_en: s.contact_page_title_en,
        contact_page_subtitle_he: s.contact_page_subtitle_he, contact_page_subtitle_en: s.contact_page_subtitle_en,
        contact_methods_title_he: s.contact_methods_title_he, contact_methods_title_en: s.contact_methods_title_en,
        contact_social_title_he: s.contact_social_title_he, contact_social_title_en: s.contact_social_title_en,
        contact_form_enabled: s.contact_form_enabled,
        contact_form_title_he: s.contact_form_title_he, contact_form_title_en: s.contact_form_title_en,
        contact_form_subtitle_he: s.contact_form_subtitle_he, contact_form_subtitle_en: s.contact_form_subtitle_en,
        contact_form_success_message_he: s.contact_form_success_message_he, contact_form_success_message_en: s.contact_form_success_message_en,
        contact_form_email_recipient: s.contact_form_email_recipient,
        contact_form_honeypot_field: s.contact_form_honeypot_field,
        contact_page_form_cta_title_he: s.contact_page_form_cta_title_he, contact_page_form_cta_title_en: s.contact_page_form_cta_title_en,
        contact_page_form_cta_subtitle_he: s.contact_page_form_cta_subtitle_he, contact_page_form_cta_subtitle_en: s.contact_page_form_cta_subtitle_en,
        contact_page_form_cta_button_he: s.contact_page_form_cta_button_he, contact_page_form_cta_button_en: s.contact_page_form_cta_button_en,
        contact_page_form_cta_bg_color: s.contact_page_form_cta_bg_color,
        contact_page_form_cta_button_bg_color: s.contact_page_form_cta_button_bg_color,
        contact_page_form_cta_button_text_color: s.contact_page_form_cta_button_text_color,
        media_contact: s.page_media?.contact || [],
        media_position_contact: s.page_media_position?.contact
      };

      // Perform updates
      const promises = [];
      
      if (s.global_id) promises.push(base44.entities.GlobalSettings.update(s.global_id, globalData));
      else promises.push(base44.entities.GlobalSettings.create(globalData));

      if (s.home_id) promises.push(base44.entities.HomePageSettings.update(s.home_id, homeData));
      else promises.push(base44.entities.HomePageSettings.create(homeData));

      if (s.about_id) promises.push(base44.entities.AboutPageSettings.update(s.about_id, aboutData));
      else promises.push(base44.entities.AboutPageSettings.create(aboutData));

      if (s.personal_id) promises.push(base44.entities.PersonalPageSettings.update(s.personal_id, personalData));
      else promises.push(base44.entities.PersonalPageSettings.create(personalData));

      if (s.corporate_id) promises.push(base44.entities.CorporatePageSettings.update(s.corporate_id, corporateData));
      else promises.push(base44.entities.CorporatePageSettings.create(corporateData));

      if (s.testimonials_id) promises.push(base44.entities.TestimonialsPageSettings.update(s.testimonials_id, testimonialsData));
      else promises.push(base44.entities.TestimonialsPageSettings.create(testimonialsData));

      if (s.podcast_id) promises.push(base44.entities.PodcastPageSettings.update(s.podcast_id, podcastData));
      else promises.push(base44.entities.PodcastPageSettings.create(podcastData));

      if (s.blog_id) promises.push(base44.entities.BlogPageSettings.update(s.blog_id, blogData));
      else promises.push(base44.entities.BlogPageSettings.create(blogData));

      if (s.contact_id) promises.push(base44.entities.ContactPageSettings.update(s.contact_id, contactData));
      else promises.push(base44.entities.ContactPageSettings.create(contactData));

      await Promise.all(promises);
      
      await reloadSettings();
      alert(t('ההגדרות נשמרו בהצלחה!', 'Settings saved successfully!'));
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t('שגיאה בשמירת ההגדרות. נסה שוב.', 'Error saving settings. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  }, [setIsSaving, siteSettings, reloadSettings, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--primary-color)]" />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicSettingsTab settings={siteSettings} onFieldChange={handleSettingsChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />;
      case 'colors':
        return <ColorsAndFontsTab settings={siteSettings} onFieldChange={handleSettingsChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />;
      case 'navigation':
        return <NavigationTab settings={siteSettings} onFieldChange={handleSettingsChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />;
      case 'homepage':
        return <HomePageTab settings={siteSettings} onFieldChange={handleSettingsChange} onMediaChange={(key, media) => handleSettingsChange('page_media', {...siteSettings.page_media, [key]: media})} onMediaPositionChange={(key, position) => handleSettingsChange('page_media_position', {...siteSettings.page_media_position, [key]: position})} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} onRichTextChange={handleRichTextChange} />;
      case 'pages':
        return <PagesTab siteSettings={siteSettings} handleSettingsChange={handleSettingsChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} onManagerChange={handleManagerChangeFromSiteAdmin} onAddManager={addManagerFromSiteAdmin} onRemoveManager={removeManagerFromSiteAdmin} onCorporatePageChange={handleCorporatePageChangeFromSiteAdmin} onRichTextChange={handleRichTextChange} />;
      case 'contact-form':
        return <ContactFormTab siteSettings={siteSettings} handleSettingsChange={handleSettingsChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} onRichTextChange={handleRichTextChange} />;
      case 'media':
        return <MediaTab siteSettings={siteSettings} handleSettingsChange={handleSettingsChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />;
      case 'social':
        return <SocialTab siteSettings={siteSettings} handleSettingsChange={handleSettingsChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />;
      case 'backup':
        return <BackupTab t={t} />;
      case 'advanced':
        return <AdvancedTab siteSettings={siteSettings} handleSettingsChange={handleSettingsChange} isSaving={isSaving} handleSaveSettings={handleSaveSettings} t={t} />;
      case 'manage-testimonials':
        return <TestimonialsTab t={t} />;
      case 'manage-personal':
        return <PersonalWorkshopsTab t={t} />;
      case 'manage-corporate':
        return <CorporateLecturesTab t={t} />;
      case 'manage-blog':
        return <BlogPostsTab t={t} />;
      case 'manage-podcast':
        return <PodcastEpisodesTab t={t} />;
      default:
        return null;
    }
  };

  // Determine if the global save button should be displayed
  const showGlobalSaveButton = !['manage-testimonials', 'manage-personal', 'manage-corporate', 'manage-blog', 'manage-podcast', 'backup'].includes(activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-color)]">
            {t('מרכז בקרה', 'Admin Dashboard')}
          </h1>
          {showGlobalSaveButton && (
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--secondary-color)] smooth-transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? t('שומר...', 'Saving...') : t('שמור הגדרות', 'Save Settings')}
            </Button>
          )}
        </div>

        <div className="lg:flex">
          <div className="hidden lg:block w-64 bg-white shadow-sm min-h-screen border-r border-gray-200 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all justify-start ${
                    activeTab === tab.key
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  variant="ghost"
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="flex overflow-x-auto whitespace-nowrap p-2 space-x-2">
                {tabs.map((tab) => (
                  <Button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                      activeTab === tab.key
                        ? 'bg-[var(--primary-color)] text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                    variant="ghost"
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {renderTabContent()}
              {showGlobalSaveButton && (
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--secondary-color)] smooth-transition flex items-center gap-2 w-full md:w-auto"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? t('שומר...', 'Saving...') : t('שמור הגדרות', 'Save Settings')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}