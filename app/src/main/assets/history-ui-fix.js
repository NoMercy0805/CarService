(function(){
  if(window.__carserviceHistoryInlineInstalled) return;
  window.__carserviceHistoryInlineInstalled=true;

  function ensureStyle(){
    if(document.getElementById('carservice-history-inline-style')) return;
    const style=document.createElement('style');
    style.id='carservice-history-inline-style';
    style.textContent=`
      .service-history-inline{margin-top:9px;display:flex;flex-direction:column;gap:5px}
      .service-history-inline-title{font-size:10.5px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.35px}
      .service-history-inline-item{display:grid;grid-template-columns:17px 1fr;gap:7px;align-items:start;font-size:11px;line-height:1.35;color:var(--ink)}
      .service-history-inline-check{width:16px;height:16px;border-radius:50%;display:grid;place-items:center;background:var(--green-soft);color:var(--green);font-size:9px;font-weight:900;margin-top:1px}
      .service-history-inline-note{margin-top:7px;padding-top:7px;border-top:1px solid var(--rule);font-size:10.5px;line-height:1.4;color:var(--muted)}
      .service-history-record{align-items:start}
    `;
    document.head.appendChild(style);
  }

  function addInlineDetails(){
    if(typeof vehicle!=='function' || typeof serviceHistoryInfo!=='function') return;
    const v=vehicle();
    if(!v) return;
    document.querySelectorAll('.service-history-record[data-service-details]').forEach(row=>{
      if(row.querySelector('.service-history-inline')) return;
      const id=row.dataset.serviceDetails;
      const base=(v.records||[]).find(r=>String(r.id)===String(id));
      if(!base) return;
      const info=serviceHistoryInfo(base,v);
      if(!info || !Array.isArray(info.items) || !info.items.length) return;
      const left=row.firstElementChild;
      if(!left) return;
      const box=document.createElement('div');
      box.className='service-history-inline';
      const title=document.createElement('div');
      title.className='service-history-inline-title';
      title.textContent='Durchgeführte Arbeiten';
      box.appendChild(title);
      info.items.forEach(name=>{
        const item=document.createElement('div');
        item.className='service-history-inline-item';
        const check=document.createElement('span');
        check.className='service-history-inline-check';
        check.textContent='✓';
        const text=document.createElement('span');
        text.textContent=name;
        item.append(check,text);
        box.appendChild(item);
      });
      if(info.note){
        const note=document.createElement('div');
        note.className='service-history-inline-note';
        note.textContent=info.note;
        box.appendChild(note);
      }
      left.appendChild(box);
    });
  }

  function install(){
    ensureStyle();
    if(typeof window.renderHistory==='function' && !window.renderHistory.__historyInlineWrapped){
      const original=window.renderHistory;
      const wrapped=function(){
        const result=original.apply(this,arguments);
        addInlineDetails();
        return result;
      };
      wrapped.__historyInlineWrapped=true;
      window.renderHistory=wrapped;
    }
    addInlineDetails();
  }

  install();
  setTimeout(install,0);
})();