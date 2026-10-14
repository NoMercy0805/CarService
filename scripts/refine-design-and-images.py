from pathlib import Path
import re

html_path = Path('app/src/main/assets/index.html')
java_path = Path('app/src/main/java/com/schiwy/carservice/MainActivity.java')
html = html_path.read_text(encoding='utf-8')
java = java_path.read_text(encoding='utf-8')

# Vehicle images: the HTML itself is loaded from file:///android_asset/index.html.
# Relative URLs are therefore resolved by WebView directly inside the same asset folder.
html = html.replace('file:///android_asset/peugeot-508.jpg', 'peugeot-508.jpg')
html = html.replace('file:///android_asset/peugeot-2008.jpg', 'peugeot-2008.jpg')

# Fixed vehicle plates, while preserving existing user data via the existing merge logic.
html = html.replace('hsn:"3003",tsn:"AOK",licensePlate:"",vin:""', 'hsn:"3003",tsn:"AOK",licensePlate:"ÖHR RT 777",vin:""')
html = html.replace('hsn:"3003",tsn:"AUH",licensePlate:"",vin:""', 'hsn:"3003",tsn:"AUH",licensePlate:"ÖHR RT 188",vin:""')

# Migrate older local states that still have an empty plate for the two fixed cars.
old_merge = 'return old?{...v,...old,records:Array.isArray(old.records)?old.records:[],customTasks:Array.isArray(old.customTasks)?old.customTasks:[]}:v;'
new_merge = '''if(!old) return v;\n      const merged={...v,...old,records:Array.isArray(old.records)?old.records:[],customTasks:Array.isArray(old.customTasks)?old.customTasks:[]};\n      if(!String(merged.licensePlate||"").trim()) merged.licensePlate=v.licensePlate;\n      return merged;'''
if old_merge in html:
    html = html.replace(old_merge, new_merge, 1)

