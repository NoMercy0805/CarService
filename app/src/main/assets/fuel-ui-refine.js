(function(){
  if(window.__carserviceFuelUiRefineInstalled) return;
  window.__carserviceFuelUiRefineInstalled=true;

  function ensureStyle(){
    if(document.getElementById('carservice-fuel-ui-refine-style')) return;
    var style=document.createElement('style');
    style.id='carservice-fuel-ui-refine-style';
    style.textContent=`
      #carChipsRow{display:none!important}
      .fuel-vehicle-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0}
      .fuel-vehicle-card-grid .vehicle-tab{min-height:0!important;width:100%;margin:0}
      .fuel-vehicle-card-grid .vehicle-tab .vehicle-photo{height:86px}
      .fuel-vehicle-card-grid .vehicle-tab strong{font-size:14px}
      .fuel-vehicle-card-grid .vehicle-tab .vehicle-subline{font-size:9.5px!important}
      .fuel-all-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid var(--rule)}
      .fuel-all-row-label{font-size:10.5px;color:var(--muted);line-height:1.35}
      .fuel-all-btn{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:999px;padding:8px 11px;background:var(--paper);color:var(--muted);font-size:11px;font-weight:750;white-space:nowrap}
      .fuel-all-btn.active{background:var(--fuel-soft);color:var(--fuel);box-shadow:0 4px 12px rgba(0,0,0,.08)}
      .fuel-row{cursor:pointer;transition:background .15s ease}
      .fuel-row:active{background:var(--paper)}
      .fuel-actions{max-height:0;opacity:0;overflow:hidden;margin-top:0;pointer-events:none;transition:max-height .2s ease,opacity .2s ease,margin-top .2s ease}
      .fuel-row[data-fuel-actions-open="1"] .fuel-actions{max-height:54px;opacity:1;margin-top:7px;pointer-events:auto}
      @media(max-width:390px){.fuel-vehicle-card-grid{gap:8px}.fuel-vehicle-card-grid .vehicle-tab .vehicle-photo{height:76px}.fuel-vehicle-card-grid .vehicle-tab strong{font-size:13px}}
    `;
    document.head.appendChild(style);
  }

  function hiddenProxy(carId){
    return document.querySelector('#carChipsRow .fuel-car-chip[data-car="'+String(carId).replace(/"/g,'\\"')+'"]');
  }

  function syncAllButton(){
    var proxy=hiddenProxy('__all__');
    var btn=document.getElementById('fuelAllVehiclesBtn');
    if(!btn) return;
    var active=!!(proxy&&proxy.classList.contains('active'));
    btn.classList.toggle('active',active);
    btn.setAttribute('aria-pressed',active?'true':'false');
  }

  function ensureAllButton(){
    var box=document.querySelector('#page-fuel .fuel-car-box');
    if(!box||document.getElementById('fuelAllVehiclesBtn')) return;
    var row=document.createElement('div');
    row.className='fuel-all-row';
    row.innerHTML='<span class="fuel-all-row-label">Tankvorgänge beider Fahrzeuge zusammen</span><button id="fuelAllVehiclesBtn" class="fuel-all-btn" type="button" aria-label="Gesamt anzeigen"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg><span>Gesamt</span></button>';
    box.appendChild(row);
    document.getElementById('fuelAllVehiclesBtn').onclick=function(){
      var proxy=hiddenProxy('__all__');
      if(proxy) proxy.click();
      setTimeout(function(){syncVehicleCards();syncAllButton();},0);
    };
    syncAllButton();
  }

  function ensureVehicleCards(){
    var box=document.querySelector('#page-fuel .fuel-car-box');
    if(!box) return;
    var grid=document.getElementById('fuelVehicleCardGrid');
    if(!grid){
      grid=document.createElement('div');
      grid.id='fuelVehicleCardGrid';
      grid.className='fuel-vehicle-card-grid';
      box.insertBefore(grid,box.firstChild);
    }

    var sourceCards=document.querySelectorAll('#vehicleTabs .vehicle-tab[data-vehicle]');
    if(!sourceCards.length) return;
    var html='';
    sourceCards.forEach(function(source){
      var id=source.getAttribute('data-vehicle');
      var clone=source.cloneNode(true);
      clone.removeAttribute('onclick');
      clone.classList.remove('active');
      clone.setAttribute('data-fuel-vehicle-card',id);
      clone.setAttribute('aria-label',(source.querySelector('strong')?source.querySelector('strong').textContent:id)+' Tankliste anzeigen');
      var check=clone.querySelector('.vehicle-check');
      if(check) check.textContent='';
      html+=clone.outerHTML;
    });
    grid.innerHTML=html;

    grid.querySelectorAll('[data-fuel-vehicle-card]').forEach(function(card){
      card.onclick=function(){
        var proxy=hiddenProxy(card.getAttribute('data-fuel-vehicle-card'));
        if(proxy) proxy.click();
        setTimeout(function(){syncVehicleCards();syncAllButton();},0);
      };
    });
    syncVehicleCards();
  }

  function syncVehicleCards(){
    document.querySelectorAll('#fuelVehicleCardGrid [data-fuel-vehicle-card]').forEach(function(card){
      var id=card.getAttribute('data-fuel-vehicle-card');
      var proxy=hiddenProxy(id);
      var active=!!(proxy&&proxy.classList.contains('active'));
      card.classList.toggle('active',active);
      var check=card.querySelector('.vehicle-check');
      if(check) check.textContent=active?'✓':'';
    });
  }

  function closeOtherRows(except){
    document.querySelectorAll('#fuelHistoryList .fuel-row[data-fuel-actions-open="1"]').forEach(function(row){
      if(row!==except) row.removeAttribute('data-fuel-actions-open');
    });
  }

  function wireHistory(){
    var list=document.getElementById('fuelHistoryList');
    if(!list||list.__fuelExpandWired) return;
    list.__fuelExpandWired=true;
    list.addEventListener('click',function(e){
      var row=e.target.closest&&e.target.closest('.fuel-row');
      if(!row||!list.contains(row)) return;
      if(e.target.closest('[data-fuel-action]')) return;
      var open=row.getAttribute('data-fuel-actions-open')==='1';
      closeOtherRows(row);
      if(open) row.removeAttribute('data-fuel-actions-open');
      else row.setAttribute('data-fuel-actions-open','1');
    });
  }

  function enhance(){
    ensureStyle();
    ensureVehicleCards();
    ensureAllButton();
    wireHistory();
    syncVehicleCards();
    syncAllButton();
  }

  function observe(){
    var page=document.getElementById('page-fuel');
    if(!page) return;
    var observer=new MutationObserver(function(mutations){
      var needsCardSync=false;
      mutations.forEach(function(m){
        if(m.target&&m.target.id==='carChipsRow') needsCardSync=true;
      });
      if(needsCardSync){syncVehicleCards();syncAllButton();}
      ensureAllButton();
    });
    observer.observe(page,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});

    var top=document.getElementById('vehicleTabs');
    if(top){
      new MutationObserver(function(){ensureVehicleCards();}).observe(top,{childList:true,subtree:true});
    }
  }

  enhance();
  setTimeout(function(){enhance();observe();},0);
})();