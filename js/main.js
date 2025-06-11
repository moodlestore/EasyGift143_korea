// 전역 상태 관리
window.AppState = {
    currentMode: 'free', // 'free' 또는 'pro'
    currentPage: 'product-register',
    revenue: {
        affiliate: 0,
        other: 0,
        total: 0
    },
    isLoading: false,
    // 포스팅이 추가된 총 목표
    totalGoals: {
        postings: 0, likes: 0, comments: 0, follows: 0,
        targets: { postings: 21, likes: 37, comments: 12, follows: 8 } // 포스팅 목표 추가
    },
    accountList: [],
    accountGoals: {}, // 계정별 개별 목표 (포스팅 포함)
	
	// 국가 목록 관리
	countryList: [
		{ key: 'korea', name: '한국' },
		{ key: 'japan', name: '일본' },
		{ key: 'usa', name: '미국' },
		{ key: 'canada', name: '캐나다' }
	],
    
    // 앱 초기화
    initialize: function() {
        this.loadAppState();
        this.updateModeDisplay();
        this.setupEventListeners();
    },
    
    // 앱 상태 저장 (포스팅 포함)
    saveAppState: function() {
        try {
            localStorage.setItem('appState', JSON.stringify({
				currentMode: this.currentMode,
				revenue: this.revenue,
				totalGoals: this.totalGoals,
				accountList: this.accountList,
				accountGoals: this.accountGoals,
				countryList: this.countryList
			}));
        } catch (e) {
            console.log('상태 저장 오류:', e);
        }
    },

    // 앱 상태 로드 (포스팅 포함)
    loadAppState: function() {
        try {
            const saved = localStorage.getItem('appState');
            if (saved) {
                const state = JSON.parse(saved);
                this.currentMode = state.currentMode || 'free';
                this.revenue = { ...this.revenue, ...state.revenue };
                this.totalGoals = { ...this.totalGoals, ...state.totalGoals };
                this.accountList = state.accountList || [];
                this.accountGoals = state.accountGoals || {};
				
				this.countryList = state.countryList || [
					{ key: 'korea', name: '한국' },
					{ key: 'japan', name: '일본' },
					{ key: 'usa', name: '미국' },
					{ key: 'canada', name: '캐나다' }
				];
                
                // 기존 계정들의 목표값을 새로운 기본값으로 강제 업데이트
                if (this.accountGoals) {
                    Object.keys(this.accountGoals).forEach(accountKey => {
                        const [sns] = accountKey.split('-');
                        const newTargets = {
                            instagram: { postings: 2, likes: 40, comments: 20, follows: 20 },
                            x: { postings: 15, likes: 50, comments: 30, follows: 30 },
                            threads: { postings: 2, likes: 40, comments: 20, follows: 20 }
                        };
                        
                        // 기존 계정의 목표값을 새로운 값으로 덮어쓰기
                        if (newTargets[sns]) {
                            this.accountGoals[accountKey].targets = newTargets[sns];
                        }
                    });
                }
            }
        } catch (e) {
            console.log('상태 로드 오류:', e);
        }
    },
    
    // 이벤트 리스너 설정
    setupEventListeners: function() {
        // 모달 외부 클릭 시 닫기
        window.onclick = function(event) {
            const modeModal = document.getElementById('modeModal');
            const accountModal = document.getElementById('accountEditorModal');
            const webhookModal = document.getElementById('webhookModal');
            
            if (event.target === modeModal) {
                AppState.closeModeModal();
            }
            if (event.target === accountModal && typeof EngagementAssistant !== 'undefined') {
				EngagementAssistant.closeAccountEditor();
            }
            if (event.target === webhookModal && typeof ContentGenerator !== 'undefined') {
                ContentGenerator.closeWebhookModal();
            }
        };
    },
    
    // 모드 전환
    toggleMode: function() {
        if (this.currentMode === 'free') {
            document.getElementById('modeModal').style.display = 'block';
            this.updateRevenueDisplay();
        } else {
            // Pro -> Free 다운그레이드
            if (confirm('Free 모드로 다운그레이드하시겠습니까?')) {
                this.currentMode = 'free';
                this.updateModeDisplay();
                this.saveAppState();
                
                // 분석 대시보드에 있으면 제품 등록으로 이동
                if (this.currentPage === 'analytics-dashboard') {
                    Navigation.showPage('product-register');
                    document.querySelector('[data-page="product-register"]').classList.add('active');
                    document.querySelector('[data-page="analytics-dashboard"]').classList.remove('active');
                }
                
                // 현재 페이지 새로고침
                Navigation.showPage(this.currentPage);
            }
        }
    },
    
    // 모드 표시 업데이트
    updateModeDisplay: function() {
        const currentModeEl = document.getElementById('currentMode');
        const upgradeBtnEl = document.getElementById('upgradeModeBtn');
        const analyticsTab = document.getElementById('analyticsTab');
        
        if (this.currentMode === 'pro') {
            currentModeEl.textContent = 'Pro 모드';
            currentModeEl.style.color = '#28a745';
            upgradeBtnEl.textContent = 'Free 모드로 변경';
            upgradeBtnEl.className = 'mode-toggle-btn pro-active';
            analyticsTab.classList.remove('disabled');
        } else {
            currentModeEl.textContent = 'Free 모드';
            currentModeEl.style.color = '#6c757d';
            upgradeBtnEl.textContent = 'Pro 모드로 업그레이드';
            upgradeBtnEl.className = 'mode-toggle-btn';
            analyticsTab.classList.add('disabled');
        }
    },
    
    // 수익 표시 업데이트
    updateRevenueDisplay: function() {
        const revenue = this.revenue;
        
        document.getElementById('affiliateRevenue').textContent = `${revenue.affiliate}`;
        document.getElementById('otherRevenue').textContent = `${revenue.other}`;
        document.getElementById('totalRevenue').textContent = `${revenue.total}`;
        
        const progress = Math.min((revenue.total / 50) * 100, 100);
        document.getElementById('revenueProgress').style.width = `${progress}%`;
        
        const upgradeBtn = document.getElementById('upgradeBtn');
        const upgradeMessage = document.getElementById('upgradeMessage');
        
        if (revenue.total >= 50) {
            upgradeBtn.disabled = false;
            upgradeMessage.textContent = 'Pro 모드 업그레이드를 권장합니다!';
            upgradeMessage.style.color = '#28a745';
        } else {
            upgradeBtn.disabled = true;
            upgradeMessage.textContent = `${(50 - revenue.total).toFixed(2)} 더 필요합니다.`;
            upgradeMessage.style.color = '#dc3545';
        }
    },
    
    // 강제 업그레이드 (테스트용)
    forceUpgrade: function() {
        this.currentMode = 'pro';
        this.updateModeDisplay();
        this.saveAppState();
        this.closeModeModal();
        
        // 현재 페이지 새로고침
        Navigation.showPage(this.currentPage);
        Utils.showAchievement('Pro 모드가 활성화되었습니다! (테스트 모드)');
    },
    
    // 모드 업그레이드
    upgradeMode: function() {
        this.currentMode = 'pro';
        this.updateModeDisplay();
        this.saveAppState();
        this.closeModeModal();
        
        // 현재 페이지 새로고침
        Navigation.showPage(this.currentPage);
        Utils.showAchievement('Pro 모드가 활성화되었습니다!');
    },
    
    // 모달 닫기
    closeModeModal: function() {
        document.getElementById('modeModal').style.display = 'none';
    },
    
    // Pro 모드 필요 알림
    showProModeRequired: function() {
        alert('이 기능은 Pro 모드에서만 사용할 수 있습니다.\n월 $50 이상 수익 달성 후 업그레이드하세요.');
    }
};

