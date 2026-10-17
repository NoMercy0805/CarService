(function(){
  if(window.__carserviceHuStatusInstalled) return;
  window.__carserviceHuStatusInstalled=true;

  function ensureStyle(){
    if(document.getElementById('hu-status-style')) return;
    const style=document.createElement('style');
    style.id='hu-status-style';
    style.textContent=`
      .hu-status-card{width:100%;display:grid;grid-template-columns:44px 1fr auto;gap:12px;align-items:center;text-align:left;margin:0 0 14px;padding:13px 14px;border:1px solid var(--rule);border-radius:16px;background:var(--surface2);color:var(--ink);box-shadow:0 4px 14px rgba(40,77,118,.055)}
      .hu-status-icon{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:var(--primary-soft);color:var(--primary)}
      .hu-status-icon svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .hu-status-card h4{margin:0 0 3px;font-size:13.5px;line-height:1.25}.hu-status-card p{margin:0;font-size:11px;line-height:1.35;color:var(--muted)}
      .hu-status-badge{font-size:10px;font-weight:800;padding:5px 8px;border-radius:999px;white-space:nowrap}.hu-status-badge.ok{background:var(--green-soft);color:var(--green)}.hu-status-badge.soon{background:var(--orange-soft);color:var(--orange)}.hu-status-badge.due{background:var(--red-soft);color:var(--red)}.hu-status-badge.unknown{background:var(--primary-soft);color:var(--primary)}
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
    const p=m.split('-');
    const last=new Date(Number(p[0]),Number(p[1]),0).getDate();
    return `${p[0]}-${p[1]}-${String(last).padStart(2,'0')}`;
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

  function normalizeSettingsInput(){
    const input=document.getElementById('settingsHuDue');
    if(!input || typeof vehicle!=='function') return;
    input.type='month';
    input.value=monthValue(vehicle().huDue||'');
    const field=input.closest('.field');
    if(field){
      const label=field.querySelector('label');
      if(label) label.textContent='Nächste HU / TÜV';
      let help=field.querySelector('.hu-month-help');
      if(!help){
        help=document.createElement('div');
        help.className='help hu-month-help';
        field.appendChild(help);
      }
      help.textContent='Monat und Jahr laut HU-Plakette bzw. Prüfbericht.';
    }
  }

  function ensureCard(){
    let card=document.getElementById('huDashboardCard');
    if(card) return card;
    const firstAid=document.getElementById('firstAidDashboardCard');
    const panel=document.querySelector('#page-dashboard .next-service-panel');
    if(!panel) return null;
    card=document.createElement('button');
    card.type='button';
    card.id='huDashboardCard';
    card.className='hu-status-card';
    card.innerHTML='<span class="hu-status-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 9h16"/><path d="m8.5 14 2 2 4-4"/></svg></span><span><h4>TÜV / HU</h4><p id="huDashboardText">Nächster Termin nicht eingetragen</p></span><span id="huDashboardBadge" class="hu-status-badge unknown">Offen</span>';
    card.onclick=()=>{ if(typeof openSettingsSub==='function') openSettingsSub('fahrzeug'); };
    if(firstAid) firstAid.insertAdjacentElement('afterend',card);
    else panel.insertAdjacentElement('afterend',card);
    return card;
  }

  function renderHuStatus(){
    ensureStyle();
    normalizeSettingsInput();
    const card=ensureCard();
    if(!card || typeof vehicle!=='function') return;
    const v=vehicle();
    const due=String(v.huDue||'');
    const text=document.getElementById('huDashboardText');
    const badge=document.getElementById('huDashboardBadge');
    badge.className='hu-status-badge';
    if(!monthValue(due)){
      text.textContent='Nächster HU-Monat nicht eingetragen · antippen zum Eintragen';
      badge.classList.add('unknown');badge.textContent='Offen';return;
    }
    const diff=monthDiff(due);
    if(diff<0){
      text.textContent='Überfällig seit '+fmtMonth(due)+' · Termin vereinbaren';
      badge.classList.add('due');badge.textContent='Überfällig';
    }else if(diff===0){
      text.textContent='Diesen Monat fällig · '+fmtMonth(due);
      badge.classList.add('soon');badge.textContent='Diesen Monat';
    }else if(diff<=2){
      text.textContent='Fällig '+fmtMonth(due);
      badge.classList.add('soon');badge.textContent='Bald';
    }else{
      text.textContent='Nächste HU '+fmtMonth(due);
      badge.classList.add('ok');badge.textContent='Gültig';
    }
  }

  const originalRenderSettings=typeof renderSettings==='function'?renderSettings:null;
  if(originalRenderSettings){
    renderSettings=function(){
      originalRenderSettings();
      normalizeSettingsInput();
    };
  }

  const originalSaveVehicleSettings=typeof saveVehicleSettings==='function'?saveVehicleSettings:null;
  if(originalSaveVehicleSettings){
    saveVehicleSettings=function(){
      normalizeSettingsInput();
      const input=document.getElementById('settingsHuDue');
      const chosen=input?input.value:'';
      originalSaveVehicleSettings();
      vehicle().huDue=monthEnd(chosen);
      save();
      renderAll();
      renderHuStatus();
    };
  }

  const originalRenderDashboard=typeof renderDashboard==='function'?renderDashboard:null;
  if(originalRenderDashboard){
    renderDashboard=function(){originalRenderDashboard();renderHuStatus();};
  }

  const originalRenderAll=typeof renderAll==='function'?renderAll:null;
  if(originalRenderAll){
    renderAll=function(){originalRenderAll();renderHuStatus();};
  }

  renderHuStatus();
})();
