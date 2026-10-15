(function(){
  if(window.__carserviceSaveFeedbackInstalled) return;
  window.__carserviceSaveFeedbackInstalled=true;

  function ensureStyle(){
    if(document.getElementById('carservice-save-feedback-style')) return;
    const style=document.createElement('style');
    style.id='carservice-save-feedback-style';
    style.textContent=`
      #vehicleSaveToast{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 18px);transform:translate(-50%,-12px);z-index:2000;display:flex;align-items:center;gap:9px;max-width:calc(100vw - 32px);padding:11px 15px;border-radius:14px;background:#173f2f;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.22);font-size:13px;font-weight:750;opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease}
      #vehicleSaveToast.show{opacity:1;transform:translate(-50%,0)}
      #vehicleSaveToast .save-check{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.18);font-size:14px}
      #saveVehicleSettings.saved-feedback{background:#169b62!important;color:#fff!important;transform:scale(.99)}
    `;
    document.head.appendChild(style);
  }

  function ensureToast(){
    let toast=document.getElementById('vehicleSaveToast');
    if(toast) return toast;
    toast=document.createElement('div');
    toast.id='vehicleSaveToast';
    toast.setAttribute('role','status');
    toast.setAttribute('aria-live','polite');
    toast.innerHTML='<span class="save-check">✓</span><span>Fahrzeugdaten wurden gespeichert</span>';
    document.body.appendChild(toast);
    return toast;
  }

  let hideTimer=null;
  function showSavedFeedback(){
    ensureStyle();
    const toast=ensureToast();
    const btn=document.getElementById('saveVehicleSettings');
    const oldText=btn?btn.textContent:'';
    if(btn){
      btn.classList.add('saved-feedback');
      btn.textContent='✓ Gespeichert';
      btn.disabled=true;
    }
    toast.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer=setTimeout(()=>{
      toast.classList.remove('show');
      if(btn){
        btn.classList.remove('saved-feedback');
        btn.textContent=oldText||'Fahrzeugdaten speichern';
        btn.disabled=false;
      }
    },1600);
  }

  function install(){
    ensureStyle();
    ensureToast();
    const btn=document.getElementById('saveVehicleSettings');
    if(!btn || btn.dataset.saveFeedbackBound==='1') return;
    btn.dataset.saveFeedbackBound='1';
    const currentSave=typeof window.saveVehicleSettings==='function'?window.saveVehicleSettings:null;
    if(!currentSave) return;
    btn.onclick=function(){
      const originalAlert=window.alert;
      window.alert=function(message){
        if(String(message)==='Fahrzeugdaten gespeichert.') return;
        return originalAlert(message);
      };
      try{
        currentSave();
      }finally{
        window.alert=originalAlert;
      }
      showSavedFeedback();
    };
  }

  install();
  setTimeout(install,250);
  new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();
