from pathlib import Path
import re, shutil

html_path=Path('app/src/main/assets/index.html')
s=html_path.read_text(encoding='utf-8')

# Use Android resources for vehicle images; this avoids relying on file-scheme asset image loading.
drawable=Path('app/src/main/res/drawable')
drawable.mkdir(parents=True,exist_ok=True)
shutil.copyfile('app/src/main/assets/peugeot-508.jpg', drawable/'peugeot_508.jpg')
shutil.copyfile('app/src/main/assets/peugeot-2008.jpg', drawable/'peugeot_2008.jpg')
s=s.replace('const img=v.id==="508"?"peugeot-508.jpg":"peugeot-2008.jpg";', 'const img=v.id==="508"?"file:///android_res/drawable/peugeot_508.jpg":"file:///android_res/drawable/peugeot_2008.jpg";')
s=s.replace("background:url('peugeot-508.jpg') center/contain no-repeat", "background:url('file:///android_res/drawable/peugeot_508.jpg') center/contain no-repeat")

css=r'''
/* reference layout pass */
body{padding-bottom:72px;background:#f6f9fd}
#app{max-width:560px;padding-left:16px;padding-right:16px}
.topbar{padding:15px 4px 10px}.brand h1{font-size:29px;letter-spacing:-1.3px}.icon-btn{width:40px;height:40px;border-radius:50%;background:#fff;border:1px solid #edf1f7;box-shadow:0 4px 14px rgba(37,76,120,.06)}
.vehicle-tabs{gap:8px;padding:2px 0 13px}.vehicle-tab{min-height:134px;padding:8px 9px 9px;border-radius:15px;border:1px solid #e4ebf5;box-shadow:0 5px 14px rgba(37,76,120,.05);background:#fff}.vehicle-tab.active{border:1.5px solid var(--primary);background:#fbfdff}.vehicle-photo{height:70px;margin-bottom:5px;border-radius:9px;background:#fff;padding:0}.vehicle-photo img{object-fit:contain}.vehicle-tab strong{font-size:12.5px;line-height:1.15}.vehicle-plate{font-size:10px!important;margin-top:2px!important}.vehicle-subline{font-size:8.7px!important;margin-top:1px!important}.vehicle-check{width:22px;height:22px;right:7px;top:7px;font-size:12px!important}

.next-service-panel{margin:0 0 12px;padding:13px 14px 14px;border-radius:17px;background:linear-gradient(135deg,#f7fbff,#eaf5ff);border:1px solid #e1edf9;box-shadow:0 5px 15px rgba(39,82,130,.06)}.next-service-panel:after{right:-30px;top:11px;width:145px;height:104px;opacity:.16;border-radius:0;transform:none}.next-service-head{gap:9px;margin-bottom:8px}.next-service-icon{width:37px;height:37px;border-radius:12px;font-size:18px;flex-basis:37px}.next-service-head h3{font-size:18px}.next-service-head small{font-size:9.5px}.next-service-due{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 9px;border-radius:10px;margin-bottom:7px;background:rgba(255,255,255,.72);font-size:9.6px;line-height:1.3}.next-service-label{font-size:10.5px;margin:2px 0 4px}.next-service-list{padding:0 7px;border-radius:11px}.next-group .service-group-title{padding:6px 2px 4px;font-size:8.3px}.next-service-item.next-service-check-row{grid-template-columns:20px 1fr;gap:7px;padding:7px 1px}.next-service-check-row input{width:16px;height:16px}.next-service-item b{font-size:10.5px}.next-service-item small{font-size:8.6px}.next-service-panel .primary-btn{padding:8px 10px;border-radius:10px;font-size:11.5px;margin-top:7px}

.page-title-row{gap:9px;margin:1px 1px 9px}.page-title-icon{width:38px;height:38px;border-radius:12px;font-size:18px;flex-basis:38px}.page-title-row h2{font-size:18px}.page-title-row p{font-size:9.6px}
/* Service categories as separate compact cards, like the reference */
.service-main-panel{padding:0;background:transparent;border:0;box-shadow:none}.service-main-panel .check-section>h4,.service-main-panel .check-section>.small-note{display:none}.service-group{margin:0 0 9px;border:1px solid #e4ebf5;border-radius:12px;background:#fff;box-shadow:0 3px 10px rgba(36,73,118,.04);overflow:hidden}.service-group-title{padding:7px 9px;font-size:10px;background:#f1f7ff}.check-row{padding:8px 9px;grid-template-columns:20px 1fr;gap:7px;background:#fff}.check-row input{width:17px;height:17px}.check-row b{font-size:10.8px}.check-row small{font-size:8.8px}.service-main-panel>.primary-btn{padding:9px 10px;border-radius:10px;font-size:11.5px;margin-top:2px}

/* History as one compact list/table instead of oversized cards */
.history-summary-panel{display:none}.history-list{gap:0;background:#fff;border:1px solid #e4ebf5;border-radius:13px;overflow:hidden;box-shadow:0 4px 14px rgba(36,73,118,.05)}.record{border:0;border-bottom:1px solid #e9eef5;border-radius:0;box-shadow:none;padding:10px 10px;min-height:54px;align-items:center}.record:last-child{border-bottom:0}.record h4{font-size:10.8px;margin:0 0 2px}.record p{font-size:8.8px;line-height:1.25}.record-actions{gap:4px}.record .cost{font-size:9px}.history-edit-btn,.history-delete-btn{width:25px;height:25px;border-radius:8px;font-size:11px}.service-record-count{font-size:8px;padding:2px 5px;margin-top:2px}.fab{width:50px;height:50px;bottom:72px;font-size:26px}

.bottom-nav{width:min(560px,100%);border-radius:16px 16px 0 0;padding:3px 7px calc(3px + env(safe-area-inset-bottom,0px));min-height:60px;box-shadow:0 -3px 13px rgba(35,69,113,.07)}.nav-btn{padding:5px 3px 4px;font-size:8.5px;gap:2px}.nav-btn svg{width:18px;height:18px}.nav-btn.active:after{bottom:0;width:30px;height:2px}
@media(max-width:390px){#app{padding-left:12px;padding-right:12px}.brand h1{font-size:27px}.vehicle-tab{min-height:128px}.vehicle-photo{height:65px}.next-service-head h3,.page-title-row h2{font-size:17px}}
'''

# Replace prior reference-layout block if rerun, otherwise append after existing fidelity block.
if '/* reference layout pass */' in s:
    s=re.sub(r'/\* reference layout pass \*/.*?(?=</style>)',css+'\n',s,flags=re.S)
else:
    s=s.replace('</style>',css+'\n</style>',1)

# Make next-service summary visually compact: split <br> into two columns in CSS-friendly spans.
old='due.innerHTML=`<b>${lastText}</b>Nächster Service: ${target.length?target.join(" oder "):"nach hinterlegtem Wartungsplan"}.`;'
new='due.innerHTML=`<span><b>${last?"Letzter Service":"Service"}</b><br>${last?fmtDate(last.date)+(last.mileage!==null&&last.mileage!==undefined&&last.mileage!==""?" · "+fmtKm(last.mileage)+" km":""):"Noch keiner gespeichert"}</span><span><b>Nächster Service</b><br>${target.length?target.join(" · "):"nach Wartungsplan"}</span>`;'
if old in s:
    s=s.replace(old,new)

html_path.write_text(s,encoding='utf-8')
print('reference layout + android_res vehicle images applied')
