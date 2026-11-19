/* =========================================================
   ContentFlow Multi-Brand — Offline Storage, Brands & Reports
   ========================================================= */

const STORAGE_KEY = 'contentflow_multibrand_v2_2';

function getTodayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
}

function getDefaultBrands() {
  return [
    { id: 'b-1', name: 'Kasubanyaman', color: '#38bdf8' },
    { id: 'b-2', name: 'Kopi Hari Ini', color: '#f59e0b' },
    { id: 'b-3', name: 'icare Service', color: '#10b981' },
    { id: 'b-4', name: 'Kawarami', color: '#a78bfa' },
    { id: 'b-5', name: 'LKP Nindya Putri', color: '#fb7185' }
  ];
}

function getDefaultStatuses() {
  return [
    'Ide / Konsep',
    'Proses Syuting',
    'Editing',
    'Revisi',
    'Siap Upload',
    'Ditunda',
    'Selesai'
  ];
}

function getInitialData() {
  const today = getTodayISO();
  return {
    brands: getDefaultBrands(),
    statuses: getDefaultStatuses(),
    globalNotif: true,
    tasks: [
      {
        id: 't-101',
        brandId: 'b-1',
        title: 'Reels Showcase Produk & Suasana Kasubanyaman',
        date: today,
        time: '10:00',
        status: 'Proses Syuting',
        platform: 'Instagram / Reels',
        notif: true,
        notified: false,
        note: 'Ambil angle estetik pagi hari dan highlight keunggulan produk.'
      },
      {
        id: 't-102',
        brandId: 'b-2',
        title: 'Konten Promo Menu Kopi Hari Ini',
        date: today,
        time: '13:00',
        status: 'Editing',
        platform: 'TikTok',
        notif: true,
        notified: false,
        note: 'Tambahkan teks harga promo dan musik trending.'
      },
      {
        id: 't-103',
        brandId: 'b-3',
        title: 'Edukasi Tips Perawatan Gadget - icare Service',
        date: today,
        time: '15:30',
        status: 'Siap Upload',
        platform: 'Instagram / Reels',
        notif: true,
        notified: false,
        note: 'Caption sudah siap, tinggal upload sore ini.'
      },
      {
        id: 't-104',
        brandId: 'b-4',
        title: 'Katalog & Story Interaktif Kawarami',
        date: today,
        time: '17:00',
        status: 'Ditunda',
        platform: 'Instagram / Reels',
        notif: false,
        notified: false,
        note: 'Menunggu foto produk terbaru dari tim.'
      },
      {
        id: 't-105',
        brandId: 'b-5',
        title: 'Publikasi Jadwal Pelatihan LKP Nindya Putri',
        date: today,
        time: '09:00',
        status: 'Selesai',
        platform: 'Facebook / WA',
        notif: false,
        notified: true,
        note: 'Sudah tayang di IG Feed, Facebook, dan status WA.'
      }
    ],
    notes: [
      {
        id: 'n-101',
        brandId: 'b-2',
        title: 'Konsep Konten Mingguan Kopi Hari Ini',
        tag: 'Content Plan',
        body: '- Senin: Behind the scene seduh kopi\n- Rabu: Promo bundling sarapan\n- Jumat: Testimoni pelanggan setia',
        updatedAt: today
      },
      {
        id: 'n-102',
        brandId: 'b-5',
        title: 'Info Pendaftaran Kelas Baru LKP Nindya Putri',
        tag: 'Brief Poster',
        body: 'Cantumkan syarat pendaftaran, jadwal kelas pagi/siang, dan kontak admin pendaftaran.',
        updatedAt: today
      }
    ]
  };
}

let state = loadState();
let activeBrandId = 'ALL';
let selectedDate = getTodayISO();
let selectedStatusFilter = 'ALL';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('contentflow_multibrand_v2');
    if (!raw) return getInitialData();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.brands) || parsed.brands.length === 0) {
      parsed.brands = getDefaultBrands();
    }
    if (!Array.isArray(parsed.statuses) || parsed.statuses.length === 0) {
      parsed.statuses = getDefaultStatuses();
    }
    if (!Array.isArray(parsed.tasks)) parsed.tasks = [];
    if (!Array.isArray(parsed.notes)) parsed.notes = [];
    return parsed;
  } catch (e) {
    return getInitialData();
  }
}

