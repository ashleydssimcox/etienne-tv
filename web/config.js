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

  // Live TV. Channels with "streams" play inside the screen over the internet (official free streams only).
  // Streams are tried in order: "hls" is a direct stream, "youtube" is the channel's own YouTube live stream.
  // Channels without streams are placeholders until the Sony's tuner channels replace them.
  channels: {
    'Thailand': { note: 'Local & national', list: [
      { name: 'Thai PBS', detail: 'National · Live', short: 'TP', streams: [{ type: 'youtube', channel: 'UC5TOFhyb_LxL2VG_Zenhpzw' }] },
      { name: 'TNN 16', detail: 'News · Live', short: 'TNN', streams: [{ type: 'youtube', channel: 'UCN-5TkXd9PVabsRecrMSfWg' }] },
      { name: 'Channel 3', detail: 'Entertainment · On the villa TVs', short: '3' },
      { name: 'One 31', detail: 'Entertainment · On the villa TVs', short: '31' } ] },
    'International': { note: 'World news', list: [
      { name: 'Al Jazeera English', detail: 'International news · Live', short: 'AJ', streams: [
        { type: 'hls', url: 'https://live-hls-web-aje.getaj.net/AJE/index.m3u8' },
        { type: 'youtube', channel: 'UCNye-wNBqNL5ZzHSJj3l8Bg' } ] },
      { name: 'DW News', detail: 'International news · Live', short: 'DW', streams: [
        { type: 'hls', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8' },
        { type: 'youtube', channel: 'UCknLrEdhRCp1aegoMqRaCZg' } ] },
      { name: 'France 24', detail: 'International news · Live', short: 'F24', streams: [{ type: 'youtube', channel: 'UCQfwfsi5VrQ8yKZ-UWmAEFg' }] },
      { name: 'Sky News', detail: 'UK & world news · Live', short: 'SKY', streams: [{ type: 'youtube', channel: 'UCoMdktPbSTixAyNGwb-UYkQ' }] },
      // Test only: a public test stream, to check whether this TV can play direct streams at all. Remove after testing.
      { name: 'Test stream', detail: 'Testing only', short: 'TEST', streams: [{ type: 'hls', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }] } ] },
    'Sport': { note: 'Live sport', list: [
      { name: 'beIN Sports 1', detail: 'Football · On the villa TVs', short: 'beIN' },
      { name: 'True Sports', detail: 'Thailand · On the villa TVs', short: 'TS' },
      { name: 'Eurosport', detail: 'International · On the villa TVs', short: 'EU' },
      { name: 'Golf Channel', detail: 'Golf · On the villa TVs', short: 'GC' } ] },
    'Movies': { note: 'Films & cinema', list: [
      { name: 'HBO', detail: 'Movies · On the villa TVs', short: 'HBO' },
      { name: 'Cinemax', detail: 'Movies · On the villa TVs', short: 'MAX' },
      { name: 'Paramount', detail: 'Movies · On the villa TVs', short: 'P+' },
      { name: 'Film Asia', detail: 'Asian cinema · On the villa TVs', short: 'FA' } ] }
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
