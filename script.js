const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const powerFill = document.getElementById("powerFill");

let w = 0;
let h = 0;
let dpr = 1;
let particles = [];
let rockets = [];
let flashes = [];
let fountains = [];
let running = false;
let launchTimer = 0;
let burstIndex = 0;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function hue() {
  const palette = ["#d95786", "#d9ad49", "#4aa0b3", "#69b978", "#8e72c7", "#d87948"];
  return palette[(Math.random() * palette.length) | 0];
}

function launchRocket(x = rand(w * 0.08, w * 0.92), targetY = rand(h * 0.12, h * 0.5), type = "random") {
  rockets.push({
    x,
    y: h + 20,
    vx: rand(-0.8, 0.8),
    vy: rand(-11.8, -15.6),
    targetY,
    color: hue(),
    type,
  });
}

function addSpark(x, y, vx, vy, color, size, life, decay) {
  particles.push({
    x,
    y,
    vx,
    vy,
    alpha: 1,
    life,
    decay,
    color,
    size,
  });
}

function addPoint(x, y, color, size = 4, life = 68) {
  addSpark(x, y, rand(-0.45, 0.45), rand(-0.35, 0.35), color, size, life, rand(0.018, 0.028));
}

function chooseBurstType(type) {
  if (type !== "random") return type;
  const types = ["circle", "heart", "star", "sakura", "ring"];
  const picked = types[burstIndex % types.length];
  burstIndex += 1;
  return picked;
}

function burst(x, y, color, scale = 1) {
  const type = chooseBurstType("random");
  shapedBurst(x, y, color, scale, type);
}

function shapedBurst(x, y, color, scale = 1, type = "circle") {
  const count = Math.floor(rand(58, 88) * scale);
  flashes.push({ x, y, radius: 8, alpha: 0.1, color });

  if (type === "heart") {
    heartBurst(x, y, scale);
    return;
  }

  if (type === "star") {
    starBurst(x, y, color, scale);
    return;
  }

  if (type === "sakura") {
    sakuraBurst(x, y, scale);
    return;
  }

  if (type === "ring") {
    ringBurst(x, y, color, scale);
    return;
  }

  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + rand(-0.08, 0.08);
    const speed = rand(1.8, 6.2) * scale;
    addSpark(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, rand(3, 5), rand(48, 78), rand(0.018, 0.03));
  }

  for (let i = 0; i < Math.floor(8 * scale); i += 1) {
    window.setTimeout(() => {
      const angle = rand(0, Math.PI * 2);
      const distance = rand(24, 82) * scale;
      miniBurst(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance, hue());
    }, rand(120, 520));
  }
}

function heartBurst(x, y, scale) {
  const color = "#d95786";
  for (let i = 0; i < 92; i += 1) {
    const t = (Math.PI * 2 * i) / 92;
    const px = 16 * Math.pow(Math.sin(t), 3);
    const py = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    addPoint(x + px * 4.2 * scale, y + py * 4.2 * scale, i % 3 === 0 ? "#f0aac8" : color, rand(3, 5), rand(58, 88));
  }
  miniBurst(x, y, "#d9ad49");
}

function starBurst(x, y, color, scale) {
  for (let arm = 0; arm < 5; arm += 1) {
    const base = -Math.PI / 2 + (arm * Math.PI * 2) / 5;
    for (let step = 0; step < 18; step += 1) {
      const distance = step * 6 * scale;
      const drift = rand(-0.32, 0.32);
      addSpark(
        x,
        y,
        Math.cos(base + drift) * (distance / 16),
        Math.sin(base + drift) * (distance / 16),
        step % 2 ? color : "#d9ad49",
        rand(3, 5),
        rand(50, 78),
        rand(0.018, 0.03)
      );
    }
  }
}

function sakuraBurst(x, y, scale) {
  const colors = ["#d95786", "#f0aac8", "#e6bd5a"];
  for (let petal = 0; petal < 7; petal += 1) {
    const base = (Math.PI * 2 * petal) / 7;
    for (let step = 0; step < 14; step += 1) {
      const spread = step * 4.8 * scale;
      addSpark(
        x,
        y,
        Math.cos(base + rand(-0.22, 0.22)) * (spread / 13),
        Math.sin(base + rand(-0.22, 0.22)) * (spread / 17),
        colors[petal % colors.length],
        rand(3, 5),
        rand(44, 74),
        rand(0.02, 0.034)
      );
    }
  }
}

function ringBurst(x, y, color, scale) {
  for (let ring = 0; ring < 2; ring += 1) {
    const count = ring ? 42 : 60;
    const radius = ring ? 48 : 76;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = (radius / 18) * scale;
      addSpark(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, ring ? "#69b978" : color, rand(3, 5), rand(52, 82), rand(0.018, 0.03));
    }
  }
}

function text520Burst() {
  const pixel = Math.max(5, Math.min(9, w / 80));
  const patterns = [
    ["111", "001", "111", "100", "111"],
    ["111", "100", "111", "001", "111"],
    ["111", "101", "101", "101", "111"],
  ];
  const totalWidth = 11 * pixel;
  const startX = w / 2 - totalWidth / 2;
  const startY = h * 0.2;

  patterns.forEach((pattern, digit) => {
    pattern.forEach((row, rowIndex) => {
      [...row].forEach((cell, colIndex) => {
        if (cell === "1") {
          addPoint(
            startX + (digit * 4 + colIndex) * pixel,
            startY + rowIndex * pixel,
            digit === 1 ? "#d95786" : "#d9ad49",
            pixel * 0.8,
            104
          );
        }
      });
    });
  });
}