function saveState() {
  if (!Array.isArray(state.brands) || state.brands.length === 0) {
    state.brands = getDefaultBrands();
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}

function addNewBrand(name, color) {
  const cleanName = (name || '').trim();
  if (!cleanName) return null;
  const existing = state.brands.find(b => b.name.toLowerCase() === cleanName.toLowerCase());
  if (existing) return existing;

  const palette = ['#38bdf8', '#f59e0b', '#10b981', '#a78bfa', '#fb7185', '#22d3ee', '#f97316'];
  const pickedColor = color || palette[state.brands.length % palette.length];
  const newBrand = {
    id: 'b-' + Date.now() + '-' + Math.floor(Math.random() * 100),
    name: cleanName,
    color: pickedColor
  };
  state.brands.push(newBrand);
  saveState();
  return newBrand;
}

function getBrandById(id) {
  return state.brands.find(b => b.id === id) || state.brands[0] || { id: 'b-1', name: 'Kasubanyaman', color: '#38bdf8' };
}

function formatIndoDate(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// =========================================================
// NAVIGASI BOTTOM DASHBOARD
// =========================================================
function switchTab(targetId) {
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.target === targetId);
  });
  document.querySelectorAll('.view-section').forEach(s => {
    s.classList.toggle('active', s.id === targetId);
  });
  if (targetId === 'view-laporan') {
    renderReport();
  }
}

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.target));
  });

  document.getElementById('manageBrandsBtn').addEventListener('click', () => {
    switchTab('view-pengaturan');
    document.getElementById('newBrandInput').focus();
  });
}

// =========================================================
// RENDER BRAND SWITCHER & WORKSPACE
// =========================================================
function renderBrandSwitcher() {
  const container = document.getElementById('brandSwitcherList');
  const allChip = `
    <button class="brand-chip ${activeBrandId === 'ALL' ? 'active' : ''}" data-brand="ALL">
      <span class="dot" style="background: linear-gradient(135deg,#38bdf8,#818cf8);"></span>
      Semua Brand (${state.brands.length})
    </button>
  `;

  const brandChips = state.brands.map(b => `
    <button class="brand-chip ${activeBrandId === b.id ? 'active' : ''}" data-brand="${b.id}">
      <span class="dot" style="background: ${b.color};"></span>
      ${escapeHTML(b.name)}
    </button>
  `).join('');

  container.innerHTML = allChip + brandChips;

  container.querySelectorAll('.brand-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeBrandId = chip.dataset.brand;
      renderAll();
    });
  });

  const bannerTitle = document.getElementById('bannerBrandName');
  if (activeBrandId === 'ALL') {
    bannerTitle.textContent = `Semua Brand / Project (${state.brands.length} Aktif)`;
  } else {
    const b = getBrandById(activeBrandId);
    bannerTitle.textContent = b.name;
  }
}

function getFilteredTasksByBrand() {
  if (activeBrandId === 'ALL') return state.tasks;
  return state.tasks.filter(t => t.brandId === activeBrandId);
}

// =========================================================
// RENDERING TASKS & NOTES
// =========================================================
function getStatusClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'selesai') return 'status-selesai';
  if (s === 'editing' || s === 'proses syuting') return 'status-editing';
  if (s === 'ditunda' || s === 'revisi') return 'status-ditunda';
  return 'status-default';
}

function createTaskCardHTML(task) {
  const brand = getBrandById(task.brandId);
  const isDone = (task.status || '').toLowerCase() === 'selesai';
  const statusOptions = state.statuses
    .map(st => `<option value="${escapeHTML(st)}" ${st === task.status ? 'selected' : ''}>${escapeHTML(st)}</option>`)
    .join('');

  return `
    <article class="task-card ${isDone ? 'is-done' : ''}">
      <div class="task-top">
        <div class="task-meta-badges">
          <span class="badge-brand-tag" style="background:${brand.color};">${escapeHTML(brand.name)}</span>
          <span class="badge-platform">${escapeHTML(task.platform)}</span>
          <span class="badge-notif ${task.notif ? 'on' : 'off'}" onclick="toggleTaskNotif('${task.id}')">
            ${task.notif ? '🔔 Notif' : '🔕 Senyap'}
          </span>
        </div>
        <div>
          <button class="action-icon" onclick="openEditTask('${task.id}')" title="Edit">✏️</button>
          <button class="action-icon" onclick="deleteTask('${task.id}')" title="Hapus">🗑️</button>
        </div>
      </div>

      <h3 class="task-title">${escapeHTML(task.title)}</h3>
      ${task.note ? `<div class="task-note">${escapeHTML(task.note)}</div>` : ''}

      <div class="task-bottom">
        <div class="task-datetime">
          <span>📅 ${formatIndoDate(task.date)}</span>
          ${task.time ? `<span>• ⏰ ${task.time}</span>` : ''}
        </div>
        <select class="status-select ${getStatusClass(task.status)}" onchange="changeTaskStatus('${task.id}', this.value)">
          ${statusOptions}
        </select>
      </div>
    </article>
  `;
}

