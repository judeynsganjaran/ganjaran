let spinClasses = [];
let spinSelectedClassId = null;
let spinStudents = [];
let isSpinning = false;

document.addEventListener('DOMContentLoaded', initSpinPage);

function placeholderSVG() {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#FFE8A3"/><text x="100" y="120" font-size="70" text-anchor="middle">🙂</text></svg>
  `);
}

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

  spinStudents = await API.get(`/spin/${classId}`);
  document.getElementById('spinCount').textContent = `${spinStudents.length} murid dalam kelas ini`;
  document.getElementById('spinImg').src = spinStudents[0] ? imgOf(spinStudents[0]) : placeholderSVG();
  document.getElementById('spinNameTag').textContent = spinStudents.length ? 'Sedia untuk spin? 🎉' : 'Tiada murid dalam kelas ini';
  document.getElementById('spinFrame').classList.remove('winner');
}

function imgOf(student) {
  return student.spinPhoto || student.photo || placeholderSVG();
}

async function startSpin() {
  if (isSpinning) return;
  if (!spinStudents || spinStudents.length === 0) {
    toast('Tiada murid untuk spin dalam kelas ini', 'error');
    return;
  }
  isSpinning = true;
  document.getElementById('spinBtn').disabled = true;
  document.getElementById('spinBtn').style.opacity = '0.6';
  const frame = document.getElementById('spinFrame');
  const img = document.getElementById('spinImg');
  const nameTag = document.getElementById('spinNameTag');

  frame.classList.remove('winner');
  frame.classList.add('spinning');
  nameTag.textContent = '🎲 Mengocok...';

  const winnerIndex = Math.floor(Math.random() * spinStudents.length);
  const winner = spinStudents[winnerIndex];

  // ===== FASA 1: pusingan pantas (macam slot machine) =====
  const totalDurationMs = 3200;
  const startTime = performance.now();
  let lastIdx = -1;

  function tickFrame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / totalDurationMs, 1);
    // easing: makin lama makin perlahan (ease-out cubic diterbalikkan untuk delay)
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    // interval delay meningkat drastik di penghujung (kelajuan menurun)
    const minDelay = 45;
    const maxDelay = 420;
    const currentDelay = minDelay + (maxDelay - minDelay) * easedProgress;

    if (progress < 1) {
      let idx = Math.floor(Math.random() * spinStudents.length);
      if (spinStudents.length > 1 && idx === lastIdx) idx = (idx + 1) % spinStudents.length;
      lastIdx = idx;
      const s = spinStudents[idx];
      img.src = imgOf(s);
      nameTag.textContent = s.name;
      playTick();

      setTimeout(() => requestAnimationFrame(tickFrame), currentDelay);
    } else {
      // ===== FASA 2: BERHENTI PADA PEMENANG =====
      finishSpin(winner);
    }
  }
  requestAnimationFrame(tickFrame);
}

function finishSpin(winner) {
  const frame = document.getElementById('spinFrame');
  const img = document.getElementById('spinImg');
  const nameTag = document.getElementById('spinNameTag');

  frame.classList.remove('spinning');
  img.src = imgOf(winner);
  nameTag.innerHTML = `🎉 ${winner.name} 🎉`;

  // efek zoom-in pemenang
  void frame.offsetWidth; // reset animation
  frame.classList.add('winner');

  // bunyi & confetti kejayaan
  playTada();
  fireConfetti(2800);

  // habuk-habuk emoji birthday melompat keluar
  spawnCelebrationEmojis();

  isSpinning = false;
  document.getElementById('spinBtn').disabled = false;
  document.getElementById('spinBtn').style.opacity = '1';
}

function spawnCelebrationEmojis() {
  const stage = document.querySelector('.spin-stage');
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