// Navigation.showPage 함수만 수정된 버전
window.Navigation = {
    // 네비게이션 설정
    setupNavigation: function() {
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                if (this.classList.contains('disabled')) {
                    AppState.showProModeRequired();
                    return;
                }
                
                const page = this.getAttribute('data-page');
                
                // 활성 탭 변경
                navTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // 페이지 표시
                Navigation.showPage(page);
            });
        });
    },
    
    // 페이지 표시 (디버깅 강화)
    showPage: function(pageName) {
        console.log('showPage 호출됨:', pageName); // 디버깅
        
        AppState.currentPage = pageName;
        Utils.updateLastSync();
        
        const content = document.getElementById('page-content');
        
        // 로딩 표시
        this.showLoading(true);
        
        setTimeout(() => {
            try {
                console.log('페이지 로딩 시작:', pageName); // 디버깅
                
                switch(pageName) {
                    case 'product-register':
                        console.log('ProductRegister 확인:', typeof ProductRegister); // 디버깅
                        content.innerHTML = ProductRegister.getHTML();
                        ProductRegister.initialize();
                        break;
                        
                    case 'content-generator':
                        console.log('ContentGenerator 확인:', typeof ContentGenerator); // 디버깅
                        
                        if (typeof ContentGenerator === 'undefined') {
                            console.error('ContentGenerator가 정의되지 않음!');
                            content.innerHTML = `
                                <div class="section">
                                    <h2>⚠️ 컨텐츠 생성 모듈 로드 오류</h2>
                                    <p>content-generator.js 파일이 로드되지 않았습니다.</p>
                                    <p>페이지를 새로고침하거나 파일 경로를 확인해주세요.</p>
                                    <button onclick="location.reload()">페이지 새로고침</button>
                                </div>
                            `;
                        } else {
                            content.innerHTML = ContentGenerator.getHTML();
                            ContentGenerator.initialize();
                        }
                        break;
                        
                    case 'engagement-assistant':
                        console.log('EngagementAssistant 확인:', typeof EngagementAssistant); // 디버깅
                        content.innerHTML = EngagementAssistant.getHTML();
                        EngagementAssistant.initialize();
                        break;
                        
                    case 'analytics-dashboard':
                        console.log('Analytics 확인:', typeof Analytics); // 디버깅
                        content.innerHTML = Analytics.getHTML();
                        Analytics.initialize();
                        break;
                        
                    default:
                        content.innerHTML = '<h2>페이지를 찾을 수 없습니다</h2>';
                }
                
                console.log('페이지 로딩 완료:', pageName); // 디버깅
                
            } catch (error) {
                console.error('페이지 로딩 중 오류:', error);
                content.innerHTML = `
                    <div class="section">
                        <h2>❌ 페이지 로딩 오류</h2>
                        <p>오류: ${error.message}</p>
                        <pre>${error.stack}</pre>
                        <button onclick="location.reload()">페이지 새로고침</button>
                    </div>
                `;
            }
            
            this.showLoading(false);
        }, 300); // 로딩 시뮬레이션
    },
    
    // 로딩 표시
    showLoading: function(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'block' : 'none';
    }
};

