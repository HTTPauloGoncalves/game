const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const ui = {
  start: document.querySelector('#startScreen'),
  startButton: document.querySelector('#startButton'),
  hud: document.querySelector('#hud'),
  controls: document.querySelector('#controls'),
  hint: document.querySelector('#hint'),
  hearts: document.querySelector('#heartCount'),
  progress: document.querySelector('#progressFill'),
  power: document.querySelector('#powerBadge'),
  letter: document.querySelector('#letterScreen'),
  replay: document.querySelector('#replayButton'),
  sound: document.querySelector('#soundButton')
};

const heroImage = new Image();
heroImage.src = 'assets/heroine.png';
const outfitAtlasA = new Image();
outfitAtlasA.src = 'assets/hero-outfits-a.png';
const friendImage = new Image();
friendImage.src = 'assets/letter-giver.png';

const WORLD_WIDTH = 4800;
const GROUND_Y = 678;
const FINISH_X = 4580;
const FRIEND_X = 4660;
const GROUND_SEGMENTS = [
  [0, 640], [775, 1340], [1495, 2160], [2300, 2920],
  [3075, 3650], [3810, 4800]
];
const CHECKPOINTS = [80, 840, 1570, 2370, 3150, 3890];
const DRESS_COLORS = ['#ef704f', '#d94b5e', '#e85d9a', '#9a66d6', '#567fe0', '#3fa99a', '#e3aa3e', '#f1b4d2', '#fff0a8'];
const POWER_NAMES = [
  'ROSA SINGELA', 'BOTÃO RUBI', 'DUAS PÉTALAS', 'ESPINHO FORTE',
  'JARDIM VELOZ', 'LEQUE DE ROSAS', 'FLOR CELESTE', 'ROSA PERFURANTE', 'CORAÇÃO EM FLOR'
];
const POSE_ANCHORS = [
  { x: 0, y: 0 },
  { x: 18, y: 0 },
  { x: 14, y: 2 },
  { x: 20, y: 0 }
];

const platforms = [
  { x: 340, y: 592, w: 145, h: 18 }, { x: 535, y: 525, w: 105, h: 18 },
  { x: 675, y: 610, w: 88, h: 18 }, { x: 820, y: 552, w: 145, h: 18 },
  { x: 1080, y: 600, w: 135, h: 18 }, { x: 1280, y: 520, w: 105, h: 18 },
  { x: 1382, y: 590, w: 100, h: 18 }, { x: 1535, y: 555, w: 135, h: 18 },
  { x: 1770, y: 495, w: 125, h: 18 }, { x: 1990, y: 590, w: 145, h: 18 },
  { x: 2185, y: 535, w: 105, h: 18 }, { x: 2350, y: 585, w: 140, h: 18 },
  { x: 2595, y: 515, w: 125, h: 18 }, { x: 2810, y: 588, w: 100, h: 18 },
  { x: 2950, y: 535, w: 110, h: 18 }, { x: 3125, y: 585, w: 145, h: 18 },
  { x: 3370, y: 510, w: 125, h: 18 }, { x: 3570, y: 585, w: 95, h: 18 },
  { x: 3700, y: 530, w: 100, h: 18 }, { x: 3855, y: 585, w: 140, h: 18 },
  { x: 4100, y: 520, w: 130, h: 18 }
];

const heartItems = [
  { x: 410, y: 548 }, { x: 875, y: 510 }, { x: 1330, y: 478 }, { x: 1818, y: 453 },
  { x: 2420, y: 543 }, { x: 2658, y: 473 }, { x: 3430, y: 468 }, { x: 4158, y: 478 }
];

const puddles = [
  { x: 990, w: 65 }, { x: 1650, w: 78 }, { x: 2505, w: 62 },
  { x: 3290, w: 62 }, { x: 4005, w: 72 }
];

