// adamscar — top-down pixel-art lane dodger
// The world is drawn into a small low-res buffer and scaled up for chunky pixels.
// The buffer is at least 128x192 and grows to fill the window (wider on desktop);
// the road stays centered with the beach and forest filling the sides.

var CONFIG = {
  MIN_W: 128,
  MIN_H: 192,
  ROAD_W: 60,               // 3 lanes x 20px
  LANE_W: 20,
  CAR_Y_FRAC: 0.74,         // car top as a fraction of screen height
  BASE_SPEED: 87.5,         // buffer pixels per second
  SPEED_STEP: 0.15,         // +15% per level
  MAX_SPEED_MULT: 3,
  IDLE_SPEED: 25,           // scroll speed on the start screen
  BASE_GAP: 104,            // clear space between obstacle rows
  MIN_GAP: 60,
  GAP_STEP: 5,
  GAP_JITTER: 16,
  BASE_DOUBLE: 0.1,         // chance a row blocks two lanes
  DOUBLE_STEP: 0.08,
  MAX_DOUBLE: 0.6,
  POINTS_PER_LEVEL: 25,
  START_SCORE: 0,           // bump to e.g. 23 to test a level up
  HITBOX_INSET: 2,
  INPUT_LOCK_MS: 500,
  TICK_SOUND: false,
  WHALE_EVERY: [12, 18],    // points between whale spouts (random in range)
  BIGFOOT_EVERY: [38, 52],  // points between bigfoot sightings
  SURF_AMP: 3,              // how far (world px) waves wash up the beach
  SURF_PERIOD: 3.5,         // seconds per wave in-and-out
  SAND_W: 30                // beach width (world px); narrower on phones to keep some ocean
};

var W = CONFIG.MIN_W, H = CONFIG.MIN_H;
var TH = H;      // scenery tile height (multiple of the 16px dash period)
var roadX = 34;  // left edge of the road

function laneX(l) {
  return roadX + CONFIG.LANE_W / 2 + CONFIG.LANE_W * l;
}

function carY() {
  return floor(H * CONFIG.CAR_Y_FRAC);
}

// ---------- pixel art ----------

var PALETTE = {
  K: '#1a1a1a', // outline / black
  w: '#f4f4f4', // white
  R: '#d62828', // car red
  r: '#8f1d1d', // car dark red
  V: '#9ad4f5', // windshield
  S: '#6b4226', // seats
  Y: '#ffe066', // headlights
  B: '#8b5a2b', // deer brown
  b: '#5c3a1a', // deer dark / antlers
  T: '#d2a679', // deer tan
  G: '#e8b83a', // giraffe yellow
  o: '#9c5b1f', // giraffe spots
  E: '#8d99ae', // elephant gray
  e: '#5c677d', // elephant dark gray
  L: '#8a7058', // sea lion
  l: '#b39a7e', // sea lion light
  N: '#c48a52', // ladder wood
  n: '#7a5230', // ladder dark wood
  C: '#3a86ff', // chair blue
  c: '#1f4fa0', // chair dark blue
  H: '#2c3e50', // whale
  h: '#4a6680', // whale light
  F: '#6b4a2f', // bigfoot fur
  f: '#c8a27a'  // bigfoot face / hands
};

