let lbClasses = [];
let lbSelectedClassId = null;
let rewardTiers = [];
let currentStudents = []; // cache murid semasa untuk update pantas (optimistic)

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

async function lbSelectClass(classId) {
  lbSelectedClassId = classId;
  document.querySelectorAll('.class-chip').forEach((el) => el.classList.remove('active'));
  const chip = document.getElementById(`lbchip-${classId}`);
  if (chip) chip.classList.add('active');
  document.getElementById('studentSearchInput').value = '';
  await loadIndividu(classId);
}

// ===== SENARAI MURID: kad + counter bintang + grid sticker =====

async function loadIndividu(classId) {
  try {
    currentStudents = await API.get(`/leaderboard/individu/${classId}`);
    renderIndividuList();
  } catch (e) { toast(e.message, 'error'); }
}

function renderIndividuList() {
  const list = document.getElementById('individuList');
  if (currentStudents.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="emoji">👦👧</div>Tiada murid dalam kelas ini.</div>`;
    return;
  }
  list.innerHTML = currentStudents.map((s, i) => {
    const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
    const currentTier = getCurrentTier(s.points);
    return `
    <div class="student-reward-card ${rankClass}" id="src-${s._id}" data-name="${s.name.toLowerCase()}">
      <div class="src-header">
        <div class="src-rank">${i + 1}</div>
        <img class="src-photo" src="${s.photo || placeholderSVG()}" alt="${s.name}">
        <div class="src-name">
          ${s.name}
          ${currentTier ? `<div class="src-level-badge">🏅 Tahap ${currentTier.levelNumber}${currentTier.name ? ' — ' + currentTier.name : ''}</div>` : ''}
        </div>
        <div class="star-counter">
          <button class="star-add-btn star-remove-btn" title="Kurang bintang" onclick="addPoint('${s._id}', -1)">➖</button>
          ${starIconSVG(30)}
          <span class="count" id="count-${s._id}">${s.points}</span>
          <button class="star-add-btn" title="Tambah bintang" onclick="addPoint('${s._id}', 1)">➕</button>
        </div>
      </div>
      <div id="stickers-${s._id}">${renderStickerGrid(s.points)}</div>
    </div>`;
  }).join('');
}

function getCurrentTier(points) {
  const eligible = rewardTiers.filter((t) => points >= t.minStars);
  if (eligible.length === 0) return null;
  return eligible.reduce((a, b) => (b.levelNumber > a.levelNumber ? b : a));
}

function renderStickerGrid(points) {
  const tiers = rewardTiers.slice(0, 12);
  return `<div class="sticker-grid">
    ${tiers.map((t) => {
      const unlocked = points >= t.minStars;
      if (unlocked && t.stickerUrl) {
        return `<div class="sticker-slot">
          <span class="tier-level-badge">${t.levelNumber}</span>
          <img src="${t.stickerUrl}" alt="${t.name}" title="${t.name} (${t.minStars}+ ⭐)">
        </div>`;
      }
      return `<div class="sticker-slot ${unlocked ? '' : 'locked'}">
        <span class="tier-level-badge">${t.levelNumber}</span>
        <span class="tier-label">${t.minStars}+ ⭐</span>
      </div>`;
    }).join('')}
  </div>`;
}

// ===== TAMBAH/KURANG BINTANG - KEMASKINI SERTA-MERTA (optimistic, tiada delay) =====

function addPoint(studentId, delta) {
  const student = currentStudents.find((s) => s._id === studentId);
  if (!student) return;

  // 1) Kemaskini paparan SERTA-MERTA di skrin (tanpa tunggu server)
  student.points = Math.max(0, student.points + delta);
  document.getElementById(`count-${studentId}`).textContent = student.points;
  document.getElementById(`stickers-${studentId}`).innerHTML = renderStickerGrid(student.points);

  if (delta > 0) playStarChime();

  // 2) Hantar ke server di latar belakang (tidak menyekat UI)
  API.patch(`/leaderboard/student/${studentId}/point`, { delta })
    .then(() => {
      // Selaraskan susunan kedudukan secara senyap selepas server sahkan
      loadIndividu(lbSelectedClassId);
    })
    .catch((e) => {
      toast(e.message, 'error');
      // kembalikan nilai asal jika gagal
      student.points = Math.max(0, student.points - delta);
      document.getElementById(`count-${studentId}`).textContent = student.points;
      document.getElementById(`stickers-${studentId}`).innerHTML = renderStickerGrid(student.points);
    });
}

// ===== SEARCH: cari nama, scroll & kelipkan =====

let searchDebounceTimer = null;
function handleSearch() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(runSearch, 120);
}

function runSearch() {
  const query = document.getElementById('studentSearchInput').value.trim().toLowerCase();
  document.querySelectorAll('.student-reward-card').forEach((el) => el.classList.remove('search-blink'));
  if (!query) return;

  const match = currentStudents.find((s) => s.name.toLowerCase().includes(query));
  if (!match) return;

  const el = document.getElementById(`src-${match._id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('search-blink');
  setTimeout(() => el.classList.remove('search-blink'), 1800);
}
