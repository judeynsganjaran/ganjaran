let allClasses = [];
let selectedClassId = null;
let classStudents = [];
let editingGroupId = null;

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
  classStudents = await API.get(`/classes/${classId}/students`);
  await loadGroups();
}

async function loadGroups() {
  try {
    const groups = await API.get(`/groups/class/${selectedClassId}`);
    const grid = document.getElementById('groupGrid');
    if (groups.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">👨‍👩‍👧‍👦</div>Belum ada kumpulan untuk kelas ini.</div>`;
      return;
    }
    grid.innerHTML = groups.map((g) => {
      const memberPoints = g.members.reduce((sum, m) => sum + (m.points || 0), 0);
      const total = memberPoints + (g.bonusPoints || 0);
      const leader = g.members.find((m) => m._id === g.leaderId) || null;
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

        ${leader ? `
        <div style="display:flex; align-items:center; gap:8px; background:#FFF3D6; padding:8px 12px; border-radius:12px; margin-bottom:12px;">
          <span style="font-size:18px;">👑</span>
          <img src="${leader.photo || placeholderSVG()}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
          <span style="font-weight:700; font-size:14px;">${leader.name}</span>
          <span style="font-size:11px; opacity:.6; margin-left:auto;">Ketua Kumpulan</span>
        </div>` : ''}

        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:14px;">
          ${g.members.map((m) => `
            <div style="display:flex; align-items:center; gap:10px; background:#F7F4FB; padding:8px 10px; border-radius:12px;">
              <img src="${m.photo || placeholderSVG()}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;">
              <span style="font-weight:600; font-size:14px; flex:1;">${m.name}${m._id === g.leaderId ? ' 👑' : ''}</span>
              <span style="display:flex; align-items:center; gap:3px; font-weight:700; font-size:13px; color:var(--dark);">${starIconSVG(14)}${m.points || 0}</span>
            </div>
          `).join('') || '<div style="opacity:.5; font-size:13px; padding:8px;">Belum ada ahli</div>'}
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:#EAF7FF; padding:8px 12px; border-radius:12px; margin-bottom:12px;">
          <span style="font-size:12px; font-weight:600;">➕ Mata Bonus Kumpulan: <b>${g.bonusPoints || 0}</b></span>
          <div style="display:flex; gap:6px;">
            <button class="star-add-btn star-remove-btn" onclick="adjustBonus('${g._id}', -1)">➖</button>
            <button class="star-add-btn" onclick="adjustBonus('${g._id}', 1)">➕</button>
          </div>
        </div>

        <div style="display:flex; gap:6px;">
          <button class="btn btn-sm btn-outline" style="flex:1;" onclick="openEditGroupModal('${g._id}')">✏️ Sunting</button>
          <button class="btn btn-sm btn-danger" onclick="deleteGroup('${g._id}')">🗑️</button>
        </div>
      </div>`;
    }).join('');
  } catch (e) { toast(e.message, 'error'); }
}

async function adjustBonus(groupId, delta) {
  try {
    await API.patch(`/groups/${groupId}/point`, { delta });
    await loadGroups();
  } catch (e) { toast(e.message, 'error'); }
}

function renderStudentCheckList(selectedIds = []) {
  const container = document.getElementById('studentCheckList');
  if (classStudents.length === 0) {
    container.innerHTML = `<div style="padding:10px; opacity:.6;">Tiada murid dalam kelas ini.</div>`;
    return;
  }
  container.innerHTML = classStudents.map((s) => `
    <label class="checkbox-item">
      <input type="checkbox" class="member-checkbox" value="${s._id}" data-name="${s.name}" ${selectedIds.includes(s._id) ? 'checked' : ''} onchange="refreshLeaderOptions()">
      <img src="${s.photo || placeholderSVG()}">
      <span>${s.name}</span>
    </label>
  `).join('');
  refreshLeaderOptions();
}

function refreshLeaderOptions(preserveLeaderId) {
  const select = document.getElementById('groupLeaderSelect');
  const currentValue = preserveLeaderId !== undefined ? preserveLeaderId : select.value;
  const checked = Array.from(document.querySelectorAll('.member-checkbox:checked'));
  select.innerHTML = `<option value="">-- Tiada Ketua --</option>` +
    checked.map((c) => `<option value="${c.value}">${c.dataset.name}</option>`).join('');
  if (checked.some((c) => c.value === currentValue)) select.value = currentValue;
}

function openGroupModal() {
  editingGroupId = null;
  document.getElementById('groupModalTitle').textContent = 'Cipta Kumpulan Baru 👨‍👩‍👧‍👦';
  document.getElementById('groupNameInput').value = '';
  document.getElementById('groupPhotoInput').value = '';
  renderStudentCheckList([]);
  document.getElementById('groupModal').classList.add('show');
}

async function openEditGroupModal(groupId) {
  editingGroupId = groupId;
  const groups = await API.get(`/groups/class/${selectedClassId}`);
  const group = groups.find((g) => g._id === groupId);
  document.getElementById('groupModalTitle').textContent = 'Sunting Kumpulan ✏️';
  document.getElementById('groupNameInput').value = group ? group.name : '';
  document.getElementById('groupPhotoInput').value = '';
  renderStudentCheckList(group ? group.members.map((m) => m._id) : []);
  refreshLeaderOptions(group ? (group.leaderId || '') : '');
  document.getElementById('groupModal').classList.add('show');
}

async function saveGroup() {
  const name = document.getElementById('groupNameInput').value.trim();
  if (!name) return toast('Sila isi nama kumpulan', 'error');
  const checked = Array.from(document.querySelectorAll('.member-checkbox:checked')).map((el) => el.value);
  const leaderId = document.getElementById('groupLeaderSelect').value;
  const photoFile = document.getElementById('groupPhotoInput').files[0];

  const formData = new FormData();
  formData.append('name', name);
  formData.append('members', JSON.stringify(checked));
  formData.append('leaderId', leaderId);
  if (photoFile) formData.append('photo', photoFile);

  try {
    if (editingGroupId) {
      await API.put(`/groups/${editingGroupId}`, formData, true);
      toast('Kumpulan dikemaskini! ✅');
    } else {
      formData.append('classId', selectedClassId);
      formData.append('color', randomColor());
      await API.post('/groups', formData, true);
      toast('Kumpulan berjaya dicipta! 🎉');
    }
    closeModal('groupModal');
    await loadGroups();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteGroup(groupId) {
  if (!confirm('Padam kumpulan ini?')) return;
  try {
    await API.delete(`/groups/${groupId}`);
    toast('Kumpulan dipadam');
    await loadGroups();
  } catch (e) { toast(e.message, 'error'); }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}
