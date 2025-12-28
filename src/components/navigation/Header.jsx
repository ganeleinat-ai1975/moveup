
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../LanguageContext';
import { useSiteSettings } from '../SiteSettingsContext';
import { User } from '@/entities/User'; // Assuming User is directly imported
import { Menu, X, Globe, Settings, LogIn, LogOut, MoreVertical, Mail } from 'lucide-react';

// Hook לניהול משתמש
function useUser() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async () => {
    try {
      await User.login();
    } catch (error) {
      console.log('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await User.logout();
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return { user, loading, login, logout };
}

export default function Header() {
  const { language, switchLanguage, t } = useLanguage();
  const { siteSettings } = useSiteSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const { user, login, logout } = useUser();

  const navItems = [
    {
      key: 'home',
      label: language === 'he'
        ? (siteSettings?.nav_home_he || 'בית')
        : (siteSettings?.nav_home_en || 'Home'),
      path: 'Home'
    },
    {
      key: 'about',
      label: language === 'he'
        ? (siteSettings?.nav_about_he || 'אודות')
        : (siteSettings?.nav_about_en || 'About'),
      path: 'About'
    },
    {
      key: 'corporate',
      label: language === 'he'
        ? (siteSettings?.nav_corporate_he || 'לארגונים')
        : (siteSettings?.nav_corporate_en || 'Corporate'),
      path: 'CorporateLectures'
    },
    {
      key: 'personal',
      label: language === 'he'
        ? (siteSettings?.nav_personal_he || 'לפרטיות')
        : (siteSettings?.nav_personal_en || 'Personal'),
      path: 'PersonalWorkshops'
    },
    {
      key: 'testimonials',
      label: language === 'he'
        ? (siteSettings?.nav_testimonials_he || 'לקוחות ממליצים')
        : (siteSettings?.nav_testimonials_en || 'Testimonials'),
      path: 'Testimonials'
    },
    {
      key: 'podcast',
      label: language === 'he'
        ? (siteSettings?.nav_podcast_he || 'פודקסט פורצות קדימה')
        : (siteSettings?.nav_podcast_en || 'Breaking Forward Podcast'),
      path: 'Podcast'
    },
    {
      key: 'blog',
      label: language === 'he'
        ? (siteSettings?.nav_blog_he || 'בלוג')
        : (siteSettings?.nav_blog_en || 'Blog'),
      path: 'Blog'
    },
    {
      key: 'contact',
      label: language === 'he'
        ? (siteSettings?.nav_contact_he || 'צור קשר')
        : (siteSettings?.nav_contact_en || 'Contact'),
      path: 'Contact'
    }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center h-16 gap-4">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center flex-shrink-0">
            {(language === 'he' ? siteSettings?.logo_url_he?.trim() : siteSettings?.logo_url_en?.trim()) ? (
              <img
                src={language === 'he' ? siteSettings.logo_url_he : siteSettings.logo_url_en}
                alt={language === 'he' ? (siteSettings?.site_title_he?.trim() || '') : (siteSettings?.site_title_en?.trim() || '')}
                className="h-8 w-auto"
              />
            ) : (
              <div className="text-xl font-bold gradient-text">
                {language === 'he' ? (siteSettings?.site_title_he?.trim() || 'MOVEUP') : (siteSettings?.site_title_en?.trim() || 'MOVEUP')}
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex flex-1 justify-around items-center">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={createPageUrl(item.path)}
                className="text-[var(--text-color)] hover:text-[var(--primary-color)] px-1 py-2 text-sm font-medium transition-colors duration-200 relative group text-center"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[var(--primary-color)] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Controls */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse relative flex-shrink-0">
            {/* Language Switcher */}
            <button
              onClick={() => switchLanguage(language === 'he' ? 'en' : 'he')}
              className="flex items-center space-x-1 rtl:space-x-reverse text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors duration-200"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'he' ? 'EN' : 'עב'}
              </span>
            </button>

            {/* Desktop Menu Button */}
            <div className="relative">
              <button
                onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
                className="text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Desktop Dropdown Menu */}
              {isDesktopMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
                  {/* Site Admin Link - Only for Admin */}
                  {user?.role === 'admin' && (
                    <Link
                      to={createPageUrl('SiteAdmin')}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium hover:text-[var(--primary-color)] hover:bg-gray-50 transition-colors duration-200"
                      style={{ color: siteSettings?.header_admin_menu_color || 'var(--text-color)' }}
                      onClick={() => setIsDesktopMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      {t('מרכז בקרה', 'Site Admin')}
                    </Link>
                  )}

                  {/* Newsletter Manager Link - Only for Admin */}
                  {user?.role === 'admin' && (
                    <Link
                      to={createPageUrl('NewsletterManager')}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium hover:text-[var(--primary-color)] hover:bg-gray-50 transition-colors duration-200"
                      style={{ color: siteSettings?.header_admin_menu_color || 'var(--text-color)' }}
                      onClick={() => setIsDesktopMenuOpen(false)}
                    >
                      <Mail className="w-4 h-4" />
                      {t('ניהול ניוזלטר', 'Newsletter Manager')}
                    </Link>
                  )}

                  {/* Login/Logout Button */}
                  {user ? (
                    <button
                      onClick={() => {
                        logout();
                        setIsDesktopMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium hover:text-[var(--primary-color)] hover:bg-gray-50 transition-colors duration-200 w-full text-left"
                      style={{ color: siteSettings?.header_admin_menu_color || 'var(--text-color)' }}
                    >
                      <LogOut className="w-4 h-4" />
                      {t('יציאה', 'Logout')}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        login();
                        setIsDesktopMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium hover:text-[var(--primary-color)] hover:bg-gray-50 transition-colors duration-200 w-full text-left"
                      style={{ color: siteSettings?.header_admin_menu_color || 'var(--text-color)' }}
                    >
                      <LogIn className="w-4 h-4" />
                      {t('כניסה לאדמין', 'Admin Login')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex md:hidden justify-between items-center h-16">
          {/* Mobile Controls - Right Side */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[var(--text-color)] hover:text-[var(--primary-color)] p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => switchLanguage(language === 'he' ? 'en' : 'he')}
              className="flex items-center space-x-1 rtl:space-x-reverse text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors duration-200"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">
                {language === 'he' ? 'EN' : 'עב'}
              </span>
            </button>
          </div>

          {/* Mobile Logo - Center */}
          <Link to={createPageUrl('Home')} className="flex items-center absolute left-1/2 transform -translate-x-1/2">
            {(language === 'he' ? siteSettings?.logo_url_he?.trim() : siteSettings?.logo_url_en?.trim()) ? (
              <img
                src={language === 'he' ? siteSettings.logo_url_he : siteSettings.logo_url_en}
                alt={language === 'he' ? (siteSettings?.site_title_he?.trim() || '') : (siteSettings?.site_title_en?.trim() || '')}
                className="h-8 w-auto"
              />
            ) : (
              <div className="text-xl font-bold gradient-text">
                {language === 'he' ? (siteSettings?.site_title_he?.trim() || 'MOVEUP') : (siteSettings?.site_title_en?.trim() || 'MOVEUP')}
              </div>
            )}
          </Link>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={createPageUrl(item.path)}
                  className="block px-3 py-2 text-base font-medium text-[var(--text-color)] hover:text-[var(--primary-color)] hover:bg-gray-50 rounded-md transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Admin Link in Menu */}
              {user?.role === 'admin' && (
                <Link
                  to={createPageUrl('SiteAdmin')}
                  className="flex items-center gap-3 px-3 py-2 text-base font-medium hover:text-[var(--primary-color)] hover:bg-gray-50 rounded-md transition-colors duration-200"
                  style={{ color: siteSettings?.header_admin_menu_color || 'var(--text-color)' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  {t('מרכז בקרה', 'Site Admin')}
                </Link>
              )}

              {/* Mobile Newsletter Manager Link */}
              {user?.role === 'admin' && (
                <Link
                  to={createPageUrl('NewsletterManager')}
                  className="flex items-center gap-3 px-3 py-2 text-base font-medium hover:text-[var(--primary-color)] hover:bg-gray-50 rounded-md transition-colors duration-200"
                  style={{ color: siteSettings?.header_admin_menu_color || 'var(--text-color)' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Mail className="w-5 h-5" />
                  {t('ניהול ניוזלטר', 'Newsletter Manager')}
                </Link>
              )}

              {/* Login/Logout Button in Mobile Menu */}
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-base font-medium hover:text-[var(--primary-color)] hover:bg-gray-50 rounded-md transition-colors duration-200 w-full text-left"
                  style={{ color: siteSettings?.header_admin_menu_color || 'var(--text-color)' }}
                >
                  <LogOut className="w-5 h-5" />
                  {t('יציאה', 'Logout')}
                </button>
              ) : (
                <button
                  onClick={() => {
                    login();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-base font-medium hover:text-[var(--primary-color)] hover:bg-gray-50 rounded-md transition-colors duration-200 w-full text-left"
                  style={{ color: siteSettings?.header_admin_menu_color || 'var(--text-color)' }}
                >
                  <LogIn className="w-5 h-5" />
                  {t('כניסה לאדמין', 'Admin Login')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
