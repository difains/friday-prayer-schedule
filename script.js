// Seoul Central Church Friday Prayer Worship Team Schedule Management System
// Created: 2025
// Description: Complete schedule management system with Firebase Realtime Database integration
// QA Fixed Version - 모든 결함 수정 완료

class FridayPrayerScheduleManager {
  constructor() {
    console.log('FridayPrayerScheduleManager 생성자 호출');
    
    // Initialize core properties
    this.schedules = [];
    this.extraInfo = {};
    this.currentDate = new Date();
    this.allExpanded = true;
    this.nextId = 1;
    
    // Firebase 연동 상태 추적
    this.firebaseReady = false;
    this.dataLoaded = false;
    
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
    
    this.bindEvents();
    this.updateMonthDisplay();
    this.setDefaultFridayDate();
    this.setupDateValidation();
    this.renderSchedules();
    this.renderExtraInfo();
    
    // 먼저 로컬스토리지에서 데이터 로드
    this.loadFromLocalStorage();
    
    console.log('앱 설정 완료');
  }

  // Bind all event listeners - 개선된 이벤트 바인딩
  bindEvents() {
    console.log('이벤트 바인딩 시작');
    
    // Month navigation - 더 안정적인 이벤트 바인딩
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('이전 월 클릭');
        this.changeMonth(-1);
      });
      console.log('이전 월 버튼 이벤트 바인딩 완료');
    } else {
      console.error('prevMonth 버튼을 찾을 수 없음');
    }
    
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('다음 월 클릭');
        this.changeMonth(1);
      });
      console.log('다음 월 버튼 이벤트 바인딩 완료');
    } else {
      console.error('nextMonth 버튼을 찾을 수 없음');
    }

    // Form submission
    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleForm) {
      scheduleForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
      console.log('폼 이벤트 바인딩 완료');
    }

    // Toggle all schedules
    const toggleBtn = document.getElementById('toggleAllSchedules');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleAllSchedules();
      });
      console.log('토글 버튼 이벤트 바인딩 완료');
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
      console.log('기본 금요일 날짜 설정:', nextFridayString);
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
    console.log('폼 제출 처리');
    
    const formData = new FormData(e.target);
    const scheduleData = {
      id: this.nextId++,
      date: formData.get('scheduleDate'),
      role: formData.get('scheduleRole'),
      name: formData.get('scheduleName').trim(),
      createdAt: new Date().toISOString()
    };
    
    console.log('새 일정 데이터:', scheduleData);
    
    // Validate data
    if (!this.validateScheduleData(scheduleData)) {
      return;
    }
    
    // Add to schedules array
    this.schedules.push(scheduleData);
    console.log('일정 추가됨. 총 일정 수:', this.schedules.length);
    
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

  // Change month navigation - 개선된 월 이동 로직
  changeMonth(direction) {
    console.log('월 변경:', direction > 0 ? '다음달' : '이전달');
    
    const newDate = new Date(this.currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    this.currentDate = newDate;
    
    console.log('새로운 월:', this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    
    this.updateMonthDisplay();
    this.renderSchedules();
    this.renderExtraInfo();
  }

  // Update month display in header - 개선된 월 표시 업데이트
  updateMonthDisplay() {
    const monthElement = document.getElementById('currentMonth');
    if (monthElement) {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth() + 1;
      const displayText = `${year}년 ${month}월`;
      monthElement.textContent = displayText;
      console.log('월 표시 업데이트:', displayText);
    } else {
      console.error('currentMonth 엘리먼트를 찾을 수 없음');
    }
  }

  // Get schedules for current month
  getCurrentMonthSchedules() {
    const currentYear = this.currentDate.getFullYear();
    const currentMonth = this.currentDate.getMonth();
    
    const filtered = this.schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate.getFullYear() === currentYear && 
             scheduleDate.getMonth() === currentMonth;
    });
    
    console.log(`${currentYear}년 ${currentMonth + 1}월 일정:`, filtered.length, '개');
    return filtered;
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

  // Render all schedules - 개선된 일정 렌더링
  renderSchedules() {
    console.log('일정 렌더링 시작');
    const container = document.getElementById('schedulesList');
    if (!container) {
      console.error('schedulesList 컨테이너를 찾을 수 없음');
      return;
    }
    
    const currentMonthSchedules = this.getCurrentMonthSchedules();
    console.log('현재 월 일정 수:', currentMonthSchedules.length);
    
    if (currentMonthSchedules.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📅</div>
          <h4 class="empty-state__title">등록된 일정이 없습니다</h4>
          <p class="empty-state__text">위 폼에서 새로운 섬김 일정을 추가해보세요</p>
        </div>
      `;
      console.log('빈 상태 표시');
      return;
    }
    
    const groupedSchedules = this.groupSchedulesByDate(currentMonthSchedules);
    const sortedDates = Object.keys(groupedSchedules).sort();
    
    console.log('그룹화된 일정:', Object.keys(groupedSchedules));
    
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
    
    console.log('일정 렌더링 완료');
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
          <button class="btn btn--secondary btn--xs" onclick="scheduleManager.editSchedule(${schedule.id})" type="button">
            수정
          </button>
          <button class="btn btn--danger btn--xs" onclick="scheduleManager.deleteSchedule(${schedule.id})" type="button">
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

  // Save data to localStorage and Firebase - 개선된 저장 로직
  saveData() {
    const data = {
      schedules: this.schedules,
      extraInfo: this.extraInfo,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('데이터 저장 중...', data);
    
    try {
      // 로컬스토리지에 저장
      localStorage.setItem('fridayPrayerSchedules', JSON.stringify(data));
      console.log('로컬스토리지 저장 완료');
      
      // Firebase에 저장
      if (this.firebaseReady) {
        this.saveToFirebase(data);
      }
      
    } catch (error) {
      console.error('데이터 저장 오류:', error);
      this.showToast('데이터 저장 중 오류가 발생했습니다.', 'error');
    }
  }

  // Load data from localStorage - 개선된 로드 로직
  loadFromLocalStorage() {
    console.log('로컬스토리지에서 데이터 로드 시작');
    
    try {
      const savedData = localStorage.getItem('fridayPrayerSchedules');
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log('로컬스토리지 데이터 발견:', data);
        
        this.schedules = Array.isArray(data.schedules) ? data.schedules : [];
        this.extraInfo = data.extraInfo || {};
        
        // Update nextId
        if (this.schedules.length > 0) {
          this.nextId = Math.max(...this.schedules.map(s => s.id || 0)) + 1;
        }
        
        console.log(`로컬스토리지에서 ${this.schedules.length}개 일정 로드 완료`);
        
        this.renderSchedules();
        this.renderExtraInfo();
        this.dataLoaded = true;
      } else {
        console.log('로컬스토리지에 저장된 데이터 없음');
      }
      
    } catch (error) {
      console.error('로컬스토리지 로드 오류:', error);
      this.showToast('로컬 데이터 로드 중 오류가 발생했습니다.', 'warning');
    }
  }

  // Firebase Realtime Database Integration - 개선된 Firebase 연동
  initFirebase(config) {
    console.log('Firebase 초기화 시작:', config);
    
    try {
      // Firebase 중복 초기화 방지
      if (this.firebaseReady) {
        console.log('Firebase 이미 초기화됨');
        return;
      }
      
      // Firebase 초기화
      this.firebaseConfig = config;
      
      // Firebase v8 스타일로 초기화
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      
      this.db = firebase.database();
      this.firebaseReady = true;
      
      console.log('Firebase Realtime Database 연동 완료');
      this.showToast('Firebase 연동이 완료되었습니다.', 'success');
      
      // Firebase에서 데이터 로드
      this.loadFromFirebase();
      
    } catch (error) {
      console.error('Firebase 초기화 오류:', error);
      this.showToast('Firebase 연동 중 오류가 발생했습니다. 로컬 저장소만 사용됩니다.', 'warning');
    }
  }

  // Save to Firebase Realtime Database - 개선된 Firebase 저장
  async saveToFirebase(data) {
    if (!this.firebaseReady || !this.db) {
      console.log('Firebase 미준비 상태, 저장 건너뜀');
      return;
    }
    
    try {
      console.log('Firebase에 데이터 저장 중...');
      await this.db.ref('schedules').set(data);
      console.log('Firebase 저장 완료');
      
    } catch (error) {
      console.error('Firebase 저장 오류:', error);
      this.showToast('온라인 저장 중 오류가 발생했습니다. 로컬 저장은 완료되었습니다.', 'warning');
    }
  }

  // Load from Firebase Realtime Database - 개선된 Firebase 로드
  async loadFromFirebase() {
    if (!this.firebaseReady || !this.db) {
      console.log('Firebase 미준비 상태, 로드 건너뜀');
      return;
    }
    
    try {
      console.log('Firebase에서 데이터 로드 중...');
      const snapshot = await this.db.ref('schedules').once('value');
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Firebase 데이터 발견:', data);
        
        // 로컬 데이터와 Firebase 데이터 비교
        const firebaseSchedules = Array.isArray(data.schedules) ? data.schedules : [];
        const firebaseLastUpdated = data.lastUpdated || '';
        
        // 로컬 데이터 마지막 업데이트 시간
        const localData = localStorage.getItem('fridayPrayerSchedules');
        const localLastUpdated = localData ? JSON.parse(localData).lastUpdated || '' : '';
        
        // Firebase 데이터가 더 최신이거나 로컬 데이터가 없는 경우
        if (!this.dataLoaded || firebaseLastUpdated > localLastUpdated) {
          console.log('Firebase 데이터로 업데이트');
          
          this.schedules = firebaseSchedules;
          this.extraInfo = data.extraInfo || {};
          
          // Update nextId
          if (this.schedules.length > 0) {
            this.nextId = Math.max(...this.schedules.map(s => s.id || 0)) + 1;
          }
          
          // 로컬스토리지도 업데이트
          localStorage.setItem('fridayPrayerSchedules', JSON.stringify(data));
          
          this.renderSchedules();
          this.renderExtraInfo();
          this.dataLoaded = true;
          
          this.showToast(`온라인에서 ${firebaseSchedules.length}개 일정을 불러왔습니다.`, 'info');
        } else {
          console.log('로컬 데이터가 최신, Firebase 로드 건너뜀');
        }
        
      } else {
        console.log('Firebase에 저장된 데이터 없음');
        
        // 로컬 데이터가 있다면 Firebase에 업로드
        if (this.schedules.length > 0) {
          console.log('로컬 데이터를 Firebase에 업로드');
          this.saveToFirebase({
            schedules: this.schedules,
            extraInfo: this.extraInfo,
            lastUpdated: new Date().toISOString()
          });
        }
      }
      
    } catch (error) {
      console.error('Firebase 로드 오류:', error);
      this.showToast('온라인 데이터 로드 중 오류가 발생했습니다. 로컬 데이터를 사용합니다.', 'warning');
    }
  }
}

// Initialize the schedule manager when DOM is loaded
let scheduleManager;

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM 로드 완료, scheduleManager 생성');
  scheduleManager = new FridayPrayerScheduleManager();
  
  // Expose to global scope for onclick handlers
  window.scheduleManager = scheduleManager;
  
  console.log('scheduleManager 전역 등록 완료');
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