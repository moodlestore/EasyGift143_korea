// 포스팅 기능 모듈 (기존 product-register.js의 메인 기능을 그대로 분리)
window.ProductPosting = {
    // 상태 변수 (기존과 동일)
    postFiles: [],
    infoFiles: [],
    sendHistory: [],
    isTransferInProgress: false,
    
    // HTML 반환 (기존 메인 탭 내용 그대로)
    getHTML: function() {
        return `
            <div class="tabs">
                <button class="tab active" onclick="ProductPosting.switchTab(event, 'main')">메인</button>
                <button class="tab" onclick="ProductPosting.switchTab(event, 'history')">전송 기록</button>
            </div>

            <!-- 메인 탭 -->
            <div id="main" class="tab-content active">
                <!-- 웹훅 URL 설정 -->
                <div class="section">
                    <h2>🔗 웹훅 URL 설정</h2>
                    <div class="form-group">
                        <label for="webhookUrl1">웹훅 1 - Airtable 데이터 전송</label>
                        <div class="url-input-group">
                            <input type="text" id="webhookUrl1">
                            <button onclick="ProductPosting.saveWebhookUrl('webhookUrl1')">저장</button>
                        </div>
                        <span id="savedIndicator1" class="saved-indicator" style="display: none;">✅ 저장됨</span>
                    </div>
                    <div class="form-group">
                        <label for="webhookUrl2">웹훅 2 - Airtable → Buffer 전송</label>
                        <div class="url-input-group">
                            <input type="text" id="webhookUrl2">
                            <button onclick="ProductPosting.saveWebhookUrl('webhookUrl2')">저장</button>
                        </div>
                        <span id="savedIndicator2" class="saved-indicator" style="display: none;">✅ 저장됨</span>
                    </div>
                </div>

                <!-- 데이터 입력 -->
                <div class="section">
					<h2>📝 데이터 입력</h2>
					<button class="clear-all" onclick="ProductPosting.clearAll()">🗑️ 전체 초기화</button>
					
                    <div class="form-group">
                        <label for="productName">제품명</label>
                        <input type="text" id="productName" placeholder="예: 애플 에어팟 프로 3세대">
                    </div>

                    <div class="form-group">
                        <label for="productPrice">제품가격</label>
                        <input type="text" id="productPrice" placeholder="예: 359,000원">
                    </div>

                    <div class="form-group">
                        <label for="productInfo">제품정보</label>
                        <textarea id="productInfo" rows="10" placeholder="제품의 주요 특징과 기능을 설명해주세요"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="customerReview">고객리뷰</label>
                        <textarea id="customerReview" rows="10" placeholder="고객들의 후기와 평가를 입력해주세요. 여러 리뷰가 있을 경우 줄바꿈으로 구분하세요.&#10;&#10;예:&#10;음질이 정말 깨끗하고 노이즈 캔슬링 성능이 뛰어나요.&#10;장시간 착용해도 편안합니다.&#10;배터리 지속시간도 만족스럽습니다."></textarea>
                    </div>

                    <div class="form-group">
                        <label for="affiliateLink">구매링크</label>
                        <textarea id="affiliateLink" rows="1" placeholder="구매 링크를 입력해주세요"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="affiliateNotice">대가성문구</label>
                        <textarea id="affiliateNotice" rows="1" placeholder="어필리에이트 대가성 문구를 입력해 주세요."></textarea>
                    </div>

                    <div class="form-group">
                        <label>정보 이미지들 (최대 4개)</label>
                        <div class="file-upload-area">
                            <input type="file" id="infoFileInput" multiple accept="image/*" style="display: none;">
                            <button onclick="document.getElementById('infoFileInput').click()">정보 이미지들 선택</button>
                            <p>info-1.png, info-2.png, info-3.png, info-4.png 파일들을 업로드하세요</p>
                        </div>
                        <div id="infoFileList" class="file-list" style="display: none;"></div>
                    </div>

                    <div class="form-group">
                        <label>포스팅 이미지 (1개)</label>
                        <div class="file-upload-area">
                            <input type="file" id="postFileInput" accept="image/*" style="display: none;">
                            <button onclick="document.getElementById('postFileInput').click()">포스팅 이미지 선택</button>
                            <p>post.png 파일을 업로드하세요</p>
                        </div>
                        <div id="postFileList" class="file-list" style="display: none;"></div>
                    </div>
                </div>

                <!-- 전송 -->
                <div class="section">
                    <h2>🚀 전송</h2>
                    <button id="sendButton" onclick="ProductPosting.startTransferProcess()">제품 정보 전송하기</button>
                    <div id="result"></div>
                </div>
            </div>

            <!-- 전송 기록 탭 -->
            <div id="history" class="tab-content">
                <div class="section">
                    <h2>📋 전송 기록</h2>
                    <button onclick="ProductPosting.displayHistory()">기록 새로고침</button>
                    <button class="secondary" onclick="ProductPosting.clearHistory()">기록 삭제</button>
                    <div id="historyList" style="margin-top: 15px;"></div>
                </div>
            </div>
        `;
    },
    
    // 초기화 (기존과 동일)
    initialize: function() {
        this.loadSavedUrls();
        this.loadHistory();
        this.setupFileHandlers();
    },
    
    // 저장된 URL 로드 (기존과 동일)
    loadSavedUrls: function() {
        const savedUrl1 = Utils.safeStorage.get('webhookUrl1', '');
        const savedUrl2 = Utils.safeStorage.get('webhookUrl2', '');
        
        if (savedUrl1) {
            document.getElementById('webhookUrl1').value = savedUrl1;
            this.showSavedIndicator('savedIndicator1');
        }
        if (savedUrl2) {
            document.getElementById('webhookUrl2').value = savedUrl2;
            this.showSavedIndicator('savedIndicator2');
        }
    },
    
    // 히스토리 로드 (기존과 동일)
    loadHistory: function() {
        try {
            const historyData = Utils.safeStorage.get('webhookHistory', '[]');
            if (historyData !== '[]') {
                this.sendHistory = JSON.parse(historyData);
            }
        } catch (e) {
            console.log('히스토리 데이터 파싱 오류:', e);
            this.sendHistory = [];
        }
    },
    
    // 파일 핸들러 설정 (기존과 동일)
    setupFileHandlers: function() {
        const postFileInput = document.getElementById('postFileInput');
        const infoFileInput = document.getElementById('infoFileInput');

        if (postFileInput) {
            postFileInput.addEventListener('change', (e) => {
                this.handlePostFiles(e.target.files);
            });
        }

        if (infoFileInput) {
            infoFileInput.addEventListener('change', (e) => {
                this.handleInfoFiles(e.target.files);
            });
        }
    },
    
    // 포스팅 파일 처리 (기존과 동일)
    handlePostFiles: function(files) {
        if (files.length > 1) {
            this.addLogEntry('포스팅 이미지는 1개만 업로드할 수 있습니다.', 'error');
            return;
        }
        this.postFiles = Array.from(files);
        
        this.postFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                file.base64Data = e.target.result;
                this.updatePostFileList();
            };
            reader.readAsDataURL(file);
        });
    },
    
    // 정보 파일 처리 (기존과 동일)
    handleInfoFiles: function(files) {
        if (files.length > 4) {
            this.addLogEntry('정보 이미지는 최대 4개까지 업로드할 수 있습니다.', 'error');
            return;
        }
        this.infoFiles = Array.from(files);
        
        this.infoFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                file.base64Data = e.target.result;
                this.updateInfoFileList();
            };
            reader.readAsDataURL(file);
        });
    },
    
    // 포스팅 파일 목록 업데이트 (기존과 동일)
    updatePostFileList: function() {
        const fileList = document.getElementById('postFileList');
        if (!fileList) return;
        
        if (this.postFiles.length === 0) {
            fileList.style.display = 'none';
            return;
        }

        fileList.style.display = 'block';
        fileList.innerHTML = '';

        this.postFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name} (${Utils.formatFileSize(file.size)})</span>
                <button class="remove-file" onclick="ProductPosting.removePostFile(${index})">삭제</button>
            `;
            fileList.appendChild(fileItem);
        });
    },
    
    // 정보 파일 목록 업데이트 (기존과 동일)
    updateInfoFileList: function() {
        const fileList = document.getElementById('infoFileList');
        if (!fileList) return;
        
        if (this.infoFiles.length === 0) {
            fileList.style.display = 'none';
            return;
        }

        fileList.style.display = 'block';
        fileList.innerHTML = '';

        this.infoFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name} (${Utils.formatFileSize(file.size)})</span>
                <button class="remove-file" onclick="ProductPosting.removeInfoFile(${index})">삭제</button>
            `;
            fileList.appendChild(fileItem);
        });
    },
    
    // 파일 삭제 (기존과 동일)
    removePostFile: function(index) {
        this.postFiles.splice(index, 1);
        this.updatePostFileList();
    },
    
    removeInfoFile: function(index) {
        this.infoFiles.splice(index, 1);
        this.updateInfoFileList();
    },
    
    // 웹훅 URL 저장 (기존과 동일)
    saveWebhookUrl: function(urlFieldId) {
        const url = document.getElementById(urlFieldId).value.trim();
        const indicatorId = urlFieldId.replace('webhookUrl', 'savedIndicator');
        
        if (url) {
            Utils.safeStorage.set(urlFieldId, url);
            this.showSavedIndicator(indicatorId);
            this.addLogEntry(`${this.getWebhookLabel(urlFieldId)} URL이 저장되었습니다.`, 'success');
        } else {
            this.addLogEntry(`${this.getWebhookLabel(urlFieldId)} URL을 입력해주세요.`, 'error');
        }
    },
    
    // 저장 표시기 표시 (기존과 동일)
    showSavedIndicator: function(indicatorId) {
        const indicator = document.getElementById(indicatorId);
        if (indicator) {
            indicator.style.display = 'inline';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 3000);
        }
    },
    
    // 웹훅 레이블 가져오기 (기존과 동일)
    getWebhookLabel: function(urlFieldId) {
        return urlFieldId === 'webhookUrl1' ? '웹훅 1 (Airtable)' : '웹훅 2 (Buffer)';
    },
    
    // 탭 전환 (기존과 동일)
    switchTab: function(event, tabName) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(tabName).classList.add('active');
        
        if (tabName === 'history') {
            this.cleanupOldHistory();
            this.displayHistory();
        }
    },
    
    // 로그 출력 (기존과 동일)
    addLogEntry: function(message, type) {
        const resultDiv = document.getElementById('result');
        const timestamp = new Date().toLocaleTimeString('ko-KR');
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        logEntry.innerHTML = `
            <div class="log-timestamp">[${timestamp}]</div>
            <div>${message.replace(/\n/g, '<br>')}</div>
        `;
        
        resultDiv.appendChild(logEntry);
        resultDiv.scrollTop = resultDiv.scrollHeight;
    },
    
    // 로그 영역 초기화 (기존과 동일)
    clearLogArea: function() {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = '';
        }
    },
    
    // 전체 초기화 (기존과 동일)
    clearAll: function() {
        this.clearAllFields();
        this.clearLogArea();
        this.addLogEntry('전체 초기화가 완료되었습니다.', 'info');
    },
    
    // 필드 초기화 (기존과 동일)
    clearAllFields: function() {
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productInfo').value = '';
        document.getElementById('customerReview').value = '';
        document.getElementById('affiliateLink').value = '';
        document.getElementById('affiliateNotice').value = '';
        this.postFiles = [];
        this.infoFiles = [];
        this.updatePostFileList();
        this.updateInfoFileList();
    },
    
    // 메시지 내용 생성 (기존과 동일)
    buildMessageContent: function() {
        const productName = document.getElementById('productName').value.trim();
        const productPrice = document.getElementById('productPrice').value.trim();
        const productInfo = document.getElementById('productInfo').value.trim();
        const customerReview = document.getElementById('customerReview').value.trim();
        const affiliateLink = document.getElementById('affiliateLink').value.trim();
        const affiliateNotice = document.getElementById('affiliateNotice').value.trim();
        
        let content = '';
        content += `[제품명]${productName}\n`;
        content += `[제품가격]${productPrice}\n`;
        content += `[제품정보]${productInfo}\n`;
        content += `[고객리뷰]${customerReview}\n`;
        content += `[구매링크]${affiliateLink}\n`;
        content += `[대가성문구]${affiliateNotice}\n`;
        
        return content.trim();
    },
    
    // 필드 비활성화/활성화 (기존과 동일)
    toggleFormFields: function(disabled) {
        const fields = [
            'productName', 'productPrice', 'productInfo', 
            'customerReview', 'affiliateLink', 'affiliateNotice'
        ];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.disabled = disabled;
            }
        });

        const fileButtons = document.querySelectorAll('.file-upload-area button');
        fileButtons.forEach(button => {
            button.disabled = disabled;
        });

        const sendButton = document.getElementById('sendButton');
        if (sendButton) {
            sendButton.disabled = disabled;
            if (disabled) {
                sendButton.innerHTML = '<span class="button-loading"></span>전송 중...';
            } else {
                sendButton.innerHTML = '제품 정보 전송하기';
            }
        }
    },
    
    // 전송 프로세스 시작 (기존과 동일)
    startTransferProcess: function() {
        if (this.isTransferInProgress) {
            this.addLogEntry('이미 전송이 진행 중입니다. 잠시만 기다려주세요.', 'error');
            return;
        }

        const url1 = document.getElementById('webhookUrl1').value.trim();
        const url2 = document.getElementById('webhookUrl2').value.trim();
        
        if (!url1) {
            this.addLogEntry('웹훅 1 (Airtable) URL을 입력하고 저장해주세요.', 'error');
            return;
        }

        if (!url2) {
            this.addLogEntry('웹훅 2 (Buffer) URL을 입력하고 저장해주세요.', 'error');
            return;
        }

        this.isTransferInProgress = true;
        this.toggleFormFields(true);

        this.addLogEntry('전송 프로세스 시작...', 'info');
        this.sendWebhook('webhookUrl1');
    },
    
    // 웹훅 1 전송 (기존과 동일)
    sendWebhook: function(urlFieldId) {
        const url = document.getElementById(urlFieldId).value.trim();
        const content = this.buildMessageContent();
        
        if (!url) {
            this.addLogEntry(`${this.getWebhookLabel(urlFieldId)} URL을 입력하고 저장해주세요.`, 'error');
            this.isTransferInProgress = false;
            this.toggleFormFields(false);
            return;
        }

        const allFiles = [...this.infoFiles, ...this.postFiles];

        const discordMessage = {
            content: content,
            author: {
                id: "123456789",
                username: "testuser", 
                discriminator: "0001"
            },
            timestamp: new Date().toISOString(),
            attachments: allFiles.map((file, index) => ({
                id: `img${index.toString().padStart(3, '0')}`,
                filename: file.name,
                size: file.size,
                url: null,
                content_type: file.type || 'image/png',
                base64: file.base64Data ? file.base64Data.split(',')[1] : null,
                is_local_file: true
            }))
        };

        const startTime = Date.now();
        const webhookLabel = this.getWebhookLabel(urlFieldId);
        this.addLogEntry(`${webhookLabel} 전송 중...`, 'info');

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(discordMessage)
        })
        .then(response => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            return response.text().then(text => {
                let message = `${webhookLabel}\n상태: ${response.status} ${response.statusText}\n응답 시간: ${duration}ms`;
                let responseData = null;
                
                if (text) {
                    try {
                        responseData = JSON.parse(text);
                        if (responseData.message) {
                            message += `\n메시지: ${responseData.message}`;
                        }
                    } catch (e) {
                        message += `\n응답 내용: ${text}`;
                        
                        if (text.includes('success') || text.includes('"status":"success"')) {
                            const productIdMatch = text.match(/"Product_ID":\s*"?([^",}]+)"?/);
                            let extractedProductId = null;
                            
                            if (productIdMatch) {
                                extractedProductId = productIdMatch[1].trim();
                            }
                            
                            responseData = { 
                                status: 'success', 
                                message: '텍스트 파싱을 통한 성공 감지',
                                Product_ID: extractedProductId
                            };
                        }
                    }
                }
                
                if (responseData && responseData.status === 'success' && urlFieldId === 'webhookUrl1') {
                    this.addLogEntry(message, response.ok ? 'success' : 'error');
                    this.addLogEntry('🎉 Make.com 워크플로우 완료! 3초 후 웹훅 2 (Buffer) 전송...', 'success');
                    
                    setTimeout(() => {
                        this.addLogEntry('🚀 웹훅 2 (Buffer) 전송 시작...', 'info');
                        
                        const productId = responseData.Product_ID || null;
                        
                        if (productId) {
                            this.sendWebhookWithProductID('webhookUrl2', productId);
                        } else {
                            this.addLogEntry('❌ Product_ID를 찾을 수 없어서 웹훅 2 전송을 중단합니다.', 'error');
                            this.isTransferInProgress = false;
                            this.toggleFormFields(false);
                        }
                    }, 3000);
                    
                    this.saveToHistory({
                        url: url,
                        webhookType: webhookLabel,
                        method: 'POST',
                        data: JSON.stringify(discordMessage),
                        status: response.status,
                        success: response.ok,
                        timestamp: new Date().toISOString(),
                        duration: duration,
                        response: responseData
                    });
                    
                    return;
                }
                
                this.saveToHistory({
                    url: url,
                    webhookType: webhookLabel,
                    method: 'POST',
                    data: JSON.stringify(discordMessage),
                    status: response.status,
                    success: response.ok,
                    timestamp: new Date().toISOString(),
                    duration: duration,
                    response: responseData
                });
                
                this.addLogEntry(message, response.ok ? 'success' : 'error');
                
                if (!response.ok) {
                    this.isTransferInProgress = false;
                    this.toggleFormFields(false);
                }
            });
        })
        .catch(error => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            const errorMessage = `${webhookLabel}\n상태: 네트워크 오류\n메시지: ${error.message}\n응답 시간: ${duration}ms`;
            
            this.saveToHistory({
                url: url,
                webhookType: webhookLabel,
                method: 'POST',
                data: JSON.stringify(discordMessage),
                error: error.message,
                success: false,
                timestamp: new Date().toISOString(),
                duration: duration
            });
            
            this.addLogEntry(errorMessage, 'error');
            this.isTransferInProgress = false;
            this.toggleFormFields(false);
        });
    },
    
    // 웹훅 2 전송 (기존과 동일)
    sendWebhookWithProductID: function(urlFieldId, productId) {
        const url = document.getElementById(urlFieldId).value.trim();
        
        if (!url) {
            this.addLogEntry(`${this.getWebhookLabel(urlFieldId)} URL을 입력하고 저장해주세요.`, 'error');
            this.isTransferInProgress = false;
            this.toggleFormFields(false);
            return;
        }

        if (!productId) {
            this.addLogEntry('Product_ID가 없습니다. 웹훅 2 전송을 중단합니다.', 'error');
            this.isTransferInProgress = false;
            this.toggleFormFields(false);
            return;
        }

        const simpleMessage = {
            content: `[Product_ID]${productId}`,
            author: {
                id: "123456789",
                username: "testuser", 
                discriminator: "0001"
            },
            timestamp: new Date().toISOString(),
            attachments: []
        };

        const startTime = Date.now();
        const webhookLabel = this.getWebhookLabel(urlFieldId);
        
        this.addLogEntry(`${webhookLabel} 전송 중... (Product_ID: ${productId})`, 'info');

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(simpleMessage)
        })
        .then(response => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            return response.text().then(text => {
                let message = `${webhookLabel}\n상태: ${response.status} ${response.statusText}\n응답 시간: ${duration}ms`;
                
                if (text) {
                    try {
                        const responseData = JSON.parse(text);
                        
                        if (responseData.message) {
                            this.addLogEntry(`🎉 ${responseData.message}`, responseData.status === 'success' ? 'success' : 'error');
                        }
                        
                        this.isTransferInProgress = false;
                        this.toggleFormFields(false);
                        
                    } catch (e) {
                        message += `\n응답 내용: ${text}`;
                        this.isTransferInProgress = false;
                        this.toggleFormFields(false);
                    }
                } else {
                    this.isTransferInProgress = false;
                    this.toggleFormFields(false);
                }
                
                this.saveToHistory({
                    url: url,
                    webhookType: webhookLabel + ' (Product_ID 전송)',
                    method: 'POST',
                    data: JSON.stringify(simpleMessage),
                    status: response.status,
                    success: response.ok,
                    timestamp: new Date().toISOString(),
                    duration: duration,
                    response: text,
                    productName: productId
                });
                
                this.addLogEntry(message, response.ok ? 'success' : 'error');
            });
        })
        .catch(error => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            const errorMessage = `${webhookLabel}\n상태: 네트워크 오류\n메시지: ${error.message}\n응답 시간: ${duration}ms`;
            
            this.saveToHistory({
                url: url,
                webhookType: webhookLabel + ' (Product_ID 전송)',
                method: 'POST',
                data: JSON.stringify(simpleMessage),
                error: error.message,
                success: false,
                timestamp: new Date().toISOString(),
                duration: duration,
                productName: productId
            });
            
            this.addLogEntry(errorMessage, 'error');
            this.isTransferInProgress = false;
            this.toggleFormFields(false);
        });
    },
    
    // 히스토리에 저장 (기존과 동일)
    saveToHistory: function(record) {
        if (!record.productName) {
            try {
                const messageData = JSON.parse(record.data);
                const content = messageData.content || '';
                const productNameMatch = content.match(/\[제품명\]([^\n\[]+)/);
                record.productName = productNameMatch ? productNameMatch[1].trim() : '';
            } catch (e) {
                record.productName = '';
            }
        }
        
        this.sendHistory.unshift(record);
        this.cleanupOldHistory();
        
        if (this.sendHistory.length > 50) {
            this.sendHistory = this.sendHistory.slice(0, 50);
        }
        
        Utils.safeStorage.set('webhookHistory', JSON.stringify(this.sendHistory));
    },
    
    // 1일 지난 기록 자동 삭제 (기존과 동일)
    cleanupOldHistory: function() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        const validHistory = this.sendHistory.filter(record => {
            try {
                const recordTime = new Date(record.timestamp).getTime();
                return recordTime > oneDayAgo;
            } catch (err) {
                return true;
            }
        });
        
        if (validHistory.length !== this.sendHistory.length) {
            this.sendHistory = validHistory;
            Utils.safeStorage.set('webhookHistory', JSON.stringify(this.sendHistory));
        }
    },
    
    // 히스토리 표시 (기존과 동일)
    displayHistory: function() {
        const historyDiv = document.getElementById('historyList');
        if (!historyDiv) return;
        
        if (this.sendHistory.length === 0) {
            historyDiv.innerHTML = '<p>전송 기록이 없습니다.</p>';
            return;
        }

        let html = '';
        this.sendHistory.forEach((record, index) => {
            try {
                const timestamp = new Date(record.timestamp).toLocaleString('ko-KR');
                const timeAgo = Utils.getTimeAgo(record.timestamp);
                const status = record.error ? `오류: ${record.error}` : `응답: ${record.status}`;
                const productName = record.productName || '상품명 없음';
                const webhookType = record.webhookType || '웹훅';
                
                html += `
                    <div class="file-item" style="padding: 10px; margin-bottom: 5px; background: ${record.success ? '#d4edda' : '#f8d7da'}; border-radius: 5px;">
                        <div>
                            <strong>${webhookType}</strong> - ${timestamp} (${timeAgo})
                            <br><strong>상품:</strong> ${productName}
                            <br>URL: ${record.url ? record.url.substring(0, 60) + '...' : 'N/A'}
                            <br>${status} (${record.duration}ms)
                        </div>
                    </div>
                `;
            } catch (err) {
                console.log('기록 항목 처리 오류:', err);
            }
        });
        historyDiv.innerHTML = html;
    },
    
    // 히스토리 삭제 (기존과 동일)
    clearHistory: function() {
        this.sendHistory = [];
        Utils.safeStorage.remove('webhookHistory');
        this.displayHistory();
        this.addLogEntry('전송 기록이 삭제되었습니다.', 'info');
    }
};
