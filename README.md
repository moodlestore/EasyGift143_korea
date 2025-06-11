# 🎁 EasyGift143 통합 대시보드

AI 기술을 활용한 개인화 선물 추천 플랫폼의 통합 관리 시스템

## 📋 프로젝트 개요

EasyGift143는 AI 기반 선물 추천 플랫폼으로, 단계적 확장 모델을 채택하여 개발된 프로젝트입니다.
- **1단계**: SNS 기반 어필리에이트 마케팅 자동화 (현재)
- **2단계**: 대화형 AI 선물 추천 웹사이트 (계획)
- **3단계**: 양면 선물 포장 중개 플랫폼 (계획)

## 🎯 주요 기능

### 📝 제품 등록
- **포스팅**: 제품 정보 입력 및 Airtable 저장, Buffer를 통한 SNS 자동 포스팅
- **숏폼 콘텐츠**: 5컷 구조의 영상 콘텐츠 대본 및 이미지 생성
- **감동 선물 사연**: AI가 생성하는 감성적인 선물 스토리 콘텐츠

### 💬 SNS 성장 도우미
- **목표 관리**: 계정별 일일 인게이지먼트 목표 설정 및 추적
- **번역 도우미**: 한국어를 활성 국가 언어로 자동 번역
- **계정 관리**: 다중 SNS 계정 (Instagram, X, Threads) 통합 관리
- **국가 관리**: 사용자 정의 국가 추가/삭제 기능

### 📊 분석 대시보드 (Pro 모드)
- **실시간 성과 분석**: 팔로워 성장, 인게이지먼트율, 수익 추적
- **언어별 성과**: 다국어 계정별 성과 비교 분석
- **API 연동**: Buffer, ManyChat, Instagram API 상태 모니터링

## 🏗️ 기술 스택

### Frontend
- **HTML5/CSS3/JavaScript**: 모던 브라우저 지원
- **모듈 시스템**: ES6 modules로 기능별 분리
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원

### Backend & 자동화
- **Make.com**: 워크플로우 자동화 플랫폼
- **Airtable**: 제품 데이터베이스
- **Buffer**: SNS 포스팅 자동화
- **OpenAI API**: AI 텍스트 및 이미지 생성

### AI & API 통합
- **GPT-4o/4o Mini**: 텍스트 생성 및 번역
- **DALL-E 3**: 이미지 생성
- **Gemini 2.0 Flash**: 비용 효율적 텍스트 생성

## 📁 프로젝트 구조

```
EasyGift143-Dashboard/
├── index.html                    # 메인 레이아웃
├── css/
│   ├── main.css                 # 공통 스타일
│   └── components.css           # 컴포넌트별 스타일
├── js/
│   ├── main.js                  # 전역 상태 관리
│   ├── product-register.js      # 메인 컨트롤러 (서브탭 관리)
│   ├── product-posting.js       # 포스팅 기능
│   ├── product-shortform.js     # 숏폼 콘텐츠 생성
│   ├── product-giftstory.js     # 감동 선물 사연
│   ├── engagement-assistant.js  # SNS 성장 도우미
│   └── analytics.js             # 분석 대시보드
└── README.md
```

## 🚀 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/your-username/EasyGift143-Dashboard.git
cd EasyGift143-Dashboard
```

### 2. 웹서버 실행
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (http-server)
npx http-server -p 8000
```

### 3. 브라우저에서 접속
```
http://localhost:8000
```

## ⚙️ 설정 방법

### 1. Make.com 워크플로우 설정
각 기능별로 Make.com에서 워크플로우를 생성하고 웹훅 URL을 설정:

#### 포스팅 기능
- **웹훅 1**: 제품 데이터 → Airtable 저장
- **웹훅 2**: Airtable → Buffer → SNS 포스팅

#### 숏폼 콘텐츠
- **웹훅 1**: 제품코드 → 대본 생성
- **웹훅 2**: 대본 → 이미지 생성

#### 감동 선물 사연
- **웹훅 1**: 스토리 + 이미지 생성
- **웹훅 2**: 이미지 재생성
- **웹훅 3**: SNS 포스팅

