let lbClasses = [];
let lbSelectedClassId = null;
let lbTab = 'individu';
let rewardTiers = [];

document.addEventListener('DOMContentLoaded', initLeaderboard);

async function initLeaderboard() {
  try {
    rewardTiers = await API.get('/reward-tiers');
    lbClasses = await API.get('/classes');
    const sel = document.getElementById('classSelector');
    if (lbClasses.length === 0) {
      sel.innerHTML = `<div class="empty-state" style="width:100%"><div class="emoji">🏫</div>Belum ada kelas.</div>`;
      return;
    }
    sel.innerHTML = lbClasses.map((c) => `<div class="class-chip" id="lbchip-${c._id}" onclick="lbSelectClass('${c._id}')">${c.name}</div>`).join('');
    lbSelectClass(lbClasses[0]._id);
  } catch (e) { toast(e.message, 'error'); }
}

function switchTab(tab) {
  lbTab = tab;
  document.getElementById('tabIndividu').classList.toggle('active', tab === 'individu');
  document.getElementById('tabKumpulan').classList.toggle('active', tab === 'kumpulan');
  document.getElementById('viewIndividu').style.display = tab === 'individu' ? 'block' : 'none';
  document.getElementById('viewKumpulan').style.display = tab === 'kumpulan' ? 'block' : 'none';
  if (lbSelectedClassId) lbSelectClass(lbSelectedClassId);
}

async function lbSelectClass(classId) {
  lbSelectedClassId = classId;
  document.querySelectorAll('.class-chip').forEach((el) => el.classList.remove('active'));
  const chip = document.getElementById(`lbchip-${classId}`);
  if (chip) chip.classList.add('active');

  if (lbTab === 'individu') await loadIndividu(classId);
  else await loadKumpulan(classId);
}

// ===== INDIVIDU: kad murid + counter bintang + grid sticker =====

async function loadIndividu(classId) {
  try {
    const students = await API.get(`/leaderboard/individu/${classId}`);
    const list = document.getElementById('individuList');
    if (students.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="emoji">👦👧</div>Tiada murid dalam kelas ini.</div>`;
      return;
    }
    list.innerHTML = students.map((s, i) => {
      const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
      return `
      <div class="student-reward-card ${rankClass}">
        <div class="src-header">
          <div class="src-rank">${i + 1}</div>
          <img class="src-photo" src="${s.photo || placeholderSVG()}" alt="${s.name}">
          <div class="src-name">${s.name}</div>
          <div class="star-counter">
            <button class="star-add-btn star-remove-btn" title="Kurang bintang" onclick="addPoint('${s._id}', -1)">➖</button>
            ${starIconSVG(22)}
            <span class="count">${s.points}</span>
            <button class="star-add-btn" title="Tambah bintang" onclick="addPoint('${s._id}', 1)">➕</button>
          </div>
        </div>
        ${renderStickerGrid(s.points)}
      </div>`;
    }).join('');
  } catch (e) { toast(e.message, 'error'); }
}

function renderStickerGrid(points) {
  // Guna 12 tahap (atau berapa banyak yang guru ada cipta), 6 lajur x 2 baris
  const tiers = rewardTiers.slice(0, 12);
  return `<div class="sticker-grid">
    ${tiers.map((t) => {
      const unlocked = points >= t.minStars;
      if (unlocked && t.stickerUrl) {
        return `<div class="sticker-slot"><img src="${t.stickerUrl}" alt="${t.name}" title="${t.name} (${t.minStars}+ ⭐)"></div>`;
      }
      return `<div class="sticker-slot ${unlocked ? '' : 'locked'}"><span class="tier-label">${t.minStars}+</span></div>`;
    }).join('')}
  </div>`;
}

async function addPoint(studentId, delta) {
  try {
    await API.patch(`/leaderboard/student/${studentId}/point`, { delta });
    if (delta > 0) {
      playStarChime();
      toast('Bintang ditambah! ⭐');
    }
    await loadIndividu(lbSelectedClassId);
  } catch (e) { toast(e.message, 'error'); }
}

// ===== KUMPULAN: circle progress (kekal) =====

async function loadKumpulan(classId) {
  try {
    const groups = await API.get(`/leaderboard/kumpulan/${classId}`);
    const grid = document.getElementById('kumpulanGrid');
    if (groups.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">👨‍👩‍👧‍👦</div>Tiada kumpulan dalam kelas ini.</div>`;
      return;
    }
    const maxPoints = Math.max(...groups.map((g) => g.totalPoints), 10);
    const radius = 58;
    const circumference = 2 * Math.PI * radius;

    grid.innerHTML = groups.map((g, i) => {
      const pct = Math.min(g.totalPoints / maxPoints, 1);
      const offset = circumference - pct * circumference;
      return `
      <div class="group-circle-card">
        ${i === 0 ? '<div class="group-rank-badge">👑 Mendahului</div>' : `<div class="group-rank-badge" style="background:#B18CFF;">#${i + 1}</div>`}
        <div class="circle-progress">
          <svg viewBox="0 0 140 140">
            <circle class="circle-bg" cx="70" cy="70" r="${radius}"></circle>
            <circle class="circle-fill" cx="70" cy="70" r="${radius}"
              stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"
              style="stroke: ${g.color || '#FF6FA5'}"
              data-offset="${offset}"></circle>
          </svg>
          <div class="circle-label">
            <div class="points">${g.totalPoints}</div>
            <div class="stars">${starIconSVG(14)} bintang</div>
          </div>
        </div>
        <div class="group-name">${g.name}</div>
        <div style="font-size:13px; opacity:.65;">👥 ${g.members.length} ahli</div>
      </div>`;
    }).join('');

    setTimeout(() => {
      document.querySelectorAll('.circle-fill').forEach((el) => {
        el.style.strokeDashoffset = el.dataset.offset;
      });
    }, 80);
  } catch (e) { toast(e.message, 'error'); }
}
