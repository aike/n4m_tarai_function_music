const Max = require('max-api');
const TaraiLanguage = require('./lib/tarailanguage');
const interpreter = new TaraiLanguage();

const x = 10;
const y = 5;
const z = 0;

const script = [
  '#----------------------',
  '# tarai function script',
  '#----------------------',
  'call tarai '+ x +' ' + y + ' ' + z,
  'end',
  '',
  'def tarai',
  ' play a1 a2 a3',
  ' if a1 <= a2',
  '   return a2',
  ' v1 = a1 - 1',
  ' call tarai v1 a2 a3',
  ' v2 = ret',
  ' v1 = a2 - 1',
  ' call tarai v1 a3 a1',
  ' v3 = ret',
  ' v1 = a3 - 1',
  ' call tarai v1 a1 a2',
  ' v4 = ret',
  ' call tarai v2 v3 v4',
  ' return ret',
  'defend'
];

const handlers = {
  'bang': () => {
    interpreter.onStart(script);
  },
  'reset': () => {
    console.log('reset');
    interpreter.onReset(script);
  }
}

Max.addHandlers(handlers);
