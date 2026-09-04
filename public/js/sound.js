const AudioCtx = window.AudioContext || window.webkitAudioContext;
let actx = null;
function getCtx() {
  if (!actx) actx = new AudioCtx();
  if (actx.state === 'suspended') actx.resume();
  return actx;
}

function playTick() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) { /* ignore */ }
}

function playTada() {
  try {
    const ctx = getCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
  } catch (e) { /* ignore */ }
}

function playStarChime() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) { /* ignore */ }
}

let confettiCanvas, confettiCtx, confettiParticles = [], confettiRunning = false;

function ensureConfettiCanvas() {
  if (confettiCanvas) return;
  confettiCanvas = document.createElement('canvas');
  confettiCanvas.id = 'confetti-canvas';
  document.body.appendChild(confettiCanvas);
  confettiCtx = confettiCanvas.getContext('2d');
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);
}
function resizeConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

const CONFETTI_COLORS = ['#FF6FA5', '#FFA45C', '#FFD75C', '#6BE6A6', '#5CC8FF', '#B18CFF'];

function fireConfetti(durationMs = 2500) {
  ensureConfettiCanvas();
  const count = 140;
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * confettiCanvas.height * 0.3,
      r: 4 + Math.random() * 5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * 360,
      vrot: -6 + Math.random() * 12,
      shape: Math.random() > 0.5 ? 'circle' : 'rect'
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    animateConfetti();
  }
}

function animateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.04;
    p.rot += p.vrot;
    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rot * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;
    if (p.shape === 'circle') {
      confettiCtx.beginPath();
      confettiCtx.arc(0, 0, p.r, 0, Math.PI * 2);
      confettiCtx.fill();
    } else {
      confettiCtx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
    }
    confettiCtx.restore();
  });
  confettiParticles = confettiParticles.filter((p) => p.y < confettiCanvas.height + 40);
  if (confettiParticles.length > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    confettiRunning = false;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}