const ENEMY_DEFS = [
  { type: 'thorn', x: 500, range: 85, hp: 2 },
  { type: 'bat', x: 940, y: 470, range: 95, hp: 2 },
  { type: 'mushroom', x: 1180, hp: 3 },
  { type: 'thorn', x: 1580, range: 115, hp: 3 },
  { type: 'bat', x: 1900, y: 440, range: 120, hp: 3 },
  { type: 'mushroom', x: 2070, hp: 4 },
  { type: 'thorn', x: 2460, range: 100, hp: 4 },
  { type: 'bat', x: 2740, y: 455, range: 125, hp: 4 },
  { type: 'mushroom', x: 3220, hp: 5 },
  { type: 'thorn', x: 3480, range: 95, hp: 5 },
  { type: 'bat', x: 3940, y: 445, range: 135, hp: 5 },
  { type: 'guardian', x: 4350, range: 135, hp: 18 }
];

const keys = { left: false, right: false };
const hero = {
  x: 80, y: GROUND_Y - 74, w: 44, h: 72, vx: 0, vy: 0,
  grounded: true, facing: 1, anim: 0, invulnerable: 0, shootCooldown: 0,
  attackTimer: 0, pendingShot: null, checkpoint: 80
};

let state = 'title';
let camera = 0;
let lastTime = 0;
let heartsFound = 0;
let soundOn = true;
let audio;
let particles = [];
let projectiles = [];
let enemyShots = [];
let enemies = [];
let banner = { text: '', time: 0 };
let screenShake = 0;

function createEnemies() {
  return ENEMY_DEFS.map((d, index) => {
    const sizes = { thorn: [42, 36], bat: [40, 30], mushroom: [38, 46], guardian: [72, 78] };
    const [w, h] = sizes[d.type];
    return {
      ...d, id: index, baseX: d.x, baseY: d.y || GROUND_Y - h,
      x: d.x, y: d.y || GROUND_Y - h, w, h, vx: d.type === 'guardian' ? -52 : -38,
      hp: d.hp, maxHp: d.hp, alive: true, hurt: 0, shoot: 1 + Math.random() * 2
    };
  });
}

function reset() {
  Object.assign(hero, {
    x: 80, y: GROUND_Y - 74, vx: 0, vy: 0, grounded: true, facing: 1,
    invulnerable: 0, shootCooldown: 0, attackTimer: 0, pendingShot: null, checkpoint: 80
  });
  heartItems.forEach(h => h.got = false);
  heartsFound = 0; camera = 0; particles = []; projectiles = []; enemyShots = [];
  enemies = createEnemies(); banner.time = 0; screenShake = 0;
  ui.hearts.textContent = '0'; ui.power.textContent = POWER_NAMES[0];
  ui.progress.style.width = '0%'; ui.hint.style.opacity = '1';
}

function startGame() {
  reset(); state = 'playing';
  ui.start.hidden = true; ui.letter.hidden = true;
  ui.hud.hidden = false; ui.controls.hidden = false; ui.hint.hidden = false;
  ensureAudio(); tone(520, .06, 'sine');
  setTimeout(() => ui.hint.style.opacity = '0', 3200);
}

function ensureAudio() {
  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === 'suspended') audio.resume();
}

function tone(freq, duration, type = 'square', volume = .035) {
  if (!soundOn || !audio) return;
  const osc = audio.createOscillator(); const gain = audio.createGain();
  osc.type = type; osc.frequency.value = freq; gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
  osc.connect(gain).connect(audio.destination); osc.start(); osc.stop(audio.currentTime + duration);
}

function jump() {
  if (state === 'playing' && hero.grounded) {
    hero.vy = -680; hero.grounded = false; tone(360, .09);
  }
}

function shootRose() {
  if (state !== 'playing' || hero.shootCooldown > 0) return;
  const level = heartsFound;
  hero.attackTimer = .34;
  hero.pendingShot = { delay: .13, level };
  hero.shootCooldown = Math.max(.2, .52 - level * .038);
  tone(315 + level * 20, .05, 'sine', .018);
}

function releaseRoseVolley(level) {
  const spread = level >= 8 ? [-.34, -.17, 0, .17, .34] : level >= 5 ? [-.2, 0, .2] : level >= 2 ? [-.07, .07] : [0];
  const speed = 390 + level * 22;
  const damage = 1 + Math.floor(level / 3);
  spread.forEach(angle => projectiles.push({
    x: hero.x + hero.w / 2 + hero.facing * 28,
    y: hero.y + 29,
    vx: Math.cos(angle) * speed * hero.facing,
    vy: Math.sin(angle) * speed,
    life: 1.65,
    damage,
    pierce: level >= 7 ? 2 : 0,
    color: DRESS_COLORS[Math.min(level, 8)],
    spin: Math.random() * 6
  }));
  tone(470 + level * 28, .055, level >= 6 ? 'sine' : 'square', .025);
}

