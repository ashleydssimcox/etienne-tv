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
      { name: 'Thai PBS', detail: 'Public service · News & documentary', short: 'TP', streams: [
        { type: 'hls', url: 'https://thaipbs-live.cdn.byteark.com/live/playlist.m3u8' },
        { type: 'youtube', channel: 'UC5TOFhyb_LxL2VG_Zenhpzw' } ] },
      { name: 'MCOT HD', detail: 'News & entertainment', short: 'MC', streams: [
        { type: 'hls', url: 'https://mcothd-streaming-edge-cdn.mcot.net/tencentmcot/smil:tencentmcot.smil/playlist.m3u8' } ] },
      { name: 'TNN 16', detail: '24-hour news', short: 'TNN', streams: [{ type: 'youtube', channel: 'UCN-5TkXd9PVabsRecrMSfWg' }] },
      { name: 'Channel 3', detail: 'Drama & entertainment', short: '3' },
      { name: 'One 31', detail: 'Drama & entertainment', short: '31' } ] },
    'International': { note: 'World news', list: [
      { name: 'Al Jazeera English', detail: 'International news · Qatar', short: 'AJ', streams: [
        { type: 'hls', url: 'https://live-hls-apps-aje-fa.getaj.net/AJE/index.m3u8' },
        { type: 'hls', url: 'https://live-hls-apps-aje-v3-fa.getaj.net/AJE/index.m3u8' },
        { type: 'hls', url: 'https://live-hls-web-aje-fa.thehlive.com/AJE/index.m3u8' },
        { type: 'youtube', channel: 'UCNye-wNBqNL5ZzHSJj3l8Bg' } ] },
      { name: 'DW News', detail: 'International news · Germany', short: 'DW', streams: [
        { type: 'hls', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/master.m3u8' },
        { type: 'hls', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8' },
        { type: 'youtube', channel: 'UCknLrEdhRCp1aegoMqRaCZg' } ] },
      { name: 'France 24', detail: 'International news · France', short: 'F24', streams: [
        { type: 'hls', url: 'https://live.france24.com/hls/live/2037218/F24_EN_HI_HLS/master_2300.m3u8' },
        { type: 'hls', url: 'https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_2300.m3u8' },
        { type: 'hls', url: 'https://live.france24.com/hls/live/2037218/F24_EN_HI_HLS/master_900.m3u8' },
        { type: 'youtube', channel: 'UCQfwfsi5VrQ8yKZ-UWmAEFg' } ] },
      { name: 'Sky News', detail: 'International news · UK', short: 'SKY', streams: [{ type: 'youtube', channel: 'UCoMdktPbSTixAyNGwb-UYkQ' }] } ] },
    'Asia Pacific': { note: 'Regional news', list: [
      { name: 'NHK World', detail: 'International news · Japan', short: 'NHK', streams: [
        { type: 'hls', url: 'https://masterpl.hls.nhkworld.jp/hls/w/live/smarttv.m3u8' },
        { type: 'hls', url: 'https://media-tyo.hls.nhkworld.jp/hls/w/live/master.m3u8' },
        { type: 'hls', url: 'https://media-osa.hls.nhkworld.jp/hls/w/live/master.m3u8' } ] },
      { name: 'ABC News', detail: 'International news · Australia', short: 'ABC', streams: [
        { type: 'hls', url: 'https://abc-news-dmd-streams-1.akamaized.net/out/v1/701126012d044971b3fa89406a440133/index.m3u8' } ] },
      { name: 'CGTN', detail: 'International news · China', short: 'CG', streams: [
        { type: 'hls', url: 'https://english-livebkali.cgtn.com/live/encgtn.m3u8' },
        { type: 'hls', url: 'https://news.cgtn.com/resource/live/english/cgtn-news.m3u8' } ] },
      { name: 'Bloomberg Asia', detail: 'Business news · Asia', short: 'BBG', streams: [
        { type: 'hls', url: 'https://bloomberg.com/media-manifest/streams/asia.m3u8' } ] } ] },
    'Sport': { note: 'Live sport', list: [
      { name: 'beIN Sports 1', detail: 'Football', short: 'beIN' },
      { name: 'True Sports', detail: 'Thai & international sport', short: 'TS' },
      { name: 'Eurosport', detail: 'Multi-sport', short: 'EU' },
      { name: 'Golf Channel', detail: 'Golf', short: 'GC' } ] },
    'Movies': { note: 'Films & cinema', list: [
      { name: 'HBO', detail: 'Hollywood films & series', short: 'HBO' },
      { name: 'Cinemax', detail: 'Action & thriller films', short: 'MAX' },
      { name: 'Paramount', detail: 'Films & series', short: 'P+' },
      { name: 'Film Asia', detail: 'Asian cinema', short: 'FA' } ] }
  },

  // Villa playlists. Paste each Spotify playlist link into "spotify" once the playlist exists
  // (Spotify: ⋯ > Share > Copy link). Empty means the card shows "Coming soon".
  music: [
    { name: 'The Étienne', eyebrow: 'Signature playlist', description: 'Warm, atmospheric selections curated for the villa.', spotify: 'https://open.spotify.com/playlist/3LkvQD2JPf8VLoQrBq2Knx' },
    { name: 'Morning', eyebrow: 'Slow mornings', description: 'Gentle acoustic sounds to ease into the day.', spotify: 'https://open.spotify.com/playlist/0w7Ku0rzwGQb9jnLKkvFbW' },
    { name: 'Poolside', eyebrow: 'Balearic & downtempo', description: 'Unhurried rhythms for long afternoons by the water.', spotify: 'https://open.spotify.com/playlist/6wHI42UbkT9aKLESegneI2' },
    { name: 'Sunset', eyebrow: 'Golden hour', description: 'Soulful selections as the light softens over Samui.', spotify: 'https://open.spotify.com/playlist/5ETz4oScKYkbiqlicJ0fjx' },
    { name: 'After Dark', eyebrow: 'Lounge & jazz', description: 'A restrained late-evening soundtrack.', spotify: 'https://open.spotify.com/playlist/3krLgXHpkncQmg1myfHFnn' }
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
