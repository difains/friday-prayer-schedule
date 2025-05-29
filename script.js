// 섬김이 데이터
const scheduleData = [
    {
        date: "6월 6일 (금)",
        eventType: "전교인 기도회",
        leader: "",
        singers: ["한지윤", "김은경", "이선희"],
        instruments: [
            { name: "하지빈", role: "메인건반" },
            { name: "이정윤", role: "드럼" }
        ],
        engineers: ["박민욱", "배하진"]
    },
    {
        date: "6월 13일 (금)",
        eventType: "금요 기도회",
        leader: "고기영",
        singers: ["한지윤", "김은경", "이선희", "강신규"],
        instruments: [
            { name: "김란희", role: "메인건반" },
            { name: "최요한", role: "드럼" },
            { name: "박예원", role: "베이스" }
        ],
        engineers: ["박민욱", "배하진"]
    },
    {
        date: "6월 20일 (금)",
        eventType: "금요 기도회",
        leader: "",
        singers: ["한지윤", "이선희", "강신규"],
        instruments: [
            { name: "이지혜", role: "메인건반" },
            { name: "최요한", role: "드럼" },
            { name: "박예원", role: "베이스" }
        ],
        engineers: ["박민욱", "배하진"]
    },
    {
        date: "6월 27일 (금)",
        eventType: "금요 기도회",
        leader: "",
        singers: ["강신규", "김은경", "이선희"],
        instruments: [
            { name: "김예진", role: "메인건반" },
            { name: "배세윤", role: "드럼" },
            { name: "박예원", role: "베이스" }
        ],
        engineers: ["박민욱", "배하진"]
    }
];

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    renderSchedule();
    addEventListeners();
    setupControlButtons();
});

// 스케줄 렌더링 함수
function renderSchedule() {
    const container = document.getElementById('schedule-container');
    
    scheduleData.forEach((item, index) => {
        const scheduleItem = createScheduleItem(item, index);
        container.appendChild(scheduleItem);
    });
}

// 스케줄 아이템 생성 함수
function createScheduleItem(data, index) {
    const item = document.createElement('div');
    item.className = 'schedule-item';
    item.style.animationDelay = `${index * 0.1}s`;
    
    item.innerHTML = `
        <div class="date-header" data-index="${index}">
            <div class="date">${data.date}</div>
            <div class="event-type">${data.eventType}</div>
            <div class="toggle-icon">▼</div>
        </div>
        <div class="content" id="content-${index}">
            <div class="leader-section">
                <div class="leader-title">찬양인도</div>
                <div class="leader-name ${data.leader ? '' : 'leader-empty'}">
                    ${data.leader || '미정'}
                </div>
            </div>
            <div class="roles-grid">
                <div class="role-group">
                    <div class="role-title">🎤 싱어</div>
                    <div class="member-list">
                        ${data.singers.map(singer => 
                            `<span class="member-tag">${singer}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="role-group">
                    <div class="role-title">🎹 악기</div>
                    <div class="member-list">
                        ${data.instruments.map(instrument => 
                            `<span class="member-tag">${instrument.name} (${instrument.role})</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="role-group">
                    <div class="role-title">🔧 엔지니어</div>
                    <div class="member-list">
                        ${data.engineers.map(engineer => 
                            `<span class="member-tag">${engineer}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
            <div class="additional-info">
                <div class="info-section">
                    <div class="info-title">
                        📋 콘티 리스트
                    </div>
                    <textarea 
                        class="setlist-area" 
                        placeholder="찬양 순서를 입력하세요...&#10;예:&#10;1. 주 은혜임을&#10;2. 놀라운 은혜&#10;3. 주님의 마음을 품고"
                        id="setlist-${index}"
                    ></textarea>
                </div>
                <div class="info-section">
                    <div class="info-title">
                        🎬 참고 유튜브
                    </div>
                    <input 
                        type="url" 
                        class="youtube-input" 
                        placeholder="유튜브 링크를 입력하세요"
                        id="youtube-${index}"
                    >
                    <div class="youtube-preview" id="youtube-preview-${index}">
                        <span>🔗 링크가 입력되면 미리보기가 표시됩니다</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return item;
}

// 컨트롤 버튼 설정
function setupControlButtons() {
    const expandAllBtn = document.getElementById('expand-all');
    const collapseAllBtn = document.getElementById('collapse-all');
    
    expandAllBtn.addEventListener('click', expandAll);
    collapseAllBtn.addEventListener('click', collapseAll);
}

// 모두 열기 함수
function expandAll() {
    const contents = document.querySelectorAll('.content');
    const icons = document.querySelectorAll('.toggle-icon');
    
    contents.forEach(content => {
        content.classList.add('expanded');
    });
    
    icons.forEach(icon => {
        icon.classList.add('rotated');
    });
    
    // 버튼 피드백
    const btn = document.getElementById('expand-all');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = '';
    }, 150);
}

