/* ===== Dashboard JS ===== */

/* ===== DATA ===== */
let animals = [];

// We will fetch animals from the server

const typeEmoji = { cow: '🐄', bull: '🐂', sheep: '🐑', goat: '🐐' };

const requiredVaccines = {
  cow: [
    { id: 'fmd', name: { ar: 'حمى قلاعية', en: 'FMD' } },
    { id: 'brucella', name: { ar: 'بروسيلا', en: 'Brucella' } },
    { id: 'rabies', name: { ar: 'سعار', en: 'Rabies' } },
    { id: 'lumpy_skin', name: { ar: 'التهاب الجلد العقدي', en: 'Lumpy Skin' } }
  ],
  bull: [
    { id: 'fmd', name: { ar: 'حمى قلاعية', en: 'FMD' } },
    { id: 'brucella', name: { ar: 'بروسيلا', en: 'Brucella' } },
    { id: 'rabies', name: { ar: 'سعار', en: 'Rabies' } }
  ],
  sheep: [
    { id: 'fmd', name: { ar: 'حمى قلاعية', en: 'FMD' } },
    { id: 'brucella', name: { ar: 'بروسيلا', en: 'Brucella' } },
    { id: 'ppr', name: { ar: 'طاعون المجترات', en: 'PPR' } },
    { id: 'pox', name: { ar: 'جدري الأغنام', en: 'Sheep Pox' } }
  ],
  goat: [
    { id: 'fmd', name: { ar: 'حمى قلاعية', en: 'FMD' } },
    { id: 'brucella', name: { ar: 'بروسيلا', en: 'Brucella' } },
    { id: 'ppr', name: { ar: 'طاعون المجترات', en: 'PPR' } },
    { id: 'pox', name: { ar: 'جدري الماعز', en: 'Goat Pox' } }
  ]
};

const diseases = {
  ar: {
    'حرارة|سخونة|حمى': 'يبدو أن الحيوان يعاني من ارتفاع في الحرارة. الأسباب المحتملة: عدوى بكتيرية، حمى قلاعية، أو التهاب رئوي.\n\n🔹 نصائح أولية:\n- عزل الحيوان فوراً\n- توفير ماء بارد\n- قياس الحرارة بدقة\n\n⚠️ يُنصح بالتواصل مع طبيب بيطري خلال 24 ساعة',
    'إسهال|اسهال': 'الإسهال قد يكون ناتجاً عن: عدوى طفيلية، تسمم غذائي، أو كوكسيديا.\n\n🔹 نصائح أولية:\n- تقديم محلول إلكتروليتات\n- منع الطعام الملوث\n- مراقبة لون البراز',
    'سعال|كحة': 'السعال قد يشير إلى: التهاب رئوي، ديدان رئوية، أو حساسية.\n\n🔹 نصائح أولية:\n- تحسين التهوية\n- عزل الحيوان\n- مراقبة التنفس',
    'عرج|يعرج': 'العرج قد يكون بسبب: حمى قلاعية، التهاب مفاصل، أو إصابة.\n\n🔹 نصائح:\n- فحص الحوافر\n- توفير أرضية نظيفة',
    'عين|عيون|دموع': 'مشاكل العيون قد تشمل: التهاب الملتحمة أو التيلاريا.\n\n🔹 نصائح:\n- تنظيف العين بمحلول ملحي\n- حماية من الذباب'
  },
  en: {
    'fever|temperature|hot': 'The animal appears to have a fever. Possible causes: bacterial infection, FMD, or pneumonia.\n\n🔹 Initial Advice:\n- Isolate immediately\n- Provide cool water\n- Monitor temperature\n\n⚠️ Contact a vet within 24 hours',
    'diarrhea|loose': 'Diarrhea may be caused by: parasites, food poisoning, or coccidiosis.\n\n🔹 Initial Advice:\n- Provide electrolyte solution\n- Remove contaminated feed',
    'cough|breathing': 'Coughing may indicate: pneumonia, lung worms, or allergies.\n\n🔹 Initial Advice:\n- Improve ventilation\n- Isolate the animal',
    'limp|leg|lame': 'Limping may be due to: FMD, arthritis, or injury.\n\n🔹 Advice:\n- Examine hooves\n- Provide clean flooring',
    'eye|tear|vision': 'Eye problems may include: conjunctivitis or thelaziasis.\n\n🔹 Advice:\n- Clean with saline solution\n- Protect from flies'
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const session = checkSession();
  if (!session) { window.location.href = 'login.html'; return; }
  await fetchAnimals();
  initDashboard(session);
});

