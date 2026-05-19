const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const powerFill = document.getElementById("powerFill");
const loveScore = document.getElementById("loveScore");

let w = 0;
let h = 0;
let dpr = 1;
let particles = [];
let rockets = [];
let flashes = [];
let running = false;
let launchTimer = 0;

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
  const palette = ["#ff5f9e", "#ffd166", "#54f0ff", "#87ffb1", "#a78bfa", "#ff8a4c"];
  return palette[(Math.random() * palette.length) | 0];
}

function launchRocket(x = rand(w * 0.08, w * 0.92), targetY = rand(h * 0.12, h * 0.5)) {
  rockets.push({
    x,
    y: h + 20,
    vx: rand(-0.8, 0.8),
    vy: rand(-11.8, -15.6),
    targetY,
    color: hue(),
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

function burst(x, y, color, scale = 1) {
  const count = Math.floor(rand(92, 145) * scale);
  flashes.push({ x, y, radius: 8, alpha: 0.34, color });

  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + rand(-0.08, 0.08);
    const speed = rand(2.4, 8.8) * scale;
    addSpark(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, rand(1.6, 3.8), rand(70, 112), rand(0.01, 0.019));
  }

  for (let i = 0; i < Math.floor(18 * scale); i += 1) {
    window.setTimeout(() => {
      const angle = rand(0, Math.PI * 2);
      const distance = rand(24, 82) * scale;
      miniBurst(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance, hue());
    }, rand(120, 520));
  }
}

function miniBurst(x, y, color) {
  const count = Math.floor(rand(22, 34));
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = rand(1.1, 3.8);
    addSpark(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, rand(1, 2.1), rand(38, 66), rand(0.018, 0.032));
  }
}

function finaleVolley() {
  const slots = [0.14, 0.28, 0.42, 0.58, 0.72, 0.86];
  slots.forEach((slot, index) => {
    window.setTimeout(() => launchRocket(w * slot, rand(h * 0.14, h * 0.38)), index * 90);
  });

  window.setTimeout(() => {
    burst(w * 0.5, h * 0.32, "#ffd166", 1.55);
    burst(w * 0.28, h * 0.25, "#ff5f9e", 1.15);
    burst(w * 0.72, h * 0.25, "#54f0ff", 1.15);
  }, 880);
}

function updateRockets() {
  rockets = rockets.filter((rocket) => {
    rocket.x += rocket.vx;
    rocket.y += rocket.vy;
    rocket.vy += 0.045;
    addSpark(rocket.x, rocket.y + 8, rand(-0.35, 0.35), rand(0.7, 1.8), rocket.color, rand(0.8, 1.5), rand(16, 28), 0.04);
    if (rocket.y <= rocket.targetY || rocket.vy >= -1.2) {
      burst(rocket.x, rocket.y, rocket.color, rand(0.82, 1.2));
      return false;
    }
    return rocket.y > -40;
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
  ctx.fillStyle = "rgba(4, 6, 16, 0.16)";
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createLinearGradient(0, 0, 0, h);
  glow.addColorStop(0, "rgba(255,255,255,0.06)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

function drawFlashes() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
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
    ctx.beginPath();
    ctx.fillStyle = rocket.color;
    ctx.arc(rocket.x, rocket.y, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawParticles() {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const p of particles) {
    ctx.beginPath();
    ctx.fillStyle = hexToRgba(p.color, p.alpha);
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function hexToRgba(color, alpha) {
  const map = {
    "#ff5f9e": [255, 95, 158],
    "#ffd166": [255, 209, 102],
    "#54f0ff": [84, 240, 255],
    "#87ffb1": [135, 255, 177],
    "#a78bfa": [167, 139, 250],
    "#ff8a4c": [255, 138, 76],
  };
  const [r, g, b] = map[color] || [255, 255, 255];
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

function tick() {
  drawBackground();
  updateRockets();
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
  loveScore.textContent = "100%";

  finaleVolley();

  launchTimer = window.setInterval(() => {
    const waves = window.innerWidth < 620 ? 4 : 6;
    for (let i = 0; i < waves; i += 1) {
      launchRocket();
    }
    if (Math.random() > 0.45) {
      finaleVolley();
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