var SPRITES = {
  car: [
    '..KKKKKKKK..',
    '.KYRRRRRRYK.',
    '.KRRRRRRRRK.',
    'KKRRRRRRRRKK',
    'KKRRRRRRRRKK',
    '.KRRRRRRRRK.',
    '.KVVVVVVVVK.',
    '.KrVVVVVVrK.',
    '.KrSSrrSSrK.',
    '.KrSSrrSSrK.',
    '.KrSSrrSSrK.',
    '.KrrrrrrrrK.',
    '.KrSSSSSSrK.',
    '.KrSSSSSSrK.',
    'KKRRRRRRRRKK',
    'KKRRRRRRRRKK',
    '.KRRRRRRRRK.',
    '..KKKKKKKK..'
  ],
  ladder: [
    'nN....Nn',
    'nN....Nn',
    'nNNNNNNn',
    'nN....Nn',
    'nN....Nn',
    'nNNNNNNn',
    'nN....Nn',
    'nN....Nn',
    'nNNNNNNn',
    'nN....Nn',
    'nN....Nn',
    'nNNNNNNn',
    'nN....Nn',
    'nN....Nn',
    'nNNNNNNn',
    'nN....Nn'
  ],
  chair: [
    '.cCCCCCCc.',
    '.C......C.',
    '.CCCCCCCC.',
    '.C......C.',
    '.CCCCCCCC.',
    'cCCCCCCCCc',
    'cccccccccc',
    '.c......c.',
    '.c......c.',
    '.K......K.'
  ],
  deer: [
    'b.b......b.b',
    '.bb......bb.',
    '..b.bBBb.b..',
    '...bBBBBb...',
    '..BBKBBKBB..',
    '...BBBBBB...',
    '....BTTB....',
    '....BKKB....',
    '...BBBBBB...',
    '..BBBBBBBB..',
    '..BBTBBTBB..',
    '..BBBBBBBB..',
    '..B.B..B.B..',
    '..b.b..b.b..'
  ],
  giraffe: [
    '..o.o.......',
    '.GGGG.......',
    'KGGGGG......',
    'GGGGG.......',
    '..GG........',
    '..GoG.......',
    '..GG........',
    '..GGo.......',
    '..GG........',
    '..oGG.......',
    '..GG........',
    '..GGG.......',
    '..GGGGGGGG..',
    '..GoGGGoGGG.',
    '..GGGGoGGGGo',
    '..GGoGGGGoG.',
    '...GGGGGGG..',
    '...G.G..G.G.',
    '...G.G..G.G.',
    '...G.G..G.G.',
    '...G.G..G.G.',
    '...o.o..o.o.'
  ],
  elephant: [
    '......eeeeeeeee.',
    '...eeeEEEEEEEEEe',
    '..eEEeEEEEEEEEEE',
    '.eEKEeEEEEEEEEEE',
    '.eEEEeEEEEEEEEEE',
    '.EEEEeEEEEEEEEEE',
    '.EEwEEEEEEEEEEEe',
    '.EE.wEEEEEEEEEE.',
    '.EE..EEEEEEEEEE.',
    '.E...EEE...EEE..',
    '.E...EEE...EEE..',
    'eE...EEE...EEE..',
    '.....eee...eee..'
  ],
  sealion: [
    '..LLL.........',
    '.LKLLL........',
    'LLLLLL........',
    '.LLLLL........',
    '..LLLL........',
    '..LlLLL.......',
    '..LllLLLL.....',
    '..LlllLLLLL...',
    '.LLllLLLLLLLL.',
    'LL.LL.....LLLL'
  ],
  // scenery critters (drawn per-pixel so they can be clipped)
  whale: [
    '....HHHHHH....',
    '..HHhhhhhhHH..',
    '.HhhhhhhhhhhH.',
    'HhhhhhHhhhhhhH',
    '.HhhhhhhhhhhH.',
    '..HHHHHHHHHH..'
  ],
  whaleTail: [
    'HH....HH',
    '.HHhhHH.',
    '..HHHH..',
    '...HH...',
    '...HH...'
  ],
  bigfoot: [
    '....FFFF....',
    '...FFFFFF...',
    '...FffffF...',
    '...FKffKF...',
    '...FffffF...',
    '....FffF....',
    '..FFFFFFFF..',
    '.FFFFFFFFFF.',
    '.FF.FFFF.FF.',
    '.FF.FFFF.FF.',
    '.fF.FFFF.Ff.',
    '....FFFF....',
    '...FF..FF...',
    '...FF..FF...',
    '..FFF..FFF..'
  ],
  bigfootWave: [
    '....FFFF..f.',
    '...FFFFFF.FF',
    '...FffffF.FF',
    '...FKffKF.FF',
    '...FffffF.FF',
    '....FffF..FF',
    '..FFFFFFFFF.',
    '.FFFFFFFFF..',
    '.FF.FFFF....',
    '.FF.FFFF....',
    '.fF.FFFF....',
    '....FFFF....',
    '...FF..FF...',
    '...FF..FF...',
    '..FFF..FFF..'
  ]
};

var OBSTACLE_TYPES = ['ladder', 'deer', 'chair', 'giraffe', 'elephant', 'sealion'];

var SCENERY = {
  ocean: '#2a6fdb', wave: '#5aa0f0', foam: '#e8f4ff',
  sand: '#f2d49b', sandDark: '#d9b877', shell: '#f7a8b8',
  wetSand: '#d8bb82', shallow: '#4f95ea',
  road: '#3b3b44', roadSpeck: '#474752', line: '#f4f4f4', dash: '#f4f4f4',
  ground: '#1f5f2a', grass: '#3f8f3a',
  tree: '#2d7a33', treeLight: '#4fa34a', treeDark: '#174d22'
};

// ---------- state ----------

var START = 0, PLAYING = 1, GAMEOVER = 2;
var state = START;

var pg, sceneryTile, sprites = {};
var cnv;
var S = 1, offX = 0, offY = 0;  // scale and offsets are in device pixels
var lastT = 0;

