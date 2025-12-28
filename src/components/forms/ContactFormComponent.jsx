
import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useSiteSettings } from '../SiteSettingsContext';
import { ContactForm } from '@/entities/ContactForm';
import { SendEmail } from '@/integrations/Core';
import { CheckCircle, Send, Loader2 } from 'lucide-react';

export default function ContactFormComponent() {
  const { language, t } = useLanguage();
  const { siteSettings } = useSiteSettings();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    organization: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // שמירת הפנייה במאגר הנתונים
      await ContactForm.create(formData);

      const logoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/dc5ba4739___-removebg-preview1.png";
      const iconUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/58b594245_image.png";

      // שליחת מייל לאדמין
      const emailContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>פנייה חדשה מהאתר</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              margin: 0;
              padding: 20px;
              direction: rtl;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .logo {
              width: 120px;
              height: auto;
              margin: 20px auto 0;
              display: block;
            }
            .success-icon {
              width: 80px;
              height: 80px;
              margin: 20px auto;
              display: block;
            }
            .content {
              padding: 40px;
            }
            .info-section {
              background: #f8f9ff;
              border-radius: 15px;
              padding: 25px;
              margin: 20px 0;
              border-right: 5px solid #667eea;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 0;
              border-bottom: 1px solid #e0e6ff;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              font-weight: 600;
              color: #5a67d8;
              flex: 0 0 100px;
            }
            .info-value {
              flex: 1;
              text-align: left;
              color: #2d3748;
            }
            .message-section {
              background: #fff8f0;
              border-radius: 15px;
              padding: 25px;
              margin: 20px 0;
              border-right: 5px solid #ed8936;
            }
            .message-title {
              font-weight: 700;
              color: #ed8936;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .message-content {
              line-height: 1.8;
              color: #2d3748;
              background: white;
              padding: 20px;
              border-radius: 10px;
              border: 1px solid #fed7aa;
            }
            .footer {
              background: #f7fafc;
              padding: 25px;
              text-align: center;
              color: #718096;
              font-size: 14px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 30px;
              border-radius: 50px;
              text-decoration: none;
              font-weight: 600;
              margin: 20px 0;
              transition: all 0.3s ease;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="${iconUrl}" alt="Success Icon" class="success-icon">
              <h1>איזה כיף! נכנסה פנייה חדשה מלקוח.ה</h1>
              <img src="${logoUrl}" alt="פורצות קדימה לוגו" class="logo">
            </div>
            
            <div class="content">
              <div class="info-section">
                <div class="info-row">
                  <span class="info-label">שם מלא:</span>
                  <span class="info-value">${formData.first_name} ${formData.last_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">אימייל:</span>
                  <span class="info-value">${formData.email}</span>
                </div>
                ${formData.phone ? `
                <div class="info-row">
                  <span class="info-label">טלפון:</span>
                  <span class="info-value">${formData.phone}</span>
                </div>
                ` : ''}
                ${formData.organization ? `
                <div class="info-row">
                  <span class="info-label">ארגון:</span>
                  <span class="info-value">${formData.organization}</span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="info-label">תאריך:</span>
                  <span class="info-value">${new Date().toLocaleDateString('he-IL')}</span>
                </div>
              </div>

              <div class="message-section">
                <div class="message-title">ההודעה:</div>
                <div class="message-content">${formData.message}</div>
              </div>

              <div style="text-align: center;">
                <a href="mailto:${formData.email}" class="cta-button">
                  השב/י ללקוח.ה
                </a>
              </div>
            </div>

            <div class="footer">
              <p>פנייה זו נשלחה דרך אתר פורצות קדימה<br>
              תאריך ושעה: ${new Date().toLocaleString('he-IL')}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await SendEmail({
        to: 'hello@moveup.today',
        subject: `פנייה חדשה מהאתר - ${formData.first_name} ${formData.last_name}`,
        body: emailContent
      });

      setIsSuccess(true);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        organization: '',
        message: ''
      });

    } catch (error) {
      console.error('Error sending form:', error);
      alert(t('אירעה שגיאה בשליחת הטופס. אנא נסי שוב.', 'An error occurred while sending the form. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-elegant p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-color)] mb-4">
            {language === 'he' ? 
              (siteSettings?.contact_form_success_title_he || 'תודה רבה!') : 
              (siteSettings?.contact_form_success_title_en || 'Thank You!')
            }
          </h2>
          <p className="text-opacity-70 text-[var(--text-color)] mb-6">
            {language === 'he' ? 
              (siteSettings?.contact_form_success_message_he || 'הפנייה שלך נשלחה בהצלחה. נחזור אלייך בהקדם!') : 
              (siteSettings?.contact_form_success_message_en || 'Your inquiry has been sent successfully. We will get back to you soon!')
            }
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-full font-semibold hover:bg-[var(--secondary-color)] smooth-transition"
          >
            {language === 'he' ? 
              (siteSettings?.contact_form_success_button_he || 'שלחי פנייה נוספת') : 
              (siteSettings?.contact_form_success_button_en || 'Send Another Inquiry')
            }
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{ 
        background: 'linear-gradient(135deg, #f4f1ee 0%, #e8d5c4 100%)'
      }}
    >
      <div className="max-w-2xl w-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with decorative element */}
          <div 
            className="relative p-8 text-center text-white overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)' }}
          >
            {/* Decorative circle */}
            <div className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-20" 
                 style={{ background: 'rgba(255,255,255,0.3)', transform: 'translate(-20px, -20px)' }}></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-10" 
                 style={{ background: 'rgba(255,255,255,0.3)', transform: 'translate(16px, 16px)' }}></div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
              {language === 'he' ? 
                (siteSettings?.contact_form_title_he || 'בואי נכיר!') : 
                (siteSettings?.contact_form_title_en || "Let's Connect!")
              }
            </h1>
            <p className="text-xl opacity-90 relative z-10">
              {language === 'he' ? 
                (siteSettings?.contact_form_subtitle_he || 'נשמח לשמוע ממך ולעזור לך לפרוץ קדימה') : 
                (siteSettings?.contact_form_subtitle_en || "We'd love to hear from you and help you move forward")
              }
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-color)] block">
                    {t('שם פרטי', 'First Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all duration-300 text-[var(--text-color)] placeholder-gray-400"
                    placeholder={t('שם פרטי', 'First Name')}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-color)] block">
                    {t('שם משפחה', 'Last Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all duration-300 text-[var(--text-color)] placeholder-gray-400"
                    placeholder={t('שם משפחה', 'Last Name')}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-color)] block">
                  {t('אימייל', 'Email')} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all duration-300 text-[var(--text-color)] placeholder-gray-400"
                  placeholder={t('your@email.com', 'your@email.com')}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-color)] block">
                  {t('טלפון', 'Phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    // מאפשר רק מספרים, מקפים ורווחים
                    const value = e.target.value.replace(/[^0-9\-\s]/g, '');
                    handleInputChange('phone', value);
                  }}
                  onKeyPress={(e) => {
                    // מונע הקלדה של תווים שאינם מספרים, מקפים או רווחים
                    if (!/[0-9\-\s]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all duration-300 text-[var(--text-color)] placeholder-gray-400"
                  placeholder={t('050-1234567', '050-1234567')}
                />
              </div>

              {/* Organization */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-color)] block">
                  {t('ארגון/חברה', 'Organization/Company')}
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all duration-300 text-[var(--text-color)] placeholder-gray-400"
                  placeholder={t('שם הארגון או החברה שלך', 'Your organization or company name')}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-color)] block">
                  {t('הודעה', 'Message')} *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all duration-300 resize-none text-[var(--text-color)] placeholder-gray-400"
                  placeholder={t('ספרי לנו איך נוכל לעזור לך...', 'Tell us how we can help you...')}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--primary-color)] text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:bg-[var(--secondary-color)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('שולח...', 'Sending...')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('שליחה', 'Send')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
