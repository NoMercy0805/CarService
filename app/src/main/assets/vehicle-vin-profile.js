(function(){
  try{
    if(typeof state==='undefined'||!state||!Array.isArray(state.vehicles)) return;
    let changed=false;
    const v508=state.vehicles.find(v=>v.id==='508');
    if(v508){
      if(v508.vin!=='VF38ERHH8BL071113'){v508.vin='VF38ERHH8BL071113';changed=true;}
      // VIN identifies the RHH/DW10CTED4 vehicle in the early 508 maintenance period.
      if(v508.profile!=='508_early'){v508.profile='508_early';changed=true;}
      if(v508.profileConfirmed!==true){v508.profileConfirmed=true;changed=true;}
    }
    const v2008=state.vehicles.find(v=>v.id==='2008');
    if(v2008){
      if(v2008.vin!=='VF3CUBHZMGY078951'){v2008.vin='VF3CUBHZMGY078951';changed=true;}
      // Normal/severe remains a usage choice; VIN confirms the BHZ/DV6FC vehicle.
      if(!['2008_normal','2008_severe'].includes(v2008.profile)){v2008.profile='2008_normal';changed=true;}
    }
    if(changed && typeof save==='function') save();
    if(typeof renderAll==='function') renderAll();
    const page=document.getElementById('page-service');
    if(page&&page.classList.contains('active')&&typeof openServiceChecklist==='function') openServiceChecklist();
  }catch(e){console.error('VIN/profile binding failed',e);}
})();
