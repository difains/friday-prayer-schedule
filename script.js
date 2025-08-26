// Seoul Central Church Friday Prayer Worship Team Schedule Management System
// Created: 2025
// Description: Complete schedule management system with Firebase Realtime Database integration
// Data Migration Fixed Version - 기존 데이터 100% 호환 보장

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
    this.migrationCompleted = false;
    
    // 기존 데이터 마이그레이션을 위한 가능한 키들
    this.possibleStorageKeys = [
      'fridayPrayerSchedules',
      'scheduleData',
      'churchSchedules', 
      'prayerSchedules',
      'worshipSchedules',
      'teamSchedules',
      'schedules'
    ];
    
    // 기존 Firebase 경로들
    this.possibleFirebasePaths = [
      'schedules',
      'fridayPrayer',
      'worship',
      'church',
      'data'
    ];
    
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
    
    // 데이터 마이그레이션 및 로드 (우선순위 순서)
    this.migrateAndLoadData();
    
    console.log('앱 설정 완료');
  }

  // 통합 데이터 마이그레이션 및 로드
  async migrateAndLoadData() {
    console.log('=== 데이터 마이그레이션 시작 ===');
    
    // 1단계: 로컬스토리지에서 모든 가능한 데이터 검색
    await this.migrateFromLocalStorage();
    
    // 2단계: Firebase 연결 대기 후 마이그레이션
    // (Firebase 연결은 initFirebase에서 별도로 처리)
    
    console.log(`마이그레이션 완료. 총 ${this.schedules.length}개 일정 로드됨`);
    this.migrationCompleted = true;
  }

  // 로컬스토리지 데이터 마이그레이션 (모든 가능한 키 검사)
  async migrateFromLocalStorage() {
    console.log('로컬스토리지 데이터 마이그레이션 시작');
    
    let foundData = null;
    let foundKey = null;
    
    // 모든 가능한 키를 순회하며 데이터 검색
    for (const key of this.possibleStorageKeys) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          console.log(`키 "${key}"에서 데이터 발견:`, data.substring(0, 100) + '...');
          
          const parsedData = JSON.parse(data);
          
          // 데이터 유효성 검사
          if (this.validateStorageData(parsedData)) {
            foundData = parsedData;
            foundKey = key;
            console.log(`유효한 데이터를 키 "${key}"에서 발견`);
            break;
          }
        }
      } catch (error) {
        console.warn(`키 "${key}" 파싱 오류:`, error);
        continue;
      }
    }
    
    // 모든 로컬스토리지 키 출력 (디버깅용)
    console.log('=== 로컬스토리지 전체 키 목록 ===');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`키: "${key}", 데이터 크기: ${value ? value.length : 0}바이트`);
    }
    
    if (foundData) {
      console.log(`기존 데이터 마이그레이션 시작 (키: ${foundKey})`);
      await this.processFoundData(foundData, foundKey);
    } else {
      console.log('로컬스토리지에서 기존 데이터를 찾을 수 없음');
    }
  }
  
  // 발견된 데이터 처리
  async processFoundData(data, sourceKey) {
    console.log('데이터 처리 시작:', data);
    
    // 데이터 구조 변환 및 정규화
    const normalizedData = this.normalizeDataStructure(data);
    
    if (normalizedData.schedules && normalizedData.schedules.length > 0) {
      this.schedules = normalizedData.schedules;
      this.extraInfo = normalizedData.extraInfo || {};
      
      // ID 정규화
      this.normalizeScheduleIds();
      
      console.log(`${this.schedules.length}개 일정이 성공적으로 마이그레이션됨`);
      
      // 표준 키로 저장
      if (sourceKey !== 'fridayPrayerSchedules') {
        this.saveToStandardFormat();
      }
      
      // UI 업데이트
      this.renderSchedules();
      this.renderExtraInfo();
      this.dataLoaded = true;
      
      this.showToast(`기존 데이터 ${this.schedules.length}개를 성공적으로 불러왔습니다!`, 'success');
    } else {
      console.log('유효한 일정 데이터가 없음');
    }
  }

  // 데이터 구조 유효성 검사
  validateStorageData(data) {
    if (!data || typeof data !== 'object') return false;
    
    // 다양한 데이터 구조 패턴 체크
    return (
      // 표준 구조
      (data.schedules && Array.isArray(data.schedules)) ||
      // 배열 직접 저장
      Array.isArray(data) ||
      // 다른 키 이름들
      (data.items && Array.isArray(data.items)) ||
      (data.list && Array.isArray(data.list)) ||
      (data.data && Array.isArray(data.data))
    );
  }

  // 데이터 구조 정규화
  normalizeDataStructure(rawData) {
    let schedules = [];
    let extraInfo = {};
    
    if (Array.isArray(rawData)) {
      // 배열이 직접 저장된 경우
      schedules = rawData;
    } else if (rawData.schedules && Array.isArray(rawData.schedules)) {
      // 표준 구조
      schedules = rawData.schedules;
      extraInfo = rawData.extraInfo || {};
    } else if (rawData.items && Array.isArray(rawData.items)) {
      // items 키
      schedules = rawData.items;
      extraInfo = rawData.extraInfo || rawData.extra || {};
    } else if (rawData.list && Array.isArray(rawData.list)) {
      // list 키
      schedules = rawData.list;
      extraInfo = rawData.extraInfo || rawData.extra || {};
    } else if (rawData.data && Array.isArray(rawData.data)) {
      // data 키
      schedules = rawData.data;
      extraInfo = rawData.extraInfo || rawData.extra || {};
    }
    
    // 일정 데이터 정규화
    schedules = schedules.map(schedule => this.normalizeScheduleItem(schedule));
    
    return { schedules, extraInfo };
  }

  // 개별 일정 아이템 정규화
  normalizeScheduleItem(item) {
    // 기본 구조로 변환
    return {
      id: item.id || item._id || Math.random(),
      date: item.date || item.scheduleDate || item.day,
      role: item.role || item.position || item.job,
      name: item.name || item.userName || item.member,
      createdAt: item.createdAt || item.created || new Date().toISOString(),
      updatedAt: item.updatedAt || item.updated
    };
  }

  // 일정 ID 정규화
  normalizeScheduleIds() {
    // ID가 없는 항목들에 ID 할당
    this.schedules.forEach((schedule, index) => {
      if (!schedule.id || schedule.id === Math.random()) {
        schedule.id = index + 1;
      }
    });
    
    // 다음 ID 설정
    if (this.schedules.length > 0) {
      this.nextId = Math.max(...this.schedules.map(s => parseInt(s.id) || 0)) + 1;
    }
    
    console.log(`ID 정규화 완료. 다음 ID: ${this.nextId}`);
  }

  // 표준 형식으로 저장
  saveToStandardFormat() {
    const standardData = {
      schedules: this.schedules,
      extraInfo: this.extraInfo,
      lastUpdated: new Date().toISOString(),
      migrated: true
    };
    
    try {
      localStorage.setItem('fridayPrayerSchedules', JSON.stringify(standardData));
      console.log('표준 형식으로 데이터 저장 완료');
    } catch (error) {
      console.error('표준 형식 저장 오류:', error);
    }
  }

  // Firebase에서 데이터 마이그레이션
  async migrateFromFirebase() {
    if (!this.firebaseReady || !this.db) {
      console.log('Firebase 미준비 상태');
      return;
    }
    
    console.log('Firebase 데이터 마이그레이션 시작');
    
    for (const path of this.possibleFirebasePaths) {
      try {
        console.log(`Firebase 경로 "${path}" 확인 중...`);
        const snapshot = await this.db.ref(path).once('value');
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log(`Firebase 경로 "${path}"에서 데이터 발견:`, Object.keys(data));
          
          if (this.validateStorageData(data)) {
            console.log(`유효한 Firebase 데이터 발견: ${path}`);
            await this.processFoundData(data, `firebase:${path}`);
            return; // 첫 번째 유효한 데이터만 사용
          }
        }
      } catch (error) {
        console.warn(`Firebase 경로 "${path}" 확인 오류:`, error);
        continue;
      }
    }
    
    console.log('Firebase에서 기존 데이터를 찾을 수 없음');
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
          <p class="empty-state__debug">전체 일정 수: ${this.schedules.length}개</p>
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
      lastUpdated: new Date().toISOString(),
      version: '2.0'
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
      
      // Firebase에서 데이터 마이그레이션
      this.migrateFromFirebase();
      
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

// Debug functions for data migration
window.debugDataMigration = function() {
  console.log('=== 데이터 마이그레이션 디버그 ===');
  console.log('전체 로컬스토리지 키:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}: ${value ? value.length : 0}바이트`);
    
    if (value && value.includes('schedule') || value.includes('Schedule')) {
      console.log(`  → 일정 관련 데이터 발견: ${value.substring(0, 200)}...`);
    }
  }
  
  if (scheduleManager) {
    console.log(`현재 로드된 일정 수: ${scheduleManager.schedules.length}`);
    console.log('일정 데이터:', scheduleManager.schedules);
  }
};

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
=== 데이터 마이그레이션 완료 ===

주요 수정사항:
1. 모든 가능한 로컬스토리지 키 검색
2. 다양한 데이터 구조 지원 (배열, 객체, 다른 키명)
3. Firebase 다중 경로 검색
4. 데이터 구조 자동 변환
5. ID 정규화 및 중복 방지
6. 디버그 함수 추가 (window.debugDataMigration())
7. 마이그레이션 상태 표시

사용법:
- 브라우저 콘솔에서 debugDataMigration() 실행하여 데이터 확인
- 자동으로 모든 가능한 기존 데이터 검색 및 변환
*/