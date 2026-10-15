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

  // Switching the vehicle already updates state + dashboard through renderAll().
  // The Peugeot-Service list used to remain untouched, so it showed the previous car.
  document.addEventListener('click',function(e){
    const button=e.target&&e.target.closest?e.target.closest('#vehicleTabs [data-vehicle]'):null;
    if(!button) return;
    setTimeout(refreshServiceForSelectedVehicle,0);
  },true);

  // Also protect against any other code path that changes the selected vehicle and calls renderAll().
  try{
    const originalRenderAll=renderAll;
    renderAll=function(){
      const serviceWasActive=isServicePageActive();
      const result=originalRenderAll.apply(this,arguments);
      if(serviceWasActive) setTimeout(refreshServiceForSelectedVehicle,0);
      return result;
    };
  }catch(e){}

  // Make the dashboard's "Nächster Service" panel explicit: when + what.
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

      // HU/AU is not part of a normal Peugeot service, but if it is due soon it should still
      // remain visible in the dashboard as an upcoming vehicle task.
      rules.filter(r=>r.hu).forEach(rule=>{
        const info=dueInfo(v,rule);
        if(info&&(info.status==='due'||info.status==='soon')){
          items.push({id:rule.id,name:rule.name,note:info.detail||info.label});
        }
      });

      // Remove duplicates while keeping the service as first item.
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

  // Refresh the currently visible page once after installation.
  try{
    renderDashboard();
    refreshServiceForSelectedVehicle();
  }catch(e){}
})();