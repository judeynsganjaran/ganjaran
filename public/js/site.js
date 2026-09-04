// Fungsi ini jalan di SETIAP halaman untuk papar nama laman & logo sekolah
// yang guru tetapkan di Pengurusan Kelas -> Tetapan Laman.
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/site-settings');
    if (!res.ok) return;
    const settings = await res.json();

    const textEl = document.getElementById('siteBrandText');
    if (textEl && settings.siteName) textEl.textContent = settings.siteName;

    const logoEl = document.getElementById('siteBrandLogo');
    const emojiEl = document.getElementById('siteBrandEmoji');
    if (settings.logoUrl) {
      if (logoEl) {
        logoEl.src = settings.logoUrl;
        logoEl.style.display = 'inline-block';
      }
      if (emojiEl) emojiEl.style.display = 'none';
    }
  } catch (e) { /* senyap - guna nilai lalai jika gagal */ }
});
