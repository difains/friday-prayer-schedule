// Seoul Central Church Friday Prayer Worship Team Schedule Management System
// Firebase JSON 기반 완벽 호환 시스템 (Firebase Config 포함)
// Created: 2025

class FridayPrayerScheduleManager {
  constructor() {
    console.log('FridayPrayerScheduleManager 시작 - Firebase Config 포함');
    
    // 🔥 Firebase Configuration - 실제 프로젝트 정보로 수정 필요
    this.firebaseConfig = {
      apiKey: "AIzaSyDZ07GNmuDrtbca1t-D4elMZM8_JRWrE7E",
      authDomain: "test-250529.firebaseapp.com", 
      databaseURL: "https://test-250529-default-rtdb.firebaseio.com",
      projectId: "test-250529",
      storageBucket: "test-250529.firebasestorage.app",
      messagingSenderId: "428973129250",
      appId: "1:428973129250:web:bdb74560e9e8f752fed47b"
    };
    
    // Initialize core properties based on Firebase JSON structure
    this.prayerList = {}; // Firebase prayerList 구조 그대로 사용
    this.setlists = {}; // Firebase setlists 구조 그대로 사용
    this.youtubeLinks = {}; // Firebase youtubeLinks 구조 그대로 사용
    this.currentDate = new Date();
    this.allExpanded = true;
    
    // Firebase 연동 상태 추적
    this.firebaseReady = false;
    this.dataLoaded = false;
    this.firstLoadComplete = false;
    
    // Role configuration with emojis and priority order (Firebase JSON 기반)
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
    
    // Firebase database reference
    this.db = null;
    
    // Initialize the application
    this.init();
  }