var scrollY = 0;
var lane = 1, carX = 0;
var obstacles = [];
var score = 0, level = 0;
var distSinceRow = 0, nextRowDist = 0, prevFree = null;
var gameOverAt = 0, shakeT = 0, flashT = 0;

// Scenery critters. Both are pinned to the scrolling ground: their screen y is
// a fixed base plus floor(scrollY), the same way the scenery tile moves.
var forestTrees = [];
var shoreX = [];   // per tile row: x where the water meets the sand at low tide
var whale = null, bigfoot = null, bigfootPending = false;
var nextWhaleAt = 0, nextBigfootAt = 0;
var WHALE_DUR = 2.8, BIGFOOT_DUR = 2.6;

// ---------- setup ----------

function setup() {
  pixelDensity(1);
  cnv = createCanvas(1, 1);
  fitCanvas();

  for (var name in SPRITES) {
    sprites[name] = buildSprite(SPRITES[name]);
  }
  cnv.elt.addEventListener('pointerdown', onPointerDown);
  cnv.elt.addEventListener('pointermove', onPointerMove);
  layout();
  lastT = millis();
}

// Size the world to the window and (re)build the buffers that depend on it.
// The canvas backing store is sized in real device pixels (not CSS pixels) so
// each world pixel maps to a whole number of screen pixels on HiDPI screens,
// Windows display scaling and browser zoom. Otherwise the browser stretches
// the canvas by a fractional amount and edges go soft/uneven.
function fitCanvas() {
  var dpr = window.devicePixelRatio || 1;
  resizeCanvas(round(windowWidth * dpr), round(windowHeight * dpr), true);
  cnv.elt.style.width = windowWidth + 'px';
  cnv.elt.style.height = windowHeight + 'px';
  noSmooth();
}

function layout() {
  S = max(1, floor(min(width / CONFIG.MIN_W, height / CONFIG.MIN_H)));
  W = ceil(width / S);
  H = ceil(height / S);
  TH = ceil(H / 16) * 16;
  roadX = floor((W - CONFIG.ROAD_W) / 2);
  offX = floor((width - W * S) / 2);
  offY = floor((height - H * S) / 2);

  // One spare row on top: the world is shifted down by the sub-pixel part
  // of the scroll when drawn, so the top edge must stay covered.
  if (pg) pg.remove();
  pg = createGraphics(W, H + 1);
  pg.noSmooth();
  pg.noStroke();

  if (sceneryTile) sceneryTile.remove();
  sceneryTile = buildScenery();

  carX = laneX(lane);
  whale = null;    // positions depend on the layout, so drop any in progress
  bigfoot = null;
}

function buildSprite(rows) {
  var h = rows.length, w = rows[0].length;
  var g = createGraphics(w, h);
  g.noStroke();
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var ch = rows[y].charAt(x);
      if (ch !== '.' && PALETTE[ch]) {
        g.fill(PALETTE[ch]);
        g.rect(x, y, 1, 1);
      }
    }
  }
  return { g: g, w: w, h: h };
}

// The scenery is one tile (W x TH) that loops vertically, so anything near the
// top/bottom edge is also drawn at y±TH to wrap seamlessly. It is laid out
// around roadX so wider windows get more ocean and forest.
function buildScenery() {
  var g = createGraphics(W, TH);
  var C = SCENERY;
  var R = roadX, roadR = roadX + CONFIG.ROAD_W;
  var i, y;
  g.noStroke();
  randomSeed(7);

  // beach + ocean (the surf line itself is animated in drawSurf)
  var sandW = beachWidth();
  shoreX = [];
  for (y = 0; y < TH; y++) {
    var sx = R - sandW - CONFIG.SURF_AMP + round(sin(y / TH * TWO_PI * 4) * 2 + sin(y / TH * TWO_PI * 9));
    shoreX.push(sx);
    g.fill(C.ocean); g.rect(0, y, sx, 1);
    g.fill(C.sand); g.rect(sx, y, R - sx, 1);
  }
  var oceanW = R - sandW - 5;
  for (i = 0; i < oceanW * TH / 80; i++) {
    g.fill(C.wave);
    g.rect(floor(random(0, oceanW)), floor(random(TH)), floor(random(2, 4)), 1);
  }
  for (i = 0; i < TH / 6; i++) {
    g.fill(C.sandDark);
    g.rect(floor(random(R - sandW + 5, R - 1)), floor(random(TH)), 1, 1);
  }
  for (i = 0; i < TH / 40; i++) {
    g.fill(C.shell);
    g.rect(floor(random(R - sandW + 5, R - 2)), floor(random(TH)), 1, 1);
  }

  // road
  g.fill(C.road); g.rect(R, 0, CONFIG.ROAD_W, TH);
  for (i = 0; i < TH * 0.6; i++) {
    g.fill(C.roadSpeck);
    g.rect(floor(random(R + 2, roadR - 2)), floor(random(TH)), 1, 1);
  }
  g.fill(C.line);
  g.rect(R + 1, 0, 1, TH);
  g.rect(roadR - 2, 0, 1, TH);
  g.fill(C.dash);
  for (y = 0; y < TH; y += 16) {
    g.rect(R + CONFIG.LANE_W - 1, y, 2, 8);
    g.rect(R + CONFIG.LANE_W * 2 - 1, y, 2, 8);
  }

  // forest
  g.fill(C.ground); g.rect(roadR, 0, W - roadR, TH);
  g.fill(C.grass); g.rect(roadR, 0, 2, TH);
  var trees = [];
  for (i = 0; i < (W - roadR) * TH / 400; i++) {
    var r = floor(random(5, 8));
    trees.push([floor(random(roadR + 2 + r, W + r)), floor(random(TH)), r]);
  }
  trees.sort(function (a, b) { return a[1] - b[1]; });
  forestTrees = trees;
  for (i = 0; i < trees.length; i++) {
    drawWrapped(g, drawTree, trees[i][0], trees[i][1], trees[i][2]);
  }

  randomSeed();
  return g;
}

