const API = {
  base: '/api',

  async get(url) {
    const res = await fetch(this.base + url);
    if (!res.ok) throw new Error((await res.json()).error || 'Ralat');
    return res.json();
  },
  async post(url, data, isForm = false) {
    const opts = { method: 'POST' };
    if (isForm) {
      opts.body = data;
    } else {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(data);
    }
    const res = await fetch(this.base + url, opts);
    if (!res.ok) throw new Error((await res.json()).error || 'Ralat');
    return res.json();
  },
  async put(url, data, isForm = false) {
    const opts = { method: 'PUT' };
    if (isForm) {
      opts.body = data;
    } else {
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(data);
    }
    const res = await fetch(this.base + url, opts);
    if (!res.ok) throw new Error((await res.json()).error || 'Ralat');
    return res.json();
  },
  async patch(url, data) {
    const res = await fetch(this.base + url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Ralat');
    return res.json();
  },
  async delete(url) {
    const res = await fetch(this.base + url, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).error || 'Ralat');
    return res.json();
  }
};

const CARD_COLORS = ['#FF6FA5', '#5CC8FF', '#FFA45C', '#6BE6A6', '#B18CFF', '#FF9E9E', '#5CE1E6'];
function randomColor() {
  return CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
}

function placeholderSVG() {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#FFE8A3"/><text x="50" y="60" font-size="40" text-anchor="middle">🙂</text></svg>
  `);
}

// Icon bintang generik (SVG dalaman - bukan gambar/sticker berhakcipta)
function starIconSVG(size = 20) {
  return `<svg class="star-icon-svg" width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 L14.9 8.6 L22 9.3 L16.7 14.1 L18.3 21.2 L12 17.4 L5.7 21.2 L7.3 14.1 L2 9.3 L9.1 8.6 Z"
      fill="#FFD75C" stroke="#4A3B52" stroke-width="1.2" stroke-linejoin="round"/>
  </svg>`;
}

function toast(msg, type = 'success') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: ${type === 'success' ? '#6BE6A6' : '#FF6B6B'}; color: #fff;
      padding: 13px 26px; border-radius: 999px; font-family: 'Fredoka', sans-serif;
      font-weight: 600; box-shadow: 0 6px 18px rgba(0,0,0,0.2); z-index: 3000;
      opacity: 0; transition: opacity .3s, transform .3s;`;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = type === 'success' ? '#6BE6A6' : '#FF6B6B';
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateX(-50%) translateY(-6px)'; });
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(0)';
  }, 2200);
}