// 모두 닫기 함수
function collapseAll() {
    const contents = document.querySelectorAll('.content');
    const icons = document.querySelectorAll('.toggle-icon');
    
    contents.forEach(content => {
        content.classList.remove('expanded');
    });
    
    icons.forEach(icon => {
        icon.classList.remove('rotated');
    });
    
    // 버튼 피드백
    const btn = document.getElementById('collapse-all');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = '';
    }, 150);
}

// 이벤트 리스너 추가
function addEventListeners() {
    // 아코디언 토글 기능
    document.addEventListener('click', function(e) {
        if (e.target.closest('.date-header')) {
            const header = e.target.closest('.date-header');
            const index = header.dataset.index;
            const content = document.getElementById(`content-${index}`);
            const icon = header.querySelector('.toggle-icon');
            
            toggleAccordion(content, icon);
        }
    });

    // 멤버 태그 클릭 이벤트
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('member-tag')) {
            showMemberInfo(e.target.textContent);
        }
    });

    // 유튜브 링크 입력 감지
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('youtube-input')) {
            handleYoutubeInput(e.target);
        }
    });

    // 콘티 리스트 자동 저장 (로컬 스토리지)
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('setlist-area')) {
            const id = e.target.id;
            localStorage.setItem(id, e.target.value);
        }
    });

    // 저장된 데이터 불러오기
    loadSavedData();
}

// 유튜브 링크 처리
function handleYoutubeInput(input) {
    const url = input.value;
    const index = input.id.split('-')[1];
    const preview = document.getElementById(`youtube-preview-${index}`);
    
    if (url && isValidYouTubeUrl(url)) {
        const videoId = extractYouTubeVideoId(url);
        if (videoId) {
            preview.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" 
                         style="width: 60px; height: 45px; border-radius: 4px;">
                    <div>
                        <div style="font-weight: 600; color: #333;">유튜브 영상 연결됨</div>
                        <div style="font-size: 0.75rem; color: #666;">클릭하여 새 탭에서 열기</div>
                    </div>
                </div>
            `;
            preview.classList.add('show');
            preview.style.cursor = 'pointer';
            preview.onclick = () => window.open(url, '_blank');
        }
    } else {
        preview.classList.remove('show');
        preview.onclick = null;
    }
    
    // 로컬 스토리지에 저장
    localStorage.setItem(input.id, url);
}

// 유튜브 URL 유효성 검사
function isValidYouTubeUrl(url) {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return pattern.test(url);
}

// 유튜브 비디오 ID 추출
function extractYouTubeVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

// 저장된 데이터 불러오기
function loadSavedData() {
    // 콘티 리스트 불러오기
    document.querySelectorAll('.setlist-area').forEach(textarea => {
        const saved = localStorage.getItem(textarea.id);
        if (saved) {
            textarea.value = saved;
        }
    });

    // 유튜브 링크 불러오기
    document.querySelectorAll('.youtube-input').forEach(input => {
        const saved = localStorage.getItem(input.id);
        if (saved) {
            input.value = saved;
            handleYoutubeInput(input);
        }
    });
}

// 아코디언 토글 함수
function toggleAccordion(content, icon) {
    const isExpanded = content.classList.contains('expanded');
    
    if (isExpanded) {
        content.classList.remove('expanded');
        icon.classList.remove('rotated');
    } else {
        content.classList.add('expanded');
        icon.classList.add('rotated');
    }
}

// 멤버 정보 표시 함수
function showMemberInfo(memberName) {
    const cleanName = memberName.split(' (')[0];
    
    // 진동 효과 (모바일)
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    // 시각적 피드백
    const memberTags = document.querySelectorAll('.member-tag');
    memberTags.forEach(tag => {
        if (tag.textContent.includes(cleanName)) {
            tag.style.transform = 'scale(1.1)';
            setTimeout(() => {
                tag.style.transform = '';
            }, 200);
        }
    });
}

// 스크롤 애니메이션
function handleScrollAnimation() {
    const items = document.querySelectorAll('.schedule-item');
    const windowHeight = window.innerHeight;
    
    items.forEach(item => {
        const itemTop = item.getBoundingClientRect().top;
        if (itemTop < windowHeight * 0.8) {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }
    });
}

// 스크롤 이벤트 리스너
window.addEventListener('scroll', handleScrollAnimation);

// 터치 제스처 지원 (모바일)
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            console.log('Swipe up detected');
        } else {
            console.log('Swipe down detected');
        }
    }
}

// 반응형 레이아웃 조정
function adjustLayout() {
    const container = document.querySelector('.container');
    const width = window.innerWidth;
    
    if (width >= 1024) {
        container.style.maxWidth = '900px';
    } else if (width >= 768) {
        container.style.maxWidth = '800px';
    } else {
        container.style.maxWidth = '100%';
    }
}

window.addEventListener('resize', adjustLayout);
window.addEventListener('load', adjustLayout);
