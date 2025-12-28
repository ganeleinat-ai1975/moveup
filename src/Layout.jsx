import React, { useEffect } from 'react';
import { LanguageProvider } from './components/LanguageContext';
import { SiteSettingsProvider, useSiteSettings } from './components/SiteSettingsContext';
import Header from './components/navigation/Header';
import Footer from './components/navigation/Footer';
import { Loader2 } from 'lucide-react';
import LogoCarousel from './components/home/LogoCarousel';
import CookieConsent from './components/shared/CookieConsent';
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

    // Alice & Bot Chat Widget Injection
    try {
      const currentPath = window.location.pathname;
      const isAdmin = currentPath.startsWith('/admin');
      const isEditing = window.location.href.includes('editMode=true');
      const isLogin = currentPath.includes('login');

      // Load only in frontend, not in admin / editing / login
      if (!isAdmin && !isEditing && !isLogin) {

        // Prevent duplicates
        if (!document.getElementById('alice-and-bot-params')) {

          // JSON params script
          const paramsScript = document.createElement('script');
          paramsScript.type = 'application/json';
          paramsScript.id = 'alice-and-bot-params';
          paramsScript.textContent = `{"participants":["MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlTSHc37GdIH4WhF0rIsUonZXEe61zkRbPEZTQ3R7lUs0SXS+C2Qkq7iI06YQv7Odc3r3vwplkQsS1cqybA5OwrX9uqLJEr7xQkAdW1uhmxTF7RZ+J+0OFrsgxi6tVd4ZK04X5ql4veMXKBUxXvQbK+KaUWw0WoZ27Hoy5IelKNESKa+mbZtkE1WuZF/fJmtuIkTFX5NWBB9gSO5WWULFaMWrIxrkZHyz9WUYZ0xopD9JazKG0Ij7wjcuCj/y2wVvdg9fHturtv1HabsD/NAgpwp6z/AWkb3o8HPLskIfW8Xq1AWV03BI3X5Gau5TqAf/MQHCzcaVP1SCWunqoCA+wQIDAQAB"],"startOpen":false,"buttonText":"לגלי הבוטית","requesterId":"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAucIut1MBCc8XT5YafDewtJlca3B/A636sUkdA8C1nTHIarqnKzH/Cx82gHwon9AXjFsFV5C25m+AIt8RZo4o4GpM/0amRGVMKNFCQar86uYLr9pSTSB3N2Hb9v4KcI1CrcSMPuiPvjeVHmcBWroZJDX7/su4KDDMjV94PmTK5ysx/rKGq8YeQRjhbtZDezYJhIaih8p26Gae6Gae6UrN3NkbAV2RWsiiSh4ZvKrq/0vDHfE/RJ3rtYfzuUl3t+/4WHIbUI303sdZ+43UuJHVkIBOkRsI3ZEAZ9OzpRgjXXVfrCQiFAAcp/fLTobYl5cOMBwnvWb0Sk3qosNf3W1WF1CK5wIDAQAB"}`;
          document.head.appendChild(paramsScript);

          // Widget loader script
          const loadScript = document.createElement('script');
          loadScript.textContent = `
            const widgetParams = JSON.parse(document.getElementById('alice-and-bot-params').textContent);
            const s = document.createElement('script');
            s.src = "https://storage.googleapis.com/alice-and-bot/widget/dist/widget.iife.js";
            s.async = true;
            s.onload = () => aliceAndBot.loadChatWidget(widgetParams);
            document.head.appendChild(s);
          `;
          document.head.appendChild(loadScript);

        }
      }
    } catch (err) {
      console.error('Alice & Bot widget failed to load:', err);
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
        </AppContent>
      </SiteSettingsProvider>
    </LanguageProvider>
  );
}