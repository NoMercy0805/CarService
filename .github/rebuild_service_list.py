from pathlib import Path
import re

path = Path('app/src/main/assets/index.html')
s = path.read_text(encoding='utf-8')

# 1) Remove service icon presentation from the UI.
s = s.replace(
    '.next-service-item{display:grid;grid-template-columns:34px 1fr;gap:10px;align-items:center;padding:10px 2px;border-bottom:1px solid var(--rule)}',
    '.next-service-item{padding:10px 2px;border-bottom:1px solid var(--rule)}'
)
s, n = re.subn(r'\n\.service-task-title\{.*?(?=\n@media)', '\n', s, count=1, flags=re.S)
assert n == 1, f'icon css block matches: {n}'

# 2) Manufacturer systematic operations which are due at every scheduled service.
systematic = '''const SERVICE_SYSTEMATIC_ITEMS = {
  "508": [
    "Motoröl wechseln",
    "Ölfilter ersetzen",
    "Sichtbare Schläuche, Leitungen und Anschlüsse auf Zustand prüfen",
    "Abgasanlage prüfen",
    "Antriebswellen-/Gleichlaufgelenke auf Schäden und Undichtigkeiten prüfen",
    "Lenkung auf Schäden und Spiel prüfen",
    "Spurstangen-/Kugelgelenke auf Schäden und Spiel prüfen",
    "Bremsflüssigkeitsstand prüfen und ggf. ergänzen",
    "Bremsleitungen/-schläuche und Kupplungsanschlüsse auf Schäden und Undichtigkeiten prüfen",
    "Reifenprofil und Reifenzustand inkl. Reserverad prüfen",
    "Fahrwerk/Aufhängung auf Schäden und Verschleiß prüfen",
    "Reifendruck prüfen und korrigieren",
    "Scheibenwischer und Waschanlage prüfen",
    "Serviceanzeige zurücksetzen"
  ],
  "2008": [
    "Motoröl wechseln",
    "Ölfilter ersetzen",
    "Motor auf Ölundichtigkeiten prüfen",
    "Abgasanlage prüfen",
    "Kühlsystem auf Undichtigkeiten, Füllstand und Frostschutzkonzentration prüfen",
    "Antriebswellen-/Gleichlaufgelenke auf Schäden und Undichtigkeiten prüfen",
    "Lenkung auf Schäden und Spiel prüfen",
    "Spurstangen-/Kugelgelenke auf Schäden und Spiel prüfen",
    "Bremsflüssigkeitsstand prüfen und ggf. ergänzen",
    "Bremsleitungen/-schläuche und Kupplungsanschlüsse auf Schäden und Undichtigkeiten prüfen",
    "Reifenprofil und Reifenzustand inkl. Reserverad prüfen",
    "Fahrwerk/Aufhängung auf Schäden und Verschleiß prüfen",
    "Reifendruck prüfen und korrigieren",
    "Außenbeleuchtung prüfen",
    "Scheibenwischer und Waschanlage prüfen",
    "Serviceanzeige zurücksetzen"
  ]
};'''
s, n = re.subn(
    r'const SERVICE_BASE_ITEMS = \[.*?\];\nconst SERVICE_INSPECTION_ITEMS = \[.*?\];',
    systematic,
    s,
    count=1,
    flags=re.S
)
assert n == 1, f'systematic array block matches: {n}'

# 3) Remove all service icon JavaScript.
s, n = re.subn(
    r'\nconst SERVICE_ICON_SVGS = \{.*?\nfunction serviceIcon\(id\)\{.*?\n\}\n\nconst BASE_RULES = \{',
    '\nconst BASE_RULES = {',
    s,
    count=1,
    flags=re.S
)
assert n == 1, f'icon js block matches: {n}'