// Full width on bigger screens; on narrow ones keep at least ~22px of ocean.
function beachWidth() {
  return min(CONFIG.SAND_W, max(15, roadX - 22));
}

function drawWrapped(g, fn, x, y, r) {
  fn(g, x, y - TH, r);
  fn(g, x, y, r);
  fn(g, x, y + TH, r);
}

function drawTree(g, cx, cy, r) {
  for (var dy = -r; dy <= r; dy++) {
    for (var dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      var t = (dx + dy) / r;
      g.fill(t > 0.6 ? SCENERY.treeDark : (t < -0.7 ? SCENERY.treeLight : SCENERY.tree));
      g.rect(cx + dx, cy + dy, 1, 1);
    }
  }
}

// ---------- game loop ----------

function draw() {
  var now = millis();
  var dt = min(0.05, (now - lastT) / 1000);
  lastT = now;

  update(dt);
  var fs = floor(scrollY);
  renderWorld(fs);

  background('#111');
  drawingContext.imageSmoothingEnabled = false;
  var sx = offX, sy = offY;
  if (shakeT > 0) {
    sx += round(random(-2, 2)) * S;
    sy += round(random(-2, 2)) * S;
  }
  // The world buffer only scrolls in whole world pixels (S screen pixels),
  // which judders. Shift it by the leftover fraction in screen pixels so the
  // road glides smoothly. The car isn't scrolling, so it's drawn on its own.
  var shift = round((scrollY - fs) * S);
  image(pg, sx, sy + shift - S, W * S, (H + 1) * S);
  var car = sprites.car;
  image(car.g, sx + round((carX - car.w / 2) * S), sy + carY() * S, car.w * S, car.h * S);
  drawHUD();
}

function currentSpeed() {
  return CONFIG.BASE_SPEED * min(CONFIG.MAX_SPEED_MULT, 1 + CONFIG.SPEED_STEP * level);
}

function currentGap() {
  return max(CONFIG.MIN_GAP, CONFIG.BASE_GAP - CONFIG.GAP_STEP * level);
}

function currentDouble() {
  return min(CONFIG.MAX_DOUBLE, CONFIG.BASE_DOUBLE + CONFIG.DOUBLE_STEP * level);
}

function update(dt) {
  shakeT = max(0, shakeT - dt);
  flashT = max(0, flashT - dt);
  carX += (laneX(lane) - carX) * min(1, dt * 25);
  updateCritters(dt);

  if (state === START) {
    scrollY += CONFIG.IDLE_SPEED * dt;
    return;
  }
  if (state !== PLAYING) return;

  var move = currentSpeed() * dt;
  scrollY += move;

  distSinceRow += move;
  if (distSinceRow >= nextRowDist) spawnRow();

  var carBottom = carY() + sprites.car.h;
  for (var i = obstacles.length - 1; i >= 0; i--) {
    var o = obstacles[i];
    o.y = o.baseY + scrollY;
    if (!o.passed && o.y > carBottom) {
      o.passed = true;
      addPoint();
    }
    if (o.y > H) obstacles.splice(i, 1);
  }

  checkCollisions();
}