function isSolidGround(x) {
  return GROUND_SEGMENTS.some(([start, end]) => x >= start && x <= end);
}

function overlap(a, b, pad = 0) {
  return a.x + a.w - pad > b.x && a.x + pad < b.x + b.w && a.y + a.h - pad > b.y && a.y + pad < b.y + b.h;
}

function burst(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) particles.push({
    x, y, vx: (Math.random() - .5) * 190, vy: -35 - Math.random() * 150,
    life: .65 + Math.random() * .55, color, kind: Math.random() > .45 ? 'petal' : 'spark'
  });
}

function collectHeart(item) {
  item.got = true; heartsFound++;
  ui.hearts.textContent = heartsFound;
  ui.power.textContent = POWER_NAMES[heartsFound];
  banner = { text: `NOVO PODER: ${POWER_NAMES[heartsFound]}`, time: 2.4 };
  tone(620 + heartsFound * 55, .16, 'sine', .05);
  setTimeout(() => tone(820 + heartsFound * 30, .12, 'sine', .04), 100);
  burst(item.x, item.y, DRESS_COLORS[heartsFound], 22);
}

function hurtHero(sourceX) {
  if (hero.invulnerable > 0) return;
  hero.invulnerable = 1.15;
  hero.vx = hero.x < sourceX ? -310 : 310;
  hero.vy = -390; hero.grounded = false;
  screenShake = 8; tone(115, .18, 'sawtooth', .045);
  burst(hero.x + hero.w / 2, hero.y + 30, '#d8b6da', 8);
}

function respawnFromHole() {
  hero.x = hero.checkpoint; hero.y = GROUND_Y - hero.h;
  hero.vx = 0; hero.vy = 0; hero.grounded = true; hero.invulnerable = 1.2;
  camera = Math.max(0, hero.x - 100); screenShake = 12;
  banner = { text: 'O JARDIM TE TROUXE DE VOLTA', time: 1.5 };
  tone(125, .22, 'triangle', .04);
}

function updateHero(dt) {
  hero.invulnerable = Math.max(0, hero.invulnerable - dt);
  hero.shootCooldown = Math.max(0, hero.shootCooldown - dt);
  hero.attackTimer = Math.max(0, hero.attackTimer - dt);
  if (hero.pendingShot) {
    hero.pendingShot.delay -= dt;
    if (hero.pendingShot.delay <= 0) {
      releaseRoseVolley(hero.pendingShot.level);
      hero.pendingShot = null;
    }
  }
  const accel = hero.grounded ? 1600 : 930;
  if (keys.left) { hero.vx -= accel * dt; hero.facing = -1; }
  if (keys.right) { hero.vx += accel * dt; hero.facing = 1; }
  if (!keys.left && !keys.right) hero.vx *= Math.pow(.0008, dt);
  hero.vx = Math.max(-265, Math.min(265, hero.vx));

  const prevBottom = hero.y + hero.h;
  hero.vy += 1780 * dt; hero.x += hero.vx * dt; hero.y += hero.vy * dt;
  hero.x = Math.max(15, Math.min(WORLD_WIDTH - 60, hero.x)); hero.grounded = false;

  if (hero.vy >= 0 && hero.y + hero.h >= GROUND_Y && prevBottom <= GROUND_Y + 12 && isSolidGround(hero.x + hero.w / 2)) {
    hero.y = GROUND_Y - hero.h; hero.vy = 0; hero.grounded = true;
  }
  for (const p of platforms) {
    if (hero.vy >= 0 && prevBottom <= p.y + 5 && hero.y + hero.h >= p.y && hero.x + hero.w > p.x && hero.x < p.x + p.w) {
      hero.y = p.y - hero.h; hero.vy = 0; hero.grounded = true;
    }
  }
  for (const puddle of puddles) {
    if (hero.grounded && hero.y + hero.h >= GROUND_Y - 2 && hero.x + hero.w > puddle.x && hero.x < puddle.x + puddle.w) hero.vx *= .86;
  }
  if (hero.y > canvas.height + 80) respawnFromHole();

  for (let i = CHECKPOINTS.length - 1; i >= 0; i--) {
    if (hero.x >= CHECKPOINTS[i]) { hero.checkpoint = CHECKPOINTS[i]; break; }
  }
  for (const item of heartItems) {
    if (!item.got && Math.hypot(hero.x + hero.w / 2 - item.x, hero.y + 30 - item.y) < 43) collectHeart(item);
  }

  const boss = enemies.find(e => e.type === 'guardian');
  if (boss?.alive && hero.x > 4430) { hero.x = 4430; hero.vx = Math.min(0, hero.vx); }
  hero.anim += dt * (Math.abs(hero.vx) > 25 ? 10 : 2);
}

