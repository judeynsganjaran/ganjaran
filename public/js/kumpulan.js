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
    // auto-pilih kelas pertama
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
    grid.innerHTML = groups.map((g) => `
      <div class="class-card" style="background:${g.color || '#5CC8FF'}">
        <div>
          <div class="class-name">${g.name}</div>
          <div class="class-count">👥 ${g.members.length} ahli</div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">
            ${g.members.slice(0, 6).map((m) => `<img src="${m.photo || placeholderSVG()}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid #fff;" title="${m.name}">`).join('')}
            ${g.members.length > 6 ? `<span style="color:#fff;font-size:12px;align-self:center;">+${g.members.length - 6}</span>` : ''}
          </div>
        </div>
        <div style="display:flex; gap:6px; margin-top:14px;">
          <button class="btn btn-sm btn-outline" onclick="openEditGroupModal('${g._id}')">✏️ Sunting</button>
          <button class="btn btn-sm btn-danger" onclick="deleteGroup('${g._id}')">🗑️</button>
        </div>
      </div>
    `).join('');
  } catch (e) { toast(e.message, 'error'); }
}

function placeholderSVG() {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#FFE8A3"/><text x="50" y="60" font-size="40" text-anchor="middle">🙂</text></svg>
  `);
}

function renderStudentCheckList(selectedIds = []) {
  const container = document.getElementById('studentCheckList');
  if (classStudents.length === 0) {
    container.innerHTML = `<div style="padding:10px; opacity:.6;">Tiada murid dalam kelas ini.</div>`;
    return;
  }
  container.innerHTML = classStudents.map((s) => `
    <label class="checkbox-item">
      <input type="checkbox" value="${s._id}" ${selectedIds.includes(s._id) ? 'checked' : ''}>
      <img src="${s.photo || placeholderSVG()}">
      <span>${s.name}</span>
    </label>
  `).join('');
}

function openGroupModal() {
  editingGroupId = null;
  document.getElementById('groupModalTitle').textContent = 'Cipta Kumpulan Baru 👨‍👩‍👧‍👦';
  document.getElementById('groupNameInput').value = '';
  renderStudentCheckList([]);
  document.getElementById('groupModal').classList.add('show');
}

async function openEditGroupModal(groupId) {
  editingGroupId = groupId;
  const groups = await API.get(`/groups/class/${selectedClassId}`);
  const group = groups.find((g) => g._id === groupId);
  document.getElementById('groupModalTitle').textContent = 'Sunting Kumpulan ✏️';
  document.getElementById('groupNameInput').value = group ? group.name : '';
  renderStudentCheckList(group ? group.members.map((m) => m._id) : []);
  document.getElementById('groupModal').classList.add('show');
}

async function saveGroup() {
  const name = document.getElementById('groupNameInput').value.trim();
  if (!name) return toast('Sila isi nama kumpulan', 'error');
  const checked = Array.from(document.querySelectorAll('#studentCheckList input:checked')).map((el) => el.value);

  try {
    if (editingGroupId) {
      await API.put(`/groups/${editingGroupId}`, { name, members: checked });
      toast('Kumpulan dikemaskini! ✅');
    } else {
      await API.post('/groups', { name, classId: selectedClassId, members: checked, color: randomColor() });
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