function spawnRow() {
  var lanes;
  if (random() < currentDouble()) {
    // Two lanes blocked. Keep the open lane next to (or the same as) the
    // previous double row's open lane so the gap is always reachable.
    var options = [0, 1, 2];
    if (prevFree !== null) {
      options = options.filter(function (l) { return abs(l - prevFree) <= 1; });
    }
    var free = random(options);
    lanes = [0, 1, 2].filter(function (l) { return l !== free; });
    prevFree = free;
  } else {
    lanes = [floor(random(3))];
    prevFree = null;
  }

  var tallest = 0;
  for (var i = 0; i < lanes.length; i++) {
    var type = random(OBSTACLE_TYPES);
    var spr = sprites[type];
    var baseY = -spr.h - floor(scrollY);
    obstacles.push({ type: type, lane: lanes[i], baseY: baseY, y: baseY + scrollY, w: spr.w, h: spr.h, passed: false });
    tallest = max(tallest, spr.h);
  }

  distSinceRow = 0;
  nextRowDist = tallest + currentGap() + random(CONFIG.GAP_JITTER);
}

function addPoint() {
  score++;
  if (CONFIG.TICK_SOUND) sfx.tick();
  var newLevel = floor(score / CONFIG.POINTS_PER_LEVEL);
  if (newLevel > level) {
    level = newLevel;
    flashT = 1.5;
    sfx.levelUp();
  }
  if (score >= nextWhaleAt) {
    spawnWhale();
    nextWhaleAt = score + round(random(CONFIG.WHALE_EVERY[0], CONFIG.WHALE_EVERY[1]));
  }
  if (score >= nextBigfootAt) {
    bigfootPending = true;
    nextBigfootAt = score + round(random(CONFIG.BIGFOOT_EVERY[0], CONFIG.BIGFOOT_EVERY[1]));
  }
}

// ---------- scenery critters ----------

function updateCritters(dt) {
  if (whale) {
    whale.t += dt * whale.rate;
    if (whale.t > WHALE_DUR) whale = null;
  }
  if (bigfoot) {
    bigfoot.t += dt * bigfoot.rate;
    if (bigfoot.t > BIGFOOT_DUR) bigfoot = null;
  }
  if (bigfootPending && !bigfoot) spawnBigfoot();
}

function spawnWhale() {
  var maxX = roadX - beachWidth() - 11;  // stay clear of the surf
  var x = floor(random(8, max(9, maxX)));
  var y = floor(random(4, H * 0.15));
  whale = { x: x, baseY: y - floor(scrollY), t: 0, rate: playbackRate(y, WHALE_DUR) };
}

// Critters scroll with the ground, so at high speed speed up the animation
// enough to finish before they scroll off the bottom.
function playbackRate(y, dur) {
  if (state !== PLAYING) return 1;
  var onScreen = (H + 8 - y) / currentSpeed();
  return max(1, dur / onScreen);
}

// Bigfoot steps out from behind a real tree in the forest, so pick a big
// enough tree near the top of the screen with room beside it.
function spawnBigfoot() {
  var fs = floor(scrollY);
  var roadR = roadX + CONFIG.ROAD_W;
  var options = [];
  for (var i = 0; i < forestTrees.length; i++) {
    var tx = forestTrees[i][0], ty = forestTrees[i][1], r = forestTrees[i][2];
    if (r < 6) continue;
    var m = floor((ty + fs) / TH);
    var y = ty + fs - TH * m;
    if (y < 10 || y > H * 0.3) continue;
    var sides = [];
    if (tx + r + 12 < W) sides.push(1);
    if (tx - r - 12 > roadR + 2) sides.push(-1);
    if (sides.length) options.push({ tx: tx, ty: ty, r: r, m: m, side: random(sides) });
  }
  if (!options.length) return;  // try again next frame
  bigfoot = random(options);
  bigfoot.t = 0;
  bigfoot.rate = playbackRate(bigfoot.ty + fs - TH * bigfoot.m, BIGFOOT_DUR);
  bigfootPending = false;
}

