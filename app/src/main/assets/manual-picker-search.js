(function(){
  if(window.__carserviceManualPickerSearchInstalled) return;
  window.__carserviceManualPickerSearchInstalled=true;

  function ensureStyle(){
    if(document.getElementById('manual-picker-search-style')) return;
    const style=document.createElement('style');
    style.id='manual-picker-search-style';
    style.textContent=`
      .manual-picker-search-wrap{position:sticky;top:0;z-index:2;padding:8px 8px 7px;background:var(--surface,#fff);border-bottom:1px solid var(--rule)}
      .manual-picker-search{width:100%;box-sizing:border-box;border:1px solid var(--rule);border-radius:12px;background:var(--paper,#fff);color:var(--ink);padding:10px 12px;font:inherit;font-size:13px;outline:none}
      .manual-picker-search:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent)}
      .manual-picker-empty{padding:14px 12px;color:var(--muted);font-size:12px;text-align:center;display:none}
    `;
    document.head.appendChild(style);
  }

  function installSearch(){
    const picker=document.getElementById('manualPresetPicker');
    if(!picker || picker.querySelector('.manual-picker-search')) return;

    const wrap=document.createElement('div');
    wrap.className='manual-picker-search-wrap';
    wrap.innerHTML='<input class="manual-picker-search" type="search" inputmode="search" autocomplete="off" placeholder="Wartung durchsuchen …" aria-label="Wartung durchsuchen">';
    picker.prepend(wrap);

    const empty=document.createElement('div');
    empty.className='manual-picker-empty';
    empty.textContent='Keine passende Wartung gefunden.';
    picker.appendChild(empty);

    const input=wrap.querySelector('input');
    const filter=()=>{
      const q=(input.value||'').trim().toLocaleLowerCase('de-DE');
      let visibleCount=0;
      picker.querySelectorAll('.manual-picker-group').forEach(group=>{
        let groupVisible=0;
        group.querySelectorAll('.manual-picker-item').forEach(item=>{
          const match=!q || item.textContent.toLocaleLowerCase('de-DE').includes(q);
          item.style.display=match?'':'none';
          if(match){groupVisible++;visibleCount++;}
        });
        group.style.display=groupVisible?'':'none';
      });
      empty.style.display=visibleCount?'none':'block';
    };
    input.addEventListener('input',filter);

    const toggle=document.getElementById('manualPresetToggle');
    if(toggle){
      toggle.addEventListener('click',()=>{
        setTimeout(()=>{
          if(picker.classList.contains('open')){
            input.value='';
            filter();
            input.focus({preventScroll:true});
          }
        },0);
      });
    }
  }

  const originalRender=typeof window.renderManualPresetPicker==='function'?window.renderManualPresetPicker:null;
  if(originalRender){
    window.renderManualPresetPicker=function(){
      const result=originalRender.apply(this,arguments);
      installSearch();
      return result;
    };
  }

  ensureStyle();
  installSearch();
  setTimeout(installSearch,0);
})();
