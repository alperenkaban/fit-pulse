/**
 * FITPULSE • AKILLI KİLO, METABOLİZMA & KALORİ TAKİBİ
 * Akıllı Form & Sağlıklı Yaşam Motoru
 */

// Storage Keys
const STORAGE_KEYS = {
  PROFILE: 'fitpulse_user_profile',
  LOGS: 'fitpulse_daily_logs'
};

// Global App State
let appState = {
  profile: null,
  logs: {}, // Format: { 'YYYY-MM-DD': { weight: 64.2, calories: 1550, water: 6, notes: '...' } }
  currentDate: new Date(),
  selectedDateStr: getFormattedDateKey(new Date())
};

// Motivational Quotes (Dengeli Beslenme & Form)
const MOTIVATIONAL_QUOTES = [
  "Metabolizmanı dengeli besinlerle yakıtla ki yağları yaksın. Bugün güçlü ve enerjik bir gün olsun.",
  "Unutma: Kilo vermek bir sprint değil, sağlıklı bir maraton. Aç kalmadan hedefine koşuyoruz!",
  "Sağlık aç kalarak bayılmak değil, canlı ve enerjik olmaktır! Yemeğini ye, suyunu iç.",
  "Kendine eziyet etme. Bilimsel ve dengeli adımlarla sağlıklı fitliğe ulaş!",
  "Bugün metabolizmana iyi bak; organlarının, beyninin ve cildinin kaloriye ihtiyacı var."
];