function drawWhale() {
  var t = whale.t, cx = whale.x, cy = whale.baseY + floor(scrollY);
  var foam = SCENERY.foam;

  // ripple ring as it surfaces and dives
  if (t < 0.5 || (t > 2.0 && t < 2.6)) {
    var p = t < 0.5 ? t / 0.5 : (t - 2.0) / 0.6;
    var rx = 5 + p * 5, ry = 2 + p * 3;
    pg.fill(foam);
    for (var a = 0; a < TWO_PI; a += 0.35) {
      pg.rect(round(cx + cos(a) * rx), round(cy + sin(a) * ry), 1, 1);
    }
  }

  if (t > 0.3 && t < 2.1) {
    drawPixelMap(SPRITES.whale, cx - 7, cy - 3);
  } else if (t >= 2.1 && t < 2.7) {
    drawPixelMap(SPRITES.whaleTail, cx - 4, cy - 3);
  }

  // spout: a column shoots up, then bursts into falling spray
  var ts = t - 0.6;
  var topY = cy - 4;
  if (ts > 0 && ts < 0.4) {
    var hgt = floor(ts / 0.4 * 10);
    pg.fill('#ffffff');
    pg.rect(cx, topY - hgt, 1, hgt);
  } else if (ts >= 0.4 && ts < 1.4) {
    var q = (ts - 0.4) / 1.0;
    pg.fill('#ffffff');
    var colH = floor(10 * (1 - q));
    if (colH > 0) pg.rect(cx, topY - colH, 1, colH);
    pg.fill('#cfe8ff');
    var drops = [-3, -2, -1, 1, 2, 3];
    for (var i = 0; i < drops.length; i++) {
      var dx = round(drops[i] * (1 + q * 2));
      var dy = round(-10 + q * q * 12 + abs(drops[i]) * 0.5);
      pg.rect(cx + dx, topY + dy, 1, 1);
    }
  }
}

function drawBigfoot() {
  var b = bigfoot, t = b.t;
  var ty = b.ty + floor(scrollY) - TH * b.m;
  var w = SPRITES.bigfoot[0].length;
  var fullOut = b.r + w - 1;

  var p;
  if (t < 0.5) p = t / 0.5;
  else if (t < 2.1) p = 1;
  else p = max(0, 1 - (t - 2.1) / 0.5);
  var dx = round(p * fullOut);

  var waving = t > 0.7 && t < 1.9 && floor(t * 4) % 2 === 0;
  var rows = waving ? SPRITES.bigfootWave : SPRITES.bigfoot;
  var left = b.side === 1 ? b.tx - w + dx : b.tx - dx;
  var top = ty - 8;

  // only the part past the trunk line shows, then the canopy covers the rest
  drawPixelMap(rows, left, top, function (x) {
    return b.side === 1 ? x >= b.tx : x < b.tx;
  });
  drawTree(pg, b.tx, ty, b.r);
}

// Waves wash up and back on a timer (not tied to scrolling, so the rhythm
// stays calm at any speed). Each row's phase comes from its tile row, so the
// swell rolls along the shore and scrolls with the ground.
function drawSurf(off) {
  var t = millis() / 1000 * TWO_PI / CONFIG.SURF_PERIOD;
  var amp = CONFIG.SURF_AMP;
  var C = SCENERY;
  // Plain canvas calls, one pass per color: p5's fill() re-parses the color
  // string on every call, which is too slow for ~1000 rects a frame.
  var ctx = pg.drawingContext;
  var rows = [], y;
  for (y = -1; y < H; y++) {
    var ty = ((y - off) % TH + TH) % TH;
    rows.push([y, shoreX[ty], round(amp * (0.5 + 0.5 * sin(t + ty / TH * TWO_PI * 3)))]);
  }
  var passes = [
    // wet sand where the water has been up to its high mark
    [C.wetSand, function (b, a) { return [b + a + 2, amp - a + 1]; }],
    [C.ocean, function (b, a) { return [b, a]; }],
    [C.shallow, function (b, a) { return [b + a - 2, 2]; }],
    [C.foam, function (b, a) { return [b + a, 2]; }]
  ];
  for (var p = 0; p < passes.length; p++) {
    ctx.fillStyle = passes[p][0];
    for (var i = 0; i < rows.length; i++) {
      var span = passes[p][1](rows[i][1], rows[i][2]);
      if (span[1] > 0) ctx.fillRect(span[0], rows[i][0], span[1], 1);
    }
  }
}

function drawPixelMap(rows, x0, y0, keepX) {
  for (var y = 0; y < rows.length; y++) {
    for (var x = 0; x < rows[y].length; x++) {
      var ch = rows[y].charAt(x);
      if (ch === '.' || (keepX && !keepX(x0 + x))) continue;
      pg.fill(PALETTE[ch]);
      pg.rect(x0 + x, y0 + y, 1, 1);
    }
  }
}

function checkCollisions() {
  var i = CONFIG.HITBOX_INSET;
  var car = sprites.car;
  var cx = carX - car.w / 2 + i, cy = carY() + i;
  var cw = car.w - 2 * i, ch = car.h - 2 * i;

  for (var n = 0; n < obstacles.length; n++) {
    var o = obstacles[n];
    var ox = laneX(o.lane) - o.w / 2 + i, oy = o.y + i;
    var ow = o.w - 2 * i, oh = o.h - 2 * i;
    if (cx < ox + ow && cx + cw > ox && cy < oy + oh && cy + ch > oy) {
      crash();
      return;
    }
  }
}