function updateEnemies(dt, time) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    enemy.hurt = Math.max(0, enemy.hurt - dt);
    if (enemy.type === 'bat') {
      enemy.x += enemy.vx * dt;
      if (Math.abs(enemy.x - enemy.baseX) > enemy.range) enemy.vx *= -1;
      enemy.y = enemy.baseY + Math.sin(time * .003 + enemy.id) * 30;
    } else if (enemy.type === 'thorn' || enemy.type === 'guardian') {
      enemy.x += enemy.vx * dt;
      if (Math.abs(enemy.x - enemy.baseX) > enemy.range) enemy.vx *= -1;
    }
    if (enemy.type === 'mushroom' || enemy.type === 'guardian') {
      enemy.shoot -= dt;
      if (enemy.shoot <= 0 && Math.abs(enemy.x - hero.x) < (enemy.type === 'guardian' ? 460 : 330)) {
        const dx = hero.x - enemy.x, dy = hero.y + 30 - enemy.y;
        const len = Math.hypot(dx, dy) || 1;
        enemyShots.push({ x: enemy.x + enemy.w / 2, y: enemy.y + 12, vx: dx / len * 175, vy: dy / len * 175, life: 3, big: enemy.type === 'guardian' });
        enemy.shoot = enemy.type === 'guardian' ? .85 : 1.8 + Math.random() * .8;
      }
    }
    if (overlap(hero, enemy, 7)) hurtHero(enemy.x + enemy.w / 2);
  }

  for (const rose of projectiles) {
    rose.x += rose.vx * dt; rose.y += rose.vy * dt; rose.life -= dt; rose.spin += dt * 9;
    for (const enemy of enemies) {
      if (!enemy.alive || rose.life <= 0) continue;
      if (rose.x > enemy.x && rose.x < enemy.x + enemy.w && rose.y > enemy.y && rose.y < enemy.y + enemy.h) {
        enemy.hp -= rose.damage; enemy.hurt = .14; screenShake = Math.min(6, rose.damage * 2);
        burst(rose.x, rose.y, rose.color, 5); tone(180 + rose.damage * 45, .05, 'square', .02);
        if (rose.pierce > 0) rose.pierce--; else rose.life = 0;
        if (enemy.hp <= 0) {
          enemy.alive = false; burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.type === 'guardian' ? '#ffd477' : '#e76e83', enemy.type === 'guardian' ? 36 : 16);
          tone(enemy.type === 'guardian' ? 95 : 150, enemy.type === 'guardian' ? .35 : .14, 'sawtooth', .04);
          if (enemy.type === 'guardian') banner = { text: 'O PORTÃO DAS ROSAS SE ABRIU!', time: 2.4 };
        }
      }
    }
  }
  for (const shot of enemyShots) {
    shot.x += shot.vx * dt; shot.y += shot.vy * dt; shot.life -= dt;
    if (shot.x > hero.x && shot.x < hero.x + hero.w && shot.y > hero.y && shot.y < hero.y + hero.h) { shot.life = 0; hurtHero(shot.x); }
  }
  projectiles = projectiles.filter(p => p.life > 0 && p.x > 0 && p.x < WORLD_WIDTH && p.y > 0 && p.y < canvas.height);
  enemyShots = enemyShots.filter(p => p.life > 0);
}

