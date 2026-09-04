let currentClasses = [];
let activeClassId = null;
let editingClassId = null;
let editingStudentId = null;
let editingGroupId = null;
let activeClassStudents = [];

document.addEventListener('DOMContentLoaded', () => {
  loadClasses();
  loadSiteSettings();
});

// ===== TETAPAN LAMAN =====

async function loadSiteSettings() {
  try {
    const settings = await API.get('/site-settings');
    document.getElementById('siteNameInput').value = settings.siteName || '';
    if (settings.logoUrl) {
      const preview = document.getElementById('logoPreview');
      preview.src = settings.logoUrl;
      preview.style.display = 'block';
    }
  } catch (e) { /* senyap */ }
}

async function saveSiteSettings() {
  const siteName = document.getElementById('siteNameInput').value.trim();
  const logoFile = document.getElementById('siteLogoInput').files[0];
  const formData = new FormData();
  if (siteName) formData.append('siteName', siteName);
  if (logoFile) formData.append('logo', logoFile);
  try {
    await API.put('/site-settings', formData, true);
    toast('Tetapan laman dikemaskini! ✅');
    await loadSiteSettings();
  } catch (e) { toast(e.message, 'error'); }
}

// ===== EKSPORT =====

function exportWordBackup() {
  toast('Sedang menyediakan fail... ⏳');
  window.location.href = '/api/export/word';
}

// ===== KELAS =====

async function loadClasses() {
  try {
    currentClasses = await API.get('/classes');
    const grid = document.getElementById('classGrid');
    if (currentClasses.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">🏫</div>Belum ada kelas. Cipta kelas pertama anda!</div>`;
      return;
    }
    const counts = await Promise.all(currentClasses.map((c) => API.get(`/classes/${c._id}/students`)));
    grid.innerHTML = currentClasses.map((c, i) => `
      <div class="class-card" style="background:${c.color || randomColor()}" onclick="openClassDetail('${c._id}')">
        <div>
          <div class="class-name">${c.name}</div>
          <div class="class-count">👦👧 ${counts[i].length} murid</div>
        </div>
        <div class="emoji-decor">🎈</div>
      </div>
    `).join('');
  } catch (e) { toast(e.message, 'error'); }
}

function openClassModal() {
  editingClassId = null;
  document.getElementById('classModalTitle').textContent = 'Cipta Kelas Baru 🏫';
  document.getElementById('classNameInput').value = '';
  document.getElementById('classModal').classList.add('show');
}

function openEditClassModal() {
  editingClassId = activeClassId;
  const cls = currentClasses.find((c) => c._id === activeClassId);
  document.getElementById('classModalTitle').textContent = 'Sunting Nama Kelas ✏️';
  document.getElementById('classNameInput').value = cls ? cls.name : '';
  document.getElementById('classModal').classList.add('show');
}

