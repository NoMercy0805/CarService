(function(){
  if(window.__carserviceFuelTypeInstalled) return;
  window.__carserviceFuelTypeInstalled=true;

  var pendingSave=null;
  var lastEdit=null;

  function getVehicles(){
    try{return Array.isArray(state.vehicles)?state.vehicles:[];}catch(e){return [];}
  }

  function findRecord(id){
    var found=null;
    getVehicles().some(function(v){
      var logs=Array.isArray(v.fuelLogs)?v.fuelLogs:[];
      var rec=logs.find(function(x){return String(x.id)===String(id);});
      if(rec){found=rec;return true;}
      return false;
    });
    return found;
  }

  function ensureFuelTypeField(){
    var modal=document.getElementById('fuelModal');
    if(!modal||document.getElementById('fuelType')) return;
    var date=document.getElementById('fuelDate');
    var dateField=date&&date.closest('.field');
    if(!dateField) return;
    var field=document.createElement('div');
    field.className='field';
    field.innerHTML='<label>Kraftstoff</label><select id="fuelType" class="input"><option value="Diesel">Diesel</option><option value="Premium-Diesel">Premium-Diesel</option><option value="HVO100">HVO100</option><option value="Super E5 (95)">Super E5 (95)</option><option value="Super E10 (95)">Super E10 (95)</option><option value="Super Plus (98)">Super Plus (98)</option><option value="Sonstiges">Sonstiges</option></select>';
    dateField.insertAdjacentElement('afterend',field);
  }

  function allIds(){
    var ids=[];
    getVehicles().forEach(function(v){
      (Array.isArray(v.fuelLogs)?v.fuelLogs:[]).forEach(function(l){ids.push(String(l.id));});
    });
    return ids;
  }

  function wrapSave(){
    if(typeof window.save!=='function'||window.save.__fuelTypeWrapped) return;
    var original=window.save;
    var wrapped=function(){
      if(pendingSave){
        try{
          var target=null;
          if(pendingSave.editingId) target=findRecord(pendingSave.editingId);
          if(!target){
            var before=pendingSave.beforeIds||[];
            getVehicles().some(function(v){
              var logs=Array.isArray(v.fuelLogs)?v.fuelLogs:[];
              target=logs.find(function(l){return before.indexOf(String(l.id))===-1;})||null;
              return !!target;
            });
          }
          if(target) target.fuelType=pendingSave.type||'Diesel';
        }catch(e){}
      }
      return original.apply(this,arguments);
    };
    wrapped.__fuelTypeWrapped=true;
    window.save=wrapped;
  }

  function wireSaveButton(){
    var btn=document.getElementById('fuelSaveBtn');
    if(!btn||btn.__fuelTypeWired) return;
    btn.__fuelTypeWired=true;
    var original=btn.onclick;
    btn.onclick=function(){
      var type=document.getElementById('fuelType');
      var title=document.getElementById('fuelModalTitle');
      pendingSave={
        type:type&&type.value?type.value:'Diesel',
        editingId:title&&title.textContent.indexOf('bearbeiten')>=0&&lastEdit?lastEdit.id:null,
        beforeIds:allIds()
      };
      try{return original&&original.apply(this,arguments);}finally{pendingSave=null;lastEdit=null;setTimeout(annotateRows,0);}
    };
  }

  function setTypeForEdit(id){
    ensureFuelTypeField();
    var select=document.getElementById('fuelType');
    if(!select) return;
    var rec=findRecord(id);
    select.value=rec&&rec.fuelType?rec.fuelType:'Diesel';
  }

  function wireOpenTracking(){
    if(document.__fuelTypeOpenTracking) return;
    document.__fuelTypeOpenTracking=true;
    document.addEventListener('click',function(e){
      var edit=e.target.closest&&e.target.closest('[data-fuel-action="edit"]');
      if(edit){
        lastEdit={id:edit.getAttribute('data-id'),vehicle:edit.getAttribute('data-vehicle')};
        setTimeout(function(){setTypeForEdit(lastEdit&&lastEdit.id);},0);
        return;
      }
      var fab=e.target.closest&&e.target.closest('#fuelFab');
      if(fab){
        lastEdit=null;
        setTimeout(function(){ensureFuelTypeField();var s=document.getElementById('fuelType');if(s)s.value='Diesel';},0);
      }
    },true);
  }

  function annotateRows(){
    document.querySelectorAll('#fuelHistoryList .fuel-row').forEach(function(row){
      if(row.dataset.fuelTypeAnnotated==='1') return;
      var action=row.querySelector('[data-fuel-action="edit"]');
      if(!action) return;
      var rec=findRecord(action.getAttribute('data-id'));
      if(!rec||!rec.fuelType){row.dataset.fuelTypeAnnotated='1';return;}
      var p=row.querySelector('p');
      if(p) p.textContent=rec.fuelType+' · '+p.textContent;
      row.dataset.fuelTypeAnnotated='1';
    });
  }

  function observe(){
    var root=document.getElementById('page-fuel')||document.body;
    if(root.__fuelTypeObserver) return;
    root.__fuelTypeObserver=true;
    new MutationObserver(function(){
      ensureFuelTypeField();
      wrapSave();
      wireSaveButton();
      annotateRows();
    }).observe(root,{childList:true,subtree:true});
  }

  function install(){
    ensureFuelTypeField();
    wrapSave();
    wireSaveButton();
    wireOpenTracking();
    annotateRows();
    observe();
  }

  install();
  setTimeout(install,0);
})();