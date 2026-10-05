export const translationLanguages = [
  { id: 'ar', name: 'Arabic', direction: 'rtl' },
  { id: 'en', name: 'English', direction: 'ltr' },
  { id: 'fr', name: 'French', direction: 'ltr' },
  { id: 'es', name: 'Spanish', direction: 'ltr' },
  { id: 'id', name: 'Indonesian', direction: 'ltr' },
];

export const getTranslationById = (id) => translationLanguages.find((translation) => translation.id === id) || translationLanguages[0];
