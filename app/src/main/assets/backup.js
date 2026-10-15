(function(){
  const STORAGE_KEY='carservice_v1';
  const AUTO_FILE='CarService-AutoBackup.json';
  const PREV_FILE='CarService-AutoBackup-prev.json';
  const bridge=window.AndroidBridge;
  if(!bridge) return;

  function validStateText(text){
    if(!text) return false;
    try{
      if(typeof bridge.isValidBackupJson==='function') return !!bridge.isValidBackupJson(String(text));
      const obj=JSON.parse(text);
      return Array.isArray(obj.vehicles)&&obj.vehicles.some(v=>v&&v.id==='508')&&obj.vehicles.some(v=>v&&v.id==='2008');
    }catch(e){return false;}
  }

  function toB64(text){
    const bytes=new TextEncoder().encode(text);
    let binary='';
    const chunk=0x8000;
    for(let i=0;i<bytes.length;i+=chunk){binary+=String.fromCharCode.apply(null,bytes.subarray(i,i+chunk));}
    return btoa(binary);
  }

  function currentRaw(){
    try{return localStorage.getItem(STORAGE_KEY);}catch(e){return null;}
  }

  function setStatus(message,kind){
    const el=document.getElementById('autoBackupStatus');
    if(!el) return;
    if(el.textContent!==message) el.textContent=message;
    const nextKind=kind||'info';
    if(el.dataset.kind!==nextKind) el.dataset.kind=nextKind;
  }

  function folderName(){
    try{return bridge.getBackupFolderName?bridge.getBackupFolderName():null;}catch(e){return null;}
  }

  function saveExternal(text){
    if(!validStateText(text)) return false;
    try{
      if(!bridge.hasBackupFolder || !bridge.hasBackupFolder()) return false;
      const existing=bridge.readFromBackupFolder?bridge.readFromBackupFolder(AUTO_FILE):null;
      if(validStateText(existing) && existing!==text){
        bridge.saveToBackupFolder(toB64(existing),PREV_FILE,'application/json');
      }
      return !!bridge.saveToBackupFolder(toB64(text),AUTO_FILE,'application/json');
    }catch(e){return false;}
  }

  function backupNow(showMessage){
    const text=currentRaw();
    if(!validStateText(text)){
      if(showMessage) setStatus('Keine gültigen Daten zum Sichern gefunden.','error');
      return false;
    }
    try{bridge.saveInternalBackup(String(text));}catch(e){}
    const external=saveExternal(String(text));
    if(showMessage){
      if(folderName()) setStatus(external?'Sicherung wurde erstellt.':'Interne Sicherung erstellt; Ordner-Sicherung fehlgeschlagen.',external?'ok':'warn');
      else setStatus('Interne Sicherheitskopie erstellt. Wähle zusätzlich einen Backup-Ordner.','ok');
    }
    refreshFolderUi();
    return true;
  }

  function recoverCandidate(){
    let value=null;
    try{value=bridge.readInternalBackup?bridge.readInternalBackup():null;}catch(e){}
    if(validStateText(value)) return {text:value,source:'interne Sicherung'};
    try{value=bridge.readPreviousInternalBackup?bridge.readPreviousInternalBackup():null;}catch(e){}
    if(validStateText(value)) return {text:value,source:'vorherige interne Sicherung'};
    try{value=bridge.readFromBackupFolder?bridge.readFromBackupFolder(AUTO_FILE):null;}catch(e){}
    if(validStateText(value)) return {text:value,source:'Ordner-Sicherung'};
    try{value=bridge.readFromBackupFolder?bridge.readFromBackupFolder(PREV_FILE):null;}catch(e){}
    if(validStateText(value)) return {text:value,source:'vorherige Ordner-Sicherung'};
    return null;
  }

  function restoreText(text,source){
    if(!validStateText(text)) return false;
    try{
      localStorage.setItem(STORAGE_KEY,String(text));
      try{bridge.saveInternalBackup(String(text));}catch(e){}
      alert('CarService wurde aus '+source+' wiederhergestellt. Die App wird neu geladen.');
      location.reload();
      return true;
    }catch(e){
      alert('Wiederherstellung fehlgeschlagen.');
      return false;
    }
  }

  function recoverIfCorrupt(){
    const raw=currentRaw();
    if(!raw) return;
    if(validStateText(raw)){
      try{bridge.saveInternalBackup(String(raw));}catch(e){}
      return;
    }
    const candidate=recoverCandidate();
    if(candidate){
      try{
        localStorage.setItem(STORAGE_KEY,candidate.text);
        try{bridge.saveInternalBackup(String(candidate.text));}catch(e){}
        alert('Beschädigte CarService-Daten erkannt. Die letzte gültige '+candidate.source+' wurde automatisch wiederhergestellt.');
        location.reload();
      }catch(e){}
    }
  }

  function refreshFolderUi(){
    const label=document.getElementById('autoBackupFolderLabel');
    const clear=document.getElementById('clearBackupFolderBtn');
    if(!label) return;
    const name=folderName();
    const text=name?('Backup-Ordner: '+name):'Noch kein Backup-Ordner gewählt';
    if(label.textContent!==text) label.textContent=text;
    if(clear){
      const display=name?'block':'none';
      if(clear.style.display!==display) clear.style.display=display;
    }
  }

  function installSettingsUi(){
    const panel=document.getElementById('settingsDataPanel');
    if(!panel || document.getElementById('autoBackupBox')) return;
    const box=document.createElement('div');
    box.id='autoBackupBox';
    box.className='backup-safety-box';
    box.innerHTML=`
      <div class="backup-safety-title">Automatische Sicherung</div>
      <div class="backup-safety-note">Wie beim Haushaltsbuch: Änderungen werden zusätzlich gesichert. Intern werden zwei letzte gültige Stände gehalten; optional wird automatisch in einen gewählten Ordner geschrieben.</div>
      <div id="autoBackupFolderLabel" class="backup-folder-label"></div>
      <button type="button" class="secondary-btn" id="pickBackupFolderBtn">Backup-Ordner wählen</button>
      <button type="button" class="secondary-btn" id="backupNowBtn">Jetzt sichern</button>
      <button type="button" class="secondary-btn" id="restoreAutoBackupBtn">Letzte Sicherung wiederherstellen</button>
      <button type="button" class="secondary-btn" id="restorePreviousBackupBtn">Vorherige Sicherung wiederherstellen</button>
      <button type="button" class="secondary-btn" id="clearBackupFolderBtn" style="display:none">Backup-Ordner trennen</button>
      <div id="autoBackupStatus" class="backup-status">Interne Sicherung ist aktiv.</div>`;
    panel.insertBefore(box,panel.firstChild.nextSibling);

    document.getElementById('pickBackupFolderBtn').onclick=()=>{try{bridge.pickBackupFolder();}catch(e){setStatus('Ordnerauswahl konnte nicht geöffnet werden.','error');}};
    document.getElementById('backupNowBtn').onclick=()=>backupNow(true);
    document.getElementById('restoreAutoBackupBtn').onclick=()=>{
      let value=null,source='';
      try{value=bridge.readFromBackupFolder(AUTO_FILE);source='Ordner-Sicherung';}catch(e){}
      if(!validStateText(value)){try{value=bridge.readInternalBackup();source='interner Sicherung';}catch(e){}}
      if(!validStateText(value)){alert('Keine gültige Sicherung gefunden.');return;}
      if(confirm('Die aktuellen Daten werden durch die letzte Sicherung ersetzt. Fortfahren?')) restoreText(value,source);
    };
    document.getElementById('restorePreviousBackupBtn').onclick=()=>{
      let value=null,source='';
      try{value=bridge.readFromBackupFolder(PREV_FILE);source='vorheriger Ordner-Sicherung';}catch(e){}
      if(!validStateText(value)){try{value=bridge.readPreviousInternalBackup();source='vorheriger interner Sicherung';}catch(e){}}
      if(!validStateText(value)){alert('Keine vorherige gültige Sicherung gefunden.');return;}
      if(confirm('Die aktuellen Daten werden durch die vorherige Sicherung ersetzt. Fortfahren?')) restoreText(value,source);
    };
    document.getElementById('clearBackupFolderBtn').onclick=()=>{
      if(confirm('Verknüpfung zum Backup-Ordner entfernen? Die Dateien im Ordner bleiben erhalten.')){
        try{bridge.clearBackupFolder();}catch(e){}
        refreshFolderUi();
        setStatus('Backup-Ordner wurde getrennt. Interne Sicherung bleibt aktiv.','info');
      }
    };
    refreshFolderUi();
  }

  function installStyle(){
    if(document.getElementById('carservice-backup-style')) return;
    const style=document.createElement('style');
    style.id='carservice-backup-style';
    style.textContent=`
      .backup-safety-box{border:1px solid var(--rule);background:var(--paper);border-radius:15px;padding:14px;margin:12px 0 16px}
      .backup-safety-title{font-weight:800;font-size:14px;margin-bottom:5px}
      .backup-safety-note,.backup-folder-label,.backup-status{font-size:11px;line-height:1.45;color:var(--muted)}
      .backup-folder-label{margin:10px 0 3px;font-weight:700;color:var(--ink)}
      .backup-safety-box .secondary-btn{margin-top:7px}
      .backup-status{margin-top:10px}.backup-status[data-kind="ok"]{color:var(--green)}.backup-status[data-kind="warn"]{color:var(--orange)}.backup-status[data-kind="error"]{color:var(--red)}
    `;
    document.head.appendChild(style);
  }

  window.onBackupFolderPicked=function(success,name){
    refreshFolderUi();
    if(success){
      setStatus('Backup-Ordner verbunden. Erste Sicherung wird erstellt …','info');
      setTimeout(()=>backupNow(true),50);
    }else setStatus('Ordnerauswahl abgebrochen.','info');
  };

  const originalSetItem=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
    originalSetItem.apply(this,arguments);
    if(this===localStorage && key===STORAGE_KEY && validStateText(String(value))){
      try{bridge.saveInternalBackup(String(value));}catch(e){}
      try{saveExternal(String(value));}catch(e){}
    }
  };

  recoverIfCorrupt();
  installStyle();
  installSettingsUi();
  backupNow(false);
})();
