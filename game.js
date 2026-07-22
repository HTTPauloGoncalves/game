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
  heartMax: document.querySelector('#heartMax'),
  progress: document.querySelector('#progressFill'),
  power: document.querySelector('#powerBadge'),
  letter: document.querySelector('#letterScreen'),
  replay: document.querySelector('#replayButton'),
  death: document.querySelector('#deathScreen'),
  arenaRetry: document.querySelector('#arenaRetryButton'),
  restart: document.querySelector('#restartButton'),
  sound: document.querySelector('#soundButton')
};

const heroImage = new Image();
heroImage.src = 'assets/heroine.png';
const outfitAtlasA = new Image();
outfitAtlasA.src = 'assets/hero-outfits-a.png';
const friendImage = new Image();
friendImage.src = 'assets/letter-giver.png';
const enemyImage = new Image();
enemyImage.src = 'assets/enemies.png';

const WORLD_WIDTH = 6100;
const GROUND_Y = 678;
const FINISH_X = 4580;
const FRIEND_X = 4660;
const PORTAL_X = 4075;
const ARENA_LEFT = 5160;
const ARENA_RIGHT = 5920;
const GROUND_SEGMENTS = [
  [0, 640], [775, 1340], [1495, 2160], [2300, 2920],
  [3075, 3650], [3810, 4800], [5080, 6000]
];
const CHECKPOINTS = [80, 840, 1570, 2370, 3150, 3890];
const DRESS_COLORS = ['#ef704f', '#d94b5e', '#e85d9a', '#9a66d6', '#567fe0', '#3fa99a', '#e3aa3e', '#f1b4d2', '#fff0a8'];
const POWER_NAMES = [
  'ROSA SINGELA', 'BOTÃO RUBI', 'DUAS PÉTALAS', 'ESPINHO FORTE',
  'JARDIM VELOZ', 'LEQUE DE ROSAS', 'FLOR CELESTE', 'ROSA PERFURANTE', 'CORAÇÃO EM FLOR'
];
const POWER_DESCRIPTIONS = [
  '1 DISPARO', 'ROSA MAIS VELOZ', '2 DISPAROS', 'DANO AUMENTADO',
  'DISPARO MAIS RÁPIDO', 'LEQUE DE 3 ROSAS', 'ROSAS MAIS FORTES',
  'ATRAVESSA INIMIGOS', 'LEQUE DE 5 ROSAS'
];
const ROMANTIC_MESSAGES = [
  'CADA CORAÇÃO DEIXA BRUNA MAIS PERTO DE PAULO',
  'O AMOR TAMBÉM NOS DÁ FORÇA PARA CONTINUAR',
  'ALGUNS CAMINHOS VALEM TODOS OS OBSTÁCULOS',
  'CADA ROSA GUARDA UM PEDAÇO DESTA HISTÓRIA',
  'JUNTOS, ATÉ OS DIAS DIFÍCEIS FICAM MAIS LEVES',
  'O MELHOR DESTINO É AQUELE QUE LEVA ATÉ VOCÊ',
  'NENHUM ESPINHO É MAIOR QUE O NOSSO AMOR',
  'O CORAÇÃO DE BRUNA JÁ SABE ONDE QUER CHEGAR'
];
const POSE_ANCHORS = [
  { x: 0, y: 0 },
  { x: 18, y: 0 },
  { x: 14, y: 2 },
  { x: 20, y: 0 }
];
const RUN_SEQUENCE = [2, 3, 4, 5, 4, 3];
const RUN_ANCHORS = {
  2: { x: 20, y: -8 },
  3: { x: 12, y: -8 },
  4: { x: 0, y: -8 },
  5: { x: 3, y: -8 }
};

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
  { x: 4100, y: 520, w: 130, h: 18 },
  { x: 5260, y: 565, w: 120, h: 18 }, { x: 5430, y: 475, w: 125, h: 18 },
  { x: 5600, y: 570, w: 115, h: 18 }, { x: 5750, y: 490, w: 105, h: 18 }
];

const heartItems = [
  { x: 410, y: 548 }, { x: 875, y: 510 }, { x: 1330, y: 478 }, { x: 1818, y: 453 },
  { x: 2420, y: 543 }, { x: 2658, y: 473 }, { x: 3430, y: 468 }, { x: 4025, y: 555 }
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
  { type: 'guardian', x: 5650, range: 150, hp: 450 }
];

