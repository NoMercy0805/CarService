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
    const card=ensureCard();
    if(!card || typeof vehicle!=='function') return;
    const v=vehicle();
    const due=String(v.huDue||'');
    const text=document.getElementById('huDashboardText');
    const badge=document.getElementById('huDashboardBadge');
    badge.className='hu-status-badge';
    if(!due){
      text.textContent='Nächster HU-Termin nicht eingetragen · antippen zum Eintragen';
      badge.classList.add('unknown');badge.textContent='Offen';return;
    }
    const days=typeof daysBetween==='function'?daysBetween(today(),due):Math.ceil((new Date(due+'T12:00:00')-new Date())/86400000);
    if(days<0){
      text.textContent='Überfällig seit '+(typeof fmtDate==='function'?fmtDate(due):due)+' · Termin vereinbaren';
      badge.classList.add('due');badge.textContent='Überfällig';
    }else if(days===0){
      text.textContent='Heute fällig';
      badge.classList.add('due');badge.textContent='Heute';
    }else if(days<=60){
      text.textContent='Fällig am '+(typeof fmtDate==='function'?fmtDate(due):due)+' · noch '+days+' '+(days===1?'Tag':'Tage');
      badge.classList.add('soon');badge.textContent='Bald';
    }else{
      text.textContent='Nächste HU am '+(typeof fmtDate==='function'?fmtDate(due):due);
      badge.classList.add('ok');badge.textContent='Gültig';
    }
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
