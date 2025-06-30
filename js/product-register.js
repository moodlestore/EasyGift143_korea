// 제품 등록 메인 컨트롤러 (카드뉴스 탭 추가)
window.ProductRegister = {
    currentSubTab: 'posting', // 기본은 포스팅 탭

    // HTML 반환 (카드뉴스 탭 추가)
    getHTML: function() {
        return `
            <!-- 서브탭 네비게이션 (카드뉴스 탭 추가) -->
            <div class="main-nav sub-nav">
                <button class="nav-tab active" data-tab="posting" onclick="ProductRegister.switchSubTab('posting')">
                    📝 포스팅
                </button>
                <button class="nav-tab" data-tab="cardnews" onclick="ProductRegister.switchSubTab('cardnews')">
                    📰 카드뉴스
                </button>
                <button class="nav-tab" data-tab="shortform" onclick="ProductRegister.switchSubTab('shortform')">
                    🎬 숏폼 콘텐츠
                </button>
                <button class="nav-tab" data-tab="giftstory" onclick="ProductRegister.switchSubTab('giftstory')">
                    📖 감동 사연
                </button>
            </div>

            <!-- 서브탭 컨텐츠 영역 -->
            <div id="posting-content" class="sub-tab-content active">
                <!-- 포스팅 기능 내용이 여기에 동적으로 로드됩니다 -->
            </div>

            <div id="cardnews-content" class="sub-tab-content" style="display: none;">
                <!-- 카드뉴스 기능 내용이 여기에 동적으로 로드됩니다 -->
            </div>

            <div id="shortform-content" class="sub-tab-content" style="display: none;">
                <!-- 숏폼 콘텐츠 기능 내용이 여기에 동적으로 로드됩니다 -->
            </div>

            <div id="giftstory-content" class="sub-tab-content" style="display: none;">
                <!-- 감동 선물 사연 기능 내용이 여기에 동적으로 로드됩니다 -->
            </div>
        `;
    },

    // 초기화
    initialize: function() {
        // 기본적으로 포스팅 탭을 로드
        this.loadSubTabContent('posting');
    },

    // 서브탭 전환 (탭 스타일 적용)
    switchSubTab: function(tabName) {
        console.log('서브탭 전환:', tabName);
        
        this.currentSubTab = tabName;

        // 탭 버튼 활성화 상태 변경 (메인탭과 동일한 방식)
        document.querySelectorAll('.sub-nav .nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.sub-nav [data-tab="${tabName}"]`).classList.add('active');

        // 컨텐츠 표시/숨김
        document.querySelectorAll('.sub-tab-content').forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`${tabName}-content`);
        if (targetContent) {
            targetContent.style.display = 'block';
            targetContent.classList.add('active');
        }

        // 해당 서브탭 컨텐츠 로드
        this.loadSubTabContent(tabName);
    },

    // 서브탭 컨텐츠 로드
    loadSubTabContent: function(tabName) {
        const contentDiv = document.getElementById(`${tabName}-content`);
        if (!contentDiv) {
            console.error('컨텐츠 영역을 찾을 수 없습니다:', `${tabName}-content`);
            return;
        }

        try {
            switch(tabName) {
                case 'posting':
                    if (typeof ProductPosting !== 'undefined') {
                        contentDiv.innerHTML = ProductPosting.getHTML();
                        ProductPosting.initialize();
                    } else {
                        console.error('ProductPosting 모듈이 로드되지 않음');
                        contentDiv.innerHTML = '<div class="section"><h2>⚠️ 포스팅 모듈 로드 오류</h2><p>product-posting.js 파일을 확인해주세요.</p></div>';
                    }
                    break;

                case 'cardnews':
                    if (typeof ProductCardNews !== 'undefined') {
                        contentDiv.innerHTML = ProductCardNews.getHTML();
                        ProductCardNews.initialize();
                    } else {
                        console.error('ProductCardNews 모듈이 로드되지 않음');
                        contentDiv.innerHTML = '<div class="section"><h2>⚠️ 카드뉴스 모듈 로드 오류</h2><p>product-cardnews.js 파일을 확인해주세요.</p></div>';
                    }
                    break;

                case 'shortform':
                    if (typeof ProductShortForm !== 'undefined') {
                        contentDiv.innerHTML = ProductShortForm.getHTML();
                        ProductShortForm.initialize();
                    } else {
                        console.error('ProductShortForm 모듈이 로드되지 않음');
                        contentDiv.innerHTML = '<div class="section"><h2>⚠️ 숏폼 모듈 로드 오류</h2><p>product-shortform.js 파일을 확인해주세요.</p></div>';
                    }
                    break;

                case 'giftstory':
                    if (typeof ProductGiftStory !== 'undefined') {
                        contentDiv.innerHTML = ProductGiftStory.getHTML();
                        ProductGiftStory.initialize();
                    } else {
                        console.error('ProductGiftStory 모듈이 로드되지 않음');
                        contentDiv.innerHTML = '<div class="section"><h2>⚠️ 감동 선물 사연 모듈 로드 오류</h2><p>product-giftstory.js 파일을 확인해주세요.</p></div>';
                    }
                    break;

                default:
                    contentDiv.innerHTML = '<div class="section"><h2>⚠️ 알 수 없는 탭</h2><p>올바르지 않은 탭 이름입니다.</p></div>';
            }
        } catch (error) {
            console.error('서브탭 컨텐츠 로드 중 오류:', error);
            contentDiv.innerHTML = `
                <div class="section">
                    <h2>❌ 로드 오류</h2>
                    <p>오류: ${error.message}</p>
                    <button onclick="location.reload()">페이지 새로고침</button>
                </div>
            `;
        }
    }
};
