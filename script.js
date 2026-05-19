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
  const palette = ["#d95786", "#d9ad49", "#4aa0b3", "#69b978", "#8e72c7", "#d87948"];
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
  const count = Math.floor(rand(58, 88) * scale);
  flashes.push({ x, y, radius: 8, alpha: 0.1, color });

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
    window.setTimeout(() => launchRocket(w * slot, rand(h * 0.14, h * 0.38)), index * 90);
  });

  window.setTimeout(() => {
    burst(w * 0.5, h * 0.32, "#d9ad49", 1.25);
    burst(w * 0.28, h * 0.25, "#d95786", 0.95);
    burst(w * 0.72, h * 0.25, "#4aa0b3", 0.95);
  }, 880);
}

function updateRockets() {
  rockets = rockets.filter((rocket) => {
    rocket.x += rocket.vx;
    rocket.y += rocket.vy;
    rocket.vy += 0.045;
    addSpark(rocket.x, rocket.y + 8, rand(-0.2, 0.2), rand(0.5, 1.2), rocket.color, rand(2, 3), rand(10, 20), 0.06);
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
