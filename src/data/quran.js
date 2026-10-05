import { useMemo, useState } from 'react';

import { surahList, backgroundLibrary, defaultReciters, sampleTranslations, DEFAULT_PROJECT, initialFavorites, defaultTextSettings } from './data/quran';
import { searchQuran, getSurahByNumber } from './services/quran';
import { exportVideoToWebM } from './services/video';

const navItems = [
  { key: 'home', label: { ar: 'الرئيسية', en: 'Home' } },
  { key: 'quran', label: { ar: 'القرآن', en: 'Quran' } },
  { key: 'audio', label: { ar: 'الصوت', en: 'Audio' } },
  { key: 'create', label: { ar: 'الإنشاء', en: 'Create' } },
  { key: 'favorites', label: { ar: 'المفضلة', en: 'Favorites' } },
  { key: 'settings', label: { ar: 'الإعدادات', en: 'Settings' } },
];

const translations = {
  ar: {
    openQuran: 'فتح القرآن',
    createVideo: 'إنشاء فيديو',
    exploreReciters: 'استكشف القراء',
    continueReading: 'متابعة القراءة',
    lastSurah: 'آخر سورة',
    lastAyah: 'آخر آية',
    dailyAyah: 'آية اليوم',
    favoriteAyat: 'الآيات المفضلة',
    recentlyPlayed: 'تم تشغيله مؤخراً',
    recentlyCreatedVideos: 'الفيديوهات الأخيرة',
    popularReciters: 'القراء المشهورون',
    quranSearch: 'بحث في القرآن',
    quickStart: 'بدء سريع',
    quranReader: 'قارئ القرآن',
    videoCreator: 'منشئ الفيديو',
    explore: 'استعراض',
    settings: 'الإعدادات',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    theme: 'المظهر',
    darkMode: '��لوضع الداكن',
    lightMode: 'الوضع الفاتح',
    system: 'النظام',
    writing: 'الكتابة',
    premium: 'قيمة مميزة',
    appTitle: 'استوديو القرآن',
    appSubtitle: 'اقرأ. استمع. تأمل. أنشئ.',
    welcomeNote: 'واجهة عربية كاملة مع دعم القراءة، الصوت، الترجمة، ومبدئ إنشاء الفيديو.'
  },
  en: {
    openQuran: 'Open Quran',
    createVideo: 'Create Video',
    exploreReciters: 'Explore Reciters',
    continueReading: 'Continue Reading',
    lastSurah: 'Last Surah',
    lastAyah: 'Last Ayah',
    dailyAyah: 'Daily Ayah',
    favoriteAyat: 'Favorite Ayat',
    recentlyPlayed: 'Recently Played',
    recentlyCreatedVideos: 'Recently Created Videos',
    popularReciters: 'Popular Reciters',
    quranSearch: 'Quran Search',
    quickStart: 'Quick Start',
    quranReader: 'Quran Reader',
    videoCreator: 'Video Creator',
    explore: 'Explore',
    settings: 'Settings',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    theme: 'Theme',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    system: 'System',
    writing: 'Writing',
    premium: 'Premium',
    appTitle: 'Quran Studio',
    appSubtitle: 'Read. Listen. Reflect. Create.',
    welcomeNote: 'Full Arabic RTL experience with reading, audio, translations, and video creation tools.'
  },
};

const getLocalJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveLocalJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const FavoriteToggle = ({ active, onClick, label }) => (
  <button className="icon-button" onClick={onClick} aria-label={label} title={label}>
    {active ? '★' : '☆'}
  </button>
);

const formatDirection = (language) => ({ direction: language === 'ar' ? 'rtl' : 'ltr' });

