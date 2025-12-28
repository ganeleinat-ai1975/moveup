import React from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Users, Clock, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Workshops() {
  const { language, t, direction } = useLanguage();

  const workshops = [
    {
      title_he: 'העצמה אישית ומנהיגות',
      title_en: 'Personal Empowerment & Leadership',
      desc_he: 'סדנה מקיפה לפיתוח מנהיגות אישית ובניית ביטחון עצמי חזק',
      desc_en: 'Comprehensive workshop for developing personal leadership and building strong self-confidence',
      duration_he: '3 מפגשים',
      duration_en: '3 sessions',
      participants: '8-12',
      price_he: 'לפי בקשה',
      price_en: 'Upon request'
    },
    {
      title_he: 'פיתוח קריירה וקידום מקצועי',
      title_en: 'Career Development & Professional Advancement',
      desc_he: 'כלים מעשיים לקידום קריירה והגשמת יעדים מקצועיים',
      desc_en: 'Practical tools for career advancement and achieving professional goals',
      duration_he: '4 מפגשים',
      duration_en: '4 sessions',
      participants: '6-10',
      price_he: 'לפי בקשה',
      price_en: 'Upon request'
    },
    {
      title_he: 'איזון בין עבודה לחיים',
      title_en: 'Work-Life Balance',
      desc_he: 'למצוא את האיזון הנכון בין התפתחות מקצועית לחיים אישיים מספקים',
      desc_en: 'Finding the right balance between professional development and fulfilling personal life',
      duration_he: '2 מפגשים',
      duration_en: '2 sessions',
      participants: '8-15',
      price_he: 'לפי בקשה',
      price_en: 'Upon request'
    }
  ];

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="bg-[#f4f1ee] min-h-screen">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-8">
            {t('סדנאות והרצאות', 'Workshops & Lectures')}
          </h1>
          <p className="text-xl text-[#2e2e2e]/80 leading-relaxed max-w-3xl mx-auto">
            {t(
              'הסדנאות שלנו מיועדות לנשים שרוצות לפתח את עצמן, לחזק את הביטחון העצמי ולהוביל שינוי חיובי בחייהן',
              'Our workshops are designed for women who want to develop themselves, strengthen their self-confidence and lead positive change in their lives'
            )}
          </p>
        </div>
      </section>

      {/* Workshops Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {workshops.map((workshop, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-elegant hover-lift smooth-transition overflow-hidden">
                <div className="p-8">
                  <h3 className="text-xl font-bold text-[#2e2e2e] mb-4">
                    {language === 'he' ? workshop.title_he : workshop.title_en}
                  </h3>
                  <p className="text-[#2e2e2e]/70 mb-6 leading-relaxed">
                    {language === 'he' ? workshop.desc_he : workshop.desc_en}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-[#2e2e2e]/60">
                      <Clock className="w-4 h-4 text-[#005e6c]" />
                      <span>{language === 'he' ? workshop.duration_he : workshop.duration_en}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#2e2e2e]/60">
                      <Users className="w-4 h-4 text-[#005e6c]" />
                      <span>{workshop.participants} {t('משתתפות', 'participants')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#2e2e2e]/60">
                      <Star className="w-4 h-4 text-[#005e6c]" />
                      <span>{language === 'he' ? workshop.price_he : workshop.price_en}</span>
                    </div>
                  </div>

                  <Link
                    to={createPageUrl('Contact')}
                    className="w-full bg-[#005e6c] text-white py-3 rounded-full font-semibold hover:bg-[#006f79] smooth-transition flex items-center justify-center gap-2"
                  >
                    {t('הרשמה לסדנה', 'Register for Workshop')}
                    <ArrowIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lectures Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2e2e2e] mb-8">
            {t('הרצאות מעוררות השראה', 'Inspiring Lectures')}
          </h2>
          <p className="text-xl text-[#2e2e2e]/70 mb-8 leading-relaxed">
            {t(
              'אנחנו מציעות הרצאות מותאמות אישית לארגונים וחברות שרוצים להעצים את העובדות שלהם',
              'We offer customized lectures for organizations and companies that want to empower their female employees'
            )}
          </p>
          
          <div className="bg-[#f4f1ee] p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-[#2e2e2e] mb-4">
              {t('נושאי הרצאה פופולריים:', 'Popular Lecture Topics:')}
            </h3>
            <ul className="text-[#2e2e2e]/70 space-y-2 text-lg">
              <li>{t('• מנהיגות נשית במקום העבודה', '• Female leadership in the workplace')}</li>
              <li>{t('• בניית ביטחון עצמי מקצועי', '• Building professional self-confidence')}</li>
              <li>{t('• ניהול זמן ויעילות אישית', '• Time management and personal efficiency')}</li>
              <li>{t('• תקשורת אפקטיבית ומשפיעה', '• Effective and influential communication')}</li>
            </ul>
          </div>

          <div className="mt-8">
            <Link
              to={createPageUrl('Contact')}
              className="bg-[#005e6c] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#006f79] smooth-transition shadow-elegant hover-lift inline-flex items-center gap-2"
            >
              {t('בואו נתאים הרצאה', "Let's Customize a Lecture")}
              <ArrowIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}