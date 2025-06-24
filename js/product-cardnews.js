// 카드뉴스 생성 모듈
window.ProductCardNews = {
   // 상태 관리
   webhookUrls: {
       contentGeneration: '', // 웹훅 1: 본문 생성
       cardNewsPosting: ''    // 웹훅 2: 카드뉴스 포스팅
   },
   isGenerating: false,
   sendHistory: [],
   originalIdea: '', // 원본 아이디어 저장
   
   // HTML 반환
   getHTML: function() {
       return `
           <div class="cardnews-container">
               <!-- 카드뉴스 아이디어 입력 섹션 -->
			   <div class="section">
                   <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;">
                       <h2 style="margin: 0;">📰 카드뉴스 아이디어 입력</h2>
                       <button onclick="ProductCardNews.openWebhookModal()" style="background: #6c757d; margin: 0;">⚙️ 설정</button>
                   </div>
                   
                   <div class="form-group">
                       <label for="cardNewsTitle">아이디어</label>
                       <div style="display: flex; gap: 15px; align-items: stretch;">
                           <input type="text" id="cardNewsTitle" placeholder='예: "연인에게 감동적인 선물 하는 방법"' style="flex: 1;">
                           <button id="generateContentBtn" onclick="ProductCardNews.generateContent()" style="flex: none; white-space: nowrap; margin: 0;">📝 생성</button>
                       </div>
                   </div>
               </div>

               <!-- 생성된 본문 (검수 및 수정) 섹션 -->
               <div class="section">
                   <h2>📝 생성된 본문 (검수 및 수정)</h2>
                   
                   <div class="form-group">
                       <textarea id="generatedContent" rows="15" placeholder=""></textarea>
                   </div>
                   
                   <div style="text-align: center; margin-top: 15px;">
                       <button id="regenerateContentBtn" onclick="ProductCardNews.regenerateContent()">🔄 본문 재생성</button>
                   </div>
               </div>

               <!-- Canva 및 배포 섹션 -->
               <div class="section">
                   <h2>🎨 Canva 및 배포</h2>
                   
                   <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                       <h3 style="margin: 0 0 15px 0; color: #667eea;">Step 1. Canva에서 카드뉴스 본문 넣기</h3>
                       <p style="margin: 0 0 15px 0; color: #666;">위에서 생성된 본문을 복사해서 Canva 템플릿에 붙여넣으세요.</p>
                       <button onclick="ProductCardNews.copyContentToClipboard()" class="cardnews-button" style="background: #00d4aa; margin-right: 10px;">📋 본문 복사</button>
						<button onclick="ProductCardNews.openCanva()" class="cardnews-button" style="background: #8c52ff; margin-right: 10px;">📝 Canva로 이동</button>
                   </div>
                   
                   <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                       <h3 style="margin: 0 0 15px 0; color: #667eea;">Step 2. 포스팅 하기</h3>
                       <p style="margin: 0 0 15px 0; color: #666;">Canva에서 카드뉴스 작업이 완료되면 포스팅을 진행하세요.</p>
                       <button id="postCardNewsBtn" onclick="ProductCardNews.postCardNews()" class="cardnews-button" style="background: #28a745;">📤 포스팅</button>
                   </div>
               </div>

               <!-- 전송 기록 섹션 -->
               <div class="section">
                   <h2>📋 전송 기록</h2>
                   <div id="cardNewsResult" style="max-height: 400px; overflow-y: auto; background: #f8f9fa; border-radius: 8px; padding: 15px; border: 1px solid #e9ecef;">
                       <p style="color: #666; text-align: center; margin: 0;">전송 기록이 없습니다.</p>
                   </div>
               </div>

               <!-- 상태 메시지 -->
               <div id="cardNewsStatus" style="margin-top: 20px; padding: 15px; border-radius: 8px; display: none;"></div>
           </div>

           <!-- 웹훅 설정 모달 -->
           <div id="cardNewsWebhookModal" class="modal" style="display: none;">
               <div class="modal-content">
                   <span class="close" onclick="ProductCardNews.closeWebhookModal()">&times;</span>
                   <h2>⚙️ 카드뉴스 웹훅 설정</h2>
                   
                   <div class="form-group">
                       <label>웹훅 1 - 본문 생성</label>
                       <div class="url-input-group">
                           <input type="text" id="cardNewsWebhook1" placeholder="본문 생성 웹훅 URL">
                           <button onclick="ProductCardNews.saveWebhook(1)">저장</button>
                       </div>
                       <span id="cardNewsWebhook1Saved" class="saved-indicator" style="display: none;">✅ 저장됨</span>
                   </div>
                   
                   <div class="form-group">
                       <label>웹훅 2 - 카드뉴스 포스팅</label>
                       <div class="url-input-group">
                           <input type="text" id="cardNewsWebhook2" placeholder="카드뉴스 포스팅 웹훅 URL">
                           <button onclick="ProductCardNews.saveWebhook(2)">저장</button>
                       </div>
                       <span id="cardNewsWebhook2Saved" class="saved-indicator" style="display: none;">✅ 저장됨</span>
                   </div>
                   
                   <div class="modal-actions">
                       <button onclick="ProductCardNews.closeWebhookModal()" class="btn-secondary">닫기</button>
                   </div>
               </div>
           </div>
       `;
   },

   // 초기화
   initialize: function() {
       this.loadSavedWebhooks();
       this.loadHistory();
   },

   // 저장된 웹훅 URL 로드
   loadSavedWebhooks: function() {
       this.webhookUrls.contentGeneration = Utils.safeStorage.get('cardNewsContentWebhook', '');
       this.webhookUrls.cardNewsPosting = Utils.safeStorage.get('cardNewsPostingWebhook', '');

       setTimeout(() => {
           const webhook1 = document.getElementById('cardNewsWebhook1');
           const webhook2 = document.getElementById('cardNewsWebhook2');

           if (webhook1 && this.webhookUrls.contentGeneration) {
               webhook1.value = this.webhookUrls.contentGeneration;
               this.showSavedIndicator('cardNewsWebhook1Saved');
           }
           if (webhook2 && this.webhookUrls.cardNewsPosting) {
               webhook2.value = this.webhookUrls.cardNewsPosting;
               this.showSavedIndicator('cardNewsWebhook2Saved');
           }
       }, 100);
   },

   // 웹훅 모달 열기
   openWebhookModal: function() {
       const modal = document.getElementById('cardNewsWebhookModal');
       modal.style.display = 'flex';
       this.loadSavedWebhooks();
   },

   // 웹훅 모달 닫기
   closeWebhookModal: function() {
       document.getElementById('cardNewsWebhookModal').style.display = 'none';
   },

   // 웹훅 URL 저장
   saveWebhook: function(webhookNumber) {
       const urlInput = document.getElementById(`cardNewsWebhook${webhookNumber}`);
       const indicator = document.getElementById(`cardNewsWebhook${webhookNumber}Saved`);
       const url = urlInput.value.trim();

       if (!url) {
           Utils.showAchievement('웹훅 URL을 입력해주세요.', 'error');
           return;
       }

       const storageKeys = ['', 'cardNewsContentWebhook', 'cardNewsPostingWebhook'];
       const storageKey = storageKeys[webhookNumber];
       
       if (storageKey) {
           Utils.safeStorage.set(storageKey, url);
           
           // 메모리에도 저장
           const webhookProps = ['', 'contentGeneration', 'cardNewsPosting'];
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

   // 컨텐츠 생성
   generateContent: function() {
       if (this.isGenerating) {
           Utils.showAchievement('이미 컨텐츠 생성이 진행 중입니다.', 'error');
           return;
       }

       const title = document.getElementById('cardNewsTitle').value.trim();
       const webhookUrl = this.webhookUrls.contentGeneration;

       if (!title) {
           Utils.showAchievement('카드뉴스 주제를 입력해주세요.', 'error');
           return;
       }

       if (!webhookUrl) {
           Utils.showAchievement('웹훅 1 (본문 생성) URL을 설정해주세요.', 'error');
           this.openWebhookModal();
           return;
       }

       // 원본 아이디어 저장
       this.originalIdea = title;

       this.isGenerating = true;
       this.showLoading(true);
       this.showStatus('카드뉴스 본문을 생성하고 있습니다...', 'info');

       const requestData = {
           content: `카드뉴스 주제: ${title}`,
           author: {
               id: "123456789",
               username: "cardnews_generator",
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
               console.log('카드뉴스 본문 생성 응답:', text);

               if (response.ok) {
                   try {
                       const result = JSON.parse(text);
                       this.handleGenerationSuccess(result, duration);
                   } catch (parseError) {
                       // JSON 파싱 실패 시 텍스트 기반 처리
                       this.handleGenerationSuccess({
                           content: text.substring(0, 2000)
                       }, duration);
                   }
               } else {
                   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
               }
           });
       })
       .catch(error => {
           const duration = Date.now() - startTime;
           console.error('카드뉴스 본문 생성 오류:', error);
           this.handleGenerationError(error, duration);
       })
       .finally(() => {
           this.isGenerating = false;
           this.showLoading(false);
       });

       // 히스토리에 요청 기록
       this.saveToHistory({
           url: webhookUrl,
           webhookType: '웹훅 1 (본문 생성)',
           method: 'POST',
           data: JSON.stringify(requestData),
           cardNewsTitle: title,
           timestamp: new Date().toISOString()
       });
   },

   // 생성 성공 처리
   handleGenerationSuccess: function(result, duration) {
       const contentTextarea = document.getElementById('generatedContent');
       if (contentTextarea && result.content) {
           contentTextarea.value = result.content;
       }

       this.showStatus(`카드뉴스 본문 생성 완료! (${duration}ms) 📰`, 'success');
       Utils.showAchievement('카드뉴스 본문이 생성되었습니다! 내용을 검수하고 수정해보세요.');

       // 히스토리 업데이트
       this.updateLastHistoryRecord({
           status: 200,
           success: true,
           duration: duration,
           response: result
       });
   },

   // 생성 오류 처리
   handleGenerationError: function(error, duration) {
       this.showStatus(`카드뉴스 본문 생성 실패: ${error.message} (${duration}ms)`, 'error');
       Utils.showAchievement('카드뉴스 본문 생성에 실패했습니다. 다시 시도해주세요.', 'error');

       // 히스토리 업데이트
       this.updateLastHistoryRecord({
           status: 0,
           success: false,
           duration: duration,
           response: { error: error.message }
       });
   },

   // 본문 재생성
   regenerateContent: function() {
       const title = document.getElementById('cardNewsTitle').value.trim();
       if (!title) {
           Utils.showAchievement('카드뉴스 주제를 먼저 입력해주세요.', 'error');
           return;
       }
       this.generateContent();
   },

   // 본문을 클립보드에 복사
   copyContentToClipboard: function() {
       const content = document.getElementById('generatedContent').value.trim();
       if (!content) {
           Utils.showAchievement('복사할 본문이 없습니다. 먼저 본문을 생성해주세요.', 'error');
           return;
       }

       Utils.copyText(content);
   },

   // Canva로 이동
   openCanva: function() {
       window.open('https://www.canva.com', '_blank');
       Utils.showAchievement('Canva가 새 창에서 열렸습니다! 🎨');
   },

   // 카드뉴스 포스팅
   postCardNews: function() {
       const webhookUrl = this.webhookUrls.cardNewsPosting;
       const title = document.getElementById('cardNewsTitle').value.trim();
       const content = document.getElementById('generatedContent').value.trim();

       if (!webhookUrl) {
           Utils.showAchievement('웹훅 2 (카드뉴스 포스팅) URL을 설정해주세요.', 'error');
           this.openWebhookModal();
           return;
       }

       if (!title || !content) {
           Utils.showAchievement('카드뉴스 주제와 본문을 먼저 생성해주세요.', 'error');
           return;
       }

       this.showLoading(true);
       this.showStatus('카드뉴스를 포스팅하고 있습니다...', 'info');

       // 웹훅 2 데이터 포맷: 원본 아이디어 + 제목 추출 + 전체 본문
       const formattedContent = `아이디어: ${this.originalIdea || title}\n제목: ${content}`;

       const requestData = {
           content: formattedContent,
           author: {
               id: "123456789",
               username: "cardnews_poster",
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
               console.log('카드뉴스 포스팅 응답:', text);

               if (response.ok) {
                   this.showStatus(`카드뉴스 포스팅 완료! (${duration}ms) 📤`, 'success');
                   Utils.showAchievement('카드뉴스가 SNS에 포스팅되었습니다! 🚀');

                   // 히스토리에 성공 기록
                   this.saveToHistory({
                       url: webhookUrl,
                       webhookType: '웹훅 2 (카드뉴스 포스팅)',
                       method: 'POST',
                       data: JSON.stringify(requestData),
                       cardNewsTitle: title,
                       timestamp: new Date().toISOString(),
                       status: response.status,
                       success: true,
                       duration: duration,
                       response: { message: text }
                   });
               } else {
                   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
               }
           });
       })
       .catch(error => {
           const duration = Date.now() - startTime;
           console.error('카드뉴스 포스팅 오류:', error);
           this.showStatus(`카드뉴스 포스팅 실패: ${error.message} (${duration}ms)`, 'error');
           Utils.showAchievement('카드뉴스 포스팅에 실패했습니다. 다시 시도해주세요.', 'error');

           // 히스토리에 실패 기록
           this.saveToHistory({
               url: webhookUrl,
               webhookType: '웹훅 2 (카드뉴스 포스팅)',
               method: 'POST',
               data: JSON.stringify(requestData),
               cardNewsTitle: title,
               timestamp: new Date().toISOString(),
               status: 0,
               success: false,
               duration: duration,
               response: { error: error.message }
           });
       })
       .finally(() => {
           this.showLoading(false);
       });
   },

   // 본문에서 제목 추출 (첫 번째 줄에서 제목 찾기)
	extractTitleFromContent: function(content) {
		const trimmedContent = content.trim();
		
		// [카드 1] 이전의 첫 번째 문장 찾기
		const cardPattern = /\[카드\s*\d+\]/;
		const match = trimmedContent.match(cardPattern);
		
		if (match) {
			// [카드 1] 이전 부분이 제목
			const titlePart = trimmedContent.substring(0, match.index).trim();
			return titlePart || '카드뉴스 제목';
		}
		
		// [카드 1] 패턴을 찾지 못한 경우 첫 번째 줄의 첫 문장
		const firstLine = trimmedContent.split('\n')[0] || '';
		return firstLine.trim() || '카드뉴스 제목';
	},

   // 히스토리 저장
   saveToHistory: function(record) {
       this.sendHistory.unshift(record);
       
       // 최대 50개 기록만 유지
       if (this.sendHistory.length > 50) {
           this.sendHistory = this.sendHistory.slice(0, 50);
       }

       // 로컬스토리지에 저장
       Utils.safeStorage.set('cardNewsHistory', JSON.stringify(this.sendHistory));
       
       this.displayHistory();
   },

   // 마지막 히스토리 레코드 업데이트
   updateLastHistoryRecord: function(updateData) {
       if (this.sendHistory.length > 0) {
           const lastRecord = this.sendHistory[0];
           Object.assign(lastRecord, updateData);
           
           Utils.safeStorage.set('cardNewsHistory', JSON.stringify(this.sendHistory));
           this.displayHistory();
       }
   },

   // 히스토리 로드
   loadHistory: function() {
       try {
           const saved = Utils.safeStorage.get('cardNewsHistory', '[]');
           this.sendHistory = JSON.parse(saved);
           
           // 24시간 이후 기록 정리
           this.cleanupOldHistory();
           this.displayHistory();
       } catch (e) {
           console.log('히스토리 로드 오류:', e);
           this.sendHistory = [];
       }
   },

   // 오래된 히스토리 정리
   cleanupOldHistory: function() {
       const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
       this.sendHistory = this.sendHistory.filter(record => {
           try {
               return new Date(record.timestamp).getTime() > oneDayAgo;
           } catch (e) {
               return false;
           }
       });
       
       Utils.safeStorage.set('cardNewsHistory', JSON.stringify(this.sendHistory));
   },

   // 히스토리 표시
   displayHistory: function() {
       const resultDiv = document.getElementById('cardNewsResult');
       if (!resultDiv) return;

       if (this.sendHistory.length === 0) {
           resultDiv.innerHTML = '<p style="color: #666; text-align: center; margin: 0;">전송 기록이 없습니다.</p>';
           return;
       }

       let html = '';
       this.sendHistory.forEach(record => {
           const timestamp = new Date(record.timestamp).toLocaleString('ko-KR');
           const timeAgo = Utils.getTimeAgo(record.timestamp);
           const statusIcon = record.success ? '✅' : '❌';
           const statusText = record.success ? '성공' : '실패';
           const statusColor = record.success ? '#28a745' : '#dc3545';
           
           const cardNewsTitle = record.cardNewsTitle || 'N/A';
           const responseMessage = record.response ? 
               (record.response.message || record.response.error || JSON.stringify(record.response).substring(0, 100)) : 
               '응답 없음';

           html += `
               <div class="log-entry ${record.success ? 'success' : 'error'}" style="margin-bottom: 10px; padding: 10px; border-radius: 6px;">
                   <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                       <div style="font-weight: 600; color: ${statusColor};">${statusIcon} ${statusText}</div>
                       <div style="font-size: 12px; color: #666;">${timestamp} (${timeAgo})</div>
                   </div>
                   <div style="margin-bottom: 5px;">
                       <strong>주제:</strong> ${cardNewsTitle}
                   </div>
                   <div style="margin-bottom: 5px;">
                       <strong>타입:</strong> ${record.webhookType}
                   </div>
                   <div style="margin-bottom: 5px;">
                       <strong>URL:</strong> ${record.url.substring(0, 50)}...
                   </div>
                   ${record.status ? `<div style="margin-bottom: 5px;"><strong>상태:</strong> ${record.status}</div>` : ''}
                   ${record.duration ? `<div style="margin-bottom: 5px;"><strong>응답시간:</strong> ${record.duration}ms</div>` : ''}
                   <div>
                       <strong>응답:</strong> ${responseMessage}
                   </div>
               </div>
           `;
       });

       resultDiv.innerHTML = html;
   },

   // 로딩 상태 표시
   showLoading: function(show) {
       const generateBtn = document.getElementById('generateContentBtn');
       const regenerateBtn = document.getElementById('regenerateContentBtn');
       const postBtn = document.getElementById('postCardNewsBtn');

       if (show) {
           if (generateBtn) {
               generateBtn.disabled = true;
               generateBtn.innerHTML = '<span class="button-loading"></span>생성 중...';
           }
           if (regenerateBtn) {
               regenerateBtn.disabled = true;
               regenerateBtn.innerHTML = '<span class="button-loading"></span>재생성 중...';
           }
           if (postBtn) {
               postBtn.disabled = true;
               postBtn.innerHTML = '<span class="button-loading"></span>포스팅 중...';
           }
       } else {
           if (generateBtn) {
               generateBtn.disabled = false;
               generateBtn.innerHTML = '📝 생성';
           }
           if (regenerateBtn) {
               regenerateBtn.disabled = false;
               regenerateBtn.innerHTML = '🔄 본문 재생성';
           }
           if (postBtn) {
               postBtn.disabled = false;
               postBtn.innerHTML = '📤 포스팅';
           }
       }
   },

   // 상태 메시지 표시
   showStatus: function(message, type) {
       const statusDiv = document.getElementById('cardNewsStatus');
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
       const statusDiv = document.getElementById('cardNewsStatus');
       if (statusDiv) {
           statusDiv.style.display = 'none';
       }
   }
};
