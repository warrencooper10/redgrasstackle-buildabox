/* Beneath the Surface — standalone no-dependency 2D teaching animation.
   Scientific principles: wavelength-dependent attenuation and water optical constituents.
   All coefficients, RGB bait colors and fish-palette transformation are ILLUSTRATIVE
   and are not measured for any particular lake or crappie. See the linked research
   and model assumptions in index.html. No lure fall-rate or strike prediction. */
(() => {
  'use strict';

  const canvas = document.getElementById('waterScene');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.getElementById('phaseReadout').textContent = 'CANVAS UNAVAILABLE — READ THE RESEARCH BELOW';
    return;
  }

  const W = 1100;
  const H = 640;
  const SURFACE = 146;
  const BOTTOM = 565;
  const DEPTH = 30;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const source = {
    water: 'https://www.usgs.gov/centers/western-geographic-science-center/introduction-aquatic-remote-sensing',
    light: 'https://www.usgs.gov/publications/vertical-attenuation-light-charlotte-harbor-a-shallow-subtropical-estuary-south',
    crappie: 'https://pubmed.ncbi.nlm.nih.gov/2354354/',
    centrarchid: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11974496/'
  };

  // These coefficients are illustrative examples PER METER for broad RGB channels.
  // They do not come from measured Redgrass lakes or actual optical profiles.
  const WATERS = {
    clear: {
      name: 'CLEAR',
      top: [51, 120, 146], deep: [8, 31, 52],
      k: [0.23, 0.105, 0.085], haze: 0.035, particle: 19, visibility: 'longer',
      comment: 'In relatively clear water, light generally penetrates deeper. Which colors persist depends on the actual water constituents.'
    },
    stained: {
      name: 'STAINED',
      top: [103, 128, 83], deep: [24, 44, 31],
      k: [0.29, 0.18, 0.34], haze: 0.17, particle: 48, visibility: 'intermediate',
      comment: 'Water containing dissolved color can absorb some wavelengths differently. Stain is not simply a darker shade of clear water.'
    },
    muddy: {
      name: 'MUDDY',
      top: [135, 109, 66], deep: [39, 31, 22],
      k: [0.55, 0.47, 0.55], haze: 0.40, particle: 115, visibility: 'shorter',
      comment: 'Suspended particles scatter light and can sharply reduce visual contrast over distance. Actual muddy-water conditions vary widely.'
    }
  };
  const WEATHERS = {
    sun: { name: 'FULL SUN', amount: 1, sky: [102, 164, 192], sun: 1, cloud: 0.06 },
    partly: { name: 'PARTLY CLOUDY', amount: 0.72, sky: [128, 158, 171], sun: 0.52, cloud: 0.5 },
    overcast: { name: 'OVERCAST', amount: 0.45, sky: [125, 140, 150], sun: 0.1, cloud: 0.95 }
  };
  // Color references visually matched to owner-supplied Chubby Minnow photos (Nov 2026).
  // These display RGB approximations are NOT laboratory pigment/reflectance readings.
  // True Minnow is a silvery pearl / muted olive back, not a saturated teal.
  // Red Belly uses EXACTLY that True Minnow upper and tail with a red underside.
  const TRUE_MINNOW_BASE = {
    top: [174, 188, 177],
    bottom: [216, 224, 220],
    tail: [201, 215, 203]
  };
  const COLORS = {
    monkey: {
      name: 'MONKEY MILK',
      top: [172, 201, 227], bottom: [216, 227, 236], tail: [185, 205, 230],
      fleckColors: [[23, 69, 121], [209, 78, 120], [24, 40, 59]], speckCount: 11
    },
    true: {
      name: 'TRUE MINNOW', ...TRUE_MINNOW_BASE, fleckColors: [], speckCount: 0
    },
    sunrise: {
      name: 'SUNRISE ORANGE',
      top: [253, 121, 18], bottom: [253, 215, 44], tail: [255, 143, 34],
      fleckColors: [[54, 39, 26]], speckCount: 5
    },
    red: {
      name: 'RED BELLY',
      top: TRUE_MINNOW_BASE.top,
      bottom: [240, 48, 42],
      tail: TRUE_MINNOW_BASE.tail,
      fleckColors: [], speckCount: 0
    },
    toad: {
      name: 'TOADFROG',
      top: [31, 47, 43], bottom: [178, 247, 27], tail: [151, 219, 58],
      fleckColors: [[19, 32, 32]], speckCount: 6
    }
  };
  const state = {
    water: 'clear', color: 'monkey', weather: 'sun', view: 'human',
    phase: 'idle', time: 0, depth: 0, x: 223, y: 117, 
    paused: false, startX: 680, startY: BOTTOM, reelDepth: 30,
    sceneTime: 0, lastFrame: 0
  };
  const el = id => document.getElementById(id);
  const clamp = (v, min=0, max=1) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = v => v * v * (3 - 2 * v);
  const rgb = c => 'rgb(' + c.map(v => Math.round(clamp(v, 0, 255))).join(',') + ')';
  const mix = (a, b, t) => a.map((v, i) => lerp(v, b[i], clamp(t)));
  const water = () => WATERS[state.water];
  const weather = () => WEATHERS[state.weather];
  const color = () => COLORS[state.color];
  const ftToM = ft => ft * 0.3048;

  function fishPalette(c, subject = 'bait') {
    // This is NOT measured crappie perception. Fish studies of related sunfish
    // suggest red/green-sensitive channels, not "all underwater water looks green".
    // Water keeps its clarity-dependent hue. The stylized bait receives a more
    // noticeable change in relative color contrast for educational comparison.
    const luminance = c[0] * 0.25 + c[1] * 0.61 + c[2] * 0.14;
    if (subject === 'water') {
      return mix(c, [luminance * 0.97, luminance, luminance * 1.03], 0.16);
    }
    const redGreenContrast = c[0] - c[1];
    return [
      clamp(luminance + redGreenContrast * 0.34, 0, 255),
      clamp(luminance - redGreenContrast * 0.22, 0, 255),
      clamp(luminance * 0.75 + c[2] * 0.13, 0, 255)
    ];
  }
  function inView(c, subject = 'bait') {
    return state.view === 'fish' ? fishPalette(c, subject) : c;
  }

  function attenuation(depthFt) {
    const z = ftToM(depthFt);
    const incoming = weather().amount;
    return water().k.map(k => Math.exp(-k * z) * incoming);
  }

  function seenColor(input, depthFt, isBait = true) {
    const t = attenuation(depthFt);
    const reflected = input.map((v, i) => v * t[i]);
    if (!isBait) return inView(reflected);
    // Apply a very small environmental veil. Contrast still drops in poor visibility.
    const background = waterBackground(depthFt);
    const haze = clamp(water().haze * ftToM(depthFt) * 0.33, 0, 0.75);
    return inView(mix(reflected, background, haze));
  }
  function waterBackground(depthFt) {
    const d = depthFt / DEPTH;
    const base = mix(water().top, water().deep, ease(d));
    const dim = 0.84 + 0.16 * weather().amount;
    return base.map(v => v * dim);
  }
  function baitVisibility(depthFt) {
    // Legibility-enhanced qualitative visibility, NOT an empirical viewing distance.
    return clamp(0.18 + 0.82 * Math.exp(-water().haze * ftToM(depthFt)), 0.14, 1);
  }

  function syncDimensions() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const targetW = Math.round(Math.max(300, rect.width) * ratio);
    const targetH = Math.round(targetW * H / W);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
  }

  function drawCloud(x, y, scale, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = '#e1e4dd';
    ctx.beginPath();
    ctx.ellipse(x, y, 50*scale, 14*scale, 0, 0, Math.PI*2);
    ctx.ellipse(x-21*scale, y-5*scale, 24*scale, 21*scale, 0, 0, Math.PI*2);
    ctx.ellipse(x+10*scale, y-12*scale, 34*scale, 25*scale, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawSky() {
    const sky = weather().sky;
    const grad = ctx.createLinearGradient(0, -120, 0, SURFACE);
    grad.addColorStop(0, rgb(mix(sky, [22, 41, 60], 0.50)));
    grad.addColorStop(1, rgb(sky));
    ctx.fillStyle = grad;
    ctx.fillRect(-1000, -1000, 4000, SURFACE + 1000);
    if (weather().sun > 0) {
      ctx.save();
      ctx.globalAlpha = weather().sun;
      const glow = ctx.createRadialGradient(805, 5, 4, 805, 5, 180);
      glow.addColorStop(0, '#fff9caaf');
      glow.addColorStop(0.18, '#fff5c666');
      glow.addColorStop(1, '#fff5c600');
      ctx.fillStyle = glow;
      ctx.fillRect(610,-180,400,330);
      ctx.fillStyle = '#fff5d7';
      ctx.beginPath();ctx.arc(805,5,18,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    if (weather().cloud > 0.15) {
      drawCloud(490, 44, 1.7, weather().cloud * 0.8);
      drawCloud(850, 60, 1.1, weather().cloud * 0.6);
      drawCloud(1160, 27, 1.9, weather().cloud * 0.75);
    }
    // Distant tree line.
    ctx.fillStyle = '#213a3caa';
    ctx.beginPath();ctx.moveTo(-500, SURFACE);
    for(let x=-500;x<=1700;x+=22) {
      const h = 18 + Math.sin(x * 0.025) * 11 + Math.sin(x * 0.061) * 8;
      ctx.lineTo(x, SURFACE - h);
    }
    ctx.lineTo(1700, SURFACE);ctx.fill();
  }

  function drawWater() {
    const top = inView(waterBackground(0), 'water');
    const deep = inView(waterBackground(30), 'water');
    const gradient = ctx.createLinearGradient(0, SURFACE, 0, BOTTOM + 120);
    gradient.addColorStop(0, rgb(top));
    gradient.addColorStop(0.47, rgb(inView(mix(waterBackground(6), waterBackground(25), .38), 'water')));
    gradient.addColorStop(1, rgb(deep.map(v=>v*.52)));
    ctx.fillStyle = gradient;
    ctx.fillRect(160, SURFACE, 3000, 1300);

    // Underwater shaft(s): stronger direct sunshine, subtler diffuse glow under clouds.
    const sun = weather().sun;
    if (sun > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const shaft = ctx.createLinearGradient(710,SURFACE,380,BOTTOM);
      shaft.addColorStop(0,'rgba(248,231,174,'+(0.25*sun)+')');
      shaft.addColorStop(1,'rgba(248,231,174,0)');
      ctx.fillStyle = shaft;
      ctx.beginPath();ctx.moveTo(720,SURFACE);ctx.lineTo(885,SURFACE);ctx.lineTo(685,BOTTOM);ctx.lineTo(355,BOTTOM);ctx.closePath();ctx.fill();
      ctx.restore();
    }

    // Surface ripples, visible in both modes.
    for (let i=0;i<16;i++) {
      const x = 175 + i*87;
      const t = reducedMotion ? 0 : state.sceneTime;
      const y = SURFACE + Math.sin(i*1.5+t*1.2)*1.9;
      ctx.strokeStyle = state.view === 'fish' ? '#f5d88a55' : '#d3ebeb7d';
      ctx.lineWidth = i%3===0 ? 2 : 1;
      ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+24,y-3,x+49,y);ctx.stroke();
    }
    ctx.fillStyle = state.view === 'fish' ? '#bdaa6488' : '#a5d8e088';
    ctx.fillRect(160,SURFACE-1,3000,2);

    // A short 2D ripple holds the SPLASH! marker long enough to read.
    if (state.phase === 'splash') {
      const p = clamp(state.time / (reducedMotion ? 0.18 : 1.1));
      ctx.save();
      ctx.strokeStyle = 'rgba(225,239,226,' + (0.84 * (1-p)).toFixed(3) + ')';
      ctx.lineWidth = 2;
      for(let ring=0;ring<3;ring++) {
        const spread = 13 + p*45 + ring*13;
        ctx.beginPath();
        ctx.ellipse(state.x, SURFACE, spread, 5 + p*10 + ring*2, 0, Math.PI, 2*Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Fixed deterministic particles, a visual cue—not a turbidity measurement.
    for (let i=0;i<water().particle;i++) {
      const x = 186 + ((i*151 + Math.sin(i*2.7)*19 + 9500) % 935);
      const y = SURFACE + 9 + ((i*191 + 7000) % (BOTTOM-SURFACE));
      const d = (y-SURFACE)/(BOTTOM-SURFACE);
      ctx.globalAlpha = clamp((.12 + water().haze*.4)*(1-d*.45),0,.4);
      ctx.fillStyle = state.view === 'fish' ? '#eee4a9' : '#e1edda';
      ctx.beginPath();ctx.arc(x,y,0.5 + (i%4)*.38,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Lake bottom drawn for depth context.
    ctx.fillStyle = state.water === 'muddy' ? '#443828' : '#172a27';
    ctx.beginPath();ctx.moveTo(155,BOTTOM+14);
    for(let x=155;x<1650;x+=32)ctx.lineTo(x,BOTTOM + 9 + 5*Math.sin(x/36));
    ctx.lineTo(1650,1400);ctx.lineTo(155,1400);ctx.fill();
    ctx.strokeStyle = '#66745166';ctx.lineWidth = 2;
    for(let x=245;x<1550;x+=120){ctx.beginPath();ctx.moveTo(x,BOTTOM+10);ctx.lineTo(x-7,BOTTOM-10);ctx.moveTo(x,BOTTOM+10);ctx.lineTo(x+11,BOTTOM-15);ctx.stroke();}
    // Light depth tick grid: not a measured depth chart.
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    for(let i=0;i<=DEPTH;i+=5){
      const y=SURFACE+(BOTTOM-SURFACE)*i/DEPTH;
      ctx.strokeStyle='#dcece522';ctx.lineWidth=1;
      ctx.setLineDash([5,10]);ctx.beginPath();ctx.moveTo(177,y);ctx.lineTo(1052,y);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#e5f1ed9c';ctx.fillText(i+' FT',1037,y-6);
    }
  }

  function drawShoreAndAngler() {
    ctx.save();
    ctx.fillStyle = '#36352a';
    ctx.beginPath();ctx.moveTo(-800, SURFACE-20);ctx.lineTo(125,SURFACE-20);ctx.lineTo(192,SURFACE+9);
    ctx.lineTo(193,1400);ctx.lineTo(-800,1400);ctx.fill();
    ctx.fillStyle='#6b644c';ctx.fillRect(-400,SURFACE-25,531,7);
    ctx.strokeStyle='#7d8a6f';ctx.lineWidth=3;
    for(let i=0;i<16;i++){const x=12+i*8;ctx.beginPath();ctx.moveTo(x,SURFACE-26);ctx.lineTo(x+4,SURFACE-37-(i%4)*3);ctx.stroke();}
    // Angler: 2D still illustration; only the fishing line and lure move.
    ctx.translate(100,0);
    // Shadow
    ctx.fillStyle='#07111c77';ctx.beginPath();ctx.ellipse(0,137,39,5,0,0,Math.PI*2);ctx.fill();
    // Boots and legs
    ctx.strokeStyle='#242f34';ctx.lineWidth=13;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-4,89);ctx.lineTo(-9,125);ctx.lineTo(-2,136);
    ctx.moveTo(15,89);ctx.lineTo(21,122);ctx.lineTo(31,137);ctx.stroke();
    ctx.strokeStyle='#101c21';ctx.lineWidth=9;
    ctx.beginPath();ctx.moveTo(-12,137);ctx.lineTo(4,137);ctx.moveTo(24,137);ctx.lineTo(41,137);ctx.stroke();
    // Torso and vest
    ctx.fillStyle='#d58136';ctx.beginPath();ctx.moveTo(-20,43);ctx.lineTo(21,41);ctx.lineTo(29,92);ctx.lineTo(-13,96);ctx.closePath();ctx.fill();
    ctx.fillStyle='#995928';ctx.fillRect(8,51,12,39);
    ctx.strokeStyle='#252e2e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-18,87);ctx.lineTo(26,85);ctx.stroke();
    // Head and cap
    ctx.fillStyle='#c7a88a';ctx.beginPath();ctx.ellipse(-2,29,12,14,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#202b2d';ctx.fillRect(-15,15,26,10);ctx.fillRect(-7,23,30,4);
    // Arm into fishing rod
    ctx.strokeStyle='#c7a88a';ctx.lineWidth=9;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(17,53);ctx.lineTo(38,69);ctx.lineTo(64,60);ctx.stroke();
    ctx.strokeStyle='#2b2927';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(64,60);ctx.lineTo(97,11);ctx.stroke();
    ctx.strokeStyle='#d7d1be';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(97,11);ctx.lineTo(166,-32);ctx.stroke();
    ctx.fillStyle='#f3ba6d';ctx.beginPath();ctx.arc(54,62,4,0,Math.PI*2);ctx.fill();
    ctx.restore();
    if(state.phase !== 'done'){
      ctx.strokeStyle='#dce5df99';ctx.lineWidth=1;ctx.setLineDash([3,5]);
      ctx.beginPath();ctx.moveTo(266,-32);ctx.quadraticCurveTo(430,35,state.x,state.y);ctx.stroke();ctx.setLineDash([]);
    }
  }

  function drawBait() {
    const deep = state.depth;
    const hue = color();
    const alpha = baitVisibility(deep);
    const body = seenColor(hue.top,deep);
    const belly = seenColor(hue.bottom,deep);
    const tail = seenColor(hue.tail,deep);

    ctx.save();
    ctx.translate(state.x,state.y);
    let angle = 0;
    if(state.phase==='cast' || state.phase==='splash') angle = 0.18;
    if(state.phase==='fall' || (state.phase==='inspect' && deep>0)) angle = .8;
    if(state.phase==='reel') angle = -.22;
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    // Tail: pure fill with NO border or glow. Its edge must not imply a
    // highlighted/fluorescent outline that the real bait doesn't have.
    ctx.shadowBlur = 0;
    ctx.fillStyle = rgb(tail);
    ctx.beginPath();ctx.moveTo(25,-4);ctx.lineTo(53,-18);ctx.quadraticCurveTo(47,-1,59,1);
    ctx.quadraticCurveTo(48,3,53,18);ctx.lineTo(25,6);ctx.closePath();ctx.fill();
    // Preserve the existing subtle body glow; the tail remains fill-only.
    ctx.shadowColor = state.view==='fish' ? '#dfb75d55' : '#dae4dc55';
    ctx.shadowBlur = 12;
    // Body fixed shape, independent of selected Redgrass bait profile.
    ctx.beginPath();
    ctx.moveTo(-30,0);ctx.bezierCurveTo(-26,-13,-3,-11,17,-9);
    ctx.bezierCurveTo(30,-6,34,-3,35,0);
    ctx.bezierCurveTo(34,4,23,9,11,9);
    ctx.bezierCurveTo(-8,10,-26,12,-30,0);ctx.closePath();
    ctx.fillStyle=rgb(body);ctx.fill();ctx.clip();
    ctx.fillStyle=rgb(belly);ctx.fillRect(-35,0,75,14);
    // A few reference-informed flecks on colors that have them.
    // Small and deterministic so the motion remains stable.
    if (hue.speckCount && hue.fleckColors.length) {
      for (let i = 0; i < hue.speckCount; i++) {
        const pigment = hue.fleckColors[i % hue.fleckColors.length];
        ctx.fillStyle = rgb(seenColor(pigment, deep));
        const fx = -20 + (i * 29 % 49);
        const fy = -6 + (i * 7 % 12);
        ctx.beginPath();
        ctx.arc(fx, fy, i % 4 === 0 ? 1.2 : 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.strokeStyle='#ffffff33';ctx.lineWidth=1;
    for(let x=-12;x<27;x+=10){ctx.beginPath();ctx.moveTo(x,-4);ctx.lineTo(x+8,6);ctx.stroke();}
    ctx.restore();

    ctx.save();ctx.translate(state.x,state.y);ctx.rotate(angle);
    ctx.globalAlpha=clamp(alpha+.15,0,1);
    // Jighead and fixed hook.
    ctx.fillStyle=state.view==='fish'?'#c3b482':'#c6c9c4';
    ctx.strokeStyle='#253039';ctx.lineWidth=1.4;
    ctx.beginPath();ctx.arc(-30,0,8,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#111919';ctx.beginPath();ctx.arc(-33,-2,2.5,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#a4b7b3';ctx.lineWidth=1.3;
    ctx.beginPath();ctx.moveTo(-28,-6);ctx.quadraticCurveTo(-20,-15,-12,-17);ctx.quadraticCurveTo(7,-22,17,-8);ctx.stroke();
    ctx.restore();
  }

  function drawAnnotations() {
    if(state.phase==='idle') {
      ctx.fillStyle='#e9e0d0d9';ctx.font='bold 13px Arial';
      ctx.textAlign='left';ctx.fillText('PICK A COLOR. CHANGE THE CONDITIONS. CAST.',355,98);
    }
    if(state.phase==='hold'||state.phase==='inspect') {
      ctx.fillStyle='#f5dfb9';ctx.textAlign='left';ctx.font='bold 13px Arial';
      ctx.fillText('OBSERVE THE COLOR & CONTRAST',state.x+51,state.y-23);
      ctx.strokeStyle='#e7af61';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(state.x+35,state.y);ctx.lineTo(state.x+48,state.y-20);ctx.lineTo(state.x+250,state.y-20);ctx.stroke();
    }
  }

  function render() {
    syncDimensions();
    const scaleX=canvas.width/W,scaleY=canvas.height/H;
    ctx.setTransform(scaleX,0,0,scaleY,0,0);
    ctx.clearRect(0,0,W,H);
    const moving=state.phase==='fall'||state.phase==='reel'||state.phase==='inspect'||state.phase==='hold';
    const focusMix = moving ? ease(clamp(state.depth/12)) : 0;
    const zoom=1 + (state.phase==='reel' ? .37*clamp(state.depth/DEPTH) : .45*focusMix);
    const focusX=lerp(W/2,state.x,focusMix*.84);
    const focusY=lerp(H/2,state.y,focusMix*.8);
    ctx.save();
    ctx.translate(W/2,H/2);
    ctx.scale(zoom,zoom);
    ctx.translate(-focusX,-focusY);
    drawSky();
    drawWater();
    drawShoreAndAngler();
    drawBait();
    drawAnnotations();
    ctx.restore();
  }

  function phaseLabel() {
    return {
      idle:'READY TO CAST',cast:'CASTING',splash:'SPLASH! BAIT ENTERS WATER',fall:'FOLLOWING THE BAIT DOWN',
      hold:'AT DEPTH — INSPECT OR REEL',
      inspect:'DEPTH INSPECTION',reel:'REELING THROUGH THE WATER COLUMN',
      done:'BACK ON SHORE — CAST AGAIN'
    }[state.phase] || 'READY';
  }

  function updateControls() {
    const moving=['cast','splash','fall','reel'].includes(state.phase);
    el('castButton').disabled=moving;
    el('reelButton').disabled=moving || (state.phase==='idle'||state.phase==='done') || state.depth <= 0;
    el('pauseButton').disabled=!moving;
    el('pauseButton').textContent=state.paused?'RESUME':'PAUSE';
    el('phaseReadout').textContent=state.paused?'PAUSED / '+phaseLabel():phaseLabel();
    el('conditionReadout').textContent=water().name+' WATER / '+weather().name;
    el('viewLabel').textContent=state.view==='fish'?'FISH · MODELED':'HUMAN';
    el('depthReadout').textContent=state.depth.toFixed(1);
    el('depthSlider').value=state.depth.toFixed(1);
    el('scrubOutput').textContent=Math.round(state.depth*10)/10+' FT';
    updateMilestone();
  }

  function milestoneCopy(level) {
    const scenario = state.water;
    const byClarity = {
      1: {
        clear: 'In this clear-water example, the bait is still easy to recognize near the surface.',
        stained: 'Even at one foot, colored water can begin to change the look of a bait.',
        muddy: 'Muddy water can reduce contrast even in the shallowest part of the column.'
      },
      5: {
        clear: 'Some wavelengths are fading already. Reds often weaken sooner than blue-green light.',
        stained: 'Dissolved color can absorb different wavelengths; notice how the palette shifts.',
        muddy: 'Suspended particles scatter light, making the bait less distinct from its background.'
      },
      10: {
        clear: 'The original bait color can shift, but ten feet does not make it invisible.',
        stained: 'With more stained water above it, both brightness and color can change.',
        muddy: 'Contrast is reduced in this example. Real visibility depends on the actual water.'
      },
      20: {
        clear: 'Brightness and contrast are both changing; look at bait versus background.',
        stained: 'Water color and distance have increasingly changed this illustrative scene.',
        muddy: 'The model shows very poor contrast, not a measured limit for every muddy lake.'
      },
      30: {
        clear: 'Thirty feet is not automatically black. Clear water can still transmit light.',
        stained: 'At this depth, the illustrative stain filters light strongly; other lakes will differ.',
        muddy: 'Very little contrast remains in this example. This is not a universal cutoff depth.'
      }
    };
    return byClarity[level][scenario];
  }

  function updateMilestone() {
    const tag = el('depthTag');
    if (state.phase === 'idle' || state.phase === 'cast' || state.phase === 'done') {
      tag.hidden = true;
      return;
    }
    const entering = state.phase === 'splash' || (state.phase === 'fall' && state.depth < 1);
    const level = entering ? 0 : state.depth >= 30 ? 30 :
      state.depth >= 20 ? 20 : state.depth >= 10 ? 10 :
      state.depth >= 5 ? 5 : 1;
    const direction = state.phase === 'reel' ? 'ASCENT' :
      state.phase === 'inspect' ? 'INSPECT' : entering ? 'ENTRY' : 'DESCENT';
    const key = [direction,level,state.water,state.weather,state.view].join('|');
    if(tag.dataset.key === key && !tag.hidden)return;
    tag.dataset.key = key;
    tag.hidden = false;
    el('tagStage').textContent = direction;
    el('tagDepth').textContent = entering ? 'SPLASH!' : level + ' FT';
    const titles = {1:'NEAR THE SURFACE',5:'COLORS BEGIN TO SHIFT',10:'WATCH THE WAVELENGTHS',20:'CONTRAST MATTERS',30:'THIRTY FEET — NOT A UNIVERSAL RULE'};
    el('tagTitle').textContent = entering ? 'BAIT ENTERS THE WATER' : titles[level];
    el('tagBody').textContent = entering
      ? 'Light now passes through water before illuminating the bait.'
      : milestoneCopy(level);
    el('tagSource').href = level === 1 || entering ? source.water : source.light;
  }

  function updateFact() {
    let index=1, title='',body='',url=source.water;
    if(state.view==='fish') {
      index=4;title='Fish view is an informed illustration—not a literal picture of crappie vision.';
      body='Related sunfish research suggests red- and green-sensitive color channels, but it does not mean clear water looks uniformly green. This version keeps water clarity recognizable while adjusting the bait palette. Actual crappie perception remains unknown.';
      url=source.centrarchid;
    } else if(state.water==='muddy') {
      index=3;title='Low contrast can matter more than the original paint color.';
      body='Particles scatter and absorb light, reducing visibility. In muddy water the bait can become harder to distinguish quickly, even when its shape remains unchanged. Exact distances depend on the actual water.';
      url=source.water;
    } else if(state.water==='stained') {
      index=2;title='Stained water does more than make everything darker.';
      body='Dissolved colored substances can change which wavelengths travel through water. The simulation exaggerates some changes for clarity; actual tint varies by lake and conditions.';
      url=source.water;
    } else if(state.depth>=12) {
      index=2;title='At depth, a familiar color may look unfamiliar.';
      body='As light travels through water, different parts of its spectrum are reduced by different amounts. This changes the light available for a colored object to reflect, but depth alone never guarantees total darkness.';
      url=source.light;
    } else if(state.weather==='overcast') {
      index=2;title='Clouds change the light entering the water.';
      body='Overcast conditions generally reduce direct sunlight and increase the relative role of diffuse skylight. Our three weather settings are illustrative presets, not measured illumination.';
      url=source.water;
    } else {
      index=1;title='Light changes as it travels through water.';
      body='Depth, suspended particles, and dissolved material influence the amount and color of light available underwater. Change one condition, then compare the same bait again.';
      url=source.water;
    }
    el('noteCount').textContent=String(index).padStart(2,'0');
    el('factTitle').textContent=title;
    el('factBody').textContent=body;
    el('factSource').href=url;
  }

  function setActive(group, attr, value) {
    document.querySelectorAll('#'+group+' [data-'+attr+']').forEach(btn => {
      const chosen=btn.dataset[attr]===value;
      btn.classList.toggle('active',chosen);
      btn.setAttribute('aria-pressed',String(chosen));
    });
  }

  function startCast() {
    state.phase='cast';state.time=0;state.paused=false;state.depth=0;
    state.x=223;state.y=117;
    updateControls();updateFact();
  }
  function startReel() {
    if (state.depth<=0 || ['cast','fall','reel'].includes(state.phase)) return;
    state.startX=state.x;
    state.startY=state.y;
    state.reelDepth=state.depth;
    state.phase='reel';state.time=0;state.paused=false;
    updateControls();
  }
  function reset() {
    state.phase='idle';state.time=0;state.paused=false;state.depth=0;
    state.x=223;state.y=117;
    updateControls();updateFact();render();
  }
  function inspectAt(depth) {
    state.phase='inspect';state.paused=false;state.time=0;
    state.depth=clamp(depth,0,DEPTH);
    state.x=683;state.y=SURFACE+(BOTTOM-SURFACE)*state.depth/DEPTH;
    updateControls();updateFact();render();
  }

  document.getElementById('waterGroup').addEventListener('click', event => {
    const button=event.target.closest('[data-water]');
    if(!button)return;
    state.water=button.dataset.water;
    setActive('waterGroup','water',state.water);
    updateControls();updateFact();render();
  });
  document.getElementById('colorGroup').addEventListener('click', event => {
    const button=event.target.closest('[data-color]');
    if(!button)return;
    state.color=button.dataset.color;
    setActive('colorGroup','color',state.color);
    updateFact();render();
  });
  document.getElementById('weatherGroup').addEventListener('click', event => {
    const button=event.target.closest('[data-weather]');
    if(!button)return;
    state.weather=button.dataset.weather;
    setActive('weatherGroup','weather',state.weather);
    updateControls();updateFact();render();
  });
  document.getElementById('viewGroup').addEventListener('click', event => {
    const button=event.target.closest('[data-view]');
    if(!button)return;
    state.view=button.dataset.view;
    setActive('viewGroup','view',state.view);
    el('viewExplain').textContent=state.view==='fish'
      ? 'A simplified bait-color palette inspired by related sunfish research, with water clarity preserved.'
      : 'A human-readable approximation of the bait and water under the chosen conditions.';
    el('fishCaveat').hidden=state.view!=='fish';
    updateControls();updateFact();render();
  });
  el('castButton').addEventListener('click', startCast);
  el('reelButton').addEventListener('click', startReel);
  el('pauseButton').addEventListener('click', () => {
    if(!['cast','splash','fall','reel'].includes(state.phase))return;
    state.paused=!state.paused;
    updateControls();
  });
  el('resetButton').addEventListener('click',reset);
  el('depthSlider').addEventListener('input', e => inspectAt(Number(e.target.value)));
  window.addEventListener('resize',render,{passive:true});

  function animate(now) {
    const dt=state.lastFrame ? Math.min((now-state.lastFrame)/1000,0.05) : 0;
    state.lastFrame=now;
    if(!state.paused) {
      state.sceneTime+=dt;
      const durations = reducedMotion
        ? {cast:0.18,splash:0.18,fall:0.20,reel:0.25}
        : {cast:1.22,splash:1.1,fall:16.8,reel:15.2};
      if(state.phase==='cast'){
        state.time+=dt;
        const p=clamp(state.time/durations.cast);
        state.x=lerp(223,681,p);
        state.y=lerp(117,SURFACE,p)-120*Math.sin(Math.PI*p);
        state.depth=0;
        if(p===1){state.phase='splash';state.time=0;state.x=681;state.y=SURFACE;}
      } else if(state.phase==='splash'){
        state.time+=dt;
        if(state.time>=durations.splash){state.phase='fall';state.time=0;}
      } else if(state.phase==='fall'){
        state.time+=dt;
        const p=clamp(state.time/durations.fall);
        state.depth=30*p;
        state.x=681+9*Math.sin(p*Math.PI);
        state.y=lerp(SURFACE,BOTTOM,p);
        if(p===1){state.phase='hold';state.time=0;}
      } else if(state.phase==='reel'){
        state.time+=dt;
        const p=clamp(state.time/durations.reel);
        const q=ease(p);
        state.x=lerp(state.startX,223,q);
        state.y=lerp(state.startY,117,q);
        state.depth=state.reelDepth*(1-q);
        if(p===1){state.phase='done';state.time=0;state.depth=0;state.x=223;state.y=117;}
      }
    }
    updateControls();
    // Avoid resetting explanatory text on every animation frame.
    const factKey=state.view+'-'+state.water+'-'+state.weather+'-'+(state.depth>=12);
    if(factKey!==animate.lastFactKey){
      animate.lastFactKey=factKey;updateFact();
    }
    render();
    window.requestAnimationFrame(animate);
  }

  updateControls();
  updateFact();
  render();
  window.requestAnimationFrame(animate);
})();