# 4) Rebuild the four maintenance profiles from the checked schedules.
base_rules = '''const BASE_RULES = {
  "508_early": [
    r("service","Motoröl + Ölfilter / Inspektion","",30000,24,{note:"Peugeot 508 2.0 HDiF · bis 30.06.2012"}),
    r("fuel","Kraftstofffilter (Dieselfilter) wechseln","",30000,0),
    r("air","Luftfilter wechseln","",60000,0),
    r("cabin","Innenraum-/Pollenfilter wechseln","",60000,24),
    r("brakefluid","Bremsflüssigkeit wechseln","",0,24),
    r("coolantph","Kühlmittel prüfen","",30000,24,{firstKm:120000,firstMonths:48}),
    r("fapadd","FAP-Additivstand prüfen","",30000,0,{firstKm:90000}),
    r("dpf","Partikelfilter/FAP auf Beladung prüfen","",30000,0,{firstKm:180000}),
    r("timing","Zahnriemen + Wasserpumpe wechseln","",240000,120,{important:true}),
    r("brakes","Bremsen prüfen","",0,0,{manual:true}),
    r("tires","Reifen / Profiltiefe / Luftdruck","",0,0,{manual:true}),
    r("battery","Batterie prüfen","",0,0,{manual:true}),
    r("hu","HU / AU (TÜV)","",0,24,{hu:true})
  ],
  "508_late": [
    r("service","Motoröl + Ölfilter / Inspektion","",30000,12,{note:"Peugeot 508 2.0 HDiF · ab 01.07.2012"}),
    r("fuel","Kraftstofffilter (Dieselfilter) wechseln","",30000,0),
    r("air","Luftfilter wechseln","",60000,48),
    r("cabin","Innenraum-/Pollenfilter wechseln","",60000,24),
    r("brakefluid","Bremsflüssigkeit wechseln","",0,24),
    r("coolantph","Kühlmittel prüfen","",30000,12,{firstKm:120000,firstMonths:48}),
    r("fapadd","FAP-Additivstand prüfen","",30000,0,{firstKm:90000}),
    r("dpf","Partikelfilter/FAP auf Beladung prüfen","",30000,0,{firstKm:180000}),
    r("timing","Zahnriemen + Wasserpumpe wechseln","",180000,120,{important:true}),
    r("brakes","Bremsen prüfen","",0,0,{manual:true}),
    r("tires","Reifen / Profiltiefe / Luftdruck","",0,0,{manual:true}),
    r("battery","Batterie prüfen","",0,0,{manual:true}),
    r("hu","HU / AU (TÜV)","",0,24,{hu:true})
  ],
  "2008_normal": [
    r("service","Motoröl + Ölfilter / Inspektion","",25000,12,{note:"Peugeot 2008 1.6 BlueHDi · normale Nutzung"}),
    r("fuel","Kraftstofffilter (Dieselfilter) wechseln","",50000,48),
    r("air","Luftfilter wechseln","",50000,48),
    r("cabin","Innenraum-/Pollenfilter wechseln","",25000,24),
    r("brakefluid","Bremsflüssigkeit wechseln","",0,24),
    r("coolantph","Kühlmittel-pH prüfen","",25000,12,{firstKm:125000,firstMonths:48}),
    r("fapadd","FAP-Additivstand prüfen","",25000,0,{firstKm:100000}),
    r("dpf","Partikelfilter auf Beladung prüfen","",25000,0,{firstKm:150000}),
    r("timing","Zahnriemen + Wasserpumpe wechseln","",175000,120,{important:true}),
    r("auxbelt","Nebenaggregateriemen-Kit wechseln","",175000,120),
    r("adblue","AdBlue-Füllstand kontrollieren / bei Bedarf auffüllen","",25000,12),
    r("brakes","Bremsen prüfen","",0,0,{manual:true}),
    r("tires","Reifen / Profiltiefe / Luftdruck","",0,0,{manual:true}),
    r("battery","Batterie prüfen","",0,0,{manual:true}),
    r("hu","HU / AU (TÜV)","",0,24,{hu:true})
  ],
  "2008_severe": [
    r("service","Motoröl + Ölfilter / Inspektion","",15000,12,{note:"Peugeot 2008 1.6 BlueHDi · erschwerte Nutzung"}),
    r("fuel","Kraftstofffilter (Dieselfilter) wechseln","",30000,48),
    r("air","Luftfilter wechseln","",30000,48),
    r("cabin","Innenraum-/Pollenfilter wechseln","",15000,12),
    r("brakefluid","Bremsflüssigkeit wechseln","",0,24),
    r("coolantph","Kühlmittel-pH prüfen","",15000,12,{firstKm:120000,firstMonths:48}),
    r("fapadd","FAP-Additivstand prüfen","",15000,0,{firstKm:90000}),
    r("dpf","Partikelfilter auf Beladung prüfen","",15000,0,{firstKm:150000}),
    r("timing","Zahnriemen + Wasserpumpe wechseln","",165000,120,{important:true}),
    r("auxbelt","Nebenaggregateriemen-Kit wechseln","",165000,120),
    r("adblue","AdBlue-Füllstand kontrollieren / bei Bedarf auffüllen","",15000,12),
    r("brakes","Bremsen prüfen","",0,0,{manual:true}),
    r("tires","Reifen / Profiltiefe / Luftdruck","",0,0,{manual:true}),
    r("battery","Batterie prüfen","",0,0,{manual:true}),
    r("hu","HU / AU (TÜV)","",0,24,{hu:true})
  ]
};'''
s, n = re.subn(r'const BASE_RULES = \{.*?\n\};\n\nfunction r\(', base_rules + '\n\nfunction r(', s, count=1, flags=re.S)
assert n == 1, f'BASE_RULES block matches: {n}'

# 5) One clean Peugeot-Service checklist: systematic service operations + due extras only.
old_html = '''        <div class="check-section"><h4>Grundservice</h4><div id="serviceBaseList"></div></div>
        <div class="check-section"><h4>Sicht- und Funktionskontrollen</h4><div id="serviceInspectionList"></div></div>
        <div class="check-section"><h4>Bei diesem Service fällige Zusatzarbeiten</h4><div id="serviceExtraList"></div></div>'''
