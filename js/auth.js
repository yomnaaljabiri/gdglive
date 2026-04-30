/* ===== Auth — Login/Register ===== */
document.addEventListener('DOMContentLoaded', () => {
  initAuthTabs();
  initAuthForms();
});

function initAuthTabs() {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      // Update tabs
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      // Update forms
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      const form = document.getElementById(target + 'FormEl');
      if (form) form.classList.add('active');
    });
  });
}

function initAuthForms() {
  const loginForm = document.getElementById('loginFormEl');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();
    });
  }
  const registerForm = document.getElementById('registerFormEl');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleRegister();
    });
  }
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) {
    showAuthError(isEn() ? 'Please fill all fields' : 'يرجى ملء جميع الحقول');
    return;
  }
  
  try {
    const res = await fetch('http://127.0.0.1:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (data.success) {
      localStorage.setItem('agriroots-session', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      showAuthError(isEn() ? data.message : 'بيانات الدخول غير صحيحة');
    }
  } catch (e) {
    console.error(e);
    // Fallback to demo mode if server is down
    const demoUser = { name: email.split('@')[0], email: email, farm: isEn() ? 'My Farm' : 'مزرعتي' };
    localStorage.setItem('agriroots-session', JSON.stringify(demoUser));
    window.location.href = 'dashboard.html';
  }
}

async function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const farm = document.getElementById('regFarm').value.trim() || (isEn() ? 'My Farm' : 'مزرعتي');
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  
  if (!name || !email || !password) {
    showAuthError(isEn() ? 'Please fill required fields' : 'يرجى ملء الحقول المطلوبة');
    return;
  }
  
  try {
    const res = await fetch('http://127.0.0.1:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, farm })
    });
    const data = await res.json();
    
    if (data.success) {
      localStorage.setItem('agriroots-session', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      showAuthError(isEn() ? data.message : 'البريد الإلكتروني مسجل مسبقاً');
    }
  } catch (e) {
    console.error(e);
    showAuthError(isEn() ? 'Server error' : 'حدث خطأ في الاتصال بالخادم');
  }
}

function showAuthError(msg) {
  let el = document.getElementById('authError');
  if (!el) {
    el = document.createElement('div');
    el.id = 'authError';
    el.style.cssText = 'padding:12px 16px;background:#FFEBEE;color:#C62828;border-radius:8px;font-size:14px;font-weight:600;margin-bottom:16px;animation:shake .5s ease';
    const forms = document.querySelector('.auth-card');
    if (forms) forms.insertBefore(el, forms.querySelector('.auth-tabs'));
  }
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

function checkSession() {
  const session = localStorage.getItem('agriroots-session');
  return session ? JSON.parse(session) : null;
}

function logout() {
  localStorage.removeItem('agriroots-session');
  window.location.href = 'login.html';
}