function renderStats() {
  const today = getTodayISO();
  const brandTasks = getFilteredTasksByBrand();

  const todayTasks = brandTasks.filter(t => t.date === today);
  const inProgress = brandTasks.filter(t => ['Editing', 'Proses Syuting', 'Revisi'].includes(t.status));
  const doneTasks = brandTasks.filter(t => t.status === 'Selesai');

  document.getElementById('statToday').textContent = todayTasks.length;
  document.getElementById('statProgress').textContent = inProgress.length;
  document.getElementById('statDone').textContent = doneTasks.length;
}

function renderFilterPills() {
  const container = document.getElementById('statusFilterPills');
  const allPills = ['ALL', ...state.statuses];
  container.innerHTML = allPills.map(st => {
    const label = st === 'ALL' ? 'Semua Status' : st;
    const active = selectedStatusFilter === st ? 'active' : '';
    return `<button class="pill ${active}" data-status="${escapeHTML(st)}">${escapeHTML(label)}</button>`;
  }).join('');

  container.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      selectedStatusFilter = pill.dataset.status;
      renderBerandaList();
      renderFilterPills();
    });
  });
}

function renderBerandaList() {
  const container = document.getElementById('todayTaskList');
  let filtered = getFilteredTasksByBrand().filter(t => t.date === selectedDate);

  if (selectedStatusFilter !== 'ALL') {
    filtered = filtered.filter(t => t.status === selectedStatusFilter);
  }

  filtered.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Belum ada jadwal konten pada tanggal ini</h3>
        <p>Tekan tombol <strong>+</strong> di dashboard bawah untuk menambah tugas baru.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(createTaskCardHTML).join('');
}

function renderAllProjects() {
  const container = document.getElementById('allProjectList');
  const keyword = document.getElementById('searchProjectInput').value.toLowerCase();
  const sortMode = document.getElementById('projectSortSelect').value;

  let list = getFilteredTasksByBrand().filter(t => {
    const brandName = getBrandById(t.brandId).name.toLowerCase();
    return (
      t.title.toLowerCase().includes(keyword) ||
      brandName.includes(keyword) ||
      t.platform.toLowerCase().includes(keyword) ||
      (t.note && t.note.toLowerCase().includes(keyword)) ||
      (t.status || '').toLowerCase().includes(keyword)
    );
  });

  if (sortMode === 'date-asc') list.sort((a, b) => a.date.localeCompare(b.date));
  else if (sortMode === 'date-desc') list.sort((a, b) => b.date.localeCompare(a.date));
  else if (sortMode === 'status') list.sort((a, b) => (a.status || '').localeCompare(b.status || ''));

  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state"><h3>Tidak ada jadwal ditemukan</h3></div>`;
    return;
  }

  container.innerHTML = list.map(createTaskCardHTML).join('');
}