// 유틸리티 함수
window.Utils = {
    // 마지막 동기화 시간 업데이트
    updateLastSync: function() {
        const now = new Date().toLocaleTimeString('ko-KR');
        document.getElementById('lastSync').textContent = `마지막 동기화: ${now}`;
    },
    
    // 성취 알림
    showAchievement: function(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? '#dc3545' : '#28a745';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 3000;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },
    
    // 텍스트 복사 함수
    copyText: function(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showAchievement(`텍스트가 복사되었습니다! 📋`);
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showAchievement(`텍스트가 복사되었습니다! 📋`);
        });
    },
    
    // 파일 크기 포맷
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // 시간 차이 계산
    getTimeAgo: function(timestamp) {
        try {
            const now = Date.now();
            const recordTime = new Date(timestamp).getTime();
            const diff = Math.floor((now - recordTime) / 1000);
            
            if (diff < 60) return `${diff}초 전`;
            if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
            return `${Math.floor(diff / 86400)}일 전`;
        } catch (e) {
            console.log('시간 계산 오류:', e);
            return 'N/A';
        }
    },
    
    // 안전한 저장소 접근
    safeStorage: {
        get: function(key, defaultValue = null) {
            try {
                return localStorage.getItem(key) || defaultValue;
            } catch (e) {
                console.log('저장소 읽기 오류:', e);
                return defaultValue;
            }
        },
        
        set: function(key, value) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.log('저장소 쓰기 오류:', e);
                return false;
            }
        },
        
        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.log('저장소 삭제 오류:', e);
                return false;
            }
        }
    }
};
