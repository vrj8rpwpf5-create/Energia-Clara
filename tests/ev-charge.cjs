const assert = require('node:assert/strict');
const {calculateCharge: c} = require('../assets/ev-tools.js');
const r = c(60,20,80,0.2,90,15);
assert.equal(r.battery,36);
assert.equal(r.grid,40);
assert.equal(r.cost,8);
assert.ok(Math.abs(r.per100 - 10/3) < 1e-12);
assert.equal(c(60,20,80,0.2,90).per100,null);
assert.deepEqual(c(60,80,80,0.2,90),{battery:0,grid:0,cost:0,per100:null});
assert.equal(c(60,0,100,0.2,100).grid,60);
assert.equal(c(60,20,80,0,90,15).cost,0);
assert.equal(c(60,20,80,0,90,15).per100,0);
assert.equal(c(60,80,80,0.2,90,15).per100,r.per100);
for (const values of [[0,20,80,.2,90], [60,80,20,.2,90], [60,-1,80,.2,90],
 [60,20,101,.2,90], [60,20,80,-.2,90], [60,20,80,.2,0],
 [60,20,80,.2,101], [60,20,80,.2,90,0], [NaN,20,80,.2,90],
 [60,20,80,.2,90,Infinity]]) assert.throws(() => c(...values));
console.log('Pruebas de carga: correctas.');
const {compareCars} = require('../assets/ev-tools.js');
const comparison = compareCars(r.per100,6,1.6,15000);
assert.ok(Math.abs(comparison.electricAnnual - 500) < 1e-9);
assert.ok(Math.abs(comparison.fuelAnnual - 1440) < 1e-9);
assert.ok(Math.abs(comparison.savingAnnual - 940) < 1e-9);
assert.ok(compareCars(12,6,1.6,15000).savingAnnual < 0);
assert.equal(compareCars(9,6,1.5,15000).savingAnnual,0);
assert.equal(compareCars(3,6,0,15000).percent,null);
assert.equal(compareCars(3,6,1.6,0).savingAnnual,0);
for (const args of [[3,0,1.6,15000],[3,6,-1,15000],[3,6,1,-1],[Infinity,6,1,15000]]) assert.throws(()=>compareCars(...args));
console.log('Comparación: ejemplo, sobrecoste, empate, precio cero y validaciones correctos.');
