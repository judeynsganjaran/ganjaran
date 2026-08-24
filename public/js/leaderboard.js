let lbClasses = [];
let lbSelectedClassId = null;
let lbTab = 'individu';

document.addEventListener('DOMContentLoaded', initLeaderboard);

async function initLeaderboard() {
  try {
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

// ===== TIER BINTANG: makin tinggi point, makin cantik bintang =====
function starTier(points) {
  if (points >= 30) return '🌠';
  if (points >= 20) return '✨';
  if (points >= 10) return '💫';
  if (points >= 5) return '🌟';
  return '⭐';
}

function placeholderSVG() {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#FFE8A3"/><text x="50" y="60" font-size="40" text-anchor="middle">🙂</text></svg>
  `);
}

async function loadIndividu(classId) {
  try {
    const students = await API.get(`/leaderboard/individu/${classId}`);
    const list = document.getElementById('individuList');
    if (students.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="emoji">👦👧</div>Tiada murid dalam kelas ini.</div>`;
      return;
    }
    const maxPoints = Math.max(...students.map((s) => s.points), 10);
    list.innerHTML = students.map((s, i) => {
      const pct = Math.round((s.points / maxPoints) * 100);
      const tier = starTier(s.points);
      const starCount = Math.min(s.points, 15);
      const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
      return `
      <div class="rank-row ${rankClass}">
        <div class="rank-num">${i + 1}</div>
        <img class="rank-photo" src="${s.photo || placeholderSVG()}" alt="${s.name}">
        <div class="rank-info">
          <div class="rank-name">${s.name}</div>
          <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          <div class="star-stickers">${Array.from({ length: starCount }).map(() => `<span class="star-icon">${tier}</span>`).join('')}</div>
        </div>
        <div class="point-badge">${s.points} ⭐</div>
        <button class="star-add-btn" title="Tambah bintang" onclick="addPoint('${s._id}', 1)">➕</button>
        <button class="star-add-btn star-remove-btn" title="Kurang bintang" onclick="addPoint('${s._id}', -1)">➖</button>
      </div>`;
    }).join('');
  } catch (e) { toast(e.message, 'error'); }
}

async function addPoint(studentId, delta) {
  try {
    await API.patch(`/leaderboard/student/${studentId}/point`, { delta });
    if (delta > 0) toast('Bintang ditambah! ⭐');
    await loadIndividu(lbSelectedClassId);
  } catch (e) { toast(e.message, 'error'); }
}

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
      const tier = starTier(g.totalPoints);
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
            <div class="stars">${tier} bintang</div>
          </div>
        </div>
        <div class="group-name">${g.name}</div>
        <div style="font-size:13px; opacity:.65;">👥 ${g.members.length} ahli</div>
      </div>`;
    }).join('');

    // animate circle after render
    setTimeout(() => {
      document.querySelectorAll('.circle-fill').forEach((el) => {
        el.style.strokeDashoffset = el.dataset.offset;
      });
    }, 80);
  } catch (e) { toast(e.message, 'error'); }
}
