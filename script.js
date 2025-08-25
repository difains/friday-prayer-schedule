// Seoul Central Church Friday Prayer Worship Team Schedule Management System
// Created: 2025
// Description: Complete schedule management system with Firebase Realtime Database integration

class FridayPrayerScheduleManager {
  constructor() {
    // Initialize core properties
    this.schedules = [];
    this.extraInfo = {};
    this.currentDate = new Date();
    this.allExpanded = true;
    this.nextId = 1;
    
    // Role configuration with emojis and priority order
    this.roleConfig = {
      '찬양인도': { emoji: '🎤', order: 1 },
      '싱어': { emoji: '🎵', order: 2 },
      '메인건반': { emoji: '🎹', order: 3 },
      '세컨건반': { emoji: '⌨️', order: 4 },
      '어쿠스틱 기타': { emoji: '🎸', order: 5 },
      '일렉 기타': { emoji: '🎸', order: 6 },
      '드럼': { emoji: '🥁', order: 7 },
      '베이스': { emoji: '🎸', order: 8 },
      '엔지니어': { emoji: '🎚️', order: 9 }
    };
    
    // Firebase configuration (will be set up separately)
    this.firebaseConfig = null;
    this.db = null;
    
    // Initialize the application
    this.init();
  }

  // Initialize all event listeners and setup
  init() {
    this.bindEvents();
    this.updateMonthDisplay();
    this.setDefaultFridayDate();
    this.setupDateValidation();
    this.renderSchedules();
    this.renderExtraInfo();
    this.loadFromLocalStorage(); // Fallback before Firebase
  }