function renderNotes() {
  const container = document.getElementById('notesGrid');
  const notesList = activeBrandId === 'ALL'
    ? state.notes
    : state.notes.filter(n => n.brandId === activeBrandId);

  if (notesList.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <h3>Belum ada catatan untuk brand ini</h3>
        <p>Klik <strong>+ Catatan</strong> untuk menyimpan skrip atau ide konten.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notesList.map(note => {
    const brand = getBrandById(note.brandId);
    return `
      <article class="note-card">
        <div>
          <div class="note-badges">
            <span class="badge-brand-tag" style="background:${brand.color};">${escapeHTML(brand.name)}</span>
            <span class="note-tag">${escapeHTML(note.tag || 'Catatan')}</span>
          </div>
          <h3>${escapeHTML(note.title)}</h3>
          <p>${escapeHTML(note.body)}</p>
        </div>
        <div class="note-footer">
          <span>Update: ${formatIndoDate(note.updatedAt)}</span>
          <div>
            <button class="action-icon" onclick="openEditNote('${note.id}')">✏️</button>
            <button class="action-icon" onclick="deleteNote('${note.id}')">🗑️</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// =========================================================
// LAPORAN RINCI & GRAFIK
// =========================================================
function populateReportBrandFilter() {
  const select = document.getElementById('reportBrandFilter');
  const currentVal = select.value || 'ALL';
  select.innerHTML = `<option value="ALL">Semua Brand (${state.brands.length})</option>` +
    state.brands.map(b => `<option value="${escapeHTML(b.id)}">${escapeHTML(b.name)}</option>`).join('');
  select.value = currentVal;
}

function renderReport() {
  populateReportBrandFilter();
  const brandFilter = document.getElementById('reportBrandFilter').value;
  const startDate = document.getElementById('reportStartDate').value;
  const endDate = document.getElementById('reportEndDate').value;

  let tasks = [...state.tasks];
  if (brandFilter !== 'ALL') tasks = tasks.filter(t => t.brandId === brandFilter);
  if (startDate) tasks = tasks.filter(t => t.date >= startDate);
  if (endDate) tasks = tasks.filter(t => t.date <= endDate);

  tasks.sort((a, b) => a.date.localeCompare(b.date));

  const titleBrand = brandFilter === 'ALL' ? 'Semua Brand / Project' : getBrandById(brandFilter).name;
  document.getElementById('repTitleBrand').textContent = titleBrand;

  let periodLabel = 'Periode: Semua Waktu';
  if (startDate && endDate) periodLabel = `Periode: ${formatIndoDate(startDate)} s/d ${formatIndoDate(endDate)}`;
  else if (startDate) periodLabel = `Periode: Mulai ${formatIndoDate(startDate)}`;
  else if (endDate) periodLabel = `Periode: Sampai ${formatIndoDate(endDate)}`;
  document.getElementById('repPeriodText').textContent = periodLabel;

  document.getElementById('repGeneratedDate').textContent = formatIndoDate(getTodayISO());
  document.getElementById('repTotalCount').textContent = `${tasks.length} Konten`;

  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'Selesai').length;
  const inProg = tasks.filter(t => ['Editing', 'Proses Syuting', 'Ide / Konsep', 'Siap Upload'].includes(t.status)).length;
  const delayed = tasks.filter(t => ['Ditunda', 'Revisi'].includes(t.status)).length;
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;

  document.getElementById('repKpiTotal').textContent = total;
  document.getElementById('repKpiDone').textContent = done;
  document.getElementById('repKpiProgress').textContent = inProg;
  document.getElementById('repKpiDelayed').textContent = delayed;
  document.getElementById('repKpiRate').textContent = `${rate}%`;

  const tbody = document.getElementById('reportTableBody');
  if (tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:#6b7280;">Tidak ada data konten pada filter ini.</td></tr>`;
  } else {
    tbody.innerHTML = tasks.map((t, idx) => {
      const b = getBrandById(t.brandId);
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${formatIndoDate(t.date)}<br><small style="color:#6b7280;">${t.time || '-'}</small></td>
          <td><strong>${escapeHTML(b.name)}</strong></td>
          <td>${escapeHTML(t.title)}</td>
          <td>${escapeHTML(t.platform)}</td>
          <td><span class="rep-status-pill">${escapeHTML(t.status)}</span></td>
          <td>${escapeHTML(t.note || '-')}</td>
        </tr>
      `;
    }).join('');
  }

  drawStatusBarChart(tasks);
  drawBrandComparisonChart(startDate, endDate);
}

function drawStatusBarChart(tasks) {
  const canvas = document.getElementById('statusChartCanvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  const labels = state.statuses;
  const counts = labels.map(st => tasks.filter(t => t.status === st).length);
  const maxVal = Math.max(...counts, 1);

  const padLeft = 36;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 54;
  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBottom;

  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padLeft, padTop);
  ctx.lineTo(padLeft, padTop + chartH);
  ctx.lineTo(w - padRight, padTop + chartH);
  ctx.stroke();

  const barGap = 12;
  const barW = Math.max(16, (chartW - barGap * (labels.length + 1)) / labels.length);
  const colors = ['#0284c7', '#d97706', '#2563eb', '#e11d48', '#7c3aed', '#64748b', '#059669'];

  labels.forEach((label, i) => {
    const val = counts[i];
    const barH = (val / maxVal) * (chartH - 12);
    const x = padLeft + barGap + i * (barW + barGap);
    const y = padTop + chartH - barH;

    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(x, y, barW, barH);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(val), x + barW / 2, y - 5);

    ctx.fillStyle = '#374151';
    ctx.font = '10px Inter, sans-serif';
    const shortLabel = label.length > 9 ? label.slice(0, 8) + '..' : label;
    ctx.fillText(shortLabel, x + barW / 2, padTop + chartH + 16);
  });
}

function drawBrandComparisonChart(startDate, endDate) {
  const canvas = document.getElementById('brandChartCanvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  let tasks = [...state.tasks];
  if (startDate) tasks = tasks.filter(t => t.date >= startDate);
  if (endDate) tasks = tasks.filter(t => t.date <= endDate);

  const brands = state.brands;
  if (brands.length === 0) return;

  const totals = brands.map(b => tasks.filter(t => t.brandId === b.id).length);
  const dones = brands.map(b => tasks.filter(t => t.brandId === b.id && t.status === 'Selesai').length);
  const maxVal = Math.max(...totals, 1);

  const padLeft = 115;
  const padRight = 35;
  const padTop = 26;
  const padBottom = 20;
  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBottom;

  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(padLeft, 6, 10, 10);
  ctx.fillStyle = '#111827';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Total Konten', padLeft + 14, 15);

  ctx.fillStyle = '#10b981';
  ctx.fillRect(padLeft + 95, 6, 10, 10);
  ctx.fillStyle = '#111827';
  ctx.fillText('Selesai', padLeft + 109, 15);

  const rowH = chartH / brands.length;
  const barH = Math.min(12, (rowH - 10) / 2);

  brands.forEach((b, i) => {
    const yBase = padTop + i * rowH + 6;
    const totalW = (totals[i] / maxVal) * chartW;
    const doneW = (dones[i] / maxVal) * chartW;

    ctx.fillStyle = '#111827';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'right';
    const bName = b.name.length > 16 ? b.name.slice(0, 15) + '..' : b.name;
    ctx.fillText(bName, padLeft - 8, yBase + barH + 2);

    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(padLeft, yBase, totalW, barH);

    ctx.fillStyle = '#10b981';
    ctx.fillRect(padLeft, yBase + barH + 2, doneW, barH);

    ctx.fillStyle = '#374151';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${dones[i]}/${totals[i]}`, padLeft + Math.max(totalW, doneW) + 6, yBase + barH + 3);
  });
}

// =========================================================
// SETTINGS & BRAND CRUD
// =========================================================
function renderSettings() {
  document.getElementById('globalNotifToggle').checked = state.globalNotif;

  const brandGrid = document.getElementById('brandManageList');
  brandGrid.innerHTML = state.brands.map(b => {
    const count = state.tasks.filter(t => t.brandId === b.id).length;
    return `
      <div class="brand-manage-card">
        <div class="brand-manage-info">
          <span class="brand-color-dot" style="background:${b.color};"></span>
          <div>
            <div>${escapeHTML(b.name)}</div>
            <small style="color:#94a3b8;font-weight:400;">${count} jadwal konten</small>
          </div>
        </div>
        <button class="action-icon" onclick="deleteBrand('${b.id}')" title="Hapus Brand">🗑️</button>
      </div>
    `;
  }).join('');

  const tagContainer = document.getElementById('activeStatusTags');
  tagContainer.innerHTML = state.statuses.map(st => `
    <span class="status-chip">
      ${escapeHTML(st)}
      ${['Selesai', 'Editing', 'Ditunda'].includes(st) ? '' : `<button onclick="removeCustomStatus('${escapeHTML(st)}')" style="background:none;border:none;color:#fb7185;cursor:pointer;font-weight:bold;">&times;</button>`}
    </span>
  `).join('');
}

window.deleteBrand = function(id) {
  if (state.brands.length <= 1) {
    showToast('Minimal harus tersisa 1 brand/project.');
    return;
  }
  const b = getBrandById(id);
  if (!confirm(`Hapus brand "${b.name}" beserta seluruh jadwal & catatannya?`)) return;
  state.brands = state.brands.filter(item => item.id !== id);
  state.tasks = state.tasks.filter(t => t.brandId !== id);
  state.notes = state.notes.filter(n => n.brandId !== id);
  if (activeBrandId === id) activeBrandId = 'ALL';
  saveState();
  showToast(`Brand "${b.name}" dihapus`);
};

function renderAll() {
  renderBrandSwitcher();
  renderStats();
  renderFilterPills();
  renderBerandaList();
  renderAllProjects();
  renderNotes();
  renderSettings();
  updateNotifIndicator();
  if (document.getElementById('view-laporan').classList.contains('active')) {
    renderReport();
  }
}

// =========================================================
// MODALS & FORM SUBMISSIONS
// =========================================================
function populateBrandDropdown(selectId, selectedVal) {
  if (!Array.isArray(state.brands) || state.brands.length === 0) {
    state.brands = getDefaultBrands();
  }
  const select = document.getElementById(selectId);
  select.innerHTML = '';
  state.brands.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = b.name;
    if (b.id === selectedVal) opt.selected = true;
    select.appendChild(opt);
  });
  if (!select.value && state.brands[0]) {
    select.value = state.brands[0].id;
  }
}

