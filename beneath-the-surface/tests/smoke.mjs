// Dependency-free smoke test for the scripted 2D simulator.
// This exercises state transitions and controls using a no-op canvas context.
// Visual accuracy still requires a real desktop/mobile browser inspection.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const callbacks = {};
const elements = new Map();
let nextFrame = null;

const context2d = new Proxy({}, {
  get(target, key) {
    if (key === 'createLinearGradient' || key === 'createRadialGradient') {
      return () => ({ addColorStop() {} });
    }
    return key in target ? target[key] : () => {};
  },
  set(target, key, value) { target[key] = value; return true; }
});
const node = id => {
  if (!elements.has(id)) {
    elements.set(id, {
      id, dataset: {}, style: {}, classList: { toggle() {} },
      disabled: false, hidden: false, textContent: '', value: '0',
      width: 1100, height: 640,
      setAttribute() {},
      addEventListener(event, callback) { callbacks[id + ':' + event] = callback; },
      getBoundingClientRect() { return { width: 1100, height: 640 }; },
      getContext() { return context2d; }
    });
  }
  return elements.get(id);
};
const document = { getElementById: node, querySelectorAll() { return []; } };
const window = {
  devicePixelRatio: 1,
  matchMedia() { return { matches: false }; },
  addEventListener() {},
  requestAnimationFrame(callback) { nextFrame = callback; }
};
runInNewContext(app, { document, window, Math });

const fire = (id, event = 'click', payload) => callbacks[id + ':' + event](payload);
const frames = (startMs, count, stepMs=50) => {
  for (let i=0; i<count; i++) {
    assert.equal(typeof nextFrame, 'function');
    nextFrame(startMs + i*stepMs);
  }
};
const choose = (group, key, value) => fire(group, 'click', {
  target: { closest() { return { dataset: { [key]: value } }; } }
});
for (const id of ['waterScene','castButton','reelButton','pauseButton','resetButton',
  'depthSlider','waterGroup','colorGroup','weatherGroup','viewGroup']) {
  assert.ok(html.includes('id="' + id + '"'), 'Missing control: ' + id);
}
assert.match(node('phaseReadout').textContent, /READY/);
fire('castButton');
frames(100,140);
assert.match(node('phaseReadout').textContent, /AT DEPTH/);
assert.equal(node('depthReadout').textContent, '30.0');
assert.equal(node('reelButton').disabled, false);

const waters=['clear','stained','muddy'];
const colors=['monkey','true','sunrise','red','toad'];
const weathers=['sun','partly','overcast'];
const views=['human','fish'];
let scenarios=0;
for (const w of waters) for (const c of colors) for (const weather of weathers) for (const view of views) {
  choose('waterGroup','water',w);
  choose('colorGroup','color',c);
  choose('weatherGroup','weather',weather);
  choose('viewGroup','view',view);
  assert.equal(node('fishCaveat').hidden, view!=='fish');
  scenarios++;
}
assert.equal(scenarios,90);
fire('reelButton');
frames(10000,90);
assert.match(node('phaseReadout').textContent, /BACK ON SHORE/);
assert.equal(node('depthReadout').textContent, '0.0');
fire('depthSlider','input',{ target: { value: '15' } });
assert.match(node('phaseReadout').textContent,/DEPTH INSPECTION/);
assert.equal(node('depthReadout').textContent,'15.0');
assert.equal(node('reelButton').disabled,false);
fire('resetButton');
assert.equal(node('depthReadout').textContent,'0.0');
assert.match(node('phaseReadout').textContent,/READY/);
console.log('PASS: 90 control combinations, cast/fall, fish palette, retrieve, depth inspection, reset');