  // Bind all event listeners
  bindEvents() {
    // Month navigation
    document.getElementById('prevMonth')?.addEventListener('click', () => this.changeMonth(-1));
    document.getElementById('nextMonth')?.addEventListener('click', () => this.changeMonth(1));

    // Form submission
    document.getElementById('scheduleForm')?.addEventListener('submit', (e) => this.handleFormSubmit(e));

    // Toggle all schedules
    document.getElementById('toggleAllSchedules')?.addEventListener('click', () => this.toggleAllSchedules());

    // Modal events
    document.getElementById('closeEditModal')?.addEventListener('click', () => this.closeModal());
    document.getElementById('cancelEdit')?.addEventListener('click', () => this.closeModal());
    document.getElementById('saveEdit')?.addEventListener('click', () => this.saveEditedSchedule());

    // Modal overlay click to close
    document.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeModal();
      }
    });

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !document.getElementById('editModal')?.classList.contains('hidden')) {
        this.closeModal();
      }
    });

    // Toast close
    document.getElementById('toastClose')?.addEventListener('click', () => this.hideToast());

    // Logo click to refresh
    document.querySelector('.logo-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.refreshPage();
    });
  }

  // Date validation and restriction setup
  setupDateValidation() {
    const dateInputs = ['scheduleDate', 'editScheduleDate'];
    
    dateInputs.forEach(inputId => {
      const input = document.getElementById(inputId);
      if (input) {
        // Set min and max dates
        const currentYear = new Date().getFullYear();
        input.min = `${currentYear - 1}-01-01`;
        input.max = `${currentYear + 5}-12-31`;
        
        // Add change event listener to validate Friday selection
        input.addEventListener('change', (e) => this.validateFridaySelection(e));
        input.addEventListener('input', (e) => this.validateFridaySelection(e));
      }
    });
  }

  // Set default date to next Friday
  setDefaultFridayDate() {
    const nextFriday = this.getNextFriday(new Date());
    const nextFridayString = this.formatDateForInput(nextFriday);
    
    const dateInput = document.getElementById('scheduleDate');
    if (dateInput && !dateInput.value) {
      dateInput.value = nextFridayString;
    }
  }

  // Get next Friday from given date
  getNextFriday(date) {
    const result = new Date(date);
    const dayOfWeek = result.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    
    if (daysUntilFriday === 0 && result.getHours() > 12) {
      // If it's already Friday afternoon, get next Friday
      result.setDate(result.getDate() + 7);
    } else {
      result.setDate(result.getDate() + daysUntilFriday);
    }
    
    return result;
  }

  // Validate that selected date is a Friday
  validateFridaySelection(e) {
    const selectedDate = new Date(e.target.value);
    const dayOfWeek = selectedDate.getDay();
    
    if (e.target.value && dayOfWeek !== 5) { // 5 = Friday
      this.showToast('금요일만 선택할 수 있습니다.', 'error');
      
      // Reset to next Friday
      const nextFriday = this.getNextFriday(new Date());
      e.target.value = this.formatDateForInput(nextFriday);
    }
  }

  // Format date for HTML date input
  formatDateForInput(date) {
    return date.toISOString().split('T')[0];
  }

  // Format date for display (Korean format)
  formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  }

  // Check if date is first Friday of the month
  isFirstFridayOfMonth(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Find first Friday of the month
    const firstDay = new Date(year, month, 1);
    const firstFriday = this.getNextFriday(firstDay);
    
    // Adjust if first Friday is actually in previous month
    if (firstFriday.getMonth() !== month) {
      firstFriday.setDate(firstFriday.getDate() + 7);
    }
    
    return date.toDateString() === firstFriday.toDateString();
  }

  // Handle form submission
  handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const scheduleData = {
      id: this.nextId++,
      date: formData.get('scheduleDate'),
      role: formData.get('scheduleRole'),
      name: formData.get('scheduleName').trim(),
      createdAt: new Date().toISOString()
    };
    
    // Validate data
    if (!this.validateScheduleData(scheduleData)) {
      return;
    }
    
    // Add to schedules array
    this.schedules.push(scheduleData);
    
    // Save to storage/Firebase
    this.saveData();
    
    // Update UI
    this.renderSchedules();
    this.renderExtraInfo();
    
    // Reset form
    e.target.reset();
    this.setDefaultFridayDate();
    
    // Show success message
    this.showToast(`${scheduleData.role} 역할로 ${scheduleData.name}님이 추가되었습니다.`, 'success');
  }

  // Validate schedule data
  validateScheduleData(data) {
    if (!data.date) {
      this.showToast('날짜를 선택해주세요.', 'error');
      return false;
    }
    
    if (!data.role) {
      this.showToast('역할을 선택해주세요.', 'error');
      return false;
    }
    
    if (!data.name) {
      this.showToast('이름을 입력해주세요.', 'error');
      return false;
    }
    
    // Check if it's a Friday
    const selectedDate = new Date(data.date);
    if (selectedDate.getDay() !== 5) {
      this.showToast('금요일만 선택할 수 있습니다.', 'error');
      return false;
    }
    
    return true;
  }

  // Change month navigation
  changeMonth(direction) {
    this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    this.updateMonthDisplay();
    this.renderSchedules();
    this.renderExtraInfo();
  }

  // Update month display in header
  updateMonthDisplay() {
    const monthElement = document.getElementById('currentMonth');
    if (monthElement) {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth() + 1;
      monthElement.textContent = `${year}년 ${month}월`;
    }
  }

  // Get schedules for current month
  getCurrentMonthSchedules() {
    const currentYear = this.currentDate.getFullYear();
    const currentMonth = this.currentDate.getMonth();
    
    return this.schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate.getFullYear() === currentYear && 
             scheduleDate.getMonth() === currentMonth;
    });
  }

  // Sort schedules by role order
  sortSchedulesByRole(schedules) {
    return schedules.sort((a, b) => {
      const orderA = this.roleConfig[a.role]?.order || 999;
      const orderB = this.roleConfig[b.role]?.order || 999;
      return orderA - orderB;
    });
  }

  // Group schedules by date
  groupSchedulesByDate(schedules) {
    const grouped = {};
    
    schedules.forEach(schedule => {
      if (!grouped[schedule.date]) {
        grouped[schedule.date] = [];
      }
      grouped[schedule.date].push(schedule);
    });
    
    // Sort each group by role
    Object.keys(grouped).forEach(date => {
      grouped[date] = this.sortSchedulesByRole(grouped[date]);
    });
    
    return grouped;
  }

  // Render all schedules
  renderSchedules() {
    const container = document.getElementById('schedulesList');
    if (!container) return;
    
    const currentMonthSchedules = this.getCurrentMonthSchedules();
    
    if (currentMonthSchedules.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📅</div>
          <h4 class="empty-state__title">등록된 일정이 없습니다</h4>
          <p class="empty-state__text">위 폼에서 새로운 섬김 일정을 추가해보세요</p>
        </div>
      `;
      return;
    }
    
    const groupedSchedules = this.groupSchedulesByDate(currentMonthSchedules);
    const sortedDates = Object.keys(groupedSchedules).sort();
    
    container.innerHTML = sortedDates.map(date => {
      const schedules = groupedSchedules[date];
      const isFirstFriday = this.isFirstFridayOfMonth(date);
      const isExpanded = this.allExpanded ? 'expanded' : '';
      const toggleIcon = this.allExpanded ? '▼' : '▶';
      
      return `
        <div class="schedule-date-group">
          <div class="schedule-date-header" onclick="scheduleManager.toggleDateGroup('${date}')">
            <div class="schedule-date-info">
              <h4 class="schedule-date-title">${this.formatDateForDisplay(date)}</h4>
              ${isFirstFriday ? '<span class="schedule-badge">✨ 전교인 기도회</span>' : ''}
            </div>
            <span class="schedule-toggle ${!this.allExpanded ? 'collapsed' : ''}">${toggleIcon}</span>
          </div>
          <div class="schedule-items ${isExpanded}" id="items-${date}">
            ${schedules.map(schedule => this.renderScheduleItem(schedule)).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  // Render individual schedule item
  renderScheduleItem(schedule) {
    const roleConfig = this.roleConfig[schedule.role] || { emoji: '❓', order: 999 };
    
    return `
      <div class="schedule-item">
        <div class="schedule-item-info">
          <span class="schedule-role-badge">
            ${roleConfig.emoji} ${schedule.role}
          </span>
          <span class="schedule-name">${schedule.name}</span>
        </div>
        <div class="schedule-actions">
          <button class="btn btn--secondary btn--xs" onclick="scheduleManager.editSchedule(${schedule.id})">
            수정
          </button>
          <button class="btn btn--danger btn--xs" onclick="scheduleManager.deleteSchedule(${schedule.id})">
            삭제
          </button>
        </div>
      </div>
    `;
  }

  // Toggle date group visibility
  toggleDateGroup(date) {
    const itemsContainer = document.getElementById(`items-${date}`);
    const toggleIcon = itemsContainer?.parentNode.querySelector('.schedule-toggle');
    
    if (itemsContainer && toggleIcon) {
      const isCurrentlyExpanded = itemsContainer.classList.contains('expanded');
      
      if (isCurrentlyExpanded) {
        itemsContainer.classList.remove('expanded');
        toggleIcon.textContent = '▶';
        toggleIcon.classList.add('collapsed');
      } else {
        itemsContainer.classList.add('expanded');
        toggleIcon.textContent = '▼';
        toggleIcon.classList.remove('collapsed');
      }
    }
  }

  // Toggle all schedules
  toggleAllSchedules() {
    this.allExpanded = !this.allExpanded;
    
    const toggleButton = document.getElementById('toggleAllSchedules');
    const toggleText = document.getElementById('toggleText');
    
    if (toggleText) {
      toggleText.textContent = this.allExpanded ? '📁 모두 닫기' : '📂 모두 열기';
    }
    
    this.renderSchedules();
  }

  // Edit schedule
  editSchedule(id) {
    const schedule = this.schedules.find(s => s.id === id);
    if (!schedule) return;
    
    // Fill modal form
    document.getElementById('editScheduleId').value = schedule.id;
    document.getElementById('editScheduleDate').value = schedule.date;
    document.getElementById('editScheduleRole').value = schedule.role;
    document.getElementById('editScheduleName').value = schedule.name;
    
    // Show modal
    this.showModal();
  }

  // Save edited schedule
  saveEditedSchedule() {
    const id = parseInt(document.getElementById('editScheduleId').value);
    const date = document.getElementById('editScheduleDate').value;
    const role = document.getElementById('editScheduleRole').value;
    const name = document.getElementById('editScheduleName').value.trim();
    
    // Validate
    const scheduleData = { id, date, role, name };
    if (!this.validateScheduleData(scheduleData)) {
      return;
    }
    
    // Find and update schedule
    const scheduleIndex = this.schedules.findIndex(s => s.id === id);
    if (scheduleIndex !== -1) {
      this.schedules[scheduleIndex] = {
        ...this.schedules[scheduleIndex],
        date,
        role,
        name,
        updatedAt: new Date().toISOString()
      };
      
      // Save and update UI
      this.saveData();
      this.renderSchedules();
      this.renderExtraInfo();
      this.closeModal();
      
      this.showToast('일정이 수정되었습니다.', 'success');
    }
  }

  // Delete schedule
  deleteSchedule(id) {
    const schedule = this.schedules.find(s => s.id === id);
    if (!schedule) return;
    
    if (confirm(`${schedule.name}님의 ${schedule.role} 일정을 삭제하시겠습니까?`)) {
      this.schedules = this.schedules.filter(s => s.id !== id);
      
      // Save and update UI
      this.saveData();
      this.renderSchedules();
      this.renderExtraInfo();
      
      this.showToast('일정이 삭제되었습니다.', 'success');
    }
  }

  // Show modal
  showModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      
      // Focus first input
      const firstInput = modal.querySelector('input, select');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }

  // Close modal
  closeModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Render extra info section (conti and YouTube URL)
  renderExtraInfo() {
    const container = document.getElementById('extraInfoContainer');
    const section = document.getElementById('extraInfoSection');
    
    if (!container || !section) return;
    
    const currentMonthSchedules = this.getCurrentMonthSchedules();
    const uniqueDates = [...new Set(currentMonthSchedules.map(s => s.date))].sort();
    
    if (uniqueDates.length === 0) {
      section.style.display = 'none';
      return;
    }
    
    section.style.display = 'block';
    
    container.innerHTML = uniqueDates.map(date => {
      const info = this.extraInfo[date] || { conti: '', youtubeUrl: '' };
      const isFirstFriday = this.isFirstFridayOfMonth(date);
      
      return `
        <div class="extra-info-date-section">
          <div class="extra-info-date-header">
            <h4 class="extra-info-date-title">
              ${this.formatDateForDisplay(date)}
              ${isFirstFriday ? '<span class="schedule-badge">✨ 전교인 기도회</span>' : ''}
            </h4>
          </div>
          <div class="extra-info-form">
            <div class="form-group">
              <label for="conti-${date}" class="form-label">콘티 (찬양 순서)</label>
              <textarea 
                id="conti-${date}" 
                class="form-textarea" 
                placeholder="찬양 순서나 특별한 안내사항을 입력하세요..."
                onchange="scheduleManager.saveExtraInfo('${date}', 'conti', this.value)"
              >${info.conti}</textarea>
            </div>
            <div class="form-group">
              <label for="youtube-${date}" class="form-label">유튜브 URL</label>
              <input 
                type="url" 
                id="youtube-${date}" 
                class="form-input" 
                placeholder="https://www.youtube.com/watch?v=..."
                value="${info.youtubeUrl}"
                onchange="scheduleManager.saveExtraInfo('${date}', 'youtubeUrl', this.value)"
              >
            </div>
            <button 
              type="button" 
              class="btn btn--primary btn--sm"
              onclick="scheduleManager.saveExtraInfoForDate('${date}')"
            >
              저장
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Save extra info for specific date
  saveExtraInfo(date, field, value) {
    if (!this.extraInfo[date]) {
      this.extraInfo[date] = { conti: '', youtubeUrl: '' };
    }
    
    this.extraInfo[date][field] = value;
    this.saveData();
  }

  // Save extra info for entire date
  saveExtraInfoForDate(date) {
    const conti = document.getElementById(`conti-${date}`)?.value || '';
    const youtubeUrl = document.getElementById(`youtube-${date}`)?.value || '';
    
    this.extraInfo[date] = { conti, youtubeUrl };
    this.saveData();
    
    this.showToast('추가 정보가 저장되었습니다.', 'success');
  }

  // Show toast message
  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
      // Remove previous type classes
      toast.classList.remove('error', 'warning', 'info');
      
      // Add current type class
      if (type !== 'success') {
        toast.classList.add(type);
      }
      
      toastMessage.textContent = message;
      toast.classList.remove('hidden');
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        this.hideToast();
      }, 5000);
    }
  }

  // Hide toast message
  hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.classList.add('hidden');
    }
  }

  // Refresh page
  refreshPage() {
    this.currentDate = new Date();
    this.updateMonthDisplay();
    this.setDefaultFridayDate();
    this.renderSchedules();
    this.renderExtraInfo();
    this.showToast('페이지가 새로고침되었습니다.', 'info');
  }

  // Save data to localStorage (fallback before Firebase)
  saveData() {
    try {
      const data = {
        schedules: this.schedules,
        extraInfo: this.extraInfo,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('fridayPrayerSchedules', JSON.stringify(data));
      
      // Save to Firebase Realtime Database when configured
      this.saveToFirebase(data);
      
    } catch (error) {
      console.error('Error saving data:', error);
      this.showToast('데이터 저장 중 오류가 발생했습니다.', 'error');
    }
  }

  // Load data from localStorage (fallback before Firebase)
  loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem('fridayPrayerSchedules');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.schedules = data.schedules || [];
        this.extraInfo = data.extraInfo || {};
        
        // Update nextId
        if (this.schedules.length > 0) {
          this.nextId = Math.max(...this.schedules.map(s => s.id)) + 1;
        }
        
        this.renderSchedules();
        this.renderExtraInfo();
      }
      
      // Load from Firebase when configured
      this.loadFromFirebase();
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.showToast('데이터 로드 중 오류가 발생했습니다.', 'error');
    }
  }

  // Firebase Realtime Database Integration
  initFirebase(config) {
    try {
      // Initialize Firebase with provided config
      this.firebaseConfig = config;
      
      // Initialize Firebase App and Realtime Database
      this.app = firebase.initializeApp(config);
      this.db = firebase.database();
      
      console.log('Firebase Realtime Database 연동 완료:', config);
      this.showToast('Firebase Realtime Database 연동이 준비되었습니다.', 'info');
      
      // Load data from Firebase
      this.loadFromFirebase();
      
    } catch (error) {
      console.error('Firebase initialization error:', error);
      this.showToast('Firebase 연동 중 오류가 발생했습니다.', 'error');
    }
  }

  // Save to Firebase Realtime Database
  async saveToFirebase(data) {
    if (!this.db) return;
    
    try {
      await this.db.ref('schedules').set(data);
      console.log('Realtime Database에 저장 완료:', data);
      
    } catch (error) {
      console.error('Firebase save error:', error);
      this.showToast('Firebase 저장 중 오류가 발생했습니다.', 'error');
    }
  }

  // Load from Firebase Realtime Database
  async loadFromFirebase() {
    if (!this.db) return;
    
    try {
      const snapshot = await this.db.ref('schedules').once('value');
      if (snapshot.exists()) {
        const data = snapshot.val();
        this.schedules = data.schedules || [];
        this.extraInfo = data.extraInfo || {};
        
        // Update nextId
        if (this.schedules.length > 0) {
          this.nextId = Math.max(...this.schedules.map(s => s.id)) + 1;
        }
        
        this.renderSchedules();
        this.renderExtraInfo();
        
        console.log('Firebase에서 데이터 로드 완료');
      }
      
    } catch (error) {
      console.error('Firebase load error:', error);
      this.showToast('Firebase 로드 중 오류가 발생했습니다.', 'error');
    }
  }
}

// Initialize the schedule manager when DOM is loaded
let scheduleManager;

document.addEventListener('DOMContentLoaded', function() {
  scheduleManager = new FridayPrayerScheduleManager();
  
  // Expose to global scope for onclick handlers
  window.scheduleManager = scheduleManager;
});

// Additional Utility Functions
function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function formatTime(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

function exportSchedulesToCSV() {
  const schedules = scheduleManager.getCurrentMonthSchedules();
  if (schedules.length === 0) {
    scheduleManager.showToast('내보낼 일정이 없습니다.', 'warning');
    return;
  }
  
  const csv = [
    ['날짜', '역할', '이름', '등록일시'],
    ...schedules.map(s => [
      scheduleManager.formatDateForDisplay(s.date),
      s.role,
      s.name,
      new Date(s.createdAt).toLocaleString('ko-KR')
    ])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `금요기도회_일정_${scheduleManager.currentDate.getFullYear()}_${scheduleManager.currentDate.getMonth() + 1}.csv`;
  link.click();
  
  scheduleManager.showToast('일정이 CSV 파일로 내보내졌습니다.', 'success');
}

/*
Firebase Realtime Database 연동 가이드:

1. Firebase Console에서 기존 프로젝트 선택
2. Realtime Database가 이미 활성화되어 있음
3. HTML에서 SDK 임포트:
   <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js"></script>

4. Firebase 설정 (기존 설정 그대로 사용):
   const firebaseConfig = {
     apiKey: "AIzaSyDZ07GNmuDrtbca1t-D4elMZM8_JRWrE7E",
     authDomain: "test-250529.firebaseapp.com",
     databaseURL: "https://test-250529-default-rtdb.firebaseio.com",
     projectId: "test-250529",
     storageBucket: "test-250529.firebasestorage.app",
     messagingSenderId: "428973129250",
     appId: "1:428973129250:web:bdb74560e9e8f752fed47b"
   };

5. 초기화:
   scheduleManager.initFirebase(firebaseConfig);

6. Security Rules (소규모 사용자용 - 인증 없이 읽기/쓰기 허용):
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }

   또는 더 안전한 설정:
   {
     "rules": {
       "schedules": {
         ".read": true,
         ".write": true,
         ".validate": "newData.hasChildren(['schedules', 'extraInfo', 'lastUpdated'])"
       }
     }
   }
*/

// GitHub Pages 배포 가이드:
/*
1. GitHub에서 새 저장소 생성
2. 다음 파일들 업로드:
   - index.html
   - style.css  
   - app.js
   - assets/church-logo.png (첨부해주신 로고 파일)

3. 저장소 Settings > Pages에서:
   - Source: "Deploy from a branch"
   - Branch: "main" 선택
   - 폴더: "/ (root)" 선택

4. 몇 분 후 https://username.github.io/repository-name 에서 접속 가능

5. 커스텀 도메인 (선택사항):
   - 도메인 구매 후 DNS 설정
   - CNAME 파일에 도메인 추가
   - Settings > Pages에서 Custom domain 설정
*/