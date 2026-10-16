(function(){
  if(window.__carserviceRemindersInstalled) return;
  window.__carserviceRemindersInstalled=true;

  const bridge=window.AndroidBridge;
  if(!bridge || typeof bridge.syncReminderData!=='function') return;

  function vehicleLabel(v){
    const name=v.id==='508'?'Peugeot 508 SW':v.id==='2008'?'Peugeot 2008':'Fahrzeug';
    return v.licensePlate?name+' · '+v.licensePlate:name;
  }

  function buildReminderItems(){
    const items=[];
    try{
      if(typeof state==='undefined' || !state || !Array.isArray(state.vehicles)) return items;
      state.vehicles.forEach(v=>{
        const label=vehicleLabel(v);
        try{
          if(typeof rulesFor==='function' && typeof dueInfo==='function'){
            const serviceRule=rulesFor(v).find(r=>r.id==='service');
            if(serviceRule){
              const info=dueInfo(v,serviceRule);
              if(info && info.dueDate){
                items.push({type:'service',vehicleId:String(v.id),vehicle:label,dueDate:String(info.dueDate)});
              }
            }
          }
        }catch(e){}
        if(v.huDue){
          items.push({type:'hu',vehicleId:String(v.id),vehicle:label,dueDate:String(v.huDue)});
        }
        if(v.firstAidDue){
          items.push({type:'firstAid',vehicleId:String(v.id),vehicle:label,dueDate:String(v.firstAidDue)});
        }
      });
    }catch(e){}
    return items;
  }

  function sync(){
    try{bridge.syncReminderData(JSON.stringify(buildReminderItems()));}catch(e){}
  }

  function settings(){
    try{return JSON.parse(bridge.getReminderSettings?bridge.getReminderSettings():'{}')||{};}catch(e){return {};}
  }

  function ensureStyle(){
    if(document.getElementById('carservice-reminder-style')) return;
    const style=document.createElement('style');
    style.id='carservice-reminder-style';
    style.textContent=`
      .reminder-box{border:1px solid var(--rule);background:var(--paper);border-radius:15px;padding:14px;margin:12px 0 16px}
      .reminder-title{font-weight:800;font-size:14px;margin-bottom:5px}.reminder-note,.reminder-permission{font-size:11px;line-height:1.45;color:var(--muted)}
      .reminder-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid var(--rule)}.reminder-row:last-of-type{border-bottom:0}
      .reminder-row span{font-size:13px;font-weight:700}.reminder-row small{display:block;margin-top:2px;color:var(--muted);font-size:10.5px;font-weight:400}
      .reminder-switch{width:44px;height:25px;appearance:none;-webkit-appearance:none;background:var(--rule);border-radius:999px;position:relative;flex:0 0 auto;transition:.18s ease}
      .reminder-switch:after{content:'';position:absolute;left:3px;top:3px;width:19px;height:19px;border-radius:50%;background:white;box-shadow:0 1px 4px rgba(0,0,0,.22);transition:.18s ease}.reminder-switch:checked{background:var(--primary)}.reminder-switch:checked:after{transform:translateX(19px)}
      .reminder-permission{margin-top:10px}.reminder-box .secondary-btn{margin-top:8px}
    `;
    document.head.appendChild(style);
  }

  function installSettings(){
    const panel=document.getElementById('settingsDataPanel');
    if(!panel || document.getElementById('carserviceReminderBox')) return false;
    const cfg=settings();
    const box=document.createElement('div');
    box.id='carserviceReminderBox';
    box.className='reminder-box';
    box.innerHTML=`
      <div class="reminder-title">Benachrichtigungen</div>
      <div class="reminder-note">Erinnerung ab 30 Tage vor Fälligkeit und danach alle 3 Tage, bis der Termin aktualisiert wurde.</div>
      <label class="reminder-row"><span>Service<small>30 Tage vorher · alle 3 Tage</small></span><input class="reminder-switch" type="checkbox" data-reminder-type="service" ${cfg.service!==false?'checked':''}></label>
      <label class="reminder-row"><span>TÜV / HU<small>30 Tage vorher · alle 3 Tage</small></span><input class="reminder-switch" type="checkbox" data-reminder-type="hu" ${cfg.hu!==false?'checked':''}></label>
      <label class="reminder-row"><span>Verbandskasten<small>30 Tage vor Ablauf · alle 3 Tage</small></span><input class="reminder-switch" type="checkbox" data-reminder-type="firstAid" ${cfg.firstAid!==false?'checked':''}></label>
      <div id="carserviceReminderPermission" class="reminder-permission"></div>
      <button type="button" class="secondary-btn" id="carserviceReminderPermissionBtn" style="display:none">Benachrichtigungen erlauben</button>`;
    panel.appendChild(box);

    box.querySelectorAll('[data-reminder-type]').forEach(input=>{
      input.addEventListener('change',()=>{
        try{bridge.setReminderEnabled(input.dataset.reminderType,!!input.checked);}catch(e){}
        if(input.checked) requestPermission();
        sync();
        refreshPermission();
      });
    });
    document.getElementById('carserviceReminderPermissionBtn').onclick=requestPermission;
    refreshPermission();
    return true;
  }

  function permissionGranted(){
    try{return bridge.isReminderPermissionGranted?!!bridge.isReminderPermissionGranted():true;}catch(e){return true;}
  }

  function refreshPermission(){
    const text=document.getElementById('carserviceReminderPermission');
    const btn=document.getElementById('carserviceReminderPermissionBtn');
    if(!text || !btn) return;
    const ok=permissionGranted();
    text.textContent=ok?'Android-Benachrichtigungen sind erlaubt.':'Android-Benachrichtigungen sind noch nicht erlaubt.';
    btn.style.display=ok?'none':'block';
  }

  function requestPermission(){
    try{if(!permissionGranted() && bridge.requestReminderPermission) bridge.requestReminderPermission();}catch(e){}
    setTimeout(refreshPermission,700);
  }

  const originalSetItem=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
    const result=originalSetItem.apply(this,arguments);
    if(this===localStorage && String(key)==='carservice_v1') setTimeout(sync,0);
    return result;
  };

  ensureStyle();
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    const ready=(typeof state!=='undefined' && typeof rulesFor==='function' && typeof dueInfo==='function');
    if(ready){
      sync();
      installSettings();
      if(!permissionGranted()) requestPermission();
      clearInterval(timer);
    }else if(tries>40){clearInterval(timer);}
  },100);

  const observer=new MutationObserver(()=>{installSettings();refreshPermission();});
  observer.observe(document.body,{childList:true,subtree:true});
})();
