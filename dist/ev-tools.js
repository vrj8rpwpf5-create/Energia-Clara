'use strict';
function calculateCharge(capacity, initial, final, price, efficiency, consumption = null) {
  if (![capacity, initial, final, price, efficiency].every(Number.isFinite) ||
      capacity <= 0 || initial < 0 || initial > 100 || final < initial || final > 100 ||
      price < 0 || efficiency <= 0 || efficiency > 100 ||
      (consumption !== null && (!Number.isFinite(consumption) || consumption <= 0))) {
    throw new Error('Revisa los datos: capacidad y eficiencia deben ser positivas, eficiencia y porcentajes no pueden superar 100 %, el porcentaje final no puede ser menor que el inicial, el precio no puede ser negativo y el consumo opcional debe ser positivo.');
  }
  const battery = capacity * (final - initial) / 100;
  const grid = battery / (efficiency / 100);
  const cost = grid * price;
  const per100 = consumption === null ? null : consumption / (efficiency / 100) * price;
  if (![battery, grid, cost, ...(per100 === null ? [] : [per100])].every(Number.isFinite)) {
    throw new Error('Los valores son demasiado grandes para calcular.');
  }
  return {battery, grid, cost, per100};
}
function compareCars(electricPer100, fuelConsumption, fuelPrice, annualKm) {
  if (![electricPer100, fuelConsumption, fuelPrice, annualKm].every(Number.isFinite) ||
      electricPer100 < 0 || fuelConsumption <= 0 || fuelPrice < 0 || annualKm < 0) {
    throw new Error('Revisa el consumo de combustible, su precio y los kilómetros anuales.');
  }
  const fuelPer100 = fuelConsumption * fuelPrice;
  const savingPer100 = fuelPer100 - electricPer100;
  const electricAnnual = electricPer100 * annualKm / 100;
  const fuelAnnual = fuelPer100 * annualKm / 100;
  const savingAnnual = fuelAnnual - electricAnnual;
  const percent = fuelPer100 === 0 ? null : savingPer100 / fuelPer100 * 100;
  if (![fuelPer100, savingPer100, electricAnnual, fuelAnnual, savingAnnual, ...(percent === null ? [] : [percent])].every(Number.isFinite)) {
    throw new Error('Los valores son demasiado grandes para comparar.');
  }
  return {fuelPer100, savingPer100, electricAnnual, fuelAnnual, savingAnnual, percent};
}
if (typeof module !== 'undefined') module.exports = {calculateCharge, compareCars};
if (typeof document !== 'undefined') {
  const form = document.querySelector('.calculator-form');
  const output = document.getElementById('tool-output');
  const comparison = document.getElementById('comparison-output');
  const error = document.getElementById('tool-error');
  const formula = document.getElementById('tool-formula');
  const number = new Intl.NumberFormat('es-ES', {maximumFractionDigits: 2});
  const euros = new Intl.NumberFormat('es-ES', {style: 'currency', currency: 'EUR'});
  const read = id => {
    const input = document.getElementById(id);
    if (id === 'ev-consumption' && input.value === '' && !input.validity.badInput) return null;
    if (!input.validity.valid || input.value.trim() === '') throw new Error('Completa los campos obligatorios con números dentro del rango indicado.');
    return input.valueAsNumber;
  };
  const metric = (label, value) => '<div class="metric"><span>' + label + '</span><strong>' + value + '</strong></div>';
  function render() {
    try {
      const r = calculateCharge(...['ev-capacity','ev-initial','ev-final','ev-price','ev-efficiency','ev-consumption'].map(read));
      output.innerHTML = metric('Energía en batería', number.format(r.battery) + ' kWh') +
        metric('Energía tomada de la red', number.format(r.grid) + ' kWh') +
        metric('Coste total de la carga', euros.format(r.cost)) +
        (r.per100 === null ? '' : metric('Coste por 100 km', euros.format(r.per100) + '/100 km'));
      formula.textContent = 'Batería = capacidad × diferencia de porcentajes ÷ 100. Red = batería ÷ eficiencia decimal. Coste = red × precio.';
      error.hidden = true;
      if (r.per100 === null) {
        comparison.textContent = 'Introduce el consumo eléctrico para comparar ambos coches.';
      } else {
        try {
          const c = compareCars(r.per100, ...['fuel-consumption','fuel-price','annual-km'].map(read));
          const difference = (value, unit) => metric((value >= 0 ? 'Ahorro' : 'Sobrecoste') + ' del eléctrico ' + unit, euros.format(Math.abs(value)));
          comparison.innerHTML = metric('Eléctrico por 100 km', euros.format(r.per100)) +
            metric('Combustión por 100 km', euros.format(c.fuelPer100)) +
            difference(c.savingPer100, 'por 100 km') +
            metric('Electricidad al año', euros.format(c.electricAnnual)) +
            metric('Combustible al año', euros.format(c.fuelAnnual)) +
            difference(c.savingAnnual, 'al año') +
            (c.percent === null ? metric('Diferencia porcentual', 'No aplicable: combustible gratuito') :
              metric(c.percent >= 0 ? 'Ahorro energético' : 'Sobrecoste energético', number.format(Math.abs(c.percent)) + ' %'));
        } catch (e) {
          comparison.textContent = e.message;
        }
      }
    } catch (e) {
      error.textContent = e.message;
      error.hidden = false;
      comparison.textContent = 'Revisa los datos de carga para comparar.';
      output.innerHTML = '';
      formula.textContent = '';
    }
  }
  form.addEventListener('input', render);
  form.addEventListener('submit', e => { e.preventDefault(); render(); });
  render();
}
