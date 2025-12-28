import { 
  Users, Award, TrendingUp, Clock, Building2, BookOpen, Target, 
  Lightbulb, Briefcase, Heart, Smile, Star, Coffee, Flag, Anchor,
  Compass, Dices, Handshake, Bot
} from 'lucide-react';

export const availableIcons = {
  Users: { component: Users, name_he: 'משתמשים', name_en: 'Users' },
  Award: { component: Award, name_he: 'פרס', name_en: 'Award' },
  TrendingUp: { component: TrendingUp, name_he: 'גרף עולה', name_en: 'Trending Up' },
  Clock: { component: Clock, name_he: 'שעון', name_en: 'Clock' },
  Building2: { component: Building2, name_he: 'בניין', name_en: 'Building' },
  BookOpen: { component: BookOpen, name_he: 'ספר פתוח', name_en: 'Open Book' },
  Target: { component: Target, name_he: 'מטרה', name_en: 'Target' },
  Lightbulb: { component: Lightbulb, name_he: 'נורה', name_en: 'Lightbulb' },
  Briefcase: { component: Briefcase, name_he: 'תיק עבודות', name_en: 'Briefcase' },
  Heart: { component: Heart, name_he: 'לב', name_en: 'Heart' },
  Smile: { component: Smile, name_he: 'סמיילי', name_en: 'Smile' },
  Star: { component: Star, name_he: 'כוכב', name_en: 'Star' },
  Coffee: { component: Coffee, name_he: 'קפה', name_en: 'Coffee' },
  Flag: { component: Flag, name_he: 'דגל', name_en: 'Flag' },
  Anchor: { component: Anchor, name_he: 'עוגן', name_en: 'Anchor' },
  Compass: { component: Compass, name_he: 'מצפן', name_en: 'Compass' },
  Dices: { component: Dices, name_he: 'קוביות משחק', name_en: 'Dices' },
  Handshake: { component: Handshake, name_he: 'שותפות', name_en: 'Partnership' },
  Bot: { component: Bot, name_he: 'בוטית', name_en: 'Bot' }
};

export const getIconComponent = (iconName) => {
  return availableIcons[iconName]?.component || Lightbulb; // Default icon
};