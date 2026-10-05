import { surahList } from '../data/quran';

export const getSurahByNumber = (number) => surahList.find((surah) => surah.number === Number(number)) || surahList[0];

export const searchQuran = (query, dataset = surahList) => {
  const term = query.toLowerCase().trim();
  if (!term) return [];

  const matches = [];
  dataset.forEach((surah) => {
    if (surah.nameEnglish.toLowerCase().includes(term) || surah.nameArabic.includes(term) || String(surah.number).includes(term)) {
      surah.ayahs.forEach((ayah) => {
        matches.push({
          id: `${surah.number}-${ayah.number}`,
          surahNumber: surah.number,
          ayahNumber: ayah.number,
          surahName: surah.nameEnglish,
          text: ayah.text,
        });
      });
    }
  });

  return matches.slice(0, 10);
};

export const getDailyAyah = () => ({
  surah: surahList[0],
  ayah: surahList[0].ayahs[0],
  translation: 'The reward is with Allah, the Most Merciful.',
});
