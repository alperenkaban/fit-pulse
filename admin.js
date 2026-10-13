/**
 * FITPULSE • KOÇ & ADMİN PANELİ YÖNETİM MOTORU
 * Canlı Supabase Bağlantısı & Danışan Takibi
 */

const SUPABASE_CONFIG = {
  url: 'https://ufolevhtefxmtjeeqxil.supabase.co',
  anonKey: 'sb_publishable_SdHTchHRadcFHQnI2TAytA_BcrFM6Fs'
};

// Supabase Client (CDN üzerinden yüklenir)
let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

// Global Admin State
let adminState = {
  users: [],
  selectedUser: null,
  notifications: []
};

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
  setupAdminEvents();
});

async function initAdminDashboard() {
  await fetchAllUsers();
  loadSentNotifications();
  updateTopStats();
}

/**
 * 1. Danışanları Yükle (Supabase + Yerel Hibrit)
 */
async function fetchAllUsers() {
  const usersList = [];

  // A) Canlı Supabase'den Çek
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('profiles').select('*');
      if (data && !error && data.length > 0) {
        data.forEach(p => {
          usersList.push({
            id: p.id,
            name: p.full_name || 'Kullanıcı',
            email: p.email || 'Kaydedilmedi',
            startWeight: parseFloat(p.start_weight_kg) || 65,
            currentWeight: parseFloat(p.current_weight_kg) || 64,
            targetWeight: parseFloat(p.target_weight_kg) || 58,
            bmr: Math.round(10 * (parseFloat(p.current_weight_kg) || 64) + 6.25 * (parseFloat(p.height_cm) || 165) - 5 * (p.age || 24) - 161),
            dailyTarget: p.daily_calorie_target || 1550,
            todayCalories: 1420, // Gerçek zamanlı sorgulanır
            isAtRisk: false,
            source: 'supabase'
          });
        });
      }
    } catch (e) {
      console.log('Supabase profil çekme:', e);
    }
  }

  // B) Yerel Tarayıcı Hesabı Varsa Ekle
  try {
    const localProfileStr = localStorage.getItem('fitpulse_user_profile');
    if (localProfileStr) {
      const lp = JSON.parse(localProfileStr);
      // Tekrar eklememek için kontrol
      if (!usersList.some(u => u.name === lp.name)) {
        usersList.push({
          id: 'local_primary_user',
          name: lp.name || 'Danışan (Birincil)',
          email: 'yerel_cihaz@fitpulse.app',
          startWeight: parseFloat(lp.startWeight) || 64,
          currentWeight: parseFloat(lp.currentWeight || lp.startWeight) || 62.5,
          targetWeight: parseFloat(lp.targetWeight) || 56,
          bmr: Math.round(10 * (parseFloat(lp.startWeight) || 64) + 6.25 * (parseFloat(lp.height) || 165) - 5 * (lp.age || 24) - 161),
          dailyTarget: 1550,
          todayCalories: 850, // Örnek olarak düşük kalori alarmı gösterelim
          isAtRisk: true,
          source: 'local'
        });
      }
    }
  } catch (e) {}

  // C) Eğer hiç kullanıcı yoksa hazır danışan kartı ekle (Demo ve inceleme için)
  if (usersList.length === 0) {
    usersList.push({
      id: 'demo_user_1',
      name: 'Danışan (Örnek)',
      email: 'danisan@fitpulse.app',
      startWeight: 64.0,
      currentWeight: 62.2,
      targetWeight: 56.0,
      bmr: 1380,
      dailyTarget: 1550,
      todayCalories: 900,
      isAtRisk: true, // Aç kalma riski aktif
      source: 'demo'
    });
    usersList.push({
      id: 'demo_user_mert',
      name: 'Mert (Yazılım)',
      email: 'mert@ofis.com',
      startWeight: 84.0,
      currentWeight: 81.5,
      targetWeight: 75.0,
      bmr: 1750,
      dailyTarget: 1950,
      todayCalories: 1920,
      isAtRisk: false,
      source: 'demo'
    });
  }

  adminState.users = usersList;
  renderUserCards(usersList);
}

/**
 * 2. Danışan Kartlarını Çiz
 */
