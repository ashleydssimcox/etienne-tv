/* The Étienne TV: the only file that knows which TV it runs on.
   Samsung (Tizen), Sony (Android / Google TV, through the EtienneNative bridge) or a computer browser for previews.
   Plain ES5 on purpose: 2017 Samsung TVs run an old browser engine. */
var Platform = (function () {
  var native = window.EtienneNative || null;   // added by the Android wrapper
  var tizen = window.tizen || null;
  // On the Samsung test TV, TizenBrew serves this page from 127.0.0.1:8081 without TV controls;
  // our helper service (service/service.js) on port 8085 opens other apps for us.
  var brew = !native && !tizen && location.host === '127.0.0.1:8081';
  var kind = native ? 'android' : (tizen ? 'tizen' : (brew ? 'tizenbrew' : 'browser'));
  function helper(path, done) {
    var x = new XMLHttpRequest(), finished = false;
    function end(r) { if (finished) return; finished = true; done(r); }
    x.open('GET', 'http://127.0.0.1:8085' + path);
    x.timeout = 8000;
    x.onload = function () { try { end(JSON.parse(x.responseText)); } catch (e) { end({ ok: false, msg: 'bad reply' }); } };
    x.onerror = function () { end({ ok: false, msg: 'helper not running' }); };
    x.ontimeout = function () { end({ ok: false, msg: 'helper timed out' }); };
    x.send();
  }
  function brewLaunch(ids, uri, done) {
    helper('/launch?ids=' + encodeURIComponent(ids.join(',')) + (uri ? '&uri=' + encodeURIComponent(uri) : ''), function (r) { done(!!r.ok, r.msg); });
  }

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
      for (var n = 0; n <= 9; n++) { try { tizen.tvinputdevice.registerKey(String(n)); } catch (e) {} }
    },

    // Opens a streaming app. done(true) when it opened.
    launchApp: function (app, done) {
      done = done || function () {};
      if (kind === 'android') { done(!!native.launchApp(app.android || '')); return; }
      if (kind === 'tizen') { launchTizen(app.tizen || [], done); return; }
      if (kind === 'tizenbrew') { brewLaunch(app.tizen || [], '', done); return; }
      done(false);
    },

    // Opens a Spotify playlist link in the Spotify app. Falls back to opening Spotify itself.
    openSpotify: function (app, link, done) {
      done = done || function () {};
      var self = this;
      if (!link) { self.launchApp(app, done); return; }
      var uri = link.replace(/^https?:\/\/open\.spotify\.com\//, 'spotify:').replace(/\?.*$/, '').replace(/\//g, ':');
      if (kind === 'android' && native.openUri) { done(!!native.openUri(uri)); return; }
      if (kind === 'tizenbrew') { brewLaunch(app.tizen || [], uri, done); return; }
      if (kind === 'tizen' && tizen.application.launchAppControl && window.ApplicationControl) {
        var ids = app.tizen || [], i = 0;
        var next = function () {
          if (i >= ids.length) { self.launchApp(app, done); return; }
          var id = ids[i++];
          try {
            var ctl = new window.ApplicationControl('http://tizen.org/appcontrol/operation/view', uri, null, null, null);
            tizen.application.launchAppControl(ctl, id, function () { done(true); }, function () { next(); }, null);
          } catch (e) { next(); }
        };
        next(); return;
      }
      done(false);
    },

    // Live TV through the TV's own tuner.
    watchLiveTv: function (channel, done) {
      done = done || function () {};
      if (kind === 'android') { done(!!native.watchLiveTv(channel && channel.id ? String(channel.id) : '')); return; }
      if (kind === 'tizen') { launchTizen(['org.tizen.tv-viewer', 'TVViewer', 'com.samsung.tv.tv-viewer'], done); return; }
      if (kind === 'tizenbrew') { brewLaunch(['org.tizen.tv-viewer', 'TVViewer', 'com.samsung.tv.tv-viewer'], '', done); return; }
      done(false);
    },

    // Real channel list from the tuner, or null to keep the placeholders.
    getChannels: function () {
      if (kind === 'android' && native.getChannels) {
        try { var list = JSON.parse(native.getChannels() || 'null'); return list && list.length ? list : null; } catch (e) {}
      }
      return null;
    },

    // Staff: list the apps installed on this TV (Samsung test only), to find exact app ids.
    listApps: function (done) {
      if (kind === 'tizenbrew') { helper('/apps', function (r) { done(r.ok ? r.msg : null, r.msg); }); return; }
      done(null, 'Only on the Samsung test TV');
    },
    helperStatus: function (done) {
      if (kind === 'tizenbrew') { helper('/ping', function (r) { done(r.msg); }); return; }
      done('not used here');
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
