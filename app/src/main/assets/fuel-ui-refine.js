(function(){
  if(window.__carserviceFuelUiRefineInstalled) return;
  window.__carserviceFuelUiRefineInstalled=true;

  function ensureStyle(){
    if(document.getElementById('carservice-fuel-ui-refine-style')) return;
    var style=document.createElement('style');
    style.id='carservice-fuel-ui-refine-style';
    style.textContent=`
      body.carservice-fuel-page-active #vehicleTabs{display:none!important}
      #carChipsRow{display:none!important}
      .fuel-vehicle-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0}
      .fuel-vehicle-card-grid .vehicle-tab{min-height:0!important;width:100%;margin:0}
      .fuel-vehicle-card-grid .vehicle-tab .vehicle-photo{height:86px}
      .fuel-vehicle-card-grid .vehicle-tab strong{font-size:14px}
      .fuel-vehicle-card-grid .vehicle-tab .vehicle-subline{font-size:9.5px!important}
      .fuel-row{cursor:pointer;transition:background .15s ease}
      .fuel-row:active{background:var(--paper)}
      .fuel-actions{max-height:0;opacity:0;overflow:hidden;margin-top:0;pointer-events:none;transition:max-height .2s ease,opacity .2s ease,margin-top .2s ease}
      .fuel-row[data-fuel-actions-open="1"] .fuel-actions{max-height:78px;opacity:1;margin-top:10px;pointer-events:auto}
      .fuel-actions{gap:10px!important}
      .fuel-action-wrap{gap:4px!important;min-width:56px!important}
      .fuel-icon-btn{width:36px!important;height:36px!important;border-radius:12px!important;padding:0!important;box-shadow:0 2px 8px rgba(0,0,0,.06)!important}
      .fuel-icon-btn svg{width:15px!important;height:15px!important;display:block}
      .fuel-icon-label{font-size:10px!important;line-height:1.15!important;font-weight:650!important;margin-top:0!important;color:var(--muted)!important}
      @media(max-width:390px){.fuel-vehicle-card-grid{gap:8px}.fuel-vehicle-card-grid .vehicle-tab .vehicle-photo{height:76px}.fuel-vehicle-card-grid .vehicle-tab strong{font-size:13px}}
    `;
    document.head.appendChild(style);
  }

  function syncTopVehicleVisibility(){
    var page=document.getElementById('page-fuel');
    document.body.classList.toggle('carservice-fuel-page-active',!!(page&&page.classList.contains('active')));
  }

  function hiddenProxy(carId){
    return document.querySelector('#carChipsRow .fuel-car-chip[data-car="'+String(carId).replace(/"/g,'\\"')+'"]');
  }

  function selectedCardIds(){
    return Array.from(document.querySelectorAll('#fuelVehicleCardGrid [data-fuel-vehicle-card].active')).map(function(card){
      return card.getAttribute('data-fuel-vehicle-card');
    });
  }

  function activateSelection(ids){
    var cards=Array.from(document.querySelectorAll('#fuelVehicleCardGrid [data-fuel-vehicle-card]'));
    if(!cards.length) return;
    var allIds=cards.map(function(card){return card.getAttribute('data-fuel-vehicle-card');});
    var targetIds=ids.filter(function(id){return allIds.indexOf(id)!==-1;});
    if(!targetIds.length) targetIds=[allIds[0]];

    var proxy=null;
    if(targetIds.length===allIds.length){
      proxy=hiddenProxy('__all__');
    }else{
      proxy=hiddenProxy(targetIds[0]);
    }
    if(proxy) proxy.click();
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
        var id=card.getAttribute('data-fuel-vehicle-card');
        var activeIds=selectedCardIds();
        var isActive=activeIds.indexOf(id)!==-1;
        var next=activeIds.slice();

        if(isActive){
          if(activeIds.length>1) next=activeIds.filter(function(x){return x!==id;});
          else return;
        }else{
          next.push(id);
        }

        activateSelection(next);
        setTimeout(syncVehicleCards,0);
      };
    });
    syncVehicleCards();
  }

  function syncVehicleCards(){
    var allProxy=hiddenProxy('__all__');
    var allActive=!!(allProxy&&allProxy.classList.contains('active'));
    document.querySelectorAll('#fuelVehicleCardGrid [data-fuel-vehicle-card]').forEach(function(card){
      var id=card.getAttribute('data-fuel-vehicle-card');
      var proxy=hiddenProxy(id);
      var active=allActive||!!(proxy&&proxy.classList.contains('active'));
      card.classList.toggle('active',active);
      card.setAttribute('aria-pressed',active?'true':'false');
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

  function removeOldTotalUi(){
    var old=document.querySelector('#page-fuel .fuel-all-row');
    if(old) old.remove();
  }

  function enhance(){
    ensureStyle();
    removeOldTotalUi();
    ensureVehicleCards();
    wireHistory();
    syncVehicleCards();
    syncTopVehicleVisibility();
  }

  function observe(){
    var page=document.getElementById('page-fuel');
    if(!page) return;
    var observer=new MutationObserver(function(mutations){
      var needsCardSync=false;
      mutations.forEach(function(m){
        if(m.target&&m.target.id==='carChipsRow') needsCardSync=true;
      });
      if(needsCardSync) syncVehicleCards();
      removeOldTotalUi();
      syncTopVehicleVisibility();
    });
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});

    var top=document.getElementById('vehicleTabs');
    if(top){
      new MutationObserver(function(){ensureVehicleCards();}).observe(top,{childList:true,subtree:true});
    }
  }

  enhance();
  setTimeout(function(){enhance();observe();},0);
})();