export const translations = {
  en: {
    welcome_title: "Mizan",
    welcome_subtitle: "Rural Legal Advocate",
    feature_voice_title: "Voice Intake",
    feature_voice_desc: "Speak naturally in Moroccan Darija to describe your legal situation.",
    feature_dossier_title: "Dossier System",
    feature_dossier_desc: "Your testimony is recorded and analyzed into an official legal dossier.",
    feature_justice_title: "Justice for All",
    feature_justice_desc: "Empowering rural citizens with AI-assisted legal knowledge.",
    start_case: "Start Your Dossier",
    already_have_case: "Already have a case?",
    login: "Login",
    gateway_title: "Select Language",
    gateway_darija: "الدارجة",
    gateway_english: "English",
  },
  ar: {
    welcome_title: "ميزان",
    welcome_subtitle: "مدافع قانوني قروي",
    feature_voice_title: "تسجيل صوتي",
    feature_voice_desc: "تكلم بشكل طبيعي بالدارجة المغربية لشرح وضعيتك القانونية.",
    feature_dossier_title: "نظام الملفات",
    feature_dossier_desc: "كيتم تسجيل شهادتك وتحليلها في ملف قانوني رسمي.",
    feature_justice_title: "العدالة للجميع",
    feature_justice_desc: "تمكين المواطنين القرويين بمعرفة قانونية مدعومة بالذكاء الاصطناعي.",
    start_case: "ابدأ ملفك القانوني",
    already_have_case: "عندك ملف ديجا؟",
    login: "تسجيل الدخول",
    gateway_title: "اختر اللغة",
    gateway_darija: "الدارجة",
    gateway_english: "English",
  }
};

export type Language = 'en' | 'ar';
export type TranslationKey = keyof typeof translations.en;
