/* The Étienne TV: the only file that knows which TV it runs on.
   Samsung (Tizen), Sony (Android / Google TV, through the EtienneNative bridge) or a computer browser for previews.
   Plain ES5 on purpose: 2017 Samsung TVs run an old browser engine. */
var Platform = (function () {
  var native = window.EtienneNative || null;   // added by the Android wrapper
  var tizen = window.tizen || null;
  var kind = native ? 'android' : (tizen ? 'tizen' : 'browser');

  function launchTizen(ids, done) {
    var i = 0;
    function next() {
      if (i >= ids.length) { done(false); return; }
      var id = ids[i++];
      try {
        tizen.application.launch(id, function () { done(true); }, function () { next(); });
      } catch (e) { next(); }
    }
    next();
  }

  return {
    kind: kind,

    // Keys the remote sends. Back differs per platform.
    keys: { left: 37, up: 38, right: 39, down: 40, enter: 13, back: [10009, 8, 27, 461] },

    registerKeys: function () {
      if (kind !== 'tizen' || !tizen.tvinputdevice) return;
      try { tizen.tvinputdevice.registerKey('MediaPlayPause'); } catch (e) {}
    },

    // Opens a streaming app. done(true) when it opened.
    launchApp: function (app, done) {
      done = done || function () {};
      if (kind === 'android') { done(!!native.launchApp(app.android || '')); return; }
      if (kind === 'tizen') { launchTizen(app.tizen || [], done); return; }
      done(false);
    },

    // Live TV through the TV's own tuner.
    watchLiveTv: function (channel, done) {
      done = done || function () {};
      if (kind === 'android') { done(!!native.watchLiveTv(channel && channel.id ? String(channel.id) : '')); return; }
      if (kind === 'tizen') { launchTizen(['org.tizen.tv-viewer', 'TVViewer', 'com.samsung.tv.tv-viewer'], done); return; }
      done(false);
    },

    // Real channel list from the tuner, or null to keep the placeholders.
    getChannels: function () {
      if (kind === 'android' && native.getChannels) {
        try { var list = JSON.parse(native.getChannels() || 'null'); return list && list.length ? list : null; } catch (e) {}
      }
      return null;
    },

    // Staff-only actions, Sony build only.
    canLock: function () { return kind === 'android'; },
    openSettings: function () { if (native) native.openSettings(); },
    resetForNextGuest: function () { return native ? native.resetForNextGuest() : 'Only on the Sony build'; },

    exitApp: function () {
      if (kind === 'tizen') { try { tizen.application.getCurrentApplication().hide(); } catch (e) {} }
    }
  };
})();