new_html = '''        <div class="check-section"><h4>Bei diesem Service fällig</h4><div id="serviceDueList"></div></div>'''
assert old_html in s, 'old Peugeot-Service sections not found'
s = s.replace(old_html, new_html, 1)

new_checklist = '''function serviceChecklistRows(items){
  return items.map((item,i)=>`<label class="check-row"><input type="checkbox" ${item.taskId?`data-service-task="${esc(item.taskId)}"`:`data-service-systematic="${i}"`}><span><b>${esc(item.name)}</b>${item.detail?`<small>${esc(item.detail)}</small>`:""}</span></label>`).join("");
}
function openServiceChecklist(){
  const v=vehicle();
  const {serviceInfo,extras}=servicePlan(v);
  const systematic=(SERVICE_SYSTEMATIC_ITEMS[v.id]||[]).map(name=>({name}));
  const extraItems=extras.map(({rule,info})=>({
    name:rule.name,
    taskId:rule.id,
    detail:info&&info.detail?info.detail:"Zusatzarbeit beim nächsten Service"
  }));
  const items=serviceInfo?[...systematic,...extraItems]:[];
  document.getElementById("serviceDueList").innerHTML=items.length
    ?serviceChecklistRows(items)
    :`<div class="small-note">Service noch nicht berechenbar. Bitte Kilometerstand und Fahrzeugdaten ergänzen.</div>`;
  showPage("service");
}
function openServiceConfirm'''
s, n = re.subn(
    r'function checklistRows\(items,kind\)\{.*?\n\}\nfunction openServiceChecklist\(\)\{.*?\n\}\nfunction openServiceConfirm',
    new_checklist,
    s,
    count=1,
    flags=re.S
)
assert n == 1, f'checklist function block matches: {n}'

old_checked = '''  const checkedBase=[...document.querySelectorAll('#page-service [data-service-kind]:checked')].map(el=>{
    const arr=el.dataset.serviceKind==="base"?SERVICE_BASE_ITEMS:SERVICE_INSPECTION_ITEMS;
    return arr[Number(el.dataset.serviceIndex)];
  }).filter(Boolean);
  const checkedExtras=[...document.querySelectorAll('#page-service [data-service-task]:checked')].map(el=>el.dataset.serviceTask);
  const notes=[];
  if(checkedBase.length) notes.push(`Checkliste: ${checkedBase.join("; ")}`);'''
new_checked = '''  const systematic=SERVICE_SYSTEMATIC_ITEMS[v.id]||[];
  const checkedSystematic=[...document.querySelectorAll('#page-service [data-service-systematic]:checked')].map(el=>systematic[Number(el.dataset.serviceSystematic)]).filter(Boolean);
  const checkedExtras=[...document.querySelectorAll('#page-service [data-service-task]:checked')].map(el=>el.dataset.serviceTask);
  const notes=[];
  if(checkedSystematic.length) notes.push(`Checkliste: ${checkedSystematic.join("; ")}`);'''
assert old_checked in s, 'old service save checklist block not found'
s = s.replace(old_checked, new_checked, 1)

# 6) Dashboard and history become text-only.
old_dashboard = '?items.map(item=>`<div class="next-service-item">${serviceIcon(item.id)}<span><b>${esc(item.name)}</b><small>${esc(item.note)}</small></span></div>`).join("")'
new_dashboard = '?items.map(item=>`<div class="next-service-item"><b>${esc(item.name)}</b><small>${esc(item.note)}</small></div>`).join("")'
assert old_dashboard in s, 'dashboard icon row not found'
s = s.replace(old_dashboard, new_dashboard, 1)

s = s.replace('    const iconId=rule?rule.id:(rec.manual?"manual":rec.taskId);\n', '')
old_history = '<h4 class="service-task-title">${serviceIcon(iconId)}<span>${rule?esc(rule.name):esc(rec.taskName||"Wartung")}</span></h4>'
new_history = '<h4>${rule?esc(rule.name):esc(rec.taskName||"Wartung")}</h4>'
assert old_history in s, 'history icon title not found'
s = s.replace(old_history, new_history, 1)

# 7) Guardrails.
for forbidden in [
    'serviceIcon(', 'SERVICE_ICON_SVGS', 'CONCEPT_ICON_IDS', 'concept-sprite.webp',
    'SERVICE_BASE_ITEMS', 'SERVICE_INSPECTION_ITEMS', 'data-service-kind',
    'serviceBaseList', 'serviceInspectionList', 'serviceExtraList'
]:
    assert forbidden not in s, forbidden
for required in [
    'SERVICE_SYSTEMATIC_ITEMS', 'serviceDueList',
    'Kraftstofffilter (Dieselfilter) wechseln', 'FAP-Additivstand prüfen',
    'Partikelfilter/FAP auf Beladung prüfen', 'AdBlue-Füllstand kontrollieren / bei Bedarf auffüllen'
]:
    assert required in s, required

path.write_text(s, encoding='utf-8')
