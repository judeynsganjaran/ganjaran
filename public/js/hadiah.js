let tiersCache = [];

document.addEventListener('DOMContentLoaded', () => {
  loadPoster();
  loadTiers();
});

// ===== POSTER =====

async function loadPoster() {
  try {
    const settings = await API.get('/reward-tiers/settings/poster');
    const display = document.getElementById('posterDisplay');
    if (settings.posterUrl) {
      display.innerHTML = `<div class="poster-frame"><img src="${settings.posterUrl}" alt="Poster Hadiah"></div>`;
    } else {
      display.innerHTML = `<div class="poster-upload-zone"><div style="font-size:44px;">🖼️</div>Belum ada poster hadiah. Upload gambar besar yang tunjukkan sticker apa akan diperoleh.</div>`;
    }
  } catch (e) { toast(e.message, 'error'); }
}

async function uploadPoster() {
  const input = document.getElementById('posterInput');
  const file = input.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('poster', file);
  try {
    await API.put('/reward-tiers/settings/poster', formData, true);
    toast('Poster berjaya dikemaskini! 🎉');
    input.value = '';
    await loadPoster();
  } catch (e) { toast(e.message, 'error'); }
}

// ===== TAHAP / STICKER =====

async function loadTiers() {
  try {
    tiersCache = await API.get('/reward-tiers');
    const grid = document.getElementById('tierGrid');
    grid.innerHTML = tiersCache.map((t) => `
      <div class="tier-manage-card">
        <div class="tier-num">${t.levelNumber}</div>
        <div class="tier-sticker-preview" id="tierPreview-${t._id}">
          ${t.stickerUrl ? `<img src="${t.stickerUrl}" alt="${t.name}">` : `<span class="placeholder-emoji">🎁</span>`}
        </div>
        <input type="text" id="tierName-${t._id}" value="${t.name}" placeholder="Nama tahap">
        <input type="number" id="tierMin-${t._id}" value="${t.minStars}" min="0" placeholder="Nilai bintang minimum">
        <label class="btn btn-secondary btn-sm" style="cursor:pointer; width:100%; display:block; margin-bottom:6px;">
          📤 Upload Sticker
          <input type="file" accept="image/png" style="display:none;" onchange="uploadSticker('${t._id}', this)">
        </label>
        <button class="btn btn-outline btn-sm" style="width:100%;" onclick="saveTierInfo('${t._id}')">💾 Simpan</button>
      </div>
    `).join('');
  } catch (e) { toast(e.message, 'error'); }
}

async function saveTierInfo(tierId) {
  const name = document.getElementById(`tierName-${tierId}`).value.trim();
  const minStars = document.getElementById(`tierMin-${tierId}`).value;
  const formData = new FormData();
  formData.append('name', name);
  formData.append('minStars', minStars);
  try {
    await API.put(`/reward-tiers/${tierId}`, formData, true);
    toast('Tahap dikemaskini! ✅');
    await loadTiers();
  } catch (e) { toast(e.message, 'error'); }
}

async function uploadSticker(tierId, inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('sticker', file);
  try {
    await API.put(`/reward-tiers/${tierId}`, formData, true);
    toast('Sticker berjaya diupload! 🌟');
    await loadTiers();
  } catch (e) { toast(e.message, 'error'); }
}
