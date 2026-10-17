(function(){
  if(window.__carserviceVehicleCardStatusInstalled) return;
  window.__carserviceVehicleCardStatusInstalled=true;

  function ensureStyle(){
    if(document.getElementById('vehicle-card-status-style')) return;
    const style=document.createElement('style');
    style.id='vehicle-card-status-style';
    style.textContent=`
      .vehicle-tabs{margin-top:10px!important;padding-top:2px!important}
      .vehicle-tab{min-height:212px!important}
      .vehicle-card-dates{display:grid!important;grid-template-columns:1fr 1fr!important;gap:6px!important;margin-top:8px!important;padding-top:8px!important;border-top:1px solid var(--rule)!important}
      .vehicle-card-date{min-width:0!important;padding:6px 7px!important;border-radius:9px!important;background:var(--paper)!important;color:var(--ink)!important}
      .vehicle-tab.active .vehicle-card-date{background:rgba(255,255,255,.72)!important}
      html[data-theme="dark"] .vehicle-tab.active .vehicle-card-date{background:rgba(15,17,22,.48)!important}
      .vehicle-card-date small{display:block!important;margin:0 0 2px!important;font-size:8.8px!important;line-height:1.1!important;font-weight:750!important;color:var(--muted)!important;white-space:nowrap!important}
      .vehicle-card-date b{display:block!important;font-size:10.5px!important;line-height:1.15!important;font-weight:800!important;color:var(--ink)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      #firstAidDashboardCard,#huDashboardCard{display:none!important}
      @media(max-width:390px){
        .vehicle-tabs{margin-top:8px!important}
        .vehicle-tab{min-height:202px!important}
        .vehicle-card-dates{gap:5px!important;margin-top:7px!important;padding-top:7px!important}
        .vehicle-card-date{padding:5px 6px!important}
        .vehicle-card-date small{font-size:8.3px!important}
        .vehicle-card-date b{font-size:9.8px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function monthText(value){
    const s=String(value||'');
    const m=s.match(/^(\d{4})-(\d{2})/);
    return m?m[2]+'/'+m[1]:'–';
  }

  function apply(){
    ensureStyle();
    if(typeof state==='undefined' || !state || !Array.isArray(state.vehicles)) return;
    document.querySelectorAll('.vehicle-tab[data-vehicle]').forEach(tab=>{
      const v=state.vehicles.find(x=>String(x.id)===String(tab.dataset.vehicle));
      if(!v) return;
      let dates=tab.querySelector('.vehicle-card-dates');
      if(!dates){
        dates=document.createElement('div');
        dates.className='vehicle-card-dates';
        tab.appendChild(dates);
      }
      dates.innerHTML=`<span class="vehicle-card-date"><small>TÜV / HU</small><b>${monthText(v.huDue)}</b></span><span class="vehicle-card-date"><small>Verbandskasten</small><b>${monthText(v.firstAidDue)}</b></span>`;
    });
  }

  const originalRenderTabs=typeof window.renderTabs==='function'?window.renderTabs:null;
  if(originalRenderTabs){
    window.renderTabs=function(){
      const result=originalRenderTabs.apply(this,arguments);
      apply();
      return result;
    };
  }

  const originalRenderAll=typeof window.renderAll==='function'?window.renderAll:null;
  if(originalRenderAll){
    window.renderAll=function(){
      const result=originalRenderAll.apply(this,arguments);
      apply();
      return result;
    };
  }

  apply();
  setTimeout(apply,0);
})();
