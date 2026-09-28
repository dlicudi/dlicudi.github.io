// Lunar Lander: a small vector landing game drawn on the home page canvas.

const GRAVITY = 16;      // px/s²
const THRUST = 42;       // px/s²
const TURN_RATE = 3;     // rad/s
const BURN_RATE = 8;     // fuel units/s
const START_FUEL = 100;
const LANDING_FUEL = 25; // refuel after each landing
const SAFE_VY = 25;      // px/s
const SAFE_VX = 15;      // px/s
const SAFE_ANGLE = 0.2;  // rad
const TO_METRES = 0.1;   // px → m for the readouts

const LEGS = [[-9, 10], [9, 10]];
const HULL = [[0, -9], [-7, 2], [7, 2]];
const SHAPE = [
  [[-6, -8], [6, -8]], [[6, -8], [7, 2]], [[7, 2], [-7, 2]], [[-7, 2], [-6, -8]], // cabin
  [[-5, 2], [-9, 10]], [[5, 2], [9, 10]],                                         // legs
  [[-11, 10], [-7, 10]], [[7, 10], [11, 10]],                                     // feet
];
const PADS = [{ w: 72, mult: 1 }, { w: 44, mult: 3 }, { w: 30, mult: 5 }];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Jagged terrain with one landing pad in each third of the screen.
function makeWorld(W) {
  const H = Math.round(W * 9 / 16);
  const wrap = x => ((x % W) + W) % W;

  const thirds = [0, 1, 2].sort(() => Math.random() - 0.5);
  const pads = PADS.map((p, i) => {
    const lo = thirds[i] * W / 3 + 30;
    const hi = (thirds[i] + 1) * W / 3 - 30 - p.w;
    const x0 = lo + Math.random() * (hi - lo);
    return { x0, x1: x0 + p.w, mult: p.mult, y: 0 };
  }).sort((a, b) => a.x0 - b.x0);

  const jag = y => clamp(y + (Math.random() - 0.5) * H * 0.16, H * 0.45, H - 16);
  let x = 0;
  let y = H * (0.7 + Math.random() * 0.15);
  const points = [[0, y]];
  const walkTo = end => {
    while (end - x > 36) {
      x += 14 + Math.random() * 22;
      y = jag(y);
      points.push([x, y]);
    }
  };
  for (const pad of pads) {
    walkTo(pad.x0);
    y = pad.y = jag(y);
    points.push([pad.x0, y], [pad.x1, y]);
    x = pad.x1;
  }
  walkTo(W);
  points.push([W, points[0][1]]);

  const heightAt = px => {
    px = wrap(px);
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      if (px <= x1) return y0 + (y1 - y0) * (px - x0) / (x1 - x0);
    }
    return points[0][1];
  };

  const stars = Array.from({ length: 40 }, () => [Math.random() * W, Math.random() * H * 0.5]);
  const ceiling = Math.min(...points.map(p => p[1]));
  return { W, H, wrap, pads, points, stars, heightAt, ceiling };
}

function makeLander(world, fuel) {
  return { x: world.W * 0.1, y: 40, vx: 25, vy: 0, angle: 0, fuel, thrusting: false };
}

function toWorld(L, [px, py]) {
  const c = Math.cos(L.angle);
  const s = Math.sin(L.angle);
  return [L.x + px * c - py * s, L.y + px * s + py * c];
}

// turn is -1..1 (full rate left..right).
function physics(L, world, thrust, turn, dt) {
  L.angle = clamp(L.angle + turn * TURN_RATE * dt, -Math.PI / 2, Math.PI / 2);
  L.thrusting = thrust && L.fuel > 0;
  let ax = 0;
  let ay = GRAVITY;
  if (L.thrusting) {
    ax = Math.sin(L.angle) * THRUST;
    ay -= Math.cos(L.angle) * THRUST;
    L.fuel = Math.max(0, L.fuel - BURN_RATE * dt);
  }
  L.vx += ax * dt;
  L.vy += ay * dt;
  L.x = world.wrap(L.x + L.vx * dt);
  L.y += L.vy * dt;
  if (L.y < 20) {
    L.y = 20;
    L.vy = Math.max(0, L.vy);
  }
}

function altitude(L, world) {
  return world.heightAt(L.x) - (L.y + LEGS[0][1]);
}

