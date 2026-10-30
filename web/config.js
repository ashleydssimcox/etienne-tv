/* The Étienne TV: villa settings. Change things here, not in app.js. */
var ETIENNE_CONFIG = {
  // Shown on the welcome screen. Later this comes from the active reservation in ops.theetienne.com.
  guestName: 'Karoon',

  // This TV's name, as guests see it in AirPlay and Chromecast lists.
  roomName: 'The Étienne · Lounge',

  villaPhone: '+66 (0) 94 374 6592',
  weather: { lat: 9.5357, lon: 99.9357 },

  // Staff PIN for the hidden staff menu (Android/Sony only: settings, reset for next guest).
  staffPin: '2580',

  homeTiles: [
    { label: 'Live TV', eyebrow: 'Worldwide channels', screen: 'tv' },
    { label: 'Streaming', eyebrow: 'Your favourite services', screen: 'streaming' },
    { label: 'Music', eyebrow: 'Listen & unwind', screen: 'music' },
    { label: 'Villa Guide', eyebrow: 'Everything you need', screen: 'guide' },
    { label: 'Dining & Experiences', eyebrow: 'Menus, drinks & island experiences', screen: 'dining' },
    { label: 'Share Your Screen', eyebrow: 'iPhone, iPad & Android', screen: 'share' }
  ],

  // Streaming apps. "tizen" is a list of Samsung app ids to try in order (they differ by TV year);
  // "android" is the Google TV package name. The Sony build only allows the apps listed here.
  apps: [
    { key: 'netflix', name: 'Netflix', eyebrow: 'Films & series', tizen: ['11101200001', '3201907018807'], android: 'com.netflix.ninja' },
    { key: 'youtube', name: 'YouTube', eyebrow: 'Watch & discover', tizen: ['111299001912'], android: 'com.google.android.youtube.tv' },
    { key: 'disney', name: 'Disney+', eyebrow: 'Stories for everyone', tizen: ['3201901017640'], android: 'com.disney.disneyplus' },
    { key: 'prime', name: 'Prime Video', eyebrow: 'Movies & originals', tizen: ['3201512006785', '3201910019365'], android: 'com.amazon.amazonvideo.livingroom' },
    { key: 'max', name: 'Max', eyebrow: 'Premium entertainment', tizen: [], android: 'com.wbd.stream' },
    { key: 'spotify', name: 'Spotify', eyebrow: 'Your music', tizen: ['3201606009684'], android: 'com.spotify.tv.android' }
  ],

  // Placeholder channel list. On the Sony build the real tuner channels replace it.
  channels: {
    'Thailand': { note: 'Local & national', list: [
      { name: 'Thai PBS', detail: 'National · Live', short: 'TP' },
      { name: 'Channel 3', detail: 'Entertainment · Live', short: '3' },
      { name: 'TNN 16', detail: 'News · Live', short: 'TNN' },
      { name: 'One 31', detail: 'Entertainment · Live', short: '31' } ] },
    'International': { note: 'World news', list: [
      { name: 'BBC World News', detail: 'International · Live', short: 'BBC' },
      { name: 'CNN International', detail: 'International · Live', short: 'CNN' },
      { name: 'France 24', detail: 'International · Live', short: 'F24' },
      { name: 'Al Jazeera', detail: 'International · Live', short: 'AJ' } ] },
    'Sport': { note: 'Live sport', list: [
      { name: 'beIN Sports 1', detail: 'Football · Live', short: 'beIN' },
      { name: 'True Sports', detail: 'Thailand · Live', short: 'TS' },
      { name: 'Eurosport', detail: 'International · Live', short: 'EU' },
      { name: 'Golf Channel', detail: 'Golf · Live', short: 'GC' } ] },
    'Movies': { note: 'Films & cinema', list: [
      { name: 'HBO', detail: 'Movies · Now playing', short: 'HBO' },
      { name: 'Cinemax', detail: 'Movies · Now playing', short: 'MAX' },
      { name: 'Paramount', detail: 'Movies · Now playing', short: 'P+' },
      { name: 'Film Asia', detail: 'Asian cinema · Live', short: 'FA' } ] }
  },

  music: [
    { name: 'The Étienne', eyebrow: 'Signature playlist' },
    { name: 'Poolside', eyebrow: 'Balearic & downtempo' },
    { name: 'Sunset', eyebrow: 'Golden hour' },
    { name: 'After Dark', eyebrow: 'Lounge & jazz' }
  ],

  qrPages: {
    guide: { kicker: 'At home', title: 'Villa Guide', note: 'For anything not covered here, your Villa Host is always available.', items: [
      { name: 'Guest Guide', eyebrow: 'Your stay', description: 'Scan to open villa information and everything you need during your stay.', url: 'https://order.theetienne.com/guide' } ] },
    dining: { kicker: 'At your service', title: 'Dining & Experiences', note: 'Scan a code to browse and make a request from your phone.', items: [
      { name: 'Mini Bar Menu', eyebrow: 'Refreshments', description: 'Drinks and snacks in your in-room mini bar.', url: 'https://order.theetienne.com/minibar' },
      { name: 'Wine Cellar Menu', eyebrow: 'Wine selection', description: 'The Étienne’s in-house cellar.', url: 'https://order.theetienne.com/thecellar' },
      { name: 'Experiences Menu', eyebrow: 'Discover Koh Samui', description: 'Island adventures and in-villa indulgences.', url: 'https://order.theetienne.com/experiences' } ] }
  }
};