const keys = { left: false, right: false };
const hero = {
  x: 80, y: GROUND_Y - 74, w: 44, h: 72, vx: 0, vy: 0,
  grounded: true, facing: 1, anim: 0, invulnerable: 0, shootCooldown: 0,
  attackTimer: 0, pendingShot: null, checkpoint: 80, hp: 1, maxHp: 1
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
let bannerQueue = [];
let screenShake = 0;
let arenaState = 'waiting';
let arenaTimer = 0;
let musicTimer = null;
let musicStep = 0;

function createEnemies() {
  return ENEMY_DEFS.map((d, index) => {
    const sizes = { thorn: [42, 36], bat: [40, 30], mushroom: [38, 46], guardian: [96, 104] };
    const [w, h] = sizes[d.type];
    return {
      ...d, id: index, baseX: d.x, baseY: d.y || GROUND_Y - h,
      x: d.x, y: d.y || GROUND_Y - h, w, h, vx: d.type === 'guardian' ? -52 : -38,
      hp: d.hp, maxHp: d.hp, alive: true, hurt: 0, shoot: 1 + Math.random() * 2,
      phaseTwo: false, announced: false
    };
  });
}

function reset() {
  Object.assign(hero, {
    x: 80, y: GROUND_Y - 74, vx: 0, vy: 0, grounded: true, facing: 1,
    invulnerable: 0, shootCooldown: 0, attackTimer: 0, pendingShot: null,
    checkpoint: 80, hp: 1, maxHp: 1
  });
  heartItems.forEach(h => h.got = false);
  heartsFound = 0; camera = 0; particles = []; projectiles = []; enemyShots = [];
  enemies = createEnemies(); banner.time = 0; bannerQueue = []; screenShake = 0;
  arenaState = 'waiting'; arenaTimer = 0;
  updateHealthUI(); updatePowerUI();
  ui.progress.style.width = '0%'; ui.hint.style.opacity = '1';
}

function startGame() {
  reset(); state = 'playing';
  ui.start.hidden = true; ui.letter.hidden = true; ui.death.hidden = true; ui.arenaRetry.hidden = true;
  ui.hud.hidden = false; ui.controls.hidden = false; ui.hint.hidden = false;
  ensureAudio(); startMusic(); sfx('start');
  setTimeout(() => ui.hint.style.opacity = '0', 3200);
}

function ensureAudio() {
  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === 'suspended') audio.resume();
}

function tone(freq, duration, type = 'square', volume = .035, delay = 0) {
  if (!soundOn || !audio) return;
  const osc = audio.createOscillator(); const gain = audio.createGain();
  const startAt = audio.currentTime + delay;
  osc.type = type; osc.frequency.value = freq; gain.gain.setValueAtTime(volume, startAt);
  gain.gain.exponentialRampToValueAtTime(.0001, startAt + duration);
  osc.connect(gain).connect(audio.destination); osc.start(startAt); osc.stop(startAt + duration);
}

function sfx(name) {
  const sounds = {
    start: [[523, .08, 'sine', .035, 0], [659, .12, 'sine', .03, .08]],
    jump: [[330, .07, 'square', .025, 0], [440, .08, 'square', .018, .045]],
    rose: [[520, .045, 'triangle', .018, 0], [740, .06, 'sine', .014, .025]],
    heart: [[660, .1, 'sine', .04, 0], [830, .12, 'sine', .035, .09], [990, .14, 'triangle', .025, .18]],
    hurt: [[145, .16, 'sawtooth', .04, 0], [105, .2, 'triangle', .025, .07]],
    portal: [[110, .28, 'sawtooth', .025, 0], [220, .35, 'sine', .022, .08]],
    victory: [[523, .14, 'square', .032, 0], [659, .14, 'square', .03, .13], [784, .28, 'triangle', .035, .26]]
  };
  (sounds[name] || []).forEach(args => tone(...args));
}

function startMusic() {
  if (musicTimer) return;
  const melody = [523, 659, 784, 659, 587, 698, 880, 698, 494, 587, 740, 587, 523, 659, 784, 988];
  const bass = [131, 131, 147, 147, 123, 123, 131, 131];
  const playBeat = () => {
    if (state === 'playing' && soundOn) {
      tone(melody[musicStep % melody.length], .18, 'triangle', .009);
      if (musicStep % 2 === 0) tone(bass[Math.floor(musicStep / 2) % bass.length], .32, 'sine', .008);
    }
    musicStep++;
  };
  playBeat(); musicTimer = setInterval(playBeat, 285);
}

function jump() {
  if (state === 'playing' && hero.grounded) {
    hero.vy = -680; hero.grounded = false; sfx('jump');
  }
}