// null while airborne, otherwise the pad landed on or 'crash'.
function touchdown(L, world) {
  const feet = LEGS.map(p => toWorld(L, p));
  const hull = HULL.map(p => toWorld(L, p));
  const below = ([x, y]) => y >= world.heightAt(x);
  if (!feet.some(below) && !hull.some(below)) return null;

  const onPad = p => feet.every(([x]) => {
    x = world.wrap(x);
    return x >= p.x0 && x <= p.x1;
  });
  const pad = world.pads.find(onPad);
  const gentle = L.vy <= SAFE_VY && Math.abs(L.vx) <= SAFE_VX && Math.abs(L.angle) <= SAFE_ANGLE;
  if (!pad || !gentle || hull.some(below)) return 'crash';

  L.y += pad.y - Math.max(feet[0][1], feet[1][1]);
  L.vx = L.vy = 0;
  return pad;
}

const steer = (angle, target, dt) => clamp((target - angle) / (TURN_RATE * dt), -1, 1);

// Flies the demo: cruise above the terrain, drift over the pad, then descend.
function autopilot(L, world, pad, dt) {
  let dx = (pad.x0 + pad.x1) / 2 - L.x;
  if (dx > world.W / 2) dx -= world.W;
  if (dx < -world.W / 2) dx += world.W;
  const alt = altitude(L, world);
  const tilt = alt < 30 ? 0.08 : 0.5;
  const target = clamp((clamp(dx * 0.5, -35, 35) - L.vx) * 0.05, -tilt, tilt);
  const over = Math.abs(dx) < (pad.x1 - pad.x0) / 2 - 12;
  const wantVy = over
    ? clamp(alt * 0.3 + 4, 5, 40)
    : clamp((world.ceiling - 60 - L.y) * 0.5, -25, 25);
  return { thrust: L.vy > wantVy, turn: steer(L.angle, target, dt) };
}

const canvas = document.getElementById('lander');
if (canvas) start(canvas);

