import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Eye, Move } from 'lucide-react';

export default function MediaPositionSelector({ currentPosition, onPositionChange, previewImage }) {
  const { language, t } = useLanguage();
  const [showPreview, setShowPreview] = useState(false);
  const [customPosition, setCustomPosition] = useState(currentPosition || 'center center');

  useEffect(() => {
    setCustomPosition(currentPosition || 'center center');
  }, [currentPosition]);

  const presetPositions = [
    { value: 'top left', label: t('למעלה שמאל', 'Top Left') },
    { value: 'top center', label: t('למעלה מרכז', 'Top Center') },
    { value: 'top right', label: t('למעלה ימין', 'Top Right') },
    { value: 'center left', label: t('מרכז שמאל', 'Center Left') },
    { value: 'center center', label: t('מרכז', 'Center') },
    { value: 'center right', label: t('מרכז ימין', 'Center Right') },
    { value: 'bottom left', label: t('למטה שמאל', 'Bottom Left') },
    { value: 'bottom center', label: t('למטה מרכז', 'Bottom Center') },
    { value: 'bottom right', label: t('למטה ימין', 'Bottom Right') }
  ];

  const handlePositionChange = (position) => {
    setCustomPosition(position);
    onPositionChange(position);
  };

  const handleCustomInput = (e) => {
    const value = e.target.value;
    setCustomPosition(value);
    onPositionChange(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[var(--text-color)]">
          {t('מיקום התמונה/וידאו', 'Media Position')}
        </label>
        {previewImage && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--secondary-color)] transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? t('הסתר תצוגה מקדימה', 'Hide Preview') : t('הצג תצוגה מקדימה', 'Show Preview')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {presetPositions.map((position) => (
          <button
            key={position.value}
            type="button"
            onClick={() => handlePositionChange(position.value)}
            className={`p-3 text-xs rounded-lg border-2 transition-all ${
              customPosition === position.value
                ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-[var(--primary-color)]'
            }`}
          >
            {position.label}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
          {t('התאמה אישית (למתקדמים)', 'Custom Position (Advanced)')}
        </label>
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={customPosition}
            onChange={handleCustomInput}
            placeholder="center center / 20% 80% / left top"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent text-gray-900"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {t('דוגמאות: "20% 80%", "left top", "center center"', 'Examples: "20% 80%", "left top", "center center"')}
        </p>
      </div>

      {showPreview && previewImage && (
        <div className="border-2 border-dashed border-[var(--primary-color)] rounded-lg p-4">
          <div className="text-sm font-medium text-[var(--text-color)] mb-3">
            {t('תצוגה מקדימה:', 'Preview:')} {customPosition}
          </div>
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-cover transition-all duration-300"
              style={{ objectPosition: customPosition }}
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                {t('תצוגה מקדימה', 'Preview')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}