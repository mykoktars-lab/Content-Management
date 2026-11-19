/* =========================================================
   ContentFlow — Logika Aplikasi To-Do & Manajemen Konten
   ========================================================= */

const STORAGE_KEY = 'contentflow_data_v1';

// Helper tanggal hari ini (YYYY-MM-DD) lokal
function getTodayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
}

// Data Default Awal
function getInitialData() {
  const today = getTodayISO();
  return {
    statuses: [
      'Ide / Konsep',
      'Proses Syuting',
      'Editing',
      'Revisi',
      'Siap Upload',
      'Ditunda',
      'Selesai'
    ],
    globalNotif: true,
    tasks: [
      {
        id: 't-' + Date.now() + '-1',
        title: 'Take Video & B-Roll Konten Utama Hari Ini',
        date: today,
        time: '10:00',
        status: 'Proses Syuting',
        platform: 'Instagram / Reels',
        notif: true,
        notified: false,
        note: 'Pastikan pencahayaan cukup, rekam hook 3 detik pertama dengan enerjik.'
      },
      {
        id: 't-' + Date.now() + '-2',
        title: 'Editing Video & Tambah Subtitle Dinamis',
        date: today,
        time: '15:30',
        status: 'Editing',
        platform: 'TikTok',
        notif: true,
        notified: false,
        note: 'Gunakan font tebal di tengah layar, potong jeda napas agar pacing cepat.'
      },
      {
        id: 't-' + Date.now() + '-3',
        title: 'Riset Topik & Thumbnail Konten Minggu Depan',
        date: today,
        time: '20:00',
        status: 'Ditunda',
        platform: 'YouTube',
        notif: false,
        notified: false,
        note: 'Menunggu referensi kompetitor selesai dikumpulkan.'
      }
    ],
    notes: [
      {
        id: 'n-' + Date.now() + '-1',
        title: 'Template Hook Konten Viral',
        tag: 'Copywriting',
        body: '1. "Jangan lakukan hal ini kalau kamu masih..."\n2. "Rahasia yang jarang dibahas soal..."\n3. "Cuma modal ini, hasilnya bisa..."',
        updatedAt: today
      },
      {
        id: 'n-' + Date.now() + '-2',
        title: 'Checklist Sebelum Upload',
        tag: 'SOP Konten',
        body: '- Cek typo di subtitle\n- Pastikan volume musik latar tidak menutupi suara vokal\n- Siapkan caption + 5 hashtag relevan\n- Pilih cover/thumbnail paling jelas',
        updatedAt: today
      }
    ]
  };
}

let state = loadState();
let selectedDate = getTodayISO();
let selectedStatusFilter = 'ALL';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialData();
    return JSON.parse(raw);
  } catch (e) {
    return getInitialData();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}

// Format Tanggal Indonesia
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