function start(canvas) {
  const ctx = canvas.getContext('2d');
  const css = getComputedStyle(document.documentElement);
  const C = Object.fromEntries(
    ['bg', 'fg', 'muted', 'accent', 'warn'].map(n => [n, css.getPropertyValue(`--${n}`).trim()])
  );
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
  const SANS = 'ui-sans-serif, system-ui, -apple-system, sans-serif';

  let best = 0;
  try { best = Number(localStorage.getItem('lander-best')) || 0; } catch {}

  let world, L, target;
  let debris = [];
  let mode = 'demo';     // demo | play | over
  let phase = 'flying';  // flying | landed | crashed
  let timer = 0;
  let score = 0;
  let lastPad = null;
  const keys = new Set();
  const pointer = { held: false, x: 0 };
  let visible = true;
  let running = false;
  let last = 0;

  function newRound(fuel) {
    world = makeWorld(clamp(Math.round(canvas.clientWidth) || 800, 480, 800));
    L = makeLander(world, fuel);
    const easy = world.pads.filter(p => p.mult < 5);
    target = easy[Math.floor(Math.random() * easy.length)];
    phase = 'flying';
    debris = [];
    timer = 0;
  }

  function setMode(next) {
    mode = next;
    canvas.classList.toggle('playing', mode === 'play');
    if (mode === 'play') score = 0;
    newRound(START_FUEL);
    kick();
  }

  // Click, tap, Enter or Space.
  function activate() {
    if (mode !== 'play') setMode('play');
    else if (phase === 'landed') {
      newRound(L.fuel);
      kick();
    }
  }

  function controls(dt) {
    if (mode === 'demo') return autopilot(L, world, target, dt);
    if (pointer.held) {
      let dx = pointer.x - L.x;
      if (dx > world.W / 2) dx -= world.W;
      if (dx < -world.W / 2) dx += world.W;
      return { thrust: true, turn: steer(L.angle, clamp(dx / 80, -1, 1) * 1.2, dt) };
    }
    const has = (...codes) => codes.some(c => keys.has(c));
    return {
      thrust: has('ArrowUp', 'KeyW', 'Space'),
      turn: has('ArrowRight', 'KeyD') - has('ArrowLeft', 'KeyA'),
    };
  }

  function land(pad) {
    phase = 'landed';
    timer = 0;
    L.thrusting = false;
    if (mode !== 'play') return;
    lastPad = pad;
    score += 50 * pad.mult;
    L.fuel = Math.min(START_FUEL, L.fuel + LANDING_FUEL);
  }

  function crash() {
    phase = 'crashed';
    timer = 0;
    debris = SHAPE.map(seg => {
      const [[ax, ay], [bx, by]] = seg.map(p => toWorld(L, p));
      return {
        x: (ax + bx) / 2, y: (ay + by) / 2, hx: (bx - ax) / 2, hy: (by - ay) / 2,
        vx: L.vx * 0.3 + (Math.random() - 0.5) * 80,
        vy: -Math.random() * 60,
        spin: (Math.random() - 0.5) * 10,
        life: 1.6,
      };
    });
    if (mode !== 'play') return;
    mode = 'over';
    canvas.classList.remove('playing');
    pointer.held = false;
    if (score > best) {
      best = score;
      try { localStorage.setItem('lander-best', String(best)); } catch {}
    }
  }

  function update(dt) {
    timer += dt;
    for (const d of debris) {
      d.vy += GRAVITY * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      const c = Math.cos(d.spin * dt);
      const s = Math.sin(d.spin * dt);
      [d.hx, d.hy] = [d.hx * c - d.hy * s, d.hx * s + d.hy * c];
      d.life -= dt;
    }
    debris = debris.filter(d => d.life > 0);

    if (phase === 'flying') {
      if (mode === 'demo') L.fuel = START_FUEL;
      const { thrust, turn } = controls(dt);
      physics(L, world, thrust, turn, dt);
      const hit = touchdown(L, world);
      if (hit === 'crash') crash();
      else if (hit) land(hit);
    } else if (mode === 'demo' && timer > 2.5) {
      newRound(START_FUEL);
    }
  }

  function message() {
    const verb = coarse ? 'Tap' : 'Click';
    if (mode === 'demo') {
      return ['INSERT COIN', coarse
        ? 'Tap to play · hold to fire, drag to steer'
        : 'Click to play · ↑ thrust, ← → rotate', 0];
    }
    if (mode === 'over') return [`Crashed · score ${score}`, `Best ${best} · insert coin to try again`, 1];
    if (phase === 'landed') return [`Landed ×${lastPad.mult} · +${50 * lastPad.mult}`, `${verb} to continue`];
    return null;
  }

  function strokeShape(lines) {
    ctx.beginPath();
    for (const [[ax, ay], [bx, by]] of lines) {
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
    }
    ctx.stroke();
  }

  function draw() {
    if (!canvas.width) return;
    const dpr = devicePixelRatio || 1;
    const k = canvas.width / world.W;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // World, in world units.
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.lineCap = ctx.lineJoin = 'round';

    ctx.fillStyle = C.muted;
    ctx.globalAlpha = 0.5;
    for (const [x, y] of world.stars) ctx.fillRect(x, y, 1, 1);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    world.points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();

    ctx.strokeStyle = C.fg;
    ctx.lineWidth = 2.5;
    strokeShape(world.pads.map(p => [[p.x0, p.y], [p.x1, p.y]]));
    ctx.fillStyle = C.muted;
    ctx.font = `10px ${MONO}`;
    ctx.textAlign = 'center';
    for (const p of world.pads) ctx.fillText(`×${p.mult}`, (p.x0 + p.x1) / 2, p.y + 13);

    if (phase !== 'crashed') {
      for (const off of [-world.W, 0, world.W]) {
        const x = L.x + off;
        if (x < -15 || x > world.W + 15) continue;
        ctx.save();
        ctx.translate(x, L.y);
        ctx.rotate(L.angle);
        ctx.strokeStyle = C.fg;
        ctx.lineWidth = 1.5;
        strokeShape(SHAPE);
        if (L.thrusting) {
          ctx.strokeStyle = C.accent;
          ctx.beginPath();
          ctx.moveTo(-3, 3);
          ctx.lineTo(0, 9 + Math.random() * 7);
          ctx.lineTo(3, 3);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    ctx.strokeStyle = C.fg;
    ctx.lineWidth = 1.5;
    for (const d of debris) {
      ctx.globalAlpha = Math.min(1, d.life);
      strokeShape([[[d.x - d.hx, d.y - d.hy], [d.x + d.hx, d.y + d.hy]]]);
    }
    ctx.globalAlpha = 1;

    // Readouts and messages, in CSS pixels.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    ctx.font = `11px ${MONO}`;
    ctx.textAlign = 'left';
    const row = (i, label, value, warn) => {
      ctx.fillStyle = C.muted;
      ctx.fillText(label, 12, 22 + i * 15);
      ctx.fillStyle = warn ? C.warn : C.fg;
      ctx.fillText(value, 58, 22 + i * 15);
    };
    const flying = phase === 'flying';
    row(0, 'ALT', (Math.max(0, altitude(L, world)) * TO_METRES).toFixed(1));
    row(1, 'H SPD', `${(Math.abs(L.vx) * TO_METRES).toFixed(1)} ${L.vx < 0 ? '←' : '→'}`,
      flying && Math.abs(L.vx) > SAFE_VX);
    row(2, 'V SPD', `${(Math.abs(L.vy) * TO_METRES).toFixed(1)} ${L.vy < 0 ? '↑' : '↓'}`,
      flying && L.vy > SAFE_VY);
    row(3, 'FUEL', String(Math.ceil(L.fuel)), L.fuel < 20);

    ctx.textAlign = 'right';
    ctx.fillStyle = C.muted;
    if (mode === 'demo') {
      ctx.fillText('DEMO', cw - 12, 22);
    } else {
      ctx.fillText(`SCORE ${score}`, cw - 12, 22);
      ctx.fillText(`BEST ${best}`, cw - 12, 37);
    }

    const msg = message();
    if (msg) {
      // The third entry names the line that blinks, arcade style.
      const [title, hint, blinkLine] = msg;
      const hidden = i => i === blinkLine && !reduceMotion && performance.now() % 1200 > 800;
      ctx.textAlign = 'center';
      ctx.fillStyle = mode === 'demo' ? C.accent : C.fg;
      ctx.font = mode === 'demo' ? `600 16px ${MONO}` : `600 15px ${SANS}`;
      if (!hidden(0)) ctx.fillText(title, cw / 2, ch * 0.36);
      ctx.fillStyle = C.muted;
      ctx.font = `12px ${SANS}`;
      if (!hidden(1)) ctx.fillText(hint, cw / 2, ch * 0.36 + 20);
    }
  }

  // Animate only while on screen, and never idle-animate for reduced motion.
  const shouldRun = () => visible && !document.hidden && !(reduceMotion && mode === 'demo');

  function kick() {
    draw();
    if (running || !shouldRun()) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  function frame(now) {
    if (!shouldRun()) {
      running = false;
      return;
    }
    update(Math.min((now - last) / 1000, 1 / 30));
    last = now;
    draw();
    requestAnimationFrame(frame);
  }

  const worldX = e => {
    const r = canvas.getBoundingClientRect();
    return (e.clientX - r.left) / r.width * world.W;
  };
  canvas.addEventListener('pointerdown', e => {
    if (mode === 'play' && phase === 'flying') {
      pointer.held = true;
      pointer.x = worldX(e);
      canvas.setPointerCapture(e.pointerId);
    } else {
      activate();
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (pointer.held) pointer.x = worldX(e);
  });
  const release = () => { pointer.held = false; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  // The keyboard is only taken over while a game is in progress and visible.
  const GAME_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyD', 'Space'];
  const isGo = e => !e.repeat && (e.code === 'Enter' || e.code === 'Space');
  addEventListener('keydown', e => {
    if (mode === 'play' && visible) {
      if (e.code === 'Escape') return setMode('demo');
      if (phase === 'landed' && isGo(e)) {
        e.preventDefault();
        return activate();
      }
      if (GAME_KEYS.includes(e.code)) {
        e.preventDefault();
        keys.add(e.code);
      }
    } else if (document.activeElement === canvas && isGo(e)) {
      e.preventDefault();
      activate();
    }
  });
  addEventListener('keyup', e => keys.delete(e.code));
  addEventListener('blur', () => keys.clear());

  function resize() {
    const dpr = devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    draw();
  }

  newRound(START_FUEL);
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    kick();
  }).observe(canvas);
  document.addEventListener('visibilitychange', kick);
}