function shootRose() {
  if (state !== 'playing' || hero.shootCooldown > 0) return;
  const level = heartsFound;
  hero.attackTimer = .34;
  hero.pendingShot = { delay: .13, level };
  hero.shootCooldown = Math.max(.2, .52 - level * .038);
  sfx('rose');
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
  hero.maxHp++; hero.hp = Math.min(hero.maxHp, hero.hp + 1);
  updateHealthUI(); updatePowerUI();
  banner = { text: `${POWER_NAMES[heartsFound]} · ${POWER_DESCRIPTIONS[heartsFound]}`, time: 2.5 };
  bannerQueue.push({ text: ROMANTIC_MESSAGES[heartsFound - 1], time: 2.7 });
  sfx('heart');
  burst(item.x, item.y, DRESS_COLORS[heartsFound], 22);
}

function updateHealthUI() {
  ui.hearts.textContent = hero.hp;
  ui.heartMax.textContent = `/ ${hero.maxHp}`;
}

function updatePowerUI() {
  ui.power.textContent = `${POWER_NAMES[heartsFound]} · ${POWER_DESCRIPTIONS[heartsFound]}`;
}

function hurtHero(sourceX) {
  if (state !== 'playing' || hero.invulnerable > 0) return;
  hero.hp--; updateHealthUI();
  if (hero.hp <= 0) { gameOver(); return; }
  hero.invulnerable = 1.15;
  hero.vx = hero.x < sourceX ? -310 : 310;
  hero.vy = -390; hero.grounded = false;
  screenShake = 8; sfx('hurt');
  burst(hero.x + hero.w / 2, hero.y + 30, '#d8b6da', 8);
}

function respawnFromHole() {
  hero.x = hero.checkpoint; hero.y = GROUND_Y - hero.h;
  hero.vx = 0; hero.vy = 0; hero.grounded = true; hero.invulnerable = 1.2;
  camera = Math.max(0, hero.x - 100); screenShake = 12;
  banner = { text: 'O JARDIM TE TROUXE DE VOLTA', time: 1.5 };
  tone(125, .22, 'triangle', .04);
}

function fallInHole() {
  if (state !== 'playing') return;
  hero.hp--; updateHealthUI();
  if (hero.hp <= 0) { gameOver(); return; }
  respawnFromHole();
}

function gameOver() {
  if (state === 'gameover') return;
  const canRetryArena = arenaState === 'intro' || arenaState === 'active' || arenaState === 'victory';
  state = 'gameover'; keys.left = keys.right = false; hero.vx = 0;
  projectiles = []; enemyShots = [];
  ui.controls.hidden = true; ui.hint.hidden = true; ui.death.hidden = false; ui.arenaRetry.hidden = !canRetryArena;
  sfx('hurt');
}

function retryArena() {
  const boss = enemies.find(enemy => enemy.type === 'guardian');
  if (boss) Object.assign(boss, {
    x: boss.baseX, y: boss.baseY, vx: -52, hp: boss.maxHp,
    alive: true, hurt: 0, shoot: 1.25, phaseTwo: false, announced: false
  });
  Object.assign(hero, {
    x: ARENA_LEFT + 70, y: GROUND_Y - hero.h, vx: 0, vy: 0,
    grounded: true, invulnerable: 1.5, shootCooldown: 0, attackTimer: 0,
    pendingShot: null, checkpoint: ARENA_LEFT + 70, hp: hero.maxHp
  });
  state = 'playing'; arenaState = 'intro'; arenaTimer = 1.65;
  camera = ARENA_LEFT - 35; projectiles = []; enemyShots = []; particles = []; bannerQueue = [];
  banner = { text: 'O AMOR NOS DÁ OUTRA CHANCE', time: 2.2 };
  ui.death.hidden = true; ui.arenaRetry.hidden = true; ui.controls.hidden = false; ui.hud.hidden = false;
  updateHealthUI(); ensureAudio(); startMusic(); sfx('portal');
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
  if (hero.y > canvas.height + 80) { fallInHole(); return; }

  if (arenaState === 'waiting' || arenaState === 'cleared') {
    for (let i = CHECKPOINTS.length - 1; i >= 0; i--) {
      if (hero.x >= CHECKPOINTS[i]) { hero.checkpoint = CHECKPOINTS[i]; break; }
    }
  }
  for (const item of heartItems) {
    if (!item.got && Math.hypot(hero.x + hero.w / 2 - item.x, hero.y + 30 - item.y) < 43) collectHeart(item);
  }

  const boss = enemies.find(e => e.type === 'guardian');
  if (arenaState === 'waiting' && hero.x > PORTAL_X) {
    arenaState = 'intro'; arenaTimer = 1.65;
    hero.x = ARENA_LEFT + 70; hero.y = GROUND_Y - hero.h;
    hero.vx = 0; hero.vy = 0; hero.grounded = true; hero.checkpoint = ARENA_LEFT + 70;
    camera = ARENA_LEFT - 35;
    projectiles = []; enemyShots = [];
    banner = { text: 'VOCÊ FOI LEVADA À ARENA DOS ESPINHOS', time: 1.55 };
    screenShake = 6; sfx('portal');
  }
  if (arenaState === 'intro' || arenaState === 'active' || arenaState === 'victory') {
    if (hero.x < ARENA_LEFT + 28) { hero.x = ARENA_LEFT + 28; hero.vx = Math.max(0, hero.vx); }
    if (boss?.alive && hero.x > ARENA_RIGHT - 58) { hero.x = ARENA_RIGHT - 58; hero.vx = Math.min(0, hero.vx); }
  }
  hero.anim += dt * (Math.abs(hero.vx) > 25 ? 10 : 2);
}