function populateStatusDropdown(selectedVal = 'Ide / Konsep') {
  if (!Array.isArray(state.statuses) || state.statuses.length === 0) {
    state.statuses = getDefaultStatuses();
  }
  const select = document.getElementById('taskStatus');
  select.innerHTML = '';
  state.statuses.forEach(st => {
    const opt = document.createElement('option');
    opt.value = st;
    opt.textContent = st;
    if (st === selectedVal) opt.selected = true;
    select.appendChild(opt);
  });
}

function openNewTaskModal() {
  document.getElementById('taskModalTitle').textContent = 'Tambah Jadwal Konten / Tugas';
  document.getElementById('taskId').value = '';
  const defaultBrand = activeBrandId !== 'ALL' ? activeBrandId : state.brands[0].id;
  populateBrandDropdown('taskBrand', defaultBrand);
  document.getElementById('inlineNewTaskBrandBox').classList.add('hidden');
  document.getElementById('inlineTaskBrandName').value = '';
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDate').value = selectedDate || getTodayISO();
  document.getElementById('taskTime').value = '09:00';
  populateStatusDropdown('Ide / Konsep');
  document.getElementById('taskNotif').checked = true;
  document.getElementById('taskNote').value = '';
  document.getElementById('taskModal').classList.remove('hidden');
}