function update(dt, time) {
  if (state !== 'playing') return;
  updateHero(dt); updateEnemies(dt, time);
  const targetCamera = hero.x - canvas.width * .38;
  camera += (Math.max(0, Math.min(WORLD_WIDTH - canvas.width, targetCamera)) - camera) * Math.min(1, dt * 5);
  ui.progress.style.width = `${Math.min(100, hero.x / FINISH_X * 100)}%`;
  particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 190 * dt; p.life -= dt; });
  particles = particles.filter(p => p.life > 0);
  banner.time = Math.max(0, banner.time - dt); screenShake = Math.max(0, screenShake - dt * 28);
  const boss = enemies.find(e => e.type === 'guardian');
  if (hero.x > FINISH_X && !boss?.alive) finishGame();
}

function finishGame() {
  state = 'finished'; keys.left = keys.right = false; hero.vx = 0;
  ui.controls.hidden = true; ui.hint.hidden = true;
  tone(523, .18, 'sine', .05); setTimeout(() => tone(659, .22, 'sine', .05), 160);
  setTimeout(() => { ui.letter.hidden = false; }, 700);
}

function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  const region = Math.floor((camera + canvas.width / 2) / 1200);
  const skies = [
    ['#5b547f', '#bd7183', '#f4a16e'], ['#3d557e', '#8b71a0', '#dc8b88'],
    ['#314b65', '#56698a', '#b88191'], ['#342f58', '#66507c', '#cd7580']
  ][Math.min(3, region)];
  sky.addColorStop(0, skies[0]); sky.addColorStop(.5, skies[1]); sky.addColorStop(1, skies[2]);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffd998'; ctx.globalAlpha = .82; ctx.beginPath(); ctx.arc(305 - camera * .02, 210, 44, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;

  ctx.fillStyle = '#66506f';
  for (let i = -1; i < 7; i++) {
    const x = i * 120 - (camera * .12) % 120;
    ctx.beginPath(); ctx.moveTo(x, 565); ctx.lineTo(x + 72, 370 + (i % 2) * 30); ctx.lineTo(x + 165, 565); ctx.fill();
  }
  ctx.fillStyle = '#3d354a';
  for (let i = -1; i < 9; i++) {
    const x = i * 84 - (camera * .25) % 84;
    ctx.fillRect(x + 34, 480, 8, 130);
    ctx.beginPath(); ctx.arc(x + 38, 474, 37, 0, Math.PI * 2); ctx.arc(x + 16, 492, 27, 0, Math.PI * 2); ctx.arc(x + 62, 495, 30, 0, Math.PI * 2); ctx.fill();
  }

  drawPixelRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y, '#171523');
  for (const [start, end] of GROUND_SEGMENTS) {
    const x = start - camera, w = end - start;
    if (x > canvas.width || x + w < 0) continue;
    drawPixelRect(x, GROUND_Y, w, canvas.height - GROUND_Y, '#302a3c');
    drawPixelRect(x, GROUND_Y, w, 7, '#87624e');
  }
  for (let i = 0; i < 52; i++) {
    const worldX = i * 94 + 22, x = worldX - camera;
    if (x > -10 && x < canvas.width + 10 && isSolidGround(worldX)) {
      drawPixelRect(x, GROUND_Y - 8, 3, 8, '#54734c');
      drawPixelRect(x - 3, GROUND_Y - 10, 4, 4, i % 2 ? '#f3a068' : '#dc6680');
      drawPixelRect(x + 2, GROUND_Y - 13, 4, 4, i % 2 ? '#f3a068' : '#dc6680');
    }
  }
  drawHoles(); drawLandmarks(region);
}

function drawHoles() {
  for (let i = 0; i < GROUND_SEGMENTS.length - 1; i++) {
    const start = GROUND_SEGMENTS[i][1], end = GROUND_SEGMENTS[i + 1][0];
    const x = start - camera, w = end - start;
    if (x > canvas.width || x + w < 0) continue;
    const glow = ctx.createLinearGradient(0, GROUND_Y, 0, canvas.height);
    glow.addColorStop(0, '#130e20'); glow.addColorStop(1, '#5a2449');
    ctx.fillStyle = glow; ctx.fillRect(x, GROUND_Y, w, canvas.height - GROUND_Y);
    ctx.fillStyle = '#9b4b68';
    for (let px = x + 8; px < x + w; px += 22) {
      ctx.beginPath(); ctx.moveTo(px, canvas.height); ctx.lineTo(px + 9, canvas.height - 38 - (px % 19)); ctx.lineTo(px + 18, canvas.height); ctx.fill();
    }
  }
}

