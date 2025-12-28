import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { UploadFile } from '@/integrations/Core';
import { Upload, X, Image, Video, Loader2 } from 'lucide-react';

export default function MediaUploader({ media = {}, sectionKey, onMediaChange }) {
  const { language, t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Ensure section media array exists
  const sectionMedia = (media && media[sectionKey]) || [];

  const handleFileUpload = async (file) => {
    if (!file || !sectionKey) return;
    setIsUploading(true);
    try {
      const uploadedFile = await UploadFile({ file });
      const mediaItem = {
        type: file.type.includes('video') ? 'video' : 'image',
        file_url: uploadedFile.file_url,
        alt_he: '',
        alt_en: '',
        order_index: sectionMedia.length
      };

      const updatedMedia = {
        ...media,
        [sectionKey]: [...sectionMedia, mediaItem]
      };

      onMediaChange(updatedMedia);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(t('שגיאה בהעלאת הקובץ', 'File upload failed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const removeMedia = (index) => {
    const newSectionMedia = sectionMedia.filter((_, i) => i !== index);
    const updatedMedia = { ...media, [sectionKey]: newSectionMedia };
    onMediaChange(updatedMedia);
  };

  const updateMediaAlt = (index, field, value) => {
    const newSectionMedia = [...sectionMedia];
    newSectionMedia[index] = { ...newSectionMedia[index], [field]: value };
    const updatedMedia = { ...media, [sectionKey]: newSectionMedia };
    onMediaChange(updatedMedia);
  };

  const updateMediaOrder = (index, newOrder) => {
    const newSectionMedia = [...sectionMedia];
    newSectionMedia[index] = { ...newSectionMedia[index], order_index: parseInt(newOrder) || 0 };
    const updatedMedia = { ...media, [sectionKey]: newSectionMedia };
    onMediaChange(updatedMedia);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-[var(--primary-color)] bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
            <span className="ml-2 text-[var(--text-color)]">
              {t('מעלה קובץ...', 'Uploading...')}
            </span>
          </div>
        ) : (
          <div>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-[var(--text-color)] mb-2">
              {t('גרור קבצים לכאן או', 'Drag files here or')}
            </p>
            <label className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[var(--secondary-color)] transition-colors">
              {t('בחר קבצים', 'Choose Files')}
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              {t('תמונות ווידאו עד 10MB', 'Images and videos up to 10MB')}
            </p>
          </div>
        )}
      </div>

      {/* Media List */}
      {sectionMedia.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-[var(--text-color)]">
            {t('קבצים שהועלו', 'Uploaded Files')}
          </h4>
          {sectionMedia.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {item.type === 'image' ? (
                    <Image className="w-5 h-5 text-blue-500 mr-2" />
                  ) : (
                    <Video className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className="text-sm text-[var(--text-color)]">
                    {item.type === 'image' ? t('תמונה', 'Image') : t('וידאו', 'Video')}
                  </span>
                </div>
                <button
                  onClick={() => removeMedia(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview */}
              <div className="mb-3">
                {item.type === 'image' ? (
                  <img
                    src={item.file_url}
                    alt=""
                    className="h-20 w-32 object-cover rounded"
                  />
                ) : (
                  <video
                    src={item.file_url}
                    className="h-20 w-32 object-cover rounded"
                    muted
                  />
                )}
              </div>

              {/* Fields */}
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-color)] mb-1">
                    {t('תיאור (עברית)', 'Description (Hebrew)')}
                  </label>
                  <input
                    type="text"
                    value={item.alt_he || ''}
                    onChange={(e) => updateMediaAlt(index, 'alt_he', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900"
                    placeholder={t('תיאור התמונה/וידאו', 'Image/Video description')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-color)] mb-1">
                    {t('תיאור (אנגלית)', 'Description (English)')}
                  </label>
                  <input
                    type="text"
                    value={item.alt_en || ''}
                    onChange={(e) => updateMediaAlt(index, 'alt_en', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900"
                    placeholder="Image/Video description"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-color)] mb-1">
                    {t('סדר הצגה', 'Display Order')}
                  </label>
                  <input
                    type="number"
                    value={item.order_index || 0}
                    onChange={(e) => updateMediaOrder(index, e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900"
                    min="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}