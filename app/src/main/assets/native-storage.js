(function(){
  if(window.__carserviceNativeStorageInstalled) return;
  window.__carserviceNativeStorageInstalled=true;

  const KEY='carservice_v1';
  const bridge=window.AndroidBridge;
  if(!bridge || typeof bridge.nativeGetItem!=='function' || typeof bridge.nativeSetItem!=='function') return;

  const originalGet=Storage.prototype.getItem;
  const originalSet=Storage.prototype.setItem;
  const originalRemove=Storage.prototype.removeItem;

  function nativeGet(key){
    try{return bridge.nativeGetItem(String(key));}catch(e){return null;}
  }
  function nativeSet(key,value){
    try{bridge.nativeSetItem(String(key),String(value));return true;}catch(e){return false;}
  }
  function nativeRemove(key){
    try{bridge.nativeRemoveItem(String(key));}catch(e){}
  }

  // One-time migration: existing CarService data from WebView localStorage is
  // copied byte-for-byte into SQLite. If SQLite already contains data, it is
  // authoritative and repairs the local mirror if required.
  let localRaw=null;
  try{localRaw=originalGet.call(localStorage,KEY);}catch(e){}
  const nativeRaw=nativeGet(KEY);

  if(nativeRaw!=null && nativeRaw!==''){
    if(localRaw!==nativeRaw){
      try{originalSet.call(localStorage,KEY,nativeRaw);}catch(e){}
      // The page has already initialized its in-memory state before this
      // injected bridge runs. Reload once so loadState() consumes the native
      // value that was just mirrored back into localStorage.
      setTimeout(function(){location.reload();},0);
      return;
    }
  }else if(localRaw!=null && localRaw!==''){
    nativeSet(KEY,localRaw);
  }

  Storage.prototype.getItem=function(key){
    if(this===localStorage && String(key)===KEY){
      const value=nativeGet(KEY);
      if(value!=null) return value;
    }
    return originalGet.apply(this,arguments);
  };

  Storage.prototype.setItem=function(key,value){
    const result=originalSet.apply(this,arguments);
    if(this===localStorage && String(key)===KEY){
      nativeSet(KEY,String(value));
    }
    return result;
  };

  Storage.prototype.removeItem=function(key){
    const result=originalRemove.apply(this,arguments);
    if(this===localStorage && String(key)===KEY){
      nativeRemove(KEY);
    }
    return result;
  };
})();
