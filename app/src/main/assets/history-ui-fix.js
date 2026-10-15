(function(){
  if(window.__carserviceHistoryInlineInstalled) return;
  window.__carserviceHistoryInlineInstalled=true;

  let actionRecordId=null;
  let actionIsService=false;

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
      #historyList .record{cursor:pointer;position:relative}
      #historyList .record:active{transform:scale(.995)}
      #historyList .record .record-actions .history-edit-btn,
      #historyList .record .record-actions .history-delete-btn{display:none!important}
      .history-action-sheet .history-action-summary{padding:2px 1px 10px}
      .history-action-sheet .history-action-summary h4{margin:0 0 5px;font-size:16px;color:var(--ink)}
      .history-action-sheet .history-action-summary p{margin:0;font-size:12px;line-height:1.45;color:var(--muted)}
      .history-action-buttons{display:flex;flex-direction:column;gap:8px;margin-top:6px}
      .history-action-btn{width:100%;padding:13px 14px;border-radius:13px;font-size:14px;font-weight:800;text-align:left}
      .history-action-btn.details{background:var(--primary-soft);color:var(--primary)}
      .history-action-btn.edit{background:var(--primary-soft);color:var(--primary)}
      .history-action-btn.delete{background:var(--red-soft);color:var(--red)}
      .history-action-btn.cancel{background:var(--paper);color:var(--muted)}
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

  function ensureActionSheet(){
    let modal=document.getElementById('historyActionModal');
    if(modal) return modal;
    document.body.insertAdjacentHTML('beforeend',`
      <div class="modal-backdrop" id="historyActionModal">
        <div class="modal history-action-sheet">
          <div class="handle"></div>
          <div class="modal-head"><h3>Historien-Eintrag</h3><button class="close" id="historyActionClose" type="button">×</button></div>
          <div class="history-action-summary"><h4 id="historyActionTitle"></h4><p id="historyActionMeta"></p></div>
          <div class="history-action-buttons">
            <button class="history-action-btn details" id="historyActionDetails" type="button">Details anzeigen</button>
            <button class="history-action-btn edit" id="historyActionEdit" type="button">✎ Bearbeiten</button>
            <button class="history-action-btn delete" id="historyActionDelete" type="button">🗑 Löschen</button>
            <button class="history-action-btn cancel" id="historyActionCancel" type="button">Abbrechen</button>
          </div>
        </div>
      </div>`);
    modal=document.getElementById('historyActionModal');
    const close=()=>{modal.classList.remove('open');actionRecordId=null;actionIsService=false;};
    document.getElementById('historyActionClose').onclick=close;
    document.getElementById('historyActionCancel').onclick=close;
    modal.addEventListener('click',e=>{if(e.target===modal)close();});
    document.getElementById('historyActionEdit').onclick=()=>{
      const id=actionRecordId;close();if(id&&typeof openHistoryEdit==='function')openHistoryEdit(id);
    };
    document.getElementById('historyActionDelete').onclick=()=>{
      const id=actionRecordId;close();if(id&&typeof deleteHistoryRecord==='function')deleteHistoryRecord(id);
    };
    document.getElementById('historyActionDetails').onclick=()=>{
      const id=actionRecordId;close();if(id&&typeof openServiceHistoryDetails==='function')openServiceHistoryDetails(id);
    };
    return modal;
  }

  function openHistoryActions(row,id,isService){
    if(!id) return;
    actionRecordId=id;
    actionIsService=!!isService;
    const modal=ensureActionSheet();
    const title=(row.querySelector('h4')?.textContent||'Historien-Eintrag').trim();
    const meta=(row.querySelector('p')?.textContent||'').replace(/\s+/g,' ').trim();
    document.getElementById('historyActionTitle').textContent=title;
    document.getElementById('historyActionMeta').textContent=meta;
    document.getElementById('historyActionDetails').style.display=actionIsService?'block':'none';
    modal.classList.add('open');
  }

  function wireHistoryRows(){
    document.querySelectorAll('#historyList .record').forEach(row=>{
      const edit=row.querySelector('[data-edit-record]');
      const del=row.querySelector('[data-delete-record]');
      const serviceId=row.dataset.serviceDetails||'';
      const id=(edit&&edit.dataset.editRecord)||(del&&del.dataset.deleteRecord)||serviceId;
      if(!id) return;
      row.dataset.historyActionId=id;
      row.onclick=e=>{
        if(e.target.closest('button')) return;
        openHistoryActions(row,id,!!serviceId);
      };
    });
  }

  function enhanceHistory(){
    addInlineDetails();
    wireHistoryRows();
  }

  function install(){
    ensureStyle();
    ensureActionSheet();
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