window.openEditTask = function(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  document.getElementById('taskModalTitle').textContent = 'Edit Jadwal Konten';
  document.getElementById('taskId').value = task.id;
  populateBrandDropdown('taskBrand', task.brandId);
  document.getElementById('inlineNewTaskBrandBox').classList.add('hidden');
  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskDate').value = task.date;
  document.getElementById('taskTime').value = task.time || '';
  populateStatusDropdown(task.status);
  document.getElementById('taskPlatform').value = task.platform;
  document.getElementById('taskNotif').checked = task.notif;
  document.getElementById('taskNote').value = task.note || '';
  document.getElementById('taskModal').classList.remove('hidden');
};

window.changeTaskStatus = function(id, newStatus) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.status = newStatus;
    saveState();
    showToast(`Status diubah ke "${newStatus}"`);
  }
};

window.toggleTaskNotif = function(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.notif = !task.notif;
    task.notified = false;
    saveState();
    showToast(task.notif ? 'Notifikasi diaktifkan 🔔' : 'Notifikasi dimatikan 🔕');
  }
};

window.deleteTask = function(id) {
  if (!confirm('Hapus jadwal konten ini?')) return;
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveState();
  showToast('Jadwal dihapus');
};

function openNewNoteModal() {
  document.getElementById('noteModalTitle').textContent = 'Catatan Project Baru';
  document.getElementById('noteId').value = '';
  const defaultBrand = activeBrandId !== 'ALL' ? activeBrandId : state.brands[0].id;
  populateBrandDropdown('noteBrand', defaultBrand);
  document.getElementById('inlineNewNoteBrandBox').classList.add('hidden');
  document.getElementById('inlineNoteBrandName').value = '';
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteTag').value = '';
  document.getElementById('noteBody').value = '';
  document.getElementById('noteModal').classList.remove('hidden');
}

window.openEditNote = function(id) {
  const note = state.notes.find(n => n.id === id);
  if (!note) return;
  document.getElementById('noteModalTitle').textContent = 'Edit Catatan Project';
  document.getElementById('noteId').value = note.id;
  populateBrandDropdown('noteBrand', note.brandId);
  document.getElementById('inlineNewNoteBrandBox').classList.add('hidden');
  document.getElementById('noteTitle').value = note.title;
  document.getElementById('noteTag').value = note.tag || '';
  document.getElementById('noteBody').value = note.body;
  document.getElementById('noteModal').classList.remove('hidden');
};

window.deleteNote = function(id) {
  if (!confirm('Hapus catatan ini?')) return;
  state.notes = state.notes.filter(n => n.id !== id);
  saveState();
  showToast('Catatan dihapus');
};