// Toast Alert
function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// =========================================================
// NAVIGASI BOTTOM DASHBOARD
// =========================================================
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.view-section');

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      navItems.forEach(n => n.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

// =========================================================
// RENDERING UI
// =========================================================
function getStatusClass(status) {
  const s = status.toLowerCase();
  if (s === 'selesai') return 'status-selesai';
  if (s === 'editing' || s === 'proses syuting') return 'status-editing';
  if (s === 'ditunda' || s === 'revisi') return 'status-ditunda';
  return 'status-default';
}

function createTaskCardHTML(task) {
  const isDone = task.status.toLowerCase() === 'selesai';
  const statusOptions = state.statuses
    .map(st => `<option value="${st}" ${st === task.status ? 'selected' : ''}>${st}</option>`)
    .join('');

  return `
    <article class="task-card ${isDone ? 'is-done' : ''}">
      <div class="task-top">
        <div class="task-meta-badges">
          <span class="badge-platform">${task.platform}</span>
          <span class="badge-notif ${task.notif ? 'on' : 'off'}" title="Klik untuk ubah notifikasi" onclick="toggleTaskNotif('${task.id}')" style="cursor:pointer;">
            ${task.notif ? '🔔 Notif Aktif' : '🔕 Tanpa Notif'}
          </span>
        </div>
        <div class="task-controls">
          <button class="action-icon" onclick="openEditTask('${task.id}')" title="Edit Jadwal">✏️</button>
          <button class="action-icon delete" onclick="deleteTask('${task.id}')" title="Hapus">🗑️</button>
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
  const todayTasks = state.tasks.filter(t => t.date === today);
  const inProgress = state.tasks.filter(t => ['Editing', 'Proses Syuting', 'Revisi'].includes(t.status));
  const doneTasks = state.tasks.filter(t => t.status === 'Selesai');

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
    return `<button class="pill ${active}" data-status="${st}">${label}</button>`;
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
  let filtered = state.tasks.filter(t => t.date === selectedDate);

  if (selectedStatusFilter !== 'ALL') {
    filtered = filtered.filter(t => t.status === selectedStatusFilter);
  }

  filtered.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Belum ada konten atau tugas pada tanggal ini</h3>
        <p>Klik tombol <strong>+</strong> di dashboard bawah untuk membuat jadwal baru.</p>
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

  let list = state.tasks.filter(t =>
    t.title.toLowerCase().includes(keyword) ||
    t.platform.toLowerCase().includes(keyword) ||
    (t.note && t.note.toLowerCase().includes(keyword)) ||
    t.status.toLowerCase().includes(keyword)
  );

  if (sortMode === 'date-asc') {
    list.sort((a, b) => a.date.localeCompare(b.date));
  } else if (sortMode === 'date-desc') {
    list.sort((a, b) => b.date.localeCompare(a.date));
  } else if (sortMode === 'status') {
    list.sort((a, b) => a.status.localeCompare(b.status));
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Tidak ada project ditemukan</h3>
        <p>Coba kata kunci lain atau tambahkan jadwal konten baru.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(createTaskCardHTML).join('');
}

function renderNotes() {
  const container = document.getElementById('notesGrid');
  if (state.notes.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <h3>Belum ada catatan project</h3>
        <p>Simpan skrip video, ide konten, atau catatan penting di sini.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = state.notes.map(note => `
    <article class="note-card">
      <div>
        <span class="note-tag">${escapeHTML(note.tag || 'Catatan Umum')}</span>
        <h3>${escapeHTML(note.title)}</h3>
        <p>${escapeHTML(note.body)}</p>
      </div>
      <div class="note-footer">
        <span>Diperbarui: ${formatIndoDate(note.updatedAt)}</span>
        <div>
          <button class="action-icon" onclick="openEditNote('${note.id}')" title="Edit">✏️</button>
          <button class="action-icon delete" onclick="deleteNote('${note.id}')" title="Hapus">🗑️</button>
        </div>
      </div>
    </article>
  `).join('');
}

function renderSettings() {
  document.getElementById('globalNotifToggle').checked = state.globalNotif;
  const tagContainer = document.getElementById('activeStatusTags');
  tagContainer.innerHTML = state.statuses.map(st => `
    <span class="status-chip">
      ${escapeHTML(st)}
      ${['Selesai', 'Editing', 'Ditunda'].includes(st) ? '' : `<button onclick="removeCustomStatus('${st}')" style="background:none;border:none;color:#fb7185;cursor:pointer;font-weight:bold;">&times;</button>`}
    </span>
  `).join('');
}

function renderAll() {
  renderStats();
  renderFilterPills();
  renderBerandaList();
  renderAllProjects();
  renderNotes();
  renderSettings();
  updateNotifIndicator();
}

// =========================================================
// AKSI CRUD TUGAS & CATATAN
// =========================================================
function populateStatusDropdown(selectedVal = 'Ide / Konsep') {
  const select = document.getElementById('taskStatus');
  select.innerHTML = state.statuses
    .map(st => `<option value="${st}" ${st === selectedVal ? 'selected' : ''}>${st}</option>`)
    .join('');
}

function openNewTaskModal() {
  document.getElementById('taskModalTitle').textContent = 'Tambah Jadwal Konten / Tugas';
  document.getElementById('taskId').value = '';
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDate').value = selectedDate || getTodayISO();
  document.getElementById('taskTime').value = '09:00';
  populateStatusDropdown('Ide / Konsep');
  document.getElementById('taskPlatform').value = 'Instagram / Reels';
  document.getElementById('taskNotif').checked = true;
  document.getElementById('taskNote').value = '';
  document.getElementById('taskModal').classList.remove('hidden');
}

window.openEditTask = function(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  document.getElementById('taskModalTitle').textContent = 'Edit Jadwal Konten';
  document.getElementById('taskId').value = task.id;
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

// Notes CRUD
function openNewNoteModal() {
  document.getElementById('noteModalTitle').textContent = 'Catatan Project Baru';
  document.getElementById('noteId').value = '';
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
  showToast(`Status "${st}" dihapus`);
};

// =========================================================
// SISTEM NOTIFIKASI PENGINGAT
// =========================================================
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
    showToast('Browser ini tidak mendukung notifikasi sistem.');
    return;
  }
  Notification.requestPermission().then(perm => {
    updateNotifIndicator();
    if (perm === 'granted') {
      showToast('Notifikasi browser aktif! 🔔');
      new Notification('ContentFlow Siap!', {
        body: 'Kamu akan menerima pengingat sesuai jadwal kontenmu.',
        icon: 'logo.svg'
      });
    } else {
      showToast('Izin notifikasi ditolak browser.');
    }
  });
}

function checkScheduledNotifications() {
  if (!state.globalNotif) return;
  const now = new Date();
  const today = getTodayISO();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hh}:${mm}`;

  state.tasks.forEach(task => {
    if (
      task.notif &&
      !task.notified &&
      task.status !== 'Selesai' &&
      task.date === today &&
      task.time === currentTime
    ) {
      task.notified = true;
      saveState();
      showToast(`⏰ Waktunya: ${task.title}`);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Pengingat Konten: ${task.platform}`, {
          body: `${task.title} (${task.status})`,
          icon: 'logo.svg'
        });
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
// INISIALISASI EVENT LISTENER
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  // Set header date
  const today = getTodayISO();
  document.getElementById('headerDate').textContent = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
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

  // Modal Triggers
  document.getElementById('fabAddTask').addEventListener('click', openNewTaskModal);
  document.getElementById('quickAddTopBtn').addEventListener('click', openNewTaskModal);
  document.getElementById('addNoteBtn').addEventListener('click', openNewNoteModal);

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById(btn.dataset.close).classList.add('hidden');
    });
  });

  // Submit Task Form
  document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('taskId').value;
    const payload = {
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
      showToast('Jadwal berhasil diperbarui');
    } else {
      state.tasks.unshift({ id: 't-' + Date.now(), ...payload });
      showToast('Jadwal konten baru ditambahkan');
    }

    document.getElementById('taskModal').classList.add('hidden');
    saveState();
  });

  // Submit Note Form
  document.getElementById('noteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('noteId').value;
    const payload = {
      title: document.getElementById('noteTitle').value.trim(),
      tag: document.getElementById('noteTag').value.trim() || 'Catatan Project',
      body: document.getElementById('noteBody').value.trim(),
      updatedAt: getTodayISO()
    };

    if (id) {
      const idx = state.notes.findIndex(n => n.id === id);
      if (idx !== -1) state.notes[idx] = { ...state.notes[idx], ...payload };
      showToast('Catatan diperbarui');
    } else {
      state.notes.unshift({ id: 'n-' + Date.now(), ...payload });
      showToast('Catatan project disimpan');
    }

    document.getElementById('noteModal').classList.add('hidden');
    saveState();
  });

  // Search & Sort
  document.getElementById('searchProjectInput').addEventListener('input', renderAllProjects);
  document.getElementById('projectSortSelect').addEventListener('change', renderAllProjects);

  // Notification button & global toggle
  document.getElementById('notifPermBtn').addEventListener('click', requestBrowserNotification);
  document.getElementById('globalNotifToggle').addEventListener('change', (e) => {
    state.globalNotif = e.target.checked;
    saveState();
    showToast(state.globalNotif ? 'Notifikasi global aktif' : 'Notifikasi global nonaktif');
  });

  // Custom Status
  document.getElementById('addCustomStatusBtn').addEventListener('click', () => {
    const input = document.getElementById('newStatusInput');
    const val = input.value.trim();
    if (!val) return;
    if (!state.statuses.includes(val)) {
      state.statuses.push(val);
      input.value = '';
      saveState();
      showToast(`Status "${val}" ditambahkan`);
    }
  });

  // Export & Import JSON
  document.getElementById('exportDataBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contentflow-backup-${getTodayISO()}.json`;
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
        if (imported.tasks && imported.notes) {
          state = imported;
          saveState();
          showToast('Data berhasil dipulihkan!');
        }
      } catch (err) {
        showToast('File JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  });

  // Reset Demo Data
  document.getElementById('resetDemoBtn').addEventListener('click', () => {
    if (!confirm('Kembalikan semua data ke contoh awal?')) return;
    state = getInitialData();
    saveState();
    showToast('Data direset ke pengaturan awal');
  });

  initNavigation();
  renderAll();
  setInterval(checkScheduledNotifications, 15000);
});
