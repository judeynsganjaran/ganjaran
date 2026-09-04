let spinClasses = [];
let spinSelectedClassId = null;
let spinImages = [];
let isSpinning = false;

document.addEventListener('DOMContentLoaded', initSpinPage);

async function initSpinPage() {
  try {
    spinClasses = await API.get('/classes');
    const sel = document.getElementById('classSelector');
    if (spinClasses.length === 0) {
      sel.innerHTML = `<div class="empty-state" style="width:100%"><div class="emoji">🏫</div>Belum ada kelas.</div>`;
      return;
    }
    sel.innerHTML = spinClasses.map((c) => `<div class="class-chip" id="spinchip-${c._id}" onclick="spinSelectClass('${c._id}')">${c.name}</div>`).join('');
    await spinSelectClass(spinClasses[0]._id);
  } catch (e) { toast(e.message, 'error'); }
}

async function spinSelectClass(classId) {
  if (isSpinning) return;
  spinSelectedClassId = classId;
  document.querySelectorAll('.class-chip').forEach((el) => el.classList.remove('active'));
  const chip = document.getElementById(`spinchip-${classId}`);
  if (chip) chip.classList.add('active');

  spinImages = await API.get(`/spin-images/${classId}`);
  document.getElementById('spinCount').textContent = `${spinImages.length} gambar dalam set kelas ini`;
  document.getElementById('spinImg').src = spinImages[0] ? spinImages[0].imageUrl : placeholderSVG();
  document.getElementById('spinFrame').classList.remove('winner');
  document.getElementById('spinTapHint').textContent = spinImages.length ? '👆 Tekan untuk Spin!' : '⚠️ Upload gambar di Pengurusan Kelas dahulu';
}

function handleFrameClick() {
  if (isSpinning) return;
  startSpin();
}

async function startSpin() {
  if (!spinImages || spinImages.length === 0) {
    toast('Tiada gambar untuk spin — upload dulu di Pengurusan Kelas', 'error');
    return;
  }
  isSpinning = true;
  const frame = document.getElementById('spinFrame');
  const img = document.getElementById('spinImg');

  frame.classList.remove('winner');
  frame.classList.add('spinning');

  const winnerIndex = Math.floor(Math.random() * spinImages.length);
  const winner = spinImages[winnerIndex];

  const totalDurationMs = 3200;
  const startTime = performance.now();
  let lastIdx = -1;

  function tickFrame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / totalDurationMs, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const minDelay = 45;
    const maxDelay = 420;
    const currentDelay = minDelay + (maxDelay - minDelay) * easedProgress;

    if (progress < 1) {
      let idx = Math.floor(Math.random() * spinImages.length);
      if (spinImages.length > 1 && idx === lastIdx) idx = (idx + 1) % spinImages.length;
      lastIdx = idx;
      img.src = spinImages[idx].imageUrl;
      playTick();

      setTimeout(() => requestAnimationFrame(tickFrame), currentDelay);
    } else {
      finishSpin(winner);
    }
  }
  requestAnimationFrame(tickFrame);
}

function finishSpin(winner) {
  const frame = document.getElementById('spinFrame');
  const img = document.getElementById('spinImg');

  frame.classList.remove('spinning');
  img.src = winner.imageUrl;

  void frame.offsetWidth;
  frame.classList.add('winner');

  playTada();
  fireConfetti(2800);
  spawnCelebrationEmojis();

  isSpinning = false;
}

function spawnCelebrationEmojis() {
  const stage = document.getElementById('spinStage');
  const emojis = ['🎉', '🎊', '⭐', '🥳', '🎈', '✨'];
  for (let i = 0; i < 18; i++) {
    const span = document.createElement('span');
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const startX = 50 + (Math.random() * 60 - 30);
    span.style.cssText = `
      position:absolute; left:${startX}%; top:45%; font-size:${20 + Math.random() * 18}px;
      pointer-events:none; z-index:50; transition: transform 1.1s ease-out, opacity 1.1s ease-out;
      transform: translate(0,0) scale(0.6) rotate(0deg); opacity:1;`;
    stage.appendChild(span);
    requestAnimationFrame(() => {
      const dx = (Math.random() * 300 - 150);
      const dy = -(120 + Math.random() * 140);
      span.style.transform = `translate(${dx}px, ${dy}px) scale(1.3) rotate(${Math.random() * 360}deg)`;
      span.style.opacity = '0';
    });
    setTimeout(() => span.remove(), 1300);
  }
}

// ===== SKRIN PENUH =====
function toggleFullscreen() {
  const stage = document.getElementById('spinStage');
  if (!document.fullscreenElement) {
    stage.requestFullscreen?.() || stage.webkitRequestFullscreen?.();
  } else {
    document.exitFullscreen?.() || document.webkitExitFullscreen?.();
  }
}
