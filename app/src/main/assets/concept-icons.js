(function(){
  const NS='http://www.w3.org/2000/svg';
  const icons={
    next:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 9h16"/><path d="m8.5 14 2 2 4-4"/></svg>',
    service:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5L19 15.4a2.1 2.1 0 1 1-3 3l-6.7-6.7"/><path d="m4 20 5.2-5.2"/><path d="M3 21l1-3 2 2-3 1Z"/></svg>',
    history:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/><path d="M12 7v5l3 2"/></svg>'
  };
  function apply(){
    const next=document.querySelector('.next-service-icon');
    if(next) next.innerHTML=icons.next;
    document.querySelectorAll('.page-title-row').forEach(row=>{
      const title=(row.querySelector('h2')?.textContent||'').trim();
      const box=row.querySelector('.page-title-icon');
      if(!box) return;
      if(title==='Peugeot-Service') box.innerHTML=icons.service;
      if(title==='Historie') box.innerHTML=icons.history;
    });
  }
  apply();
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
})();
