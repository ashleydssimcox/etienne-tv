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

function launch(ids, uri, res) {
  var i = 0, errors = [];
  function next(err) {
    if (err) errors.push(err);
    if (i >= ids.length) { send(res, false, errors.join(' / ') || 'no app id'); return; }
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
      launch(ids, q.uri || '', res); return;
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
