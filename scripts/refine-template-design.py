from pathlib import Path
import re, subprocess

p=Path('app/src/main/assets/index.html')
s=p.read_text()

css=r'''
/* template fidelity pass */
body{padding-bottom:78px}
#app{max-width:560px;padding-left:14px;padding-right:14px}
.topbar{padding:14px 4px 10px}
.brand h1{font-size:29px;letter-spacing:-1px;line-height:1}
.icon-btn{width:40px;height:40px;border-radius:50%;box-shadow:none;border:1px solid var(--rule)}

.vehicle-tabs{gap:10px;padding:2px 1px 12px}
.vehicle-tab{min-height:142px;padding:8px 9px 10px;border-radius:18px;box-shadow:0 5px 16px rgba(36,73,118,.07)}
.vehicle-photo{height:68px;margin-bottom:7px;border-radius:12px;background:#F3F6FA}
.vehicle-tab strong{font-size:13px;line-height:1.15}
.vehicle-plate{font-size:10.5px!important;margin-top:3px!important}
.vehicle-subline{font-size:9.5px!important;margin-top:2px!important}
.vehicle-check{width:24px;height:24px;right:8px;top:8px;font-size:14px!important}

.notice{padding:10px 12px;border-radius:13px;margin-bottom:10px;font-size:10.5px}
.next-service-panel{padding:14px;border-radius:20px;margin-bottom:12px}
.next-service-head{gap:10px;margin-bottom:10px}
.next-service-icon,.page-title-icon{width:42px;height:42px;border-radius:14px;font-size:20px;flex-basis:42px}
.next-service-head h3,.page-title-row h2{font-size:20px;letter-spacing:-.45px}
.next-service-head small,.page-title-row p{font-size:10.5px;margin-top:2px}
.next-service-due{padding:10px 11px;border-radius:13px;margin-bottom:9px;font-size:10.5px}
.next-service-label{font-size:11.5px;margin:2px 0 4px}
.next-service-list{border-radius:15px;padding:0 8px}
.next-group .service-group-title{padding:8px 3px 5px;font-size:9px}
.next-service-item{grid-template-columns:22px 1fr;gap:8px;padding:9px 1px}
.next-service-item .service-checkbox{width:19px!important;height:19px!important}
.next-service-item b{font-size:11.5px}
.next-service-item small{font-size:9.5px}
.next-service-panel .primary-btn{padding:11px 12px;border-radius:13px;font-size:13px;margin-top:10px}

.page-title-row{gap:10px;margin:2px 2px 10px}
.service-main-panel,.history-summary-panel{border-radius:18px}
.service-main-panel{padding:6px 12px 12px}
.service-main-panel .section-head h3{font-size:17px}
.service-main-panel .small-note{font-size:10px}
.service-group{margin:7px 0 11px;border-radius:13px}
.service-group-title{padding:8px 10px;font-size:10.5px}
.check-row{padding:9px 10px;grid-template-columns:21px 1fr;gap:8px}
.check-row input{width:18px;height:18px}
.check-row b{font-size:11.5px}
.check-row small{font-size:9.5px;line-height:1.35}

.history-summary-panel{padding:12px 13px;margin-bottom:10px}
.history-summary-panel h3{font-size:13px;margin-bottom:8px}
.history-list{gap:7px}
.record{padding:11px 11px;border-radius:16px}
.record h4{font-size:12.5px}
.record p{font-size:10px}
.history-edit-btn,.history-delete-btn{width:31px;height:31px;font-size:13px}
.fab{width:52px;height:52px;bottom:76px;font-size:28px}

.bottom-nav{width:min(560px,100%);border-radius:22px 22px 0 0;padding:5px 7px calc(5px + env(safe-area-inset-bottom,0px));box-shadow:0 -6px 20px rgba(35,69,113,.09)}
.nav-btn{padding:8px 4px 7px;font-size:9.5px;gap:3px}
.nav-btn svg{width:20px;height:20px}
.nav-btn.active:after{bottom:1px;width:36px;height:3px}

@media(max-width:390px){
  .brand h1{font-size:27px}
  .vehicle-tab{min-height:136px}
  .vehicle-photo{height:62px}
  .next-service-head h3,.page-title-row h2{font-size:19px}
}
'''

if '/* template fidelity pass */' in s:
    s=re.sub(r'/\* template fidelity pass \*/.*?(?=</style>)',css,s,flags=re.S)
else:
    s=s.replace('</style>',css+'\n</style>',1)

p.write_text(s)
scripts=re.findall(r'<script>(.*?)</script>',s,re.S)
Path('/tmp/carservice.js').write_text('\n'.join(scripts))
subprocess.run(['node','--check','/tmp/carservice.js'],check=True)
print('template fidelity CSS applied')