window.removeCustomStatus = function(st) {
  state.statuses = state.statuses.filter(s => s !== st);
  saveState();
};

function updateNotifIndicator() {
  const dot = document.getElementById('notifStatusDot');
  if ('Notification' in window && Notification.permission === 'granted') {
    dot.classList.add('granted');
  } else {
    dot.classList.remove('granted');
  }
}

function requestBrowserNotification() {
  if (!('Notification' in window)) {
    showToast('Browser tidak mendukung notifikasi sistem.');
    return;
  }
  Notification.requestPermission().then(perm => {
    updateNotifIndicator();
    if (perm === 'granted') {
      showToast('Notifikasi browser aktif! 🔔');
    }
  });
}

function checkScheduledNotifications() {
  if (!state.globalNotif) return;
  const now = new Date();
  const today = getTodayISO();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  state.tasks.forEach(task => {
    if (task.notif && !task.notified && task.status !== 'Selesai' && task.date === today && task.time === currentTime) {
      task.notified = true;
      saveState();
      const b = getBrandById(task.brandId);
      showToast(`⏰ [${b.name}] ${task.title}`);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Pengingat: ${b.name}`, { body: task.title, icon: 'logo.svg' });
      }
    }
  });
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// =========================================================
// INIT
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const today = getTodayISO();
  document.getElementById('headerDate').textContent = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const dateInput = document.getElementById('filterDateInput');
  dateInput.value = today;
  dateInput.addEventListener('change', (e) => {
    selectedDate = e.target.value || today;
    renderBerandaList();
  });

  document.getElementById('resetTodayBtn').addEventListener('click', () => {
    selectedDate = getTodayISO();
    dateInput.value = selectedDate;
    renderBerandaList();
  });

  document.getElementById('fabAddTask').addEventListener('click', openNewTaskModal);
  document.getElementById('quickAddTopBtn').addEventListener('click', openNewTaskModal);
  document.getElementById('addNoteBtn').addEventListener('click', openNewNoteModal);

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => document.getElementById(btn.dataset.close).classList.add('hidden'));
  });

  // Inline brand creator di Modal Tugas
  document.getElementById('toggleNewTaskBrandBtn').addEventListener('click', () => {
    const box = document.getElementById('inlineNewTaskBrandBox');
    box.classList.toggle('hidden');
    if (!box.classList.contains('hidden')) {
      document.getElementById('inlineTaskBrandName').focus();
    }
  });

  document.getElementById('saveInlineTaskBrandBtn').addEventListener('click', () => {
    const input = document.getElementById('inlineTaskBrandName');
    const created = addNewBrand(input.value);
    if (!created) {
      showToast('Ketik nama brand terlebih dahulu');
      return;
    }
    populateBrandDropdown('taskBrand', created.id);
    input.value = '';
    document.getElementById('inlineNewTaskBrandBox').classList.add('hidden');
    showToast(`Brand "${created.name}" dipilih!`);
  });

  // Inline brand creator di Modal Catatan
  document.getElementById('toggleNewNoteBrandBtn').addEventListener('click', () => {
    const box = document.getElementById('inlineNewNoteBrandBox');
    box.classList.toggle('hidden');
    if (!box.classList.contains('hidden')) {
      document.getElementById('inlineNoteBrandName').focus();
    }
  });

  document.getElementById('saveInlineNoteBrandBtn').addEventListener('click', () => {
    const input = document.getElementById('inlineNoteBrandName');
    const created = addNewBrand(input.value);
    if (!created) {
      showToast('Ketik nama brand terlebih dahulu');
      return;
    }
    populateBrandDropdown('noteBrand', created.id);
    input.value = '';
    document.getElementById('inlineNewNoteBrandBox').classList.add('hidden');
    showToast(`Brand "${created.name}" dipilih!`);
  });

  document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const inlineTyped = document.getElementById('inlineTaskBrandName').value.trim();
    let chosenBrandId = document.getElementById('taskBrand').value;
    if (inlineTyped) {
      const created = addNewBrand(inlineTyped);
      if (created) chosenBrandId = created.id;
    }
    if (!chosenBrandId) {
      chosenBrandId = state.brands[0].id;
    }

    const id = document.getElementById('taskId').value;
    const payload = {
      brandId: chosenBrandId,
      title: document.getElementById('taskTitle').value.trim(),
      date: document.getElementById('taskDate').value,
      time: document.getElementById('taskTime').value,
      status: document.getElementById('taskStatus').value,
      platform: document.getElementById('taskPlatform').value,
      notif: document.getElementById('taskNotif').checked,
      note: document.getElementById('taskNote').value.trim(),
      notified: false
    };

    if (id) {
      const idx = state.tasks.findIndex(t => t.id === id);
      if (idx !== -1) state.tasks[idx] = { ...state.tasks[idx], ...payload };
      showToast('Jadwal diperbarui');
    } else {
      state.tasks.unshift({ id: 't-' + Date.now(), ...payload });
      showToast('Jadwal baru ditambahkan');
    }

    document.getElementById('taskModal').classList.add('hidden');
    saveState();
  });

  document.getElementById('noteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const inlineTyped = document.getElementById('inlineNoteBrandName').value.trim();
    let chosenBrandId = document.getElementById('noteBrand').value;
    if (inlineTyped) {
      const created = addNewBrand(inlineTyped);
      if (created) chosenBrandId = created.id;
    }
    if (!chosenBrandId) {
      chosenBrandId = state.brands[0].id;
    }

    const id = document.getElementById('noteId').value;
    const payload = {
      brandId: chosenBrandId,
      title: document.getElementById('noteTitle').value.trim(),
      tag: document.getElementById('noteTag').value.trim() || 'Catatan',
      body: document.getElementById('noteBody').value.trim(),
      updatedAt: getTodayISO()
    };

    if (id) {
      const idx = state.notes.findIndex(n => n.id === id);
      if (idx !== -1) state.notes[idx] = { ...state.notes[idx], ...payload };
      showToast('Catatan diperbarui');
    } else {
      state.notes.unshift({ id: 'n-' + Date.now(), ...payload });
      showToast('Catatan disimpan');
    }

    document.getElementById('noteModal').classList.add('hidden');
    saveState();
  });

  document.getElementById('addBrandBtn').addEventListener('click', () => {
    const input = document.getElementById('newBrandInput');
    const colorInput = document.getElementById('newBrandColor');
    const created = addNewBrand(input.value, colorInput.value);
    if (!created) return;
    input.value = '';
    showToast(`Brand "${created.name}" ditambahkan!`);
  });

  document.getElementById('searchProjectInput').addEventListener('input', renderAllProjects);
  document.getElementById('projectSortSelect').addEventListener('change', renderAllProjects);

  document.getElementById('reportBrandFilter').addEventListener('change', renderReport);
  document.getElementById('reportStartDate').addEventListener('change', renderReport);
  document.getElementById('reportEndDate').addEventListener('change', renderReport);
  document.getElementById('printReportBtn').addEventListener('click', () => window.print());

  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    const rows = [['No', 'Tanggal', 'Jam', 'Brand', 'Judul Konten', 'Platform', 'Status', 'Catatan']];
    state.tasks.forEach((t, i) => {
      rows.push([
        i + 1,
        t.date,
        t.time || '',
        getBrandById(t.brandId).name,
        `"${t.title.replace(/"/g, '""')}"`,
        t.platform,
        t.status,
        `"${(t.note || '').replace(/"/g, '""')}"`
      ]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `laporan-konten-${getTodayISO()}.csv`);
    link.click();
  });

  document.getElementById('notifPermBtn').addEventListener('click', requestBrowserNotification);
  document.getElementById('globalNotifToggle').addEventListener('change', (e) => {
    state.globalNotif = e.target.checked;
    saveState();
  });

  document.getElementById('addCustomStatusBtn').addEventListener('click', () => {
    const input = document.getElementById('newStatusInput');
    const val = input.value.trim();
    if (val && !state.statuses.includes(val)) {
      state.statuses.push(val);
      input.value = '';
      saveState();
      showToast(`Status "${val}" ditambahkan`);
    }
  });

  document.getElementById('exportDataBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contentflow-multibrand-backup-${getTodayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('importDataInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (imported.tasks && imported.brands) {
          state = imported;
          saveState();
          showToast('Backup data berhasil dipulihkan!');
        }
      } catch (err) {
        showToast('File JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('resetDemoBtn').addEventListener('click', () => {
    if (!confirm('Kembalikan ke 5 brand default & data awal?')) return;
    state = getInitialData();
    activeBrandId = 'ALL';
    saveState();
    showToast('Data dikembalikan ke pengaturan awal');
  });

  initNavigation();
  renderAll();
  setInterval(checkScheduledNotifications, 15000);
});