function App() {
  const [language, setLanguage] = useState('ar');
  const [theme, setTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState('home');
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedAyah, setSelectedAyah] = useState(1);
  const [favorites, setFavorites] = useState(() => getLocalJSON('quran-studio-favorites', initialFavorites));
  const [projects, setProjects] = useState(() => getLocalJSON('quran-studio-projects', [DEFAULT_PROJECT]));
  const [videoProject, setVideoProject] = useState(() => ({
    ...DEFAULT_PROJECT,
    background: 'mountains',
    reciter: defaultReciters[0].id,
    template: 'Minimal Quran',
    format: '9:16',
    startAyah: 1,
    endAyah: 5,
    selectedSurah: 1,
  }));
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(32);
  const [currentReciter, setCurrentReciter] = useState(defaultReciters[0].id);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [audioVolume, setAudioVolume] = useState(72);
  const [renderStatus, setRenderStatus] = useState('Ready');
  const [displayTextSettings, setDisplayTextSettings] = useState(defaultTextSettings);
  const [customBackground, setCustomBackground] = useState(null);

  const currentSurah = getSurahByNumber(selectedSurah);
  const currentAyahText = currentSurah?.ayahs[selectedAyah - 1]?.text || '[QURAN DATA WILL LOAD FROM API]';

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchQuran(searchQuery, surahList);
  }, [searchQuery]);

  const t = translations[language] ?? translations.ar;

  const setFavorite = (itemType, value) => {
    const key = itemType === 'ayah' ? 'ayat' : itemType === 'surah' ? 'surahs' : 'reciters';
    setFavorites((prev) => {
      const next = { ...prev, [key]: prev[key].includes(value) ? prev[key].filter((entry) => entry !== value) : [...prev[key], value] };
      saveLocalJSON('quran-studio-favorites', next);
      return next;
    });
  };

  const handleCreateProject = () => {
    const fresh = {
      ...DEFAULT_PROJECT,
      id: `project-${Date.now()}`,
      name: `Project ${projects.length + 1}`,
      surah: videoProject.selectedSurah,
      startAyah: videoProject.startAyah,
      endAyah: videoProject.endAyah,
      reciter: videoProject.reciter,
      background: videoProject.background,
      template: videoProject.template,
      format: videoProject.format,
    };
    const next = [fresh, ...projects];
    setProjects(next);
    saveLocalJSON('quran-studio-projects', next);
    setActiveSection('create');
  };

  const handleRenderVideo = async () => {
    setRenderStatus('Preparing render');
    try {
      const result = await exportVideoToWebM({
        title: currentSurah.nameEnglish,
        ayah: currentAyahText,
        translation: currentSurah.ayahs[selectedAyah - 1]?.translation || '[Translation will load from API]',
        format: videoProject.format,
      });
      if (result && result.blobUrl) {
        setRenderStatus('Export ready');
        const link = document.createElement('a');
        link.href = result.blobUrl;
        link.download = 'quran-studio-export.webm';
        link.click();
      } else {
        setRenderStatus('Browser fallback ready');
      }
    } catch (e) {
      setRenderStatus('Export not supported in this browser');
    }
  };

  const sidebarSurahs = surahList.slice(0, 20);
  const selectedAyahData = currentSurah?.ayahs[selectedAyah - 1] || currentSurah?.ayahs[0];

  return (
    <div className={`app-shell ${theme}`} style={formatDirection(language)}>
      {welcomeOpen && (
        <div className="welcome-overlay">
          <div className="welcome-card">
            <div className="welcome-badge">{t.premium}</div>
            <h1>{language === 'ar' ? 'استوديو القرآن' : 'QURAN STUDIO'}</h1>
            <p>{t.appSubtitle}</p>
            <div className="welcome-actions">
              <button className="primary-button" onClick={() => { setWelcomeOpen(false); setActiveSection('quran'); }}>
                {t.openQuran}
              </button>
              <button className="secondary-button" onClick={() => { setWelcomeOpen(false); setActiveSection('create'); }}>
                {t.createVideo}
              </button>
              <button className="soft-button" onClick={() => { setWelcomeOpen(false); setActiveSection('audio'); }}>
                {t.exploreReciters}
              </button>
            </div>
            <small>{t.welcomeNote}</small>
          </div>
        </div>
      )}

      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">☰</div>
          <div>
            <h2>{language === 'ar' ? 'استوديو القرآن' : 'Quran Studio'}</h2>
            <span>{t.premium}</span>
          </div>
        </div>

        <nav className="side-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
              onClick={() => setActiveSection(item.key)}
            >
              {item.label[language]}
            </button>
          ))}
        </nav>

        <div className="sidebar-section">
          <label>{t.language}</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="ar">{t.arabic}</option>
            <option value="en">{t.english}</option>
          </select>
        </div>

        <div className="sidebar-section">
          <label>{t.theme}</label>
          <div className="segmented-control">
            <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>Dark</button>
            <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>Light</button>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar glass-panel">
          <div className="search-box">
            <span>⌕</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.quranSearch}
              aria-label={t.quranSearch}
            />
          </div>

          <div className="topbar-actions">
            <button className="soft-button" onClick={() => setActiveSection('create')}>{t.createVideo}</button>
            <button className="primary-button" onClick={() => setActiveSection('quran')}>{t.openQuran}</button>
          </div>
        </header>

        {searchQuery && searchResults.length > 0 && (
          <section className="glass-panel search-results-panel">
            {searchResults.map((result) => (
              <button
                key={result.id}
                className="search-result"
                onClick={() => {
                  setSelectedSurah(result.surahNumber);
                  setSelectedAyah(result.ayahNumber);
                  setActiveSection('quran');
                  setSearchQuery('');
                }}
              >
                <strong>{result.surahName}</strong>
                <span>Ayah {result.ayahNumber}</span>
              </button>
            ))}
          </section>
        )}

        {activeSection === 'home' && (
          <section className="page-grid">
            <div className="hero-panel glass-panel">
              <div className="hero-copy">
                <div className="eyebrow">{t.continueReading}</div>
                <h1>{t.appTitle}</h1>
                <p>{t.appSubtitle}</p>
                <div className="hero-actions">
                  <button className="primary-button" onClick={() => setActiveSection('quran')}>{t.openQuran}</button>
                  <button className="secondary-button" onClick={() => setActiveSection('create')}>{t.createVideo}</button>
                </div>
              </div>
              <div className="hero-illustration">
                <div className="moon-glow" />
                <div className="arch-card">
                  <span>Surah</span>
                  <strong>{currentSurah.nameEnglish}</strong>
                  <small>Ayah {selectedAyah}</small>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card glass-panel">
                <span>{t.lastSurah}</span>
                <strong>{currentSurah.nameEnglish}</strong>
                <small>Ayah {selectedAyah}</small>
              </div>
              <div className="stat-card glass-panel">
                <span>{t.lastAyah}</span>
                <strong>{currentAyahText.slice(0, 28) || '…'}</strong>
              </div>
              <div className="stat-card glass-panel">
                <span>{t.dailyAyah}</span>
                <strong>{surahList[0].nameEnglish}</strong>
                <small>Ayah 1</small>
              </div>
            </div>

            <div className="content-grid wide">
              <div className="glass-panel list-panel">
                <div className="panel-header">
                  <h3>{t.favoriteAyat}</h3>
                  <button className="soft-button" onClick={() => setActiveSection('favorites')}>{t.explore}</button>
                </div>
                <div className="mini-list">
                  {favorites.ayat.length > 0 ? favorites.ayat.map((ayah) => (
                    <button key={ayah} className="mini-item" onClick={() => setActiveSection('quran')}>Ayah {ayah}</button>
                  )) : <p className="empty-text">No favorite ayat yet.</p>}
                </div>
              </div>

              <div className="glass-panel list-panel">
                <div className="panel-header">
                  <h3>{t.recentlyPlayed}</h3>
                  <button className="soft-button" onClick={() => setActiveSection('audio')}>{t.explore}</button>
                </div>
                <div className="mini-list">
                  {defaultReciters.slice(0, 4).map((reciter) => (
                    <button key={reciter.id} className="mini-item" onClick={() => setCurrentReciter(reciter.id)}>{reciter.name}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="content-grid">
              <div className="glass-panel list-panel">
                <div className="panel-header">
                  <h3>{t.quickStart}</h3>
                </div>
                <div className="quick-start-grid">
                  <button onClick={() => setActiveSection('quran')}>{t.quranReader}</button>
                  <button onClick={() => setActiveSection('create')}>{t.videoCreator}</button>
                  <button onClick={() => setActiveSection('audio')}>Reciters</button>
                  <button onClick={() => setActiveSection('settings')}>{t.settings}</button>
                </div>
              </div>

              <div className="glass-panel list-panel">
                <div className="panel-header">
                  <h3>{t.popularReciters}</h3>
                </div>
                <div className="mini-list compact-list">
                  {defaultReciters.slice(0, 6).map((reciter) => (
                    <button className="mini-item" key={reciter.id} onClick={() => setCurrentReciter(reciter.id)}>{reciter.name}</button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'quran' && (
          <section className="reader-layout">
            <aside className="reader-sidebar glass-panel">
              <div className="panel-header">
                <h3>Surahs</h3>
              </div>
              <div className="surah-list">
                {sidebarSurahs.map((surah) => (
                  <button
                    key={surah.number}
                    className={`surah-item ${selectedSurah === surah.number ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSurah(surah.number);
                      setSelectedAyah(1);
                    }}
                  >
                    <span>{surah.number}. {surah.nameArabic}</span>
                    <small>{surah.nameEnglish}</small>
                  </button>
                ))}
              </div>
            </aside>

            <div className="reader-main glass-panel">
              <div className="reader-header">
                <div>
                  <div className="eyebrow">{currentSurah.nameEnglish}</div>
                  <h2>{currentSurah.nameArabic}</h2>
                </div>
                <div className="reader-actions">
                  <button className="soft-button">Ayah Mode</button>
                  <button className="soft-button">Page Mode</button>
                  <FavoriteToggle active={favorites.surahs.includes(currentSurah.number)} onClick={() => setFavorite('surah', currentSurah.number)} label="Favorite surah" />
                </div>
              </div>

              <div className="surah-meta-grid">
                <div>Revelation: {currentSurah.revelationType}</div>
                <div>Ayat: {currentSurah.ayahCount}</div>
                <div>Juz: {currentSurah.juz}</div>
                <div>Page: {currentSurah.page}</div>
              </div>

              <div className="ayah-panel">
                <div className="ayah-toolbar">
                  <button className="soft-button" onClick={() => setSelectedAyah(Math.max(1, selectedAyah - 1))}>Previous</button>
                  <span>Ayah {selectedAyah}</span>
                  <button className="soft-button" onClick={() => setSelectedAyah(Math.min(currentSurah.ayahCount, selectedAyah + 1))}>Next</button>
                </div>

                <div className="ayah-card">
                  <div className="ayah-arabic" dir="rtl">{currentAyahText}</div>
                  <div className="ayah-translation">{selectedAyahData?.translation || '[Translation will load from API]'}</div>
                  <div className="ayah-meaning">{selectedAyahData?.meaning || '[Meaning will load from API]'}</div>
                </div>

                <div className="ayah-controls">
                  <button className="soft-button" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? 'Pause' : 'Listen'}</button>
                  <button className="soft-button" onClick={() => setFavorite('ayah', `${selectedSurah}:${selectedAyah}`)}>Favorite</button>
                  <button className="soft-button">Share</button>
                  <button className="soft-button">Copy</button>
                  <button className="primary-button" onClick={() => setActiveSection('create')}>Create Video</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'audio' && (
          <section className="page-grid">
            <div className="glass-panel panel-block">
              <div className="panel-header">
                <h3>Reciters</h3>
              </div>
              <div className="reciter-grid">
                {defaultReciters.map((reciter) => (
                  <button
                    key={reciter.id}
                    className={`reciter-card ${currentReciter === reciter.id ? 'active' : ''}`}
                    onClick={() => setCurrentReciter(reciter.id)}
                  >
                    <div className="reciter-avatar">🎧</div>
                    <div>
                      <strong>{reciter.name}</strong>
                      <small>{reciter.style}</small>
                    </div>
                    <FavoriteToggle active={favorites.reciters.includes(reciter.id)} onClick={(e) => { e.stopPropagation(); setFavorite('reciter', reciter.id); }} label={`Favorite ${reciter.name}`} />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'create' && (
          <section className="creator-layout">
            <div className="glass-panel creator-panel">
              <div className="panel-header">
                <h3>Video Creator</h3>
              </div>

              <div className="field-grid">
                <label>
                  Surah
                  <select value={videoProject.selectedSurah} onChange={(e) => setVideoProject((prev) => ({ ...prev, selectedSurah: Number(e.target.value) }))}>
                    {surahList.slice(0, 20).map((surah) => (
                      <option key={surah.number} value={surah.number}>{surah.nameEnglish}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Start Ayah
                  <input type="number" min="1" max="20" value={videoProject.startAyah} onChange={(e) => setVideoProject((prev) => ({ ...prev, startAyah: Number(e.target.value) }))} />
                </label>

                <label>
                  End Ayah
                  <input type="number" min="1" max="20" value={videoProject.endAyah} onChange={(e) => setVideoProject((prev) => ({ ...prev, endAyah: Number(e.target.value) }))} />
                </label>

                <label>
                  Format
                  <select value={videoProject.format} onChange={(e) => setVideoProject((prev) => ({ ...prev, format: e.target.value }))}>
                    <option value="9:16">TikTok / Reels / Shorts</option>
                    <option value="1:1">Instagram</option>
                    <option value="16:9">YouTube</option>
                    <option value="4:5">Portrait</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>
              </div>

              <div className="background-library">
                {backgroundLibrary.map((background) => (
                  <button
                    key={background.id}
                    className={`bg-option ${videoProject.background === background.id ? 'active' : ''}`}
                    style={{ background: background.gradient }}
                    onClick={() => setVideoProject((prev) => ({ ...prev, background: background.id }))}
                  >
                    <span>{background.name}</span>
                  </button>
                ))}
              </div>

              <div className="creator-actions">
                <button className="soft-button" onClick={handleCreateProject}>Save Project</button>
                <button className="primary-button" onClick={handleRenderVideo}>Render</button>
              </div>

              <div className="status-strip">Render status: {renderStatus}</div>
            </div>

            <div className="glass-panel preview-panel">
              <div className="panel-header">
                <h3>Live Preview</h3>
                <span>{videoProject.format}</span>
              </div>

              <div className={`preview-surface ${videoProject.format}`} style={{
                background: customBackground || backgroundLibrary.find((b) => b.id === videoProject.background)?.gradient || '#0d1326',
              }}>
                <div className="preview-overlay" />
                <div className="preview-text-block">
                  <div className="preview-arabic">{selectedAyahData?.text || currentAyahText}</div>
                  <div className="preview-translation">{selectedAyahData?.translation || '[Translation will load from API]'}</div>
                </div>
              </div>

              <div className="text-controls">
                <label>
                  Text size
                  <input type="range" min="20" max="80" value={displayTextSettings.fontSize} onChange={(e) => setDisplayTextSettings((prev) => ({ ...prev, fontSize: Number(e.target.value) }))} />
                </label>
                <label>
                  Opacity
                  <input type="range" min="0.2" max="1" step="0.1" value={displayTextSettings.opacity} onChange={(e) => setDisplayTextSettings((prev) => ({ ...prev, opacity: Number(e.target.value) }))} />
                </label>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'favorites' && (
          <section className="page-grid">
            <div className="glass-panel panel-block">
              <div className="panel-header">
                <h3>Favorites</h3>
              </div>
              <div className="favorites-grid">
                {Object.entries(favorites).map(([type, items]) => (
                  <div key={type} className="favorite-list">
                    <strong>{type}</strong>
                    {items.length ? items.map((item) => <span key={item}>{String(item)}</span>) : <small>Empty</small>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'settings' && (
          <section className="settings-grid">
            <div className="glass-panel settings-panel">
              <h3>Appearance</h3>
              <div className="settings-row">
                <span>Dark mode</span>
                <button className="toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'On' : 'Off'}</button>
              </div>
              <div className="settings-row">
                <span>{t.language}</span>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="ar">Arabic</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="glass-panel settings-panel">
              <h3>Quran</h3>
              <div className="settings-row">
                <span>Tajweed</span>
                <button className="toggle">Off</button>
              </div>
              <div className="settings-row">
                <span>Translation</span>
                <select>
                  <option>Arabic + English</option>
                  <option>Arabic only</option>
                  <option>English only</option>
                </select>
              </div>
            </div>

            <div className="glass-panel settings-panel">
              <h3>Audio</h3>
              <div className="settings-row">
                <span>Reciter</span>
                <select value={currentReciter} onChange={(e) => setCurrentReciter(e.target.value)}>
                  {defaultReciters.map((reciter) => (
                    <option key={reciter.id} value={reciter.id}>{reciter.name}</option>
                  ))}
                </select>
              </div>
              <div className="settings-row">
                <span>Speed</span>
                <select value={audioSpeed} onChange={(e) => setAudioSpeed(Number(e.target.value))}>
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
            </div>
          </section>
        )}
      </main>

      <div className="mini-player glass-panel">
        <div className="mini-player-main">
          <div className="mini-track-info">
            <strong>{currentSurah.nameEnglish}</strong>
            <span>Ayah {selectedAyah}</span>
          </div>
          <div className="mini-controls">
            <button className="icon-button" onClick={() => setSelectedAyah(Math.max(1, selectedAyah - 1))}>⏮</button>
            <button className="icon-button" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? '⏸' : '▶'}</button>
            <button className="icon-button" onClick={() => setSelectedAyah(Math.min(currentSurah.ayahCount, selectedAyah + 1))}>⏭</button>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={audioProgress}
          onChange={(e) => setAudioProgress(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

export default App;