// Helper: Format Date to YYYY-MM-DD
function getFormattedDateKey(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Pretty Format Turkish Date
function formatTurkishDate(dateStr) {
  const parts = dateStr.split('-');
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${days[d.getDay()]}`;
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();

  if (!appState.profile) {
    // Show Onboarding Modal
    document.getElementById('onboardingModal').style.display = 'flex';
  } else {
    document.getElementById('onboardingModal').style.display = 'none';
    refreshAllViews();
  }
  checkCoachNotifications();
});

/* ==========================================================================
   STORAGE & STATE
   ========================================================================== */
function loadData() {
  const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (savedProfile) {
    try {
      appState.profile = JSON.parse(savedProfile);
    } catch (e) {
      console.error("Profil yüklenemedi", e);
    }
  }

  const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
  if (savedLogs) {
    try {
      appState.logs = JSON.parse(savedLogs);
    } catch (e) {
      console.error("Günlükler yüklenemedi", e);
    }
  }
}

function saveProfile(profileData) {
  appState.profile = profileData;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profileData));
}

function saveLogs() {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(appState.logs));
}

/* ==========================================================================
   CALCULATIONS (BMR, TDEE, DEFICIT & ETA)
   ========================================================================== */
function getCalculatedMetrics() {
  if (!appState.profile) return null;

  const { name, gender, age, height, startWeight, targetWeight, activityMultiplier } = appState.profile;

  // Find latest weight logged in calendar, or fall back to startWeight
  let currentWeight = startWeight;
  const sortedDates = Object.keys(appState.logs).sort();
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const entry = appState.logs[sortedDates[i]];
    if (entry && entry.weight && !isNaN(entry.weight)) {
      currentWeight = parseFloat(entry.weight);
      break;
    }
  }

  // 1. BMR (Mifflin-St Jeor)
  // Kadın: (10 * kilo) + (6.25 * boy) - (5 * yas) - 161
  // Erkek: (10 * kilo) + (6.25 * boy) - (5 * yas) + 5
  let bmr = 0;
  if (gender === 'female') {
    bmr = (10 * currentWeight) + (6.25 * height) - (5 * age) - 161;
  } else {
    bmr = (10 * currentWeight) + (6.25 * height) - (5 * age) + 5;
  }
  bmr = Math.round(bmr);

  // 2. TDEE
  const actMult = parseFloat(activityMultiplier) || 1.375;
  const tdee = Math.round(bmr * actMult);

  // 3. Recommended Calorie Target (Sağlıklı Kilo Verme Açığı ~400-500 kcal)
  // Crash diet engeli: Asla kadın için 1200'ün veya BMR'ın belirgin altına düşürme!
  let healthyTarget = tdee - 450;
  if (healthyTarget < bmr) {
    healthyTarget = bmr; // En azından bazal metabolizma kadar yemeli
  }
  if (gender === 'female' && healthyTarget < 1250) {
    healthyTarget = 1250;
  }
  healthyTarget = Math.round(healthyTarget);

  // 4. Remaining Weight & ETA Calculation
  const remainingWeight = Math.max(0, currentWeight - targetWeight);
  const totalWeightToLose = Math.max(0.1, startWeight - targetWeight);
  const lostSoFar = Math.max(0, startWeight - currentWeight);
  const progressPercent = Math.min(100, Math.max(0, Math.round((lostSoFar / totalWeightToLose) * 100)));

  // Kalan Süre Hesabı:
  // 1 kg yağ ~ 7700 kcal
  // Günlük açık: tdee - healthyTarget (~450 kcal)
  const dailyDeficit = Math.max(250, tdee - healthyTarget);
  const totalKcalNeeded = remainingWeight * 7700;
  const etaDays = Math.ceil(totalKcalNeeded / dailyDeficit);
  const etaWeeks = (etaDays / 7).toFixed(1);

  return {
    name,
    gender,
    age,
    height,
    startWeight,
    currentWeight,
    targetWeight,
    remainingWeight: remainingWeight.toFixed(1),
    lostSoFar: lostSoFar.toFixed(1),
    progressPercent,
    bmr,
    tdee,
    healthyTarget,
    actMult,
    etaDays,
    etaWeeks
  };
}

/* ==========================================================================
   VIEW UPDATES
   ========================================================================== */
function refreshAllViews() {
  const metrics = getCalculatedMetrics();
  if (!metrics) return;

  // Header
  document.getElementById('navUserName').textContent = metrics.name;
  document.getElementById('navTargetHint').textContent = `Hedef: ${metrics.targetWeight} kg`;
  document.getElementById('navAvatar').textContent = metrics.name.charAt(0).toUpperCase();

  // Hero Section
  document.getElementById('welcomeGreeting').textContent = `Merhaba, ${metrics.name}! ✨`;
  document.getElementById('heroStartWeight').textContent = `${metrics.startWeight} kg`;
  document.getElementById('heroCurrentWeight').textContent = `${metrics.currentWeight} kg`;
  document.getElementById('heroTargetWeight').textContent = `${metrics.targetWeight} kg`;
  document.getElementById('heroRemainingWeight').textContent = `${metrics.remainingWeight} kg`;
  
  if (parseFloat(metrics.remainingWeight) <= 0) {
    document.getElementById('heroEtaDays').textContent = `🎉 Hedefe Ulaşıldı!`;
  } else {
    document.getElementById('heroEtaDays').textContent = `${metrics.etaDays} gün (~${metrics.etaWeeks} hafta)`;
  }

  // Metrics Section
  document.getElementById('bmrDisplay').textContent = metrics.bmr;
  document.getElementById('tdeeDisplay').textContent = metrics.tdee;
  document.getElementById('targetCalorieDisplay').textContent = metrics.healthyTarget;
  document.getElementById('logTargetRef').textContent = metrics.healthyTarget;
  document.getElementById('activityNoteText').innerHTML = `<i class="fa-solid fa-person-walking"></i> İş aktivite katsayısı: ${metrics.actMult}`;

  // Progress Bar in Side Card
  document.getElementById('pbStartLabel').textContent = `Başlangıç: ${metrics.startWeight} kg`;
  document.getElementById('pbTargetLabel').textContent = `Hedef: ${metrics.targetWeight} kg`;
  document.getElementById('pbPercentLabel').textContent = `%${metrics.progressPercent} Başarıldı`;
  document.getElementById('progressFillBar').style.width = `${metrics.progressPercent}%`;

  // Render Calendar
  renderCalendar();

  // Render Selected Day Log
  loadDayLogToForm(appState.selectedDateStr);

  // Render Canvas Chart
  renderWeightChart(metrics);

  // Render Rewards
  renderRewards(metrics);

  // Check Crash Diet on current day
  checkCrashDietWarning(appState.selectedDateStr, metrics);
}

/* ==========================================================================
   CALENDAR LOGIC
   ========================================================================== */
function renderCalendar() {
  const grid = document.getElementById('calendarDaysGrid');
  grid.innerHTML = '';

  const curYear = appState.currentDate.getFullYear();
  const curMonth = appState.currentDate.getMonth();

  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  document.getElementById('monthYearDisplay').textContent = `${monthNames[curMonth]} ${curYear}`;

  // First day of current month
  const firstDayOfMonth = new Date(curYear, curMonth, 1);
  // Total days in month
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  
  // Day of week for 1st day (0 is Sunday, convert to Monday = 0)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  // Previous month filler days
  const prevMonthDays = new Date(curYear, curMonth, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayCell = document.createElement('div');
    dayCell.className = 'cal-day-cell other-month';
    dayCell.innerHTML = `<span class="day-num">${prevMonthDays - i}</span>`;
    grid.appendChild(dayCell);
  }

  const todayStr = getFormattedDateKey(new Date());
  const metrics = getCalculatedMetrics();

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${curYear}-${String(curMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = appState.logs[dateStr];

    const dayCell = document.createElement('div');
    dayCell.className = 'cal-day-cell';
    if (dateStr === todayStr) dayCell.classList.add('is-today');
    if (dateStr === appState.selectedDateStr) dayCell.classList.add('is-selected');

    let weightMiniHtml = '';
    let calBadgeHtml = '';
    let dotHtml = '';

    if (log && log.weight) {
      weightMiniHtml = `<span class="weight-badge-mini">${log.weight}kg</span>`;
      dotHtml = `<span class="cal-dot has-weight"></span>`;
    }

    if (log && log.calories && log.calories > 0) {
      const c = parseInt(log.calories);
      if (c < 1000) {
        calBadgeHtml = `<span class="cal-badge-kcal red" title="Kritik Düşük Kalori!">${c}</span>`;
      } else if (metrics && Math.abs(c - metrics.healthyTarget) <= 250) {
        calBadgeHtml = `<span class="cal-badge-kcal green" title="İdeal Sağlıklı Kalori">${c}</span>`;
      } else {
        calBadgeHtml = `<span class="cal-badge-kcal yellow" title="Günün Kalorisi">${c}</span>`;
      }
    }

    dayCell.innerHTML = `
      <div class="day-cell-top">
        <span class="day-num">${day}</span>
        ${weightMiniHtml}
      </div>
      <div class="day-cell-bottom">
        ${calBadgeHtml}
        ${dotHtml}
      </div>
    `;

    dayCell.addEventListener('click', () => {
      document.querySelectorAll('.cal-day-cell').forEach(c => c.classList.remove('is-selected'));
      dayCell.classList.add('is-selected');
      appState.selectedDateStr = dateStr;
      loadDayLogToForm(dateStr);
      checkCrashDietWarning(dateStr, getCalculatedMetrics());
    });

    grid.appendChild(dayCell);
  }
}

/* ==========================================================================
   DAY LOG FORM & WATER COUNTER
   ========================================================================== */
function loadDayLogToForm(dateStr) {
  document.getElementById('selectedDateTitle').textContent = formatTurkishDate(dateStr);
  const log = appState.logs[dateStr] || { weight: '', calories: '', water: 0, notes: '' };

  document.getElementById('logWeight').value = log.weight || '';
  document.getElementById('logCalories').value = log.calories || '';
  document.getElementById('logNotes').value = log.notes || '';

  // Render water glasses
  renderWaterGlasses(log.water || 0);

  // Status badge update
  const statusBadge = document.getElementById('dayStatusBadge');
  const metrics = getCalculatedMetrics();

  if (!log.calories && !log.weight) {
    statusBadge.className = 'day-status-pill';
    statusBadge.innerHTML = `<i class="fa-regular fa-circle-question"></i> Kayıt Yok`;
  } else if (log.calories && parseInt(log.calories) < 1000 && parseInt(log.calories) > 0) {
    statusBadge.className = 'day-status-pill status-danger';
    statusBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Kritik Düşük Kalori!`;
  } else if (log.calories && metrics && Math.abs(parseInt(log.calories) - metrics.healthyTarget) <= 250) {
    statusBadge.className = 'day-status-pill status-green';
    statusBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Harika Beslenme`;
  } else {
    statusBadge.className = 'day-status-pill status-yellow';
    statusBadge.innerHTML = `<i class="fa-solid fa-circle-info"></i> Dengeli Takip`;
  }
}

function renderWaterGlasses(count) {
  const container = document.getElementById('waterGlassesContainer');
  container.innerHTML = '';
  document.getElementById('waterCountDisplay').textContent = count;

  for (let i = 1; i <= 8; i++) {
    const glass = document.createElement('button');
    glass.type = 'button';
    glass.className = `glass-icon-btn ${i <= count ? 'drank' : ''}`;
    glass.innerHTML = `<i class="fa-solid fa-glass-water"></i>`;
    glass.title = `${i * 250} ml`;

    glass.addEventListener('click', () => {
      let newCount = count;
      if (i === count) {
        newCount = count - 1; // Uncheck
      } else {
        newCount = i;
      }
      if (!appState.logs[appState.selectedDateStr]) {
        appState.logs[appState.selectedDateStr] = {};
      }
      appState.logs[appState.selectedDateStr].water = newCount;
      saveLogs();
      renderWaterGlasses(newCount);
    });

    container.appendChild(glass);
  }
}

/* ==========================================================================
   CRASH DIET DETECTION & EMERGENCY BANNER
   ========================================================================== */
function checkCrashDietWarning(dateStr, metrics) {
  const log = appState.logs[dateStr];
  const alertBox = document.getElementById('crashDietAlertBox');

  if (log && log.calories && parseInt(log.calories) > 0 && parseInt(log.calories) < 1000) {
    alertBox.style.display = 'flex';
    document.getElementById('crashDietAlertMessage').innerHTML = `
      ${formatTurkishDate(dateStr)} için girilen <strong>${log.calories} kcal</strong> sağlıklı sınırın çok altında! 
      Bazal metabolizman <strong>${metrics ? metrics.bmr : 1300} kcal</strong>. Bu kalorinin altına düşersen vücudun enerjisiz kalır ve metabolizman yavaşlar. Lütfen dengeli ve besleyici gıdalar tüket!
    `;
  } else {
    alertBox.style.display = 'none';
  }
}

/* ==========================================================================
   WEIGHT CHART RENDERING (PURE HIGH-PERFORMANCE CANVAS)
   ========================================================================== */
function renderWeightChart(metrics) {
  const canvas = document.getElementById('weightProgressCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Handle high-DPI retina display
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);

  // Collect weight history points
  const points = [];
  points.push({ label: 'Başlangıç', val: metrics.startWeight });

  const sortedDates = Object.keys(appState.logs).sort();
  sortedDates.forEach(dateStr => {
    const entry = appState.logs[dateStr];
    if (entry && entry.weight && !isNaN(entry.weight)) {
      const parts = dateStr.split('-');
      points.push({
        label: `${parts[2]}/${parts[1]}`,
        val: parseFloat(entry.weight)
      });
    }
  });

  // Calculate min and max for chart scale
  const target = metrics.targetWeight;
  const allVals = points.map(p => p.val).concat([target]);
  const minVal = Math.floor(Math.min(...allVals) - 1.5);
  const maxVal = Math.ceil(Math.max(...allVals) + 1.5);

  const padLeft = 40;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 35;

  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBottom;

  function getY(val) {
    return padTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
  }
  function getX(idx, total) {
    if (total <= 1) return padLeft + chartW / 2;
    return padLeft + (idx / (total - 1)) * chartW;
  }

  // Draw Horizontal Grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  const steps = 4;
  for (let s = 0; s <= steps; s++) {
    const val = minVal + (s / steps) * (maxVal - minVal);
    const y = getY(val);
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(w - padRight, y);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '10px Plus Jakarta Sans';
    ctx.textAlign = 'right';
    ctx.fillText(val.toFixed(1), padLeft - 8, y + 3);
  }

  // Draw Target dashed line
  const targetY = getY(target);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padLeft, targetY);
  ctx.lineTo(w - padRight, targetY);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 10px Plus Jakarta Sans';
  ctx.textAlign = 'left';
  ctx.fillText(`Hedef: ${target}kg`, w - padRight - 70, targetY - 6);

  if (points.length === 0) return;

  // Draw Smooth Gradient Fill under curve
  const grad = ctx.createLinearGradient(0, padTop, 0, h - padBottom);
  grad.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
  grad.addColorStop(1, 'rgba(244, 63, 94, 0.0)');

  ctx.beginPath();
  ctx.moveTo(getX(0, points.length), getY(points[0].val));
  for (let i = 1; i < points.length; i++) {
    const prevX = getX(i - 1, points.length);
    const prevY = getY(points[i - 1].val);
    const curX = getX(i, points.length);
    const curY = getY(points[i].val);
    const midX = (prevX + curX) / 2;
    ctx.bezierCurveTo(midX, prevY, midX, curY, curX, curY);
  }
  ctx.lineTo(getX(points.length - 1, points.length), h - padBottom);
  ctx.lineTo(getX(0, points.length), h - padBottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Draw Curve Line
  ctx.beginPath();
  ctx.moveTo(getX(0, points.length), getY(points[0].val));
  for (let i = 1; i < points.length; i++) {
    const prevX = getX(i - 1, points.length);
    const prevY = getY(points[i - 1].val);
    const curX = getX(i, points.length);
    const curY = getY(points[i].val);
    const midX = (prevX + curX) / 2;
    ctx.bezierCurveTo(midX, prevY, midX, curY, curX, curY);
  }
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw Dots & Labels
  points.forEach((p, idx) => {
    const px = getX(idx, points.length);
    const py = getY(p.val);

    // Circle point
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#f43f5e';
    ctx.stroke();

    // Value text above
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(`${p.val}kg`, px, py - 10);

    // X Axis Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Plus Jakarta Sans';
    ctx.fillText(p.label, px, h - 12);
  });
}

/* ==========================================================================
   BAŞARI VE MOTİVASYON ROZETLERİ
   ========================================================================== */
function renderRewards(metrics) {
  const container = document.getElementById('rewardsListContainer');
  container.innerHTML = '';

  const lost = parseFloat(metrics.lostSoFar) || 0;
  const remaining = parseFloat(metrics.remainingWeight) || 0;

  // Milestone definitions
  const rewards = [
    {
      id: 1,
      title: 'İlk Adım Başarısı',
      desc: 'Sağlıklı beslenme ve düzenli takip yolculuğuna kararlı bir başlangıç! 🌟',
      unlocked: lost >= 0.5,
      conditionText: '0.5 kg sağlıklı kayıp'
    },
    {
      id: 2,
      title: 'Metabolizma Kalkanı',
      desc: 'Metabolizma hızını koruyarak sağlıklı ve dengeli yağ yakma başarısı! ⚡',
      unlocked: lost >= 1.5,
      conditionText: '1.5 kg sağlıklı kayıp'
    },
    {
      id: 3,
      title: 'İstikrar ve Disiplin',
      desc: 'Düzenli beslenme ve kalori dengesini harika bir şekilde sürdürme rozeti! 🥗🎯',
      unlocked: lost >= 3.0,
      conditionText: '3.0 kg sağlıklı kayıp'
    },
    {
      id: 4,
      title: 'Büyük Hedef Zaferi',
      desc: 'Hedef kiloya başarıyla ulaşıldı! Sağlıklı, fit ve enerjik yeni bir form! 🏆✨',
      unlocked: remaining <= 0,
      conditionText: 'Hedef kiloya varış'
    }
  ];

  rewards.forEach(r => {
    const item = document.createElement('div');
    item.className = `reward-item ${r.unlocked ? 'unlocked' : 'locked'}`;
    item.innerHTML = `
      <div class="reward-icon-box">
        <i class="fa-solid ${r.unlocked ? 'fa-trophy' : 'fa-lock'}"></i>
      </div>
      <div class="reward-text-box">
        <div class="reward-title">
          ${r.title}
          ${r.unlocked ? '<i class="fa-solid fa-circle-check text-green" style="color:#10b981;font-size:12px;"></i>' : ''}
        </div>
        <div class="reward-desc">${r.desc}</div>
      </div>
      <span class="reward-status-pill">${r.unlocked ? 'Kazanıldı! 🎉' : r.conditionText}</span>
    `;
    container.appendChild(item);
  });
}

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */
function setupEventListeners() {
  // 1. Profile Creation Form (Onboarding)
  const profileForm = document.getElementById('profileForm');
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const newProfile = {
      name: document.getElementById('userName').value.trim() || 'Kullanıcı',
      gender: gender,
      age: parseInt(document.getElementById('userAge').value),
      height: parseFloat(document.getElementById('userHeight').value),
      startWeight: parseFloat(document.getElementById('userWeight').value),
      targetWeight: parseFloat(document.getElementById('targetWeight').value),
      activityMultiplier: parseFloat(document.getElementById('activityLevel').value)
    };

    saveProfile(newProfile);
    document.getElementById('onboardingModal').style.display = 'none';
    refreshAllViews();
    showToast(`Hoş geldin ${newProfile.name}! Metabolizma planın hazır ✨`, 'success');
  });

  // 2. Calendar Month Navigation
  document.getElementById('prevMonthBtn').addEventListener('click', () => {
    appState.currentDate.setMonth(appState.currentDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('nextMonthBtn').addEventListener('click', () => {
    appState.currentDate.setMonth(appState.currentDate.getMonth() + 1);
    renderCalendar();
  });
  document.getElementById('todayBtn').addEventListener('click', () => {
    appState.currentDate = new Date();
    appState.selectedDateStr = getFormattedDateKey(new Date());
    renderCalendar();
    loadDayLogToForm(appState.selectedDateStr);
  });

  // 3. Daily Log Form Submit
  const dailyLogForm = document.getElementById('dailyLogForm');
  dailyLogForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const weightVal = document.getElementById('logWeight').value;
    const calVal = document.getElementById('logCalories').value;
    const noteVal = document.getElementById('logNotes').value;

    if (!appState.logs[appState.selectedDateStr]) {
      appState.logs[appState.selectedDateStr] = {};
    }

    const currentEntry = appState.logs[appState.selectedDateStr];
    currentEntry.weight = weightVal ? parseFloat(weightVal) : '';
    currentEntry.calories = calVal ? parseInt(calVal) : '';
    currentEntry.notes = noteVal;

    saveLogs();
    refreshAllViews();

    // Feedback Toast & Crash Diet Detection
    if (currentEntry.calories && currentEntry.calories < 1000) {
      showToast('⚠️ DİKKAT: Çok az kalori girdin! Yetersiz kalori metabolizmanı yavaşlatır!', 'danger');
    } else {
      showToast('Günün verileri başarıyla kaydedildi! 🌟', 'success');
    }
  });

  // 4. Clear Day Log
  document.getElementById('clearLogBtn').addEventListener('click', () => {
    if (confirm('Bu günün kaydını silmek istediğine emin misin?')) {
      delete appState.logs[appState.selectedDateStr];
      saveLogs();
      refreshAllViews();
      showToast('Günün kaydı temizlendi.', 'warning');
    }
  });

  // 5. Dismiss Emergency Alert Button
  document.getElementById('dismissAlertBtn').addEventListener('click', () => {
    document.getElementById('crashDietAlertBox').style.display = 'none';
    showToast('Aferin sana! Sağlıklı besinler vücudun dostudur 🥑✨', 'success');
  });

  // 6. Edit Profile Modal Triggers
  const profileBadgeBtn = document.getElementById('profileBadgeBtn');
  const editProfileModal = document.getElementById('editProfileModal');
  const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
  const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');

  profileBadgeBtn.addEventListener('click', () => {
    if (!appState.profile) return;
    document.getElementById('editUserName').value = appState.profile.name;
    document.querySelector(`input[name="editGender"][value="${appState.profile.gender}"]`).checked = true;
    document.getElementById('editAge').value = appState.profile.age;
    document.getElementById('editHeight').value = appState.profile.height;
    document.getElementById('editWeight').value = appState.profile.startWeight;
    document.getElementById('editTargetWeight').value = appState.profile.targetWeight;
    document.getElementById('editActivity').value = appState.profile.activityMultiplier;

    editProfileModal.style.display = 'flex';
  });

  function closeEditModal() {
    editProfileModal.style.display = 'none';
  }
  closeProfileModalBtn.addEventListener('click', closeEditModal);
  cancelEditProfileBtn.addEventListener('click', closeEditModal);

  document.getElementById('editProfileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newGender = document.querySelector('input[name="editGender"]:checked').value;
    appState.profile = {
      name: document.getElementById('editUserName').value.trim() || 'Kullanıcı',
      gender: newGender,
      age: parseInt(document.getElementById('editAge').value),
      height: parseFloat(document.getElementById('editHeight').value),
      startWeight: parseFloat(document.getElementById('editWeight').value),
      targetWeight: parseFloat(document.getElementById('editTargetWeight').value),
      activityMultiplier: parseFloat(document.getElementById('editActivity').value)
    };
    saveProfile(appState.profile);
    closeEditModal();
    refreshAllViews();
    showToast('Profilin başarıyla güncellendi!', 'success');
  });

  // Reset all data & start onboarding afresh
  const resetBtn = document.getElementById('resetAllDataBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Tüm kayıtları ve profili silip sıfırdan başlamak istediğine emin misin?')) {
        localStorage.removeItem(STORAGE_KEYS.PROFILE);
        localStorage.removeItem(STORAGE_KEYS.LOGS);
        appState.profile = null;
        appState.logs = {};
        closeEditModal();
        document.getElementById('onboardingModal').style.display = 'flex';
        showToast('Tüm veriler sıfırlandı. Yeni profil oluşturabilirsin!', 'warning');
      }
    });
  }

  // Randomize daily motivational quote on click
  document.getElementById('dailyMotivationalQuote').addEventListener('click', () => {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    document.getElementById('dailyMotivationalQuote').textContent = `"${randomQuote}"`;
  });

  // Window resize re-renders chart cleanly
  window.addEventListener('resize', () => {
    const metrics = getCalculatedMetrics();
    if (metrics) renderWeightChart(metrics);
  });
}

/* ==========================================================================
   TOAST NOTIFICATION UTILITY
   ========================================================================= */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'fa-check-circle';
  if (type === 'danger') icon = 'fa-triangle-exclamation';
  if (type === 'warning') icon = 'fa-circle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================================================
   COACH / ADMIN INCOMING NOTIFICATIONS
   ========================================================================= */
/* ==========================================================================
   COACH / ADMIN LIVE PUSH & REALTIME NOTIFICATIONS (iOS & Web Push)
   ========================================================================== */
const SUPABASE_CONFIG = {
  url: 'https://ufolevhtefxmtjeeqxil.supabase.co',
  anonKey: 'sb_publishable_SdHTchHRadcFHQnI2TAytA_BcrFM6Fs'
};

let clientSupabase = null;

function checkCoachNotifications() {
  initPushAndRealtimeNotifications();
}

function initPushAndRealtimeNotifications() {
  // 1. Service Worker'ı kaydet (PWA & iOS için gerekli)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('FitPulse SW hazır:', reg.scope))
      .catch(err => console.log('SW hatası:', err));
  }

  // 2. Bildirim İzin Butonu Kontrolü
  const pushBar = document.getElementById('pushPromptBar');
  const enableBtn = document.getElementById('enablePushBtn');

  if ('Notification' in window) {
    if (Notification.permission === 'default' && pushBar) {
      pushBar.style.display = 'flex';
    }

    if (enableBtn) {
      enableBtn.addEventListener('click', async () => {
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            if (pushBar) pushBar.style.display = 'none';
            playNotificationChime();
            showToast('Koç bildirimleri aktif edildi! Bildirimler artık telefonuna gelecek. 🔔');
          } else {
            if (pushBar) pushBar.style.display = 'none';
          }
        } catch (e) {
          console.error('Bildirim izin hatası:', e);
        }
      });
    }
  }

  // 3. Supabase Realtime Bağlantısı
  if (window.supabase) {
    try {
      clientSupabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

      // Canlı veritabanı kanalını dinle
      clientSupabase
        .channel('client_notifications_channel')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        }, payload => {
          const n = payload.new;
          if (n) {
            triggerLiveCoachNotification(n.title, n.message, n.type);
          }
        })
        .subscribe((status) => {
          console.log('Supabase Realtime durum:', status);
        });

      // İlk açılışta ve 4 saniyede bir son bildirimi kontrol et (Polling Fallback)
      fetchLatestCoachNotification();
      setInterval(fetchLatestCoachNotification, 4000);
    } catch (e) {
      console.warn('Supabase Realtime başlatılamadı:', e);
    }
  }

  // 4. Yerel Sekmeler İçin BroadcastChannel Dinleyicisi (0ms Anında Tepki)
  try {
    if (window.BroadcastChannel) {
      const bc = new BroadcastChannel('fitpulse_coach_channel');
      bc.onmessage = (event) => {
        const n = event.data;
        if (n) {
          triggerLiveCoachNotification(n.title, n.message, n.type);
        }
      };
    }
  } catch (e) {}

  // 5. Yerel Storage Değişimi Dinleyicisi (Ek Güvence)
  window.addEventListener('storage', (e) => {
    if (e.key === 'fitpulse_admin_sent_notifications') {
      try {
        const list = JSON.parse(e.newValue || '[]');
        if (list.length > 0) {
          const latest = list[0];
          triggerLiveCoachNotification(latest.title, latest.message, latest.type);
        }
      } catch (err) {}
    }
  });

  // Kapatma butonu
  const dismissBtn = document.getElementById('dismissCoachNotifBtn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      const container = document.getElementById('coachLiveNotifContainer');
      if (container) container.style.display = 'none';
    });
  }
}

// Canlı Bildirim Patlatma Fonksiyonu
function triggerLiveCoachNotification(title, message, type) {
  // A) Ses çal (Ding efekti)
  playNotificationChime();

  // B) Cihazın kendi yerel Push Bildirimini patlat (Windows, Mac, iOS, Android)
  if ('Notification' in window && Notification.permission === 'granted') {
    const options = {
      body: message,
      icon: 'assets/icon.png',
      badge: 'assets/favicon.png',
      tag: 'fitpulse-coach-notif',
      renotify: true
    };

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title || 'FitPulse • Koçundan Not', options);
        }).catch(() => {
          try { new Notification(title || 'FitPulse • Koçundan Not', options); } catch (e) {}
        });
      } else {
        new Notification(title || 'FitPulse • Koçundan Not', options);
      }
    } catch (e) {
      console.log('Bildirim API hatası:', e);
    }
  }

  // C) Uygulama İçi Şık Banner'ı Aç
  const container = document.getElementById('coachLiveNotifContainer');
  const titleEl = document.getElementById('coachNotifTitle');
  const msgEl = document.getElementById('coachNotifMessage');

  if (container && titleEl && msgEl) {
    titleEl.textContent = title || '💬 Koçundan Not';
    msgEl.textContent = message;
    container.style.display = 'block';

    // Sayfayı hafifçe bildirime kaydır
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  showToast(`${title}: ${message}`);
}

// Supabase'den son gönderilmiş bildirimi çek
let lastProcessedNotifId = null;

async function fetchLatestCoachNotification() {
  if (!clientSupabase) return;
  try {
    const { data, error } = await clientSupabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0 && !error) {
      const last = data[0];
      const dismissedId = localStorage.getItem('fitpulse_last_dismissed_notif');
      
      // Eğer bu bildirim daha önce gösterilmediyse ve kapatılmadıysa
      if (dismissedId !== last.id && lastProcessedNotifId !== last.id) {
        lastProcessedNotifId = last.id;
        triggerLiveCoachNotification(last.title, last.message, last.type);

        const dismissBtn = document.getElementById('dismissCoachNotifBtn');
        if (dismissBtn) {
          dismissBtn.onclick = () => {
            localStorage.setItem('fitpulse_last_dismissed_notif', last.id);
            const container = document.getElementById('coachLiveNotifContainer');
            if (container) container.style.display = 'none';
          };
        }
      }
    }
  } catch (e) {
    console.log('Son bildirim çekilemedi:', e);
  }
}

// Zarif Melodi / Ding Sesi (Harici dosya gerektirmez, Web Audio API)
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}
