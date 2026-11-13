/* The Étienne TV: screens, remote navigation and the staff menu. Plain ES5 for older TV browsers. */
(function () {
  var C = ETIENNE_CONFIG;
  var app = document.getElementById('app');
  var stage = document.getElementById('stage');
  var state = { surname: null, screen: 'home', category: null, channel: 0, weather: null, upCount: 0, staff: null };
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
        cards += '<div class="card focusable" id="app-' + i + '" data-act="app" data-arg="' + i + '"><span class="logo">' + esc(a.name) + '</span><i>↗</i>' +
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

    guide: function () { return qrPage(C.qrPages.guide); },
    dining: function () { return qrPage(C.qrPages.dining); },

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
      body.setAttribute('data-col', act0 === 'cat' || act0 === 'home' ? 'cats' : 'channels');
    }
    // Live TV: moving onto a channel updates "Now selected"; onto a category switches the list.
    if (state.screen === 'tv' && !state.staff) {
      var act = el.getAttribute('data-act');
      if (act === 'channel' && +el.getAttribute('data-arg') !== state.channel) { state.channel = +el.getAttribute('data-arg'); render('tv', el.id); }
      else if (act === 'cat' && el.getAttribute('data-arg') !== state.category) { state.category = el.getAttribute('data-arg'); state.channel = 0; render('tv', el.id); }
    }
  }
  function centre(r) { return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function move(dir) {
    if (!focused) { focus(first()); return; }
    if (dir === 'right' && focused.getAttribute('data-act') === 'cat') { var c0 = document.getElementById('ch-0'); if (c0) { focus(c0); return true; } }
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
    if (act === 'go') { state.channel = 0; render(arg); }
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
