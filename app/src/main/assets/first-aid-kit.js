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
      input.value=monthValue(vehicle().firstAidDue||'');
    }
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
      const chosen=input?input.value:'';
      originalSaveVehicleSettings();
      vehicle().firstAidDue=monthEnd(chosen);
      save();
      renderAll();
      renderFirstAid();
    };
  }

  const originalRenderDashboard=typeof renderDashboard==='function'?renderDashboard:null;
  if(originalRenderDashboard){
    renderDashboard=function(){originalRenderDashboard();renderFirstAid();};
  }

  const originalRenderAll=typeof renderAll==='function'?renderAll:null;
  if(originalRenderAll){
    renderAll=function(){originalRenderAll();renderFirstAid();};
  }

  renderFirstAid();
})();
