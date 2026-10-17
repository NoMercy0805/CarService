(function(){
  if(window.__carserviceHuStatusInstalled) return;
  window.__carserviceHuStatusInstalled=true;

  function ensureStyle(){
    if(document.getElementById('hu-status-style')) return;
    const style=document.createElement('style');
    style.id='hu-status-style';
    style.textContent=`
      #firstAidDashboardCard,#huDashboardCard{display:none!important}
      .due-status-strip{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 14px}
      .due-status-tile{width:100%;text-align:left;border:1px solid var(--rule);border-radius:15px;background:var(--surface2);padding:12px 13px;box-shadow:0 4px 14px rgba(40,77,118,.055);color:var(--ink)}
      .due-status-tile span{display:block;font-size:10.5px;font-weight:800;color:var(--muted);margin-bottom:4px}
      .due-status-tile b{display:block;font-size:15px;line-height:1.15;color:var(--ink)}
      .due-status-tile small{display:block;margin-top:4px;font-size:10px;line-height:1.25;color:var(--muted)}
      .due-status-tile.ok{border-color:rgba(0,169,113,.30)}
      .due-status-tile.soon{border-color:rgba(230,135,0,.42);background:var(--orange-soft)}
      .due-status-tile.due{border-color:rgba(227,66,42,.38);background:var(--red-soft)}
      .due-status-tile.unknown{border-color:rgba(47,128,237,.25)}
      @media(max-width:390px){.due-status-strip{gap:8px}.due-status-tile{padding:11px}.due-status-tile b{font-size:14px}}
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

  function statusFor(value,soonMonths){
    const diff=monthDiff(value);
    if(diff===null) return {cls:'unknown',text:'Nicht eingetragen'};
    if(diff<0) return {cls:'due',text:'Überfällig'};
    if(diff===0) return {cls:'soon',text:'Diesen Monat'};
    if(diff<=soonMonths) return {cls:'soon',text:'Bald fällig'};
    return {cls:'ok',text:'Gültig'};
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

  function ensureStatusStrip(){
    const panel=document.querySelector('#page-dashboard .next-service-panel');
    if(!panel) return null;
    let strip=document.getElementById('dueStatusStrip');
    if(!strip){
      strip=document.createElement('div');
      strip.id='dueStatusStrip';
      strip.className='due-status-strip';
      strip.innerHTML='<button type="button" id="dueStatusHu" class="due-status-tile"><span>TÜV / HU</span><b>–</b><small>Nicht eingetragen</small></button><button type="button" id="dueStatusFirstAid" class="due-status-tile"><span>Verbandskasten</span><b>–</b><small>Nicht eingetragen</small></button>';
      panel.insertAdjacentElement('beforebegin',strip);
      strip.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{ if(typeof openSettingsSub==='function') openSettingsSub('fahrzeug'); });
    }
    return strip;
  }

  function renderStatusStrip(){
    ensureStyle();
    const strip=ensureStatusStrip();
    if(!strip || typeof vehicle!=='function') return;
    const v=vehicle();
    const hu=statusFor(v.huDue,2);
    const aid=statusFor(v.firstAidDue,3);
    const huTile=document.getElementById('dueStatusHu');
    const aidTile=document.getElementById('dueStatusFirstAid');
    if(huTile){huTile.className='due-status-tile '+hu.cls;huTile.querySelector('b').textContent=fmtMonth(v.huDue);huTile.querySelector('small').textContent=hu.text;}
    if(aidTile){aidTile.className='due-status-tile '+aid.cls;aidTile.querySelector('b').textContent=fmtMonth(v.firstAidDue);aidTile.querySelector('small').textContent=aid.text;}
  }

  function renderHuStatus(){
    ensureStyle();
    normalizeSettingsInput();
    renderStatusStrip();
  }

  const originalRenderSettings=typeof renderSettings==='function'?renderSettings:null;
  if(originalRenderSettings){
    renderSettings=function(){originalRenderSettings();normalizeSettingsInput();};
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
