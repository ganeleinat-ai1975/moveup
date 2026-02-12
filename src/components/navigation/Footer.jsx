import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../LanguageContext';
import { useSiteSettings } from '../SiteSettingsContext';
import { Mail, Phone, Instagram, Linkedin, Facebook, MessageCircle, Youtube, Home, Info, Briefcase, Star, BookOpen, Mic, FileText, Bot } from 'lucide-react';

const FooterIconLink = ({ to, Icon, label, external = false }) => {
  const content = (
    <>
      <div className="w-14 h-14 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white">
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-sm">{label}</span>
    </>
  );

  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
        {content}
      </a>
    );
  }

  return (
    <Link to={createPageUrl(to)} className="flex flex-col items-center gap-2">
      {content}
    </Link>
  );
};

export default function Footer() {
  const { language, t } = useLanguage();
  const { siteSettings } = useSiteSettings();

  const currentYear = new Date().getFullYear();
  
  const getWhatsAppLink = (number) => {
    if (!number) return '';
    const cleanNumber = number.replace(/[^\d]/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  return (
    <>
      {/* --- Desktop Footer --- */}
      <footer 
        className="hidden md:block py-16 text-white"
        style={{ 
          backgroundColor: siteSettings?.footer_background_color || '#2e2e2e',
          color: siteSettings?.footer_text_color || '#e5e7eb',
          position: 'relative',
          zIndex: 60
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {/* Logo and Description */}
            <div className="space-y-6">
              <div>
                {siteSettings?.footer_logo_url_he || siteSettings?.footer_logo_url_en ? (
                  <img 
                    src={language === 'he' ? siteSettings.footer_logo_url_he || siteSettings.footer_logo_url_en : siteSettings.footer_logo_url_en || siteSettings.footer_logo_url_he} 
                    alt={siteSettings?.site_title_he || 'MOVEUP'}
                    className="h-12 w-auto"
                  />
                ) : siteSettings?.logo_url_he || siteSettings?.logo_url_en ? (
                  <img 
                    src={language === 'he' ? siteSettings.logo_url_he || siteSettings.logo_url_en : siteSettings.logo_url_en || siteSettings.logo_url_he} 
                    alt={siteSettings?.site_title_he || 'MOVEUP'}
                    className="h-12 w-auto"
                  />
                ) : (
                  <h2 className="text-2xl font-bold" style={{ color: siteSettings?.footer_title_color || '#ffffff' }}>
                    MOVEUP
                  </h2>
                )}
              </div>
              {(siteSettings?.tagline_he?.trim() || siteSettings?.tagline_en?.trim()) && (
                <p className="leading-relaxed">
                  {language === 'he' ? siteSettings.tagline_he : siteSettings.tagline_en}
                </p>
              )}
            </div>

            {/* Navigation */}
            <div>
              {(siteSettings?.footer_nav_title_he?.trim() || siteSettings?.footer_nav_title_en?.trim()) && (
                <h3 className="text-lg font-semibold mb-6" style={{ color: siteSettings?.footer_title_color || '#ffffff' }}>
                  {language === 'he' ? siteSettings.footer_nav_title_he : siteSettings.footer_nav_title_en}
                </h3>
              )}
              <nav className="space-y-3">
                <Link to={createPageUrl('Home')} className="block hover:text-white smooth-transition">
                  {language === 'he' 
                    ? (siteSettings?.nav_home_he || 'בית') 
                    : (siteSettings?.nav_home_en || 'Home')
                  }
                </Link>
                <Link to={createPageUrl('About')} className="block hover:text-white smooth-transition">
                  {language === 'he' 
                    ? (siteSettings?.nav_about_he || 'אודות') 
                    : (siteSettings?.nav_about_en || 'About')
                  }
                </Link>
                <Link to={createPageUrl('CorporateLectures')} className="block hover:text-white smooth-transition">
                  {language === 'he' 
                    ? (siteSettings?.nav_corporate_he || 'לארגונים') 
                    : (siteSettings?.nav_corporate_en || 'Corporate')
                  }
                </Link>
                <Link to={createPageUrl('PersonalWorkshops')} className="block hover:text-white smooth-transition">
                  {language === 'he' 
                    ? (siteSettings?.nav_personal_he || 'לפרטיות') 
                    : (siteSettings?.nav_personal_en || 'Personal')
                  }
                </Link>
                <Link to={createPageUrl('Testimonials')} className="block hover:text-white smooth-transition">
                  {language === 'he' 
                    ? (siteSettings?.nav_testimonials_he || 'המלצות') 
                    : (siteSettings?.nav_testimonials_en || 'Testimonials')
                  }
                </Link>
                <Link to={createPageUrl('Blog')} className="block hover:text-white smooth-transition">
                  {language === 'he' 
                    ? (siteSettings?.nav_blog_he || 'בלוג') 
                    : (siteSettings?.nav_blog_en || 'Blog')
                  }
                </Link>
                <Link to={createPageUrl('Podcast')} className="block hover:text-white smooth-transition">
                  {language === 'he' 
                    ? (siteSettings?.nav_podcast_he || 'פודקסט פורצות קדימה') 
                    : (siteSettings?.nav_podcast_en || 'Breaking Forward Podcast')
                  }
                </Link>
                {/* AI Bot Link */}
                {siteSettings?.footer_bot_link_enabled && (
                  <a
                    href={siteSettings?.footer_bot_link_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-white smooth-transition"
                  >
                    {language === 'he' 
                      ? (siteSettings?.footer_bot_link_text_he || 'בוטית פורצות') 
                      : (siteSettings?.footer_bot_link_text_en || 'Breakthrough Bot')
                    }
                  </a>
                )}
              </nav>
            </div>

            {/* Contact Information */}
            <div>
              {(siteSettings?.footer_contact_title_he?.trim() || siteSettings?.footer_contact_title_en?.trim()) && (
                <h3 className="text-lg font-semibold mb-6" style={{ color: siteSettings?.footer_title_color || '#ffffff' }}>
                  {language === 'he' ? siteSettings.footer_contact_title_he : siteSettings.footer_contact_title_en}
                </h3>
              )}
              <div className="space-y-3">
                {siteSettings?.contact_phone && (
                  <a href={`tel:${siteSettings.contact_phone}`} className="flex items-center gap-3 hover:text-white smooth-transition">
                    <Phone className="w-4 h-4" />
                    <span>{siteSettings.contact_phone}</span>
                  </a>
                )}
                {siteSettings?.contact_email && (
                  <a href={`mailto:${siteSettings.contact_email}`} className="flex items-center gap-3 hover:text-white smooth-transition">
                    <Mail className="w-4 h-4" />
                    <span>{siteSettings.contact_email}</span>
                  </a>
                )}
                {siteSettings?.contact_whatsapp && (
                  <a 
                    href={getWhatsAppLink(siteSettings.contact_whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:text-white smooth-transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* Social Media */}
            <div>
              {(siteSettings?.footer_social_title_he?.trim() || siteSettings?.footer_social_title_en?.trim()) && (
                <h3 className="text-lg font-semibold mb-6" style={{ color: siteSettings?.footer_title_color || '#ffffff' }}>
                  {language === 'he' ? siteSettings.footer_social_title_he : siteSettings.footer_social_title_en}
                </h3>
              )}
              <div className="flex gap-4">
                {siteSettings?.instagram_url && (
                  <a href={siteSettings.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-white smooth-transition">
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
                {siteSettings?.linkedin_url && (
                  <a href={siteSettings.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-white smooth-transition">
                    <Linkedin className="w-6 h-6" />
                  </a>
                )}
                {siteSettings?.facebook_url && (
                  <a href={siteSettings.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-white smooth-transition">
                    <Facebook className="w-6 h-6" />
                  </a>
                )}
                {siteSettings?.youtube_url && (
                  <a href={siteSettings.youtube_url} target="_blank" rel="noopener noreferrer" className="hover:text-white smooth-transition">
                    <Youtube className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-gray-600 text-center">
            <p>
              {language === 'he' 
                ? (siteSettings?.footer_copyright_he || `© ${currentYear} MoveUp. כל הזכויות שמורות.`) 
                : (siteSettings?.footer_copyright_en || `© ${currentYear} MoveUp. All rights reserved.`)
              }
            </p>
          </div>
        </div>
      </footer>

      {/* --- Mobile Footer --- */}
      <footer
        className="md:hidden py-12"
        style={{
          backgroundColor: siteSettings?.footer_background_color || '#2e2e2e',
          color: siteSettings?.footer_text_color || '#e5e7eb'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <div>
              {siteSettings?.footer_logo_url_he || siteSettings?.footer_logo_url_en ? (
                <img 
                  src={language === 'he' ? siteSettings.footer_logo_url_he || siteSettings.footer_logo_url_en : siteSettings.footer_logo_url_en || siteSettings.footer_logo_url_he} 
                  alt={siteSettings?.site_title_he || 'MOVEUP'}
                  className="h-12 w-auto"
                />
              ) : siteSettings?.logo_url_he || siteSettings?.logo_url_en ? (
                <img 
                  src={language === 'he' ? siteSettings.logo_url_he || siteSettings.logo_url_en : siteSettings.logo_url_en || siteSettings.logo_url_he} 
                  alt={siteSettings?.site_title_he || 'MOVEUP'}
                  className="h-12 w-auto"
                />
              ) : (
                <h2 className="text-2xl font-bold" style={{ color: siteSettings?.footer_title_color || '#ffffff' }}>
                  MOVEUP
                </h2>
              )}
            </div>
            {(siteSettings?.tagline_he?.trim() || siteSettings?.tagline_en?.trim()) && (
              <p className="leading-relaxed mt-4 max-w-xs">
                {language === 'he' ? siteSettings.tagline_he : siteSettings.tagline_en}
              </p>
            )}
          </div>
          
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6 text-center" style={{ color: siteSettings?.footer_title_color || '#ffffff' }}>
              {t('ניווט מהיר', 'Quick Navigation')}
            </h3>
            <div className="grid grid-cols-3 gap-y-8 gap-x-4 text-center">
              <FooterIconLink to="Home" Icon={Home} label={t(siteSettings?.nav_home_he || 'בית', siteSettings?.nav_home_en || 'Home')} />
              <FooterIconLink to="About" Icon={Info} label={t(siteSettings?.nav_about_he || 'אודות', siteSettings?.nav_about_en || 'About')} />
              <FooterIconLink to="CorporateLectures" Icon={FileText} label={t(siteSettings?.nav_corporate_he || 'לארגונים', siteSettings?.nav_corporate_en || 'Corporate')} />
              <FooterIconLink to="Testimonials" Icon={Star} label={t(siteSettings?.nav_testimonials_he || 'המלצות', siteSettings?.nav_testimonials_en || 'Testimonials')} />
              <FooterIconLink to="Blog" Icon={BookOpen} label={t(siteSettings?.nav_blog_he || 'בלוג', siteSettings?.nav_blog_en || 'Blog')} />
              <FooterIconLink to="PersonalWorkshops" Icon={Briefcase} label={t(siteSettings?.nav_personal_he || 'לפרטיות', siteSettings?.nav_personal_en || 'Personal')} />
              <FooterIconLink to="Podcast" Icon={Mic} label={t(siteSettings?.nav_podcast_he || 'פודקסט', siteSettings?.nav_podcast_en || 'Podcast')} />
              <FooterIconLink to="Contact" Icon={Mail} label={t(siteSettings?.nav_contact_he || 'צור קשר', siteSettings?.nav_contact_en || 'Contact')} />
              {siteSettings?.footer_bot_link_enabled && (
                <FooterIconLink
                  to={siteSettings.footer_bot_link_url || '#'}
                  Icon={Bot}
                  label={language === 'he' 
                      ? (siteSettings?.footer_bot_link_text_he || 'בוטית פורצות') 
                      : (siteSettings?.footer_bot_link_text_en || 'Breakthrough Bot')
                  }
                  external
                />
              )}
            </div>
          </div>
          
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6 text-center" style={{ color: siteSettings?.footer_title_color || '#ffffff' }}>
              {t('יצירת קשר', 'Contact Us')}
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {siteSettings?.contact_phone && (
                <a href={`tel:${siteSettings.contact_phone}`} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white">
                    <Phone className="w-6 h-6" />
                  </div>
                  <span className="text-sm">{siteSettings.contact_phone}</span>
                </a>
              )}
              {siteSettings?.contact_email && (
                <a href={`mailto:${siteSettings.contact_email}`} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white">
                    <Mail className="w-6 h-6" />
                  </div>
                  <span className="text-sm">{t('אימייל', 'Email')}</span>
                </a>
              )}
              {siteSettings?.contact_whatsapp && (
                <a href={getWhatsAppLink(siteSettings.contact_whatsapp)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-sm">WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6 text-center" style={{ color: siteSettings?.footer_title_color || '#ffffff' }}>
              {t('עקבו אחרינו', 'Follow Us')}
            </h3>
            <div className="flex justify-center gap-4">
              {siteSettings?.instagram_url && (
                <a href={siteSettings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {siteSettings?.linkedin_url && (
                <a href={siteSettings.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {siteSettings?.facebook_url && (
                <a href={siteSettings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {siteSettings?.youtube_url && (
                <a href={siteSettings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Youtube className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-12 pt-8 text-center text-sm">
            <div dangerouslySetInnerHTML={{ __html: language === 'he' ? (siteSettings?.footer_copyright_he || `© ${currentYear} MoveUp. כל הזכויות שמורות.`) : (siteSettings?.footer_copyright_en || `© ${currentYear} MoveUp. All rights reserved.`) }} />
          </div>
        </div>
      </footer>
    </>
  );
}