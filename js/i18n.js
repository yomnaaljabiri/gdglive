/* ===== i18n — Language System ===== */
function initLang() {
  const saved = localStorage.getItem('agriroots-lang');
  if (saved === 'en') {
    document.body.classList.add('en');
  }
  updateLangUI();
}

function toggleLang() {
  document.body.classList.toggle('en');
  const isEn = document.body.classList.contains('en');
  localStorage.setItem('agriroots-lang', isEn ? 'en' : 'ar');
  updateLangUI();
  // Dispatch event for other scripts
  window.dispatchEvent(new CustomEvent('langChange', { detail: { lang: isEn ? 'en' : 'ar' } }));
}

function updateLangUI() {
  const isEn = document.body.classList.contains('en');
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.textContent = isEn ? 'AR' : 'EN';
  });
  document.documentElement.lang = isEn ? 'en' : 'ar';
  // Update placeholders
  document.querySelectorAll('[data-placeholder-ar]').forEach(el => {
    el.placeholder = isEn ? el.dataset.placeholderEn : el.dataset.placeholderAr;
  });
}

function t(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return document.body.classList.contains('en') ? obj.en : obj.ar;
}

function isEn() {
  return document.body.classList.contains('en');
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', initLang);