  // Initialize Firebase and setup application
  init() {
    console.log('앱 초기화 시작');
    
    // DOM이 완전히 로드될 때까지 기다림
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupApplication();
      });
    } else {
      this.setupApplication();
    }
  }

  // Setup application after DOM is ready
  setupApplication() {
    console.log('앱 설정 시작');
    
    // Firebase 초기화
    this.initializeFirebase();
    
    this.bindEvents();
    this.updateMonthDisplay();
    this.setDefaultFridayDate();
    this.setupDateValidation();
    
    console.log('앱 설정 완료');
  }

  // Firebase 초기화 및 데이터 로드
  initializeFirebase() {
    try {
      // Firebase 앱 초기화 (중복 방지)
      if (!firebase.apps.length) {
        firebase.initializeApp(this.firebaseConfig);
      }
      
      this.db = firebase.database();
      this.firebaseReady = true;
      console.log('Firebase 연결 성공');
      
      // 실시간 데이터 리스너 설정 (Firebase JSON 구조 기반)
      this.setupFirebaseListeners();
      
    } catch (error) {
      console.error('Firebase 초기화 오류:', error);
      console.log('로컬스토리지에서 데이터 로드 시도');
      this.loadFromLocalStorage();
    }
  }

  // Firebase 실시간 리스너 설정 (Firebase JSON 구조와 정확히 일치)
  setupFirebaseListeners() {
    console.log('Firebase 실시간 리스너 설정 중...');
    
    // prayerList 실시간 리스너 - Firebase JSON과 동일한 구조
    this.db.ref('prayerList').on('value', (snapshot) => {
      this.prayerList = snapshot.val() || {};
      console.log('prayerList 업데이트:', Object.keys(this.prayerList).length, '개 일정');
      this.dataLoaded = true;
      this.renderSchedules();
      this.renderExtraInfo();
      
      // 로컬스토리지에 백업
      this.saveToLocalStorage();
      
      // 성공 메시지 (첫 로드시만)
      if (Object.keys(this.prayerList).length > 0 && !this.firstLoadComplete) {
        this.showToast(`Firebase에서 ${Object.keys(this.prayerList).length}개 일정을 불러왔습니다!`, 'success');
        this.firstLoadComplete = true;
      }
    });

    // setlists 실시간 리스너 - Firebase JSON과 동일한 구조
    this.db.ref('setlists').on('value', (snapshot) => {
      this.setlists = snapshot.val() || {};
      console.log('setlists 업데이트:', Object.keys(this.setlists).length, '개 날짜');
      this.renderExtraInfo();
    });

    // youtubeLinks 실시간 리스너 - Firebase JSON과 동일한 구조
    this.db.ref('youtubeLinks').on('value', (snapshot) => {
      this.youtubeLinks = snapshot.val() || {};
      console.log('youtubeLinks 업데이트:', Object.keys(this.youtubeLinks).length, '개 날짜');
      this.renderExtraInfo();
    });

    this.showToast('Firebase 연결 완료! 실시간 동기화 중입니다.', 'success');
  }

  // 로컬스토리지에서 데이터 로드 (Firebase 실패 시 백업)
  loadFromLocalStorage() {
    console.log('로컬스토리지에서 데이터 로드 중...');
    
    try {
      const savedData = localStorage.getItem('fridayPrayerData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.prayerList = data.prayerList || {};
        this.setlists = data.setlists || {};
        this.youtubeLinks = data.youtubeLinks || {};
        
        console.log('로컬스토리지 데이터 로드 완료:', Object.keys(this.prayerList).length, '개 일정');
        this.dataLoaded = true;
        this.renderSchedules();
        this.renderExtraInfo();
        
        this.showToast('로컬 데이터를 불러왔습니다. Firebase 연결을 확인해주세요.', 'warning');
      } else {
        console.log('저장된 로컬 데이터가 없습니다.');
        this.renderSchedules();
        this.renderExtraInfo();
      }
    } catch (error) {
      console.error('로컬스토리지 로드 오류:', error);
      this.renderSchedules();
      this.renderExtraInfo();
    }
  }

  // 로컬스토리지에 데이터 백업
  saveToLocalStorage() {
    try {
      const data = {
        prayerList: this.prayerList,
        setlists: this.setlists,
        youtubeLinks: this.youtubeLinks,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('fridayPrayerData', JSON.stringify(data));
      console.log('로컬스토리지 백업 완료');
    } catch (error) {
      console.error('로컬스토리지 저장 오류:', error);
    }
  }

  // Bind all event listeners
  bindEvents() {
    console.log('이벤트 바인딩 시작');
    
    // Month navigation
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.changeMonth(-1);
      });
    }
    
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.changeMonth(1);
      });
    }

    // Form submission
    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleForm) {
      scheduleForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Toggle all schedules
    const toggleBtn = document.getElementById('toggleAllSchedules');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleAllSchedules();
      });
    }

    // Modal events
    const closeModalBtn = document.getElementById('closeEditModal');
    const cancelBtn = document.getElementById('cancelEdit');
    const saveBtn = document.getElementById('saveEdit');
    
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeModal();
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeModal();
      });
    }
    
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveEditedSchedule();
      });
    }

    // Modal overlay click to close
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
          this.closeModal();
        }
      });
    }

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('editModal');
        if (modal && !modal.classList.contains('hidden')) {
          this.closeModal();
        }
      }
    });

    // Toast close
    const toastCloseBtn = document.getElementById('toastClose');
    if (toastCloseBtn) {
      toastCloseBtn.addEventListener('click', () => this.hideToast());
    }

    // Logo click to refresh
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.refreshPage();
      });
    }
    
    console.log('모든 이벤트 바인딩 완료');
  }

  // Date validation and restriction setup
  setupDateValidation() {
    const dateInputs = ['scheduleDate', 'editScheduleDate'];
    
    dateInputs.forEach(inputId => {
      const input = document.getElementById(inputId);
      if (input) {
        const currentYear = new Date().getFullYear();
        input.min = `${currentYear - 1}-01-01`;
        input.max = `${currentYear + 5}-12-31`;
        
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
    
    if (e.target.value && dayOfWeek !== 5) {
      this.showToast('금요일만 선택할 수 있습니다.', 'error');
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
    
    const firstDay = new Date(year, month, 1);
    const firstFriday = this.getNextFriday(firstDay);
    
    if (firstFriday.getMonth() !== month) {
      firstFriday.setDate(firstFriday.getDate() + 7);
    }
    
    return date.toDateString() === firstFriday.toDateString();
  }

  // Handle form submission - Firebase prayerList에 직접 추가 (Firebase JSON 구조 준수)
  handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const scheduleData = {
      date: formData.get('scheduleDate'),
      role: formData.get('scheduleRole'),
      name: formData.get('scheduleName').trim()
    };
    
    if (!this.validateScheduleData(scheduleData)) {
      return;
    }
    
    // Firebase prayerList에 직접 추가 (Firebase JSON 구조와 동일)
    if (this.firebaseReady) {
      this.db.ref('prayerList').push(scheduleData)
        .then(() => {
          this.showToast(`${scheduleData.role} 역할로 ${scheduleData.name}님이 추가되었습니다.`, 'success');
          e.target.reset();
          this.setDefaultFridayDate();
        })
        .catch(error => {
          console.error('일정 추가 오류:', error);
          this.showToast('일정 추가 중 오류가 발생했습니다.', 'error');
        });
    } else {
      // Firebase 연결 안된 경우 로컬에만 추가
      const newKey = 'local_' + Date.now();
      this.prayerList[newKey] = scheduleData;
      this.saveToLocalStorage();
      this.renderSchedules();
      
      this.showToast(`${scheduleData.role} 역할로 ${scheduleData.name}님이 추가되었습니다. (로컬 저장)`, 'warning');
      e.target.reset();
      this.setDefaultFridayDate();
    }
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
    
    const selectedDate = new Date(data.date);
    if (selectedDate.getDay() !== 5) {
      this.showToast('금요일만 선택할 수 있습니다.', 'error');
      return false;
    }
    
    return true;
  }

  // Change month navigation
  changeMonth(direction) {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    this.currentDate = newDate;
    
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

  // Get schedules for current month from prayerList (Firebase JSON 구조 기반)
  getCurrentMonthSchedules() {
    const currentYear = this.currentDate.getFullYear();
    const currentMonth = this.currentDate.getMonth();
    
    const schedules = [];
    Object.keys(this.prayerList).forEach(key => {
      const schedule = this.prayerList[key];
      const scheduleDate = new Date(schedule.date);
      
      if (scheduleDate.getFullYear() === currentYear && 
          scheduleDate.getMonth() === currentMonth) {
        schedules.push({
          ...schedule,
          firebaseKey: key
        });
      }
    });
    
    return schedules;
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
    
    Object.keys(grouped).forEach(date => {
      grouped[date] = this.sortSchedulesByRole(grouped[date]);
    });
    
    return grouped;
  }

  // Render all schedules
  renderSchedules() {
    const container = document.getElementById('schedulesList');
    if (!container) {
      console.error('schedulesList 컨테이너를 찾을 수 없음');
      return;
    }
    
    const currentMonthSchedules = this.getCurrentMonthSchedules();
    const totalSchedules = Object.keys(this.prayerList).length;
    
    if (currentMonthSchedules.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📅</div>
          <h4 class="empty-state__title">등록된 일정이 없습니다</h4>
          <p class="empty-state__text">위 폼에서 새로운 섬김 일정을 추가해보세요</p>
          <p class="empty-state__debug">전체 일정 수: ${totalSchedules}개</p>
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
          <button class="btn btn--secondary btn--xs" onclick="scheduleManager.editSchedule('${schedule.firebaseKey}')" type="button">
            수정
          </button>
          <button class="btn btn--danger btn--xs" onclick="scheduleManager.deleteSchedule('${schedule.firebaseKey}')" type="button">
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
    
    const toggleText = document.getElementById('toggleText');
    if (toggleText) {
      toggleText.textContent = this.allExpanded ? '📁 모두 닫기' : '📂 모두 열기';
    }
    
    this.renderSchedules();
  }

  // Edit schedule - Firebase key 사용 (Firebase JSON 구조 준수)
  editSchedule(firebaseKey) {
    const schedule = this.prayerList[firebaseKey];
    if (!schedule) return;
    
    document.getElementById('editScheduleId').value = firebaseKey;
    document.getElementById('editScheduleDate').value = schedule.date;
    document.getElementById('editScheduleRole').value = schedule.role;
    document.getElementById('editScheduleName').value = schedule.name;
    
    this.showModal();
  }

  // Save edited schedule - Firebase에서 직접 수정 (Firebase JSON 구조 준수)
  saveEditedSchedule() {
    const firebaseKey = document.getElementById('editScheduleId').value;
    const date = document.getElementById('editScheduleDate').value;
    const role = document.getElementById('editScheduleRole').value;
    const name = document.getElementById('editScheduleName').value.trim();
    
    const scheduleData = { date, role, name };
    if (!this.validateScheduleData(scheduleData)) {
      return;
    }
    
    if (this.firebaseReady) {
      this.db.ref('prayerList').child(firebaseKey).update(scheduleData)
        .then(() => {
          this.closeModal();
          this.showToast('일정이 수정되었습니다.', 'success');
        })
        .catch(error => {
          console.error('일정 수정 오류:', error);
          this.showToast('일정 수정 중 오류가 발생했습니다.', 'error');
        });
    } else {
      // Firebase 연결 안된 경우 로컬에서만 수정
      if (this.prayerList[firebaseKey]) {
        this.prayerList[firebaseKey] = scheduleData;
        this.saveToLocalStorage();
        this.renderSchedules();
        this.closeModal();
        this.showToast('일정이 수정되었습니다. (로컬 저장)', 'warning');
      }
    }
  }

  // Delete schedule - Firebase에서 직접 삭제 (Firebase JSON 구조 준수)
  deleteSchedule(firebaseKey) {
    const schedule = this.prayerList[firebaseKey];
    if (!schedule) return;
    
    if (confirm(`${schedule.name}님의 ${schedule.role} 일정을 삭제하시겠습니까?`)) {
      if (this.firebaseReady) {
        this.db.ref('prayerList').child(firebaseKey).remove()
          .then(() => {
            this.showToast('일정이 삭제되었습니다.', 'success');
          })
          .catch(error => {
            console.error('일정 삭제 오류:', error);
            this.showToast('일정 삭제 중 오류가 발생했습니다.', 'error');
          });
      } else {
        // Firebase 연결 안된 경우 로컬에서만 삭제
        delete this.prayerList[firebaseKey];
        this.saveToLocalStorage();
        this.renderSchedules();
        this.showToast('일정이 삭제되었습니다. (로컬 저장)', 'warning');
      }
    }
  }

  // Show modal
  showModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      
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

  // Render extra info section (Firebase JSON 구조의 setlists, youtubeLinks 활용)
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
      const conti = this.setlists[date] || '';
      const youtubeUrl = this.youtubeLinks[date] || '';
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
                onchange="scheduleManager.saveSetlist('${date}', this.value)"
              >${conti}</textarea>
            </div>
            <div class="form-group">
              <label for="youtube-${date}" class="form-label">유튜브 URL</label>
              <input 
                type="url" 
                id="youtube-${date}" 
                class="form-input" 
                placeholder="https://www.youtube.com/watch?v=..."
                value="${youtubeUrl}"
                onchange="scheduleManager.saveYoutubeLink('${date}', this.value)"
              >
            </div>
            <button 
              type="button" 
              class="btn btn--primary btn--sm"
              onclick="scheduleManager.saveAllExtraInfo('${date}')"
            >
              저장
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Save setlist to Firebase (Firebase JSON 구조 준수)
  saveSetlist(date, value) {
    if (this.firebaseReady) {
      this.db.ref('setlists').child(date).set(value || null);
    } else {
      this.setlists[date] = value;
      this.saveToLocalStorage();
    }
  }

  // Save YouTube link to Firebase (Firebase JSON 구조 준수)
  saveYoutubeLink(date, value) {
    if (this.firebaseReady) {
      this.db.ref('youtubeLinks').child(date).set(value || null);
    } else {
      this.youtubeLinks[date] = value;
      this.saveToLocalStorage();
    }
  }

  // Save all extra info for date (Firebase JSON 구조 준수)
  saveAllExtraInfo(date) {
    const conti = document.getElementById(`conti-${date}`)?.value || '';
    const youtubeUrl = document.getElementById(`youtube-${date}`)?.value || '';
    
    if (this.firebaseReady) {
      const updates = {};
      updates[`setlists/${date}`] = conti || null;
      updates[`youtubeLinks/${date}`] = youtubeUrl || null;
      
      this.db.ref().update(updates)
        .then(() => {
          this.showToast('추가 정보가 저장되었습니다.', 'success');
        })
        .catch(error => {
          console.error('추가 정보 저장 오류:', error);
          this.showToast('추가 정보 저장 중 오류가 발생했습니다.', 'error');
        });
    } else {
      this.setlists[date] = conti;
      this.youtubeLinks[date] = youtubeUrl;
      this.saveToLocalStorage();
      this.showToast('추가 정보가 저장되었습니다. (로컬 저장)', 'warning');
    }
  }

  // Show toast message
  showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
      toast.classList.remove('error', 'warning', 'info');
      
      if (type !== 'success') {
        toast.classList.add(type);
      }
      
      toastMessage.textContent = message;
      toast.classList.remove('hidden');
      
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
}

// Initialize the schedule manager when DOM is loaded
let scheduleManager;

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM 로드 완료, scheduleManager 생성');
  scheduleManager = new FridayPrayerScheduleManager();
  
  window.scheduleManager = scheduleManager;
  
  console.log('scheduleManager 전역 등록 완료');
});

// Debug function for Firebase connection (Firebase JSON 기반 디버깅)
window.debugFirebaseConnection = function() {
  console.log('=== Firebase 연결 디버그 (Firebase JSON 기반) ===');
  console.log('Firebase 앱:', window.firebase?.apps?.length || 0);
  console.log('Database:', window.firebase?.database ? '✅' : '❌');
  console.log('scheduleManager Firebase 상태:', scheduleManager?.firebaseReady);
  console.log('prayerList 데이터 수:', Object.keys(scheduleManager?.prayerList || {}).length);
  console.log('setlists 데이터 수:', Object.keys(scheduleManager?.setlists || {}).length);
  console.log('youtubeLinks 데이터 수:', Object.keys(scheduleManager?.youtubeLinks || {}).length);
  
  // Firebase JSON 구조와 동일한지 확인
  if (scheduleManager?.prayerList) {
    const sampleKey = Object.keys(scheduleManager.prayerList)[0];
    if (sampleKey) {
      console.log('prayerList 샘플 데이터:', scheduleManager.prayerList[sampleKey]);
    }
  }
};

// Test function for Firebase data access (Firebase JSON 기반 테스트)
window.testFirebaseAccess = function() {
  console.log('=== Firebase 데이터 접근 테스트 ===');
  
  if (window.firebase && window.firebase.database) {
    const db = firebase.database();
    
    // prayerList 접근 테스트
    db.ref('prayerList').limitToFirst(1).once('value')
      .then(snapshot => {
        console.log('✅ prayerList 접근 성공');
        console.log('샘플 데이터:', snapshot.val());
      })
      .catch(error => {
        console.error('❌ prayerList 접근 실패:', error.code, error.message);
      });
      
    // setlists 접근 테스트  
    db.ref('setlists').limitToFirst(1).once('value')
      .then(snapshot => {
        console.log('✅ setlists 접근 성공');
        console.log('샘플 데이터:', snapshot.val());
      })
      .catch(error => {
        console.error('❌ setlists 접근 실패:', error.code, error.message);
      });
      
    // youtubeLinks 접근 테스트
    db.ref('youtubeLinks').limitToFirst(1).once('value')
      .then(snapshot => {
        console.log('✅ youtubeLinks 접근 성공');
        console.log('샘플 데이터:', snapshot.val());
      })
      .catch(error => {
        console.error('❌ youtubeLinks 접근 실패:', error.code, error.message);
      });
      
  } else {
    console.error('❌ Firebase가 초기화되지 않음');
  }
};