function updateArena(dt) {
  if (arenaState !== 'intro' && arenaState !== 'victory') return;
  arenaTimer -= dt;
  if (arenaState === 'intro' && arenaTimer <= 0) {
    arenaState = 'active';
    banner = { text: 'CHEFE FINAL: CORAÇÃO DE ESPINHOS', time: 2.6 };
    screenShake = 12; tone(72, .5, 'sawtooth', .05);
    const boss = enemies.find(e => e.type === 'guardian');
    if (boss) boss.shoot = 1.25;
    burst(5650, GROUND_Y - 55, '#d84d70', 32);
  } else if (arenaState === 'victory' && arenaTimer <= 0) {
    arenaState = 'cleared';
    hero.x = 4490; hero.y = GROUND_Y - hero.h;
    hero.vx = 0; hero.vy = 0; hero.grounded = true; hero.checkpoint = 3890;
    camera = 4340;
    banner = { text: 'O PORTAL DA CARTA SE ABRIU!', time: 2.4 };
    sfx('portal');
  }
}

function updateEnemies(dt, time) {
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    if (enemy.type === 'guardian' && arenaState !== 'active') continue;
    enemy.hurt = Math.max(0, enemy.hurt - dt);
    if (enemy.type === 'bat') {
      enemy.x += enemy.vx * dt;
      if (Math.abs(enemy.x - enemy.baseX) > enemy.range) enemy.vx *= -1;
      enemy.y = enemy.baseY + Math.sin(time * .003 + enemy.id) * 30;
    } else if (enemy.type === 'thorn' || enemy.type === 'guardian') {
      if (enemy.type === 'guardian' && enemy.hp <= enemy.maxHp / 2 && !enemy.phaseTwo) {
        enemy.phaseTwo = true; enemy.vx *= 1.45; enemy.shoot = .2;
        banner = { text: 'SEGUNDA FASE: TEMPESTADE DE ESPINHOS!', time: 2.2 };
        screenShake = 10; burst(enemy.x + enemy.w / 2, enemy.y + 40, '#ec5578', 22);
      }
      enemy.x += enemy.vx * dt;
      if (Math.abs(enemy.x - enemy.baseX) > enemy.range) enemy.vx *= -1;
    }
    if (enemy.type === 'mushroom' || enemy.type === 'guardian') {
      enemy.shoot -= dt;
      if (enemy.shoot <= 0 && Math.abs(enemy.x - hero.x) < (enemy.type === 'guardian' ? 460 : 330)) {
        const dx = hero.x - enemy.x, dy = hero.y + 30 - enemy.y;
        const aim = Math.atan2(dy, dx);
        if (enemy.type === 'guardian') {
          const spreads = enemy.phaseTwo ? [-.46, -.23, 0, .23, .46] : [-.25, 0, .25];
          const speed = enemy.phaseTwo ? 235 : 195;
          spreads.forEach(spread => enemyShots.push({
            x: enemy.x + enemy.w / 2, y: enemy.y + 35,
            vx: Math.cos(aim + spread) * speed, vy: Math.sin(aim + spread) * speed,
            life: 3.2, big: true
          }));
          enemy.shoot = enemy.phaseTwo ? .64 : 1.05;
        } else {
          const len = Math.hypot(dx, dy) || 1;
          enemyShots.push({ x: enemy.x + enemy.w / 2, y: enemy.y + 12, vx: dx / len * 175, vy: dy / len * 175, life: 3, big: false });
          enemy.shoot = 1.8 + Math.random() * .8;
        }
      }
    }
    if (overlap(hero, enemy, 7)) hurtHero(enemy.x + enemy.w / 2);
  }

  for (const rose of projectiles) {
    rose.x += rose.vx * dt; rose.y += rose.vy * dt; rose.life -= dt; rose.spin += dt * 9;
    for (const enemy of enemies) {
      if (!enemy.alive || rose.life <= 0) continue;
      if (enemy.type === 'guardian' && arenaState !== 'active') continue;
      if (rose.x > enemy.x && rose.x < enemy.x + enemy.w && rose.y > enemy.y && rose.y < enemy.y + enemy.h) {
        enemy.hp -= rose.damage; enemy.hurt = .14; screenShake = Math.min(6, rose.damage * 2);
        burst(rose.x, rose.y, rose.color, 5); tone(180 + rose.damage * 45, .05, 'square', .02);
        if (rose.pierce > 0) rose.pierce--; else rose.life = 0;
        if (enemy.hp <= 0) {
          enemy.alive = false; burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.type === 'guardian' ? '#ffd477' : '#e76e83', enemy.type === 'guardian' ? 36 : 16);
          if (enemy.type === 'guardian') sfx('victory');
          else tone(150, .14, 'sawtooth', .04);
          if (enemy.type === 'guardian') {
            arenaState = 'victory'; arenaTimer = 1.5;
            enemyShots = enemyShots.filter(shot => !shot.big);
            banner = { text: 'CHEFE DERROTADO!', time: 1.4 };
          }
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
  updateHero(dt);
  if (state !== 'playing') return;
  updateArena(dt); updateEnemies(dt, time);
  const targetCamera = hero.x - canvas.width * .38;
  camera += (Math.max(0, Math.min(WORLD_WIDTH - canvas.width, targetCamera)) - camera) * Math.min(1, dt * 5);
  const progress = arenaState === 'intro' || arenaState === 'active' || arenaState === 'victory'
    ? 92 : Math.min(100, hero.x / FINISH_X * 100);
  ui.progress.style.width = `${progress}%`;
  particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 190 * dt; p.life -= dt; });
  particles = particles.filter(p => p.life > 0);
  banner.time = Math.max(0, banner.time - dt);
  if (banner.time === 0 && bannerQueue.length) banner = bannerQueue.shift();
  screenShake = Math.max(0, screenShake - dt * 28);
  const boss = enemies.find(e => e.type === 'guardian');
  if (arenaState === 'cleared' && hero.x > FINISH_X && !boss?.alive) finishGame();
}

