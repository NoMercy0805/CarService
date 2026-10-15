(function(){
  const icons={
    next:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 9h16"/><path d="m8.5 14 2 2 4-4"/></svg>',
    service:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5L19 15.4a2.1 2.1 0 1 1-3 3l-6.7-6.7"/><path d="m4 20 5.2-5.2"/><path d="M3 21l1-3 2 2-3 1Z"/></svg>',
    history:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v6h6"/><path d="M12 7v5l3 2"/></svg>',
    oil:'<svg viewBox="0 0 24 24" aria-hidden="true" class="icon-fill"><path d="M12 2.5C9.7 6.1 5.5 10.5 5.5 15A6.5 6.5 0 0 0 18.5 15C18.5 10.5 14.3 6.1 12 2.5Z"/></svg>',
    fluids:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c-2.2 3.4-5.5 7.2-5.5 11A5.5 5.5 0 0 0 17.5 14C17.5 10.2 14.2 6.4 12 3Z"/><path d="M3 20c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0"/></svg>',
    belt:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><path d="M7 8h10M7 16h10"/></svg>',
    exhaust:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 14h8l3 3h4"/><path d="M3 11h9"/><path d="M18 8c1-1 2-1 3 0M17 5c1.4-1.3 2.8-1.3 4.2 0"/></svg>',
    inspect:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m14.5 14.5 5 5"/><path d="m7.5 10 1.8 1.8 3.6-3.6"/></svg>',
    more:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    brake:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/><path d="M3.5 8.5v7M20.5 8.5v7"/></svg>',
    cooling:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v10a4 4 0 1 0 6 3.5A4 4 0 0 0 13 14V4a2 2 0 0 0-4 0Z"/><path d="M11 7v8"/></svg>',
    engine:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10l2 3v7H5V9l2-2Z"/><path d="M9 4h6M8 17v2M16 17v2M19 11h2v4h-2"/></svg>',
    gear:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7-.7-2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7 2-.7Z"/></svg>',
    electric:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M8.2 14.5A6 6 0 1 1 15.8 14.5C14.7 15.3 14 16.4 14 18h-4c0-1.6-.7-2.7-1.8-3.5Z"/></svg>',
    climate:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M4.2 6.5l15.6 11M4.2 17.5l15.6-11M8 4l4 3 4-3M8 20l4-3 4 3"/></svg>',
    tire:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4"/></svg>'
  };

  const categoryMap={
    'öl & filter':['oil','black'],'flüssigkeiten':['fluids','blue'],'kühlung & flüssigkeiten':['cooling','blue'],
    'riemen':['belt','dark'],'riemen & wasserpumpe':['belt','dark'],'abgas & adblue':['exhaust','blue'],
    'abgas & diesel':['exhaust','dark'],'adblue & scr':['fluids','blue'],'kontrollen':['inspect','dark'],
    'weitere arbeiten':['more','blue'],'bremsen':['brake','dark'],'motor & antrieb':['engine','dark'],
    'fahrwerk & lenkung':['gear','dark'],'elektrik & beleuchtung':['electric','dark'],'klima & komfort':['climate','blue'],
    'sommerreifen':['tire','dark'],'winterreifen':['tire','dark'],'reifen & räder':['tire','dark'],'sonstiges':['more','dark']
  };

  const vehicleImageParts={
    '508':['vehicle-images/508-1.b64','vehicle-images/508-2.b64','vehicle-images/508-3.b64','vehicle-images/508-4.b64']
  };
  const vehicleObjectUrls={};
  let vehicleImagesLoading=false;

  function ensureStyle(){
    if(document.getElementById('concept-icon-system-style')) return;
    const style=document.createElement('style');
    style.id='concept-icon-system-style';
    style.textContent=`
      .next-service-icon svg,.page-title-icon svg{width:25px!important;height:25px!important;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .next-service-panel:after{display:none!important;background:none!important;content:none!important}
      .service-group-title.concept-category-title,.manual-picker-group-title.concept-category-title{display:flex!important;align-items:center!important;gap:8px!important}
      .concept-category-icon{width:22px;height:22px;flex:0 0 22px;display:inline-grid;place-items:center;border-radius:7px}
      .concept-category-icon svg{width:18px;height:18px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      .concept-category-icon .icon-fill{fill:currentColor!important;stroke:none!important}
      .concept-category-icon.black{color:#111827;background:#eef0f3}.concept-category-icon.dark{color:#263244;background:#eef1f5}.concept-category-icon.blue{color:#1f75d6;background:#e6f1ff}
      html[data-theme="dark"] .concept-category-icon.black,html[data-theme="dark"] .concept-category-icon.dark{color:#f4f7fb;background:#263246}
      html[data-theme="dark"] .concept-category-icon.blue{color:#7ab7ff;background:#173459}
      .vehicle-photo{background:#fff!important}.vehicle-photo img[data-vehicle-artwork]{background:#fff!important}
    `;
    document.head.appendChild(style);
  }

  function setSectionIcon(box,key){
    if(!box || box.dataset.conceptIcon===key) return;
    box.innerHTML=icons[key];
    box.dataset.conceptIcon=key;
  }

  function decorateCategory(el){
    if(!el || el.querySelector('.concept-category-icon')) return;
    const label=(el.textContent||'').trim().toLowerCase();
    const spec=categoryMap[label];
    if(!spec) return;
    const span=document.createElement('span');
    span.className='concept-category-icon '+spec[1];
    span.innerHTML=icons[spec[0]];
    el.classList.add('concept-category-title');
    el.insertBefore(span,el.firstChild);
  }

  async function loadTextParts(paths){
    const values=await Promise.all(paths.map(path=>fetch(path).then(r=>{if(!r.ok) throw new Error(path+' '+r.status);return r.text();})));
    return values.join('').replace(/\s+/g,'');
  }

  function base64ToBlobUrl(base64){
    const binary=atob(base64),bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes],{type:'image/jpeg'}));
  }

  async function ensureVehicleImages(){
    if(vehicleImagesLoading || vehicleObjectUrls['508']) return;
    vehicleImagesLoading=true;
    try{
      const value=await loadTextParts(vehicleImageParts['508']);
      vehicleObjectUrls['508']=base64ToBlobUrl(value);
      patchVehicleImages();
    }catch(err){console.error('CarService 508 artwork load failed',err);}
    finally{vehicleImagesLoading=false;}
  }

  function patchVehicleImages(){
    document.querySelectorAll('.vehicle-photo img').forEach(img=>{
      const card=img.closest('.vehicle-card');
      const context=((card?.textContent||'')+' '+(img.getAttribute('alt')||'')+' '+(img.dataset.vehicleArtwork||'')).toLowerCase();
      const is2008=context.includes('2008');
      const replacement=is2008?'peugeot-2008.jpg':vehicleObjectUrls['508'];
      if(replacement && img.getAttribute('src')!==replacement){img.setAttribute('src',replacement);img.dataset.vehicleArtwork=is2008?'2008':'508';}
      img.removeAttribute('onerror');
      img.style.removeProperty('display');
      const holder=img.closest('.vehicle-photo');if(holder) holder.classList.remove('image-load-error');
    });
  }

  function apply(){
    ensureStyle();
    setSectionIcon(document.querySelector('.next-service-icon'),'next');
    document.querySelectorAll('.page-title-row').forEach(row=>{
      const title=(row.querySelector('h2')?.textContent||'').trim(),box=row.querySelector('.page-title-icon');
      if(title==='Peugeot-Service') setSectionIcon(box,'service');
      if(title==='Historie') setSectionIcon(box,'history');
    });
    document.querySelectorAll('.service-group-title,.manual-picker-group-title').forEach(decorateCategory);
    patchVehicleImages();
  }

  let scheduled=false;
  function scheduleApply(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply();});}

  apply();
  ensureVehicleImages();
  new MutationObserver(scheduleApply).observe(document.documentElement,{childList:true,subtree:true});
})();
