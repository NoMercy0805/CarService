from pathlib import Path
import re, subprocess
p=Path('app/src/main/assets/index.html')
s=p.read_text()
s=s.replace('<div class="check-section"><h4>Bei diesem Service fällig</h4><div id="serviceDueList"></div></div>','<div class="check-section"><h4>Alle Servicepunkte</h4><div class="small-note" style="margin:-5px 0 12px">Fällige und kommende Wartungspunkte für dieses Fahrzeug.</div><div id="serviceDueList"></div></div>',1)
start=s.find('function openServiceChecklist(){')
if start<0: raise SystemExit('openServiceChecklist not found')
end=s.find('\nfunction openServiceConfirm()',start)
if end<0: raise SystemExit('openServiceConfirm anchor not found')
new='''function openServiceChecklist(){\n  const v=vehicle();\n  const rules=rulesFor(v);\n  const systematic=(SERVICE_SYSTEMATIC_ITEMS[v.id]||[]).map(name=>({name,detail:"Kontrolle bei jedem Peugeot-Service"}));\n  const maintenanceRules=rules.filter(rule=>!rule.manual&&!rule.hu).map(rule=>{\n    const info=dueInfo(v,rule);\n    let detail="Wartungspunkt";\n    if(info){\n      if(info.status==="due")detail="Jetzt fällig · "+info.detail;\n      else if(info.status==="soon")detail="Bald fällig · "+info.detail;\n      else detail=info.detail||"Noch nicht fällig";\n    }\n    return {name:rule.name,taskId:rule.id,detail};\n  });\n  const items=[...maintenanceRules,...systematic];\n  document.getElementById("serviceDueList").innerHTML=items.length\n    ?serviceChecklistGrouped(items)\n    :`<div class="small-note">Keine Servicepunkte hinterlegt.</div>`;\n  showPage("service");\n}'''
s=s[:start]+new+s[end:]
p.write_text(s)
scripts=re.findall(r'<script>(.*?)</script>',s,re.S)
Path('/tmp/carservice.js').write_text('\n'.join(scripts))
subprocess.run(['node','--check','/tmp/carservice.js'],check=True)
assert 'Alle Servicepunkte' in s
assert 'rules.filter(rule=>!rule.manual&&!rule.hu)' in s
print('Peugeot service tab now shows all items; overview unchanged')