function finishGame() {
  state = 'finished'; keys.left = keys.right = false; hero.vx = 0;
  ui.controls.hidden = true; ui.hint.hidden = true;
  sfx('victory');
  setTimeout(() => { ui.letter.hidden = false; }, 700);
}

function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function mixColor(from, to, amount) {
  const a = from.match(/\w\w/g).map(value => parseInt(value, 16));
  const b = to.match(/\w\w/g).map(value => parseInt(value, 16));
  return `rgb(${a.map((value, index) => Math.round(value + (b[index] - value) * amount)).join(',')})`;
}

function drawAmbientLife(time) {
  const wrap = (value, size) => ((value % size) + size) % size;
  for (let i = 0; i < 15; i++) {
    const x = wrap(i * 83 + time * (.008 + i % 3 * .003) - camera * .08, canvas.width + 50) - 25;
    const y = 105 + wrap(i * 67 + time * (.004 + i % 2 * .002), 455);
    ctx.save(); ctx.translate(x, y); ctx.rotate(time * .0015 + i);
    ctx.globalAlpha = .38 + i % 3 * .13; ctx.fillStyle = i % 2 ? '#f19a9e' : '#ffd0b5';
    ctx.beginPath(); ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  ctx.strokeStyle = 'rgba(45,38,64,.55)'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const x = wrap(i * 170 + time * .018 - camera * .035, canvas.width + 90) - 45;
    const y = 145 + i * 42 + Math.sin(time * .002 + i) * 12;
    ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.quadraticCurveTo(x - 3, y - 5, x, y);
    ctx.quadraticCurveTo(x + 4, y - 5, x + 9, y); ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {
    const worldX = 620 + i * 690, x = worldX - camera;
    if (x < -20 || x > canvas.width + 20) continue;
    const y = 525 + Math.sin(time * .004 + i * 2) * 24;
    const flap = 2 + Math.abs(Math.sin(time * .012 + i)) * 4;
    ctx.fillStyle = i % 2 ? '#ffd477' : '#f590aa';
    ctx.beginPath(); ctx.ellipse(x - flap, y, flap, 3, -.4, 0, Math.PI * 2); ctx.ellipse(x + flap, y, flap, 3, .4, 0, Math.PI * 2); ctx.fill();
    drawPixelRect(x - 1, y - 3, 2, 7, '#49344e');
  }
}

function drawRoseTrail() {
  for (let worldX = 3525; worldX < 4680; worldX += 115) {
    if (!isSolidGround(worldX) || (worldX > PORTAL_X && worldX < 4380)) continue;
    const x = worldX - camera;
    if (x < -12 || x > canvas.width + 12) continue;
    drawPixelRect(x, GROUND_Y - 9, 2, 9, '#56805d');
    drawPixelRect(x - 4, GROUND_Y - 13, 5, 5, '#d65d79');
    drawPixelRect(x + 1, GROUND_Y - 16, 5, 5, '#f08b9b');
    drawPixelRect(x + 3, GROUND_Y - 11, 4, 4, '#bc4968');
  }
}

function drawBackground(time) {
  const dayProgress = Math.max(0, Math.min(1, camera / FINISH_X));
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  const region = Math.floor((camera + canvas.width / 2) / 1200);
  const skies = [mixColor('#675b8d', '#27223f', dayProgress), mixColor('#bf7890', '#655078', dayProgress), mixColor('#f5aa73', '#c96378', dayProgress)];
  sky.addColorStop(0, skies[0]); sky.addColorStop(.5, skies[1]); sky.addColorStop(1, skies[2]);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffd998'; ctx.globalAlpha = .86 - dayProgress * .45; ctx.beginPath(); ctx.arc(305 - camera * .02, 175 + dayProgress * 95, 44, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f8e5ba'; ctx.globalAlpha = Math.max(0, dayProgress - .55) * 1.8; ctx.beginPath(); ctx.arc(315, 130, 27, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;

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

  drawAmbientLife(time);

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
      const bloomed = hero.x > worldX - 45;
      if (bloomed) {
        drawPixelRect(x - 4, GROUND_Y - 11, 5, 5, i % 2 ? '#f3a068' : '#dc6680');
        drawPixelRect(x + 2, GROUND_Y - 14, 5, 5, i % 2 ? '#ffd08a' : '#f58ca1');
      } else drawPixelRect(x - 1, GROUND_Y - 11, 4, 4, '#876477');
    }
  }
  drawRoseTrail();
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
  drawArena(time);
  heartItems.forEach((h, i) => {
    if (h.got) return; const bob = Math.sin(time * .004 + i) * 5;
    drawHeart(h.x - camera, h.y + bob, 1.1, '#ff7080');
    ctx.globalAlpha = .2 + Math.sin(time * .005 + i) * .1; drawHeart(h.x - camera, h.y + bob, 2.1, '#ffd7b0'); ctx.globalAlpha = 1;
  });
  enemies.forEach(e => {
    if (e.alive && (e.type !== 'guardian' || arenaState === 'active')) drawEnemy(e, time);
  });
  projectiles.forEach(drawRoseProjectile);
  enemyShots.forEach(drawEnemyShot);
  particles.forEach(drawParticle);
  drawFriend(time); drawHero(); drawBanner();
}

