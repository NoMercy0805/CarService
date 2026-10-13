from pathlib import Path

p = Path('app/src/main/assets/index.html')
s = p.read_text()

old_css = '''.bottom-nav{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(560px,100%);padding:9px 20px calc(9px + env(safe-area-inset-bottom));background:color-mix(in srgb,var(--paper) 92%,transparent);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);display:grid;grid-template-columns:repeat(3,1fr);gap:6px;border-top:1px solid var(--rule);z-index:30}
.nav-btn{background:none;color:var(--muted);padding:7px 4px 4px;font-size:10px}.nav-btn i{display:block;font-style:normal;font-size:20px;margin-bottom:2px}.nav-btn.active{color:var(--primary);font-weight:700}'''
new_css = '''.bottom-nav{display:flex;background:var(--surface);border-radius:26px;overflow:hidden;padding:6px;gap:2px;position:fixed;left:50%;bottom:6px;transform:translateX(-50%);width:min(548px,calc(100% - 12px));padding-bottom:calc(6px + env(safe-area-inset-bottom,0px));z-index:30;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.5);box-shadow:0 4px 16px rgba(0,0,0,.12),0 1px 4px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.55)}
html[data-theme="dark"] .bottom-nav{border-color:rgba(255,255,255,.16)}
.nav-btn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:12px 4px;background:none;color:var(--muted);border-radius:20px;font-weight:700;font-size:10.5px;cursor:pointer;white-space:nowrap;transition:background .15s,color .15s,transform .12s cubic-bezier(.4,0,.2,1)}
.nav-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.nav-btn.active{color:var(--hero-text);background:var(--hero);box-shadow:inset 0 0 0 2px var(--hero-text)}
.nav-btn.active svg{stroke-width:2.6}
.nav-btn:active{transform:scale(.96)}'''
if old_css not in s:
    raise SystemExit('old nav css not found')
s = s.replace(old_css, new_css, 1)

old_settings_css = '#settingsMenuBtn{border-radius:50%}'
new_settings_css = '''#settingsMenuBtn{width:38px;height:38px;border-radius:50%;background:var(--surface);color:var(--muted);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.5);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
html[data-theme="dark"] #settingsMenuBtn{border-color:rgba(255,255,255,.16);box-shadow:0 6px 20px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.14)}
#settingsMenuBtn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'''
if old_settings_css not in s:
    raise SystemExit('old settings css not found')
s = s.replace(old_settings_css, new_settings_css, 1)

gear = '''<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'''
old = '<button class="icon-btn" id="settingsMenuBtn" title="Einstellungen" aria-label="Einstellungen">⚙</button>'
new = f'<button class="icon-btn" id="settingsMenuBtn" title="Einstellungen" aria-label="Einstellungen">{gear}</button>'
if old not in s:
    raise SystemExit('old settings button not found')
s = s.replace(old, new, 1)

dashboard = '''<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.2 12 4l9 7.2"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg>'''
service = '''<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a4.6 4.6 0 0 0-5.9 5.9L3 18l3 3 5.8-5.8a4.6 4.6 0 0 0 5.9-5.9l-2.8 2.8-3-3 2.8-2.8Z"/></svg>'''
history = '''<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>'''
old_nav = '''<nav class="bottom-nav">
  <button class="nav-btn active" data-page="dashboard"><i>⌂</i>Übersicht</button>
  <button class="nav-btn" data-page="service"><i>🔧</i>Peugeot-Service</button>
  <button class="nav-btn" data-page="history"><i>◷</i>Historie</button>
</nav>'''
new_nav = f'''<nav class="bottom-nav">
  <button class="nav-btn active" data-page="dashboard" aria-label="Übersicht">{dashboard}<span>Übersicht</span></button>
  <button class="nav-btn" data-page="service" aria-label="Peugeot-Service">{service}<span>Peugeot-Service</span></button>
  <button class="nav-btn" data-page="history" aria-label="Historie">{history}<span>Historie</span></button>
</nav>'''
if old_nav not in s:
    raise SystemExit('old nav html not found')
s = s.replace(old_nav, new_nav, 1)

if '⌂' in s or '<i>🔧</i>' in s or '<i>◷</i>' in s:
    raise SystemExit('legacy nav icons still present')
if 'M19.4 15' not in s:
    raise SystemExit('settings svg missing')

p.write_text(s)
