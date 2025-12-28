import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useSiteSettings } from '../components/SiteSettingsContext';
import { Phone, Mail, MessageCircle, Instagram, Linkedin, Facebook, Youtube, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import HeroVideo from '../components/HeroVideo';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import TopCTABanner from '../components/shared/TopCTABanner';

export default function Contact() {
  const { language, t } = useLanguage();
  const { siteSettings } = useSiteSettings();
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);

  // Added loading state check
  if (!siteSettings) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-[var(--text-color)]">Loading settings...</div>;
  }

  const getWhatsAppLink = (number) => {
    if (!number) return '';
    const cleanNumber = number.replace(/[^\d]/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  const contactMedia = siteSettings?.media_contact || siteSettings?.page_media?.contact || [];
  const contactMediaPosition = siteSettings?.media_position_contact || siteSettings?.page_media_position?.contact || "center center";

  return (
    <div className="bg-[var(--background-color)] min-h-screen">
      <TopCTABanner />

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden min-h-[60vh] md:min-h-[70vh] flex items-center justify-center">
        {/* Hero Media - Desktop */}
        {contactMedia && contactMedia.length > 0 && (
          <div className="absolute inset-0 z-0 hidden md:block">
            <div className="w-full h-full">
              <HeroVideo
                media={contactMedia}
                className="grid-cols-1 h-full md:h-[70vh] flex items-center justify-center"
                mediaPosition={contactMediaPosition}
                mobileAsImage={false}
              />
            </div>
            <div className="absolute inset-0 bg-white/80 pointer-events-none"></div>
          </div>
        )}

        {/* Hero Media - Mobile */}
        {contactMedia && contactMedia.length > 0 && (
          <div className="absolute inset-0 z-0 block md:hidden">
            <div className="w-full h-full">
              <video
                src={contactMedia[0]?.file_url}
                className="w-full h-full object-cover"
                style={{ objectPosition: contactMediaPosition }}
                autoPlay
                loop
                muted
                playsInline
                webkitPlaysinline="true"
                preload="metadata"
              />
            </div>
            <div className="absolute inset-0 bg-white/80 pointer-events-none"></div>
          </div>
        )}

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 pointer-events-none">
          {(siteSettings?.contact_page_title_he?.trim() || siteSettings?.contact_page_title_en?.trim()) && (
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-8 pointer-events-auto">
              {language === 'he' ? siteSettings.contact_page_title_he : siteSettings.contact_page_title_en}
            </h1>
          )}
          {(siteSettings?.contact_page_subtitle_he?.trim() || siteSettings?.contact_page_subtitle_en?.trim()) && (
            // Modified subtitle to use div and dangerouslySetInnerHTML
            <div
              className="text-xl text-opacity-80 text-[var(--text-color)] leading-relaxed max-w-3xl mx-auto pointer-events-auto"
              dangerouslySetInnerHTML={{ __html: language === 'he' ? siteSettings.contact_page_subtitle_he : siteSettings.contact_page_subtitle_en }}
            />
          )}
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Methods */}
            <div className="space-y-8">
              {(siteSettings?.contact_methods_title_he?.trim() || siteSettings?.contact_methods_title_en?.trim()) && (
                <h2 className="text-2xl font-bold text-[var(--text-color)] mb-8">
                  {language === 'he' ? siteSettings.contact_methods_title_he : siteSettings.contact_methods_title_en}
                </h2>
              )}

              {/* Phone */}
              {siteSettings?.contact_phone && (
                <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-elegant hover-lift smooth-transition">
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--primary-color)] text-white rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-color)] mb-1">
                      {language === 'he'
                        ? (siteSettings?.general_phone_he || 'טלפון')
                        : (siteSettings?.general_phone_en || 'Phone')
                      }
                    </h3>
                    <a
                      href={`tel:${siteSettings.contact_phone}`}
                      className="text-[var(--primary-color)] hover:text-[var(--secondary-color)] smooth-transition"
                    >
                      {siteSettings.contact_phone}
                    </a>
                  </div>
                </div>
              )}

              {/* WhatsApp */}
              {siteSettings?.contact_whatsapp && (
                <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-elegant hover-lift smooth-transition">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-color)] mb-1">
                      WhatsApp
                    </h3>
                    <a
                      href={getWhatsAppLink(siteSettings.contact_whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 smooth-transition"
                    >
                      {language === 'he'
                        ? (siteSettings?.general_send_message_he || 'שלחי הודעה')
                        : (siteSettings?.general_send_message_en || 'Send Message')
                      }
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              {siteSettings?.contact_email && (
                <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-elegant hover-lift smooth-transition">
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--primary-color)] text-white rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-color)] mb-1">
                      {language === 'he'
                        ? (siteSettings?.general_email_he || 'אימייל')
                        : (siteSettings?.general_email_en || 'Email')
                      }
                    </h3>
                    <a
                      href={`mailto:${siteSettings.contact_email}`}
                      className="text-[var(--primary-color)] hover:text-[var(--secondary-color)] smooth-transition"
                    >
                      {siteSettings.contact_email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Social Media */}
            <div className="space-y-8">
              {(siteSettings?.contact_social_title_he?.trim() || siteSettings?.contact_social_title_en?.trim()) && (
                <h2 className="text-2xl font-bold text-[var(--text-color)] mb-8">
                  {language === 'he' ? siteSettings.contact_social_title_he : siteSettings.contact_social_title_en}
                </h2>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Instagram */}
                {siteSettings?.instagram_url && (
                  <a
                    href={siteSettings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover-lift smooth-transition"
                  >
                    <Instagram className="w-6 h-6" />
                    <span className="font-semibold">Instagram</span>
                  </a>
                )}

                {/* LinkedIn */}
                {siteSettings?.linkedin_url && (
                  <a
                    href={siteSettings.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-6 bg-blue-600 text-white rounded-2xl hover-lift smooth-transition"
                  >
                    <Linkedin className="w-6 h-6" />
                    <span className="font-semibold">LinkedIn</span>
                  </a>
                )}

                {/* Facebook */}
                {siteSettings?.facebook_url && (
                  <a
                    href={siteSettings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-6 bg-blue-500 text-white rounded-2xl hover-lift smooth-transition"
                  >
                    <Facebook className="w-6 h-6" />
                    <span className="font-semibold">Facebook</span>
                  </a>
                )}

                {/* YouTube */}
                {siteSettings?.youtube_url && (
                  <a
                    href={siteSettings.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-6 bg-red-600 text-white rounded-2xl hover-lift smooth-transition"
                  >
                    <Youtube className="w-6 h-6" />
                    <span className="font-semibold">YouTube</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA to Form Section */}
      <section
        className="py-20"
        style={{ backgroundColor: siteSettings?.contact_page_form_cta_bg_color || '#ffffff' }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[var(--text-color)] mb-4">
            {language === 'he'
              ? (siteSettings?.contact_page_form_cta_title_he || 'רוצה לכתוב לנו?')
              : (siteSettings?.contact_page_form_cta_title_en || 'Want to write to us?')
            }
          </h2>
          <div
            className="text-xl text-opacity-70 text-[var(--text-color)] mb-8"
            dangerouslySetInnerHTML={{ __html: language === 'he'
              ? (siteSettings?.contact_page_form_cta_subtitle_he || 'יש לך שאלה, רעיון לשיתוף פעולה או שאת פשוט רוצה להגיד שלום? לחצי על הכפתור ומלאי את הטופס.')
              : (siteSettings?.contact_page_form_cta_subtitle_en || 'Have a question, an idea for collaboration, or just want to say hello? Click the button and fill out the form.')
            }}
          />
          <Link
            to={createPageUrl('ContactForm')}
            className="bg-[var(--primary-color)] text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 smooth-transition shadow-elegant hover-lift inline-flex items-center gap-2"
            style={{
              backgroundColor: siteSettings?.contact_page_form_cta_button_bg_color || 'var(--primary-color)',
              color: siteSettings?.contact_page_form_cta_button_text_color || '#ffffff'
            }}
          >
            <Edit3 className="w-5 h-5" />
            {language === 'he'
              ? (siteSettings?.contact_page_form_cta_button_he || 'למילוי טופס יצירת קשר')
              : (siteSettings?.contact_page_form_cta_button_en || 'Fill out the contact form')
            }
          </Link>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <section id="privacy" className="mt-16 pt-8 border-t border-gray-300">
          <button
            onClick={() => setIsPrivacyPolicyOpen(!isPrivacyPolicyOpen)}
            className="w-full flex justify-between items-center text-left py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] focus-visible:ring-opacity-75 rounded-md"
            aria-expanded={isPrivacyPolicyOpen}
            aria-controls="privacy-content"
          >
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-color)]">
              מדיניות פרטיות
            </h2>
            {isPrivacyPolicyOpen ? (
              <ChevronUp className="w-6 h-6 text-[var(--primary-color)] flex-shrink-0" />
            ) : (
              <ChevronDown className="w-6 h-6 text-[var(--primary-color)] flex-shrink-0" />
            )}
          </button>
          
          {isPrivacyPolicyOpen && (
            <div id="privacy-content" className="mt-6 space-y-4 rtl:text-right text-[var(--text-color)] animate-fade-in">
              <p><strong>עודכן: אוגוסט 2025</strong></p>
              <p>
                בפורצות קדימה (MoveUp | https://moveup.today/) אנחנו רואות חשיבות רבה בשמירה על פרטיותך ופועלות בהתאם לחוק הישראלי, כולל תיקון 13 לחוק הגנת הפרטיות (נכנס לתוקף באוגוסט 2025).
              </p>
              <div>
                <h3 className="mt-5 mb-2 font-bold text-lg">איזה מידע נאסף?</h3>
                <ul className="list-disc pr-5 space-y-1">
                  <li>מידע שאת/ה מזין/ה בטפסים באתר (שם, טלפון, דוא"ל וכדומה).</li>
                  <li>מידע טכני שנאסף אוטומטית – כמו כתובת IP, סוג דפדפן, זמן גלישה ודפים שנצפו.</li>
                  <li>מידע דרך כלים כמו Google Analytics או Microsoft Clarity לצורך שיפור חוויית השימוש.</li>
                </ul>
              </div>
              <div>
                <h3 className="mt-5 mb-2 font-bold text-lg">למה אנחנו משתמשות במידע הזה?</h3>
                <ul className="list-disc pr-5 space-y-1">
                  <li>כדי לחזור אליך לפי פנייתך בטופס יצירת הקשר.</li>
                  <li>כדי להבין את דפוסי השימוש באתר ולשפר את התוכן והשירות.</li>
                  <li>למטרות שיווקיות – רק לאחר קבלת הסכמה מפורשת.</li>
                </ul>
              </div>
              <div>
                <h3 className="mt-5 mb-2 font-bold text-lg">שימוש בעוגיות (Cookies)</h3>
                <p>
                  האתר משתמש בעוגיות כדי להבטיח תפקוד תקין ולשפר את חוויית הגלישה. עם הכניסה לאתר תוצג הודעה המאפשרת לבחור אם לאשר את השימוש בעוגיות. עוגיות לא הכרחיות יופעלו רק אם בחרת לאשר.
                </p>
              </div>
              <div>
                <h3 className="mt-5 mb-2 font-bold text-lg">הזכויות שלך</h3>
                <p>
                  בהתאם לחוק, את/ה זכאי/ת לעיין במידע אישי שנאסף עליך, לבקש לתקן או למחוק אותו, ולבטל את הסכמתך בכל עת.
                </p>
                <p>
                  לפניות בנושא פרטיות – כתבו לנו לכתובת: <br />
                  <strong>hello@moveup.today</strong>
                </p>
              </div>
              <p className="pt-4">גרסה באנגלית – זמינה לפי דרישה</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}