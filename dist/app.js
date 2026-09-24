const $ = id => document.getElementById(id);
const euros = value => Number.isFinite(value) ? new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value) : '—';
const decimal = value => new Intl.NumberFormat('es-ES',{maximumFractionDigits:0}).format(value);
const monthlyShape = [0.057,0.067,0.082,0.089,0.103,0.111,0.118,0.113,0.095,0.074,0.051,0.040];
function getSolarInput(){
  const ids=['annual-kwh','day-share','buy-price','sell-price','solar-kwp','solar-yield','solar-cost','battery-kwh','battery-cost','battery-loss'];
  const x=Object.fromEntries(ids.map(id=>[id,Number($(id).value)]));
  if(ids.some(id=>!$(id).validity.valid||!Number.isFinite(x[id]))) throw new Error('Revisa los datos: hay un campo vacío o fuera de rango.');
  if(x['sell-price']>x['buy-price']) throw new Error('La compensación no puede superar el precio de compra en este modelo. Ajusta una de las dos cifras.');
  return x;
}
function scenario(x,withBattery){
  const annual=x['annual-kwh'],buy=x['buy-price'],sell=x['sell-price'];
  const efficiency=1-x['battery-loss']/100;let annualBill=0,production=0,directTotal=0,batteryTotal=0,exportTotal=0;
  monthlyShape.forEach((shape,index)=>{
    const generated=x['solar-kwp']*x['solar-yield']*shape;
    const demand=annual/12,dayDemand=demand*x['day-share']/100,nightDemand=demand-dayDemand;
    const direct=Math.min(generated,dayDemand);
    const surplus=Math.max(0,generated-direct);
    const batteryCharge=withBattery&&efficiency>0?Math.min(surplus,x['battery-kwh']*([31,28,31,30,31,30,31,31,30,31,30,31][index]),nightDemand/efficiency):0;
    const delivered=batteryCharge*efficiency;
    const exported=surplus-batteryCharge;
    const purchased=demand-direct-delivered;
    const energyCharge=purchased*buy;
    const compensation=Math.min(exported*sell,energyCharge);
    annualBill+=energyCharge-compensation;
    production+=generated;directTotal+=direct;batteryTotal+=delivered;exportTotal+=exported;
  });
  return {bill:annualBill,production,direct:directTotal,delivered:batteryTotal,exported:exportTotal};
}
function renderSolar(){
 try{
  const x=getSolarInput();$('solar-error').hidden=true;
  const base=x['annual-kwh']*x['buy-price'];const panels=scenario(x,false),battery=scenario(x,true);
  const labels=[['Sin instalación',base,0],['Solo placas',panels.bill,x['solar-cost']],['Placas + batería',battery.bill,x['solar-cost']+x['battery-cost']]];
  $('solar-options').innerHTML=labels.map(([name,bill,cost],i)=>`<div class="option ${i===2?'best':''}"><span>${name}</span><strong>${euros(bill)}/año</strong><small>${i===0?'Coste de energía comprado':`${euros(base-bill)}/año de ahorro · inversión ${euros(cost)}`}</small></div>`).join('');
  const extra=panels.bill-battery.bill;
  $('battery-extra').textContent=`${euros(extra)}/año`;
  $('mobile-solar-summary').innerHTML=`<span>Con placas: <strong>${euros(base-panels.bill)}/año de ahorro</strong></span><span>Batería adicional: <strong>${euros(extra)}/año</strong></span>`;
  const max=base||1;$('solar-chart').innerHTML=labels.map(([name,bill])=>`<div class="bar-row"><span>${name}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(0,100*bill/max)}%"></div></div><strong>${euros(bill)}</strong></div>`).join('');
  const solarPay=base>panels.bill?x['solar-cost']/(base-panels.bill):Infinity;
  const batteryPay=extra>0?x['battery-cost']/extra:Infinity;
  $('solar-summary').textContent=`Producción estimada: ${decimal(panels.production)} kWh/año. Recuperación simple de las placas: ${Number.isFinite(solarPay)?solarPay.toFixed(1).replace('.',',')+' años':'sin ahorro'}; batería adicional: ${Number.isFinite(batteryPay)?batteryPay.toFixed(1).replace('.',',')+' años':'sin ahorro'}. Estimación orientativa, basada en tus precios y producción.`;
 }catch(error){$('solar-error').textContent=error.message;$('solar-error').hidden=false;$('solar-options').innerHTML='';$('battery-extra').textContent='—';$('solar-chart').innerHTML='';$('solar-summary').textContent='';$('mobile-solar-summary').textContent='Revisa los datos de entrada.';}
}
$('solar-form').addEventListener('input',renderSolar);
for(const item of document.querySelectorAll('.nav-item'))item.addEventListener('click',()=>{
 const tool=item.dataset.tool;for(const button of document.querySelectorAll('.nav-item')){button.classList.toggle('active',button===item);if(button===item)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');}
 for(const panel of document.querySelectorAll('.tool-panel')){panel.hidden=panel.id!==tool;panel.classList.toggle('active',panel.id===tool);}
 history.replaceState(null,'','#'+tool);
});
renderSolar();
function q(id){const element=$(id),value=Number(element.value);if(!element.validity.valid||!Number.isFinite(value))throw new Error('Revisa los campos de ambas ofertas.');return value;}
function renderQuotes(){
 try{
  const x=getSolarInput();$('quotes-error').hidden=true;const base=x['annual-kwh']*x['buy-price'];
  const offers=['a','b'].map(key=>{const cost=q(`quote-${key}-cost`),kwp=q(`quote-${key}-kwp`),yieldValue=q(`quote-${key}-yield`),warranty=q(`quote-${key}-warranty`);const offer=scenario({...x,'solar-kwp':kwp,'solar-yield':yieldValue},false);const saving=base-offer.bill;return {key,cost,kwp,yieldValue,warranty,offer,saving,payback:saving>0?cost/saving:Infinity};});
  $('quotes-results').innerHTML=offers.map(o=>`<div class="quote-result"><div class="quote-title"><span>Oferta ${o.key.toUpperCase()}</span><strong>${euros(o.cost)}</strong></div><dl><dt>Potencia</dt><dd>${o.kwp.toLocaleString('es-ES')} kWp</dd><dt>Precio por kWp</dt><dd>${euros(o.cost/o.kwp)}</dd><dt>Producción estimada</dt><dd>${decimal(o.offer.production)} kWh/año</dd><dt>Ahorro estimado</dt><dd>${euros(o.saving)}/año</dd><dt>Recuperación simple</dt><dd>${Number.isFinite(o.payback)?o.payback.toFixed(1).replace('.',',')+' años':'sin ahorro'}</dd><dt>Garantía de instalación</dt><dd>${o.warranty} años</dd></dl><button class="primary-button" type="button" data-apply-quote="${o.key}">Analizar con batería</button></div>`).join('');
 }catch(error){$('quotes-error').textContent=error.message;$('quotes-error').hidden=false;$('quotes-results').innerHTML='';}
}
const defaultHours=[.25,.23,.2,.18,.18,.2,.3,.48,.46,.38,.33,.35,.42,.43,.35,.36,.4,.55,.72,.86,.83,.7,.52,.33];
function buildHours(){
 $('hour-fields').innerHTML=defaultHours.map((value,i)=>`<label class="hour-field"><span>${String(i).padStart(2,'0')}:00 · kWh</span><input id="hour-${i}" type="number" min="0" max="100" step="0.01" value="${value}" inputmode="decimal"></label>`).join('');
}
function getHours(){const values=Array.from({length:24},(_,i)=>{const input=$(`hour-${i}`),value=Number(input.value);if(!input.validity.valid||!Number.isFinite(value))throw new Error('Revisa los consumos horarios: usa números entre 0 y 100 kWh.');return value;});const total=values.reduce((a,b)=>a+b,0);if(total<=0)throw new Error('Introduce consumo en al menos una hora.');return {values,total,sun:values.slice(8,18).reduce((a,b)=>a+b,0)};}
function renderHours(){
 try{const h=getHours();$('hours-error').hidden=true;$('hours-day').textContent=`${h.total.toFixed(2).replace('.',',')} kWh`;$('hours-sun').textContent=`${Math.round(h.sun/h.total*100)} %`;$('hours-year').textContent=`${decimal(h.total*365)} kWh`;
  const top=Math.max(...h.values,0.1);$('hours-chart').innerHTML=h.values.map((v,i)=>`<div class="${i>=8&&i<18?'sun':''}" style="height:${Math.max(2,v/top*100)}%" title="${String(i).padStart(2,'0')}:00: ${v.toFixed(2)} kWh"></div>`).join('');
  $('hours-chart').insertAdjacentHTML('afterend','<div class="hour-chart-labels" id="hour-labels"><span>00:00</span><span>08:00</span><span>18:00</span><span>23:00</span></div>');const labels=document.querySelectorAll('#hour-labels');labels.forEach((el,i)=>{if(i<labels.length-1)el.remove()});
 }catch(error){$('hours-error').textContent=error.message;$('hours-error').hidden=false;$('hours-day').textContent='—';$('hours-sun').textContent='—';$('hours-year').textContent='—';$('hours-chart').innerHTML='';}
}
document.querySelectorAll('#quotes input').forEach(el=>el.addEventListener('input',renderQuotes));
$('solar-form').addEventListener('input',renderQuotes);
$('quotes-results').addEventListener('click',event=>{const btn=event.target.closest('[data-apply-quote]');if(!btn)return;const key=btn.dataset.applyQuote;$('solar-kwp').value=$(`quote-${key}-kwp`).value;$('solar-yield').value=$(`quote-${key}-yield`).value;$('solar-cost').value=$(`quote-${key}-cost`).value;renderSolar();document.querySelector('[data-tool="solar"]').click();window.scrollTo({top:0,behavior:'smooth'});});
buildHours();$('hour-fields').addEventListener('input',renderHours);$('hours-reset').addEventListener('click',()=>{defaultHours.forEach((v,i)=>$(`hour-${i}`).value=v);renderHours()});
$('hours-apply').addEventListener('click',()=>{try{const h=getHours();$('annual-kwh').value=Math.round(h.total*365);$('day-share').value=Math.round(h.sun/h.total*100);renderSolar();renderQuotes();document.querySelector('[data-tool="solar"]').click();window.scrollTo({top:0,behavior:'smooth'});}catch(error){renderHours();}});
if(['solar','quotes','hours'].includes(location.hash.slice(1)))document.querySelector(`[data-tool="${location.hash.slice(1)}"]`).click();
renderQuotes();renderHours();
// Optional browser agent access to the same calculations shown on this page.
function registerPageTools(){
 const context=document.modelContext;if(!context?.registerTool)return;
 const fields={annualKwh:'annual-kwh',dayShare:'day-share',buyPrice:'buy-price',sellPrice:'sell-price',solarKwp:'solar-kwp',solarYield:'solar-yield',solarCost:'solar-cost',batteryKwh:'battery-kwh',batteryCost:'battery-cost',batteryLoss:'battery-loss'};
 const properties=Object.fromEntries(Object.keys(fields).map(key=>[key,{type:'number',description:`Valor numérico de ${key}`}])) ;
 const register=tool=>{try{Promise.resolve(context.registerTool(tool)).catch(()=>{});}catch(_error){}};
 register({name:'configure_solar_comparison',title:'Configurar comparación solar',description:'Actualiza los datos editables de la calculadora de placas y batería y muestra el resultado.',inputSchema:{type:'object',properties,additionalProperties:false,minProperties:1},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length===0)throw new Error('Indica al menos un campo.');
  const changes=[];
  for(const [key,value] of Object.entries(input)){if(!(key in fields)||typeof value!=='number'||!Number.isFinite(value))throw new Error(`Valor no válido para ${key}.`);const el=$(fields[key]);if(value<Number(el.min)||value>Number(el.max))throw new Error(`${key} debe estar entre ${el.min} y ${el.max}.`);changes.push([el,value]);}
  for(const [el,value] of changes)el.value=String(value);
  renderSolar();renderQuotes();document.querySelector('[data-tool="solar"]').click();
  if(!$('solar-error').hidden)throw new Error($('solar-error').textContent);
  return {summary:$('solar-summary').textContent,batteryExtra:$('battery-extra').textContent};
 }});
 register({name:'read_solar_comparison',title:'Leer comparación solar',description:'Lee los resultados visibles para las tres opciones solares.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(){if(!$('solar-error').hidden)return {error:$('solar-error').textContent};return {options:Array.from($('solar-options').children).map(el=>el.innerText),batteryExtra:$('battery-extra').textContent,summary:$('solar-summary').textContent};}});
}
registerPageTools();
