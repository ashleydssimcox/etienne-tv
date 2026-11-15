/* The Étienne TV: villa settings. Change things here, not in app.js. */
var ETIENNE_CONFIG = {
  // The welcome name comes from the current reservation in ops.theetienne.com
  // (Supabase function get_tv_greeting). This key is the public "publishable" key, safe to ship.
  supabaseUrl: 'https://cxryccvdunfmhyhlrfyf.supabase.co',
  // Where the page's own files (and the photos in web/img) are served from.
  assetBase: 'https://ashleydssimcox.github.io/etienne-tv/web/',
  supabaseKey: 'sb_publishable_ZWA3j-rd5XZrBbU5BbpeSg_3T0ck-f7',

  // This TV's name, as guests see it in AirPlay and Chromecast lists.
  roomName: 'The Étienne · Lounge',

  villaPhone: '+66 (0) 94 374 6592',
  weather: { lat: 9.5357, lon: 99.9357 },

  // Staff PIN for the hidden staff menu (Android/Sony only: settings, reset for next guest).
  staffPin: '1042',

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
  // logo: a single-colour logo in web/img/logos (fetched by .github/workflows/fetch-logos.yml). Without one,
  // the tile shows the app name in the serif instead.
  apps: [
    { key: 'netflix', logo: 'img/logos/netflix.svg', name: 'Netflix', eyebrow: 'Films & series', tizen: ['11101200001', '3201907018807'], android: 'com.netflix.ninja' },
    { key: 'youtube', logo: 'img/logos/youtube.svg', name: 'YouTube', eyebrow: 'Watch & discover', tizen: ['111299001912'], android: 'com.google.android.youtube.tv' },
    { key: 'disney', name: 'Disney+', eyebrow: 'Stories for everyone', tizen: ['fiZNCxMSEA.hotstar', '3201901017640'], android: 'com.disney.disneyplus' },
    { key: 'prime', logo: 'img/logos/prime.svg', name: 'Prime Video', tizenName: 'Amazon', eyebrow: 'Movies & originals', tizen: ['evKhCgZelL.AmazonIgnitionLauncher2', '3201512006785', '3201910019365'], android: 'com.amazon.amazonvideo.livingroom' },
    { key: 'max', logo: 'img/logos/max.svg', name: 'Max', tizenName: 'HBO Max', eyebrow: 'Premium entertainment', tizen: ['5b8c3eb16b.BeamCTVDev'], android: 'com.wbd.stream' },
    { key: 'spotify', logo: 'img/logos/spotify.svg', name: 'Spotify', eyebrow: 'Your music', tizen: ['3201606009684'], android: 'com.spotify.tv.android' }
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

  // Dining & Experiences. The items, prices and stock come live from the Menu Manager in ops.theetienne.com
  // (menu_items, active rows only). Out-of-stock items stay listed, dimmed and marked Unavailable, as on the phone.
  // "sections" must match menuSections() in etienne-deploy index.html. The Cellar also lists the mini bar's
  // soft drinks that are ticked "show in Cellar".
  // Shown under every menu. The same wording as the phone menus at order.theetienne.com.
  menuTaxNote: 'All prices are in Thai Baht (฿) and are subject to 10% service charge and 7% VAT',

  // Experience cards use the item's own photo from the Menu Manager (image_url). Until one is added, the card
  // shows the stock photo for its section, kept in web/img and served from GitHub Pages with the rest of the page.
  // Free Unsplash photos (unsplash.com/license), downloaded by .github/workflows/fetch-photos.yml.
  experiencePhotos: {
    dining: 'img/exp-dining.jpg',        // candlelit table, Benjamin Brunner
    wellness: 'img/exp-wellness.jpg',    // massage, unsplash.com/photos/UNRW1dD2xjI
    water: 'img/exp-water.jpg',          // speedboat off a Thai island, Jim Thirion
    transfers: 'img/exp-transfers.jpg'   // Mercedes interior, unsplash.com/photos/ovrOPhu8vSw
  },

  dining: [
    { key: 'minibar', name: 'Mini Bar', eyebrow: 'In your room', url: 'https://order.theetienne.com/minibar', qrLabel: 'Scan to view',
      description: 'Refreshments in your room, replenished daily for your comfort.',
      sections: [['softs', 'Drinks'], ['snacks', 'Snacks']] },
    { key: 'wine', name: 'The Cellar', eyebrow: 'Wines, spirits & beer', url: 'https://order.theetienne.com/thecellar', qrLabel: 'Scan to order',
      description: 'A curated selection of wines, spirits and beers, with mixers.',
      sections: [['wine', 'Wine'], ['spirits', 'Spirits'], ['aperitif', 'Aperitifs'], ['beer', 'Beer'], ['softs', 'Soft Drinks & Mixers']] },
    { key: 'experiences', name: 'Experiences', eyebrow: 'Discover Koh Samui', url: 'https://order.theetienne.com/experiences', qrLabel: 'Scan to reserve',
      description: 'Private dining, wellness and days on the water, arranged for you.',
      sections: [['dining', 'Dining'], ['wellness', 'Wellness'], ['water', 'On the Water'], ['transfers', 'Transfers']] }
  ],

  // The Villa Guide, shown as text on the TV. Copied from the Guest Guide at order.theetienne.com/guide
  // (_guideBody in etienne-deploy index.html); keep the two in step. {phone} shows villaPhone.
  // Block types: p (paragraph), sub (small heading), ul (list), pairs (label and value rows), sign (sign-off).
  guide: [
    {"name": "Welcome", "title": "Welcome to The Étienne", "blocks": [["p", "Welcome to your private residence in Koh Samui."], ["p", "The Étienne was conceived as both a sanctuary and a setting for exceptional living - a place to slow down, reconnect, and experience the island in complete privacy, while also providing an elegant backdrop for entertaining, intimate dinners, and memorable occasions. Whether enjoying a quiet morning overlooking the island or hosting an evening of dining and celebration, the residence adapts effortlessly to each moment."], ["p", "Designed as an architectural statement and a deeply personal retreat, the Residence balances openness and intimacy. Expansive glass invites the outside in, while natural stone and marble create a quiet sense of permanence and calm."], ["p", "During your stay, The Étienne is entirely yours."], ["p", "This guide has been thoughtfully prepared to help you navigate the residence, its features, and the services available."], ["p", "Your Villa Team is always at hand, providing service with intention and discretion - present when needed, and unobtrusive when not - ensuring your complete comfort, freedom, and privacy. For assistance at any time, please contact Concierge via WhatsApp at: {phone}"], ["p", "Should you require anything at all, your Villa Team remains quietly at your service."], ["sign", "Welcome home,"]]},
    {"name": "Our Philosophy", "title": "Our Philosophy", "blocks": [["p", "The Étienne is founded on a simple belief: that true luxury lies in space, privacy, and thoughtful design."], ["p", "Rather than imposing itself, the residence is designed to support the rhythms of its guests - whether that means slow mornings with coffee and light, afternoons by the pool, movement and wellness, or evenings of dining and gathering."], ["p", "Service is provided with care and discretion. Experiences are curated around you."], ["p", "Everything exists to allow you to live beautifully and effortlessly."]]},
    {"name": "Design Story", "title": "Design Story", "blocks": [["p", "The Étienne is defined by clarity, materiality, and light."], ["p", "Marble plays a central role throughout the residence - grounding the architecture while reflecting the changing tones of the day."], ["p", "Floor-to-ceiling glass dissolves the boundary between interior and landscape, allowing Koh Samui’s natural beauty to become part of the living experience."], ["p", "Open volumes create flow between spaces, allowing moments of solitude and connection to coexist."], ["p", "The result is a residence that feels both monumental and deeply personal - a calm sanctuary and an inspiring place to gather."]]},
    {"name": "Arrival & Departure", "title": "Arrival & Departure", "blocks": [["pairs", [["Check-in", "From 12:00 noon"], ["Check-out", "By 15:00"]]], ["p", "Where possible, early arrival or late departure may be arranged. Our team will always do their best to accommodate your journey."], ["p", "You will be personally welcomed by your Villa Manager, who will introduce the residence and remain available throughout your stay."]]},
    {"name": "Villa Team & Concierge", "title": "Your Villa Team & Concierge", "blocks": [["p", "Your stay is supported by:"], ["ul", ["Villa Manager", "Housekeeping team", "Garden and maintenance team", "Dedicated concierge (via private WhatsApp group)"]], ["p", "Your concierge is available to assist with every aspect of your stay, including:"], ["ul", ["Private chefs and dining", "Wellness treatments", "Restaurant reservations", "Transport and drivers", "Boat charters and island exploration", "Special occasions and celebrations", "Refrigerator stocking", "Wine & spirit selections"]], ["p", "Simply message Concierge at any time for assistance via WhatsApp at {phone}"]]},
    {"name": "The Residence", "title": "The Residence at a Glance", "blocks": [["pairs", [["Bedrooms", "Five private bedroom suites"], ["Guests", "Up to ten guests"], ["Swimming Pool", "Private saltwater infinity pool"], ["Movement Studio", "Fully equipped private gym"], ["Treatment Suite", "Dedicated private wellness treatment room"], ["Pilates Pavilion", "Open-air pavilion for yoga, Pilates, and stretch practice"], ["The C-D Room", "Private wine and spirits selection, serviced by Concierge"], ["The Cellar", "Private cellar within The C-D Room, serviced via Concierge"], ["Entertainment", "Architectural audio throughout, and Apple TV in bedrooms and living areas"], ["Concierge", "Dedicated private concierge service"]]]]},
    {"name": "Living at The Étienne", "title": "Living at The Étienne", "blocks": [["p", "The residence has been designed for intuitive, effortless living."], ["sub", "Lighting"], ["p", "Lighting scenes can be adjusted using the wall panels located throughout the Residence, allowing you to create the perfect atmosphere - from bright mornings to relaxed evenings."], ["sub", "Climate"], ["p", "Each room features individually controlled air conditioning, thoughtfully preset to balance comfort and environmental responsibility. Fans are also available for natural airflow."], ["sub", "Entertainment"], ["p", "Apple TV is provided in all bedrooms and the main living room. This allows you to enjoy:"], ["ul", ["Streaming apps (using your personal accounts)", "International television", "Screen mirroring from your phone, tablet, or laptop"]], ["p", "The Apple remote also controls the television power and volume."], ["sub", "Music"], ["p", "Integrated speakers are located throughout the Residence, including:"], ["ul", ["Living areas", "Pool and outdoor areas", "Movement Studio", "The C-D Room"]], ["p", "Music can be played wirelessly from your personal device."], ["sub", "Wi-Fi"], ["p", "High-speed Wi-Fi is available throughout the entire property."], ["sub", "Swimming Pool"], ["p", "The swimming pool is available for your enjoyment at any time. Designed as a saltwater pool, it provides a gentler and more natural swimming experience while reducing chemical use."], ["p", "For your privacy and independence, the pool is not staffed and is enjoyed at your own discretion."]]},
    {"name": "Entertaining", "title": "Entertaining at The Étienne", "blocks": [["p", "A residence designed for gathering."], ["p", "The Étienne has been conceived not only as a place of retreat, but as a setting for shared experiences, from relaxed afternoons with friends to elegant evening occasions."], ["p", "Multiple indoor and outdoor living areas provide a natural flow for entertaining, centred around the main living spaces, dining areas, pool terrace, and the private entertainment space - The C-D Room. Each may be enjoyed independently or together, allowing the residence to adapt effortlessly to the tone of your gathering."], ["p", "Private chefs, bartenders, DJs, and additional service staff may be arranged through Concierge with advance notice. Whether planning a casual poolside lunch, sunset cocktails, or a fully hosted dinner, our team will assist in coordinating every detail."], ["p", "Located on the lower floor, The C-D Room is home to the residence’s private wine and spirits cellar, where music, atmosphere, and a curated drinks selection come together within a single, dedicated setting."], ["p", "Your Villa Team remains discreetly available to assist with planning and arrangements, ensuring every occasion is thoughtfully prepared in advance."], ["sub", "The C-D Room"], ["p", "A dedicated space for immersive listening."], ["p", "Located on the lower level, The C-D Room is an intimate setting designed for music, atmosphere, and late-evening gatherings."], ["p", "Centred around a sunken conversation pit, the space invites guests to settle in and experience sound in a more personal way, with a custom audio system and integrated amplifier supporting professional DJ and audio performance."], ["p", "A dedicated DJ booth is positioned within the room. DJs may be arranged in advance through Concierge. An adjoining bar serves the space, and beverage selections and full bar service may be arranged in advance through Concierge."]]},
    {"name": "Coffee Rituals", "title": "Coffee Rituals", "blocks": [["p", "Coffee at The Étienne is designed as a daily ritual."], ["p", "Each bedroom features a Nespresso machine with biodegradable capsules from CafeCaps, using sustainably sourced Thai coffee."], ["p", "The main kitchen features a bean-to-cup coffee machine using locally sourced beans, allowing you to enjoy espresso, latte, and other coffee styles."], ["p", "A curated selection of ethically sourced Thai teas from Araksa Tea Garden is also provided throughout the Residence."]]},
    {"name": "Dining", "title": "Curated Dining Experiences", "blocks": [["p", "Dining at The Étienne is designed around flexibility and personal preference."], ["p", "Our concierge can arrange private chefs offering:"], ["ul", ["Thai cuisine", "Western cuisine", "Italian dining", "Barbecue experiences"]], ["p", "Meals may be enjoyed:"], ["ul", ["At the main dining table", "Poolside", "Within the living spaces"]], ["p", "Menus and pricing are available upon request. Refrigerator stocking can also be arranged prior to arrival or during your stay."], ["p", "For assistance, simply message Concierge."]]},
    {"name": "The Cellar", "title": "The Cellar", "blocks": [["p", "The residence features a private wine and spirits cellar, located within The C-D Room, curated to complement both intimate evenings and celebratory gatherings."], ["p", "The collection is secured to ensure proper storage and presentation. Guests are invited to explore the available selections by contacting Concierge in advance, who will be pleased to provide the cellar list and arrange service."], ["p", "Kindly note that wines and spirits are not included as part of the residence stay and will be charged accordingly."]]},
    {"name": "Wellness & Movement", "title": "Wellness & Movement", "blocks": [["p", "Wellness is an integral part of life at The Étienne."], ["sub", "The Movement Studio"], ["p", "Your private gym includes:"], ["ul", ["Free weights", "Resistance machines", "Treadmill", "Exercise bike", "Strength equipment", "Yoga and stretch mats"]], ["p", "Available exclusively for you throughout your stay."], ["sub", "The Treatment Suite"], ["p", "The Treatment Suite offers a calm, private environment for:"], ["ul", ["Massage", "Reiki", "Meditation", "Spa treatments"]], ["p", "Therapists may be arranged via concierge."], ["sub", "Pilates Pavilion"], ["p", "The open-air Pilates Pavilion provides a beautiful setting for:"], ["ul", ["Yoga", "Pilates", "Stretching", "Breathwork"]], ["p", "Available at any time. Private instructors can be arranged via concierge."]]},
    {"name": "Housekeeping & Laundry", "title": "Housekeeping & Laundry", "blocks": [["p", "Daily housekeeping ensures the residence remains welcoming and effortless to enjoy. Laundry service is available upon request."], ["p", "As part of our sustainability programme, linens are refreshed every three days, with additional changes always available upon request."]]},
    {"name": "Sustainability", "title": "Sustainability at The Étienne", "blocks": [["p", "Care for the environment is central to the philosophy of The Étienne. We are committed to reducing our environmental impact while maintaining the comfort and standards of a luxury private residence."], ["p", "Our sustainability initiatives include:"], ["ul", ["Solar energy supporting a portion of the residence’s power requirements", "Air-conditioning preset to 24°C to help reduce energy consumption (guests are welcome to adjust for personal comfort)", "Water sourced from our dedicated underground natural source and filtered onsite", "Saltwater swimming pool to significantly reduce the need for chemical treatments", "Filtered drinking water provided throughout the residence, eliminating single-use plastic bottles", "Bathroom amenities in refillable dispensers to reduce packaging waste", "Dry bathroom amenities that are plastic-free, recyclable, and FSC-certified", "Recycling programme implemented throughout the residence", "Used coffee grounds recycled as natural plant fertiliser and within our mosquito-repellent programme", "Linen reuse programme to reduce water and energy consumption", "Compostable TÜV-certified coffee capsules, locally sourced via CafeCaps", "Sustainably sourced tea from Araksa Tea Garden, supporting Thai farmers"]], ["p", "Through these initiatives, we aim to ensure that comfort and environmental responsibility exist together in harmony."]]},
    {"name": "Residence Guidelines", "title": "Residence Guidelines", "blocks": [["p", "The Étienne is a private residence, and we invite guests to enjoy it with the same care and consideration as their own home."], ["p", "Smoking may be enjoyed in the outdoor areas and terraces."], ["p", "Visitors are welcome with advance notice, allowing the Villa Team to prepare for their arrival."], ["p", "To preserve the comfort, cleanliness, and tranquillity of the residence, pets are not permitted at The Étienne. We kindly ask that guests do not bring animals onto the property, including visiting pets. Should you require assistance with local pet-care or alternative arrangements, Concierge will be happy to advise where possible."], ["p", "Events and celebrations may be arranged with prior approval through Concierge."], ["p", "The swimming pool is enjoyed at your own discretion. For comfort and safety, we kindly ask that glassware remains within the indoor living and dining areas."], ["p", "To preserve the tranquil setting, we kindly ask that noise levels remain considerate, particularly in the evening."], ["p", "DJs, bartenders, and other service providers may be arranged through Concierge. Your Villa Team remains discreetly available to assist at any time."]]},
    {"name": "Safety & Security", "title": "Safety & Security", "blocks": [["p", "Your safety and peace of mind are of the utmost importance to us. The Étienne has been designed and operated with careful attention to guest safety while maintaining the relaxed atmosphere of a private residence."], ["p", "The residence features:"], ["ul", ["Smart lock entry for secure and convenient access", "Secure access throughout the property", "Smoke detectors, carbon monoxide detectors, and fire extinguishers in key areas", "First aid kits available within the residence", "In-room safes in each bedroom for passports, jewellery, and other valuables"]], ["p", "For any assistance during your stay, your Villa Team is available at all times and will be happy to assist."], ["sub", "Emergency Contacts"], ["p", "If you require urgent assistance, please contact the Villa Team or the following emergency services:"], ["pairs", [["Villa Manager / Concierge", "{phone}"], ["Tourist Police (English)", "1155"], ["Police", "191"], ["Ambulance / Medical", "1669"], ["Fire", "199"]]], ["sub", "Pool Safety"], ["p", "The swimming pool is not supervised. Children should always be supervised by an adult when using or near the pool. The pool terrace may become slippery when wet."], ["sub", "Outdoor Areas & Environment"], ["p", "As The Étienne is located within a tropical environment, paths and terraces may occasionally become wet. Small wildlife such as geckos, birds, and insects are a natural part of the ecosystem, and the property is regularly maintained to ensure guest comfort."], ["p", "In any urgent situation, please contact the Villa Manager immediately so we can coordinate assistance."]]},
    {"name": "Island Recommendations", "title": "Island Recommendations", "blocks": [["p", "Koh Samui offers extraordinary experiences. Our concierge is delighted to recommend and arrange:"], ["sub", "Beaches"], ["ul", ["Choeng Mon Beach", "Maenam Beach", "Coral Cove"]], ["sub", "Beach Clubs"], ["ul", ["Nikki Beach", "SALA Beach Club", "Seen Beach Club"]], ["sub", "Dining"], ["p", "A curated list of recommended restaurants will be provided separately and may be arranged through concierge."], ["sub", "Experiences"], ["ul", ["Private boat charters", "Island tours", "Wellness sessions", "Cultural experiences"]], ["p", "Each experience is tailored to your preferences."]]},
    {"name": "Transport", "title": "Transport", "blocks": [["p", "Due to the Residence’s elevated hillside location, a 4 x 4 vehicle is recommended for comfort and ease."], ["p", "Our concierge can arrange:"], ["ul", ["Private drivers", "Car rental", "Airport transfers"]]]},
    {"name": "A Final Note", "title": "A Final Note", "blocks": [["p", "The Étienne was created as more than a villa."], ["p", "It is a place to live, to gather, to restore, and to experience Koh Samui in your own way."], ["p", "We hope your time here becomes part of your story."], ["p", "Should you need anything at all, your Villa Team remains quietly at your service."]]}
  ]
};
