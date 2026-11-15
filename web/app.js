/* The Étienne TV: screens, remote navigation and the staff menu. Plain ES5 for older TV browsers. */
(function () {
  var C = ETIENNE_CONFIG;
  var app = document.getElementById('app');
  var stage = document.getElementById('stage');
  var state = { surname: null, screen: 'home', category: null, channel: 0, weather: null, upCount: 0, staff: null, menu: null, menuItems: null, menuError: false };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // ---------- helpers ----------
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function samuiNow() { var d = new Date(); return new Date(d.getTime() + d.getTimezoneOffset() * 60000 + 7 * 3600000); }
  function clock() { var d = samuiNow(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function longDate() { var d = samuiNow(); return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; }
  function greeting() { var h = samuiNow().getHours(); return h < 5 ? 'Good evening' : h < 12 ? 'Good morning' : (h < 18 ? 'Good afternoon' : 'Good evening'); }
  // "Welcome to the Johns Residence" during a stay, "Welcome to The Étienne" between stays.
  function welcomeHtml() {
    var s = state.surname;
    if (!s) return '<h1>Welcome to<br>The Étienne</h1>';
    var size = s.length > 12 ? ' class="name-xl"' : (s.length > 8 ? ' class="name-l"' : '');
    return '<h1' + size + '>Welcome,<br>The ' + esc(s) + (s.length > 16 ? '<br>' : ' ') + 'Family</h1><p class="prepared">to your private residence</p>';
  }
  function weatherLabel(code) {
    if (code === 0) return 'Clear skies';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 48) return 'Soft mist';
    if (code <= 67) return 'Tropical rain';
    if (code <= 82) return 'Passing showers';
    return 'Island weather';
  }
  function qr(url) { return 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&color=111111&bgcolor=f1e5d0&margin=10&data=' + encodeURIComponent(url); }
  // ---------- live streams ----------
  function streamHtml(s, muted) {
    if (s.type === 'hls') return '<video class="stream" autoplay playsinline' + (muted ? ' muted' : '') + ' src="' + esc(s.url) + '"></video>';
    return '<iframe class="stream" frameborder="0" allow="autoplay; encrypted-media" src="https://www.youtube.com/embed/live_stream?channel=' +
      encodeURIComponent(s.channel) + '&autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3' + (muted ? '&mute=1' : '') + '"></iframe>';
  }
  // hls.js plays streams the TV's own video player can't. Loaded once; if it can't load, the TV's player is used.
  var hlsReady = false, activeHls = null;
  (function () {
    var sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/hls.js@0.14.17/dist/hls.min.js';
    sc.onload = function () { hlsReady = !!(window.Hls && window.Hls.isSupported()); };
    document.getElementsByTagName('head')[0].appendChild(sc);
  })();
  function stopHls() { if (activeHls) { try { activeHls.destroy(); } catch (e) {} activeHls = null; } }

  // Puts the first working stream into el. Each direct stream is tried with hls.js first, then the TV's own player.
  function playInto(el, ch, muted) {
    if (!el || !ch || !ch.streams || !ch.streams.length) return false;
    var plan = [];
    for (var k = 0; k < ch.streams.length; k++) {
      var st0 = ch.streams[k];
      if (st0.type === 'hls') { plan.push({ s: st0, how: 'hls.js' }); plan.push({ s: st0, how: 'tv' }); }
      else plan.push({ s: st0, how: 'youtube' });
    }
    var i = 0;
    // Test build: a status line shows what each stream is doing, so a TV that can't play one tells us why.
    // Test build: the red box lists every attempt for this channel, so one photo shows why it failed.
    var log = [];
    function status(msg) {
      var s = document.getElementById('stream-status');
      if (!s) { s = document.createElement('div'); s.id = 'stream-status'; document.getElementById('stage').appendChild(s); }
      var head = msg.split(' · try ')[1] ? msg.split(') ')[0] + ')' : '';
      if (log.length && head && log[log.length - 1].indexOf(head) === 0) log[log.length - 1] = msg; else log.push(msg);
      if (log.length > 10) log.shift();
      s.innerHTML = 'hls.js: ' + (hlsReady ? 'ready' : 'not loaded') + '<br>' + esc(log.join('\n')).replace(/\n/g, '<br>');
    }
    function attempt() {
      stopHls();
      if (!document.body.contains(el)) return;
      if (i >= plan.length) { el.innerHTML = '<span class="stream-msg">This channel isn’t available right now.</span>'; status(ch.name + ': no stream worked'); return; }
      var step = plan[i++], tries = i, label = ch.name + ' · try ' + tries + ' (' + step.how + ') ';
      if (step.how === 'hls.js' && !hlsReady) { attempt(); return; }
      if (step.how === 'youtube') { el.innerHTML = streamHtml(step.s, muted); status(label + 'loading'); return; }
      el.innerHTML = '<video class="stream" autoplay playsinline' + (muted ? ' muted' : '') + '></video>';
      var v = el.querySelector('video'), playing = false, done = false;
      function fail(why) { if (done) return; done = true; clearTimeout(guard); status(label + why); setTimeout(attempt, 500); }
      var guard = setTimeout(function () { if (!playing) fail('timed out'); }, 8000);
      v.addEventListener('playing', function () { playing = true; clearTimeout(guard); status(label + 'playing'); });
      v.addEventListener('error', function () { fail('error ' + (v.error ? v.error.code : '?')); });
      if (step.how === 'hls.js') {
        var h = new window.Hls({ enableWorker: false, lowLatencyMode: false });
        activeHls = h;
        h.on(window.Hls.Events.ERROR, function (ev, d) { if (d && d.fatal) fail('error ' + d.type + '/' + d.details); });
        h.on(window.Hls.Events.MANIFEST_PARSED, function () { try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} });
        h.loadSource(step.s.url);
        h.attachMedia(v);
      } else {
        v.src = step.s.url;
        try { var p = v.play(); if (p && p.catch) p.catch(function (e) { if (e.name === 'NotSupportedError') fail('not supported'); }); } catch (e) {}
      }
      status(label + 'loading');
    }
    attempt();
    return true;
  }
  var previewTimer;
  function startPreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(function () {
      if (state.screen !== 'tv') return;
      var ch = currentChannel(), box = document.querySelector('.preview-stream');
      if (playInto(box, ch, true)) document.querySelector('.preview').className += ' playing';
    }, 900);
  }
  function currentChannel() { var c = channels()[state.category]; return c ? c.list[state.channel] : null; }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.innerHTML = esc(msg); t.className = 'show';
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.className = ''; }, 4000);
  }
  function channels() {
    var real = Platform.getChannels();
    if (real) return { 'All channels': { note: 'From this TV', list: real } };
    return C.channels;
  }

  // ---------- scaling: the layout is 1920 x 1080, scaled to whatever the screen is ----------
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.webkitTransform = stage.style.transform = 'scale(' + s + ')';
  }
  window.addEventListener('resize', fit);

  // ---------- pieces ----------
  function brand() { return '<div class="brand"><span class="brand-location">Koh Samui · Thailand</span><span class="brand-name">The Étienne</span></div>'; }
  function header() {
    return '<div class="page-header"><div class="back focusable" id="back" data-act="home"><span>←</span>Home</div>' + brand() +
      '<div class="clock"><span class="js-clock">' + clock() + '</span><small>Koh Samui</small></div></div>';
  }
  function title(kicker, text) { return '<div class="title-row"><p class="kicker">' + esc(kicker) + '</p><h1>' + esc(text) + '</h1></div>'; }

  // ---------- screens ----------
  var screens = {
    home: function () {
      var w = state.weather;
      var tiles = '';
      for (var i = 0; i < C.homeTiles.length; i++) {
        var t = C.homeTiles[i];
        tiles += '<div class="tile focusable" id="tile-' + i + '" data-act="go" data-arg="' + t.screen + '"><span class="tile-number">0' + (i + 1) + '</span>' +
          '<span><small>' + esc(t.eyebrow) + '</small><strong>' + esc(t.label) + '</strong></span><span class="tile-arrow">↗</span></div>';
      }
      return '<div class="screen home"><div class="hero"></div>' +
        '<div class="home-header">' + brand() + '<div class="weather"><span class="weather-temp">' + (w ? w.temp + '°' : '29°') + '</span><span><strong>' +
        (w ? weatherLabel(w.code) : 'Koh Samui') + '</strong><small class="js-date">' + longDate() + ' · ' + clock() + '</small></span></div></div>' +
        '<div class="welcome">' + welcomeHtml() + '</div>' +
        '<div class="tiles">' + tiles + '</div>' +
        '<div class="home-footer"><span>Villa assistance</span><span>' + esc(C.villaPhone) + '</span><span>Press Home on your remote to return here</span></div></div>';
    },

    tv: function () {
      var cats = channels(), names = [], k;
      for (k in cats) if (cats.hasOwnProperty(k)) names.push(k);
      if (!state.category || !cats[state.category]) state.category = names[0];
      var list = cats[state.category].list;
      if (state.channel >= list.length) state.channel = 0;
      var sel = list[state.channel];
      // Left: a sidebar menu of categories. Right: the channels in the chosen category, with a preview.
      var rail = '<div class="side rail">' + brand() + '<div class="side-title"><p class="kicker">Entertainment</p><h1>Live TV</h1></div>' +
        '<p class="side-label">Categories</p>';
      for (var i = 0; i < names.length; i++) {
        var c = cats[names[i]];
        rail += '<div class="cat focusable' + (names[i] === state.category ? ' active' : '') + '" id="cat-' + i + '" data-act="cat" data-arg="' + esc(names[i]) + '">' +
          '<span class="cat-copy"><strong>' + esc(names[i]) + '</strong><small>' + c.list.length + ' channels</small></span><span class="cat-arrow">›</span></div>';
      }
      rail += '<div class="side-foot"><div class="back home-btn focusable" id="back" data-act="home"><span>←</span>Back to home</div></div></div>';
      var rows = '<div class="channels">';
      for (var j = 0; j < list.length; j++) {
        var ch = list[j];
        rows += '<div class="channel focusable' + (j === state.channel ? ' selected' : '') + '" id="ch-' + j + '" data-act="channel" data-arg="' + j + '">' +
          '<span class="mark">' + esc(ch.short || '') + '</span><span class="channel-copy"><strong>' + esc(ch.name) + '</strong><small>' + esc(ch.detail || '') + '</small></span><span class="play">' + (ch.streams ? '▶' : '') + '</span></div>';
      }
      rows += '</div>';
      var now = '<div class="now"><div class="preview preview-static">' + (sel.streams ? '<span class="live">Live</span>' : '') +
        (sel.logo ? '<img class="preview-logo" src="' + esc(sel.logo) + '" alt="">' : '<span class="preview-mark">' + esc(sel.short || '') + '</span>') + '</div>' +
        '<p class="kicker">Now selected</p><h2>' + esc(sel.name) + '</h2><p class="now-detail">' + esc(sel.detail || '') + '</p>' +
        '<div class="button focusable" id="watch" data-act="watch">' + (sel.streams ? 'Watch channel' : 'Coming soon') + ' <span>→</span></div></div>';
      var main = '<div class="tv-main"><div class="tv-top"><div><p class="kicker">' + esc(cats[state.category].note) + '</p><h2 class="cat-title">' + esc(state.category) +
        '</h2></div><div class="clock"><span class="js-clock">' + clock() + '</span><small>Koh Samui</small></div></div>' +
        '<div class="tv-content">' + rows + now + '</div>' +
        '<p class="tv-hint"><span class="kbd">◀ ▶</span>Switch between menu and channels<span class="kbd">OK</span>Watch<span class="kbd">BACK</span>Home</p></div>';
      return '<div class="screen tvx tv-body">' + rail + main + '</div>';
    },

    streaming: function () {
      var cards = '';
      for (var i = 0; i < C.apps.length; i++) {
        var a = C.apps[i];
        cards += '<div class="card focusable" id="app-' + i + '" data-act="app" data-arg="' + i + '">' + (a.logo ? '<img class="app-logo" src="' + C.assetBase + a.logo + '" alt="">' : '<span class="app-logo-text">' + esc(a.name) + '</span>') + '<i>↗</i>' +
          '<span><small>' + esc(a.eyebrow) + '</small><strong>' + esc(a.name) + '</strong></span></div>';
      }
      return '<div class="screen page">' + header() + title('Watch your way', 'Streaming') +
        '<div class="cards">' + cards + '</div><p class="hint">Sign in with your own account. Press Home on your remote to come back to The Étienne.</p></div>';
    },

    music: function () {
      var cards = '';
      for (var i = 0; i < C.music.length; i++) {
        var m = C.music[i];
        cards += '<div class="card music-card focusable" id="music-' + i + '" data-act="playlist" data-arg="' + i + '">' +
          '<span class="music-no">0' + (i + 1) + '</span><i>' + (m.spotify ? '▶' : '') + '</i>' +
          '<span><small>' + esc(m.eyebrow) + '</small><strong>' + esc(m.name) + '</strong><p class="card-desc">' + esc(m.description || '') + '</p>' +
          (m.spotify ? '' : '<em class="soon">Coming soon</em>') + '</span></div>';
      }
      cards += '<div class="card music-card own-card focusable" id="music-own" data-act="go" data-arg="ownmusic"><span class="own-icon">♪</span><i>→</i>' +
        '<span><small>From your phone</small><strong>Play your own music</strong><p class="card-desc">Spotify, Apple Music or anything on your phone.</p></span></div>';
      return '<div class="screen page">' + header() + title('Set the mood', 'Music') + '<div class="cards music-cards">' + cards + '</div>' +
        '<p class="tv-hint"><span class="kbd">OK</span>Play<span class="kbd">BACK</span>Home</p></div>';
    },

    ownmusic: function () {
      return '<div class="screen page">' + header() + title('From your phone', 'Play your own music') +
        '<div class="share"><div class="share-col"><span class="device">S</span><h2>Spotify</h2><ol>' +
        '<li>Join the villa Wi-Fi.</li><li>On this TV, open <b>Streaming</b>, then <b>Spotify</b>.</li>' +
        '<li>On your phone, open Spotify and start a song.</li><li>Tap the <b>speaker icon</b> at the bottom of the screen.</li>' +
        '<li>Choose <b class="room-name">' + esc(C.roomName) + '</b>.</li></ol></div>' +
        '<div class="share-col"><span class="device">iOS</span><h2>Apple Music &amp; others</h2><ol>' +
        '<li>Join the villa Wi-Fi.</li><li>Start playing on your iPhone or iPad.</li><li>Tap the <b>AirPlay icon</b>.</li>' +
        '<li>Choose <b class="room-name">' + esc(C.roomName) + '</b>.</li></ol></div></div>' +
        '<p class="tv-hint"><span class="kbd">BACK</span>Music</p></div>';
    },

    player: function () {
      var ch = currentChannel();
      return '<div class="screen player"><div class="player-stream"></div><div class="player-banner"><span class="mark">' + esc(ch.short || '') + '</span>' +
        '<span><strong>' + esc(ch.name) + '</strong><small>' + esc(ch.detail || '') + ' · Up / Down to change channel · Back for the guide</small></span></div></div>';
    },

    // Villa Guide: the Guest Guide as text. Left: its sections. Right: the section, scrolled with Right then Up / Down.
    guide: function () {
      var secs = C.guide, n = state.gsec || 0, sec = secs[n], i, b, h = '';
      var rail = '<div class="side rail">' + brand() + '<div class="side-title"><p class="kicker">At home</p><h1>Villa Guide</h1></div>' +
        '<div class="gs-rail" id="gs-rail">';
      for (i = 0; i < secs.length; i++)
        rail += '<div class="gs-item focusable' + (i === n ? ' active' : '') + '" id="gs-' + i + '" data-act="menu" data-arg="' + i + '">' + esc(secs[i].name) + '</div>';
      rail += '</div><div class="side-foot"><div class="back home-btn focusable" id="back" data-act="home"><span>←</span>Back to home</div></div></div>';
      for (i = 0; i < sec.blocks.length; i++) {
        b = sec.blocks[i];
        if (b[0] === 'p') h += '<p class="gd-p">' + guideText(b[1]) + '</p>';
        else if (b[0] === 'sub') h += '<p class="dn-section gd-sub">' + guideText(b[1]) + '</p>';
        else if (b[0] === 'sign') h += '<p class="gd-sign">' + guideText(b[1]) + '<span>The Étienne</span></p>';
        else if (b[0] === 'ul') { h += '<ul class="gd-ul">'; for (var j = 0; j < b[1].length; j++) h += '<li>' + guideText(b[1][j]) + '</li>'; h += '</ul>'; }
        else if (b[0] === 'pairs') { h += '<div class="gd-pairs">'; for (var k = 0; k < b[1].length; k++) h += '<div class="gd-pair"><strong>' + guideText(b[1][k][0]) + '</strong><span>' + guideText(b[1][k][1]) + '</span></div>'; h += '</div>'; }
      }
      var main = '<div class="tv-main"><div class="dn-top gd-top"><div class="dn-heading"><p class="kicker">Villa Guide</p><h2 class="dn-title">' + esc(sec.title) + '</h2></div></div>' +
        '<div class="dn-wrap"><div class="dn-body" id="menu-list" data-act="list"><div class="gd-col">' + h + '</div></div><p class="dn-more" id="dn-more"></p></div></div>';
      return '<div class="screen tvx tv-body dining guide">' + rail + main + '</div>';
    },
    // Dining & Experiences: the Menu Manager's menus, live. Left: the three menus. Right: the menu as a printed card.
    // The items are text only. When a menu is longer than the screen, Right moves into it and Up / Down scroll it.
    dining: function () {
      var menus = C.dining, m = findMenu(state.menu) || menus[0], i;
      state.menu = m.key;
      var rail = '<div class="side rail">' + brand() + '<div class="side-title"><p class="kicker">At your service</p><h1>Dining &amp; Experiences</h1></div>' +
        '<p class="side-label">Menus</p>';
      for (i = 0; i < menus.length; i++)
        rail += '<div class="cat focusable' + (menus[i].key === m.key ? ' active' : '') + '" id="menu-' + i + '" data-act="menu" data-arg="' + menus[i].key + '">' +
          '<span class="cat-copy"><strong>' + esc(menus[i].name) + '</strong><small>' + esc(menus[i].eyebrow) + '</small></span><span class="cat-arrow">›</span></div>';
      rail += '<div class="side-foot"><div class="back home-btn focusable" id="back" data-act="home"><span>←</span>Back to home</div></div></div>';
      var body;
      if (!state.menuItems) body = '<p class="dn-empty">' + (state.menuError ? 'The menu can’t be loaded right now. Scan the code to view it on your phone.' : 'Loading the menu…') + '</p>';
      else {
        var groups = menuSections(m);
        if (!groups.length) body = '<p class="dn-empty">This menu is being prepared. Please ask your Villa Host.</p>';
        else if (m.key === 'experiences') body = null;
        else body = '<div class="dn-col">' + menuColumn(groups) + '</div>';
      }
      var main = '<div class="tv-main"><div class="dn-top"><div class="dn-heading"><p class="kicker">' + esc(m.eyebrow) + '</p><h2 class="dn-title">' + esc(m.name) +
        '</h2><p class="dn-desc">' + esc(m.description) + '</p></div><div class="dn-qr"><img src="' + qr(m.url) + '" alt=""><p>' + esc(m.qrLabel) + '</p></div></div>' +
        (body === null ? expCards(menuSections(m)) :
        '<div class="dn-wrap"><div class="dn-body" id="menu-list" data-act="list">' + body + '</div><p class="dn-more" id="dn-more"></p></div>') +
        '<p class="dn-tax">' + esc(C.menuTaxNote) + '</p></div>';
      return '<div class="screen tvx tv-body dining">' + rail + main + '</div>';
    },

    share: function () {
      return '<div class="screen page">' + header() + title('From your device', 'Share your screen') +
        '<div class="share"><div class="share-col"><span class="device">iOS</span><h2>iPhone &amp; iPad</h2><ol>' +
        '<li>Join the villa Wi-Fi.</li><li>Open <b>Control Centre</b>.</li><li>Tap <b>Screen Mirroring</b>.</li>' +
        '<li>Choose <b class="room-name">' + esc(C.roomName) + '</b>.</li><li>Enter the code shown on the TV, if asked.</li></ol></div>' +
        '<div class="share-col"><span class="device">A</span><h2>Android</h2><ol>' +
        '<li>Join the villa Wi-Fi.</li><li>Open <b>Cast</b>, <b>Smart View</b> or <b>Screen Share</b>.</li>' +
        '<li>Choose <b class="room-name">' + esc(C.roomName) + '</b>.</li><li>Accept on the TV, if asked.</li></ol></div></div>' +
        '<p class="hint">When you stop sharing, the TV comes back to this screen.</p></div>';
    }
  };

  // ---------- dining menus (live from ops.theetienne.com) ----------
  // The serif used on the phone menus at order.theetienne.com. If it can't load, Georgia is used.
  (function () {
    var l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css?family=Cormorant+Garamond:300,400,500,300i,400i&display=swap';
    document.getElementsByTagName('head')[0].appendChild(l);
  })();
  function findMenu(key) { for (var i = 0; i < C.dining.length; i++) if (C.dining[i].key === key) return C.dining[i]; return null; }
  // The rows on one menu, the same rule as the phone: the menu's own items, and for The Cellar also the
  // mini bar's soft drinks ticked "show in Cellar".
  function menuItems(m) {
    var out = [], all = state.menuItems || [];
    for (var i = 0; i < all.length; i++) {
      var it = all[i];
      if (it.category === m.key || (m.key === 'wine' && it.category === 'minibar' && it.show_in_cellar === true)) out.push(it);
    }
    return out;
  }
  // Items grouped under the menu's sections, in order. An item with no section, or one that isn't on this
  // menu, goes under the first section, as on the phone. Empty sections are left out.
  function menuSections(m) {
    var items = menuItems(m), secs = m.sections, bucket = {}, i;
    for (i = 0; i < secs.length; i++) bucket[secs[i][0]] = [];
    for (i = 0; i < items.length; i++) (bucket[items[i].subcategory] || bucket[secs[0][0]]).push(items[i]);
    var out = [];
    for (i = 0; i < secs.length; i++) if (bucket[secs[i][0]].length) out.push([secs[i][1], bucket[secs[i][0]]]);
    return out;
  }
  // 1273 -> "฿1,273". Satang are shown only when a price has them.
  function baht(n) {
    var v = Math.round((parseFloat(n) || 0) * 100) / 100, whole = Math.floor(v), dec = Math.round((v - whole) * 100);
    return '฿' + String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (dec ? '.' + (dec < 10 ? '0' : '') + dec : '');
  }
  // Reads every active menu row in one request. Checked when Dining opens and every 2 minutes while it is open,
  // so a price change or a bottle running out in ops shows here too.
  function loadMenus() {
    var x = new XMLHttpRequest();
    x.open('GET', C.supabaseUrl + '/rest/v1/menu_items?select=id,name,description,price,category,subcategory,in_stock,show_in_cellar,sort_order,image_url' +
      '&active=eq.true&order=sort_order.asc,name.asc');
    x.setRequestHeader('apikey', C.supabaseKey);
    x.setRequestHeader('Authorization', 'Bearer ' + C.supabaseKey);
    x.onload = function () {
      var rows = null;
      if (x.status === 200) { try { rows = JSON.parse(x.responseText); } catch (e) {} }
      if (rows && rows.length !== undefined) { state.menuItems = rows; state.menuError = false; }
      else if (!state.menuItems) state.menuError = true;
      redrawDining();
    };
    x.onerror = function () { if (!state.menuItems) { state.menuError = true; redrawDining(); } };
    x.send();
  }
  function redrawDining() {
    if (state.screen !== 'dining' || state.staff) return;
    var keep = focused && focused.id, sc = document.getElementById('menu-list'), top = sc ? sc.scrollTop : 0;
    render('dining', keep);
    sc = document.getElementById('menu-list'); if (sc && top) sc.scrollTop = top;
    moreCue();
  }
  setInterval(function () { if (state.screen === 'dining') loadMenus(); }, 2 * 60000);
  // One menu row: name and price, with the description underneath.
  function menuRow(it) {
    var out = it.in_stock === false;
    return '<div class="dn-item' + (out ? ' out' : '') + '"><strong>' + esc(it.name) + '</strong><small>' + esc(it.description || '') + '</small>' +
      '<span class="dn-price">' + (out ? 'Unavailable' : baht(it.price)) + '</span></div>';
  }
  function menuColumn(groups) {
    var html = '', g, j;
    for (g = 0; g < groups.length; g++) {
      html += '<p class="dn-section">' + esc(groups[g][0]) + '</p>';
      for (j = 0; j < groups[g][1].length; j++) html += menuRow(groups[g][1][j]);
    }
    return html;
  }
  // Experiences as picture cards in a row, browsed with Left / Right. The photo is the item's image_url in the
  // Menu Manager; a path such as /img/x.jpg is served from ops.theetienne.com. With no photo the card shows its section.
  function expImage(u) { return !u ? '' : /^https?:/.test(u) ? u : 'https://ops.theetienne.com' + (u.charAt(0) === '/' ? '' : '/') + u; }
  // Photos in web/img are served from GitHub Pages alongside app.js.
  function photoUrl(p) { return !p ? '' : /^https?:/.test(p) ? p : C.assetBase + p; }
  function stockPhoto(label) {
    var secs = findMenu('experiences').sections;
    for (var i = 0; i < secs.length; i++) if (secs[i][1] === label) return photoUrl((C.experiencePhotos || {})[secs[i][0]]);
    return '';
  }
  function expCards(groups) {
    var html = '', n = 0, g, j;
    for (g = 0; g < groups.length; g++) for (j = 0; j < groups[g][1].length; j++) {
      var it = groups[g][1][j], out = it.in_stock === false, img = expImage(it.image_url) || stockPhoto(groups[g][0]);
      html += '<div class="ex-card focusable' + (out ? ' out' : '') + '" id="ex-' + (n++) + '" data-act="exp">' +
        '<div class="ex-img"' + (img ? ' style="background-image:url(\'' + img.replace(/'/g, '%27') + '\')"' : '') + '>' + (img ? '' : '<span>' + esc(groups[g][0]) + '</span>') + '</div>' +
        '<div class="ex-copy"><p class="ex-eyebrow">' + esc(groups[g][0]) + '</p><strong>' + esc(it.name) + '</strong>' +
        (it.description ? '<small>' + esc(it.description) + '</small>' : '') +
        '<span class="ex-price">' + (out ? 'Unavailable' : baht(it.price)) + '</span></div></div>';
    }
    return '<div class="ex-wrap"><div class="ex-track" id="ex-track">' + html + '</div>' +
      (n > 3 ? '<p class="dn-more show ex-hint"><span class="kbd">◀ ▶</span>Browse</p>' : '') + '</div>';
  }
  // Keeps the focused card in view. offsetLeft is used because the whole stage is scaled.
  function scrollCards(el) {
    var t = document.getElementById('ex-track');
    if (!t || el.parentNode !== t) return;
    var left = el.offsetLeft, right = left + el.offsetWidth;
    // The track is padded 24px on the left and 90px on the right, so a card lines up with the page margins.
    if (el.id === 'ex-0') t.scrollLeft = 0;
    else if (left - 24 < t.scrollLeft) t.scrollLeft = left - 24;
    else if (right + 90 > t.scrollLeft + t.clientWidth) t.scrollLeft = right + 90 - t.clientWidth;
  }
  // Down and Up move a long menu by most of a screen. Returns true when it scrolled.
  function scrollMenu(dir) {
    var list = document.getElementById('menu-list');
    if (!list) return false;
    var max = list.scrollHeight - list.clientHeight, step = Math.round(list.clientHeight * 0.7);
    if (dir === 'down' && list.scrollTop < max - 2) { list.scrollTop = Math.min(max, list.scrollTop + step); moreCue(); return true; }
    if (dir === 'up' && list.scrollTop > 0) { list.scrollTop = Math.max(0, list.scrollTop - step); moreCue(); return true; }
    return false;
  }
  // The cue under a long menu, and whether the menu can take the focus. A menu that fits can't be entered.
  function moreCue() {
    var list = document.getElementById('menu-list'), cue = document.getElementById('dn-more');
    if (!list || !cue) return;
    var long = list.scrollHeight > list.clientHeight + 2, below = list.scrollTop < list.scrollHeight - list.clientHeight - 2;
    list.className = 'dn-body' + (long ? ' focusable' : '') + (focused === list ? ' focused' : '');
    var inList = focused === list;
    cue.className = 'dn-more' + (long ? ' show' : '') + (below ? ' fade' : '');
    cue.innerHTML = !long ? '' : inList ? '<span class="kbd">▲ ▼</span>Scroll<span class="kbd">◀</span>Menus' : '<span class="kbd">▶</span>' + (state.screen === 'guide' ? 'Read more' : 'See the full menu');
  }

  // Guide text: escaped, with {phone} replaced by the villa's number.
  function guideText(t) { return esc(t).replace(/\{phone\}/g, esc(C.villaPhone)); }
  // The sidebar entry for the menu or guide section on screen.
  function railActive() {
    if (state.screen === 'guide') return document.getElementById('gs-' + (state.gsec || 0));
    for (var q = 0; q < C.dining.length; q++) if (C.dining[q].key === state.menu) return document.getElementById('menu-' + q);
    return null;
  }
  // Keeps the focused guide section inside the scrolling sidebar list.
  function scrollRail(el) {
    var r = document.getElementById('gs-rail');
    if (!r || el.parentNode !== r) return;
    var top = el.offsetTop, bottom = top + el.offsetHeight;
    if (top < r.scrollTop) r.scrollTop = top;
    else if (bottom > r.scrollTop + r.clientHeight) r.scrollTop = bottom - r.clientHeight;
  }

  function qrPage(p) {
    var cards = '';
    for (var i = 0; i < p.items.length; i++) {
      var it = p.items[i];
      cards += '<div class="card card-qr focusable" id="qr-' + i + '"><img src="' + qr(it.url) + '" alt=""><span><small>' + esc(it.eyebrow) + '</small><strong>' + esc(it.name) + '</strong><p>' + esc(it.description) + '</p></span></div>';
    }
    return '<div class="screen page">' + header() + title(p.kicker, p.title) +
      '<div class="cards' + (p.items.length === 1 ? ' cards-1' : '') + '">' + cards + '</div><p class="page-note">' + esc(p.note) + '</p></div>';
  }

  // ---------- rendering and focus ----------
  var focused = null;
  function render(screen, focusId) {
    if (screen !== state.screen) document.getElementById('toast').className = '';
    stopHls();
    state.screen = screen;
    app.innerHTML = screens[screen]();
    if (state.staff) app.innerHTML += staffHtml();
    var el = focusId && document.getElementById(focusId);
    if (screen !== 'player') focus(el || first());
    if (state.staff && state.staff.ok) Platform.helperStatus(function (m) { var h = document.getElementById('helper-status'); if (h) h.innerHTML = esc(m); });
  }
  function scope() { return state.staff ? app.querySelector('.overlay') : app; }
  function first() {
    var s = scope(), pick = s.querySelector('.tile, .channel.selected, .card, .key, .cat');
    return pick || s.querySelector('.focusable');
  }
  function focus(el) {
    if (!el) return;
    if (focused) focused.className = focused.className.replace(/\s?focused/g, '');
    focused = el; el.className += ' focused';
    // Live TV: brighten the column you're in and dim the other one.
    var body = document.querySelector('.tv-body');
    if (body) {
      var act0 = el.getAttribute('data-act');
      body.setAttribute('data-col', act0 === 'cat' || act0 === 'menu' || act0 === 'home' ? 'cats' : 'channels');
    }
    // Live TV: moving onto a channel updates "Now selected"; onto a category switches the list.
    if (state.screen === 'tv' && !state.staff) {
      var act = el.getAttribute('data-act');
      if (act === 'channel' && +el.getAttribute('data-arg') !== state.channel) { state.channel = +el.getAttribute('data-arg'); render('tv', el.id); }
      else if (act === 'cat' && el.getAttribute('data-arg') !== state.category) { state.category = el.getAttribute('data-arg'); state.channel = 0; render('tv', el.id); }
    }
    // Dining: moving onto a menu shows it; moving through the items keeps the focused one in view.
    if (state.screen === 'guide' && !state.staff && el.getAttribute('data-act') === 'menu') {
      if (+el.getAttribute('data-arg') !== (state.gsec || 0)) {
        var keepTop = document.getElementById('gs-rail').scrollTop;
        state.gsec = +el.getAttribute('data-arg'); render('guide', el.id);
        document.getElementById('gs-rail').scrollTop = keepTop; scrollRail(focused); return;
      }
      scrollRail(el);
    }
    if ((state.screen === 'dining' || state.screen === 'guide') && !state.staff) {
      if (state.screen === 'dining' && el.getAttribute('data-act') === 'menu' && el.getAttribute('data-arg') !== state.menu) { state.menu = el.getAttribute('data-arg'); render('dining', el.id); return; }
      if (el.getAttribute('data-act') === 'exp') scrollCards(el);
      moreCue();
    }
  }
  function centre(r) { return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function move(dir) {
    if (!focused) { focus(first()); return; }
    if (dir === 'right' && focused.getAttribute('data-act') === 'cat') { var c0 = document.getElementById('ch-0'); if (c0) { focus(c0); return true; } }
    // Dining: Right from a menu goes into a long menu; inside it Up / Down scroll and Left goes back to the menu.
    if ((state.screen === 'dining' || state.screen === 'guide') && !state.staff) {
      var lst = document.getElementById('menu-list');
      if (focused === lst) {
        if (dir === 'up' || dir === 'down') { scrollMenu(dir); return true; }
        if (dir === 'left') focus(railActive());
        return true;
      }
      if (dir === 'right' && focused.getAttribute('data-act') === 'menu') {
        var ex0 = document.getElementById('ex-0');
        if (ex0) focus(ex0); else if (lst && /focusable/.test(lst.className)) focus(lst);
        return true;
      }
      if (focused.getAttribute('data-act') === 'exp') {
        if (dir === 'up' || dir === 'down') return true;
        if (dir === 'left' && focused.id === 'ex-0') { focus(railActive()); return true; }
        if (dir === 'right' || dir === 'left') { var nx = document.getElementById('ex-' + (+focused.id.slice(3) + (dir === 'right' ? 1 : -1))); if (nx) focus(nx); return true; }
      }
    }
    var from = focused.getBoundingClientRect(), a = centre(from);
    var els = scope().querySelectorAll('.focusable'), best = null, bestScore = Infinity;
    for (var i = 0; i < els.length; i++) {
      var el = els[i]; if (el === focused) continue;
      var r = el.getBoundingClientRect(), b = centre(r), dx = b.x - a.x, dy = b.y - a.y, main, side;
      if (dir === 'left') { if (r.right > from.left + 2) continue; main = -dx; side = Math.abs(dy); }
      else if (dir === 'right') { if (r.left < from.right - 2) continue; main = dx; side = Math.abs(dy); }
      else if (dir === 'up') { if (r.bottom > from.top + 2) continue; main = -dy; side = Math.abs(dx); }
      else { if (r.top < from.bottom - 2) continue; main = dy; side = Math.abs(dx); }
      var score = main + side * 2.5;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    if (best) focus(best);
    return !!best;
  }

  // ---------- actions ----------
  function findApp(key) { for (var i = 0; i < C.apps.length; i++) if (C.apps[i].key === key) return C.apps[i]; return null; }
  function openApp(a) {
    if (!a) return;
    Platform.launchApp(a, function (ok, why) { if (!ok) toast(a.name + ' couldn’t open (' + (why || 'unknown') + ')'); });
  }
  function activate(el) {
    if (!el) return;
    var act = el.getAttribute('data-act'), arg = el.getAttribute('data-arg');
    if (act === 'go') { state.channel = 0; if (arg === 'dining') { state.menu = null; render('dining', 'menu-0'); loadMenus(); } else if (arg === 'guide') { state.gsec = 0; render('guide', 'gs-0'); } else render(arg); }
    else if (act === 'home') render('home', 'tile-' + indexOfTile(state.screen));
    else if (act === 'cat') render('tv', 'ch-0');
    else if (act === 'channel' || act === 'watch') {
      var ch = currentChannel();
      if (ch && ch.streams) openPlayer();
      else Platform.watchLiveTv(ch, function (ok) { if (!ok) toast(ch.name + ' is coming soon.'); });
    }
    else if (act === 'app') openApp(C.apps[+arg]);
    else if (act === 'spotify') openApp(findApp('spotify'));
    else if (act === 'playlist') {
      var pl = C.music[+arg];
      if (!pl.spotify) { toast(pl.name + ' is coming soon.'); return; }
      Platform.openSpotify(findApp('spotify'), pl.spotify, function (ok, why) { if (!ok) toast('Spotify couldn’t open (' + (why || 'unknown') + ')'); });
    }
    else if (act === 'menu') { var l = document.getElementById('ex-0') || document.getElementById('menu-list'); if (l && (l.id === 'ex-0' || /focusable/.test(l.className))) focus(l); }
    else if (act === 'pin') pinKey(arg);
    else if (act === 'staff') staffAction(arg);
  }
  var bannerTimer;
  function openPlayer() {
    render('player');
    playInto(document.querySelector('.player-stream'), currentChannel(), false);
    var b = document.querySelector('.player-banner');
    clearTimeout(bannerTimer); bannerTimer = setTimeout(function () { if (b) b.className += ' hide'; }, 5000);
  }
  // Up / Down in full screen: next or previous channel that has a stream, across all categories.
  function zap(step) {
    var cats = channels(), flat = [], k, i;
    for (k in cats) if (cats.hasOwnProperty(k)) for (i = 0; i < cats[k].list.length; i++) if (cats[k].list[i].streams) flat.push([k, i]);
    for (i = 0; i < flat.length; i++) if (flat[i][0] === state.category && flat[i][1] === state.channel) break;
    var n = flat[(i + step + flat.length) % flat.length];
    state.category = n[0]; state.channel = n[1];
    openPlayer();
  }
  function indexOfTile(screen) { for (var i = 0; i < C.homeTiles.length; i++) if (C.homeTiles[i].screen === screen) return i; return 0; }
  function back() {
    if (state.staff) { state.staff = null; render(state.screen); return; }
    if (state.screen === 'player') { render('tv', 'ch-' + state.channel); return; }
    if (state.screen === 'ownmusic') { render('music', 'music-own'); return; }
    if (state.screen !== 'home') activate(document.getElementById('back'));
    else openStaff(true);
  }

  // ---------- staff menu: Red button, or Up five times on the home screen ----------
  function openStaff(exiting) { state.staff = { pin: '', exiting: !!exiting }; render(state.screen); }
  // Leaving the villa screen needs the staff PIN: Back on the home screen opens it (see back()).
  var allowExit = false, lastBackKey = 0;
  function staffHtml() {
    var s = state.staff, html = '<div class="overlay"><div class="panel' + (s.apps ? ' wide' : '') + '">';
    if (!s.ok) {
      html += '<p class="kicker">Staff only</p><h2>' + (s.exiting ? 'Enter PIN to exit' : 'Enter PIN') + '</h2><div class="pin">' + new Array(s.pin.length + 1).join('•') + '</div><div class="keypad">';
      var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'OK'];
      for (var i = 0; i < keys.length; i++) html += '<div class="key focusable" id="key-' + keys[i] + '" data-act="pin" data-arg="' + keys[i] + '">' + keys[i] + '</div>';
      html += '</div>';
    } else {
      html += '<p class="kicker">Staff only</p><h2>Villa TV</h2><p class="muted">Platform: ' + Platform.kind + ' · Helper: <span id="helper-status">checking</span></p>';
      if (s.apps) {
        var all = s.apps.split('\n'), per = 44, pages = Math.max(1, Math.ceil(all.length / per)), pg = s.page || 0;
        html += '<p class="muted">Installed apps · page ' + (pg + 1) + ' of ' + pages + '</p><div class="app-list">' +
          esc(all.slice(pg * per, pg * per + per).join('\n')).replace(/\n/g, '<br>') + '</div>';
      }
      if (Platform.canLock()) {
        html += '<div class="button focusable" id="st-reset" data-act="staff" data-arg="reset">Reset for next guest <span>→</span></div>' +
          '<div class="button focusable" id="st-settings" data-act="staff" data-arg="settings">Open TV settings <span>→</span></div>';
      } else {
        html += '<p class="muted">Settings lock and guest reset only work on the Sony (Google TV) version.</p>';
      }
      if (Platform.kind === 'tizenbrew') html += '<div class="button focusable" id="st-apps" data-act="staff" data-arg="apps">' + (s.apps ? 'Next page of apps' : 'Show installed apps') + ' <span>→</span></div>';
      html += '<div class="button focusable" id="st-exit" data-act="staff" data-arg="exit">Exit to the TV menu <span>→</span></div>';
      html += '<div class="button focusable" id="st-close" data-act="staff" data-arg="close">Close <span>→</span></div>';
    }
    return html + '</div></div>';
  }
  function pinKey(k) {
    var s = state.staff;
    if (k === 'Clear') s.pin = '';
    else if (k === 'OK') { if (s.pin === String(C.staffPin)) s.ok = true; else { s.pin = ''; toast('Wrong PIN'); } }
    else if (s.pin.length < 8) {
      s.pin += k;
      // The full PIN unlocks straight away, no need to press OK.
      if (s.pin === String(C.staffPin)) s.ok = true;
    }
    render(state.screen, s.ok ? null : 'key-' + k);
  }
  function staffAction(a) {
    if (a === 'close') { state.staff = null; render(state.screen); }
    else if (a === 'exit') { allowExit = true; Platform.exitApp(); try { history.back(); } catch (e) {} }
    else if (a === 'reset') toast(Platform.resetForNextGuest());
    else if (a === 'settings') Platform.openSettings();
    else if (a === 'apps') {
      if (state.staff.apps) {
        var total = Math.ceil(state.staff.apps.split('\n').length / 44);
        state.staff.page = ((state.staff.page || 0) + 1) % total; render(state.screen, 'st-apps'); return;
      }
      Platform.listApps(function (list, msg) { state.staff.apps = list ? list.join('\n') : ('Could not list apps: ' + msg); state.staff.page = 0; render(state.screen, 'st-apps'); });
    }
  }

  // ---------- remote ----------
  // Catch Back before anything else on the page (or TizenBrew) can act on it.
  window.addEventListener('keydown', function (e) {
    if (Platform.keys.back.indexOf(e.keyCode) !== -1) lastBackKey = new Date().getTime();
    if (Platform.keys.back.indexOf(e.keyCode) !== -1) e.preventDefault();
  }, true);
  document.addEventListener('keydown', function (e) {
    var k = e.keyCode, K = Platform.keys;
    if (k === 403) { openStaff(); e.preventDefault(); return; }
    // Number buttons on the remote type straight into the PIN box.
    if (state.staff && !state.staff.ok && ((k >= 48 && k <= 57) || (k >= 96 && k <= 105))) {
      pinKey(String(k >= 96 ? k - 96 : k - 48)); e.preventDefault(); return;
    }
    if (k === K.up && state.screen === 'home' && !state.staff) {
      if (!move('up')) { state.upCount++; if (state.upCount >= 5) { state.upCount = 0; openStaff(); } }
      e.preventDefault(); return;
    }
    state.upCount = 0;
    if (state.screen === 'player' && !state.staff) {
      if (k === K.up || k === 427) zap(-1);
      else if (k === K.down || k === 428) zap(1);
      else if (K.back.indexOf(k) !== -1) back();
      else if (k === K.enter) { var b = document.querySelector('.player-banner'); if (b) b.className = 'player-banner'; }
      else return;
      e.preventDefault(); return;
    }
    if (k === K.left) move('left');
    else if (k === K.right) move('right');
    else if (k === K.up) move('up');
    else if (k === K.down) move('down');
    else if (k === K.enter) activate(focused);
    else if (K.back.indexOf(k) !== -1) back();
    else return;
    e.preventDefault();
  });
  app.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== app && !/\bfocusable\b/.test(el.className || '')) el = el.parentNode;
    if (el && el !== app) { focus(el); activate(el); }
  });

  // ---------- clock and weather ----------
  setInterval(function () {
    var els = document.querySelectorAll('.js-clock');
    for (var i = 0; i < els.length; i++) els[i].innerHTML = clock();
    var d = document.querySelector('.js-date'); if (d) d.innerHTML = longDate() + ' · ' + clock();
  }, 15000);
  // Current guest's surname from ops.theetienne.com. Checked at start, every 5 minutes and
  // whenever the TV comes back to this screen. If it can't be reached, the last answer stays.
  function loadGuest() {
    var x = new XMLHttpRequest();
    x.open('POST', C.supabaseUrl + '/rest/v1/rpc/get_tv_greeting');
    x.setRequestHeader('apikey', C.supabaseKey);
    x.setRequestHeader('Authorization', 'Bearer ' + C.supabaseKey);
    x.setRequestHeader('Content-Type', 'application/json');
    x.onload = function () {
      if (x.status !== 200) return;
      var s = null;
      try { s = JSON.parse(x.responseText); } catch (e) { return; }
      s = (typeof s === 'string' && s) ? s : null;
      if (s !== state.surname) {
        state.surname = s;
        if (state.screen === 'home' && !state.staff) render('home', focused && focused.id);
      }
    };
    x.send('{}');
  }

  function loadWeather() {
    var x = new XMLHttpRequest();
    x.open('GET', 'https://api.open-meteo.com/v1/forecast?latitude=' + C.weather.lat + '&longitude=' + C.weather.lon + '&current=temperature_2m,weather_code&timezone=Asia%2FBangkok');
    x.onload = function () {
      try { var c = JSON.parse(x.responseText).current; state.weather = { temp: Math.round(c.temperature_2m), code: c.weather_code }; if (state.screen === 'home' && !state.staff) render('home', focused && focused.id); } catch (e) {}
    };
    x.send();
  }

  // When the TV comes back to this app (after Netflix, mirroring or live TV), start on the home screen.
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !state.staff) { render('home'); loadGuest(); } });

  Platform.registerKeys();
  fit();
  render('home');
  loadWeather();
  setInterval(loadWeather, 30 * 60000);
  loadGuest();
  setInterval(loadGuest, 5 * 60000);
})();