async function fetchAnimals() {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/animals');
    if (res.ok) animals = await res.json();
  } catch (e) {
    console.error('Failed to fetch animals:', e);
  }
}

function checkSession() {
  const s = localStorage.getItem('agriroots-session');
  return s ? JSON.parse(s) : null;
}

function initDashboard(user) {
  // Set user info
  document.querySelectorAll('.user-name').forEach(el => el.textContent = user.name || 'مزارع');
  document.querySelectorAll('.user-farm').forEach(el => el.textContent = user.farm || 'مزرعتي');
  // Init views
  initSidebar();
  renderStats();
  renderAlerts();
  renderLivestock();
  renderTimeline();
  renderMarket();
  initChat();

  filterVaccines('cow'); // Initialize vaccines view
  // Lang change handler
  window.addEventListener('langChange', () => {
    renderStats();
    renderAlerts();
    renderLivestock();
    renderTimeline();
    renderMarket();
    const activeVaccineTab = document.querySelector('#view-vaccines .filter-btn.active');
    if (activeVaccineTab) {
      // Find the onclick attribute to know which type is active
      const typeMatch = activeVaccineTab.getAttribute('onclick').match(/'([^']+)'/);
      if (typeMatch) renderVaccines(typeMatch[1]);
    }
  });
}

/* ===== SIDEBAR ===== */
function initSidebar() {
  document.querySelectorAll('.sidebar-link[data-view]').forEach(link => {
    link.addEventListener('click', () => {
      const view = link.dataset.view;
      // Update active link
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      // Update view
      document.querySelectorAll('.dash-view').forEach(v => v.classList.remove('active'));
      const target = document.getElementById('view-' + view);
      if (target) target.classList.add('active');
      // Update topbar title
      const titleAr = link.querySelector('[data-ar]');
      const titleEn = link.querySelector('[data-en]');
      const topTitle = document.querySelector('.topbar-title h2');
      if (topTitle && titleAr && titleEn) {
        topTitle.innerHTML = `<span data-ar>${titleAr.textContent}</span><span data-en>${titleEn.textContent}</span>`;
        updateLangUI();
      }
      // Close mobile sidebar
      document.querySelector('.sidebar').classList.remove('open');
      document.querySelector('.sidebar-overlay').classList.remove('open');
    });
  });
}

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
  document.querySelector('.sidebar-overlay').classList.toggle('open');
}

function closeSidebar() {
  document.querySelector('.sidebar').classList.remove('open');
  document.querySelector('.sidebar-overlay').classList.remove('open');
}

/* ===== STATS ===== */
function renderStats() {
  const safe = animals.filter(a => a.status === 'safe').length;
  const unsafe = animals.filter(a => a.status === 'unsafe').length;
  const upcomingVax = animals.reduce((c, a) => {
    return c + a.vaccines.filter(v => {
      const d = Math.ceil((new Date(v.next) - new Date()) / 86400000);
      return d > 0 && d < 30;
    }).length;
  }, 0);
  document.querySelectorAll('.stat-total').forEach(el => el.textContent = animals.length);
  document.querySelectorAll('.stat-alerts').forEach(el => el.textContent = unsafe + upcomingVax);

  document.querySelectorAll('.stat-withdrawal').forEach(el => el.textContent = unsafe);
}