function drawLandmarks(region) {
  const labels = ['JARDIM DO POENTE', 'LAGO DOS SUSPIROS', 'BOSQUE AZUL', 'PORTÃO DAS ROSAS'];
  const x = region * 1200 + 105 - camera;
  if (x > -180 && x < canvas.width + 50) {
    drawPixelRect(x, 405, 9, 220, '#4b3547'); drawPixelRect(x - 48, 405, 105, 36, '#68455a');
    ctx.fillStyle = '#f5c77d'; ctx.font = '8px DM Mono'; ctx.textAlign = 'center'; ctx.fillText(labels[region], x + 4, 427);
  }
}

function drawWorld(time) {
  for (const p of platforms) {
    const x = p.x - camera; if (x < -p.w || x > canvas.width) continue;
    drawPixelRect(x, p.y, p.w, p.h, '#6d4f4b'); drawPixelRect(x, p.y, p.w, 5, '#d48663');
    for (let px = 8; px < p.w; px += 24) drawPixelRect(x + px, p.y + 8, 12, 4, '#3d3340');
  }
  for (const p of puddles) {
    const x = p.x - camera; drawPixelRect(x, GROUND_Y + 2, p.w, 7, '#675575'); drawPixelRect(x + 10, GROUND_Y + 1, p.w - 25, 2, '#a78499');
  }
  heartItems.forEach((h, i) => {
    if (h.got) return; const bob = Math.sin(time * .004 + i) * 5;
    drawHeart(h.x - camera, h.y + bob, 1.1, '#ff7080');
    ctx.globalAlpha = .2 + Math.sin(time * .005 + i) * .1; drawHeart(h.x - camera, h.y + bob, 2.1, '#ffd7b0'); ctx.globalAlpha = 1;
  });
  enemies.forEach(e => { if (e.alive) drawEnemy(e, time); });
  projectiles.forEach(drawRoseProjectile);
  enemyShots.forEach(drawEnemyShot);
  particles.forEach(drawParticle);
  drawFriend(time); drawHero(); drawBanner();
}

function drawHeart(x, y, scale, color) {
  ctx.fillStyle = color; const s = 4 * scale;
  ctx.fillRect(Math.round(x - 2*s), Math.round(y - s), 2*s, 2*s); ctx.fillRect(Math.round(x), Math.round(y - s), 2*s, 2*s);
  ctx.fillRect(Math.round(x - 3*s), Math.round(y), 6*s, 2*s); ctx.fillRect(Math.round(x - 2*s), Math.round(y + 2*s), 4*s, s); ctx.fillRect(Math.round(x - s), Math.round(y + 3*s), 2*s, s);
}