function drawArena(time) {
  if (arenaState === 'waiting') drawPortal(PORTAL_X - camera, GROUND_Y - 62, time, false);
  const left = ARENA_LEFT - camera, right = ARENA_RIGHT - camera;
  if (right < -80 || left > canvas.width + 80) return;

  drawPixelRect(left, GROUND_Y - 5, ARENA_RIGHT - ARENA_LEFT, 5, '#d17978');
  for (let x = left + 45; x < right - 30; x += 74) {
    drawPixelRect(x, GROUND_Y - 13, 28, 4, '#6c4664');
  }

  drawPixelRect(left, GROUND_Y - 156, 22, 156, '#3b2a43');
  drawPixelRect(left - 8, GROUND_Y - 166, 38, 14, '#76516a');
  drawPixelRect(right - 22, GROUND_Y - 156, 22, 156, '#3b2a43');
  drawPixelRect(right - 30, GROUND_Y - 166, 38, 14, '#76516a');
  for (let y = GROUND_Y - 143; y < GROUND_Y; y += 26) {
    drawPixelRect(left + 5, y, 12, 6, '#b16a72');
    drawPixelRect(right - 17, y, 12, 6, '#b16a72');
  }

  const leftClosed = arenaState === 'intro' || arenaState === 'active' || arenaState === 'victory';
  const rightClosed = arenaState !== 'cleared';
  if (leftClosed) drawArenaGate(left + 22, -1);
  if (rightClosed) drawArenaGate(right - 22, 1);

  if (arenaState === 'intro') {
    const bossX = 5650 - camera + 48;
    const progress = 1 - Math.max(0, arenaTimer) / 1.65;
    ctx.globalAlpha = .25 + progress * .5;
    ctx.fillStyle = '#d14970';
    ctx.beginPath(); ctx.ellipse(bossX, GROUND_Y - 5, 18 + progress * 38, 7 + progress * 8, 0, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + time * .002;
      drawPixelRect(bossX + Math.cos(a) * (24 + progress * 25), GROUND_Y - 28 - progress * 70 + Math.sin(a) * 15, 5, 5, '#ec6d85');
    }
    ctx.globalAlpha = 1;
  }
  if (arenaState === 'victory') drawPortal(5650 - camera + 48, GROUND_Y - 65, time, true);
}

