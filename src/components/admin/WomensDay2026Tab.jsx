import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Plus, Trash2, Loader2 } from 'lucide-react';
import MediaUploader from '../media/MediaUploader';
import MediaPositionSelector from '../media/MediaPositionSelector';
import IconSelector from './IconSelector';
import RichTextEditor from './RichTextEditor';

const Section = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">{title}</h3>
    {children}
  </div>
);

const InputField = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
  <div>
    <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">{label}</Label>
    <Input type={type} value={value} onChange={onChange} placeholder={placeholder} />
  </div>
);

const RichTextField = ({ label, value, onChange }) => (
  <div>
    <Label className="block text-sm font-medium text-[var(--text-color)] mb-1">{label}</Label>
    <RichTextEditor value={value} onChange={onChange} />
  </div>
);

export default function WomensDay2026Tab({ settings, handleUpdate, onMediaChange, onMediaPositionChange, isSaving, handleSaveSettings, t }) {
  const [allLectures, setAllLectures] = useState([]);
  const [selectedLectureIds, setSelectedLectureIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLectures();
  }, []);

  useEffect(() => {
    if (settings?.featured_lecture_ids) {
      setSelectedLectureIds(settings.featured_lecture_ids);
    }
  }, [settings]);

  const loadLectures = async () => {
    try {
      const lectures = await base44.entities.CorporateLecture.filter({ is_published: true });
      setAllLectures(lectures || []);
    } catch (error) {
      console.error('Error loading lectures:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLectureSelection = (lectureId) => {
    const newIds = selectedLectureIds.includes(lectureId)
      ? selectedLectureIds.filter(id => id !== lectureId)
      : [...selectedLectureIds, lectureId];
    setSelectedLectureIds(newIds);
    handleUpdate('featured_lecture_ids', newIds);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[var(--text-color)]">
        {t('הגדרות עמוד "יום הנשים 2026"', "Women's Day 2026 Page Settings")}
      </h2>

      <Section title={t('תוכן עיקרי', 'Main Content')}>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField 
            label={t('כותרת עמוד (עברית)', 'Page Title (Hebrew)')} 
            value={settings.page_title_he || ''} 
            onChange={(e) => handleUpdate('page_title_he', e.target.value)} 
            placeholder="יום הנשים 2026" 
          />
          <div>
            <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('כותרת עמוד (אנגלית)', 'Page Title (English)')}
            </Label>
            <Input
              type="text"
              dir="ltr"
              value={settings.page_title_en || ''}
              onChange={(e) => handleUpdate('page_title_en', e.target.value)}
              placeholder="Women's Day 2026"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
            />
          </div>
        </div>
        <RichTextField 
          label={t('תיאור העמוד (עברית)', 'Page Description (Hebrew)')} 
          value={settings.description_he || ''} 
          onChange={(value) => handleUpdate('description_he', value === '<p><br></p>' ? '' : value)} 
        />
        <div>
          <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
            {t('תיאור העמוד (אנגלית)', 'Page Description (English)')}
          </Label>
          <div dir="ltr">
            <RichTextEditor 
              value={settings.description_en || ''} 
              onChange={(value) => handleUpdate('description_en', value === '<p><br></p>' ? '' : value)} 
            />
          </div>
        </div>
      </Section>

      <Section title={t('מדיה לעמוד (Hero)', 'Page Media (Hero)')}>
        <MediaUploader
          media={settings.page_media || {}}
          sectionKey="womens_day_2026"
          onMediaChange={(updatedMedia) => onMediaChange('womens_day_2026', updatedMedia.womens_day_2026)}
        />
        <div className="mt-6">
          <MediaPositionSelector
            currentPosition={settings.page_media_position?.womens_day_2026 || 'center center'}
            onPositionChange={(position) => onMediaPositionChange('womens_day_2026', position)}
            previewImage={settings.page_media?.womens_day_2026?.[0]?.file_url}
            t={t}
          />
        </div>
      </Section>

      <Section title={t('כרטיסי הרצאות', 'Lecture Cards')}>
        <p className="text-sm text-gray-600 mb-4">
          {t('בחרי את ההרצאות שתרצי להציג בדף זה. ההרצאות שנבחרו יוצגו לפי הסדר שבו הן נבחרו.', 'Select the lectures you want to display on this page. Selected lectures will appear in the order they are selected.')}
        </p>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {allLectures.map((lecture) => {
              const isSelected = selectedLectureIds.includes(lecture.id);
              return (
                <div
                  key={lecture.id}
                  onClick={() => toggleLectureSelection(lecture.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                      isSelected ? 'bg-[var(--primary-color)] border-[var(--primary-color)]' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--text-color)]">
                        {lecture.title_he}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {lecture.type === 'workshop' && t('סדנה', 'Workshop')}
                        {lecture.type === 'lecture' && t('הרצאה', 'Lecture')}
                        {lecture.type === 'consulting' && t('ייעוץ', 'Consulting')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title={t('אזור יתרונות', 'Benefits Area')}>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <InputField
            label={t('כותרת אזור יתרונות (עברית)', 'Benefits Area Title (Hebrew)')}
            value={settings.benefits_title_he || ''}
            onChange={(e) => handleUpdate('benefits_title_he', e.target.value)}
          />
          <div>
            <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
              {t('כותרת אזור יתרונות (אנגלית)', 'Benefits Area Title (English)')}
            </Label>
            <Input
              type="text"
              dir="ltr"
              value={settings.benefits_title_en || ''}
              onChange={(e) => handleUpdate('benefits_title_en', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
            />
          </div>
        </div>

        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg p-4 space-y-4 mb-4">
            <h4 className="font-semibold">{t(`יתרון ${i}`, `Benefit ${i}`)}</h4>
            <h5 className="text-md font-medium text-[var(--text-color)]">{t('אייקון', 'Icon')}</h5>
            <IconSelector
              selectedIcon={settings[`benefit_${i}_icon`] || 'CheckCircle'}
              onIconSelect={(iconName) => handleUpdate(`benefit_${i}_icon`, iconName)}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <InputField 
                label={t('כותרת (עברית)', 'Title (Hebrew)')} 
                value={settings[`benefit_${i}_title_he`] || ''} 
                onChange={(e) => handleUpdate(`benefit_${i}_title_he`, e.target.value)} 
              />
              <div>
                <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                  {t('כותרת (אנגלית)', 'Title (English)')}
                </Label>
                <Input
                  type="text"
                  dir="ltr"
                  value={settings[`benefit_${i}_title_en`] || ''}
                  onChange={(e) => handleUpdate(`benefit_${i}_title_en`, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900 text-left"
                />
              </div>
            </div>
            <RichTextField 
              label={t('תיאור (עברית)', 'Description (Hebrew)')} 
              value={settings[`benefit_${i}_desc_he`] || ''} 
              onChange={(value) => handleUpdate(`benefit_${i}_desc_he`, value === '<p><br></p>' ? '' : value)} 
            />
            <div>
              <Label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                {t('תיאור (אנגלית)', 'Description (English)')}
              </Label>
              <div dir="ltr">
                <RichTextEditor 
                  value={settings[`benefit_${i}_desc_en`] || ''} 
                  onChange={(value) => handleUpdate(`benefit_${i}_desc_en`, value === '<p><br></p>' ? '' : value)} 
                />
              </div>
            </div>
          </div>
        ))}
      </Section>

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
    </div>
  );
}