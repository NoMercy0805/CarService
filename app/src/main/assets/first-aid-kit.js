(function(){
  if(window.__carserviceFirstAidKitInstalled) return;
  window.__carserviceFirstAidKitInstalled=true;

  function ensureStyle(){
    if(document.getElementById('first-aid-kit-style')) return;
    const style=document.createElement('style');
    style.id='first-aid-kit-style';
    style.textContent=`
      .first-aid-card{width:100%;display:grid;grid-template-columns:44px 1fr auto;gap:12px;align-items:center;text-align:left;margin:0 0 14px;padding:13px 14px;border:1px solid var(--rule);border-radius:16px;background:var(--surface2);color:var(--ink);box-shadow:0 4px 14px rgba(40,77,118,.055)}
      .first-aid-icon{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;font-size:24px;font-weight:900;background:var(--primary-soft);color:var(--primary)}
      .first-aid-card h4{margin:0 0 3px;font-size:13.5px;line-height:1.25}.first-aid-card p{margin:0;font-size:11px;line-height:1.35;color:var(--muted)}
      .first-aid-status{font-size:10px;font-weight:800;padding:5px 8px;border-radius:999px;white-space:nowrap}.first-aid-status.ok{background:var(--green-soft);color:var(--green)}.first-aid-status.soon{background:var(--orange-soft);color:var(--orange)}.first-aid-status.due{background:var(--red-soft);color:var(--red)}.first-aid-status.unknown{background:var(--primary-soft);color:var(--primary)}
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

  function monthValue(value){
    const s=String(value||'');
    return /^\d{4}-\d{2}/.test(s)?s.slice(0,7):'';
  }

  function monthEnd(value){
    const m=monthValue(value);
    if(!m) return '';
    const parts=m.split('-');
    const y=Number(parts[0]),mon=Number(parts[1]);
    const last=new Date(y,mon,0).getDate();
    return `${parts[0]}-${parts[1]}-${String(last).padStart(2,'0')}`;
  }

  function fmtMonth(value){
    const m=monthValue(value);
    if(!m) return '–';
    const p=m.split('-');
    return `${p[1]}/${p[0]}`;
  }

  function monthDiff(value){
    const m=monthValue(value);
    if(!m) return null;
    const p=m.split('-');
    const now=new Date();
    return (Number(p[0])*12+(Number(p[1])-1))-(now.getFullYear()*12+now.getMonth());
  }

  function applyVehicleCardDates(){
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
      dates.innerHTML='<span class="vehicle-card-date"><small>TÜV / HU</small><b>'+fmtMonth(v.huDue)+'</b></span><span class="vehicle-card-date"><small>Verbandskasten</small><b>'+fmtMonth(v.firstAidDue)+'</b></span>';
    });
  }

  function bindDirectSave(){
    const btn=document.getElementById('saveVehicleSettings');
    if(!btn || btn.dataset.firstAidSaveBound==='1') return;
    btn.dataset.firstAidSaveBound='1';
    btn.addEventListener('click',function(){
      const input=document.getElementById('settingsFirstAidDue');
      if(typeof vehicle==='function' && input){
        vehicle().firstAidDue=monthEnd(input.value);
      }
    },true);
  }

  function ensureSettingsField(){
    let input=document.getElementById('settingsFirstAidDue');
    if(!input){
      const hu=document.getElementById('settingsHuDue');
      if(!hu) return;
      const field=document.createElement('div');
      field.className='field';
      field.innerHTML='<label>Verbandskasten haltbar bis</label><input id="settingsFirstAidDue" class="input" type="month"><div class="help">Monat und Jahr laut Aufdruck des Verbandskastens.</div>';
      hu.closest('.field').insertAdjacentElement('afterend',field);
      input=document.getElementById('settingsFirstAidDue');
    }
    if(input){
      input.type='month';
      if(document.activeElement!==input) input.value=monthValue(vehicle().firstAidDue||'');
    }
    bindDirectSave();
    const sub=document.querySelector('[data-open-settings="fahrzeug"] .settings-nav-sub');
    if(sub) sub.textContent='Kennzeichen, Kilometer, FIN, HU, Verbandskasten und Wartungsplan';
  }

  function ensureDashboardCard(){
    let card=document.getElementById('firstAidDashboardCard');
    if(card) return card;
    const panel=document.querySelector('#page-dashboard .next-service-panel');
    if(!panel) return null;
    card=document.createElement('button');
    card.type='button';
    card.id='firstAidDashboardCard';
    card.className='first-aid-card';
    card.innerHTML='<span class="first-aid-icon">✚</span><span><h4>Verbandskasten</h4><p id="firstAidDashboardText">Ablaufdatum nicht eingetragen</p></span><span id="firstAidDashboardStatus" class="first-aid-status unknown">Offen</span>';
    card.onclick=()=>{ if(typeof openSettingsSub==='function') openSettingsSub('fahrzeug'); };
    panel.insertAdjacentElement('afterend',card);
    return card;
  }

  function renderFirstAid(){
    ensureStyle();
    ensureSettingsField();
    applyVehicleCardDates();
    const card=ensureDashboardCard();
    if(!card || typeof vehicle!=='function') return;
    const v=vehicle();
    const due=String(v.firstAidDue||'');
    const text=document.getElementById('firstAidDashboardText');
    const status=document.getElementById('firstAidDashboardStatus');
    status.className='first-aid-status';
    if(!monthValue(due)){
      text.textContent='Ablaufmonat nicht eingetragen · antippen zum Eintragen';
      status.classList.add('unknown');status.textContent='Offen';return;
    }
    const diff=monthDiff(due);
    if(diff<0){
      text.textContent='Abgelaufen seit '+fmtMonth(due)+' · bitte ersetzen';
      status.classList.add('due');status.textContent='Abgelaufen';
    }else if(diff===0){
      text.textContent='Läuft diesen Monat ab · '+fmtMonth(due);
      status.classList.add('soon');status.textContent='Diesen Monat';
    }else if(diff<=3){
      text.textContent='Haltbar bis '+fmtMonth(due);
      status.classList.add('soon');status.textContent='Bald';
    }else{
      text.textContent='Haltbar bis '+fmtMonth(due);
      status.classList.add('ok');status.textContent='Gültig';
    }
  }

  const originalRenderSettings=typeof renderSettings==='function'?renderSettings:null;
  if(originalRenderSettings){
    renderSettings=function(){
      originalRenderSettings();
      ensureSettingsField();
      const input=document.getElementById('settingsFirstAidDue');
      if(input) input.value=monthValue(vehicle().firstAidDue||'');
    };
  }

  const originalSaveVehicleSettings=typeof saveVehicleSettings==='function'?saveVehicleSettings:null;
  if(originalSaveVehicleSettings){
    saveVehicleSettings=function(){
      ensureSettingsField();
      const input=document.getElementById('settingsFirstAidDue');
      if(input) vehicle().firstAidDue=monthEnd(input.value);
      originalSaveVehicleSettings();
      renderFirstAid();
      applyVehicleCardDates();
    };
  }

  const originalRenderTabs=typeof renderTabs==='function'?renderTabs:null;
  if(originalRenderTabs){
    renderTabs=function(){
      const result=originalRenderTabs.apply(this,arguments);
      applyVehicleCardDates();
      return result;
    };
  }

  const originalRenderDashboard=typeof renderDashboard==='function'?renderDashboard:null;
  if(originalRenderDashboard){
    renderDashboard=function(){originalRenderDashboard();renderFirstAid();};
  }

  const originalRenderAll=typeof renderAll==='function'?renderAll:null;
  if(originalRenderAll){
    renderAll=function(){originalRenderAll();renderFirstAid();applyVehicleCardDates();};
  }

  ensureSettingsField();
  bindDirectSave();
  renderFirstAid();
  applyVehicleCardDates();
  setTimeout(function(){bindDirectSave();applyVehicleCardDates();},250);
  new MutationObserver(function(){bindDirectSave();applyVehicleCardDates();}).observe(document.documentElement,{childList:true,subtree:true});
})();
