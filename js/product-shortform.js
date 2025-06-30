// 숏폼 콘텐츠 생성 모듈 (이미지 확대 모달 기능 포함)
window.ProductShortForm = {
   // 상태 관리
   webhookUrls: {
       scriptGeneration: '', // 웹훅 1: 대본 생성
       imageGeneration: ''   // 웹훅 2: 이미지 생성
   },
   isGenerating: false,
   cuts: {
       cut1: { script: '', images: [], prompt: '' },
       cut2: { script: '', images: [], prompt: '' },
       cut3: { script: '', images: [], prompt: '' },
       cut4: { script: '', image: '', isProductImage: true }, // 실제 제품 이미지
       cut5: { script: '', images: [], prompt: '' }
   },
   productImageFile: null,
   generatedFullScript: '', // 전체 대본 저장용
   
   // 순차 처리용 상태 변수
   currentProcessingQueue: [], // 처리할 Cut 목록
   currentProcessingIndex: 0,  // 현재 처리 중인 인덱스
   
   // 이미지 캐러셀 데이터 저장
   imageCarousels: {},

   // 이미지 모달 관련 상태
   imageModal: {
       isOpen: false,
       currentCut: null,
       currentIndex: 0,
       images: []
   },

   // HTML 반환
   getHTML: function() {
       return `
           <div class="shortform-container">
               <!-- 제품코드 입력 섹션 -->
               <div class="section">
                   <h2>📋 제품코드 입력</h2>
                   <div style="display: flex; gap: 15px; align-items: flex-end;">
                       <div style="flex: 1;">
                           <label for="productCode" style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">제품코드</label>
                           <input type="text" id="productCode" placeholder="예: ko_250612_1436, ko_250611_1749" style="width: 100%; height: 48px; padding: 12px; font-size: 14px; border: 2px solid #e1e5e9; border-radius: 8px; box-sizing: border-box;">
                       </div>
                       <button id="generateScriptBtn" onclick="ProductShortForm.generateScript()" style="height: 48px; padding: 12px 24px; font-size: 14px; border: none; border-radius: 8px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; cursor: pointer; margin-top: 0; margin-bottom: 0; margin-right: 0;">📝 대본 생성</button>
                       <button onclick="ProductShortForm.openWebhookModal()" style="height: 48px; padding: 12px 20px; font-size: 14px; border: none; border-radius: 8px; background: #6c757d; color: white; cursor: pointer; margin-top: 0; margin-bottom: 0; margin-right: 0;">⚙️ 설정</button>
                   </div>
               </div>

               <!-- 대본 섹션 -->
               <div class="section">
                   <h2>📝 생성된 대본</h2>
                   <textarea id="generatedScript" rows="8" placeholder="생성된 5컷 대본이 여기에 표시됩니다..."></textarea>
                   <div style="margin-top: 15px;">
                       <button id="generateImagesBtn" onclick="ProductShortForm.startImageGeneration()" disabled>🖼️ 이미지 생성 시작</button>
                   </div>
               </div>

               <!-- 대본 & 이미지 & 프롬프트 섹션 -->
               <div class="section">
                   <h2>🎬 대본 & 이미지</h2>
                   
                   <!-- 모든 Cut을 동일한 너비로 배치 (2열 그리드) -->
                   <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                       ${this.getCutHTML(1)}
                       ${this.getCutHTML(2)}
                   </div>
                   
                   <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                       ${this.getCutHTML(3)}
                       ${this.getCutHTML(4)}
                   </div>
                   
                   <!-- Cut 5도 동일한 2열 그리드 구조 (한 칸은 비워둠) -->
                   <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                       ${this.getCutHTML(5)}
                       <div></div> <!-- 빈 공간 -->
                   </div>
               </div>

               <!-- 상태 메시지 -->
               <div id="shortformStatus" style="margin-top: 20px; padding: 15px; border-radius: 8px; display: none;"></div>
           </div>

           <!-- 웹훅 설정 모달 -->
           <div id="shortformWebhookModal" class="modal" style="display: none;">
               <div class="modal-content">
                   <span class="close" onclick="ProductShortForm.closeWebhookModal()">&times;</span>
                   <h2>⚙️ 숏폼 웹훅 설정</h2>
                   
                   <div class="form-group">
                       <label>웹훅 1 - 대본 생성</label>
                       <div class="url-input-group">
                           <input type="text" id="shortformWebhook1" placeholder="대본 생성 웹훅 URL">
                           <button onclick="ProductShortForm.saveWebhook(1)">저장</button>
                       </div>
                       <span id="shortformWebhook1Saved" class="saved-indicator" style="display: none;">✅ 저장됨</span>
                   </div>
                   
                   <div class="form-group">
                       <label>웹훅 2 - 이미지 생성</label>
                       <div class="url-input-group">
                           <input type="text" id="shortformWebhook2" placeholder="이미지 생성 웹훅 URL">
                           <button onclick="ProductShortForm.saveWebhook(2)">저장</button>
                       </div>
                       <span id="shortformWebhook2Saved" class="saved-indicator" style="display: none;">✅ 저장됨</span>
                   </div>
                   
                   <div class="modal-actions">
                       <button onclick="ProductShortForm.closeWebhookModal()" class="btn-secondary">닫기</button>
                   </div>
               </div>
           </div>
       `;
   },

   // Cut별 HTML 생성 (캐러셀 적용)
   getCutHTML: function(cutNumber) {
       const isProductImage = cutNumber === 4;
       
       return `
           <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #e1e5e9;">
               <h3 style="margin: 0 0 15px 0; color: #667eea;">Cut ${cutNumber}</h3>
               
               <!-- 대본 -->
               <div style="margin-bottom: 15px;">
                   <label style="font-size: 14px; font-weight: 600;">대본</label>
                   <textarea id="cut${cutNumber}Script" rows="3" placeholder="Cut ${cutNumber} 대본..." style="width: 100%; font-size: 13px;"></textarea>
               </div>
               
               ${isProductImage ? `
                   <!-- 실제 제품 이미지 업로드 -->
                   <div style="margin-bottom: 15px;">
                       <label style="font-size: 14px; font-weight: 600;">제품 이미지</label>
                       <div style="margin-top: 5px;">
                           <input type="file" id="cut4ImageInput" accept="image/*" style="display: none;">
                           <button onclick="document.getElementById('cut4ImageInput').click()" style="background: #28a745; font-size: 13px; padding: 8px 12px;">📁 제품 이미지 업로드</button>
                       </div>
                       <div id="cut4ImagePreview" style="margin-top: 10px; text-align: center;"></div>
                   </div>
               ` : `
                   <!-- AI 생성 이미지 캐러셀 -->
                   <div style="margin-bottom: 15px;">
                       <label style="font-size: 14px; font-weight: 600;">생성된 이미지</label>
                       <div id="cut${cutNumber}ImagePreview" class="image-carousel" style="margin-top: 5px;">
                           <div class="carousel-placeholder">
                               <span>이미지가 생성되면 여기에 표시됩니다</span>
                           </div>
                       </div>
                   </div>
                   
                   <!-- 이미지 프롬프트 -->
                   <div style="margin-bottom: 15px;">
                       <label style="font-size: 14px; font-weight: 600;">이미지 프롬프트</label>
                       <textarea id="cut${cutNumber}Prompt" rows="2" placeholder="이미지 프롬프트..." style="width: 100%; font-size: 12px; font-family: 'Courier New', monospace;"></textarea>
                   </div>
                   
                   <!-- 개별 이미지 버튼들 (2개) -->
                   <div style="text-align: center; display: flex; gap: 5px; justify-content: center;">
                       <button id="scriptToImageCut${cutNumber}Btn" onclick="ProductShortForm.generateFromScript(${cutNumber})" style="background: #6f42c1; font-size: 11px; padding: 5px 8px; flex: 1;" disabled>📝 대본→이미지</button>
                       <button id="promptToImageCut${cutNumber}Btn" onclick="ProductShortForm.generateFromPrompt(${cutNumber})" style="background: #17a2b8; font-size: 11px; padding: 5px 8px; flex: 1;" disabled>🖼️ 프롬프트→이미지</button>
                   </div>
               `}
           </div>
       `;
   },

   // 초기화
   initialize: function() {
       this.loadSavedWebhooks();
       this.setupFileHandlers();
   },

   // 저장된 웹훅 URL 로드
   loadSavedWebhooks: function() {
       this.webhookUrls.scriptGeneration = Utils.safeStorage.get('shortformScriptWebhook', '');
       this.webhookUrls.imageGeneration = Utils.safeStorage.get('shortformImageWebhook', '');

       setTimeout(() => {
           const webhook1 = document.getElementById('shortformWebhook1');
           const webhook2 = document.getElementById('shortformWebhook2');

           if (webhook1 && this.webhookUrls.scriptGeneration) {
               webhook1.value = this.webhookUrls.scriptGeneration;
               this.showSavedIndicator('shortformWebhook1Saved');
           }
           if (webhook2 && this.webhookUrls.imageGeneration) {
               webhook2.value = this.webhookUrls.imageGeneration;
               this.showSavedIndicator('shortformWebhook2Saved');
           }
       }, 100);
   },

   // 파일 핸들러 설정
   setupFileHandlers: function() {
       setTimeout(() => {
           const cut4ImageInput = document.getElementById('cut4ImageInput');
           if (cut4ImageInput) {
               cut4ImageInput.addEventListener('change', (e) => {
                   this.handleProductImageUpload(e.target.files[0]);
               });
           }
       }, 100);
   },

   // 제품 이미지 업로드 처리
   handleProductImageUpload: function(file) {
       if (!file) return;

       this.productImageFile = file;
       
       const reader = new FileReader();
       reader.onload = (e) => {
           const preview = document.getElementById('cut4ImagePreview');
           if (preview) {
               preview.innerHTML = `
                   <img src="${e.target.result}" alt="제품 이미지" style="max-width: 200px; max-height: 200px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                   <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${file.name}</p>
               `;
           }
       };
       reader.readAsDataURL(file);

       this.showStatus('제품 이미지가 업로드되었습니다.', 'success');
   },

   // 이미지 캐러셀 생성 함수 (클릭 이벤트 추가)
   createImageCarousel: function(cutNumber, images, prompt) {
       if (!images || images.length === 0) return;
       
       // 캐러셀 데이터 저장
       this.imageCarousels[`cut${cutNumber}`] = {
           images: images,
           currentIndex: 0
       };
       
       const previewElement = document.getElementById(`cut${cutNumber}ImagePreview`);
       if (!previewElement) return;
       
       const carouselHTML = `
           <div class="carousel-container">
               <button class="carousel-nav prev" onclick="ProductShortForm.prevImage(${cutNumber})">‹</button>
               <img class="carousel-image" id="cut${cutNumber}CarouselImage" 
                    src="${images[0]}" 
                    alt="Cut ${cutNumber} 이미지"
                    onclick="ProductShortForm.openImageModal(${cutNumber}, 0)"
                    style="cursor: pointer;">
               <button class="carousel-nav next" onclick="ProductShortForm.nextImage(${cutNumber})">›</button>
               <div class="carousel-indicator" id="cut${cutNumber}Indicator">1 / ${images.length}</div>
           </div>
       `;
       
       previewElement.innerHTML = carouselHTML;
       this.updateCarouselButtons(cutNumber);
   },

   // 이전 이미지
   prevImage: function(cutNumber) {
       const carousel = this.imageCarousels[`cut${cutNumber}`];
       if (!carousel) return;
       
       if (carousel.currentIndex > 0) {
           carousel.currentIndex--;
           this.updateCarouselImage(cutNumber);
       }
   },

   // 다음 이미지
   nextImage: function(cutNumber) {
       const carousel = this.imageCarousels[`cut${cutNumber}`];
       if (!carousel) return;
       
       if (carousel.currentIndex < carousel.images.length - 1) {
           carousel.currentIndex++;
           this.updateCarouselImage(cutNumber);
       }
   },

   // 캐러셀 이미지 업데이트
   updateCarouselImage: function(cutNumber) {
       const carousel = this.imageCarousels[`cut${cutNumber}`];
       if (!carousel) return;
       
       const imageElement = document.getElementById(`cut${cutNumber}CarouselImage`);
       const indicatorElement = document.getElementById(`cut${cutNumber}Indicator`);
       
       if (imageElement) {
           imageElement.src = carousel.images[carousel.currentIndex];
       }
       
       if (indicatorElement) {
           indicatorElement.textContent = `${carousel.currentIndex + 1} / ${carousel.images.length}`;
       }
       
       this.updateCarouselButtons(cutNumber);
   },

   // 캐러셀 버튼 상태 업데이트
   updateCarouselButtons: function(cutNumber) {
       const carousel = this.imageCarousels[`cut${cutNumber}`];
       if (!carousel) return;
       
       const prevBtn = document.querySelector(`#cut${cutNumber}ImagePreview .carousel-nav.prev`);
       const nextBtn = document.querySelector(`#cut${cutNumber}ImagePreview .carousel-nav.next`);
       
       if (prevBtn) {
           prevBtn.disabled = carousel.currentIndex === 0;
       }
       
       if (nextBtn) {
           nextBtn.disabled = carousel.currentIndex === carousel.images.length - 1;
       }
   },

   // 이미지 모달 열기
   openImageModal: function(cutNumber, imageIndex = null) {
       const carousel = this.imageCarousels[`cut${cutNumber}`];
       if (!carousel || !carousel.images.length) return;
       
       // 이미지 인덱스가 지정되지 않으면 현재 캐러셀 인덱스 사용
       const startIndex = imageIndex !== null ? imageIndex : carousel.currentIndex;
       
       this.imageModal = {
           isOpen: true,
           currentCut: cutNumber,
           currentIndex: startIndex,
           images: carousel.images
       };
       
       // 모달이 없으면 생성
       if (!document.getElementById('imageModal')) {
           this.createImageModal();
       }
       
       // 모달 표시 및 이미지 업데이트
       const modal = document.getElementById('imageModal');
       modal.style.display = 'flex';
       this.updateModalImage();
       
       // ESC 키로 닫기
       document.addEventListener('keydown', this.handleModalKeydown.bind(this));
   },

   // 이미지 모달 생성
   createImageModal: function() {
       const modalHTML = `
           <div id="imageModal" class="modal" style="display: none; z-index: 3000;">
               <div class="modal-content" style="width: auto; max-width: 800px; max-height: 90vh; padding: 30px; position: relative; overflow: visible;">
                   <span class="close" onclick="ProductShortForm.closeImageModal()" style="font-size: 30px; top: 10px; right: 15px;">&times;</span>
                   
                   <div style="text-align: center; margin-bottom: 20px;">
                       <h3 id="modalTitle" style="margin: 0; color: #667eea;">Cut 1 이미지 미리보기</h3>
                   </div>
                   
					   <div style="position: relative; text-align: center;">
                       <button id="modalPrevBtn" onclick="ProductShortForm.prevModalImage()" 
                               style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); 
                                      background: rgba(0,0,0,0.8); color: white; border: none; 
                                      width: 45px; height: 45px; border-radius: 50%; font-size: 20px; cursor: pointer; 
                                      box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.3s ease;">‹</button>
                       
                       <img id="modalImage" src="" alt="확대 이미지" 
                            style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                       
                       <button id="modalNextBtn" onclick="ProductShortForm.nextModalImage()" 
                               style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); 
                                      background: rgba(0,0,0,0.8); color: white; border: none; 
                                      width: 45px; height: 45px; border-radius: 50%; font-size: 20px; cursor: pointer; 
                                      box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.3s ease;">›</button>
                   </div>
                   
                   <div style="text-align: center; margin-top: 15px;">
                       <span id="modalIndicator" style="background: rgba(0,0,0,0.7); color: white; 
                                                       padding: 8px 15px; border-radius: 15px; font-weight: 600;">1 / 4</span>
                   </div>
                   
                   <div style="text-align: center; margin-top: 15px; width: 100%; display: flex; justify-content: center; gap: 10px;">
                       <button onclick="ProductShortForm.downloadModalImage()" 
                               style="background: #28a745; color: white; padding: 10px 20px; border: none; 
                                      border-radius: 5px; cursor: pointer;">💾 다운로드</button>
                       <button onclick="ProductShortForm.copyModalImageUrl()" 
                               style="background: #17a2b8; color: white; padding: 10px 20px; border: none; 
                                      border-radius: 5px; cursor: pointer;">📋 URL 복사</button>
                   </div>
               </div>
           </div>
       `;
       
       document.body.insertAdjacentHTML('beforeend', modalHTML);
   },

   // 모달 이미지 업데이트
   updateModalImage: function() {
       if (!this.imageModal.isOpen) return;
       
       const modalImage = document.getElementById('modalImage');
       const modalTitle = document.getElementById('modalTitle');
       const modalIndicator = document.getElementById('modalIndicator');
       const modalPrevBtn = document.getElementById('modalPrevBtn');
       const modalNextBtn = document.getElementById('modalNextBtn');
       
       if (modalImage) {
           modalImage.src = this.imageModal.images[this.imageModal.currentIndex];
       }
       
       if (modalTitle) {
           modalTitle.textContent = `Cut ${this.imageModal.currentCut} 이미지 미리보기`;
       }
       
       if (modalIndicator) {
           modalIndicator.textContent = `${this.imageModal.currentIndex + 1} / ${this.imageModal.images.length}`;
       }
       
       // 버튼 상태 업데이트
       if (modalPrevBtn) {
           modalPrevBtn.disabled = this.imageModal.currentIndex === 0;
           modalPrevBtn.style.opacity = this.imageModal.currentIndex === 0 ? '0.3' : '1';
       }
       
       if (modalNextBtn) {
           modalNextBtn.disabled = this.imageModal.currentIndex === this.imageModal.images.length - 1;
           modalNextBtn.style.opacity = this.imageModal.currentIndex === this.imageModal.images.length - 1 ? '0.3' : '1';
       }
   },

   // 모달에서 이전 이미지
   prevModalImage: function() {
       if (!this.imageModal.isOpen || this.imageModal.currentIndex === 0) return;
       
       this.imageModal.currentIndex--;
       this.updateModalImage();
   },

   // 모달에서 다음 이미지
   nextModalImage: function() {
       if (!this.imageModal.isOpen || this.imageModal.currentIndex === this.imageModal.images.length - 1) return;
       
       this.imageModal.currentIndex++;
       this.updateModalImage();
   },

   // 이미지 모달 닫기
   closeImageModal: function() {
       const modal = document.getElementById('imageModal');
       if (modal) {
           modal.style.display = 'none';
       }
       
       this.imageModal.isOpen = false;
       document.removeEventListener('keydown', this.handleModalKeydown.bind(this));
   },

   // 모달 키보드 이벤트 처리
   handleModalKeydown: function(e) {
       if (!this.imageModal.isOpen) return;
       
       switch(e.key) {
           case 'Escape':
               this.closeImageModal();
               break;
           case 'ArrowLeft':
               this.prevModalImage();
               break;
           case 'ArrowRight':
               this.nextModalImage();
               break;
       }
   },

   // 모달 이미지 다운로드
   downloadModalImage: function() {
       if (!this.imageModal.isOpen) return;
       
       const currentImageUrl = this.imageModal.images[this.imageModal.currentIndex];
       const fileName = `cut${this.imageModal.currentCut}_image${this.imageModal.currentIndex + 1}.png`;
       
       // 다운로드 링크 생성
       const link = document.createElement('a');
       link.href = currentImageUrl;
       link.download = fileName;
       link.target = '_blank';
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       
       Utils.showAchievement('이미지 다운로드가 시작되었습니다! 📥');
   },

   // 모달 이미지 URL 복사
   copyModalImageUrl: function() {
       if (!this.imageModal.isOpen) return;
       
       const currentImageUrl = this.imageModal.images[this.imageModal.currentIndex];
       Utils.copyText(currentImageUrl);
   },

   // 웹훅 모달 열기
   openWebhookModal: function() {
       const modal = document.getElementById('shortformWebhookModal');
       modal.style.display = 'flex';
       this.loadSavedWebhooks();
   },

   // 웹훅 모달 닫기
   closeWebhookModal: function() {
       document.getElementById('shortformWebhookModal').style.display = 'none';
   },

   // 웹훅 URL 저장
   saveWebhook: function(webhookNumber) {
       const urlInput = document.getElementById(`shortformWebhook${webhookNumber}`);
       const indicator = document.getElementById(`shortformWebhook${webhookNumber}Saved`);
       const url = urlInput.value.trim();

       if (!url) {
           Utils.showAchievement('웹훅 URL을 입력해주세요.', 'error');
           return;
       }

       const storageKeys = ['', 'shortformScriptWebhook', 'shortformImageWebhook'];
       const storageKey = storageKeys[webhookNumber];
       
       if (storageKey) {
           Utils.safeStorage.set(storageKey, url);
           
           // 메모리에도 저장
           const webhookProps = ['', 'scriptGeneration', 'imageGeneration'];
           this.webhookUrls[webhookProps[webhookNumber]] = url;
           
           this.showSavedIndicator(indicator.id);
           Utils.showAchievement(`웹훅 ${webhookNumber} URL이 저장되었습니다.`, 'success');
       }
   },

   // 저장 표시기 표시
   showSavedIndicator: function(indicatorId) {
       const indicator = document.getElementById(indicatorId);
       if (indicator) {
           indicator.style.display = 'inline';
           setTimeout(() => {
               if (indicator) indicator.style.display = 'none';
           }, 3000);
       }
   },

   // 대본 생성
   generateScript: function() {
       if (this.isGenerating) {
           Utils.showAchievement('이미 대본 생성이 진행 중입니다.', 'error');
           return;
       }

       const productCode = document.getElementById('productCode').value.trim();
       const webhookUrl = this.webhookUrls.scriptGeneration;

       if (!productCode) {
           Utils.showAchievement('제품코드를 입력해주세요.', 'error');
           return;
       }

       if (!webhookUrl) {
           Utils.showAchievement('웹훅 1 (대본 생성) URL을 설정해주세요.', 'error');
           this.openWebhookModal();
           return;
       }

       this.isGenerating = true;
       this.showLoading(true);
       this.showStatus('대본을 생성하고 있습니다...', 'info');

       const requestData = {
           content: `제품코드: ${productCode}`,
           author: {
               id: "123456789",
               username: "shortform_generator",
               discriminator: "0001"
           },
           timestamp: new Date().toISOString(),
           attachments: []
       };

       const startTime = Date.now();

       fetch(webhookUrl, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify(requestData)
       })
       .then(response => {
           const duration = Date.now() - startTime;
           return response.text().then(text => {
               if (response.ok) {
                   try {
                       const result = JSON.parse(text);
                       this.handleScriptGenerationSuccess(result, duration);
                   } catch (parseError) {
                       // JSON 파싱 실패 시 텍스트 기반 처리
                       this.handleScriptGenerationSuccess({
                           script: text.substring(0, 1000)
                       }, duration);
                   }
               } else {
                   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
               }
           });
       })
       .catch(error => {
           const duration = Date.now() - startTime;
           console.error('대본 생성 오류:', error);
           this.showStatus(`대본 생성 실패: ${error.message} (${duration}ms)`, 'error');
           Utils.showAchievement('대본 생성에 실패했습니다. 다시 시도해주세요.', 'error');
       })
       .finally(() => {
           this.isGenerating = false;
           this.showLoading(false);
       });
   },

   // 대본 생성 성공 처리
   handleScriptGenerationSuccess: function(result, duration) {
       // 전체 대본 표시하고 내부 저장
       const scriptTextarea = document.getElementById('generatedScript');
       if (scriptTextarea && result.script) {
           scriptTextarea.value = result.script;
           this.generatedFullScript = result.script;
       }

       // 이미지 생성 버튼 활성화
       const generateImagesBtn = document.getElementById('generateImagesBtn');
       if (generateImagesBtn) {
           generateImagesBtn.disabled = false;
       }

       this.showStatus(`대본 생성 완료! (${duration}ms) 📝`, 'success');
       Utils.showAchievement('5컷 대본이 생성되었습니다! 이제 이미지를 생성해보세요.');
   },

   // 텍스트에서 Cut별 대본 파싱 (개선된 버전)
   parseScriptFromText: function(text) {
       const cuts = {};
       
       // Cut 1-5 패턴으로 분리 시도 (대소문자 구분 없이)
       for (let i = 1; i <= 5; i++) {
           // 다양한 패턴 시도
           const patterns = [
               new RegExp(`Cut ${i}[:\s]*([^C]*?)(?=Cut ${i+1}|$)`, 'i'),
               new RegExp(`CUT ${i}[:\s]*([^C]*?)(?=CUT ${i+1}|$)`, 'i'),
               new RegExp(`${i}\\.[:\s]*([^\\d]*?)(?=${i+1}\\.|$)`, 'i')
           ];
           
           let match = null;
           for (let pattern of patterns) {
               match = text.match(pattern);
               if (match && match[1].trim()) {
                   break;
               }
           }
           
           if (match && match[1].trim()) {
               cuts[`cut${i}`] = match[1].trim();
           } else {
               // 대안적 파싱: 줄바꿈 기준으로 분리
               const lines = text.split('\n').filter(line => line.trim());
               if (lines[i-1]) {
                   cuts[`cut${i}`] = lines[i-1].trim();
               }
           }
       }
       
       return cuts;
   },

   // Cut별 대본을 개별 필드로 구성하는 함수
   buildCutDataForWebhook: function() {
       // 현재 에디트 박스의 수정된 내용을 반영
       const currentScript = document.getElementById('generatedScript').value.trim();
       if (currentScript) {
           this.generatedFullScript = currentScript;
       }

       // 전체 대본에서 Cut별로 파싱
       const parsedCuts = this.parseScriptFromText(this.generatedFullScript);
       
       // 웹훅용 데이터 구조 생성
       const cutData = {};
       for (let i = 1; i <= 5; i++) {
           const cutKey = `Cut ${i}`;
           // 파싱된 대본 또는 개별 입력 박스 내용 사용
           const scriptElement = document.getElementById(`cut${i}Script`);
           const scriptValue = scriptElement ? scriptElement.value.trim() : '';
           
           cutData[cutKey] = scriptValue || parsedCuts[`cut${i}`] || '';
       }
       
       return cutData;
   },

   // Cut별 대본 분산
   distributeCutScripts: function() {
       if (!this.generatedFullScript) {
           Utils.showAchievement('먼저 대본을 생성해주세요.', 'error');
           return;
       }

       // 저장된 전체 대본에서 Cut별로 분리
       const cuts = this.parseScriptFromText(this.generatedFullScript);
       
       // Cut 1-5 대본을 각각의 텍스트 박스에 배치
       for (let i = 1; i <= 5; i++) {
           const cutScript = document.getElementById(`cut${i}Script`);
           if (cutScript && cuts[`cut${i}`]) {
               cutScript.value = cuts[`cut${i}`];
               this.cuts[`cut${i}`].script = cuts[`cut${i}`];
           }
       }

       // 개별 버튼들 활성화
       [1, 2, 3, 5].forEach(cutNum => {
           const scriptToImageBtn = document.getElementById(`scriptToImageCut${cutNum}Btn`);
           const promptToImageBtn = document.getElementById(`promptToImageCut${cutNum}Btn`);
           if (scriptToImageBtn) {
               scriptToImageBtn.disabled = false;
           }
           if (promptToImageBtn) {
               promptToImageBtn.disabled = false;
           }
       });

       Utils.showAchievement('대본이 Cut별로 분산되었습니다! 📝');
   },

   // 이미지 생성 시작 (순차 처리)
   startImageGeneration: function() {
       if (this.isGenerating) {
           Utils.showAchievement('이미지 생성이 진행 중입니다.', 'error');
           return;
       }

       const webhookUrl = this.webhookUrls.imageGeneration;
       if (!webhookUrl) {
           Utils.showAchievement('웹훅 2 (이미지 생성) URL을 설정해주세요.', 'error');
           this.openWebhookModal();
           return;
       }

       if (!this.generatedFullScript) {
           Utils.showAchievement('먼저 대본을 생성해주세요.', 'error');
           return;
       }

       // 1. 대본을 Cut별로 분산
       this.distributeCutScripts();

       // 2. 처리할 Cut 목록 설정 (Cut 4 제외)
       this.currentProcessingQueue = [1, 2, 3, 5];
       this.currentProcessingIndex = 0;

       // 3. 순차 처리 시작
       this.isGenerating = true;
       this.showLoading(true);
       this.showStatus('이미지를 순차적으로 생성하고 있습니다...', 'info');

       this.processNextCut();
   },

   // 텍스트 응답 파싱 함수 (Midjourney 응답용)
   parseTextResponse: function(text) {
       console.log('텍스트 파싱 시작:', text);
       
       const result = {
           prompt: '',
           image_url: '',
           all_urls: []
       };
       
       const lines = text.split('\n');
       let isPromptSection = false;
       let isUrlSection = false;
       let promptLines = [];
       
       for (let line of lines) {
           line = line.trim();
           
           // 프롬프트 섹션 시작
           if (line.includes('이미지 프롬프트') || line.includes('Scene Description')) {
               isPromptSection = true;
               isUrlSection = false;
               continue;
           }
           
           // URL 섹션 시작
           if (line.includes('이미지 URL') || line.includes('Image URL')) {
               isPromptSection = false;
               isUrlSection = true;
               continue;
           }
           
           // 프롬프트 수집
           if (isPromptSection && line.length > 0 && !line.includes('*')) {
               promptLines.push(line);
           }
           
           // URL 수집
           if (isUrlSection && line.startsWith('https://')) {
               result.all_urls.push(line);
           }
       }
       
       // 프롬프트 조합 (*** 제거하고 정리)
       result.prompt = promptLines
           .filter(line => !line.includes('*'))
           .join(' ')
           .replace(/\*\*/g, '')
           .trim();
       
       // 첫 번째 URL을 기본 이미지로 설정
       if (result.all_urls.length > 0) {
           result.image_url = result.all_urls[0];
       }
       
       console.log('텍스트 파싱 완료:', result);
       return result;
   },

   // 다음 Cut 처리 (텍스트 응답 처리 적용)
   processNextCut: function() {
       if (this.currentProcessingIndex >= this.currentProcessingQueue.length) {
           // 모든 Cut 처리 완료
           this.isGenerating = false;
           this.showLoading(false);
           this.showStatus('모든 이미지 생성이 완료되었습니다! 🎉', 'success');
           Utils.showAchievement('모든 Cut의 이미지가 생성되었습니다! 🎨');
           return;
       }

       const currentCut = this.currentProcessingQueue[this.currentProcessingIndex];
       const webhookUrl = this.webhookUrls.imageGeneration;
       
       this.showStatus(`Cut ${currentCut} 이미지를 생성하고 있습니다... (${this.currentProcessingIndex + 1}/${this.currentProcessingQueue.length})`, 'info');

       // 새로운 데이터 구조 적용: Cut별 개별 필드 + Current Cut
       const cutData = this.buildCutDataForWebhook();
       cutData["Current Cut"] = currentCut;

       const requestData = {
           content: JSON.stringify(cutData),
           author: {
               id: "123456789",
               username: "sequential_image_generator",
               discriminator: "0001"
           },
           timestamp: new Date().toISOString(),
           attachments: []
       };

       const startTime = Date.now();

       fetch(webhookUrl, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify(requestData)
       })
       .then(response => {
           const duration = Date.now() - startTime;
           return response.text().then(text => {
               console.log('=== 원본 응답 텍스트 ===');
               console.log(text);
               console.log('=========================');
               
               if (response.ok) {
                   let result = null;
                   
                   try {
                       // JSON 파싱 시도
                       result = JSON.parse(text);
                       console.log('JSON 파싱 성공:', result);
                   } catch (parseError) {
                       console.log('JSON 파싱 실패, 텍스트 파싱 시도...');
                       
                       // 텍스트에서 성공 감지 및 데이터 추출
                       if (text.includes('이미지 프롬프트') || text.includes('이미지 URL')) {
                           result = this.parseTextResponse(text);
                           console.log('텍스트 파싱 결과:', result);
                       } else {
                           throw new Error('응답을 파싱할 수 없습니다: ' + text.substring(0, 100));
                       }
                   }
                   
                   // 성공 처리
                   this.handleSequentialImageSuccess(currentCut, result, duration);
               } else {
                   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
               }
           });
       })
       .catch(error => {
           const duration = Date.now() - startTime;
           console.error(`Cut ${currentCut} 이미지 생성 오류:`, error);
           this.handleSequentialImageError(currentCut, error, duration);
       });
   },

   // 순차 이미지 생성 성공 처리 (캐러셀 적용)
   handleSequentialImageSuccess: function(cutNumber, result, duration) {
       const cutKey = `cut${cutNumber}`;
       
       // 프롬프트 업데이트
       if (result.prompt) {
           const promptElement = document.getElementById(`cut${cutNumber}Prompt`);
           if (promptElement) {
               promptElement.value = result.prompt;
           }
           this.cuts[cutKey].prompt = result.prompt;
       }

       // 이미지 캐러셀 생성 (4개 이미지 모두 처리)
       if (result.all_urls && result.all_urls.length > 0) {
           this.createImageCarousel(cutNumber, result.all_urls, result.prompt);
           this.cuts[cutKey].images = result.all_urls;
       } else if (result.image_url) {
           // 단일 이미지 처리 (기존 호환성)
           this.createImageCarousel(cutNumber, [result.image_url], result.prompt);
           this.cuts[cutKey].images = [result.image_url];
       }

       Utils.showAchievement(`Cut ${cutNumber} 이미지 생성 완료! (${duration}ms) ✨`);

       // 다음 Cut 처리로 이동
       this.currentProcessingIndex++;
       
       // 잠시 대기 후 다음 Cut 처리 (서버 부하 방지)
       setTimeout(() => {
           this.processNextCut();
       }, 1000);
   },

   // 순차 이미지 생성 오류 처리
   handleSequentialImageError: function(cutNumber, error, duration) {
       console.error(`Cut ${cutNumber} 처리 실패:`, error);
       
       Utils.showAchievement(`Cut ${cutNumber} 이미지 생성 실패: ${error.message}`, 'error');
       
       // 오류가 발생해도 다음 Cut으로 진행
       this.currentProcessingIndex++;
       
       setTimeout(() => {
           this.processNextCut();
       }, 1000);
   },

   // 대본에서 프롬프트+이미지 한번에 생성 (텍스트 응답 처리 적용)
   generateFromScript: function(cutNumber) {
       if (this.isGenerating) {
           Utils.showAchievement('이미지 생성이 진행 중입니다.', 'error');
           return;
       }

       const scriptElement = document.getElementById(`cut${cutNumber}Script`);
       if (!scriptElement || !scriptElement.value.trim()) {
           Utils.showAchievement(`Cut ${cutNumber}의 대본을 입력해주세요.`, 'error');
           return;
       }

       const webhookUrl = this.webhookUrls.imageGeneration;
       if (!webhookUrl) {
           Utils.showAchievement('웹훅 2 (이미지 생성) URL을 설정해주세요.', 'error');
           this.openWebhookModal();
           return;
       }
	   
	   this.isGenerating = true;
       this.showLoading(true);
       this.showStatus(`Cut ${cutNumber} 프롬프트와 이미지를 생성하고 있습니다...`, 'info');

       // 새로운 데이터 구조 적용: Cut별 개별 필드 + Current Cut + script_to_image 플래그
       const cutData = this.buildCutDataForWebhook();
       cutData["Current Cut"] = cutNumber;
       cutData["script_to_image"] = true;

       const requestData = {
           content: JSON.stringify(cutData),
           author: {
               id: "123456789",
               username: "script_to_image_generator",
               discriminator: "0001"
           },
           timestamp: new Date().toISOString(),
           attachments: []
       };

       const startTime = Date.now();

       fetch(webhookUrl, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify(requestData)
       })
       .then(response => {
           const duration = Date.now() - startTime;
           return response.text().then(text => {
               console.log('=== generateFromScript 응답 ===');
               console.log(text);
               console.log('===============================');
               
               if (response.ok) {
                   let result = null;
                   
                   try {
                       // JSON 파싱 시도
                       result = JSON.parse(text);
                       console.log('JSON 파싱 성공:', result);
                   } catch (parseError) {
                       console.log('JSON 파싱 실패, 텍스트 파싱 시도...');
                       
                       // 텍스트에서 성공 감지 및 데이터 추출
                       if (text.includes('이미지 프롬프트') || text.includes('이미지 URL')) {
                           result = this.parseTextResponse(text);
                           console.log('텍스트 파싱 결과:', result);
                       } else {
                           throw new Error('응답을 파싱할 수 없습니다: ' + text.substring(0, 100));
                       }
                   }
                   
                   // 성공 처리
                   this.handleScriptToImageSuccess(cutNumber, result, duration);
               } else {
                   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
               }
           });
       })
       .catch(error => {
           const duration = Date.now() - startTime;
           console.error(`Cut ${cutNumber} 생성 오류:`, error);
           this.showStatus(`Cut ${cutNumber} 생성 실패: ${error.message} (${duration}ms)`, 'error');
           Utils.showAchievement('생성에 실패했습니다. 다시 시도해주세요.', 'error');
       })
       .finally(() => {
           this.isGenerating = false;
           this.showLoading(false);
       });
   },

   // 프롬프트에서 이미지만 재생성 (간단한 프롬프트만 전송)
   generateFromPrompt: function(cutNumber) {
       if (this.isGenerating) {
           Utils.showAchievement('이미지 생성이 진행 중입니다.', 'error');
           return;
       }

       const promptElement = document.getElementById(`cut${cutNumber}Prompt`);
       if (!promptElement || !promptElement.value.trim()) {
           Utils.showAchievement(`Cut ${cutNumber}의 프롬프트를 입력해주세요.`, 'error');
           return;
       }

       const webhookUrl = this.webhookUrls.imageGeneration;
       if (!webhookUrl) {
           Utils.showAchievement('웹훅 2 (이미지 생성) URL을 설정해주세요.', 'error');
           this.openWebhookModal();
           return;
       }

       this.isGenerating = true;
       this.showLoading(true);
       this.showStatus(`Cut ${cutNumber} 이미지를 재생성하고 있습니다...`, 'info');

       // 간단하게 프롬프트만 전송
       const requestData = {
           content: JSON.stringify({
               "prompt": promptElement.value.trim()
           }),
           author: {
               id: "123456789",
               username: "prompt_to_image_generator",
               discriminator: "0001"
           },
           timestamp: new Date().toISOString(),
           attachments: []
       };

       const startTime = Date.now();

       fetch(webhookUrl, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify(requestData)
       })
       .then(response => {
           const duration = Date.now() - startTime;
           return response.text().then(text => {
               console.log('=== generateFromPrompt 응답 ===');
               console.log(text);
               console.log('===============================');
               
               if (response.ok) {
                   let result = null;
                   
                   try {
                       // JSON 파싱 시도
                       result = JSON.parse(text);
                       console.log('JSON 파싱 성공:', result);
                   } catch (parseError) {
                       console.log('JSON 파싱 실패, 텍스트 파싱 시도...');
                       
                       // 텍스트에서 성공 감지 및 데이터 추출
                       if (text.includes('이미지 프롬프트') || text.includes('이미지 URL')) {
                           result = this.parseTextResponse(text);
                           console.log('텍스트 파싱 결과:', result);
                       } else {
                           throw new Error('응답을 파싱할 수 없습니다: ' + text.substring(0, 100));
                       }
                   }
                   
                   // 성공 처리
                   this.handlePromptToImageSuccess(cutNumber, result, duration);
               } else {
                   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
               }
           });
       })
       .catch(error => {
           const duration = Date.now() - startTime;
           console.error(`Cut ${cutNumber} 이미지 재생성 오류:`, error);
           this.showStatus(`Cut ${cutNumber} 이미지 재생성 실패: ${error.message} (${duration}ms)`, 'error');
           Utils.showAchievement('이미지 재생성에 실패했습니다. 다시 시도해주세요.', 'error');
       })
       .finally(() => {
           this.isGenerating = false;
           this.showLoading(false);
       });
   },

   // 대본→이미지 생성 성공 처리 (캐러셀 적용)
   handleScriptToImageSuccess: function(cutNumber, result, duration) {
       const cutKey = `cut${cutNumber}`;
       
       if (result.image_url || result.prompt || result.all_urls) {
           // 프롬프트 업데이트
           if (result.prompt) {
               const promptElement = document.getElementById(`cut${cutNumber}Prompt`);
               if (promptElement) {
                   promptElement.value = result.prompt;
               }
               this.cuts[cutKey].prompt = result.prompt;
           }

           // 이미지 캐러셀 생성
           if (result.all_urls && result.all_urls.length > 0) {
               this.createImageCarousel(cutNumber, result.all_urls, result.prompt);
               this.cuts[cutKey].images = result.all_urls;
           } else if (result.image_url) {
               this.createImageCarousel(cutNumber, [result.image_url], result.prompt);
               this.cuts[cutKey].images = [result.image_url];
           }

           // 프롬프트→이미지 버튼 활성화
           const promptToImageBtn = document.getElementById(`promptToImageCut${cutNumber}Btn`);
           if (promptToImageBtn) {
               promptToImageBtn.disabled = false;
           }

           this.showStatus(`Cut ${cutNumber} 프롬프트와 이미지 생성 완료! (${duration}ms) 🎨`, 'success');
           Utils.showAchievement(`Cut ${cutNumber} 이미지가 생성되었습니다! 프롬프트를 수정해서 재생성할 수 있습니다.`);
       } else {
           this.showStatus(`Cut ${cutNumber} 생성 실패 - 응답에 데이터가 없습니다.`, 'error');
           Utils.showAchievement('생성에 실패했습니다.', 'error');
       }
   },

   // 프롬프트→이미지 재생성 성공 처리 (캐러셀 적용)
   handlePromptToImageSuccess: function(cutNumber, result, duration) {
       const cutKey = `cut${cutNumber}`;
       
       if (result.all_urls && result.all_urls.length > 0) {
           this.createImageCarousel(cutNumber, result.all_urls, result.prompt);
           this.cuts[cutKey].images = result.all_urls;
           
           this.showStatus(`Cut ${cutNumber} 이미지 재생성 완료! (${duration}ms) 🖼️`, 'success');
           Utils.showAchievement(`Cut ${cutNumber} 새로운 이미지가 생성되었습니다! 🎨`);
       } else if (result.image_url) {
           this.createImageCarousel(cutNumber, [result.image_url], result.prompt);
           this.cuts[cutKey].images = [result.image_url];
           
           this.showStatus(`Cut ${cutNumber} 이미지 재생성 완료! (${duration}ms) 🖼️`, 'success');
           Utils.showAchievement(`Cut ${cutNumber} 새로운 이미지가 생성되었습니다! 🎨`);
       } else {
           this.showStatus(`Cut ${cutNumber} 이미지 재생성 실패 - 응답에 이미지가 없습니다.`, 'error');
           Utils.showAchievement('이미지 재생성에 실패했습니다.', 'error');
       }
   },

   // 로딩 상태 표시
   showLoading: function(show) {
       const generateScriptBtn = document.getElementById('generateScriptBtn');
       const generateImagesBtn = document.getElementById('generateImagesBtn');

       if (show) {
           if (generateScriptBtn) {
               generateScriptBtn.disabled = true;
               generateScriptBtn.innerHTML = '<span class="button-loading"></span>생성 중...';
           }
           if (generateImagesBtn) {
               generateImagesBtn.disabled = true;
               generateImagesBtn.innerHTML = '<span class="button-loading"></span>생성 중...';
           }

           // 개별 버튼들도 비활성화
           [1, 2, 3, 5].forEach(cutNum => {
               const scriptBtn = document.getElementById(`scriptToImageCut${cutNum}Btn`);
               const promptBtn = document.getElementById(`promptToImageCut${cutNum}Btn`);
               if (scriptBtn) {
                   scriptBtn.disabled = true;
                   scriptBtn.innerHTML = '<span class="button-loading"></span>처리중...';
               }
               if (promptBtn) {
                   promptBtn.disabled = true;
                   promptBtn.innerHTML = '<span class="button-loading"></span>처리중...';
               }
           });
       } else {
           if (generateScriptBtn) {
               generateScriptBtn.disabled = false;
               generateScriptBtn.innerHTML = '📝 대본 생성';
           }
           if (generateImagesBtn) {
               generateImagesBtn.disabled = false;
               generateImagesBtn.innerHTML = '🖼️ 이미지 생성 시작';
           }

           // 개별 버튼들 복원
           [1, 2, 3, 5].forEach(cutNum => {
               const scriptBtn = document.getElementById(`scriptToImageCut${cutNum}Btn`);
               const promptBtn = document.getElementById(`promptToImageCut${cutNum}Btn`);
               if (scriptBtn) {
                   scriptBtn.disabled = false;
                   scriptBtn.innerHTML = '📝 대본→이미지';
               }
               if (promptBtn) {
                   promptBtn.disabled = false;
                   promptBtn.innerHTML = '🖼️ 프롬프트→이미지';
               }
           });
       }
   },

   // 상태 메시지 표시
   showStatus: function(message, type) {
       const statusDiv = document.getElementById('shortformStatus');
       if (!statusDiv) return;

       const bgColors = {
           success: '#d4edda',
           error: '#f8d7da',
           info: '#d1ecf1'
       };

       const textColors = {
           success: '#155724',
           error: '#721c24',
           info: '#0c5460'
       };

       statusDiv.style.display = 'block';
       statusDiv.style.background = bgColors[type] || bgColors.info;
       statusDiv.style.color = textColors[type] || textColors.info;
       statusDiv.style.border = `1px solid ${bgColors[type] || bgColors.info}`;
       statusDiv.textContent = message;

       // 5초 후 자동 숨김 (에러가 아닌 경우)
       if (type !== 'error') {
           setTimeout(() => {
               this.hideStatus();
           }, 5000);
       }
   },

   // 상태 메시지 숨김
   hideStatus: function() {
       const statusDiv = document.getElementById('shortformStatus');
       if (statusDiv) {
           statusDiv.style.display = 'none';
       }
   }
};