function crash() {
  state = GAMEOVER;
  gameOverAt = millis();
  shakeT = 0.3;
  sfx.crash();
}

function resetGame() {
  obstacles = [];
  score = CONFIG.START_SCORE;
  level = floor(score / CONFIG.POINTS_PER_LEVEL);
  lane = 1;
  carX = laneX(1);
  distSinceRow = 0;
  nextRowDist = 40;
  prevFree = null;
  flashT = 0;
  nextWhaleAt = score + round(random(CONFIG.WHALE_EVERY[0], CONFIG.WHALE_EVERY[1]));
  nextBigfootAt = score + round(random(CONFIG.BIGFOOT_EVERY[0], CONFIG.BIGFOOT_EVERY[1]));
  bigfootPending = false;
  state = PLAYING;
}

// ---------- rendering ----------

// Everything here moves with the ground, positioned at whole-pixel scroll fs.
// pg row 0 is world y = -1 (the spare row).
function renderWorld(fs) {
  pg.push();
  pg.translate(0, 1);
  var off = fs % TH;
  pg.image(sceneryTile, 0, off);
  pg.image(sceneryTile, 0, off - TH);
  drawSurf(off);
  if (whale) drawWhale();
  if (bigfoot) drawBigfoot();

  for (var i = 0; i < obstacles.length; i++) {
    var o = obstacles[i];
    drawSprite(sprites[o.type], laneX(o.lane), o.baseY + fs);
  }
  pg.pop();
}

function drawSprite(spr, centerX, topY) {
  pg.image(spr.g, floor(centerX - spr.w / 2), floor(topY));
}

function drawHUD() {
  drawHUDText();
  drawMuteButton();
}

function drawHUDText() {
  var pw = W * S, ph = H * S;
  var cx = offX + (roadX + CONFIG.ROAD_W / 2) * S;   // road center
  var fieldL = cx - CONFIG.MIN_W / 2 * S;            // HUD hugs the road area,
  var fieldR = cx + CONFIG.MIN_W / 2 * S;            // not the far screen edges
  var small = max(8, S * 4);
  var big = max(16, S * 10);
  textFont('"Press Start 2P", monospace');
  noStroke();

  if (state === START) {
    fill(0, 0, 0, 120);
    rect(offX, offY, pw, ph);
    shadowText("ADAM'S CAR", cx, offY + ph * 0.3, big, '#d62828', CENTER);
    if (floor(millis() / 500) % 2 === 0) {
      shadowText('PRESS SPACE TO START', cx, offY + ph * 0.55, small, '#ffffff', CENTER);
    }
    shadowText('ARROWS TO STEER', cx, offY + ph * 0.65, floor(small * 0.75), '#ffe066', CENTER);
    shadowText('M TO MUTE', cx, offY + ph * 0.71, floor(small * 0.75), '#ffe066', CENTER);
    return;
  }

  var pad = small;
  var levelRight = min(fieldR - pad, muteButtonRect().x - S * 3);  // clear of the mute button on phones
  shadowText('SCORE ' + score, fieldL + pad, offY + pad, small, '#ffffff', LEFT);
  shadowText('LV ' + (level + 1), levelRight, offY + pad, small, '#ffe066', RIGHT);

  if (state === PLAYING && flashT > 0 && floor(flashT * 6) % 2 === 0) {
    shadowText('SPEED UP!', cx, offY + ph * 0.4, small, '#ffe066', CENTER);
  }

  if (state === GAMEOVER) {
    fill(0, 0, 0, 150);
    rect(offX, offY, pw, ph);
    shadowText('GAME OVER', cx, offY + ph * 0.35, floor(big * 0.8), '#d62828', CENTER);
    shadowText('SCORE ' + score, cx, offY + ph * 0.47, small, '#ffffff', CENTER);
    if (millis() - gameOverAt > CONFIG.INPUT_LOCK_MS && floor(millis() / 500) % 2 === 0) {
      shadowText('PRESS SPACE TO TRY AGAIN', cx, offY + ph * 0.6, small, '#ffffff', CENTER);
    }
  }
}

// ---------- mute button ----------

var SPEAKER_ICON = [
  '.....W......',
  '....WW......',
  '...WWW...W..',
  'WWWWWW.W..W.',
  'WWWWWW..W.W.',
  'WWWWWW..W.W.',
  'WWWWWW..W.W.',
  'WWWWWW.W..W.',
  '...WWW...W..',
  '....WW......',
  '.....W......'
];

