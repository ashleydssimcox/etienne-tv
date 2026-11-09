/* The Étienne TV helper (Samsung / TizenBrew only).
   Runs in the background inside TizenBrew, which is allowed to open other TV apps.
   The villa page asks it, over http://127.0.0.1:8085, to open Spotify, Netflix, the TV tuner and so on.
   Plain ES5: TizenBrew's service runs on an old Node.js. */
var http = require('http');
var urlLib = require('url');

function send(res, ok, msg) {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ ok: ok, msg: msg }));
}

// Fallback: ask the TV's developer bridge (the same route TizenBrew itself uses) to start the app.
// A background service isn't always allowed to open apps directly, but this route is.
function sdbExecute(id, cb) {
  try {
    var adbhost = require('adbhost');
    var c = adbhost.createConnection({ host: '127.0.0.1', port: 26101 }), done = false;
    function finish(ok, msg) { if (done) return; done = true; try { c._stream.end(); } catch (e) {} cb(ok, msg); }
    c._stream.on('connect', function () {
      try {
        var sh = c.createStream('shell:0 execute ' + id), out = '';
        sh.on('data', function (d) { out += d.toString(); });
        sh.on('error', function (e) { finish(false, 'bridge: ' + e); });
        setTimeout(function () { finish(!/fail|error|not found/i.test(out), out.replace(/\s+/g, ' ').trim() || 'sent'); }, 2500);
      } catch (e) { finish(false, 'bridge: ' + e.message); }
    });
    c._stream.on('error', function (e) { finish(false, 'bridge: ' + e); });
    setTimeout(function () { finish(false, 'bridge timed out'); }, 8000);
  } catch (e) { cb(false, 'bridge: ' + e.message); }
}

function launch(ids, uri, res) {
  var i = 0, errors = [];
  function next(err) {
    if (err) errors.push(err);
    if (i >= ids.length) {
      if (!ids.length) { send(res, false, 'no app id'); return; }
      // Every direct attempt failed: try the developer bridge with the first (best) match.
      sdbExecute(ids[0], function (ok, msg) { send(res, ok, ok ? ids[0] + ' via bridge (' + msg + ')' : errors.concat(msg).join(' / ')); });
      return;
    }
    var id = ids[i++];
    try {
      if (uri && tizen.ApplicationControl) {
        var ctl = new tizen.ApplicationControl('http://tizen.org/appcontrol/operation/view', uri, null, null, null);
        tizen.application.launchAppControl(ctl, id,
          function () { send(res, true, id + ' with link'); },
          function () {
            // The app didn't accept the link: open it plainly instead.
            tizen.application.launch(id, function () { send(res, true, id + ' without link'); }, function (e) { next(id + ': ' + (e && e.message)); });
          }, null);
      } else {
        tizen.application.launch(id, function () { send(res, true, id); }, function (e) { next(id + ': ' + (e && e.message)); });
      }
    } catch (e) { next(id + ': ' + e.message); }
  }
  next();
}

var server = http.createServer(function (req, res) {
  var parsed = urlLib.parse(req.url, true), q = parsed.query;
  try {
    if (parsed.pathname === '/ping') { send(res, true, 'ready'); return; }
    if (parsed.pathname === '/launch') {
      var ids = String(q.ids || '').split(',').filter(function (x) { return x; });
      var name = String(q.name || '').toLowerCase();
      if (!name) { launch(ids, q.uri || '', res); return; }
      // Look the app up by its name on this TV first, so we don't depend on exact app ids.
      tizen.application.getAppsInfo(function (list) {
        var found = [];
        list.forEach(function (a) {
          var n = String(a.name || '').toLowerCase();
          if (n === name || n.indexOf(name) === 0) found.push(a.id);
        });
        launch(found.concat(ids.filter(function (x) { return found.indexOf(x) < 0; })), q.uri || '', res);
      }, function () { launch(ids, q.uri || '', res); });
      return;
    }
    if (parsed.pathname === '/apps') {
      tizen.application.getAppsInfo(function (list) {
        send(res, true, list.map(function (a) { return a.name + ' = ' + a.id; }).sort());
      }, function (e) { send(res, false, e && e.message); });
      return;
    }
    send(res, false, 'unknown request');
  } catch (e) { send(res, false, e.message); }
});
server.on('error', function () { /* already running from an earlier start: nothing to do */ });
server.listen(8085, '127.0.0.1');