function drawEnemy(enemy, time) {
  const x = enemy.x - camera, y = enemy.y;
  if (x < -100 || x > canvas.width + 100) return;
  ctx.save();
  if (enemy.hurt > 0) ctx.globalAlpha = .5;
  if (enemy.type === 'thorn') {
    drawPixelRect(x + 5, y + 10, 32, 22, '#655071'); drawPixelRect(x + 10, y + 5, 7, 10, '#8d6a91'); drawPixelRect(x + 25, y + 3, 7, 12, '#8d6a91');
    drawPixelRect(x + 11, y + 17, 5, 5, '#ffd782'); drawPixelRect(x + 27, y + 17, 5, 5, '#ffd782');
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#b88795'; ctx.beginPath(); ctx.moveTo(x + 4 + i * 10, y + 12); ctx.lineTo(x + 9 + i * 10, y); ctx.lineTo(x + 14 + i * 10, y + 13); ctx.fill(); }
  } else if (enemy.type === 'bat') {
    const flap = Math.sin(time * .012 + enemy.id) * 7;
    drawPixelRect(x + 13, y + 7, 15, 19, '#4c3c68');
    ctx.fillStyle = '#73577e'; ctx.beginPath(); ctx.moveTo(x + 14, y + 12); ctx.lineTo(x - 8, y + flap); ctx.lineTo(x + 7, y + 25); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 27, y + 12); ctx.lineTo(x + 49, y + flap); ctx.lineTo(x + 34, y + 25); ctx.fill();
    drawPixelRect(x + 16, y + 11, 3, 4, '#ffcb6b'); drawPixelRect(x + 23, y + 11, 3, 4, '#ffcb6b');
  } else if (enemy.type === 'mushroom') {
    drawPixelRect(x + 14, y + 21, 12, 25, '#d8b799'); drawPixelRect(x + 9, y + 30, 7, 5, '#fbecd1'); drawPixelRect(x + 25, y + 30, 7, 5, '#fbecd1');
    ctx.fillStyle = '#8a526d'; ctx.beginPath(); ctx.arc(x + 20, y + 19, 20, Math.PI, 0); ctx.fill();
    drawPixelRect(x + 7, y + 13, 6, 5, '#e9a37f'); drawPixelRect(x + 24, y + 7, 6, 5, '#e9a37f');
  } else {
    ctx.fillStyle = '#512d55'; ctx.beginPath(); ctx.arc(x + 36, y + 34, 34, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.fillStyle = '#a14d6d'; ctx.beginPath(); ctx.arc(x + 36 + Math.cos(a) * 37, y + 34 + Math.sin(a) * 37, 12, 0, Math.PI * 2); ctx.fill(); }
    drawPixelRect(x + 21, y + 28, 8, 8, '#ffd36e'); drawPixelRect(x + 44, y + 28, 8, 8, '#ffd36e');
    drawPixelRect(x + 29, y + 48, 16, 6, '#2a1b32');
    drawPixelRect(x, y - 14, 72, 6, '#291e35'); drawPixelRect(x, y - 14, 72 * (enemy.hp / enemy.maxHp), 6, '#ec6680');
  }
  ctx.restore();
}

function drawRoseProjectile(rose) {
  const x = rose.x - camera, y = rose.y;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rose.spin);
  drawPixelRect(-7, -2, 14, 4, '#5ea26b');
  ctx.fillStyle = rose.color;
  ctx.beginPath(); ctx.arc(-5, 0, 5, 0, Math.PI * 2); ctx.arc(0, -5, 5, 0, Math.PI * 2); ctx.arc(5, 0, 5, 0, Math.PI * 2); ctx.arc(0, 5, 5, 0, Math.PI * 2); ctx.fill();
  drawPixelRect(-2, -2, 4, 4, '#ffe080'); ctx.restore();
}

function drawEnemyShot(shot) {
  const x = shot.x - camera, y = shot.y, s = shot.big ? 7 : 5;
  ctx.fillStyle = shot.big ? '#e95176' : '#8b6aa2';
  ctx.beginPath(); ctx.moveTo(x + s, y); ctx.lineTo(x - s, y - s); ctx.lineTo(x - s, y + s); ctx.fill();
}

