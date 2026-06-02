import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function BotAdmin() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const list = await base44.entities.BotSettings.list();
      if (list.length > 0) {
        setSettings(list[0]);
      } else {
        const newSettings = await base44.entities.BotSettings.create({
          system_prompt: 'את/ה עוזרת וירטואלית בשם גלי מטעם פורצות קדימה.',
          is_active: true,
          bot_name: 'גלי - פורצות קדימה',
          welcome_message: 'היי, אני גלי! איך אוכל לעזור לך היום?'
        });
        setSettings(newSettings);
      }
    } catch (err) {
      toast.error('שגיאה בטעינת הגדרות הבוט');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.BotSettings.update(settings.id, {
        system_prompt: settings.system_prompt,
        is_active: settings.is_active,
        bot_name: settings.bot_name,
        welcome_message: settings.welcome_message
      });
      toast.success('הגדרות נשמרו בהצלחה!');
    } catch (err) {
      toast.error('שגיאה בשמירת הגדרות');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-gray-600" dir="rtl">אין לך הרשאות לצפות בעמוד זה. יש להתחבר בתור מנהל.</div>;
  }

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#005e6c]" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 my-10 bg-white rounded-2xl shadow-sm border border-gray-100" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-[#005e6c]">ניהול בוט צ'אט (גלי)</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#005e6c] text-white px-6 py-2.5 rounded-full hover:bg-[#004b56] transition-colors disabled:opacity-50 font-medium"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          שמור שינויים
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <input
            type="checkbox"
            id="isActive"
            checked={settings.is_active}
            onChange={e => setSettings({...settings, is_active: e.target.checked})}
            className="w-5 h-5 accent-[#005e6c] cursor-pointer"
          />
          <label htmlFor="isActive" className="font-semibold cursor-pointer">הבוט מופעל</label>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-800">שם הבוט (כפי שיופיע בצ'אט)</label>
          <input
            type="text"
            value={settings.bot_name || ''}
            onChange={e => setSettings({...settings, bot_name: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#005e6c] transition-colors"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-800">הודעת פתיחה (Welcome Message)</label>
          <input
            type="text"
            value={settings.welcome_message || ''}
            onChange={e => setSettings({...settings, welcome_message: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#005e6c] transition-colors"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-800">מוח הבוט (System Prompt)</label>
          <textarea
            value={settings.system_prompt || ''}
            onChange={e => setSettings({...settings, system_prompt: e.target.value})}
            rows={12}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#005e6c] transition-colors resize-y leading-relaxed"
          />
          <p className="text-sm text-gray-500 mt-2">
            כתבו כאן את ההוראות לבוט: מה תפקידו, איך עליו לענות למשתמשים, מה המידע שעליו להכיר ומה אסור לו לומר.
          </p>
        </div>
      </div>
    </div>
  );
}