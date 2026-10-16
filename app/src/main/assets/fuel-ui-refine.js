(function(){
  if(window.__carserviceFuelUiRefineInstalled) return;
  window.__carserviceFuelUiRefineInstalled=true;

  function ensureStyle(){
    if(document.getElementById('carservice-fuel-ui-refine-style')) return;
    var style=document.createElement('style');
    style.id='carservice-fuel-ui-refine-style';
    style.textContent=`
      #carChipsRow .fuel-car-chip[data-car="__all__"]{display:none!important}
      .fuel-all-row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid var(--rule)}
      .fuel-all-row-label{font-size:10.5px;color:var(--muted);line-height:1.35}
      .fuel-all-btn{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:999px;padding:8px 11px;background:var(--paper);color:var(--muted);font-size:11px;font-weight:750;white-space:nowrap}
      .fuel-all-btn.active{background:var(--fuel-soft);color:var(--fuel);box-shadow:0 4px 12px rgba(0,0,0,.08)}
      .fuel-row{cursor:pointer;transition:background .15s ease}
      .fuel-row:active{background:var(--paper)}
      .fuel-actions{max-height:0;opacity:0;overflow:hidden;margin-top:0;pointer-events:none;transition:max-height .2s ease,opacity .2s ease,margin-top .2s ease}
      .fuel-row[data-fuel-actions-open="1"] .fuel-actions{max-height:54px;opacity:1;margin-top:7px;pointer-events:auto}
    `;
    document.head.appendChild(style);
  }

  function syncAllButton(){
    var proxy=document.querySelector('#carChipsRow .fuel-car-chip[data-car="__all__"]');
    var btn=document.getElementById('fuelAllVehiclesBtn');
    if(!btn) return;
    btn.classList.toggle('active',!!(proxy&&proxy.classList.contains('active')));
    btn.setAttribute('aria-pressed',proxy&&proxy.classList.contains('active')?'true':'false');
  }

  function ensureAllButton(){
    var box=document.querySelector('#page-fuel .fuel-car-box');
    if(!box||document.getElementById('fuelAllVehiclesBtn')) return;
    var row=document.createElement('div');
    row.className='fuel-all-row';
    row.innerHTML='<span class="fuel-all-row-label">Tankvorgänge beider Fahrzeuge zusammen</span><button id="fuelAllVehiclesBtn" class="fuel-all-btn" type="button" aria-label="Gesamt anzeigen"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg><span>Gesamt</span></button>';
    box.appendChild(row);
    document.getElementById('fuelAllVehiclesBtn').onclick=function(){
      var proxy=document.querySelector('#carChipsRow .fuel-car-chip[data-car="__all__"]');
      if(proxy) proxy.click();
      setTimeout(syncAllButton,0);
    };
    syncAllButton();
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
    ensureAllButton();
    wireHistory();
    syncAllButton();
  }

  function observe(){
    var page=document.getElementById('page-fuel');
    if(!page) return;
    var observer=new MutationObserver(function(){
      ensureAllButton();
      syncAllButton();
    });
    observer.observe(page,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }

  enhance();
  setTimeout(function(){enhance();observe();},0);
})();