function drawParticle(p) {
  ctx.globalAlpha = Math.max(0, p.life);
  if (p.kind === 'spark') drawPixelRect(p.x - camera, p.y, 4, 4, p.color);
  else { ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(p.x - camera, p.y, 5, 2.5, p.vx * .01, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
}

function drawHero() {
  const atlas = outfitAtlasA;
  if (!atlas.complete || !atlas.naturalWidth) return;
  const rows = 4;
  const row = 0;
  let column = 0;
  if (hero.attackTimer > 0) column = 3;
  else if (!hero.grounded) column = 2;
  else if (Math.abs(hero.vx) > 25) column = 1;
  // The generated atlases are not exactly divisible by their grid size.
  // Rounded cell edges prevent fractional sampling from leaking a neighbour frame.
  const sx = Math.round(column * atlas.width / 4);
  const sy = Math.round(row * atlas.height / rows);
  const rawSxEnd = Math.round((column + 1) * atlas.width / 4);
  const syEnd = Math.round((row + 1) * atlas.height / rows);
  // The throw artwork slightly overlaps the jump column in the generated source.
  // Trim that contaminated edge while keeping the original pixel scale.
  const bleedTrim = column === 2 ? 60 : 0;
  const sw = rawSxEnd - sx - bleedTrim, sh = syEnd - sy;
  const dw = 114 * (sw / (rawSxEnd - sx));
  const anchor = POSE_ANCHORS[column];
  ctx.save();
  const cx = hero.x - camera + hero.w / 2;
  if (hero.invulnerable > 0 && Math.floor(hero.invulnerable * 14) % 2) ctx.globalAlpha = .35;
  ctx.translate(cx, 0); ctx.scale(hero.facing, 1);
  const bob = column === 1 ? Math.sin(hero.anim * .8) * 2 : 0;
  ctx.drawImage(atlas, sx, sy, sw, sh, -57 + anchor.x, Math.round(hero.y - 16 + bob + anchor.y), dw, 114);
  ctx.restore();
}

function drawFriend(time) {
  if (!friendImage.complete) return;
  const x = FRIEND_X - camera; if (x < -130 || x > canvas.width + 130) return;
  const frame = state === 'finished' ? 2 : Math.floor(time / 900) % 2;
  const sw = friendImage.width / 2, sh = friendImage.height / 2;
  ctx.drawImage(friendImage, (frame % 2) * sw, Math.floor(frame / 2) * sh, sw, sh, x - 72, GROUND_Y - 143, 145, 145);
  if (state === 'playing' && hero.x > 4460) {
    ctx.fillStyle = 'rgba(39,29,53,.82)'; ctx.fillRect(x - 72, GROUND_Y - 175, 144, 25);
    ctx.fillStyle = '#fff0d5'; ctx.font = '9px DM Mono'; ctx.textAlign = 'center'; ctx.fillText('VOCÊ CONSEGUIU!', x, GROUND_Y - 158);
  }
}

function drawBanner() {
  if (banner.time <= 0) return;
  const alpha = Math.min(1, banner.time * 2);
  ctx.globalAlpha = alpha; ctx.fillStyle = 'rgba(38,26,52,.88)'; ctx.fillRect(42, 118, canvas.width - 84, 42);
  ctx.strokeStyle = '#e4ae73'; ctx.strokeRect(46, 122, canvas.width - 92, 34);
  ctx.fillStyle = '#ffe3a8'; ctx.font = '10px Pixelify Sans'; ctx.textAlign = 'center'; ctx.fillText(banner.text, canvas.width / 2, 143); ctx.globalAlpha = 1;
}

function draw(time = 0) {
  ctx.save();
  if (screenShake > 0) ctx.translate((Math.random() - .5) * screenShake, (Math.random() - .5) * screenShake);
  drawBackground(); if (state !== 'title') drawWorld(time);
  ctx.restore();
}

function loop(time) {
  const dt = Math.min(.032, (time - lastTime) / 1000 || 0); lastTime = time;
  update(dt, time); draw(time); requestAnimationFrame(loop);
}

function bindHold(button, action) {
  const down = e => {
    e.preventDefault(); button.classList.add('active');
    if (action === 'jump') jump(); else if (action === 'shoot') shootRose(); else keys[action] = true;
  };
  const up = e => { e.preventDefault(); button.classList.remove('active'); if (!['jump', 'shoot'].includes(action)) keys[action] = false; };
  button.addEventListener('pointerdown', down); button.addEventListener('pointerup', up); button.addEventListener('pointercancel', up); button.addEventListener('pointerleave', up);
}

document.querySelectorAll('[data-control]').forEach(b => bindHold(b, b.dataset.control));
addEventListener('keydown', e => {
  if (['ArrowLeft', 'a', 'A'].includes(e.key)) keys.left = true;
  if (['ArrowRight', 'd', 'D'].includes(e.key)) keys.right = true;
  if (['ArrowUp', 'w', 'W', ' '].includes(e.key)) { e.preventDefault(); jump(); }
  if (['x', 'X', 'k', 'K', 'Enter'].includes(e.key)) { e.preventDefault(); shootRose(); }
});
addEventListener('keyup', e => {
  if (['ArrowLeft', 'a', 'A'].includes(e.key)) keys.left = false;
  if (['ArrowRight', 'd', 'D'].includes(e.key)) keys.right = false;
});
ui.startButton.addEventListener('click', startGame);
ui.replay.addEventListener('click', startGame);
ui.sound.addEventListener('click', () => { soundOn = !soundOn; ui.sound.textContent = soundOn ? '♪' : '×'; });
requestAnimationFrame(loop);