/* ===== ALERTS ===== */
function renderAlerts() {
  const container = document.getElementById('dashAlerts');
  if (!container) return;
  const en = isEn();
  let html = '';

  // Group Upcoming vaccines
  let upcomingVaxCount = 0;
  animals.forEach(a => {
    a.vaccines.forEach(v => {
      const days = Math.ceil((new Date(v.next) - new Date()) / 86400000);
      if (days > 0 && days < 30) upcomingVaxCount++;
    });
  });
  if (upcomingVaxCount > 0) {
    html += `<div class="alert-banner warning"><span class="alert-icon">🔥</span><span>${en ? upcomingVaxCount + ' vaccines upcoming in the next 30 days' : 'تذكير: لديك ' + upcomingVaxCount + ' جرعات تطعيم قادمة خلال الـ 30 يوماً القادمة'}</span></div>`;
  }

  // Group Unsafe animals
  const unsafeCount = animals.filter(a => a.status === 'unsafe').length;
  if (unsafeCount > 0) {
    html += `<div class="alert-banner critical"><span class="alert-icon">🚫</span><span>${en ? unsafeCount + ' animals in active withdrawal period — Not safe for slaughter' : 'تحذير: لديك ' + unsafeCount + ' حيوان في فترة سحب فعالة — غير صالحة للبيع أو الذبح حالياً'}</span></div>`;
  }

  // Good news
  const safeCount = animals.filter(a => a.status === 'safe').length;
  html += `<div class="alert-banner success"><span class="alert-icon">✅</span><span>${en ? safeCount + ' heads in perfect health and ready for sale' : 'ممتاز: معظم القطيع (' + safeCount + ' رأس) بصحة جيدة وجاهز للسوق'}</span></div>`;

  container.innerHTML = html;
}

/* ===== LIVESTOCK CATEGORIES & DETAILS ===== */
function renderLivestock() {
  const grid = document.getElementById('livestockCategoriesGrid');
  if (!grid) return;
  const en = isEn();

  // Count by type
  const counts = { cow: 0, bull: 0, sheep: 0, goat: 0 };
  animals.forEach(a => { if (counts[a.type] !== undefined) counts[a.type]++; });

  const cats = [
    { type: 'sheep', icon: '🐑', title: { ar: 'أغنام', en: 'Sheep' }, count: counts.sheep },
    { type: 'cow', icon: '🐄', title: { ar: 'أبقار', en: 'Cows' }, count: counts.cow },
    { type: 'bull', icon: '🐂', title: { ar: 'ثيران', en: 'Bulls' }, count: counts.bull },
    { type: 'goat', icon: '🐐', title: { ar: 'ماعز', en: 'Goats' }, count: counts.goat }
  ];

  grid.innerHTML = cats.map(c => `<div class="card card-hover" onclick="showCategoryDetails('${c.type}')" style="cursor:pointer;text-align:center">
    <div style="font-size:4rem;margin:12px 0">${c.icon}</div>
    <h3>${t(c.title)}</h3>
    <div style="font-size:24px;font-weight:700;color:var(--leaf);margin-top:8px">${c.count.toLocaleString()} <span style="font-size:14px;color:var(--text-dim)">${en ? 'Heads' : 'رأس'}</span></div>
    <div class="btn btn-ghost btn-sm" style="margin-top:16px;width:100%">${en ? 'View Records →' : 'عرض السجلات ←'}</div>
  </div>`).join('');
}

function showCategoryDetails(type) {
  document.getElementById('livestockCategoriesView').style.display = 'none';
  document.getElementById('livestockDetailView').style.display = 'block';

  const en = isEn();
  const titles = { cow: { ar: 'سجل الأبقار', en: 'Cows Directory' }, bull: { ar: 'سجل الثيران', en: 'Bulls Directory' }, sheep: { ar: 'سجل الأغنام', en: 'Sheep Directory' }, goat: { ar: 'سجل الماعز', en: 'Goats Directory' } };
  document.getElementById('detailCategoryTitle').textContent = t(titles[type]);

  const tbody = document.getElementById('livestockDetailTable');
  const filtered = animals.filter(a => a.type === type).slice(0, 100); // show first 100 for performance

  tbody.innerHTML = filtered.map(a => {
    const statusTxt = a.status === 'safe' ? (en ? 'Safe' : 'سليم') : (en ? 'Withdrawal' : 'فترة سحب');
    const statusColor = a.status === 'safe' ? 'color:#2E7D32;background:#E8F5E9' : 'color:#C62828;background:#FFEBEE';
    const vaxTxt = a.vaccines.length > 0 ? t(a.vaccines[0].name) : (en ? 'None' : 'لا يوجد');

    return `<tr>
      <td style="font-weight:700;color:var(--leaf)">${a.id}</td>
      <td>${t(a.breed)}</td>
      <td>${a.age} ${en ? 'mo' : 'شهر'}</td>
      <td>${a.weight} kg</td>
      <td><span style="background:#F5F5F5;padding:4px 8px;border-radius:4px;font-size:12px">${vaxTxt}</span></td>
      <td><span style="${statusColor};padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600">${statusTxt}</span></td>
      <td style="text-align:center"><button class="btn btn-ghost btn-sm" style="padding:4px 8px;font-size:12px" onclick="openEditAnimalModal('${a.id}')">✏️ ${en ? 'Edit' : 'تعديل'}</button></td>
    </tr>`;
  }).join('');
}

