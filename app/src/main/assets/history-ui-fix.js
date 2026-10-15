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

      #historyList .record{cursor:pointer;position:relative;transition:transform .12s ease}
      #historyList .record:active{transform:scale(.995)}
      #historyList .record .record-actions .history-edit-btn,
      #historyList .record .record-actions .history-delete-btn{display:none!important}

      .history-row-actions{
        grid-column:1/-1;
        display:flex;
        justify-content:flex-end;
        gap:10px;
        width:100%;
        max-height:0;
        opacity:0;
        overflow:hidden;
        margin-top:0;
        pointer-events:none;
        transition:max-height .2s ease,opacity .2s ease,margin-top .2s ease;
      }
      #historyList .record[data-history-actions-open="1"] .history-row-actions{
        max-height:78px;
        opacity:1;
        margin-top:10px;
        pointer-events:auto;
      }
      .history-action-icon-wrap{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:56px;color:var(--muted)}
      .history-action-icon-btn{
        width:36px;height:36px;border-radius:12px;display:grid;place-items:center;padding:0;border:0;
        background:var(--paper);color:var(--ink);box-shadow:0 2px 8px rgba(0,0,0,.06);cursor:pointer;
      }
      .history-action-icon-btn svg{width:15px;height:15px;display:block}
      .history-action-icon-btn.danger{background:var(--red-soft);color:var(--red)}
      .history-action-icon-label{font-size:10px;line-height:1.15;color:var(--muted);font-weight:650}
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

  function makeActions(row,id){
    let actions=row.querySelector('.history-row-actions');
    if(actions) return actions;
    actions=document.createElement('div');
    actions.className='history-row-actions';
    actions.innerHTML=`
      <span class="history-action-icon-wrap" data-history-row-action="edit">
        <button type="button" class="history-action-icon-btn" data-history-row-action="edit" aria-label="Bearbeiten" title="Bearbeiten">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        <span class="history-action-icon-label">Bearbeiten</span>
      </span>
      <span class="history-action-icon-wrap" data-history-row-action="delete">
        <button type="button" class="history-action-icon-btn danger" data-history-row-action="delete" aria-label="Löschen" title="Löschen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
        <span class="history-action-icon-label">Löschen</span>
      </span>`;
    row.appendChild(actions);

    actions.querySelectorAll('[data-history-row-action="edit"]').forEach(el=>el.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      if(typeof openHistoryEdit==='function') openHistoryEdit(id);
    }));
    actions.querySelectorAll('[data-history-row-action="delete"]').forEach(el=>el.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      if(typeof deleteHistoryRecord==='function') deleteHistoryRecord(id);
    }));
    return actions;
  }

  function closeOtherRows(exceptRow){
    document.querySelectorAll('#historyList .record').forEach(row=>{
      if(row!==exceptRow) row.removeAttribute('data-history-actions-open');
    });
  }

  function wireHistoryRows(){
    document.querySelectorAll('#historyList .record').forEach(row=>{
      const edit=row.querySelector('[data-edit-record]');
      const del=row.querySelector('[data-delete-record]');
      const serviceId=row.dataset.serviceDetails||'';
      const id=(edit&&edit.dataset.editRecord)||(del&&del.dataset.deleteRecord)||serviceId;
      if(!id) return;
      makeActions(row,id);
      row.onclick=e=>{
        if(e.target.closest('[data-history-row-action]')) return;
        e.preventDefault();
        e.stopPropagation();
        if(e.stopImmediatePropagation) e.stopImmediatePropagation();
        const isOpen=row.getAttribute('data-history-actions-open')==='1';
        closeOtherRows(row);
        if(isOpen) row.removeAttribute('data-history-actions-open');
        else row.setAttribute('data-history-actions-open','1');
      };
    });
  }

  function enhanceHistory(){
    addInlineDetails();
    wireHistoryRows();
  }

  function install(){
    ensureStyle();
    if(typeof window.renderHistory==='function' && !window.renderHistory.__historyInlineWrapped){
      const original=window.renderHistory;
      const wrapped=function(){
        const result=original.apply(this,arguments);
        enhanceHistory();
        return result;
      };
      wrapped.__historyInlineWrapped=true;
      window.renderHistory=wrapped;
    }
    enhanceHistory();
  }

  install();
  setTimeout(install,0);
})();