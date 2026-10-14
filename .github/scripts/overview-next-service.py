from pathlib import Path
import re, subprocess
p=Path('app/src/main/assets/index.html')
s=p.read_text()
start=s.find('function renderNextServicePlan(v){')
if start<0: raise SystemExit('renderNextServicePlan not found')
end=s.find('\nfunction ', start+10)
if end<0: raise SystemExit('next function anchor not found')
new=r'''function renderNextServicePlan(v){
  const rules=rulesFor(v);
  const due=document.getElementById("nextServiceDue");
  const list=document.getElementById("nextServiceList");
  const serviceRule=rules.find(r=>r.id==="service");
  const serviceInfo=serviceRule?dueInfo(v,serviceRule):null;
  const dueItems=[];

  rules.forEach(rule=>{
    if(rule.manual) return;
    const info=dueInfo(v,rule);
    if(!info||!(info.status==="due"||info.status==="soon")) return;
    dueItems.push({id:rule.id,name:rule.name,note:info.detail||((info.status==="due")?"Jetzt fällig":"Bald fällig")});
  });

  if(!serviceInfo){
    due.innerHTML="<b>Nächster Service noch nicht berechenbar.</b><br>Bitte Kilometerstand und Fahrzeugdaten ergänzen.";
  }else{
    const last=lastRecord(v,"service");
    const target=[];
    if(serviceInfo.dueKm!==null&&serviceInfo.dueKm!==undefined) target.push(`${fmtKm(serviceInfo.dueKm)} km`);
    if(serviceInfo.dueDate) target.push(fmtDate(serviceInfo.dueDate));
    const lastText=last?`Letzter Service: ${fmtDate(last.date)}${last.mileage!==null&&last.mileage!==undefined&&last.mileage!==""?" · "+fmtKm(last.mileage)+" km":""}.<br>`:"Noch kein Service gespeichert.<br>";
    due.innerHTML=`<b>${lastText}</b>Nächster Service: ${target.length?target.join(" oder "):"nach hinterlegtem Wartungsplan"}.`;
  }

  list.innerHTML=dueItems.length
    ?nextServiceGrouped(dueItems)
    :`<div class="small-note">Aktuell ist keine Wartungsarbeit fällig oder bald fällig.</div>`;
}'''
s=s[:start]+new+s[end:]
p.write_text(s)
scripts=re.findall(r'<script>(.*?)</script>',s,re.S)
Path('/tmp/carservice.js').write_text('\n'.join(scripts))
subprocess.run(['node','--check','/tmp/carservice.js'],check=True)
assert 'Aktuell ist keine Wartungsarbeit fällig oder bald fällig.' in s
print('Overview next service now shows only due/soon items')
