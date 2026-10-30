/* The Étienne TV: screens, remote navigation and the staff menu. Plain ES5 for older TV browsers. */
(function () {
  var C = ETIENNE_CONFIG;
  var app = document.getElementById('app');
  var stage = document.getElementById('stage');
  var state = { screen: 'home', category: null, channel: 0, weather: null, upCount: 0, staff: null };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // ---------- helpers ----------
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function samuiNow() { var d = new Date(); return new Date(d.getTime() + d.getTimezoneOffset() * 60000 + 7 * 3600000); }
  function clock() { var d = samuiNow(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function longDate() { var d = samuiNow(); return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; }
  function greeting() { var h = samuiNow().getHours(); return h < 5 ? 'Good evening,' : h < 12 ? 'Good morning,' : (h < 18 ? 'Good afternoon,' : 'Good evening,'); }
  function weatherLabel(code) {
    if (code === 0) return 'Clear skies';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 48) return 'Soft mist';
    if (code <= 67) return 'Tropical rain';
    if (code <= 82) return 'Passing showers';
    return 'Island weather';
  }
  function qr(url) { return 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&color=111111&bgcolor=f1e5d0&margin=10&data=' + encodeURIComponent(url); }
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
        '<div class="welcome"><p class="kicker">Welcome to The Étienne</p><h1>' + greeting() + '<br>' + esc(C.guestName) + '</h1>' +
        '<p class="welcome-note">Everything you need during your stay.</p></div>' +
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
      var rail = '<div class="rail"><div class="col-head">Categories</div>';
      for (var i = 0; i < names.length; i++) {
        var c = cats[names[i]];
        rail += '<div class="cat focusable' + (names[i] === state.category ? ' active' : '') + '" id="cat-' + i + '" data-act="cat" data-arg="' + esc(names[i]) + '">' +
          '<span class="cat-number">0' + (i + 1) + '</span><span class="cat-copy"><strong>' + esc(names[i]) + '</strong><small>' + esc(c.note) + ' · ' + c.list.length + ' channels</small></span><span class="cat-arrow">→</span></div>';
      }
      rail += '</div>';
      var rows = '<div class="channels"><div class="col-head">' + esc(state.category) + '<span>' + list.length + ' channels</span></div>';
      for (var j = 0; j < list.length; j++) {
        var ch = list[j];
        rows += '<div class="channel focusable' + (j === state.channel ? ' selected' : '') + '" id="ch-' + j + '" data-act="channel" data-arg="' + j + '">' +
          '<span class="mark">' + esc(ch.short || '') + '</span><span class="channel-copy"><strong>' + esc(ch.name) + '</strong><small>' + esc(ch.detail || '') + '</small></span><span class="play">▶</span></div>';
      }
      rows += '</div>';
      var now = '<div class="now"><div class="preview"><span class="live">Live</span><span class="preview-mark">' + esc(sel.short || '') + '</span><span class="preview-label">CHANNEL PREVIEW</span></div>' +
        '<p class="kicker">Now selected</p><h2>' + esc(sel.name) + '</h2><p class="now-detail">' + esc(sel.detail || '') + '</p>' +
        '<div class="button focusable" id="watch" data-act="watch">Watch channel <span>→</span></div></div>';
      return '<div class="screen page">' + header() + title('Entertainment', 'Live TV') + '<div class="page-body">' + rail + rows + now + '</div></div>';
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
        cards += '<div class="card focusable" id="music-' + i + '" data-act="spotify"><span class="logo">0' + (i + 1) + '</span><i>▶</i><span><small>' + esc(m.eyebrow) + '</small><strong>' + esc(m.name) + '</strong></span></div>';
      }
      cards += '<div class="card focusable" id="music-sp" data-act="spotify"><span class="logo">Spotify</span><i>↗</i><span><small>Your music</small><strong>Spotify</strong></span></div>';
      return '<div class="screen page">' + header() + title('Set the mood', 'Music') + '<div class="cards">' + cards + '</div></div>';
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
    state.screen = screen;
    app.innerHTML = screens[screen]();
    if (state.staff) app.innerHTML += staffHtml();
    var el = focusId && document.getElementById(focusId);
    focus(el || first());
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
    Platform.launchApp(a, function (ok) { if (!ok) toast(a.name + ' isn’t installed on this TV yet.'); });
  }
  function activate(el) {
    if (!el) return;
    var act = el.getAttribute('data-act'), arg = el.getAttribute('data-arg');
    if (act === 'go') { state.channel = 0; render(arg); }
    else if (act === 'home') render('home', 'tile-' + indexOfTile(state.screen));
    else if (act === 'cat') render('tv', 'ch-0');
    else if (act === 'channel' || act === 'watch') {
      var ch = channels()[state.category].list[state.channel];
      Platform.watchLiveTv(ch, function (ok) { if (!ok) toast('To watch TV, press SOURCE on the remote and choose TV.'); });
    }
    else if (act === 'app') openApp(C.apps[+arg]);
    else if (act === 'spotify') openApp(findApp('spotify'));
    else if (act === 'pin') pinKey(arg);
    else if (act === 'staff') staffAction(arg);
  }
  function indexOfTile(screen) { for (var i = 0; i < C.homeTiles.length; i++) if (C.homeTiles[i].screen === screen) return i; return 0; }
  function back() {
    if (state.staff) { state.staff = null; render(state.screen); return; }
    if (state.screen !== 'home') activate(document.getElementById('back'));
  }

  // ---------- staff menu: Red button, or Up five times on the home screen ----------
  function openStaff() { state.staff = { pin: '' }; render(state.screen); }
  function staffHtml() {
    var s = state.staff, html = '<div class="overlay"><div class="panel">';
    if (!s.ok) {
      html += '<p class="kicker">Staff only</p><h2>Enter PIN</h2><div class="pin">' + new Array(s.pin.length + 1).join('•') + '</div><div class="keypad">';
      var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'OK'];
      for (var i = 0; i < keys.length; i++) html += '<div class="key focusable" id="key-' + keys[i] + '" data-act="pin" data-arg="' + keys[i] + '">' + keys[i] + '</div>';
      html += '</div>';
    } else {
      html += '<p class="kicker">Staff only</p><h2>Villa TV</h2><p class="muted">Platform: ' + Platform.kind + '</p>';
      if (Platform.canLock()) {
        html += '<div class="button focusable" id="st-reset" data-act="staff" data-arg="reset">Reset for next guest <span>→</span></div>' +
          '<div class="button focusable" id="st-settings" data-act="staff" data-arg="settings">Open TV settings <span>→</span></div>';
      } else {
        html += '<p class="muted">Settings lock and guest reset only work on the Sony (Google TV) version.</p>';
      }
      html += '<div class="button focusable" id="st-close" data-act="staff" data-arg="close">Close <span>→</span></div>';
    }
    return html + '</div></div>';
  }
  function pinKey(k) {
    var s = state.staff;
    if (k === 'Clear') s.pin = '';
    else if (k === 'OK') { if (s.pin === String(C.staffPin)) s.ok = true; else { s.pin = ''; toast('Wrong PIN'); } }
    else if (s.pin.length < 8) s.pin += k;
    render(state.screen, s.ok ? null : 'key-' + k);
  }
  function staffAction(a) {
    if (a === 'close') { state.staff = null; render(state.screen); }
    else if (a === 'reset') toast(Platform.resetForNextGuest());
    else if (a === 'settings') Platform.openSettings();
  }

  // ---------- remote ----------
  document.addEventListener('keydown', function (e) {
    var k = e.keyCode, K = Platform.keys;
    if (k === 403) { openStaff(); e.preventDefault(); return; }
    if (k === K.up && state.screen === 'home' && !state.staff) {
      if (!move('up')) { state.upCount++; if (state.upCount >= 5) { state.upCount = 0; openStaff(); } }
      e.preventDefault(); return;
    }
    state.upCount = 0;
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
  function loadWeather() {
    var x = new XMLHttpRequest();
    x.open('GET', 'https://api.open-meteo.com/v1/forecast?latitude=' + C.weather.lat + '&longitude=' + C.weather.lon + '&current=temperature_2m,weather_code&timezone=Asia%2FBangkok');
    x.onload = function () {
      try { var c = JSON.parse(x.responseText).current; state.weather = { temp: Math.round(c.temperature_2m), code: c.weather_code }; if (state.screen === 'home' && !state.staff) render('home', focused && focused.id); } catch (e) {}
    };
    x.send();
  }

  // When the TV comes back to this app (after Netflix, mirroring or live TV), start on the home screen.
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !state.staff) render('home'); });

  Platform.registerKeys();
  fit();
  render('home');
  loadWeather();
  setInterval(loadWeather, 30 * 60000);
})();