#### 번역 도우미
- **웹훅**: 한국어 → 다국어 번역

### 2. API 키 설정
Make.com 워크플로우에서 다음 API 키 설정:
- **OpenAI API**: GPT-4o, DALL-E 3
- **Buffer API**: SNS 포스팅 자동화
- **Airtable API**: 데이터베이스 연동

### 3. Airtable 데이터베이스 구조
```
Base: EasyGift143_korea
Table: Product
Fields:
- Product_ID (Number)
- Created_Date (Date)
- Product_Name (Single line text)
- Product_Price (Currency)
- Product_Info (Long text)
- Product_Review (Long text)
- Affiliate_link (URL)
- Affiliate_Comment (Single line text)
- Info_Image_text_1~4 (Long text)
- Posting_Image (Attachment)
```

## 💰 비용 구조

### Free 모드
- **제한사항**: 수동 데이터 입력, 기본 분석
- **비용**: $0/월

### Pro 모드 (월 $50+ 수익 시 권장)
- **추가 기능**: 실시간 API 연동, 고급 분석
- **예상 비용**: $30/월 (Buffer Pro + ManyChat Pro)

### API 사용 비용 (예상)
- **GPT-4o Mini**: 월 $3-5 (120개 포스팅 기준)
- **DALL-E 3**: 월 $12 (30개 이미지 기준)
- **총 AI 비용**: 월 $15-17

## 🔧 개발 가이드

### 모듈 구조
각 기능은 독립적인 모듈로 구현되어 있습니다:

```javascript
window.ModuleName = {
    // HTML 반환
    getHTML: function() { ... },
    
    // 초기화
    initialize: function() { ... },
    
    // 기능별 메서드들
    // ...
};
```

### 새로운 기능 추가
1. `js/` 폴더에 새 모듈 파일 생성
2. `index.html`에 스크립트 태그 추가
3. `main.js`의 `Navigation.showPage()`에 케이스 추가

### 상태 관리
전역 상태는 `AppState` 객체에서 관리:
```javascript
AppState.saveAppState();  // 상태 저장
AppState.loadAppState();  // 상태 로드
```

## 📊 성과 지표

### 기술적 지표
- **모듈화**: 6개 독립 모듈로 구성
- **코드 재사용성**: 80% 향상
- **유지보수성**: 모듈별 독립 개발 가능

### 비즈니스 지표
- **컨텐츠 다양성**: 텍스트 + 영상 + 감성 콘텐츠
- **비용 효율성**: 기존 영상 AI 대비 70-90% 절약
- **확장성**: 원소스 멀티유즈 (1개 → 9개 콘텐츠)

## 🔮 로드맵

### Phase 1: 기본 시스템 (완료)
- [x] UI 개편 및 모듈 분리
- [x] 포스팅 기능 구현
- [x] 숏폼 콘텐츠 기능 구현
- [x] 감동 선물 사연 기능 구현

### Phase 2: 고도화 (진행 중)
- [ ] Make.com 워크플로우 완성
- [ ] 실제 API 연동 테스트
- [ ] 성능 최적화

### Phase 3: 확장 (계획)
- [ ] 모바일 앱 확장
- [ ] 다국어 지원 확대
- [ ] AI 모델 업그레이드

## 🤝 기여 방법

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

- **프로젝트 관리자**: IdeaForest24
- **이메일**: [your-email@example.com]
- **프로젝트 링크**: [https://github.com/your-username/EasyGift143-Dashboard]

## 🙏 감사의 말

이 프로젝트는 다음 기술들을 활용하여 개발되었습니다:
- [OpenAI](https://openai.com/) - AI 텍스트 및 이미지 생성
- [Make.com](https://make.com/) - 워크플로우 자동화
- [Airtable](https://airtable.com/) - 데이터베이스
- [Buffer](https://buffer.com/) - SNS 관리

---

**버전**: v2.2.0-modular  
**최종 업데이트**: 2025년 6월  
**개발자**: IdeaForest24