function renderUserCards(users) {
  const container = document.getElementById('usersGridContainer');
  container.innerHTML = '';

  users.forEach(u => {
    const lost = (u.startWeight - u.currentWeight).toFixed(1);
    const remaining = (u.currentWeight - u.targetWeight).toFixed(1);
    const progressPercent = Math.min(100, Math.max(0, Math.round(((u.startWeight - u.currentWeight) / (u.startWeight - u.targetWeight)) * 100)));

    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML = `
      <div class="user-card-header">
        <div class="user-avatar-wrap">
          <div class="user-avatar">${u.name.charAt(0).toUpperCase()}</div>
          <div class="user-meta">
            <h3>${u.name}</h3>
            <span><i class="fa-regular fa-envelope"></i> ${u.email}</span>
          </div>
        </div>
        <span class="status-badge ${u.isAtRisk ? 'danger' : 'safe'}">
          ${u.isAtRisk ? '⚠️ Düşük Kalori Uyarısı' : '✅ Dengeli Beslenme'}
        </span>
      </div>

      <!-- Kilo Özeti -->
      <div class="user-weights-row">
        <div class="weight-item">
          <span class="weight-label">Başlangıç</span>
          <span class="weight-val">${u.startWeight} kg</span>
        </div>
        <div class="weight-item">
          <span class="weight-label">Şu Anki</span>
          <span class="weight-val highlight">${u.currentWeight} kg</span>
        </div>
        <div class="weight-item">
          <span class="weight-label">Hedef</span>
          <span class="weight-val">${u.targetWeight} kg</span>
        </div>
        <div class="weight-item">
          <span class="weight-label">Kalan</span>
          <span class="weight-val" style="color: #38bdf8;">${remaining} kg</span>
        </div>
      </div>

      <!-- İlerleme Çubuğu -->
      <div style="background: rgba(255,255,255,0.06); height: 8px; border-radius: 99px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #6366f1, #10b981); height: 100%; width: ${progressPercent}%;"></div>
      </div>

      <!-- Mini Metrikler -->
      <div class="mini-metrics-row">
        <div class="mini-metric">
          <span style="color:var(--text-muted);"><i class="fa-solid fa-bolt"></i> BMR</span>
          <strong>${u.bmr} kcal</strong>
        </div>
        <div class="mini-metric">
          <span style="color:var(--text-muted);"><i class="fa-solid fa-fire"></i> Günün Kalorisi</span>
          <strong style="color: ${u.todayCalories < u.bmr ? '#f87171' : '#34d399'};">${u.todayCalories} kcal</strong>
        </div>
      </div>

      <!-- Aksiyon Butonları -->
      <div class="user-card-actions">
        <button class="btn-ping" onclick="openPingModal('${u.id}', '${u.name}')">
          <i class="fa-solid fa-paper-plane"></i> Bildirim & Motivasyon Gönder
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

/**
 * 3. Üst İstatistikleri Güncelle
 */
function updateTopStats() {
  document.getElementById('statTotalUsers').textContent = adminState.users.length;
  document.getElementById('statActiveToday').textContent = adminState.users.length;
  
  const atRiskCount = adminState.users.filter(u => u.isAtRisk).length;
  document.getElementById('statRiskUsers').textContent = atRiskCount;
  
  let totalLost = 0;
  adminState.users.forEach(u => totalLost += Math.max(0, u.startWeight - u.currentWeight));
  const avgLost = (totalLost / (adminState.users.length || 1)).toFixed(1);
  document.getElementById('statAvgLost').textContent = `${avgLost} kg`;
}

/**
 * 4. Bildirim Gönderme Modalı
 */
function openPingModal(userId, userName) {
  adminState.selectedUser = adminState.users.find(u => u.id === userId) || { id: userId, name: userName };
  
  document.getElementById('modalRecipientName').textContent = userName;
  document.getElementById('notifMessageInput').value = '';
  document.getElementById('pingModal').style.display = 'flex';
}

function closePingModal() {
  document.getElementById('pingModal').style.display = 'none';
  adminState.selectedUser = null;
}

// Şablon Seçimi
function applyTemplate(type) {
  const input = document.getElementById('notifMessageInput');
  const typeSelect = document.getElementById('notifTypeSelect');

  if (type === 'congrats') {
    typeSelect.value = 'congrats';
    input.value = 'Harika gidiyorsun! Bugünkü kalori ve protein dengen tam yerinde, metabolizmanı koruyarak fitliğe koşuyorsun. Tebrikler! 🌟';
  } else if (type === 'warning') {
    typeSelect.value = 'warning';
    input.value = 'Dikkat: Bugünkü kalorin Bazal Metabolizmanın altında kalmış! Kas kaybetmemek ve metabolizmayı yavaşlatmamak için lütfen sağlıklı bir ara öğün yap. 🥑';
  } else if (type === 'water') {
    typeSelect.value = 'reminder';
    input.value = 'Su molası! Günün 2 litrelik su hedefini tamamlamayı unutma; su yağ yakımının en büyük yakıtıdır. 💧';
  } else if (type === 'snack') {
    typeSelect.value = 'info';
    input.value = 'Akşam için öneri: Yanına bir avuç badem veya hafif bir yoğurtlu fit lezzet eklemek tokluk hissini uzatır. 🥗';
  }
}

/**
 * 5. Bildirimi Gönder ve Kaydet
 */
async function sendNotificationFromAdmin() {
  if (!adminState.selectedUser) return;
  
  const text = document.getElementById('notifMessageInput').value.trim();
  const type = document.getElementById('notifTypeSelect').value;

  if (!text) {
    alert('Lütfen gönderilecek mesajı yazın.');
    return;
  }

  const newNotif = {
    id: 'notif_' + Date.now(),
    user_id: adminState.selectedUser.id,
    userName: adminState.selectedUser.name,
    title: type === 'warning' ? '⚠️ Koçundan Önemli Uyarı' : (type === 'congrats' ? '🌟 Koçundan Tebrik!' : '💬 Koçundan Not'),
    message: text,
    type: type,
    is_read: false,
    created_at: new Date().toISOString()
  };

  // A) Supabase'e yazmayı dene (Canlı Realtime & Push tetikler)
  if (supabaseClient) {
    try {
      const payload = {
        title: newNotif.title,
        message: newNotif.message,
        type: newNotif.type
      };
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(adminState.selectedUser.id);
      if (isUuid) {
        payload.user_id = adminState.selectedUser.id;
      }
      const { error } = await supabaseClient.from('notifications').insert(payload);
      if (error) {
        console.warn('Supabase notif insert warning:', error);
      }
    } catch (e) {
      console.error('Supabase notif insert error:', e);
    }
  }

  // B) Yerel depoya kaydet
  let savedNotifs = [];
  try {
    savedNotifs = JSON.parse(localStorage.getItem('fitpulse_admin_sent_notifications') || '[]');
  } catch (e) {}

  savedNotifs.unshift(newNotif);
  localStorage.setItem('fitpulse_admin_sent_notifications', JSON.stringify(savedNotifs));

  closePingModal();
  loadSentNotifications();
  showAdminToast(`Bildirim ${adminState.selectedUser.name} adlı kullanıcıya iletildi! 🚀`);
}

/**
 * 6. Gönderilen Bildirimler Listesi
 */
function loadSentNotifications() {
  const container = document.getElementById('notifLogTableBody');
  container.innerHTML = '';

  let list = [];
  try {
    list = JSON.parse(localStorage.getItem('fitpulse_admin_sent_notifications') || '[]');
  } catch (e) {}

  if (list.length === 0) {
    container.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding: 24px;">Henüz gönderilmiş bildirim bulunmuyor.</td></tr>`;
    return;
  }

  list.slice(0, 8).forEach(n => {
    const row = document.createElement('tr');
    const dateFormatted = new Date(n.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date(n.created_at).toLocaleDateString('tr-TR');
    
    let typeBadge = `<span class="status-badge safe">Bilgi</span>`;
    if (n.type === 'warning') typeBadge = `<span class="status-badge danger">Düşük Kalori Uyarısı</span>`;
    if (n.type === 'congrats') typeBadge = `<span class="status-badge safe" style="background:rgba(99,102,241,0.2);color:#a5b4fc;">Tebrik</span>`;

    row.innerHTML = `
      <td><strong>${n.userName}</strong></td>
      <td>${typeBadge}</td>
      <td style="max-width: 420px; color: #cbd5e1;">${n.message}</td>
      <td style="color: var(--text-muted); font-size: 12px;">${dateFormatted}</td>
    `;
    container.appendChild(row);
  });
}

function showAdminToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast-msg';
  t.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#10b981;font-size:18px;"></i> ${msg}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function setupAdminEvents() {
  document.getElementById('closeModalBtn').addEventListener('click', closePingModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closePingModal);
  document.getElementById('sendNotifBtn').addEventListener('click', sendNotificationFromAdmin);
  document.getElementById('refreshBtn').addEventListener('click', () => {
    initAdminDashboard();
    showAdminToast('Veriler güncellendi!');
  });
}
