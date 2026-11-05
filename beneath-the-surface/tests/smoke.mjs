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
const gradients = [];
const baitPaints = [];
let nextFrame = null;

const context2d = new Proxy({}, {
  get(target, key) {
    if (key === 'createLinearGradient' || key === 'createRadialGradient') {
      return () => {
        const stops = [];
        gradients.push(stops);
        return { addColorStop(offset,color) { stops.push({ offset, color }); } };
      };
    }
    return key in target ? target[key] : () => {};
  },
  set(target, key, value) {
    if (key === 'fillStyle' && typeof value === 'string' && value.startsWith('rgb(')) {
      baitPaints.push(value);
    }
    target[key] = value;
    return true;
  }
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
  'depthSlider','waterGroup','colorGroup','weatherGroup','viewGroup',
  'depthTag','tagDepth','tagStage','tagTitle','tagBody','tagSource']) {
  assert.ok(html.includes('id="' + id + '"'), 'Missing control: ' + id);
}
// Guard the owner-confirmed Red Belly composition against future drift.
assert.match(app, /top:\s*TRUE_MINNOW_BASE\.top/);
assert.match(app, /tail:\s*TRUE_MINNOW_BASE\.tail/);
assert.match(app, /bottom:\s*\[240,\s*48,\s*42\]/);
// Keep owner-confirmed shared color constructions rather than independent guesses.
assert.match(app, /bottom:\s*MONKEY_MILK_BASE\.bottom/);
assert.match(app, /bottom:\s*LEMON_PEPPER_BASE\.bottom/);
assert.match(app, /opacity:\s*0\.69/); // nearly translucent Monkey Milk
assert.match(app, /Black:red = 5:1/);
assert.match(app, /const HIGHLIGHTER_CHARTREUSE = \[248, 255, 5\]/);
assert.match(app, /top: HIGHLIGHTER_CHARTREUSE, bottom: HIGHLIGHTER_CHARTREUSE/);
assert.match(app, /name: 'SUNRISE ORANGE',[\s\S]*?bottom: HIGHLIGHTER_CHARTREUSE/);
assert.match(app, /name: 'TOADFROG',[\s\S]*?bottom: HIGHLIGHTER_CHARTREUSE/);
assert.match(app, /name: 'WHITETREUSE',[\s\S]*?bottom: HIGHLIGHTER_CHARTREUSE/);
assert.match(app, /name: 'ELECTRIC BLUE',[\s\S]*?bottom: LEMON_PEPPER_BASE\.bottom/);
assert.match(app, /top: \[145, 158, 118\], bottom: \[216, 224, 220\]/);
assert.ok((html.match(/--swatch-bottom:#f8ff05/g) || []).length >= 4,
  'All highlighter-yellow chartreuse references must share the revised swatch');

assert.match(app, /name:\s*'TWILIGHT'/);
assert.match(app, /name:\s*'STINGRAY'/);
assert.match(app, /name:\s*'WHITETREUSE'/);

assert.equal((html.match(/--swatch-top:/g)||[]).length, 12, 'Each color needs a two-tone reference swatch');
assert.equal((html.match(/--swatch-bottom:/g)||[]).length, 12);
assert.match(node('phaseReadout').textContent, /READY/);
assert.equal(node('depthTag').hidden,true);
for (const depth of [1,5,10,20,30]) {
  fire('depthSlider','input',{ target: { value: String(depth) } });
  assert.equal(node('tagDepth').textContent,depth+' FT');
  assert.equal(node('depthTag').hidden,false);
}
fire('resetButton');
fire('castButton');
frames(100,30);
assert.match(node('phaseReadout').textContent, /SPLASH/);
assert.equal(node('tagDepth').textContent, 'SPLASH!');
assert.equal(node('castButton').disabled, true);
frames(1600,50);
assert.match(node('phaseReadout').textContent, /FOLLOWING/);
const fallDepth=node('depthReadout').textContent;
assert.ok(Number(fallDepth)>1 && Number(fallDepth)<10,'Fall must be quarter speed');
fire('pauseButton');
frames(4200,30);
assert.equal(node('depthReadout').textContent,fallDepth,'Pause must freeze descent');
fire('pauseButton');
frames(6000,370);
assert.match(node('phaseReadout').textContent, /AT DEPTH/);
assert.equal(node('depthReadout').textContent, '30.0');
assert.equal(node('tagDepth').textContent, '30 FT');
assert.equal(node('reelButton').disabled, false);

const waters=['clear','stained','muddy'];
const colors=['monkey','true','sunrise','red','toad','og','twilight','lemon','stingray','tux','whitetreuse','electric'];
const weathers=['sun','partly','overcast'];
const views=['human','fish'];
const topWater = () => {
  const last = gradients.filter(stops => stops.length===3).at(-1);
  assert.ok(last,'Water gradient must exist');
  return last[0].color.match(/\d+/g).map(Number);
};
choose('waterGroup','water','clear');
choose('viewGroup','view','fish');
const clearFish=topWater();
assert.ok(clearFish[2]>clearFish[1],'Clear fish water should remain blue-green, not solid green');
choose('waterGroup','water','stained');
const stainedFish=topWater();
assert.ok(stainedFish[1]>stainedFish[2],'Stained water should keep its own hue');
choose('waterGroup','water','muddy');
const muddyFish=topWater();
assert.ok(muddyFish[0]>muddyFish[1] && muddyFish[1]>muddyFish[2],'Muddy water should remain brown');
let scenarios=0;
for (const w of waters) for (const c of colors) for (const weather of weathers) for (const view of views) {
  choose('waterGroup','water',w);
  choose('colorGroup','color',c);
  choose('weatherGroup','weather',weather);
  choose('viewGroup','view',view);
  assert.equal(node('fishCaveat').hidden, view!=='fish');
  scenarios++;
}
assert.equal(scenarios,216);
fire('reelButton');
frames(28000,350);
assert.match(node('phaseReadout').textContent, /BACK ON SHORE/);
assert.equal(node('depthReadout').textContent, '0.0');
fire('depthSlider','input',{ target: { value: '15' } });
assert.match(node('phaseReadout').textContent,/DEPTH INSPECTION/);
assert.equal(node('depthReadout').textContent,'15.0');
assert.equal(node('reelButton').disabled,false);
fire('resetButton');
assert.equal(node('depthReadout').textContent,'0.0');
assert.match(node('phaseReadout').textContent,/READY/);

// Outdoor bait appearance must not respond to sky, water, or Fish presets.
// True Minnow has no glitter flecks, giving three unambiguous RGB paint calls
// (tail, body, belly) to inspect without needing a real browser Canvas.
const lastBaitPaints = () => baitPaints.slice(-3).join('|');
const snapshot = change => { baitPaints.length=0; change(); return lastBaitPaints(); };
choose('colorGroup','color','true');
choose('waterGroup','water','clear');
choose('viewGroup','view','human');
const drySun = snapshot(() => choose('weatherGroup','weather','sun'));
assert.equal(drySun, 'rgb(187,201,172)|rgb(145,158,118)|rgb(216,224,220)');
const dryCloudy = snapshot(() => choose('weatherGroup','weather','partly'));
const dryOvercast = snapshot(() => choose('weatherGroup','weather','overcast'));
assert.equal(drySun, dryCloudy, 'Partly cloudy cannot change a dry bait');
assert.equal(drySun, dryOvercast, 'Overcast cannot change a dry bait');
assert.equal(snapshot(() => choose('viewGroup','view','fish')), drySun,
  'Fish mode cannot recolor a bait before it enters water');
assert.equal(snapshot(() => choose('waterGroup','water','muddy')), drySun,
  'Muddy water cannot recolor a bait that is still in air');

// Changing conditions at depth DOES change the simulated bait appearance.
const wetOvercast = snapshot(() => fire('depthSlider','input',{target:{value:'10'}}));
const wetSunny = snapshot(() => choose('weatherGroup','weather','sun'));
assert.ok(wetSunny !== drySun, 'Water filtering should begin after entry');
assert.ok(wetSunny !== wetOvercast, 'Weather should still affect the bait underwater');
assert.equal(snapshot(() => fire('resetButton')),drySun,
  'After reset, bait must return to original dry colors');

// The cast is also airborne, not merely the idle state.
fire('castButton');
frames(50000,8);
assert.match(node('phaseReadout').textContent,/CASTING/);
assert.equal(snapshot(() => choose('weatherGroup','weather','overcast')),drySun,
  'Weather cannot recolor an airborne bait');
frames(51000,30);
assert.match(node('phaseReadout').textContent,/SPLASH/);
assert.ok(snapshot(() => choose('weatherGroup','weather','sun')) !== drySun,
  'At splash the water/weather renderer should take over');

console.log('PASS: 216 scenarios, slow motion, splash, depth tags, fish water palette, dry/airborne bait invariance, wet condition changes, reset');