function backToCategories() {
  document.getElementById('livestockCategoriesView').style.display = 'block';
  document.getElementById('livestockDetailView').style.display = 'none';
}

function renderTimeline() {
  const tl = document.getElementById('vaccTimeline');
  if (!tl) return;
  const en = isEn();

  // Group by date and vaccine name
  const grouped = {};

  animals.forEach(a => {
    a.vaccines.forEach(v => {
      const vaxName = en ? v.name.en : v.name.ar;
      const key = v.next + '_' + vaxName;
      if (!grouped[key]) {
        const days = Math.ceil((new Date(v.next) - new Date()) / 86400000);
        let cls = '';
        if (days < 0) cls = 'overdue';
        else if (days < 30) cls = 'upcoming';

        grouped[key] = {
          vaccine: t(v.name),
          date: v.next,
          diff: days,
          cls: cls,
          count: 0,
          types: new Set()
        };
      }
      grouped[key].count++;
      grouped[key].types.add(t(a.breed));
    });
  });

  const items = Object.values(grouped);
  items.sort((a, b) => a.diff - b.diff);

  tl.innerHTML = items.map(i => {
    const typesStr = Array.from(i.types).join('، ');
    return `<div class="timeline-item ${i.cls}">
      <strong>${i.vaccine}</strong> — <span style="color:var(--text-dim);font-size:13px">${i.count} ${en ? 'heads' : 'رأس'} (${typesStr})</span><br>
      <small style="color:var(--text-dim)">📅 ${i.date} — ${i.diff > 0 ? (en ? i.diff + ' days left' : 'بعد ' + i.diff + ' يوم') : (en ? 'Overdue!' : 'متأخر!')}</small>
    </div>`;
  }).join('');
}

/* ===== VACCINES CHECKLIST ===== */
function filterVaccines(type) {
  document.querySelectorAll('#view-vaccines .filter-btn').forEach(b => b.classList.remove('active'));
  if (event && event.target) {
    const targetText = event.target.textContent;
    document.querySelectorAll('#view-vaccines .filter-btn').forEach(b => {
      if (b.getAttribute('onclick').includes(type)) {
        b.classList.add('active');
      }
    });
  }
  renderVaccines(type);
}