css = r'''/* template fidelity pass */
body{padding-bottom:72px}
#app{max-width:560px;padding-left:12px;padding-right:12px}
.topbar{padding:11px 3px 8px}
.brand h1{font-size:28px;letter-spacing:-1.2px;line-height:1;font-weight:850}
.icon-btn{width:38px;height:38px;border-radius:50%;box-shadow:none;border:1px solid var(--rule);background:var(--surface)}

/* Overview = vehicle selector + next service only */
#setupNotice,#page-dashboard .hero{display:none!important}
.vehicle-tabs{gap:8px;padding:1px 0 10px}
.vehicle-tab{min-height:124px;padding:7px 8px 8px;border-radius:16px;border:1px solid var(--rule);box-shadow:0 3px 11px rgba(36,73,118,.06);background:var(--surface)}
.vehicle-tab.active{border:1.5px solid var(--primary)}
.vehicle-photo{height:57px;margin-bottom:5px;border-radius:10px;background:#F7F9FC;padding:2px;overflow:hidden}
.vehicle-photo img{width:100%;height:100%;object-fit:contain;object-position:center;display:block}
.vehicle-tab strong{font-size:12.5px;line-height:1.12;letter-spacing:-.1px}
.vehicle-plate{font-size:10px!important;line-height:1.12!important;margin-top:3px!important;color:var(--muted)!important}
.vehicle-subline{font-size:8.8px!important;line-height:1.15!important;margin-top:2px!important;color:var(--muted)!important}
.vehicle-check{width:21px;height:21px;right:7px;top:7px;font-size:12px!important;border-width:1.5px}
.vehicle-photo.image-load-error{background:var(--primary-soft)}
.vehicle-photo.image-load-error:after{content:'Bild nicht geladen';font-size:9px;font-weight:700;color:var(--muted)}

.next-service-panel{padding:12px;border-radius:18px;margin:0 0 10px;box-shadow:0 5px 18px rgba(36,73,118,.08)}
.next-service-panel:after{right:-48px;top:10px;width:150px;height:95px;background:url('peugeot-508.jpg') center/contain no-repeat;opacity:.10}
.next-service-head{gap:9px;margin-bottom:8px}
.next-service-icon,.page-title-icon{width:38px;height:38px;border-radius:12px;font-size:18px;flex-basis:38px}
.next-service-head h3,.page-title-row h2{font-size:18px;letter-spacing:-.4px}
.next-service-head small,.page-title-row p{font-size:9.8px;margin-top:1px}
.next-service-due{padding:8px 9px;border-radius:11px;margin-bottom:7px;font-size:9.8px;line-height:1.35}
.next-service-label{font-size:10.5px;margin:1px 0 3px}
.next-service-list{border-radius:12px;padding:0 7px}
.next-group .service-group-title{padding:6px 2px 4px;font-size:8.5px}
.next-service-item.next-service-check-row{grid-template-columns:21px 1fr;gap:7px;padding:7px 1px}
.next-service-check-row input{width:17px;height:17px}
.next-service-item b{font-size:10.8px;line-height:1.2}
.next-service-item small{font-size:8.8px;line-height:1.25;margin-top:1px}
.next-service-panel .primary-btn{padding:9px 10px;border-radius:11px;font-size:12px;margin-top:8px;box-shadow:none}

.page-title-row{gap:9px;margin:1px 1px 8px}
.page-title-row h2{font-size:18px}
.service-main-panel,.history-summary-panel{border-radius:16px;box-shadow:0 4px 14px rgba(36,73,118,.06)}
.service-main-panel{padding:5px 10px 10px}
.service-main-panel .check-section>h4{font-size:15px;margin:6px 0 1px}
.service-main-panel .small-note{font-size:9px!important;margin-bottom:6px!important}
.service-group{margin:6px 0 9px;border-radius:11px}
.service-group-title{padding:6px 8px;font-size:9.5px}
.check-row{padding:7px 8px;grid-template-columns:19px 1fr;gap:7px}
.check-row input{width:16px;height:16px}
.check-row b{font-size:10.8px;line-height:1.2}
.check-row small{font-size:8.8px;line-height:1.25;margin-top:1px}
.service-main-panel>.primary-btn{padding:9px 10px;border-radius:11px;font-size:12px;box-shadow:none;margin-top:5px}

.history-summary-panel{padding:10px 11px;margin-bottom:8px}
.history-summary-panel h3{font-size:12px;margin-bottom:6px}
.history-summary-panel .small-note{font-size:9px}
.history-summary-panel b{font-size:12px}
.history-list{gap:6px}
.record{padding:9px 9px;border-radius:13px;gap:8px;box-shadow:0 3px 10px rgba(36,73,118,.05)}
.record h4{font-size:11.5px;margin-bottom:2px}
.record p{font-size:9.2px;line-height:1.3}
.service-record-count{font-size:8.5px;padding:3px 6px;margin-top:3px}
.history-edit-btn,.history-delete-btn{width:28px;height:28px;border-radius:9px;font-size:12px}
.record-actions{gap:6px}.record .cost{font-size:10px}
.fab{width:48px;height:48px;bottom:68px;font-size:25px}

.bottom-nav{width:min(560px,100%);border-radius:18px 18px 0 0;padding:4px 6px calc(4px + env(safe-area-inset-bottom,0px));box-shadow:0 -4px 16px rgba(35,69,113,.08)}
.nav-btn{padding:6px 3px 5px;font-size:8.8px;gap:2px;border-radius:14px}
.nav-btn svg{width:18px;height:18px}
.nav-btn.active:after{bottom:0;width:32px;height:2.5px}

@media(max-width:390px){
  #app{padding-left:10px;padding-right:10px}
  .brand h1{font-size:26px}
  .vehicle-tab{min-height:119px;padding:6px 7px 7px}
  .vehicle-photo{height:53px}
  .vehicle-tab strong{font-size:12px}
  .next-service-head h3,.page-title-row h2{font-size:17px}
}
'''

if '/* template fidelity pass */' in html:
    html = re.sub(r'/\* template fidelity pass \*/.*?(?=</style>)', css + '\n', html, count=1, flags=re.S)
else:
    html = html.replace('</style>', css + '\n</style>', 1)

# Avoid stale cached copies of bundled HTML/assets after an APK update.
java = java.replace('settings.setCacheMode(WebSettings.LOAD_DEFAULT);', 'settings.setCacheMode(WebSettings.LOAD_NO_CACHE);')
if 'webView.clearCache(true);' not in java:
    java = java.replace('webView.setWebViewClient(new WebViewClient());\n        webView.loadUrl("file:///android_asset/index.html");', 'webView.setWebViewClient(new WebViewClient());\n        webView.clearCache(true);\n        webView.loadUrl("file:///android_asset/index.html");')

html_path.write_text(html, encoding='utf-8')
java_path.write_text(java, encoding='utf-8')

# Cheap but meaningful asset sanity checks: packaged location, JPEG SOI/EOI and non-trivial size.
for name in ('peugeot-508.jpg', 'peugeot-2008.jpg'):
    p = Path('app/src/main/assets') / name
    data = p.read_bytes()
    assert len(data) > 4096, f'{name} unexpectedly small'
    assert data[:2] == b'\xff\xd8', f'{name} is not a JPEG (missing SOI)'
    assert data[-2:] == b'\xff\xd9', f'{name} is not a complete JPEG (missing EOI)'

# Make sure the exact runtime references now point at sibling assets.
assert 'file:///android_asset/peugeot-508.jpg' not in html
assert 'file:///android_asset/peugeot-2008.jpg' not in html
assert '"peugeot-508.jpg"' in html and '"peugeot-2008.jpg"' in html
print('design, plate migration, image paths and WebView cache handling patched')