async function saveClass() {
  const name = document.getElementById('classNameInput').value.trim();
  if (!name) return toast('Sila isi nama kelas', 'error');
  try {
    if (editingClassId) {
      await API.put(`/classes/${editingClassId}`, { name });
      toast('Kelas dikemaskini! ✅');
      document.getElementById('detailClassName').textContent = '🏫 ' + name;
    } else {
      await API.post('/classes', { name, color: randomColor() });
      toast('Kelas berjaya dicipta! 🎉');
    }
    closeModal('classModal');
    await loadClasses();
  } catch (e) { toast(e.message, 'error'); }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

async function openClassDetail(classId) {
  activeClassId = classId;
  const cls = currentClasses.find((c) => c._id === classId);
  document.getElementById('detailClassName').textContent = '🏫 ' + (cls ? cls.name : '');
  document.getElementById('viewKelasList').style.display = 'none';
  document.getElementById('viewClassDetail').style.display = 'block';
  await loadStudents();
  await loadSpinImages();
  await loadGroupsManage();
}

function backToClassList() {
  document.getElementById('viewKelasList').style.display = 'block';
  document.getElementById('viewClassDetail').style.display = 'none';
  loadClasses();
}

// ===== MURID =====

async function loadStudents() {
  try {
    const students = await API.get(`/classes/${activeClassId}/students`);
    activeClassStudents = students;
    const grid = document.getElementById('studentGrid');
    if (students.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">👦👧</div>Belum ada murid. Tambah murid pertama!</div>`;
      return;
    }
    grid.innerHTML = students.map((s) => `
      <div class="student-card">
        <div class="card-actions">
          <button class="btn btn-icon btn-sm btn-outline" title="Sunting" onclick="openEditStudentModal('${s._id}')">✏️</button>
          <button class="btn btn-icon btn-sm btn-danger" title="Padam" onclick="deleteStudent('${s._id}')">🗑️</button>
        </div>
        <img class="student-photo" src="${s.photo || placeholderSVG()}" alt="${s.name}">
        <div class="student-name">${s.name}</div>
      </div>
    `).join('');
  } catch (e) { toast(e.message, 'error'); }
}

function openStudentModal() {
  editingStudentId = null;
  document.getElementById('studentModalTitle').textContent = 'Tambah Murid ➕';
  document.getElementById('studentNameInput').value = '';
  document.getElementById('studentPhotoInput').value = '';
  document.getElementById('studentModal').classList.add('show');
}

function openEditStudentModal(studentId) {
  editingStudentId = studentId;
  const student = activeClassStudents.find((s) => s._id === studentId);
  document.getElementById('studentModalTitle').textContent = 'Sunting Murid ✏️';
  document.getElementById('studentNameInput').value = student ? student.name : '';
  document.getElementById('studentPhotoInput').value = '';
  document.getElementById('studentModal').classList.add('show');
}

async function saveStudent() {
  const name = document.getElementById('studentNameInput').value.trim();
  const photoFile = document.getElementById('studentPhotoInput').files[0];
  if (!name) return toast('Sila isi nama murid', 'error');

  const formData = new FormData();
  formData.append('name', name);
  if (photoFile) formData.append('photo', photoFile);

  try {
    if (editingStudentId) {
      await API.put(`/classes/students/${editingStudentId}`, formData, true);
      toast('Murid dikemaskini! ✅');
    } else {
      await API.post(`/classes/${activeClassId}/students`, formData, true);
      toast('Murid berjaya ditambah! 🎉');
    }
    closeModal('studentModal');
    await loadStudents();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteStudent(studentId) {
  if (!confirm('Padam murid ini?')) return;
  try {
    await API.delete(`/classes/students/${studentId}`);
    toast('Murid dipadam');
    await loadStudents();
  } catch (e) { toast(e.message, 'error'); }
}

// ===== SET GAMBAR SPIN WHEEL =====

async function loadSpinImages() {
  try {
    const images = await API.get(`/spin-images/${activeClassId}`);
    const grid = document.getElementById('spinImageGrid');
    if (images.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1; padding:24px;"><div class="emoji">🎡</div>Belum ada gambar spin wheel untuk kelas ini.</div>`;
      document.getElementById('spinUploadStatus').textContent = '';
      return;
    }
    document.getElementById('spinUploadStatus').textContent = `${images.length} gambar dalam set`;
    grid.innerHTML = images.map((img) => `
      <div style="position:relative;">
        <img src="${img.imageUrl}" style="width:100%; aspect-ratio:16/10; object-fit:cover; border-radius:14px; box-shadow: var(--shadow);">
        <button class="btn btn-icon btn-sm btn-danger" style="position:absolute; top:6px; right:6px;" title="Padam" onclick="deleteSpinImage('${img._id}')">🗑️</button>
      </div>
    `).join('');
  } catch (e) { toast(e.message, 'error'); }
}

async function uploadSpinImages() {
  const input = document.getElementById('spinBulkInput');
  const files = input.files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  Array.from(files).forEach((f) => formData.append('images', f));

  document.getElementById('spinUploadStatus').textContent = `Sedang upload ${files.length} gambar... ⏳`;
  try {
    await API.post(`/spin-images/${activeClassId}/upload`, formData, true);
    toast(`${files.length} gambar berjaya diupload! 🎉`);
    input.value = '';
    await loadSpinImages();
  } catch (e) {
    toast(e.message, 'error');
    document.getElementById('spinUploadStatus').textContent = '';
  }
}

async function deleteSpinImage(imageId) {
  if (!confirm('Padam gambar ini?')) return;
  try {
    await API.delete(`/spin-images/${imageId}`);
    toast('Gambar dipadam');
    await loadSpinImages();
  } catch (e) { toast(e.message, 'error'); }
}

async function clearSpinImages() {
  if (!confirm('Padam SEMUA gambar spin wheel untuk kelas ini? Tindakan ini tidak boleh diundur.')) return;
  try {
    await API.delete(`/spin-images/class/${activeClassId}/clear`);
    toast('Semua gambar dikosongkan');
    await loadSpinImages();
  } catch (e) { toast(e.message, 'error'); }
}

// ===== URUS KUMPULAN =====

async function loadGroupsManage() {
  try {
    const groups = await API.get(`/groups/class/${activeClassId}`);
    const grid = document.getElementById('groupManageGrid');
    if (groups.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">👨‍👩‍👧‍👦</div>Belum ada kumpulan untuk kelas ini.</div>`;
      return;
    }
    grid.innerHTML = groups.map((g) => {
      const memberPoints = g.members.reduce((sum, m) => sum + (m.points || 0), 0);
      const total = memberPoints + (g.bonusPoints || 0);
      return `
      <div class="card" style="border-top: 6px solid ${g.color || '#5CC8FF'}; margin-bottom:0;">
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:10px;">
          <img src="${g.photo || placeholderSVG()}" style="width:48px;height:48px;border-radius:12px;object-fit:cover;background:#f2f2f2;flex-shrink:0;">
          <div style="flex:1; min-width:0;">
            <div style="font-weight:800; font-size:16px; font-family:'Baloo 2';">${g.name}</div>
            <div style="font-size:12px; opacity:.65;">👥 ${g.members.length} ahli · ${starIconSVG(12)} ${total} bintang</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:#EAF7FF; padding:6px 10px; border-radius:12px; margin-bottom:10px;">
          <span style="font-size:12px; font-weight:600;">➕ Bonus: <b>${g.bonusPoints || 0}</b></span>
          <div style="display:flex; gap:6px;">
            <button class="star-add-btn star-remove-btn" onclick="adjustGroupBonus('${g._id}', -1)">➖</button>
            <button class="star-add-btn" onclick="adjustGroupBonus('${g._id}', 1)">➕</button>
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

async function adjustGroupBonus(groupId, delta) {
  try {
    await API.patch(`/groups/${groupId}/point`, { delta });
    await loadGroupsManage();
  } catch (e) { toast(e.message, 'error'); }
}

function renderStudentCheckList(selectedIds = []) {
  const container = document.getElementById('studentCheckList');
  if (activeClassStudents.length === 0) {
    container.innerHTML = `<div style="padding:10px; opacity:.6;">Tiada murid dalam kelas ini.</div>`;
    return;
  }
  container.innerHTML = activeClassStudents.map((s) => `
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
  const groups = await API.get(`/groups/class/${activeClassId}`);
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
      formData.append('classId', activeClassId);
      formData.append('color', randomColor());
      await API.post('/groups', formData, true);
      toast('Kumpulan berjaya dicipta! 🎉');
    }
    closeModal('groupModal');
    await loadGroupsManage();
  } catch (e) { toast(e.message, 'error'); }
}

async function deleteGroup(groupId) {
  if (!confirm('Padam kumpulan ini?')) return;
  try {
    await API.delete(`/groups/${groupId}`);
    toast('Kumpulan dipadam');
    await loadGroupsManage();
  } catch (e) { toast(e.message, 'error'); }
}