function renderVaccines(type) {
  const en = isEn();
  const thead = document.getElementById('vaccineTableHeader');
  const tbody = document.getElementById('vaccineTableBody');
  if (!thead || !tbody) return;

  const reqVax = requiredVaccines[type] || [];

  // Header
  let headerHtml = `<tr>
    <th style="padding:16px"><span data-ar>الرقم</span><span data-en>ID</span></th>
    <th style="padding:16px"><span data-ar>العمر</span><span data-en>Age</span></th>`;

  reqVax.forEach(v => {
    headerHtml += `<th style="padding:16px;text-align:center">${en ? v.name.en : v.name.ar}</th>`;
  });
  headerHtml += `<th style="padding:16px"><span data-ar>الجرعة القادمة</span><span data-en>Upcoming Dose</span></th></tr>`;
  thead.innerHTML = headerHtml;

  // Body
  const filteredAnimals = animals.filter(a => a.type === type);
  if (filteredAnimals.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${reqVax.length + 3}" style="text-align:center;padding:24px;color:var(--text-dim)">
      ${en ? 'No animals found for this category.' : 'لا يوجد مواشي مسجلة في هذا الصنف.'}
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filteredAnimals.map(a => {
    let rowHtml = `<tr>
      <td style="font-weight:700;color:var(--leaf)">${a.id}</td>
      <td>${a.age} ${en ? 'mo' : 'شهر'}</td>`;

    let upcomingDate = null;

    reqVax.forEach(v => {
      // check if animal has this vaccine
      const hasVax = a.vaccines.find(av => (av.name.en && av.name.en.toLowerCase() === v.name.en.toLowerCase()) ||
        (av.name.ar && av.name.ar === v.name.ar));
      if (hasVax) {
        rowHtml += `<td style="text-align:center"><span style="color:#2E7D32;font-size:18px">✅</span></td>`;
        if (hasVax.next) {
          if (!upcomingDate || new Date(hasVax.next) < new Date(upcomingDate)) {
            upcomingDate = hasVax.next;
          }
        }
      } else {
        const vaxNameEn = v.name.en.replace(/'/g, "\\'");
        const vaxNameAr = v.name.ar.replace(/'/g, "\\'");
        rowHtml += `<td style="text-align:center"><button class="btn btn-ghost btn-sm" style="padding:4px 8px" onclick="recordMissingVaccine('${a.id}', '${vaxNameAr}', '${vaxNameEn}')">${en ? '➕ Add' : '➕ إضافة'}</button></td>`;
      }
    });

    let upcomingTxt = en ? 'None' : 'لا يوجد';
    let upcomingColor = 'color:var(--text-dim)';
    if (upcomingDate) {
      const days = Math.ceil((new Date(upcomingDate) - new Date()) / 86400000);
      upcomingTxt = `${upcomingDate} <span style="font-size:11px">(${days > 0 ? (en ? 'in ' + days + 'd' : 'بعد ' + days + 'ي') : (en ? 'overdue' : 'متأخر')})</span>`;
      if (days < 0) upcomingColor = 'color:#C62828;font-weight:700';
      else if (days < 15) upcomingColor = 'color:#E65100;font-weight:700';
      else upcomingColor = 'color:#2E7D32';
    }

    rowHtml += `<td><span style="${upcomingColor}">${upcomingTxt}</span></td></tr>`;
    return rowHtml;
  }).join('');

  updateLangUI();
}

function recordMissingVaccine(animalId, vaxNameAr, vaxNameEn) {
  const animal = animals.find(a => a.id === animalId);
  if (!animal) return;

  currentEditId = animalId;
  document.getElementById('editAnimalTitle').textContent = `ID: ${animalId}`;
  document.getElementById('editAnimalAge').value = animal.age;
  document.getElementById('editAnimalWeight').value = animal.weight;
  document.getElementById('editAnimalStatus').value = animal.status;

  document.getElementById('editVaxNameAr').value = vaxNameAr;
  document.getElementById('editVaxNameEn').value = vaxNameEn;

  // Set current date as default for dose date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('editVaxDate').value = today;

  // Next dose date + 6 months default
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 6);
  document.getElementById('editVaxNextDate').value = nextDate.toISOString().split('T')[0];

  openModal('editAnimalModal');
}

/* ===== MARKETPLACE ===== */
const marketItems = [
  { id: 'LV-001', type: 'cow', name: { ar: 'بقرة هولشتاين', en: 'Holstein Cow' }, price: 12500, age: 36, weight: 520, healthy: true },
  { id: 'LV-003', type: 'goat', name: { ar: 'ماعز شامي', en: 'Shami Goat' }, price: 2800, age: 24, weight: 70, healthy: true },
  { id: 'LV-004', type: 'cow', name: { ar: 'بقرة سيمنتال', en: 'Simmental Cow' }, price: 15000, age: 48, weight: 580, healthy: true },
  { id: 'LV-006', type: 'goat', name: { ar: 'ماعز بلدي', en: 'Local Goat' }, price: 1500, age: 18, weight: 45, healthy: true },
  { id: 'LV-007', type: 'sheep', name: { ar: 'نعجة عواسي', en: 'Awassi Ewe' }, price: 3200, age: 30, weight: 60, healthy: true },
  { id: 'LV-008', type: 'cow', name: { ar: 'عجل محلي', en: 'Local Calf' }, price: 8000, age: 8, weight: 180, healthy: true }
];

function renderMarket(filter) {
  filter = filter || 'all';
  const grid = document.getElementById('marketGrid');
  if (!grid) return;
  const en = isEn();
  const items = filter === 'all' ? marketItems : marketItems.filter(i => i.type === filter);
  grid.innerHTML = items.map(i => `<div class="card card-hover">
    <div style="font-size:3rem;text-align:center">${typeEmoji[i.type]}</div>
    <h3 class="text-center">${t(i.name)}</h3>
    <div class="price text-center">${i.price.toLocaleString()} ${en ? 'JOD' : 'دينار'}</div>
    <div class="animal-info">
      <div class="row"><span class="label">${en ? 'Age' : 'العمر'}</span><span>${i.age} ${en ? 'mo' : 'شهر'}</span></div>
      <div class="row"><span class="label">${en ? 'Weight' : 'الوزن'}</span><span>${i.weight} kg</span></div>
      <div class="row"><span class="label">${en ? 'Health' : 'الصحة'}</span><span style="color:var(--leaf)">✅ ${en ? 'Healthy' : 'سليم'}</span></div>
    </div>
    <div class="qr-section"><canvas id="qr-${i.id}"></canvas><p style="font-size:11px;margin-top:6px;color:var(--text-dim)">${en ? 'Scan for history' : 'امسح للسجل'}</p></div>
  </div>`).join('');
  // QR
  if (typeof QRCode !== 'undefined') {
    items.forEach(i => {
      const el = document.getElementById('qr-' + i.id);
      if (el) QRCode.toCanvas(el, JSON.stringify({ id: i.id, name: t(i.name) }), { width: 100, margin: 1, color: { dark: '#2D5A27', light: '#FDFDF8' } });
    });
  }
}

function filterMarket(type) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  renderMarket(type);
}

/* ===== CHATBOT ===== */
function initChat() {
  const input = document.getElementById('dashChatInput');
  if (input) {
    input.placeholder = isEn() ? 'Describe symptoms...' : 'اكتب الأعراض هنا...';
  }
}

async function sendDashChat() {
  const input = document.getElementById('dashChatInput');
  const message = input.value.trim();
  if (!message) return;

  const chatMessages = document.getElementById('dashChatMessages');
  const en = isEn();
  const langCode = en ? 'en' : 'ar';

  // Display User Message
  const userMsgEl = document.createElement('div');
  userMsgEl.className = 'chat-msg user fade-in';
  userMsgEl.textContent = message;
  chatMessages.appendChild(userMsgEl);
  input.value = '';

  // Display Typing Indicator
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-msg bot fade-in typing-indicator';
  typingEl.innerHTML = en ? 'AI Vet is typing...' : 'جاري التفكير...';
  chatMessages.appendChild(typingEl);

  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch('http://127.0.0.1:5000/api/aivet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, language: langCode })
    });
    
    const data = await response.json();
    chatMessages.removeChild(typingEl);

    const botMsgEl = document.createElement('div');
    botMsgEl.className = 'chat-msg bot fade-in';
    
    if (data.success) {
      // Basic markdown formatting (bold)
      let formattedText = data.reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedText = formattedText.replace(/\n/g, '<br>');
      botMsgEl.innerHTML = formattedText;
    } else {
      botMsgEl.innerHTML = en ? '⚠️ Error: ' + data.reply : '⚠️ خطأ: ' + data.reply;
    }
    
    chatMessages.appendChild(botMsgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

  } catch (err) {
    console.error(err);
    chatMessages.removeChild(typingEl);
    const botMsgEl = document.createElement('div');
    botMsgEl.className = 'chat-msg bot fade-in';
    botMsgEl.innerHTML = en ? '⚠️ Connection failed!' : '⚠️ فشل الاتصال بالخادم!';
    chatMessages.appendChild(botMsgEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}


/* ===== ADD ANIMAL MODAL ===== */
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

async function addManualAnimals() {
  const type = document.getElementById('animalType').value;
  const breedStr = document.getElementById('animalBreed').value || 'Mixed';
  const breed = { ar: breedStr, en: breedStr };
  const count = parseInt(document.getElementById('animalCount').value) || 1;
  const age = parseInt(document.getElementById('animalAge').value) || 12;
  const weight = parseInt(document.getElementById('animalWeight').value) || 40;

  const startId = animals.length + 1;
  const newRecords = [];

  for (let i = 0; i < count; i++) {
    newRecords.push({
      id: type.substring(0, 1).toUpperCase() + '-' + String(startId + i).padStart(4, '0'),
      name: breed, type: type, breed: breed, age: age, weight: weight, status: 'safe',
      vaccines: [], meds: [], withdrawalEnd: null
    });
  }

  try {
    await fetch('http://127.0.0.1:5000/api/animals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecords)
    });

    await fetchAnimals();
  } catch (e) {
    console.error("Failed to add manual records", e);
    // Fallback: update local array
    animals.push(...newRecords);
  }

  // Update UI in both cases
  renderStats();
  renderLivestock(); // Updates categories

  // Refresh detail view if open
  if (document.getElementById('livestockDetailView').style.display === 'block') {
    const titles = { cow: 'الأبقار', sheep: 'الأغنام', goat: 'الماعز' };
    if (document.getElementById('detailCategoryTitle').textContent.includes('أغنام') || document.getElementById('detailCategoryTitle').textContent.includes('Sheep')) {
      showCategoryDetails('sheep');
    } else if (document.getElementById('detailCategoryTitle').textContent.includes('أبقار') || document.getElementById('detailCategoryTitle').textContent.includes('Cows')) {
      showCategoryDetails('cow');
    } else if (document.getElementById('detailCategoryTitle').textContent.includes('ثيران') || document.getElementById('detailCategoryTitle').textContent.includes('Bulls')) {
      showCategoryDetails('bull');
    } else {
      showCategoryDetails('goat');
    }
  }

  closeModal('addAnimalModal');

  // Reset form
  document.getElementById('animalBreed').value = '';
  document.getElementById('animalCount').value = '1';
}

/* ===== LOGOUT ===== */
function logout() {
  localStorage.removeItem('agriroots-session');
  window.location.href = 'login.html';
}

/* ===== EDIT ANIMAL ===== */
let currentEditId = null;

function openEditAnimalModal(id) {
  const animal = animals.find(a => a.id === id);
  if (!animal) return;

  currentEditId = id;
  document.getElementById('editAnimalTitle').textContent = `ID: ${id}`;
  document.getElementById('editAnimalAge').value = animal.age;
  document.getElementById('editAnimalWeight').value = animal.weight;
  document.getElementById('editAnimalStatus').value = animal.status;

  // Clear vax fields
  document.getElementById('editVaxNameAr').value = '';
  document.getElementById('editVaxNameEn').value = '';
  document.getElementById('editVaxDate').value = '';
  document.getElementById('editVaxNextDate').value = '';

  openModal('editAnimalModal');
}

async function saveAnimalEdit() {
  if (!currentEditId) return;

  const age = parseInt(document.getElementById('editAnimalAge').value);
  const weight = parseInt(document.getElementById('editAnimalWeight').value);
  const status = document.getElementById('editAnimalStatus').value;

  const vaxNameAr = document.getElementById('editVaxNameAr').value.trim();
  const vaxNameEn = document.getElementById('editVaxNameEn').value.trim();
  const vaxDate = document.getElementById('editVaxDate').value;
  const vaxNextDate = document.getElementById('editVaxNextDate').value;

  let new_vaccine = null;
  if (vaxNameAr && vaxNameEn && vaxDate && vaxNextDate) {
    new_vaccine = {
      name: { ar: vaxNameAr, en: vaxNameEn },
      date: vaxDate,
      next: vaxNextDate
    };
  }

  try {
    const res = await fetch(`http://127.0.0.1:5000/api/animals/${currentEditId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age, weight, status, new_vaccine })
    });
    if (res.ok) {
      await fetchAnimals();
    } else {
      throw new Error("Update failed");
    }
  } catch (e) {
    console.error("Failed to edit animal", e);
    // Fallback: update local array
    const idx = animals.findIndex(a => a.id === currentEditId);
    if (idx !== -1) {
      animals[idx].age = age;
      animals[idx].weight = weight;
      animals[idx].status = status;
      if (new_vaccine) {
        if (!animals[idx].vaccines) animals[idx].vaccines = [];
        animals[idx].vaccines.push(new_vaccine);
      }
    }
  }

  // Update UI in both cases
  renderStats();
  renderLivestock(); // Updates categories

  // Refresh detail view
  const animal = animals.find(a => a.id === currentEditId);
  if (animal) {
    showCategoryDetails(animal.type);

    // Refresh vaccines checklist if we are on the vaccines view
    const activeVaccineTab = document.querySelector('#view-vaccines .filter-btn.active');
    if (activeVaccineTab) {
      const typeMatch = activeVaccineTab.getAttribute('onclick').match(/'([^']+)'/);
      if (typeMatch && typeMatch[1] === animal.type) renderVaccines(animal.type);
    }
  }

  closeModal('editAnimalModal');
}

/* ===== EDUCATION ARTICLES ===== */
const articlesData = {
  cow_nutrition: {
    title: { ar: '🐄 أساسيات تغذية الأبقار الحلوب', en: '🐄 Dairy Cow Nutrition Basics' },
    content: {
      ar: `<p>تعتبر تغذية الأبقار الحلوب من أهم العوامل التي تؤثر على إنتاج الحليب وجودته. يجب توفير عليقة متوازنة تحتوي على نسبة كافية من البروتين (16-18%) والطاقة والألياف.</p>
           <ul>
             <li><b>الأعلاف الخشنة:</b> الدريس والسيلاج تشكل أساس الهضم الصحي.</li>
             <li><b>الأعلاف المركزة:</b> ضرورية لتعويض نقص الطاقة.</li>
             <li><b>الماء:</b> البقرة تستهلك حتى 100 لتر يومياً، يجب توفير ماء نظيف باستمرار.</li>
           </ul>`,
      en: `<p>Feeding dairy cows is a critical factor affecting milk yield and quality. A balanced diet with 16-18% protein, energy, and fiber is essential.</p>
           <ul>
             <li><b>Roughage:</b> Hay and silage form the basis of healthy digestion.</li>
             <li><b>Concentrates:</b> Crucial to cover energy deficits.</li>
             <li><b>Water:</b> A cow drinks up to 100 liters daily; clean water is a must.</li>
           </ul>`
    }
  },
  fmd: {
    title: { ar: '🛡️ الوقاية من الحمى القلاعية', en: '🛡️ FMD Prevention Guide' },
    content: {
      ar: `<p>الحمى القلاعية مرض فيروسي شديد العدوى يسبب خسائر اقتصادية فادحة. الوقاية خير من العلاج.</p>
           <ul>
             <li><b>التطعيم الدوري:</b> تأكد من تطعيم القطيع كل 6 أشهر.</li>
             <li><b>العزل المباشر:</b> اعزل أي حيوان جديد لمدة 14 يوماً.</li>
             <li><b>التعقيم:</b> استخدم مطهرات قوية في مداخل المزرعة وللأحذية والسيارات.</li>
           </ul>`,
      en: `<p>Foot and Mouth Disease is a highly contagious viral disease causing severe economic losses. Prevention is key.</p>
           <ul>
             <li><b>Regular Vaccination:</b> Ensure herd vaccination every 6 months.</li>
             <li><b>Quarantine:</b> Isolate any new animals for 14 days.</li>
             <li><b>Sanitization:</b> Use strong disinfectants at farm entrances, shoes, and vehicles.</li>
           </ul>`
    }
  },
  water: {
    title: { ar: '💧 إدارة مياه الشرب للمواشي', en: '💧 Livestock Water Management' },
    content: {
      ar: `<p>المياه الملوثة هي المصدر الأول للأمراض المعوية وانتقال العدوى.</p>
           <ul>
             <li><b>التنظيف المستمر:</b> نظف أحواض الشرب مرتين أسبوعياً لتجنب الطحالب.</li>
             <li><b>درجة الحرارة:</b> حافظ على درجة حرارة المياه معتدلة لزيادة استهلاك الحيوانات للماء.</li>
             <li><b>مراقبة الجودة:</b> افحص نسبة الملوحة والشوائب دورياً.</li>
           </ul>`,
      en: `<p>Contaminated water is the primary source of intestinal diseases and infections.</p>
           <ul>
             <li><b>Regular Cleaning:</b> Clean water troughs twice a week to avoid algae.</li>
             <li><b>Temperature:</b> Keep water temperature moderate to encourage drinking.</li>
             <li><b>Quality Checks:</b> Regularly test for salinity and impurities.</li>
           </ul>`
    }
  }
};

function openArticle(id) {
  const en = isEn();
  const article = articlesData[id];
  if (!article) return;
  
  document.getElementById('articleTitle').innerHTML = en ? article.title.en : article.title.ar;
  document.getElementById('articleContent').innerHTML = en ? article.content.en : article.content.ar;
  
  openModal('articleModal');
}


