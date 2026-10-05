export const audioOptions = {
  speeds: [0.5, 0.75, 1, 1.25, 1.5, 2],
  playerMode: 'demo',
};

export const getAudioConfig = () => ({
  baseUrl: import.meta.env.VITE_AUDIO_API_BASE_URL || '',
  enabled: Boolean(import.meta.env.VITE_AUDIO_API_BASE_URL),
  message: 'Audio playback is configured for a real audio source through VITE_AUDIO_API_BASE_URL. Demo mode is active until a valid source is set.',
});
