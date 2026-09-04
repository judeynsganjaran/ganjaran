let allClasses = [];
let selectedClassId = null;

document.addEventListener('DOMContentLoaded', loadClassesForSelector);

async function loadClassesForSelector() {
  try {
    allClasses = await API.get('/classes');
    const sel = document.getElementById('classSelector');
    if (allClasses.length === 0) {
      sel.innerHTML = `<div class="empty-state" style="width:100%"><div class="emoji">🏫</div>Belum ada kelas. Sila cipta kelas dahulu di Pengurusan Kelas.</div>`;
      return;
    }
    sel.innerHTML = allClasses.map((c) => `
      <div class="class-chip" id="chip-${c._id}" onclick="selectClass('${c._id}')">${c.name}</div>
    `).join('');
    selectClass(allClasses[0]._id);
  } catch (e) { toast(e.message, 'error'); }
}

async function selectClass(classId) {
  selectedClassId = classId;
  document.querySelectorAll('.class-chip').forEach((el) => el.classList.remove('active'));
  const chip = document.getElementById(`chip-${classId}`);
  if (chip) chip.classList.add('active');
  document.getElementById('groupSection').style.display = 'block';
  await loadGroups();
}

async function loadGroups() {
  try {
    const groups = await API.get(`/groups/class/${selectedClassId}`);
    const grid = document.getElementById('groupGrid');
    if (groups.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">👨‍👩‍👧‍👦</div>Belum ada kumpulan untuk kelas ini. Pergi ke Pengurusan Kelas untuk cipta kumpulan.</div>`;
      return;
    }
    grid.innerHTML = groups.map((g) => {
      const memberPoints = g.members.reduce((sum, m) => sum + (m.points || 0), 0);
      const total = memberPoints + (g.bonusPoints || 0);
      return `
      <div class="card" style="border-top: 6px solid ${g.color || '#5CC8FF'};">
        <div style="display:flex; gap:14px; align-items:center; margin-bottom:14px;">
          <img src="${g.photo || placeholderSVG()}" style="width:64px;height:64px;border-radius:16px;object-fit:cover;background:#f2f2f2;flex-shrink:0;">
          <div style="flex:1; min-width:0;">
            <div style="font-weight:800; font-size:19px; font-family:'Baloo 2';">${g.name}</div>
            <div style="font-size:13px; opacity:.65;">👥 ${g.members.length} ahli</div>
          </div>
          <div style="text-align:center; background:#FFF7EE; border-radius:14px; padding:8px 14px;">
            <div style="display:flex; align-items:center; gap:4px; justify-content:center;">${starIconSVG(20)}<span style="font-weight:800; font-size:26px; font-family:'Baloo 2';">${total}</span></div>
            <div style="font-size:10px; opacity:.6;">JUMLAH BINTANG</div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${g.members.map((m) => `
            <div style="display:flex; align-items:center; gap:10px; background:#F7F4FB; padding:8px 10px; border-radius:12px;">
              <img src="${m.photo || placeholderSVG()}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;">
              <span style="font-weight:600; font-size:14px; flex:1;">${m.name}${m._id === g.leaderId ? '<span class="leader-tag">Ketua Kumpulan</span>' : ''}</span>
              <span style="display:flex; align-items:center; gap:3px; font-weight:700; font-size:13px; color:var(--dark);">${starIconSVG(14)}${m.points || 0}</span>
            </div>
          `).join('') || '<div style="opacity:.5; font-size:13px; padding:8px;">Belum ada ahli</div>'}
        </div>
      </div>`;
    }).join('');
  } catch (e) { toast(e.message, 'error'); }
}