function drawPortal(x, y, time, golden) {
  if (x < -80 || x > canvas.width + 80) return;
  const color = golden ? '#ffd477' : '#b76bd1';
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = color; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.ellipse(0, 0, 25, 52, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = .28; ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, 0, 20, 47, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  for (let i = 0; i < 8; i++) {
    const a = time * .003 + i * Math.PI / 4;
    drawPixelRect(Math.cos(a) * 31 - 2, Math.sin(a) * 55 - 2, 5, 5, color);
  }
  ctx.restore();
}

function drawArenaGate(x, direction) {
  ctx.fillStyle = '#251b32';
  for (let i = 0; i < 5; i++) {
    const gx = x + direction * i * 9;
    ctx.fillRect(Math.round(gx), GROUND_Y - 140, 5, 140);
    ctx.beginPath(); ctx.moveTo(gx - 3, GROUND_Y - 140); ctx.lineTo(gx + 2, GROUND_Y - 153); ctx.lineTo(gx + 7, GROUND_Y - 140); ctx.fill();
  }
  drawPixelRect(direction > 0 ? x - 40 : x, GROUND_Y - 92, 40, 7, '#76516a');
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
  if (enemyImage.complete && enemyImage.naturalWidth) {
    const sheetW = enemyImage.width, sheetH = enemyImage.height;
    const sprite = {
      thorn: { sx: .11, sy: .11, sw: .33, sh: .28, dw: 68, dh: 58 },
      bat: { sx: .5, sy: .09, sw: .5, sh: .29, dw: 76, dh: 44 },
      mushroom: { sx: .07, sy: .52, sw: .35, sh: .34, dw: 58, dh: 57 },
      guardian: { sx: .48, sy: .45, sw: .5, sh: .46, dw: 136, dh: 125 }
    }[enemy.type];
    const bob = enemy.type === 'bat' ? Math.sin(time * .012 + enemy.id) * 5 : 0;
    if (enemy.type === 'guardian' && enemy.phaseTwo) {
      ctx.globalAlpha = .22; ctx.fillStyle = '#ff547d';
      ctx.beginPath(); ctx.arc(x + enemy.w / 2, y + enemy.h / 2, 68 + Math.sin(time * .01) * 5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = enemy.hurt > 0 ? .5 : 1;
    }
    ctx.translate(x + enemy.w / 2, y + enemy.h + bob);
    ctx.scale(enemy.vx > 0 ? -1 : 1, 1);
    ctx.drawImage(
      enemyImage, sprite.sx * sheetW, sprite.sy * sheetH, sprite.sw * sheetW, sprite.sh * sheetH,
      -sprite.dw / 2, -sprite.dh, sprite.dw, sprite.dh
    );
    ctx.restore();
    if (enemy.type === 'guardian') {
      drawPixelRect(x - 18, y - 28, 132, 7, '#291e35');
      drawPixelRect(x - 18, y - 28, 132 * (enemy.hp / enemy.maxHp), 7, enemy.phaseTwo ? '#ffd36e' : '#ec6680');
      ctx.fillStyle = '#fff0cf'; ctx.font = '8px Pixelify Sans'; ctx.textAlign = 'center';
      ctx.fillText(enemy.phaseTwo ? 'CORAÇÃO DE ESPINHOS · FASE 2' : 'CORAÇÃO DE ESPINHOS', x + 48, y - 35);
    }
    return;
  }
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
    const pulse = Math.sin(time * .008) * 2;
    ctx.strokeStyle = '#76506f'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(x + 31, y + 58); ctx.lineTo(x + 4, y + 84 + pulse); ctx.moveTo(x + 65, y + 58); ctx.lineTo(x + 92, y + 84 - pulse); ctx.stroke();
    ctx.fillStyle = enemy.phaseTwo ? '#6e294f' : '#4d3158';
    ctx.beginPath(); ctx.arc(x + 48, y + 52, 37 + pulse, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5 + time * .0005;
      ctx.fillStyle = i % 2 ? '#a83d63' : '#c4516d';
      ctx.beginPath(); ctx.ellipse(x + 48 + Math.cos(a) * 39, y + 39 + Math.sin(a) * 30, 15, 9, a, 0, Math.PI * 2); ctx.fill();
    }
    drawPixelRect(x + 29, y + 36, 8, 8, '#ffd36e'); drawPixelRect(x + 59, y + 36, 8, 8, '#ffd36e');
    drawHeart(x + 48, y + 63 + pulse, .62, enemy.phaseTwo ? '#fff0a0' : '#ef7185');
    drawPixelRect(x + 10, y + 91, 28, 10, '#3b2945'); drawPixelRect(x + 58, y + 91, 28, 10, '#3b2945');
    drawPixelRect(x - 18, y - 28, 132, 7, '#291e35');
    drawPixelRect(x - 18, y - 28, 132 * (enemy.hp / enemy.maxHp), 7, enemy.phaseTwo ? '#ffd36e' : '#ec6680');
    ctx.fillStyle = '#fff0cf'; ctx.font = '8px Pixelify Sans'; ctx.textAlign = 'center';
    ctx.fillText(enemy.phaseTwo ? 'CORAÇÃO DE ESPINHOS · FASE 2' : 'CORAÇÃO DE ESPINHOS', x + 48, y - 35);
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
  const running = hero.attackTimer <= 0 && hero.grounded && Math.abs(hero.vx) > 25;
  if (running && heroImage.complete && heroImage.naturalWidth) {
    const frame = RUN_SEQUENCE[Math.floor(hero.anim) % RUN_SEQUENCE.length];
    const column = frame % 4, row = Math.floor(frame / 4);
    const sx = Math.round(column * heroImage.width / 4);
    const sy = Math.round(row * heroImage.height / 2);
    const sxEnd = Math.round((column + 1) * heroImage.width / 4);
    const syEnd = Math.round((row + 1) * heroImage.height / 2);
    const anchor = RUN_ANCHORS[frame];
    ctx.save();
    const cx = hero.x - camera + hero.w / 2;
    if (hero.invulnerable > 0 && Math.floor(hero.invulnerable * 14) % 2) ctx.globalAlpha = .35;
    ctx.translate(cx, 0); ctx.scale(hero.facing, 1);
    ctx.drawImage(heroImage, sx, sy, sxEnd - sx, syEnd - sy, -57 + anchor.x, Math.round(hero.y - 16 + anchor.y), 114, 114);
    ctx.restore();
    return;
  }
  const atlas = outfitAtlasA;
  if (!atlas.complete || !atlas.naturalWidth) return;
  const rows = 4;
  const row = 0;
  let column = 0;
  if (hero.attackTimer > 0) column = 3;
  else if (!hero.grounded) column = 2;
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
  if (arenaState !== 'cleared' && state !== 'finished') return;
  const x = FRIEND_X - camera; if (x < -130 || x > canvas.width + 130) return;
  const frame = state === 'finished' ? 2 : Math.floor(time / 900) % 2;
  const sw = friendImage.width / 2, sh = friendImage.height / 2;
  ctx.drawImage(friendImage, (frame % 2) * sw, Math.floor(frame / 2) * sh, sw, sh, x - 72, GROUND_Y - 143, 145, 145);
  if (state === 'playing' && hero.x > 4460) {
    ctx.fillStyle = 'rgba(39,29,53,.82)'; ctx.fillRect(x - 72, GROUND_Y - 186, 144, 36);
    ctx.fillStyle = '#f3c66a'; ctx.font = '8px DM Mono'; ctx.textAlign = 'center'; ctx.fillText('PAULO: BRUNA!', x, GROUND_Y - 171);
    ctx.fillStyle = '#fff0d5'; ctx.fillText('VOCÊ CONSEGUIU!', x, GROUND_Y - 158);
  }
}

function drawBanner() {
  if (banner.time <= 0) return;
  const alpha = Math.min(1, banner.time * 2);
  ctx.globalAlpha = alpha; ctx.font = '9px Pixelify Sans';
  const words = banner.text.split(' '), lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > canvas.width - 118 && line) { lines.push(line); line = word; }
    else line = candidate;
  }
  if (line) lines.push(line);
  const height = 25 + lines.length * 13, top = 111;
  ctx.fillStyle = 'rgba(38,26,52,.88)'; ctx.fillRect(42, top, canvas.width - 84, height);
  ctx.strokeStyle = '#e4ae73'; ctx.strokeRect(46, top + 4, canvas.width - 92, height - 8);
  ctx.fillStyle = '#ffe3a8'; ctx.textAlign = 'center';
  lines.forEach((textLine, index) => ctx.fillText(textLine, canvas.width / 2, top + 20 + index * 13));
  ctx.globalAlpha = 1;
}

function draw(time = 0) {
  ctx.save();
  if (screenShake > 0) ctx.translate((Math.random() - .5) * screenShake, (Math.random() - .5) * screenShake);
  drawBackground(time); if (state !== 'title') drawWorld(time);
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
ui.arenaRetry.addEventListener('click', retryArena);
ui.restart.addEventListener('click', startGame);
ui.sound.addEventListener('click', () => {
  soundOn = !soundOn; ui.sound.textContent = soundOn ? '♪' : '×';
  if (soundOn) { ensureAudio(); startMusic(); sfx('start'); }
});
requestAnimationFrame(loop);
