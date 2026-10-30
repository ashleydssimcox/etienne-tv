# The Étienne TV

The villa TV home screen. One interface, two TV wrappers.

| Folder | What it is |
| --- | --- |
| `web/` | The interface, shared by every TV. Plain HTML, CSS and ES5 JavaScript so it runs on 2017 Samsung TVs. |
| `web/config.js` | Villa settings: guest name, room name, streaming apps, channels, menus, staff PIN. Edit this, not app.js. |
| `web/platform.js` | The only file that knows which TV it runs on (Samsung, Sony/Android, or a computer browser). |
| `package.json` | Makes the repo a TizenBrew app module, for testing on the Samsung. |
| `android/` | Sony (Google TV) home screen app: settings lock, reset for next guest. Coming next. |

## Preview on a computer
Open `web/index.html` in Chrome. Arrow keys move, Enter selects, Esc goes back.

## Remote
Arrows and OK move and select. Back returns to the home screen.
Staff menu: the red button, or press Up five times on the home screen, then the staff PIN from `config.js`.

## Samsung test (2017 UA55MU6103, Tizen 3)
Installed as a TizenBrew module, so nothing needs signing:
1. TV: Apps, type 1 2 3 4 5, Developer mode on, Host PC IP = the Mac's IP, restart the TV.
2. Mac: run TizenBrew Installer and install TizenBrew on the TV.
3. Put this folder in a public GitHub repo.
4. TV: in TizenBrew, add the module `gh/<github-user>/etienne-tv`, open it and turn on auto-launch.
5. TV: Settings, General, Smart Features, turn on Autorun Last App.

What the Samsung test can't show: the settings lock and the reset for next guest. Those are Sony only.

Based on ideas from Free My TV (MIT) and TizenBrew (GPL-3.0, used as an installer, no code copied).
