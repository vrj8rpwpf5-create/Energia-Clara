const nf = new Intl.NumberFormat('es-ES', {maximumFractionDigits: 0});
const money = n => Number.isFinite(n) ? new Intl.NumberFormat('es-ES', {style:'currency', currency:'EUR', maximumFractionDigits:0}).format(n) : '—';
const val = id => {
  const el = document.getElementById(id);
  const n = Number(el.value);
  if (!el.validity.valid || el.value.trim() === '' || !Number.isFinite(n)) throw new Error('Revisa los datos: hay un campo vacío o fuera de rango.');
  return n;
};
const output = document.getElementById('tool-output');
const errorBox = document.getElementById('tool-error');
const formula = document.getElementById('tool-formula');
const kind = document.body.dataset.calculator;
function result(label, value, note='') { return `<div class="metric"><span>${label}</span><strong>${value}</strong>${note ? `<small>${note}</small>` : ''}</div>`; }
function render() {
  try {
    let html = '', explanation = '';
    if (kind === 'aerotermia') {
      const heat=val('heat'), gas=val('gas'), efficiency=val('efficiency')/100, electricity=val('electricity'), scop=val('scop'), pumpCost=val('pump-cost'), boilerCost=val('boiler-cost');
      const gasKwh=heat/efficiency, pumpKwh=heat/scop, gasCost=gasKwh*gas, pumpAnnual=pumpKwh*electricity, saving=gasCost-pumpAnnual, extra=pumpCost-boilerCost;
      html=result('Coste anual con gas',money(gasCost),`${nf.format(gasKwh)} kWh comprados`)+result('Coste anual con aerotermia',money(pumpAnnual),`${nf.format(pumpKwh)} kWh eléctricos`)+result('Diferencia anual',money(saving),saving>=0?'A favor de la aerotermia':'A favor del gas')+result('Recuperación simple',saving>0&&extra>0?`${(extra/saving).toFixed(1).replace('.',',')} años`:'No aplicable',`Inversión adicional: ${money(extra)}`);
      explanation=`Gas: ${nf.format(heat)} ÷ ${Math.round(efficiency*100)} % × ${gas.toLocaleString('es-ES')} €/kWh. Aerotermia: ${nf.format(heat)} ÷ ${scop.toLocaleString('es-ES')} × ${electricity.toLocaleString('es-ES')} €/kWh.`;
    } else if (kind === 'electrodomesticos') {
      const watts=val('watts'), hours=val('hours'), days=val('days'), price=val('price'), efficient=val('efficient'), purchase=val('purchase');
      const annual=watts/1000*hours*days, other=efficient/1000*hours*days, saving=(annual-other)*price;
      html=result('Consumo anual actual',`${nf.format(annual)} kWh`)+result('Coste anual actual',money(annual*price))+result('Ahorro con el modelo eficiente',money(saving),`${nf.format(annual-other)} kWh/año`)+result('Recuperación de la compra',saving>0?`${(purchase/saving).toFixed(1).replace('.',',')} años`:'No aplicable','Solo por la diferencia de consumo eléctrico');
      explanation=`Consumo anual = potencia en W ÷ 1000 × horas por día × días de uso. Para cargas variables, usa un medidor o el consumo de la etiqueta energética.`;
    } else if (kind === 'aislamiento') {
      const area=val('area'), before=val('before'), after=val('after'), degree=val('degree'), efficiency=val('system'), price=val('heat-price'), investment=val('investment');
      if(after>=before) throw new Error('La transmitancia posterior debe ser menor que la anterior para estimar un ahorro.');
      const useful=(before-after)*area*degree*24/1000, purchased=useful/efficiency, saving=purchased*price;
      html=result('Menor pérdida de calor',`${nf.format(useful)} kWh/año`)+result('Menor energía comprada',`${nf.format(purchased)} kWh/año`)+result('Ahorro anual estimado',money(saving))+result('Recuperación simple',saving>0?`${(investment/saving).toFixed(1).replace('.',',')} años`:'No aplicable');
      explanation=`Ahorro térmico = (U anterior − U nueva) × superficie × grados-día × 24 ÷ 1000. Energía comprada = ahorro térmico ÷ rendimiento estacional.`;
    }
    output.innerHTML=html;
    formula.textContent=explanation;
    errorBox.hidden=true;
  } catch(e) {
    errorBox.textContent=e.message;
    errorBox.hidden=false;
    output.innerHTML='';
    formula.textContent='';
  }
}
document.querySelectorAll('.calculator-form input').forEach(el=>el.addEventListener('input',render));
render();
