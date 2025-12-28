
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useSiteSettings } from '../components/SiteSettingsContext';
import { sendNewsletterBrevo } from '@/functions/sendNewsletterBrevo';
import {
  Mail, Upload, Users, Send, Loader2, CheckCircle,
  XCircle, Search, Calendar, Trash2, Plus, X, FileCode, Layout, Edit3, Settings, Image
} from 'lucide-react';
import RichTextEditor from '../components/admin/RichTextEditor';

export default function NewsletterManager() {
  const { language, t } = useLanguage();
  const { siteSettings, reloadSettings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState('subscribers');
  const [subscribers, setSubscribers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Newsletter sending states
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('כל הרשימה');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  // CSV Import states
  const [importing, setImporting] = useState(false);
  // importFile can now be an object: { type: 'file', file: File } or { type: 'text', text: string }
  const [importFile, setImportFile] = useState(null);
  const [importGroup, setImportGroup] = useState('כל הרשימה');

  // Add Subscriber Modal states
  const [showAddSubscriber, setShowAddSubscriber] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({
    email: '',
    name: '',
    job_title: '',
    company: '',
    notes: '',
    group: 'כל הרשימה'
  });
  const [addingSubscriber, setAddingSubscriber] = useState(false);

  // Edit Subscriber Modal states
  const [showEditSubscriber, setShowEditSubscriber] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState(null);
  const [updatingSubscriber, setUpdatingSubscriber] = useState(false);

  // Newsletter Design Mode states
  const [designMode, setDesignMode] = useState('free'); // 'template', 'html', 'free'
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [templateData, setTemplateData] = useState({
    title: '',
    subtitle: '',
    mainText: '',
    imageUrl: ''
  });
  const [htmlContent, setHtmlContent] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // CTA Buttons states - now supporting multiple buttons
  const [ctaButtons, setCtaButtons] = useState([]);
  const [uploadingCtaImage, setUploadingCtaImage] = useState(false);

  // Settings states
  const [newGroupName, setNewGroupName] = useState('');
  const [addingGroup, setAddingGroup] = useState(false);
  
  // Edit Group Modal states
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [editingGroupNewName, setEditingGroupNewName] = useState('');
  const [updatingGroup, setUpdatingGroup] = useState(false);

  // Resend Modal states
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendData, setResendData] = useState(null);
  const [resendSubject, setResendSubject] = useState('');
  const [resendGroup, setResendGroup] = useState('כל הרשימה');
  const [resendContent, setResendContent] = useState('');

  // Get groups from siteSettings, fallback to default
  const groups = siteSettings?.newsletter_groups || ['כל הרשימה', 'לקוחות חוזרים', 'חדשות', 'מנהלות', 'מעודכנות פורצות קדימה'];

  useEffect(() => {
    loadSubscribers();
    loadLogs();
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Subscribers.list('-created_date');
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await base44.entities.NewsletterLogs.list('-sent_date', 50);
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  // Calculate newsletter statistics
  const newsletterStats = {
    totalNewslettersSent: logs.filter(log =>
      log.status === 'נשלח בהצלחה' || (log.status && log.status.startsWith('נשלח חלקית'))
    ).length,
    totalEmailsSent: logs.reduce((sum, log) => {
      if (log.status === 'נשלח בהצלחה' || (log.status && log.status.startsWith('נשלח חלקית'))) {
        return sum + (log.recipients_count || 0);
      }
      return sum;
    }, 0)
  };

  const generateToken = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleAddSubscriber = async () => {
    if (!newSubscriber.email) {
      alert(t('אנא הזיני כתובת מייל', 'Please enter an email address'));
      return;
    }

    setAddingSubscriber(true);
    try {
      // Check if email already exists
      const existing = await base44.entities.Subscribers.filter({ email: newSubscriber.email });

      if (existing && existing.length > 0) {
        alert(t('המייל כבר קיים ברשימה', 'Email already exists in the list'));
        setAddingSubscriber(false);
        return;
      }

      // Create new subscriber
      await base44.entities.Subscribers.create({
        email: newSubscriber.email,
        name: newSubscriber.name || '',
        job_title: newSubscriber.job_title || '',
        company: newSubscriber.company || '',
        notes: newSubscriber.notes || '',
        group: newSubscriber.group,
        subscribed: true,
        unsubscribe_token: generateToken(),
        source: 'הוספה ידנית'
      });

      alert(t('המנוי נוסף בהצלחה!', 'Subscriber added successfully!'));
      setShowAddSubscriber(false);
      setNewSubscriber({ email: '', name: '', job_title: '', company: '', notes: '', group: 'כל הרשימה' });
      loadSubscribers();
    } catch (error) {
      console.error('Error adding subscriber:', error);
      alert(t('שגיאה בהוספת המנוי', 'Error adding subscriber'));
    } finally {
      setAddingSubscriber(false);
    }
  };

  const handleImportCSV = async () => {
    if (!importFile || (!importFile.file && !importFile.text)) {
      alert(t('אנא הדביקי נתונים או בחרי קובץ להעלאה', 'Please paste data or select a file to upload'));
      return;
    }

    setImporting(true);
    try {
      let items = [];

      // Method 1: Parse text directly (no encoding issues!)
      if (importFile.type === 'text' && importFile.text) {
        const lines = importFile.text.trim().split('\n');

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue; // Skip empty lines

          // Parse line: email,name,job_title,company,notes
          const parts = trimmedLine.split(',').map(p => p.trim());
          const email = parts[0];
          const name = parts[1] || '';
          const job_title = parts[2] || '';
          const company = parts[3] || '';
          const notes = parts[4] || '';

          // Basic email validation
          if (email && email.includes('@')) {
            items.push({ email, name, job_title, company, notes });
          }
        }
      }
      // Method 2: Upload file (original method with encoding issues)
      else if (importFile.type === 'file' && importFile.file) {
        const uploadedFile = await base44.integrations.Core.UploadFile({ file: importFile.file });

        const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: uploadedFile.file_url,
          json_schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    name: { type: "string" },
                    job_title: { type: "string" },
                    company: { type: "string" },
                    notes: { type: "string" }
                  }
                }
              }
            }
          }
        });

        if (extractResult.status === 'success' && extractResult.output && extractResult.output.items) {
          items = extractResult.output.items;
        } else {
          alert(t('שגיאה בקריאת הקובץ. נסי את שיטת ההעתקה וההדבקה.', 'Error reading file. Try the copy-paste method.'));
          setImporting(false);
          return;
        }
      }

      // Process the items
      if (items.length === 0) {
        alert(t('לא נמצאו כתובות מייל תקינות', 'No valid email addresses found'));
        setImporting(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      let duplicateCount = 0;

      for (const item of items) {
        if (item.email) {
          try {
            // Check if email already exists
            const existing = await base44.entities.Subscribers.filter({ email: item.email });

            if (existing && existing.length > 0) {
              duplicateCount++;
              continue;
            }

            // Create new subscriber with token
            await base44.entities.Subscribers.create({
              email: item.email,
              name: item.name || '',
              job_title: item.job_title || '',
              company: item.company || '',
              notes: item.notes || '',
              group: importGroup,
              subscribed: true,
              unsubscribe_token: generateToken(),
              source: importFile.type === 'text' ? 'הדבקה ידנית' : 'ייבוא CSV'
            });
            successCount++;
          } catch (err) {
            console.error('Error creating subscriber:', err);
            errorCount++;
          }
        }
      }

      alert(t(
        `✅ הייבוא הושלם!\n\n` +
        `נוספו: ${successCount} מנויים חדשים\n` +
        `כבר קיימים: ${duplicateCount}\n` +
        `שגיאות: ${errorCount}`,

        `✅ Import completed!\n\n` +
        `Added: ${successCount} new subscribers\n` +
        `Already exist: ${duplicateCount}\n` +
        `Errors: ${errorCount}`
      ));

      loadSubscribers();
      setImportFile(null);
    } catch (error) {
      console.error('Import error:', error);

      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('encoding') || errorMessage.includes('unicode') || errorMessage.includes('UTF')) {
        alert(t(
          '❌ שגיאת קידוד בקובץ!\n\n' +
          '💡 פתרון: השתמשי בשיטת ההעתקה וההדבקה במקום.\n' +
          'פשוט העתיקי את הנתונים מהאקסל והדביקי בשדה הטקסט.',

          '❌ File encoding error!\n\n' +
          '💡 Solution: Use the copy-paste method instead.\n' +
          'Just copy the data from Excel and paste it in the text field.'
        ));
      } else {
        alert(t(
          'שגיאה בייבוא. נסי את שיטת ההעתקה וההדבקה.',
          'Import error. Try the copy-paste method.'
        ));
      }
    } finally {
      setImporting(false);
    }
  };

  const handleEditSubscriber = (subscriber) => {
    setEditingSubscriber({
      id: subscriber.id,
      email: subscriber.email,
      name: subscriber.name || '',
      job_title: subscriber.job_title || '',
      company: subscriber.company || '',
      notes: subscriber.notes || '',
      group: subscriber.group,
      subscribed: subscriber.subscribed
    });
    setShowEditSubscriber(true);
  };

  const handleUpdateSubscriber = async () => {
    if (!editingSubscriber.email) {
      alert(t('אנא הזיני כתובת מייל', 'Please enter an email address'));
      return;
    }

    setUpdatingSubscriber(true);
    try {
      await base44.entities.Subscribers.update(editingSubscriber.id, {
        email: editingSubscriber.email,
        name: editingSubscriber.name || '',
        job_title: editingSubscriber.job_title || '',
        company: editingSubscriber.company || '',
        notes: editingSubscriber.notes || '',
        group: editingSubscriber.group,
        subscribed: editingSubscriber.subscribed
      });

      alert(t('המנוי עודכן בהצלחה!', 'Subscriber updated successfully!'));
      setShowEditSubscriber(false);
      setEditingSubscriber(null);
      loadSubscribers();
    } catch (error) {
      console.error('Error updating subscriber:', error);
      alert(t('שגיאה בעדכון המנוי', 'Error updating subscriber'));
    } finally {
      setUpdatingSubscriber(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('אנא בחרי קובץ תמונה', 'Please select an image file'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('התמונה גדולה מדי. מקסימום 5MB', 'Image is too large. Maximum 5MB'));
      return;
    }

    setUploadingImage(true);
    try {
      const uploadedFile = await base44.integrations.Core.UploadFile({ file });
      setTemplateData({...templateData, imageUrl: uploadedFile.file_url});
      alert(t('התמונה הועלתה בהצלחה!', 'Image uploaded successfully!'));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(t('שגיאה בהעלאת התמונה', 'Error uploading image'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCtaImageUpload = async (e, buttonIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('אנא בחרי קובץ תמונה', 'Please select an image file'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t('התמונה גדולה מדי. מקסימום 5MB', 'Image is too large. Maximum 5MB'));
      return;
    }

    setUploadingCtaImage(true);
    try {
      const uploadedFile = await base44.integrations.Core.UploadFile({ file });
      const newButtons = [...ctaButtons];
      newButtons[buttonIndex] = { ...newButtons[buttonIndex], imageUrl: uploadedFile.file_url };
      setCtaButtons(newButtons);
      alert(t('התמונה הועלתה בהצלחה!', 'Image uploaded successfully!'));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(t('שגיאה בהעלאת התמונה', 'Error uploading image'));
    } finally {
      setUploadingCtaImage(false);
    }
  };

  const addCtaButton = () => {
    setCtaButtons([...ctaButtons, { text: '', link: '', imageUrl: '', style: 'primary' }]);
  };

  const removeCtaButton = (index) => {
    setCtaButtons(ctaButtons.filter((_, i) => i !== index));
  };

  const updateCtaButton = (index, field, value) => {
    const newButtons = [...ctaButtons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setCtaButtons(newButtons);
  };

  const generateTemplateHTML = () => {
    const primaryColor = siteSettings?.primary_color || '#005e6c';
    const secondaryColor = siteSettings?.secondary_color || '#006f79';
    const textColor = siteSettings?.text_color || '#2e2e2e';
    const backgroundColor = siteSettings?.background_color || '#f4f1ee';
    const ctaButtonsHtml = generateCtaButtonsHTML();

    const templates = {
      classic: `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${backgroundColor}; margin: 0; padding: 20px; direction: rtl; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); direction: rtl; }
            .header { background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); padding: 40px 20px; text-align: center; direction: rtl; }
            .header h1 { color: white; margin: 0; font-size: 32px; direction: rtl; }
            .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px; direction: rtl; }
            .content { padding: 40px 30px; text-align: right; direction: rtl; }
            .content img { width: 100%; max-width: 500px; border-radius: 8px; margin: 20px 0; }
            .content p { color: ${textColor}; line-height: 1.8; font-size: 16px; text-align: right; direction: rtl; }
            .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 { text-align: right; direction: rtl; }
            .content ul, .content ol { text-align: right; direction: rtl; padding-right: 20px; padding-left: 0; }
            .content li { text-align: right; direction: rtl; }
            .cta { text-align: center; margin: 30px 0; direction: rtl; }
            .cta a { background: ${primaryColor}; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: bold; }
            .footer { background: ${backgroundColor}; padding: 30px; text-align: center; color: #666; font-size: 14px; direction: rtl; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${templateData.title || t('כותרת הניוזלטר', 'Newsletter Title')}</h1>
              <p>${templateData.subtitle || t('כותרת משנה', 'Subtitle')}</p>
            </div>
            <div class="content">
              ${templateData.imageUrl ? `<img src="${templateData.imageUrl}" alt="${t('תמונה', 'Image')}" style="max-width: 100%; height: auto; display: block; margin: 20px auto;">` : ''}
              ${templateData.mainText || t('תוכן הניוזלטר יופיע כאן...', 'Newsletter content will appear here...')}
            </div>
            ${ctaButtonsHtml}
            <div class="footer">
              <p>${t('קיבלת מייל זה כי נרשמת לרשימת התפוצה שלנו', 'You received this email because you subscribed to our newsletter')}</p>
              <p><a href="{{unsubscribe_link}}" style="color: ${primaryColor};">${t('הסרה מהרשימה', 'Unsubscribe')}</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      modern: `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${backgroundColor}; margin: 0; padding: 20px; direction: rtl; }
            .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.1); direction: rtl; }
            .hero { background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); padding: 60px 40px; text-align: center; position: relative; direction: rtl; }
            .hero h1 { color: white; margin: 0; font-size: 36px; font-weight: bold; direction: rtl; }
            .hero p { color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 20px; direction: rtl; }
            .two-column { display: flex; padding: 40px; gap: 30px; flex-wrap: wrap; direction: rtl; }
            .column { flex: 1; min-width: 250px; direction: rtl; }
            .column img { width: 100%; border-radius: 12px; margin-bottom: 20px; }
            .column p { color: ${textColor}; line-height: 1.8; font-size: 16px; text-align: right; direction: rtl; }
            .column h1, .column h2, .column h3, .column h4, .column h5, .column h6 { text-align: right; direction: rtl; }
            .column ul, .column ol { text-align: right; direction: rtl; padding-right: 20px; padding-left: 0; }
            .column li { text-align: right; direction: rtl; }
            .cta-section { background: #f8f9fa; padding: 40px; text-align: center; direction: rtl; }
            .cta-section a { background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); color: white; padding: 18px 50px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: bold; font-size: 18px; }
            .footer { padding: 30px; text-align: center; color: #666; font-size: 14px; background: #fafafa; direction: rtl; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="hero">
              <h1>${templateData.title || t('כותרת מודרנית', 'Modern Title')}</h1>
              <p>${templateData.subtitle || t('תת כותרת מרשימה', 'Impressive Subtitle')}</p>
            </div>
            <div class="two-column">
              ${templateData.imageUrl ? `
              <div class="column">
                <img src="${templateData.imageUrl}" alt="${t('תמונה', 'Image')}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
              </div>
              ` : ''}
              <div class="column">
                ${templateData.mainText || t('תוכן הניוזלטר המודרני שלך...', 'Your modern newsletter content...')}
              </div>
            </div>
            ${ctaButtonsHtml}
            <div class="footer">
              <p>${t('קיבלת מייל זה כי נרשמת לרשימת התפוצה שלנו', 'You received this email because you subscribed to our newsletter')}</p>
              <p><a href="{{unsubscribe_link}}" style="color: ${primaryColor};">${t('הסרה מהרשימה', 'Unsubscribe')}</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      minimal: `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; margin: 0; padding: 40px 20px; direction: rtl; }
            .container { max-width: 500px; margin: 0 auto; direction: rtl; }
            .header { border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 30px; direction: rtl; }
            .header h1 { color: ${textColor}; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: -0.5px; text-align: right; direction: rtl; }
            .header p { color: #666; margin: 10px 0 0 0; font-size: 16px; font-weight: 300; text-align: right; direction: rtl; }
            .content { text-align: right; direction: rtl; }
            .content img { width: 100%; border-radius: 4px; margin: 30px 0; }
            .content p { color: ${textColor}; line-height: 1.9; font-size: 16px; font-weight: 300; text-align: right; direction: rtl; }
            .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 { text-align: right; direction: rtl; }
            .content ul, .content ol { text-align: right; direction: rtl; padding-right: 20px; padding-left: 0; }
            .content li { text-align: right; direction: rtl; }
            .cta { margin: 40px 0; text-align: center; direction: rtl; }
            .cta a { color: ${primaryColor}; padding: 14px 35px; text-decoration: none; border: 2px solid ${primaryColor}; display: inline-block; font-weight: 400; transition: all 0.3s; }
            .footer { border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 40px; text-align: center; color: #999; font-size: 13px; font-weight: 300; direction: rtl; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${templateData.title || t('כותרת נקייה', 'Clean Title')}</h1>
              <p>${templateData.subtitle || t('פשטות היא תחכום', 'Simplicity is Sophistication')}</p>
            </div>
            <div class="content">
              ${templateData.imageUrl ? `<img src="${templateData.imageUrl}" alt="${t('תמונה', 'Image')}" style="max-width: 100%; height: auto; display: block; margin: 30px auto;">` : ''}
              ${templateData.mainText || t('תוכן מינימליסטי ואלגנטי...', 'Minimalist and elegant content...')}
            </div>
            ${ctaButtonsHtml}
            <div class="footer">
              <p>${t('קיבלת מייל זה כי נרשמת לרשימת התפוצה שלנו', 'You received this email because you subscribed to our newsletter')}</p>
              <p><a href="{{unsubscribe_link}}" style="color: ${primaryColor}; text-decoration: none;">${t('הסרה מהרשימה', 'Unsubscribe')}</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return templates[selectedTemplate] || templates.classic;
  };

  const generateCtaButtonsHTML = () => {
    if (!ctaButtons || ctaButtons.length === 0) return '';

    return ctaButtons.map((button, index) => {
      if (!button.text || !button.link) return ''; // Skip if text or link is missing

      const primaryColor = siteSettings?.primary_color || '#005e6c';

      const buttonStyles = {
        primary: {
          bg: primaryColor,
          color: '#ffffff',
          border: 'none'
        },
        secondary: {
          bg: '#ffffff',
          color: primaryColor,
          border: `2px solid ${primaryColor}`
        },
        outline: {
          bg: 'transparent',
          color: primaryColor,
          border: `2px solid ${primaryColor}`
        }
      };

      const style = buttonStyles[button.style] || buttonStyles.primary;

      return `
        <div style="text-align: center; margin: ${index === 0 ? '30px' : '15px'} 0; padding: ${index === 0 ? '20px' : '10px'} 0; direction: rtl;">
          ${button.imageUrl ? `<img src="${button.imageUrl}" alt="${button.text}" width="200" border="0" style="max-width: 200px; width: 200px; margin-bottom: 15px; border-radius: 8px; display: block !important; margin-left: auto; margin-right: auto; height: auto; border: none; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">` : ''}
          <a href="${button.link}" style="background: ${style.bg}; color: ${style.color}; padding: 15px 40px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: bold; font-size: 16px; border: ${style.border}; mso-padding-alt: 0px; direction: rtl;">
              <!--[if mso]>
              <i style="letter-spacing: 40px; mso-font-width:-100%; mso-text-raise:30px;" hidden>&nbsp;</i>
              <![endif]-->
              <span style="mso-text-raise:15px;">${button.text}</span>
              <!--[if mso]>
              <i style="letter-spacing: 40px; mso-font-width:-100%;" hidden>&nbsp;</i>
              <![endif]-->
          </a>
        </div>
      `;
    }).join('');
  };

  const handleSendNewsletter = async () => {
    if (!subject) {
      alert(t('אנא מלאי נושא לניוזלטר', 'Please fill in subject'));
      return;
    }

    // Generate final content based on design mode
    let finalContent = '';
    const ctaButtonsHtml = generateCtaButtonsHTML();

    if (designMode === 'template') {
      finalContent = generateTemplateHTML();
    } else if (designMode === 'html') {
      if (!htmlContent) {
        alert(t('אנא הדביקי את קוד ה-HTML', 'Please paste the HTML code'));
        return;
      }
      finalContent = htmlContent;

      if (ctaButtonsHtml) {
        if (finalContent.includes('</body>')) {
          finalContent = finalContent.replace('</body>', `${ctaButtonsHtml}</body>`);
        } else {
          finalContent += ctaButtonsHtml;
        }
      }
    } else { // designMode === 'free'
      if (!content) {
        alert(t('אנא מלאי תוכן לניוזלטר', 'Please fill in content'));
        return;
      }

      finalContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f1ee; margin: 0; padding: 20px; direction: rtl; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: right; direction: rtl; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px; direction: rtl; }
            h1, h2, h3, h4, h5, h6 { text-align: right; direction: rtl; }
            p { text-align: right; line-height: 1.8; direction: rtl; }
            ul, ol { text-align: right; direction: rtl; padding-right: 20px; padding-left: 0; }
            li { text-align: right; direction: rtl; }
          </style>
        </head>
        <body>
          <div class="container">
            ${content}
            ${ctaButtonsHtml}
            <div class="footer">
              <p>${t('קיבלת מייל זה כי נרשמת לרשימת התפוצה שלנו', 'You received this email because you subscribed to our newsletter')}</p>
              <p><a href="{{unsubscribe_link}}" style="color: #005e6c;">${t('הסרה מהרשימה', 'Unsubscribe')}</a></p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Get subscriber count for the selected group
    let filter = { subscribed: true };
    if (selectedGroup !== 'כל הרשימה') {
      filter.group = selectedGroup;
    }

    const recipients = await base44.entities.Subscribers.filter(filter);
    const recipientCount = recipients ? recipients.length : 0;

    if (recipientCount === 0) {
      alert(t('לא נמצאו מנויים פעילים בקבוצה זו', 'No active subscribers found in this group'));
      return;
    }

    // Confirmation popup with group name and subscriber count
    if (!confirm(t(
      `האם את בטוחה שאת רוצה לשלוח את הניוזלטר?\n\nקבוצה: ${selectedGroup}\nמספר מנויים: ${recipientCount}`,
      `Are you sure you want to send the newsletter?\n\nGroup: ${selectedGroup}\nSubscribers: ${recipientCount}`
    ))) {
      return;
    }

    setSending(true);
    setSendStatus(null);

    try {
      const BATCH_SIZE = 280;
      const BATCH_DELAY_MS = 24 * 60 * 60 * 1000;
      const totalRecipients = recipients.length;
      const totalBatches = Math.ceil(totalRecipients / BATCH_SIZE);

      let totalSuccessCount = 0;
      let totalErrorCount = 0;
      const allErrorDetails = [];

      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batchStart = batchIndex * BATCH_SIZE;
        const batchEnd = Math.min(batchStart + BATCH_SIZE, totalRecipients);
        const batchRecipients = recipients.slice(batchStart, batchEnd);

        if (totalBatches > 1) {
          alert(t(
            `שולח מנה ${batchIndex + 1} מתוך ${totalBatches}...\n${batchRecipients.length} מיילים במנה זו\n\n⏰ בין מנות יהיה השהיה של 24 שעות`,
            `Sending batch ${batchIndex + 1} of ${totalBatches}...\n${batchRecipients.length} emails in this batch\n\n⏰ There will be a 24-hour delay between batches`
          ));
        }

        const batchRecipientsWithUnsubscribe = batchRecipients.map(recipient => {
          const unsubscribeLink = `${window.location.origin}/Unsubscribe?token=${recipient.unsubscribe_token}`;
          const personalizedContent = finalContent.replace(/\{\{unsubscribe_link\}\}/g, unsubscribeLink);
          
          return {
            email: recipient.email,
            name: recipient.name || '',
            html_content: personalizedContent
          };
        });

        try {
          const result = await sendNewsletterBrevo({
            recipients: batchRecipientsWithUnsubscribe,
            subject: subject,
            html_content: finalContent,
            from_name: 'פורצות קדימה - MOVEUP',
            from_email: 'hello@moveup.today'
          });

          totalSuccessCount += result.data.success_count;
          totalErrorCount += result.data.failed_count;
          
          if (result.data.failed_details && result.data.failed_details.length > 0) {
            result.data.failed_details.forEach(fail => {
              allErrorDetails.push(`${fail.email}: ${fail.error}`);
            });
          }

        } catch (error) {
          console.error('Error in batch:', error);
          totalErrorCount += batchRecipients.length;
          allErrorDetails.push(`Batch ${batchIndex + 1} failed: ${error.message}`);
        }

        if (batchIndex < totalBatches - 1) {
          const hoursToWait = BATCH_DELAY_MS / (60 * 60 * 1000);
          alert(t(
            `✅ מנה ${batchIndex + 1} הושלמה!\n\n⏰ ממתין ${hoursToWait} שעות לפני המנה הבאה...`,
            `✅ Batch ${batchIndex + 1} completed!\n\n⏰ Waiting ${hoursToWait} hours before next batch...`
          ));
          await delay(BATCH_DELAY_MS);
        }
      }

      await base44.entities.NewsletterLogs.create({
        subject,
        content: finalContent,
        group: selectedGroup,
        recipients_count: totalSuccessCount,
        status: totalErrorCount === 0 ? 'נשלח בהצלחה' : `נשלח חלקית (${totalErrorCount} שגיאות)`,
        sent_date: new Date().toISOString(),
        sent_by: totalBatches > 1 ? `Brevo (${totalBatches} מנות)` : 'Brevo',
        error_message: totalErrorCount > 0 ? `${allErrorDetails.length} מיילים נכשלו:\n${allErrorDetails.slice(0, 5).join('\n')}${allErrorDetails.length > 5 ? '\n...' : ''}` : null
      });

      setSendStatus('success');

      if (totalErrorCount === 0) {
        alert(t(
          `✅ הניוזלטר נשלח בהצלחה!\n\n📧 ${totalSuccessCount} מיילים נשלחו\n📦 ${totalBatches} מנות`,
          `✅ Newsletter sent successfully!\n\n📧 ${totalSuccessCount} emails sent\n📦 ${totalBatches} batches`
        ));
      } else {
        alert(t(
          `הניוזלטר נשלח ל-${totalSuccessCount} מנויים בהצלחה.\n\n${totalErrorCount} נכשלו.`,
          `Newsletter sent to ${totalSuccessCount} subscribers successfully.\n\n${totalErrorCount} failed.`
        ));
      }

      setSubject('');
      setContent('');
      setHtmlContent('');
      setTemplateData({
        title: '',
        subtitle: '',
        mainText: '',
        imageUrl: ''
      });
      setCtaButtons([]);
      loadLogs();
    } catch (error) {
      console.error('Send error:', error);
      setSendStatus('error');

      await base44.entities.NewsletterLogs.create({
        subject,
        content: finalContent,
        group: selectedGroup,
        recipients_count: 0,
        status: 'נכשל',
        sent_date: new Date().toISOString(),
        error_message: error.message || 'Unknown error',
        sent_by: 'Brevo'
      });

      alert(t('שגיאה בשליחת הניוזלטר: ' + error.message, 'Error sending newsletter: ' + error.message));
    } finally {
      setSending(false);
    }
  };

  const handleResendNewsletter = async (log) => {
    if (!log.content) {
      alert(t('לא ניתן לשלוח מחדש - תוכן המייל לא נשמר', 'Cannot resend - email content not saved'));
      return;
    }

    // Open modal for editing
    setResendData(log);
    setResendSubject(log.subject);
    setResendGroup(log.group);
    setResendContent(log.content);
    setShowResendModal(true);
  };

  const handleConfirmResend = async () => {
    if (!resendSubject.trim()) {
      alert(t('אנא הזיני נושא לניוזלטר', 'Please enter a subject'));
      return;
    }

    // Get subscriber count for the selected group
    let filter = { subscribed: true };
    if (resendGroup !== 'כל הרשימה') {
      filter.group = resendGroup;
    }

    const recipients = await base44.entities.Subscribers.filter(filter);
    const recipientCount = recipients ? recipients.length : 0;

    if (recipientCount === 0) {
      alert(t('לא נמצאו מנויים פעילים בקבוצה זו', 'No active subscribers found in this group'));
      return;
    }

    // Confirmation popup with group name and subscriber count
    if (!confirm(t(
      `האם את בטוחה שאת רוצה לשלוח מחדש את "${resendSubject}"?\n\nקבוצה: ${resendGroup}\nמספר מנויים: ${recipientCount}`,
      `Are you sure you want to resend "${resendSubject}"?\n\nGroup: ${resendGroup}\nSubscribers: ${recipientCount}`
    ))) {
      return;
    }

    setSending(true);

    try {
      const BATCH_SIZE = 280; // Assuming same batching logic for resend via Brevo
      const BATCH_DELAY_MS = 24 * 60 * 60 * 1000;
      const totalRecipients = recipients.length;
      const totalBatches = Math.ceil(totalRecipients / BATCH_SIZE);

      let totalSuccessCount = 0;
      let totalErrorCount = 0;
      const allErrorDetails = [];

      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batchStart = batchIndex * BATCH_SIZE;
        const batchEnd = Math.min(batchStart + BATCH_SIZE, totalRecipients);
        const batchRecipients = recipients.slice(batchStart, batchEnd);

        if (totalBatches > 1) {
          alert(t(
            `שולח מנה ${batchIndex + 1} מתוך ${totalBatches} (שליחה מחדש)...\n${batchRecipients.length} מיילים במנה זו\n\n⏰ בין מנות יהיה השהיה של 24 שעות`,
            `Resending batch ${batchIndex + 1} of ${totalBatches}...\n${batchRecipients.length} emails in this batch\n\n⏰ There will be a 24-hour delay between batches`
          ));
        }

        const batchRecipientsWithUnsubscribe = batchRecipients.map(recipient => {
          const unsubscribeLink = `${window.location.origin}/Unsubscribe?token=${recipient.unsubscribe_token}`;
          const personalizedContent = resendContent.replace(/\{\{unsubscribe_link\}\}/g, unsubscribeLink);
          
          return {
            email: recipient.email,
            name: recipient.name || '',
            html_content: personalizedContent
          };
        });

        try {
          const result = await sendNewsletterBrevo({
            recipients: batchRecipientsWithUnsubscribe,
            subject: resendSubject,
            html_content: resendContent,
            from_name: 'פורצות קדימה - MOVEUP',
            from_email: 'hello@moveup.today'
          });

          totalSuccessCount += result.data.success_count;
          totalErrorCount += result.data.failed_count;
          
          if (result.data.failed_details && result.data.failed_details.length > 0) {
            result.data.failed_details.forEach(fail => {
              allErrorDetails.push(`${fail.email}: ${fail.error}`);
            });
          }
        } catch (error) {
          console.error('Error in resend batch:', error);
          totalErrorCount += batchRecipients.length;
          allErrorDetails.push(`Resend Batch ${batchIndex + 1} failed: ${error.message}`);
        }

        if (batchIndex < totalBatches - 1) {
          const hoursToWait = BATCH_DELAY_MS / (60 * 60 * 1000);
          alert(t(
            `✅ מנה ${batchIndex + 1} הושלמה (שליחה מחדש)!\n\n⏰ ממתין ${hoursToWait} שעות לפני המנה הבאה...`,
            `✅ Resend Batch ${batchIndex + 1} completed!\n\n⏰ Waiting ${hoursToWait} hours before next batch...`
          ));
          await delay(BATCH_DELAY_MS);
        }
      }

      // Create new log
      await base44.entities.NewsletterLogs.create({
        subject: resendSubject + ' (שליחה מחדש)',
        content: resendContent,
        group: resendGroup,
        recipients_count: totalSuccessCount,
        status: totalErrorCount === 0 ? 'נשלח בהצלחה' : `נשלח חלקית (${totalErrorCount} שגיאות)`,
        sent_date: new Date().toISOString(),
        sent_by: totalBatches > 1 ? `Brevo (שליחה מחדש, ${totalBatches} מנות)` : 'Brevo (שליחה מחדש)',
        error_message: totalErrorCount > 0 ? `${allErrorDetails.length} מיילים נכשלו:\n${allErrorDetails.slice(0, 5).join('\n')}${allErrorDetails.length > 5 ? '\n...' : ''}` : null
      });

      if (totalErrorCount === 0) {
        alert(t(
          `הניוזלטר נשלח מחדש בהצלחה ל-${totalSuccessCount} מנויים!`,
          `Newsletter resent successfully to ${totalSuccessCount} subscribers!`
        ));
      } else {
        alert(t(
          `הניוזלטר נשלח מחדש ל-${totalSuccessCount} מנויים.\n${totalErrorCount} נכשלו.`,
          `Newsletter resent to ${totalSuccessCount} subscribers.\n${totalErrorCount} failed.`
        ));
      }

      setShowResendModal(false);
      setResendData(null);
      setResendSubject('');
      setResendGroup('כל הרשימה');
      setResendContent('');
      loadLogs();
    } catch (error) {
      console.error('Resend error:', error);
      alert(t('שגיאה בשליחה מחדש', 'Error resending newsletter'));
    } finally {
      setSending(false);
    }
  };

  const deleteSubscriber = async (id) => {
    if (!confirm(t('האם את בטוחה שאת רוצה למחוק מנוי זה?', 'Are you sure you want to delete this subscriber?'))) {
      return;
    }

    try {
      await base44.entities.Subscribers.delete(id);
      loadSubscribers();
      alert(t('המנוי נמחק בהצלחה', 'Subscriber deleted successfully'));
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alert(t('שגיאה במחיקת המנוי', 'Error deleting subscriber'));
    }
  };

  const handleUpdateSubscriberGroup = async (subscriberId, newGroup) => {
    try {
      await base44.entities.Subscribers.update(subscriberId, { group: newGroup });
      loadSubscribers();
    } catch (error) {
      console.error('Error updating subscriber group:', error);
      alert(t('שגיאה בעדכון קבוצת המנוי', 'Error updating subscriber group'));
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      alert(t('אנא הזיני שם קבוצה', 'Please enter a group name'));
      return;
    }

    if (groups.includes(newGroupName.trim())) {
      alert(t('הקבוצה כבר קיימת', 'Group already exists'));
      return;
    }

    setAddingGroup(true);
    try {
      const updatedGroups = [...groups, newGroupName.trim()];

      await base44.entities.SiteSettings.update(siteSettings.id, {
        newsletter_groups: updatedGroups
      });

      await reloadSettings(); // Reload settings to update the 'groups' state
      setNewGroupName('');
      alert(t('הקבוצה נוספה בהצלחה!', 'Group added successfully!'));
    } catch (error) {
      console.error('Error adding group:', error);
      alert(t('שגיאה בהוספת הקבוצה', 'Error adding group'));
    } finally {
      setAddingGroup(false);
    }
  };

  const handleEditGroup = (groupName) => {
    setEditingGroupName(groupName);
    setEditingGroupNewName(groupName); // Initialize new name with current name
    setShowEditGroup(true);
  };

  const handleUpdateGroup = async () => {
    if (!editingGroupNewName.trim()) {
      alert(t('אנא הזיני שם קבוצה', 'Please enter a group name'));
      return;
    }

    if (editingGroupNewName.trim() === editingGroupName) {
      // No change, just close the modal
      setShowEditGroup(false);
      return;
    }

    if (groups.includes(editingGroupNewName.trim())) {
      alert(t('הקבוצה כבר קיימת', 'Group already exists'));
      return;
    }

    setUpdatingGroup(true);
    try {
      // Update all subscribers with the old group name to the new one
      const subscribersInGroup = subscribers.filter(s => s.group === editingGroupName);
      for (const sub of subscribersInGroup) {
        await base44.entities.Subscribers.update(sub.id, { group: editingGroupNewName.trim() });
      }

      // Update the groups list in settings
      const updatedGroups = groups.map(g => g === editingGroupName ? editingGroupNewName.trim() : g);
      await base44.entities.SiteSettings.update(siteSettings.id, {
        newsletter_groups: updatedGroups
      });

      await reloadSettings(); // Reload settings to update the 'groups' state
      loadSubscribers(); // Reload subscribers to reflect group changes
      setShowEditGroup(false);
      setEditingGroupName('');
      setEditingGroupNewName('');
      alert(t('הקבוצה עודכנה בהצלחה!', 'Group updated successfully!'));
    } catch (error) {
      console.error('Error updating group:', error);
      alert(t('שגיאה בעדכון הקבוצה', 'Error updating group'));
    } finally {
      setUpdatingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupName) => {
    if (groupName === 'כל הרשימה') {
      alert(t('לא ניתן למחוק את קבוצת "כל הרשימה"', 'Cannot delete "All List" group'));
      return;
    }

    const subscribersInGroup = subscribers.filter(s => s.group === groupName);

    if (subscribersInGroup.length > 0) {
      if (!confirm(t(
        `יש ${subscribersInGroup.length} מנויים בקבוצה זו. האם למחוק את הקבוצה בכל זאת? (המנויים יועברו ל"כל הרשימה")`,
        `There are ${subscribersInGroup.length} subscribers in this group. Delete anyway? (Subscribers will be moved to "All List")`
      ))) {
        return;
      }
    } else {
      if (!confirm(t('האם את בטוחה שאת רוצה למחוק קבוצה זו?', 'Are you sure you want to delete this group?'))) {
        return;
      }
    }

    try {
      // Move subscribers to "כל הרשימה"
      for (const sub of subscribersInGroup) {
        await base44.entities.Subscribers.update(sub.id, { group: 'כל הרשימה' });
      }

      // Remove group from settings
      const updatedGroups = groups.filter(g => g !== groupName);
      await base44.entities.SiteSettings.update(siteSettings.id, {
        newsletter_groups: updatedGroups
      });

      await reloadSettings(); // Reload settings to update the 'groups' state
      loadSubscribers(); // Reload subscribers to reflect group changes
      alert(t('הקבוצה נמחקתה בהצלחה', 'Group deleted successfully'));
    } catch (error) {
      console.error('Error deleting group:', error);
      alert(t('שגיאה במחיקת הקבוצה', 'Error deleting group'));
    }
  };


  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = !searchTerm ||
      sub.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGroup = filterGroup === 'all' || sub.group === filterGroup;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && sub.subscribed) ||
      (filterStatus === 'inactive' && !sub.subscribed);

    return matchesSearch && matchesGroup && matchesStatus;
  });

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.subscribed).length,
    inactive: subscribers.filter(s => !s.subscribed).length,
  };

  // Helper function to count subscribers in a group
  const getGroupSubscriberCount = (groupName) => {
    return subscribers.filter(s => s.group === groupName).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('ניהול ניוזלטר', 'Newsletter Management')}
          </h1>
          <p className="text-gray-600">
            {t('נהלי את רשימת התפוצה ושלחי ניוזלטרים', 'Manage your mailing list and send newsletters')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('סה"כ מנויים', 'Total Subscribers')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('פעילים', 'Active')}</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">{t('ניוזלטרים שנשלחו', 'Newsletters Sent')}</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">{newsletterStats.totalNewslettersSent}</p>
              </div>
              <Mail className="w-12 h-12 text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">{t('סה"כ מיילים', 'Total Emails')}</p>
                <p className="text-3xl font-bold text-indigo-900 mt-2">{newsletterStats.totalEmailsSent.toLocaleString()}</p>
              </div>
              <Send className="w-12 h-12 text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === 'subscribers'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-5 h-5 inline-block mr-2" />
                {t('רשימת מנויים', 'Subscribers')}
              </button>
              <button
                onClick={() => setActiveTab('send')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === 'send'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Send className="w-5 h-5 inline-block mr-2" />
                {t('שליחת ניוזלטר', 'Send Newsletter')}
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === 'import'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Upload className="w-5 h-5 inline-block mr-2" />
                {t('ייבוא', 'Import')}
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === 'logs'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="w-5 h-5 inline-block mr-2" />
                {t('היסטוריה', 'History')}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 font-medium whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="w-5 h-5 inline-block mr-2" />
                {t('הגדרות', 'Settings')}
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Subscribers Tab */}
            {activeTab === 'subscribers' && (
              <div className="space-y-6">
                {/* Add Subscriber Button */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setShowAddSubscriber(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {t('הוסף מנוי', 'Add Subscriber')}
                  </button>
                </div>

                {/* Add Subscriber Modal */}
                {showAddSubscriber && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {t('הוסף מנוי חדש', 'Add New Subscriber')}
                        </h3>
                        <button
                          onClick={() => setShowAddSubscriber(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('מייל', 'Email')} *
                          </label>
                          <input
                            type="email"
                            value={newSubscriber.email}
                            onChange={(e) => setNewSubscriber({...newSubscriber, email: e.target.value})}
                            placeholder="example@email.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('שם', 'Name')}
                          </label>
                          <input
                            type="text"
                            value={newSubscriber.name}
                            onChange={(e) => setNewSubscriber({...newSubscriber, name: e.target.value})}
                            placeholder={t('שם פרטי', 'First name')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('תפקיד', 'Job Title')}
                          </label>
                          <input
                            type="text"
                            value={newSubscriber.job_title || ''}
                            onChange={(e) => setNewSubscriber({...newSubscriber, job_title: e.target.value})}
                            placeholder={t('תפקיד', 'Job Title')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('חברה', 'Company')}
                          </label>
                          <input
                            type="text"
                            value={newSubscriber.company || ''}
                            onChange={(e) => setNewSubscriber({...newSubscriber, company: e.target.value})}
                            placeholder={t('שם החברה', 'Company name')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('הערות', 'Notes')}
                          </label>
                          <textarea
                            value={newSubscriber.notes || ''}
                            onChange={(e) => setNewSubscriber({...newSubscriber, notes: e.target.value})}
                            placeholder={t('הערות נוספות', 'Additional notes')}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('קבוצה', 'Group')}
                          </label>
                          <select
                            value={newSubscriber.group}
                            onChange={(e) => setNewSubscriber({...newSubscriber, group: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {groups.map(group => (
                              <option key={group} value={group}>{group}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleAddSubscriber}
                            disabled={addingSubscriber}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {addingSubscriber ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('מוסיף...', 'Adding...')}
                              </>
                            ) : (
                              <>
                                <Plus className="w-5 h-5" />
                                {t('הוסף', 'Add')}
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setShowAddSubscriber(false)}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                          >
                            {t('ביטול', 'Cancel')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Subscriber Modal */}
                {showEditSubscriber && editingSubscriber && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {t('ערוך מנוי', 'Edit Subscriber')}
                        </h3>
                        <button
                          onClick={() => {
                            setShowEditSubscriber(false);
                            setEditingSubscriber(null);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('מייל', 'Email')} *
                          </label>
                          <input
                            type="email"
                            value={editingSubscriber.email}
                            onChange={(e) => setEditingSubscriber({...editingSubscriber, email: e.target.value})}
                            placeholder="example@email.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('שם', 'Name')}
                          </label>
                          <input
                            type="text"
                            value={editingSubscriber.name}
                            onChange={(e) => setEditingSubscriber({...editingSubscriber, name: e.target.value})}
                            placeholder={t('שם פרטי', 'First name')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('תפקיד', 'Job Title')}
                          </label>
                          <input
                            type="text"
                            value={editingSubscriber.job_title}
                            onChange={(e) => setEditingSubscriber({...editingSubscriber, job_title: e.target.value})}
                            placeholder={t('תפקיד', 'Job Title')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('חברה', 'Company')}
                          </label>
                          <input
                            type="text"
                            value={editingSubscriber.company}
                            onChange={(e) => setEditingSubscriber({...editingSubscriber, company: e.target.value})}
                            placeholder={t('שם החברה', 'Company name')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('הערות', 'Notes')}
                          </label>
                          <textarea
                            value={editingSubscriber.notes}
                            onChange={(e) => setEditingSubscriber({...editingSubscriber, notes: e.target.value})}
                            placeholder={t('הערות נוספות', 'Additional notes')}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('קבוצה', 'Group')}
                          </label>
                          <select
                            value={editingSubscriber.group}
                            onChange={(e) => setEditingSubscriber({...editingSubscriber, group: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {groups.map(group => (
                              <option key={group} value={group}>{group}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="subscribed-checkbox"
                            checked={editingSubscriber.subscribed}
                            onChange={(e) => setEditingSubscriber({...editingSubscriber, subscribed: e.target.checked})}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="subscribed-checkbox" className="text-sm font-medium text-gray-700">
                            {t('מנוי פעיל', 'Active Subscriber')}
                          </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleUpdateSubscriber}
                            disabled={updatingSubscriber}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {updatingSubscriber ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('מעדכן...', 'Updating...')}
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                {t('עדכן', 'Update')}
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowEditSubscriber(false);
                              setEditingSubscriber(null);
                            }}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                          >
                            {t('ביטול', 'Cancel')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder={t('חיפוש לפי שם או מייל...', 'Search by name or email...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <select
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{t('כל הקבוצות', 'All Groups')}</option>
                    {groups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{t('הכל', 'All')}</option>
                    <option value="active">{t('פעילים', 'Active')}</option>
                    <option value="inactive">{t('לא פעילים', 'Inactive')}</option>
                  </select>
                </div>

                {/* Table with horizontal scroll */}
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : filteredSubscribers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    {t('לא נמצאו מנויים', 'No subscribers found')}
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '180px' }}>
                            {t('מייל', 'Email')}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '100px' }}>
                            {t('שם', 'Name')}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                            {t('תפקיד', 'Job Title')}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '100px' }}>
                            {t('חברה', 'Company')}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                            {t('הערות', 'Notes')}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                            {t('קבוצה', 'Group')}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '80px' }}>
                            {t('סטטוס', 'Status')}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: '100px' }}>
                            {t('פעולות', 'Actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSubscribers.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm text-gray-900" style={{ wordBreak: 'break-all' }}>
                              {sub.email}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {sub.name || '-'}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {sub.job_title || '-'}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {sub.company || '-'}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {sub.notes || '-'}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <select
                                value={sub.group}
                                onChange={(e) => handleUpdateSubscriberGroup(sub.id, e.target.value)}
                                className="w-full px-2 py-1 text-xs rounded-lg bg-blue-100 text-blue-800 border border-blue-200 focus:ring-2 focus:ring-blue-500"
                              >
                                {groups.map(group => (
                                  <option key={group} value={group}>{group}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-4 text-sm">
                              {sub.subscribed ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 whitespace-nowrap">
                                  {t('פעיל', 'Active')}
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 whitespace-nowrap">
                                  {t('לא פעיל', 'Inactive')}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditSubscriber(sub)}
                                  className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                                  title={t('ערוך', 'Edit')}
                                >
                                  <Edit3 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => deleteSubscriber(sub.id)}
                                  className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                                  title={t('מחק', 'Delete')}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Send Newsletter Tab */}
            {activeTab === 'send' && (
              <div className="space-y-6 max-w-4xl">
                {/* Design Mode Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setDesignMode('template')}
                      className={`px-4 py-3 font-medium flex items-center gap-2 ${
                        designMode === 'template'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Layout className="w-5 h-5" />
                      {t('תבנית מהירה', 'Quick Template')}
                    </button>
                    <button
                      onClick={() => setDesignMode('html')}
                      className={`px-4 py-3 font-medium flex items-center gap-2 ${
                        designMode === 'html'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <FileCode className="w-5 h-5" />
                      {t('HTML מתקדם', 'Advanced HTML')}
                    </button>
                    <button
                      onClick={() => setDesignMode('free')}
                      className={`px-4 py-3 font-medium flex items-center gap-2 ${
                        designMode === 'free'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Edit3 className="w-5 h-5" />
                      {t('עורך חופשי', 'Free Editor')}
                    </button>
                  </div>
                </div>

                {/* Target Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('בחרי קבוצת יעד', 'Select Target Group')}
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {groups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('נושא הניוזלטר', 'Newsletter Subject')}
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t('לדוגמה: עדכון חודשי - יולי 2025', 'Example: Monthly Update - July 2025')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Template Mode */}
                {designMode === 'template' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('בחרי תבנית', 'Choose Template')}
                      </label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="classic">{t('תבנית קלאסית', 'Classic Template')}</option>
                        <option value="modern">{t('תבנית מודרנית', 'Modern Template')}</option>
                        <option value="minimal">{t('תבנית מינימליסטית', 'Minimal Template')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('כותרת ראשית', 'Main Title')}
                      </label>
                      <input
                        type="text"
                        value={templateData.title}
                        onChange={(e) => setTemplateData({...templateData, title: e.target.value})}
                        placeholder={t('הכותרת שלך כאן', 'Your title here')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('כותרת משנה', 'Subtitle')}
                      </label>
                      <input
                        type="text"
                        value={templateData.subtitle}
                        onChange={(e) => setTemplateData({...templateData, subtitle: e.target.value})}
                        placeholder={t('כותרת משנה', 'Subtitle')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('תוכן ראשי', 'Main Content')}
                      </label>
                      <RichTextEditor
                        value={templateData.mainText}
                        onChange={(value) => setTemplateData({...templateData, mainText: value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('תמונה', 'Image')}
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={templateData.imageUrl}
                          onChange={(e) => setTemplateData({...templateData, imageUrl: e.target.value})}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <label className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 cursor-pointer flex items-center gap-2 whitespace-nowrap">
                          {uploadingImage ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {t('מעלה...', 'Uploading...')}
                            </>
                          ) : (
                            <>
                              <Image className="w-5 h-5" />
                              {t('העלה תמונה', 'Upload Image')}
                            </>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                      {templateData.imageUrl && (
                        <div className="mt-3">
                          <img
                            src={templateData.imageUrl}
                            alt="Preview"
                            className="w-full max-w-md rounded-lg border border-gray-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* CTA Buttons for Template Mode */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-purple-900">
                          {t('כפתורי קריאה לפעולה (אופציונלי)', 'CTA Buttons (Optional)')}
                        </h3>
                        <button
                          onClick={addCtaButton}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {t('הוסף כפתור', 'Add Button')}
                        </button>
                      </div>

                      {ctaButtons.length === 0 ? (
                        <p className="text-sm text-gray-600 text-center py-4">
                          {t('לחצי על "הוסף כפתור" להוספת כפתור קריאה לפעולה', 'Click "Add Button" to add a CTA button')}
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {ctaButtons.map((button, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium text-gray-900">
                                  {t('כפתור', 'Button')} {index + 1}
                                </h4>
                                <button
                                  onClick={() => removeCtaButton(index)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title={t('מחק כפתור', 'Delete Button')}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="space-y-3">
                                <div className="grid md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      {t('טקסט כפתור', 'Button Text')}
                                    </label>
                                    <input
                                      type="text"
                                      value={button.text}
                                      onChange={(e) => updateCtaButton(index, 'text', e.target.value)}
                                      placeholder={t('לחצי כאן', 'Click Here')}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      {t('קישור', 'Link')}
                                    </label>
                                    <input
                                      type="text"
                                      value={button.link}
                                      onChange={(e) => updateCtaButton(index, 'link', e.target.value)}
                                      placeholder="https://moveup.today"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('סגנון כפתור', 'Button Style')}
                                  </label>
                                  <select
                                    value={button.style}
                                    onChange={(e) => updateCtaButton(index, 'style', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  >
                                    <option value="primary">{t('ראשי - רקע מלא', 'Primary - Full Background')}</option>
                                    <option value="secondary">{t('משני - רקע לבן', 'Secondary - White Background')}</option>
                                    <option value="outline">{t('מסגרת - שקוף', 'Outline - Transparent')}</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('תמונה לכפתור (אופציונלי)', 'Button Image (Optional)')}
                                  </label>
                                  <div className="flex gap-3">
                                    <input
                                      type="text"
                                      value={button.imageUrl}
                                      onChange={(e) => updateCtaButton(index, 'imageUrl', e.target.value)}
                                      placeholder="https://example.com/image.jpg"
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <label className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 cursor-pointer flex items-center gap-2 whitespace-nowrap">
                                      {uploadingCtaImage ? (
                                        <>
                                          <Loader2 className="w-5 h-5 animate-spin" />
                                          {t('מעלה...', 'Uploading...')}
                                        </>
                                      ) : (
                                        <>
                                          <Image className="w-5 h-5" />
                                          {t('העלה', 'Upload')}
                                        </>
                                      )}
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleCtaImageUpload(e, index)}
                                        disabled={uploadingCtaImage}
                                      />
                                    </label>
                                  </div>
                                  {button.imageUrl && (
                                    <img
                                      src={button.imageUrl}
                                      alt="Preview"
                                      className="mt-2 w-32 rounded border"
                                      onError={(e) => e.target.style.display = 'none'}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-4">
                        {t('הכפתורים יופיעו בתחתית המייל, מעל לינק ההסרה. ניתן להוסיף מספר כפתורים בסגנונות שונים.', 'Buttons will appear at the bottom of the email, above the unsubscribe link. You can add multiple buttons with different styles.')}
                      </p>
                    </div>
                  </div>
                )}

                {/* HTML Mode */}
                {designMode === 'html' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">
                        {t('איך להשתמש', 'How to Use')}
                      </h3>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>{t('עצבי ניוזלטר בקנבה (או כל כלי אחר)', 'Design newsletter in Canva (or any other tool)')}</li>
                        <li>{t('ייצאי כ-HTML או העתיקי את הקוד', 'Export as HTML or copy the code')}</li>
                        <li>{t('הדביקי את הקוד בשדה למטה', 'Paste the code in the field below')}</li>
                        <li>{t('לינק הסרה יתווסף אוטומטית', 'Unsubscribe link will be added automatically')}</li>
                      </ol>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('קוד HTML', 'HTML Code')}
                      </label>
                      <textarea
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        placeholder={t('הדביקי את קוד ה-HTML כאן...', 'Paste your HTML code here...')}
                        rows="15"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Free Editor Mode */}
                {designMode === 'free' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('תוכן הניוזלטר', 'Newsletter Content')}
                      </label>
                      <RichTextEditor
                        value={content}
                        onChange={setContent}
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        {t('לינק להסרה מהרשימה יתווסף אוטומטית בסוף המייל', 'Unsubscribe link will be added automatically at the end')}
                      </p>
                    </div>
                  </div>
                )}

                {/* CTA Buttons Section - for HTML and Free Editor modes */}
                {(designMode === 'free' || designMode === 'html') && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-green-900">
                        {t('כפתורי קריאה לפעולה (אופציונלי)', 'CTA Buttons (Optional)')}
                      </h3>
                      <button
                        onClick={addCtaButton}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {t('הוסף כפתור', 'Add Button')}
                      </button>
                    </div>

                    {ctaButtons.length === 0 ? (
                      <p className="text-sm text-gray-600 text-center py-4">
                        {t('לחצי על "הוסף כפתור" להוספת כפתור קריאה לפעולה', 'Click "Add Button" to add a CTA button')}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {ctaButtons.map((button, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-900">
                                {t('כפתור', 'Button')} {index + 1}
                              </h4>
                              <button
                                onClick={() => removeCtaButton(index)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title={t('מחק כפתור', 'Delete Button')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('טקסט כפתור', 'Button Text')}
                                  </label>
                                  <input
                                    type="text"
                                    value={button.text}
                                    onChange={(e) => updateCtaButton(index, 'text', e.target.value)}
                                    placeholder={t('לחצי כאן', 'Click Here')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('קישור', 'Link')}
                                  </label>
                                  <input
                                    type="text"
                                    value={button.link}
                                    onChange={(e) => updateCtaButton(index, 'link', e.target.value)}
                                    placeholder="https://moveup.today"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {t('סגנון כפתור', 'Button Style')}
                                </label>
                                <select
                                  value={button.style}
                                  onChange={(e) => updateCtaButton(index, 'style', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                  <option value="primary">{t('ראשי - רקע מלא', 'Primary - Full Background')}</option>
                                  <option value="secondary">{t('משני - רקע לבן', 'Secondary - White Background')}</option>
                                  <option value="outline">{t('מסגרת - שקוף', 'Outline - Transparent')}</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {t('תמונה לכפתור (אופציונלי)', 'Button Image (Optional)')}
                                </label>
                                <div className="flex gap-3">
                                  <input
                                    type="text"
                                    value={button.imageUrl}
                                    onChange={(e) => updateCtaButton(index, 'imageUrl', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  />
                                  <label className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 cursor-pointer flex items-center gap-2 whitespace-nowrap">
                                    {uploadingCtaImage ? (
                                      <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {t('מעלה...', 'Uploading...')}
                                      </>
                                    ) : (
                                      <>
                                        <Image className="w-5 h-5" />
                                        {t('העלה', 'Upload')}
                                      </>
                                    )}
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) => handleCtaImageUpload(e, index)}
                                      disabled={uploadingCtaImage}
                                    />
                                  </label>
                                </div>
                                {button.imageUrl && (
                                  <img
                                    src={button.imageUrl}
                                    alt="Preview"
                                    className="mt-2 w-32 rounded border"
                                    onError={(e) => e.target.style.display = 'none'}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-4">
                      {t('הכפתורים יופיעו בתחתית המייל, מעל לינק ההסרה. ניתן להוסיף מספר כפתורים.', 'Buttons will appear at the bottom of the email, above the unsubscribe link. You can add multiple buttons.')}
                    </p>
                  </div>
                )}

                {/* Status Messages */}
                {sendStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">
                      {t('הניוזלטר נשלח בהצלחה!', 'Newsletter sent successfully!')}
                    </span>
                  </div>
                )}

                {sendStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">
                      {t('שגיאה בשליחת הניוזלטר', 'Error sending newsletter')}
                    </span>
                  </div>
                )}

                {/* Send Button */}
                <button
                  onClick={handleSendNewsletter}
                  disabled={sending || !subject}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('שולח...', 'Sending...')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('שלח ניוזלטר', 'Send Newsletter')}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Import Tab */}
            {activeTab === 'import' && (
              <div className="space-y-6 max-w-2xl">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    {t('שתי דרכים לייבוא מנויים', 'Two ways to import subscribers')}
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>{t('העתק והדבק ישירות (מומלץ!)', 'Copy & Paste directly (Recommended!)')}</li>
                    <li>{t('או העלה קובץ CSV', 'Or upload a CSV file')}</li>
                  </ul>
                </div>

                {/* Copy-Paste Method */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    ✨ {t('דרך 1: העתק והדבק (הכי פשוט!)', 'Method 1: Copy & Paste (Easiest!)')}
                  </h3>

                  <div className="bg-white rounded p-3 mb-4">
                    <p className="text-sm text-gray-700 mb-2 font-semibold">
                      {t('פורמט:', 'Format:')}
                    </p>
                    <code className="text-xs bg-gray-100 p-2 rounded block" dir="ltr">
                      email1@example.com,שם,תפקיד,חברה,הערות<br/>
                      email2@example.com,שם,תפקיד,חברה<br/>
                      email3@example.com
                    </code>
                    <p className="text-xs text-gray-600 mt-2">
                      {t('• כל שורה = מנוי אחד', '• Each line = one subscriber')}<br/>
                      {t('• פורמט: email,name,job_title,company,notes', '• Format: email,name,job_title,company,notes')}<br/>
                      {t('• שדות אופציונליים: שם, תפקיד, חברה, הערות', '• Optional fields: name, job_title, company, notes')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('בחרי קבוצה למנויים המיובאים', 'Select Group for Imported Subscribers')}
                    </label>
                    <select
                      value={importGroup}
                      onChange={(e) => setImportGroup(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {groups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('הדביקי את רשימת המיילים כאן:', 'Paste your email list here:')}
                    </label>
                    <textarea
                      value={importFile?.type === 'text' ? importFile.text : ''}
                      onChange={(e) => setImportFile({ type: 'text', text: e.target.value })}
                      placeholder={t(
                        'לדוגמה:\nexample1@gmail.com,שרה כהן,מנהלת מכירות,חברת ABC,לקוחה חדשה\nexample2@gmail.com,רחל לוי,מנכ"לית,חברת XYZ\nexample3@gmail.com',
                        'Example:\nexample1@gmail.com,Sarah Cohen,Sales Manager,ABC Company,New client\nexample2@gmail.com,Rachel Levi,CEO,XYZ Company\nexample3@gmail.com'
                      )}
                      rows="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                      dir="ltr"
                    />
                  </div>

                  <button
                    onClick={handleImportCSV}
                    disabled={importing || !(importFile?.type === 'text' && importFile.text.trim())}
                    className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('מייבא...', 'Importing...')}
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        {t('ייבא מנויים', 'Import Subscribers')}
                      </>
                    )}
                  </button>
                </div>

                {/* File Upload Method */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {t('דרך 2: העלאת קובץ CSV', 'Method 2: Upload CSV File')}
                  </h3>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800 mb-2">
                      ⚠️ {t('שימי לב: העלאת קובץ עלולה לגרום לבעיות קידוד', 'Note: File upload may cause encoding issues')}
                    </p>
                    <p className="text-xs text-yellow-700">
                      {t('אם זה לא עובד, השתמשי בשיטת ההעתקה וההדבקה למעלה', 'If this doesn\'t work, use the copy-paste method above')}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('בחרי קבוצה למנויים המיובאים', 'Select Group for Imported Subscribers')}
                    </label>
                    <select
                      value={importGroup}
                      onChange={(e) => setImportGroup(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {groups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('בחרי קובץ CSV', 'Select CSV File')}
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setImportFile({ type: 'file', file: e.target.files[0] })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleImportCSV}
                    disabled={importing || !(importFile?.type === 'file' && importFile.file)}
                    className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('מייבא...', 'Importing...')}
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        {t('ייבא קובץ', 'Import File')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    {t('עדיין לא נשלחו ניוזלטרים', 'No newsletters sent yet')}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{log.subject}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                log.status === 'נשלח בהצלחה'
                                  ? 'bg-green-100 text-green-800'
                                  : log.status.startsWith('נשלח חלקית')
                                  ? 'bg-orange-100 text-orange-800'
                                  : log.status === 'נכשל'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {log.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>{t('קבוצה:', 'Group:')} {log.group}</p>
                              <p>{t('נשלח ל:', 'Sent to:')} {log.recipients_count} {t('מנויים', 'subscribers')}</p>
                              <p>{t('תאריך:', 'Date:')} {new Date(log.sent_date).toLocaleString('he-IL')}</p>
                              <p>{t('נשלח על ידי:', 'Sent by:')} {log.sent_by}</p>
                              {log.error_message && (
                                <p className="text-red-600">{t('שגיאה:', 'Error:')} {log.error_message}</p>
                              )}
                            </div>
                            {log.content && (
                              <div className="mt-3">
                                <button
                                  onClick={() => handleResendNewsletter(log)}
                                  disabled={sending}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {sending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      {t('שולח...', 'Sending...')}
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-4 h-4" />
                                      {t('שלח מחדש', 'Resend')}
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                          <Mail className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t('ניהול קבוצות', 'Manage Groups')}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {t('הוסיפי, ערכי או מחקי קבוצות לפי צורך', 'Add, edit, or remove groups as needed')}
                  </p>
                </div>

                {/* Add Group Form */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">
                    {t('הוסף קבוצה חדשה', 'Add New Group')}
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder={t('שם הקבוצה', 'Group name')}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddGroup}
                      disabled={addingGroup || !newGroupName.trim()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {addingGroup ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                      {t('הוסף', 'Add')}
                    </button>
                  </div>
                </div>

                {/* Edit Group Modal */}
                {showEditGroup && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {t('ערוך שם קבוצה', 'Edit Group Name')}
                        </h3>
                        <button
                          onClick={() => {
                            setShowEditGroup(false);
                            setEditingGroupName('');
                            setEditingGroupNewName('');
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('שם קבוצה חדש', 'New group name')}
                          </label>
                          <input
                            type="text"
                            value={editingGroupNewName}
                            onChange={(e) => setEditingGroupNewName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleUpdateGroup}
                            disabled={updatingGroup}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {updatingGroup ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('מעדכן...', 'Updating...')}
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                {t('עדכן', 'Update')}
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowEditGroup(false);
                              setEditingGroupName('');
                              setEditingGroupNewName('');
                            }}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                          >
                            {t('ביטול', 'Cancel')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Groups List */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {t('קבוצות קיימות', 'Existing Groups')}
                  </h3>
                  <div className="space-y-2">
                    {groups.map((group, index) => (
                      <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{group}</span>
                          <span className="text-sm text-gray-500">
                            ({getGroupSubscriberCount(group)} {t('מנויים', 'subscribers')})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {group !== 'כל הרשימה' && (
                            <button
                              onClick={() => handleEditGroup(group)}
                              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                              title={t('ערוך', 'Edit')}
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                          )}
                          {group !== 'כל הרשימה' && (
                            <button
                              onClick={() => handleDeleteGroup(group)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                              title={t('מחק', 'Delete')}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resend Modal */}
        {showResendModal && resendData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {t('עריכה ושליחה מחדש', 'Edit and Resend')}
                  </h3>
                  <button
                    onClick={() => {
                      setShowResendModal(false);
                      setResendData(null);
                      setResendSubject('');
                      setResendGroup('כל הרשימה');
                      setResendContent('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('נושא הניוזלטר', 'Newsletter Subject')}
                  </label>
                  <input
                    type="text"
                    value={resendSubject}
                    onChange={(e) => setResendSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Group Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('בחרי קבוצת יעד', 'Select Target Group')}
                  </label>
                  <select
                    value={resendGroup}
                    onChange={(e) => setResendGroup(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {groups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                {/* Content Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('תצוגה מקדימה של התוכן', 'Content Preview')}
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                    <iframe
                      srcDoc={resendContent}
                      className="w-full h-96 border-0"
                      title="Newsletter Preview"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {t('לעריכת התוכן, צרי ניוזלטר חדש בטאב "שליחת ניוזלטר"', 'To edit content, create a new newsletter in the "Send Newsletter" tab')}
                  </p>
                </div>

                {/* Recipient Count Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    {t(
                      `הניוזלטר יישלח לכל המנויים הפעילים בקבוצה "${resendGroup}"`,
                      `Newsletter will be sent to all active subscribers in group "${resendGroup}"`
                    )}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleConfirmResend}
                    disabled={sending || !resendSubject.trim()}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('שולח...', 'Sending...')}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {t('שלח עכשיו', 'Send Now')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowResendModal(false);
                      setResendData(null);
                      setResendSubject('');
                      setResendGroup('כל הרשימה');
                      setResendContent('');
                    }}
                    disabled={sending}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t('ביטול', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
