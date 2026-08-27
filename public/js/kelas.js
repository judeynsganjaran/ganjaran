let currentClasses = [];
let activeClassId = null;
let editingClassId = null;
let editingStudentId = null;

document.addEventListener('DOMContentLoaded', loadClasses);

async function loadClasses() {
  try {
    currentClasses = await API.get('/classes');
    const grid = document.getElementById('classGrid');
    if (currentClasses.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="emoji">🏫</div>Belum ada kelas. Cipta kelas pertama anda!</div>`;
      return;
    }
    // dapatkan bilangan murid setiap kelas
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
}

function backToClassList() {
  document.getElementById('viewKelasList').style.display = 'block';
  document.getElementById('viewClassDetail').style.display = 'none';
  loadClasses();
}

async function loadStudents() {
  try {
    const students = await API.get(`/classes/${activeClassId}/students`);
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
    window.__studentsCache = students;
  } catch (e) { toast(e.message, 'error'); }
}

function placeholderSVG() {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#FFE8A3"/><text x="50" y="60" font-size="40" text-anchor="middle">🙂</text></svg>
  `);
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
  const student = (window.__studentsCache || []).find((s) => s._id === studentId);
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
