/* Oz dialect
const x;
const y;
const z;
const max;

max = function* 
*/

function* main() {
  const x = 'Hello';
  console.log(x);
}

runner = require('./conc-runner');
runner.runner(main());