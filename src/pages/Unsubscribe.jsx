import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { useSiteSettings } from '../components/SiteSettingsContext';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function Unsubscribe() {
  const { language, t } = useLanguage();
  const { siteSettings } = useSiteSettings();
  const [status, setStatus] = useState('loading'); // loading, success, error, notfound
  const [email, setEmail] = useState('');

  useEffect(() => {
    const handleUnsubscribe = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('notfound');
        return;
      }

      try {
        const subscribers = await base44.entities.Subscribers.filter({ unsubscribe_token: token });
        
        if (subscribers && subscribers.length > 0) {
          const subscriber = subscribers[0];
          setEmail(subscriber.email);
          
          await base44.entities.Subscribers.update(subscriber.id, {
            subscribed: false
          });
          
          setStatus('success');
        } else {
          setStatus('notfound');
        }
      } catch (error) {
        console.error('Error unsubscribing:', error);
        setStatus('error');
      }
    };

    handleUnsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background-color)] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-elegant p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-[var(--primary-color)] mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-[var(--text-color)] mb-2">
              {t('מעבד את הבקשה...', 'Processing your request...')}
            </h1>
            <p className="text-[var(--text-color)] opacity-70">
              {t('אנא המתן/י רגע', 'Please wait a moment')}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[var(--text-color)] mb-2">
              {t('הוסרת בהצלחה מרשימת התפוצה', 'Successfully Unsubscribed')} 💌
            </h1>
            <p className="text-[var(--text-color)] opacity-70 mb-4">
              {email && (
                <>
                  {t('המייל', 'The email')} <span className="font-semibold">{email}</span> {t('הוסר מרשימת התפוצה שלנו', 'has been removed from our mailing list')}
                </>
              )}
            </p>
            <p className="text-sm text-[var(--text-color)] opacity-60">
              {t('לא תקבל/י עוד הודעות מאיתנו. נשמח לראותך שוב בעתיד!', 'You will no longer receive emails from us. We hope to see you again in the future!')}
            </p>
          </>
        )}

        {status === 'notfound' && (
          <>
            <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[var(--text-color)] mb-2">
              {t('קישור לא תקין', 'Invalid Link')}
            </h1>
            <p className="text-[var(--text-color)] opacity-70">
              {t('הקישור שהשתמשת בו אינו תקף או שכבר הוסרת מהרשימה בעבר', 'The link you used is invalid or you have already been unsubscribed')}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[var(--text-color)] mb-2">
              {t('אירעה שגיאה', 'An Error Occurred')}
            </h1>
            <p className="text-[var(--text-color)] opacity-70">
              {t('מצטערים, משהו השתבש. אנא נסה/י שוב מאוחר יותר או צור/י איתנו קשר', 'Sorry, something went wrong. Please try again later or contact us')}
            </p>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <a
            href="/"
            className="text-[var(--primary-color)] hover:underline font-medium"
          >
            {t('חזרה לאתר', 'Back to Website')}
          </a>
        </div>
      </div>
    </div>
  );
}