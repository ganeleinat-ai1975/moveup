import React from 'react';
import { useLanguage } from '../LanguageContext';
import { availableIcons } from '../icons';

export default function IconSelector({ selectedIcon, onIconSelect }) {
    const { language, t } = useLanguage();

    return (
        <div>
            <label className="block text-sm font-medium text-[var(--text-color)] mb-2">
                {t('בחר אייקון', 'Select Icon')}
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {Object.entries(availableIcons).map(([key, { component: Icon, name_he, name_en }]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onIconSelect(key)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
                            selectedIcon === key
                                ? 'border-[var(--primary-color)] bg-[var(--primary-color)] text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-[var(--primary-color)]'
                        }`}
                        title={language === 'he' ? name_he : name_en}
                    >
                        <Icon className="w-6 h-6 mb-1" />
                        <span className="text-xs truncate">{language === 'he' ? name_he : name_en}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}