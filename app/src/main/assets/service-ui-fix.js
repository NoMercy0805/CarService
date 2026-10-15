(function(){
  if(window.__carServiceVehicleServiceSyncInstalled) return;
  window.__carServiceVehicleServiceSyncInstalled=true;

  function isServicePageActive(){
    const page=document.getElementById('page-service');
    return !!(page&&page.classList.contains('active'));
  }

  function refreshServiceForSelectedVehicle(){
    if(!isServicePageActive()) return;
    try{ openServiceChecklist(); }catch(e){ console.error('Service refresh failed',e); }
  }

  document.addEventListener('click',function(e){
    const button=e.target&&e.target.closest?e.target.closest('#vehicleTabs [data-vehicle]'):null;
    if(!button) return;
    setTimeout(refreshServiceForSelectedVehicle,0);
  },true);

  try{
    const originalRenderAll=renderAll;
    renderAll=function(){
      const serviceWasActive=isServicePageActive();
      const result=originalRenderAll.apply(this,arguments);
      if(serviceWasActive) setTimeout(refreshServiceForSelectedVehicle,0);
      return result;
    };
  }catch(e){}

  try{
    renderNextServicePlan=function(v){
      const rules=rulesFor(v);
      const due=document.getElementById('nextServiceDue');
      const list=document.getElementById('nextServiceList');
      const serviceRule=rules.find(r=>r.id==='service');
      const serviceInfo=serviceRule?dueInfo(v,serviceRule):null;
      const plan=servicePlan(v);

      if(!serviceInfo){
        due.innerHTML='<b>Nächster Service noch nicht berechenbar.</b><br>Bitte Kilometerstand und Fahrzeugdaten ergänzen.';
      }else if(serviceInfo.status==='unknown'){
        due.innerHTML='<b>Fälligkeit noch nicht berechenbar.</b><br>Letzten Service mit Datum und Kilometerstand nachtragen.';
      }else{
        const targets=[];
        if(serviceInfo.dueKm!==null&&serviceInfo.dueKm!==undefined) targets.push('bei <b>'+fmtKm(serviceInfo.dueKm)+' km</b>');
        if(serviceInfo.dueDate) targets.push('am <b>'+fmtDate(serviceInfo.dueDate)+'</b>');
        const status=serviceInfo.status==='due'?'<b>Jetzt fällig.</b> ':serviceInfo.status==='soon'?'<b>Bald fällig.</b> ':'';
        due.innerHTML=status+'Nächster Peugeot-Service '+(targets.length?targets.join(' oder '):'nach Wartungsplan')+'.';
      }

      const items=[];
      if(serviceRule){
        let note='Regulärer Peugeot-Service';
        if(serviceInfo&&serviceInfo.status!=='unknown'){
          const target=[];
          if(serviceInfo.dueKm!==null&&serviceInfo.dueKm!==undefined) target.push(fmtKm(serviceInfo.dueKm)+' km');
          if(serviceInfo.dueDate) target.push(fmtDate(serviceInfo.dueDate));
          if(target.length) note='Fällig '+target.join(' oder ');
        }else if(serviceInfo&&serviceInfo.detail){
          note=serviceInfo.detail;
        }
        items.push({id:'service',name:serviceRule.name,note});
      }

      (plan.extras||[]).forEach(entry=>{
        if(!entry||!entry.rule) return;
        const info=entry.info||dueInfo(v,entry.rule);
        items.push({
          id:entry.rule.id,
          name:entry.rule.name,
          note:info&&info.detail?info.detail:'Beim nächsten Service durchführen'
        });
      });

      rules.filter(r=>r.hu).forEach(rule=>{
        const info=dueInfo(v,rule);
        if(info&&(info.status==='due'||info.status==='soon')){
          items.push({id:rule.id,name:rule.name,note:info.detail||info.label});
        }
      });

      const seen=new Set();
      const unique=items.filter(item=>{
        if(!item.id||seen.has(item.id)) return false;
        seen.add(item.id);return true;
      });

      list.innerHTML=unique.length
        ?nextServiceGrouped(unique)
        :'<div class="small-note">Aktuell ist kein Service planbar. Bitte Wartungshistorie ergänzen.</div>';

      const overviewConfirm=document.getElementById('overviewConfirmServiceBtn');
      if(overviewConfirm) overviewConfirm.style.display=unique.length?'block':'none';
    };
  }catch(e){ console.error('Dashboard service patch failed',e); }

  try{
    renderDashboard();
    refreshServiceForSelectedVehicle();
  }catch(e){}
})();

(function(){
  if(window.__carserviceHistoryInlineInstalled) return;
  window.__carserviceHistoryInlineInstalled=true;

  function ensureHistoryStyle(){
    if(document.getElementById('carservice-history-inline-style')) return;
    const style=document.createElement('style');
    style.id='carservice-history-inline-style';
    style.textContent='.service-history-inline{margin-top:9px;display:flex;flex-direction:column;gap:5px}.service-history-inline-title{font-size:10.5px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.35px}.service-history-inline-item{display:grid;grid-template-columns:17px 1fr;gap:7px;align-items:start;font-size:11px;line-height:1.35;color:var(--ink)}.service-history-inline-check{width:16px;height:16px;border-radius:50%;display:grid;place-items:center;background:var(--green-soft);color:var(--green);font-size:9px;font-weight:900;margin-top:1px}.service-history-inline-note{margin-top:7px;padding-top:7px;border-top:1px solid var(--rule);font-size:10.5px;line-height:1.4;color:var(--muted)}.service-history-record{align-items:start}';
    document.head.appendChild(style);
  }

  function addInlineDetails(){
    try{
      const v=vehicle();
      document.querySelectorAll('.service-history-record[data-service-details]').forEach(row=>{
        if(row.querySelector('.service-history-inline')) return;
        const base=(v.records||[]).find(r=>String(r.id)===String(row.dataset.serviceDetails));
        if(!base) return;
        const info=serviceHistoryInfo(base,v);
        if(!info||!Array.isArray(info.items)||!info.items.length) return;
        const left=row.firstElementChild;
        if(!left) return;
        const box=document.createElement('div');
        box.className='service-history-inline';
        const title=document.createElement('div');
        title.className='service-history-inline-title';
        title.textContent='Durchgeführte Arbeiten';
        box.appendChild(title);
        info.items.forEach(name=>{
          const item=document.createElement('div');
          item.className='service-history-inline-item';
          const check=document.createElement('span');
          check.className='service-history-inline-check';
          check.textContent='✓';
          const text=document.createElement('span');
          text.textContent=name;
          item.append(check,text);
          box.appendChild(item);
        });
        if(info.note){
          const note=document.createElement('div');
          note.className='service-history-inline-note';
          note.textContent=info.note;
          box.appendChild(note);
        }
        left.appendChild(box);
      });
    }catch(e){console.error('History inline details failed',e);}
  }

  ensureHistoryStyle();
  try{
    const originalRenderHistory=renderHistory;
    renderHistory=function(){
      const result=originalRenderHistory.apply(this,arguments);
      addInlineDetails();
      return result;
    };
  }catch(e){}
  addInlineDetails();
})();