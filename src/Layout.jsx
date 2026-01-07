import React, { useEffect } from 'react';
import { LanguageProvider } from './components/LanguageContext';
import { SiteSettingsProvider, useSiteSettings } from './components/SiteSettingsContext';
import Header from './components/navigation/Header';
import Footer from './components/navigation/Footer';
import { Loader2 } from 'lucide-react';
import LogoCarousel from './components/home/LogoCarousel';
import CookieConsent from './components/shared/CookieConsent';
import AliceAndBotWidget from './components/shared/AliceAndBotWidget';
import { migrateSettings } from "@/functions/migrateSettings";

function StyleInjector() {
  const { siteSettings } = useSiteSettings();

  const googleFonts = [
      'Inter', 'Rubik', 'Assistant', 'Heebo', 'Frank Ruhl Libre', 
      'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'
  ].map(f => f.replace(' ', '+')).join('&family=');

  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${googleFonts}:wght@400;700&display=swap`;

  return (
    <>
      {/* Microsoft Clarity script REMOVED from here, now injected via useEffect in Layout component */}
      
      <style>
        {`
          @import url('${googleFontsUrl}');
          
          :root {
            --primary-color: ${siteSettings?.primary_color || '#005e6c'};
            --secondary-color: ${siteSettings?.secondary_color || '#006f79'};
            --accent-color: ${siteSettings?.accent_color || '#f4f1ee'};
            --text-color: ${siteSettings?.text_color || '#2e2e2e'};
            --background-color: ${siteSettings?.background_color || '#f4f1ee'};

            --font-family-he: "${siteSettings?.font_family_he || 'Rubik'}", sans-serif;
            --font-family-en: "${siteSettings?.font_family_en || 'Inter'}", sans-serif;
            --font-size-base: ${siteSettings?.font_size_base || '16px'};
            --font-weight-bold: ${siteSettings?.font_weight_bold || '700'};
          }
          
          body {
            background-color: var(--background-color);
            color: var(--text-color);
            font-size: var(--font-size-base);
            line-height: 1.6;
            margin: 0;
            padding: 0;
          }

          [lang="he"] body {
            font-family: var(--font-family-he);
          }
          [lang="en"] body {
            font-family: var(--font-family-en);
          }
          
          .gradient-text {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .smooth-transition {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .shadow-elegant {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          
          .animate-fade-in {
            animation: fadeIn 0.6s ease-out;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          }
          
          /* Quill Rich Text Editor Alignment Classes for Frontend Rendering */
          .ql-align-left { text-align: left; }
          .ql-align-center { text-align: center; }
          .ql-align-right { text-align: right; }
          .ql-align-justify { text-align: justify; }
          
          /* RTL Support */
          [dir="rtl"] .space-x-reverse > * + * {
            margin-right: 0.5rem;
            margin-left: 0;
          }
          
          [dir="rtl"] .rtl\\:text-right {
            text-align: right;
          }
          
          [dir="rtl"] .rtl\\:text-left {
            text-align: left;
          }

          /* Logo Carousel Mobile Adjustments */
          @media (max-width: 640px) {
            .logo-item {
              padding-left: 4px;
              padding-right: 4px;
            }
            }

            /* Ensure Chat Widget is above Cookie Consent but doesn't block it */
            /* Assuming the widget has a container class or ID, or simply by z-index management */
            /* Adjust Cookie Consent z-index to be very high, and maybe move chat widget up if we can target it */

            /* Attempt to target common widget containers or adjust layout to prevent overlap */
            #alice-chat-widget-container, .alice-chat-widget {
            z-index: 40 !important; /* Below cookie consent usually */
            bottom: 90px !important; /* Move it up slightly to avoid immediate overlap with bottom banner */
            }

            /* Ensure Cookie Consent is on top */
            .cookie-consent-banner {
            z-index: 50 !important;
            }
            `}
            </style>
    </>
  );
}

function AppContent({ children, currentPageName }) {
    const { loading } = useSiteSettings();

    if (loading) {
        return (
            <div style={{ backgroundColor: '#f4f1ee', color: '#2e2e2e' }} className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#005e6c]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[var(--background-color)]">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            {currentPageName !== 'Home' && <LogoCarousel />}
            <Footer />
            <CookieConsent />
        </div>
    );
}

export default function Layout({ children, currentPageName }) {
  useEffect(() => {
    // Data Migration (Temporary) - DISABLED to prevent overwriting new data
    // migrateSettings().then(res => console.log("Migration result:", res)).catch(err => console.error("Migration error:", err));

    // Microsoft Clarity script injection
    const scriptId = 'microsoft-clarity-script';
    if (document.getElementById(scriptId)) {
      return; // Script already exists
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/szurul38r2";
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "szurul38r2");
    `;
    
    document.head.appendChild(script);

    // Facebook domain verification meta tag
    const metaId = 'facebook-domain-verification';
    if (!document.getElementById(metaId)) {
      const meta = document.createElement('meta');
      meta.id = metaId;
      meta.name = 'facebook-domain-verification';
      meta.content = 'w3eu7cym4a5gsmupghavike7mmxdp5-n';
      document.head.appendChild(meta);
    }

    // Cleanup function to remove the script and meta when the component unmounts
    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      const existingMeta = document.getElementById(metaId);
      if (existingMeta) {
        document.head.removeChild(existingMeta);
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <LanguageProvider>
      <SiteSettingsProvider>
        <StyleInjector />
        <AppContent currentPageName={currentPageName}>
            {children}
            <AliceAndBotWidget />
        </AppContent>
      </SiteSettingsProvider>
    </LanguageProvider>
  );
}