function launchFountain() {
  const left = w * 0.18;
  const right = w * 0.82;
  for (let i = 0; i < 10; i += 1) {
    fountains.push({
      x: i % 2 ? left : right,
      y: h - 78,
      vx: rand(-1.6, 1.6) * (i % 2 ? 1 : -1),
      vy: rand(-7.2, -4.6),
      color: i % 3 === 0 ? "#d95786" : hue(),
      life: rand(22, 36),
    });
  }
}

function miniBurst(x, y, color) {
  const count = Math.floor(rand(12, 20));
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = rand(0.8, 2.6);
    addSpark(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, rand(2, 4), rand(28, 48), rand(0.026, 0.04));
  }
}

function finaleVolley() {
  const slots = [0.14, 0.28, 0.42, 0.58, 0.72, 0.86];
  slots.forEach((slot, index) => {
    const types = ["heart", "circle", "star", "sakura", "ring", "circle"];
    window.setTimeout(() => launchRocket(w * slot, rand(h * 0.14, h * 0.38), types[index]), index * 90);
  });

  window.setTimeout(() => {
    shapedBurst(w * 0.5, h * 0.32, "#d9ad49", 1.1, "heart");
    shapedBurst(w * 0.28, h * 0.25, "#d95786", 0.9, "star");
    shapedBurst(w * 0.72, h * 0.25, "#4aa0b3", 0.9, "sakura");
  }, 880);

  window.setTimeout(text520Burst, 1250);
  window.setTimeout(launchFountain, 150);
  window.setTimeout(launchFountain, 500);
}

function updateRockets() {
  rockets = rockets.filter((rocket) => {
    rocket.x += rocket.vx;
    rocket.y += rocket.vy;
    rocket.vy += 0.045;
    addSpark(rocket.x, rocket.y + 8, rand(-0.2, 0.2), rand(0.5, 1.2), rocket.color, rand(2, 3), rand(10, 20), 0.06);
    if (rocket.y <= rocket.targetY || rocket.vy >= -1.2) {
      shapedBurst(rocket.x, rocket.y, rocket.color, rand(0.82, 1.2), chooseBurstType(rocket.type));
      return false;
    }
    return rocket.y > -40;
  });
}

function updateFountains() {
  fountains = fountains.filter((fountain) => {
    fountain.x += fountain.vx;
    fountain.y += fountain.vy;
    fountain.vy += 0.24;
    fountain.life -= 1;
    addSpark(fountain.x, fountain.y, rand(-0.35, 0.35), rand(0.3, 1.4), fountain.color, rand(2, 4), rand(18, 34), 0.05);
    return fountain.life > 0;
  });
}

function updateParticles() {
  particles = particles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.04;
    p.vx *= 0.985;
    p.alpha -= p.decay;
    p.life -= 1;
    return p.alpha > 0 && p.life > 0;
  });
}

function updateFlashes() {
  flashes = flashes.filter((flash) => {
    flash.radius += 10;
    flash.alpha -= 0.025;
    return flash.alpha > 0;
  });
}

function drawBackground() {
  ctx.clearRect(0, 0, w, h);
}

function drawFlashes() {
  ctx.save();
  for (const flash of flashes) {
    const gradient = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, flash.radius);
    gradient.addColorStop(0, hexToRgba(flash.color, flash.alpha));
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawRockets() {
  for (const rocket of rockets) {
    ctx.fillStyle = rocket.color;
    ctx.fillRect(Math.round(rocket.x / 4) * 4, Math.round(rocket.y / 4) * 4, 5, 5);
  }
}

function drawParticles() {
  ctx.save();
  for (const p of particles) {
    ctx.fillStyle = hexToRgba(p.color, p.alpha * 0.72);
    const size = Math.max(2, Math.round(p.size));
    ctx.fillRect(Math.round(p.x / 3) * 3, Math.round(p.y / 3) * 3, size, size);
  }
  ctx.restore();
}

function hexToRgba(color, alpha) {
  const map = {
    "#d95786": [217, 87, 134],
    "#d9ad49": [217, 173, 73],
    "#4aa0b3": [74, 160, 179],
    "#69b978": [105, 185, 120],
    "#8e72c7": [142, 114, 199],
    "#d87948": [216, 121, 72],
  };
  const [r, g, b] = map[color] || [255, 255, 255];
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

function tick() {
  drawBackground();
  updateRockets();
  updateFountains();
  updateParticles();
  updateFlashes();
  drawFlashes();
  drawRockets();
  drawParticles();
  requestAnimationFrame(tick);
}

function startShow() {
  if (running) return;
  running = true;
  startButton.disabled = true;
  startButton.textContent = "烟花已点亮";
  powerFill.style.width = "100%";

  finaleVolley();

  launchTimer = window.setInterval(() => {
    const waves = window.innerWidth < 620 ? 4 : 6;
    const types = ["heart", "star", "sakura", "ring", "circle"];
    for (let i = 0; i < waves; i += 1) {
      launchRocket(undefined, undefined, types[(burstIndex + i) % types.length]);
    }
    if (Math.random() > 0.45) {
      finaleVolley();
    } else {
      launchFountain();
    }
  }, 960);
}

window.addEventListener("resize", resize);
startButton.addEventListener("click", startShow);

resize();
ctx.clearRect(0, 0, w, h);
tick();

window.setTimeout(() => {
  if (!running) {
    launchRocket(w * 0.5, h * 0.34);
  }
}, 700);