// Top-right corner of the screen, in device pixels. Icon pixels are 75% of a
// world pixel, rounded to whole screen pixels so the icon stays crisp.
function muteButtonRect() {
  var px = max(1, round(S * 0.75));
  var w = SPEAKER_ICON[0].length * px, h = SPEAKER_ICON.length * px;
  var margin = S * 3;
  return { x: width - margin - w, y: margin, w: w, h: h, px: px };
}

function drawMuteButton() {
  var r = muteButtonRect();
  var ctx = drawingContext;
  var rows = SPEAKER_ICON;
  var x, y, P = r.px;
  // dark drop shadow, then the white icon
  var layers = [['#000000', P], ['#ffffff', 0]];
  for (var l = 0; l < layers.length; l++) {
    ctx.fillStyle = layers[l][0];
    for (y = 0; y < rows.length; y++) {
      for (x = 0; x < rows[y].length; x++) {
        if (rows[y].charAt(x) === 'W') ctx.fillRect(r.x + x * P + layers[l][1], r.y + y * P + layers[l][1], P, P);
      }
    }
  }
  if (sfx.muted) {
    // diagonal slash from top-left to bottom-right, 2 icon pixels thick
    var n = rows[0].length, m = rows.length;
    for (l = 0; l < layers.length; l++) {
      ctx.fillStyle = l === 0 ? '#000000' : '#e63946';
      for (x = 0; x < n; x++) {
        y = round(x * (m - 1) / (n - 1));
        ctx.fillRect(r.x + x * P + layers[l][1], r.y + y * P + layers[l][1], P, 2 * P);
      }
    }
  }
}

// Mouse and touch both arrive as pointer events; convert CSS px to canvas px.
function overMuteButton(e) {
  var box = cnv.elt.getBoundingClientRect();
  var px = (e.clientX - box.left) * width / box.width;
  var py = (e.clientY - box.top) * height / box.height;
  var r = muteButtonRect(), slop = S * 3;  // a little extra room for fingers
  return px >= r.x - slop && px <= r.x + r.w + slop && py >= r.y - slop && py <= r.y + r.h + slop;
}

function onPointerDown(e) {
  if (!overMuteButton(e)) return;
  sfx.toggleMute();
  e.preventDefault();
}

function onPointerMove(e) {
  cnv.elt.style.cursor = overMuteButton(e) ? 'pointer' : 'default';
}

function shadowText(str, x, y, size, col, align) {
  textSize(size);
  textAlign(align, TOP);
  var d = max(1, floor(size / 8));
  fill(0);
  text(str, x + d, y + d);
  fill(col);
  text(str, x, y);
}

// ---------- input / layout ----------

function keyPressed() {
  if (keyCode === 32) {
    sfx.init();
    if (state === START) {
      resetGame();
    } else if (state === GAMEOVER && millis() - gameOverAt > CONFIG.INPUT_LOCK_MS) {
      resetGame();
    }
    return false;
  }
  if (state === PLAYING) {
    if (keyCode === LEFT_ARROW && lane > 0) { lane--; sfx.lane(); }
    if (keyCode === RIGHT_ARROW && lane < 2) { lane++; sfx.lane(); }
  }
  if (key === 'M' || key === 'm') sfx.toggleMute();
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) return false;
}

function windowResized() {
  fitCanvas();
  layout();
}

// ---------- sound (tiny Web Audio synth, no files) ----------

var sfx = {
  ctx: null,
  muted: false,

  init: function () {
    if (!this.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended' && !this.muted) this.ctx.resume();
  },

  // Suspending the audio context also cuts off any sound already playing.
  toggleMute: function () {
    this.muted = !this.muted;
    if (!this.ctx) return;
    if (this.muted) this.ctx.suspend();
    else this.ctx.resume();
  },

  tone: function (freq, dur, type, vol, endFreq, delay) {
    if (!this.ctx || this.muted) return;
    var t = this.ctx.currentTime + (delay || 0);
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  },

  noise: function (dur, vol) {
    if (!this.ctx || this.muted) return;
    var len = floor(this.ctx.sampleRate * dur);
    var buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    var src = this.ctx.createBufferSource();
    var gain = this.ctx.createGain();
    var t = this.ctx.currentTime;
    src.buffer = buf;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(t);
  },

  lane: function () { this.tone(880, 0.04, 'square', 0.06); },
  tick: function () { this.tone(1320, 0.02, 'square', 0.02); },
  levelUp: function () {
    this.tone(523, 0.09, 'square', 0.08, 0, 0);
    this.tone(659, 0.09, 'square', 0.08, 0, 0.09);
    this.tone(784, 0.16, 'square', 0.08, 0, 0.18);
  },
  crash: function () {
    this.noise(0.35, 0.25);
    this.tone(300, 0.45, 'sawtooth', 0.12, 50);
  }
};
