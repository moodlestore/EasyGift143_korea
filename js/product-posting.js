// 포스팅 기능 모듈 (엑셀 전송 기능 추가)
window.ProductPosting = {
    // 상태 변수
    postFiles: [],
    infoFiles: [],
    isTransferInProgress: false,
    
    // 엑셀 전송 관련 상태
    excelData: [],
    excelImages: [],
    isExcelTransferInProgress: false,
    currentExcelIndex: 0,
    
    // HTML 반환 (엑셀 전송 버튼 추가)
    getHTML: function() {
        return `
            <!-- 데이터 입력 -->
            <div class="section">
                <h2>📝 데이터 입력</h2>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div style="display: flex; gap: 10px;">
                        <button class="clear-all" onclick="ProductPosting.clearAll()" style="margin-bottom: 0;">🗑️ 전체 초기화</button>
                        <button onclick="ProductPosting.openExcelModal()" style="background: #17a2b8; margin-bottom: 0;">📊 엑셀 전송</button>
                    </div>
                    <button onclick="ProductPosting.openWebhookModal()" style="background: #6c757d; margin-bottom: 0;">⚙️ 설정</button>
                </div>
                
                <div class="form-group">
                    <label for="productName">제품명</label>
                    <input type="text" id="productName" placeholder="예: 애플 에어팟 프로 3세대">
                </div>

                <div class="price-input-group">
                    <div class="form-group">
                        <label for="productPrice">제품가격</label>
                        <input type="text" id="productPrice" placeholder="예: 359,000원">
                    </div>
                    <div class="form-group">
                        <label for="discountPrice">할인가격</label>
                        <input type="text" id="discountPrice" placeholder="예: 299,000원">
                    </div>
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

            <!-- 웹훅 설정 모달 -->
            <div id="postingWebhookModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="close" onclick="ProductPosting.closeWebhookModal()">&times;</span>
                    <h2>⚙️ 웹훅 URL 설정</h2>
                    
                    <div class="form-group">
                        <label for="webhookUrl1">웹훅 1 - Airtable 데이터 전송:</label>
                        <div class="url-input-group">
                            <input type="text" id="webhookUrl1" placeholder="Airtable 데이터 전송 웹훅 URL">
                            <button onclick="ProductPosting.saveWebhookUrl('webhookUrl1')">저장</button>
                        </div>
                        <span id="savedIndicator1" class="saved-indicator" style="display: none;">✅ 저장됨</span>
                    </div>
                    
                    <div class="form-group">
                        <label for="webhookUrl2">웹훅 2 - Airtable → Buffer 전송:</label>
                        <div class="url-input-group">
                            <input type="text" id="webhookUrl2" placeholder="Buffer 포스팅 웹훅 URL">
                            <button onclick="ProductPosting.saveWebhookUrl('webhookUrl2')">저장</button>
                        </div>
                        <span id="savedIndicator2" class="saved-indicator" style="display: none;">✅ 저장됨</span>
                    </div>
                    
                    <div class="modal-actions">
                        <button onclick="ProductPosting.closeWebhookModal()" class="btn-secondary">닫기</button>
                    </div>
                </div>
            </div>

            <!-- 엑셀 전송 모달 -->
            <div id="excelUploadModal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 700px;">
                    <span class="close" onclick="ProductPosting.closeExcelModal()">&times;</span>
                    <h2>📊 엑셀 파일 일괄 등록</h2>
                    
                    <div class="form-group">
                        <label>1️⃣ 엑셀 파일 업로드</label>
                        <div class="file-upload-area">
                            <input type="file" id="excelFileInput" accept=".xlsx,.xls" style="display: none;">
                            <button onclick="document.getElementById('excelFileInput').click()">📁 엑셀 파일 선택</button>
                            <p>쿠팡 확장프로그램에서 다운로드한 엑셀 파일을 선택하세요</p>
                        </div>
                        <div id="excelFileInfo" style="display: none; padding: 10px; background: #f8f9fa; border-radius: 8px; margin-top: 10px;">
                            <div id="excelFileName"></div>
                            <div id="excelFileDetails"></div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>2️⃣ 제품 이미지들 업로드</label>
                        <div class="file-upload-area">
                            <input type="file" id="excelImagesInput" multiple accept="image/*" style="display: none;">
                            <button onclick="document.getElementById('excelImagesInput').click()">🖼️ 이미지 파일들 선택</button>
                            <p>post_1.jpg, post_2.jpg 순서로 정렬된 이미지들을 선택하세요</p>
                        </div>
                        <div id="excelImagesInfo" style="display: none; padding: 10px; background: #f8f9fa; border-radius: 8px; margin-top: 10px;">
                            <div id="excelImagesCount"></div>
                            <div id="excelImagesList"></div>
                        </div>
                    </div>

                    <div id="excelPreview" style="display: none;">
                        <h3>📋 매칭 미리보기:</h3>
                        <div id="excelMatchingPreview" style="max-height: 200px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; background: #f8f9fa;">
                        </div>
                    </div>

                    <div id="excelWarning" style="display: none; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; margin: 15px 0;">
                        <strong>⚠️ 주의사항:</strong>
                        <ul style="margin: 10px 0 0 20px;">
                            <li>엑셀 행 수와 이미지 파일 수가 일치해야 합니다</li>
                            <li>이미지 파일명은 post_1, post_2... 순서로 정렬됩니다</li>
                            <li>전송 중에는 브라우저를 닫지 마세요</li>
                        </ul>
                    </div>
                    
                    <div class="modal-actions">
                        <button onclick="ProductPosting.closeExcelModal()" class="btn-secondary">취소</button>
                        <button id="excelSendButton" onclick="ProductPosting.startExcelTransfer()" class="btn-success" disabled>🚀 일괄 전송 시작</button>
                    </div>
                </div>
            </div>

            <!-- 엑셀 전송 진행 모달 -->
            <div id="excelProgressModal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 600px;">
                    <span class="close" onclick="ProductPosting.closeExcelProgressModal()">&times;</span>
                    <h2>📊 일괄 전송 진행 중...</h2>
                    
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span>전체 진행률:</span>
                            <span id="excelProgressText">0/0 완료 (0%)</span>
                        </div>
                        <div style="width: 100%; background: #e9ecef; border-radius: 10px; height: 20px;">
                            <div id="excelProgressBar" style="width: 0%; background: linear-gradient(45deg, #28a745, #20c997); height: 100%; border-radius: 10px; transition: width 0.3s ease;"></div>
                        </div>
                    </div>

                    <h3>📋 전송 로그:</h3>
                    <div id="excelTransferLog" style="max-height: 300px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; background: #f8f9fa;">
                    </div>
                    
                    <div class="modal-actions" style="margin-top: 20px;">
                        <button id="excelStopButton" onclick="ProductPosting.stopExcelTransfer()" class="btn-danger">중단</button>
                        <button onclick="ProductPosting.closeExcelProgressModal()" class="btn-secondary" disabled id="excelCloseButton">닫기</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // 초기화
    initialize: function() {
        this.loadSavedUrls();
        this.setupFileHandlers();
        this.setupExcelHandlers();
    },

    // 엑셀 파일 핸들러 설정
    setupExcelHandlers: function() {
        const excelFileInput = document.getElementById('excelFileInput');
        const excelImagesInput = document.getElementById('excelImagesInput');

        if (excelFileInput) {
            excelFileInput.addEventListener('change', (e) => {
                this.handleExcelFile(e.target.files[0]);
            });
        }

        if (excelImagesInput) {
            excelImagesInput.addEventListener('change', (e) => {
                this.handleExcelImages(e.target.files);
            });
        }
    },

    // 엑셀 모달 열기
    openExcelModal: function() {
        const modal = document.getElementById('excelUploadModal');
        modal.style.display = 'flex';
        this.resetExcelModal();
    },

    // 엑셀 모달 닫기
    closeExcelModal: function() {
        document.getElementById('excelUploadModal').style.display = 'none';
        this.resetExcelModal();
    },

    // 엑셀 진행 모달 닫기
    closeExcelProgressModal: function() {
        if (!this.isExcelTransferInProgress) {
            document.getElementById('excelProgressModal').style.display = 'none';
        }
    },

    // 엑셀 모달 리셋
    resetExcelModal: function() {
        this.excelData = [];
        this.excelImages = [];
        document.getElementById('excelFileInput').value = '';
        document.getElementById('excelImagesInput').value = '';
        document.getElementById('excelFileInfo').style.display = 'none';
        document.getElementById('excelImagesInfo').style.display = 'none';
        document.getElementById('excelPreview').style.display = 'none';
        document.getElementById('excelWarning').style.display = 'none';
        document.getElementById('excelSendButton').disabled = true;
    },

    // 엑셀 파일 처리
    handleExcelFile: function(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // SheetJS를 사용하여 엑셀 파일 파싱
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                this.excelData = jsonData;
                
                // 파일 정보 표시
                document.getElementById('excelFileName').textContent = `📁 ${file.name}`;
                document.getElementById('excelFileDetails').textContent = `파일크기: ${Utils.formatFileSize(file.size)}, 행 수: ${jsonData.length}개`;
                document.getElementById('excelFileInfo').style.display = 'block';

                this.updateExcelPreview();
                
            } catch (error) {
                console.error('엑셀 파일 처리 오류:', error);
                alert('엑셀 파일을 읽는 중 오류가 발생했습니다: ' + error.message);
            }
        };
        reader.readAsArrayBuffer(file);
    },

    // 엑셀 이미지 처리
    handleExcelImages: function(files) {
        if (!files || files.length === 0) return;

        this.excelImages = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));
        
        // 각 이미지를 Base64로 변환
        let loadedCount = 0;
        this.excelImages.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                file.base64Data = e.target.result;
                loadedCount++;
                
                if (loadedCount === this.excelImages.length) {
                    this.updateExcelImagesInfo();
                    this.updateExcelPreview();
                }
            };
            reader.readAsDataURL(file);
        });

        // 즉시 파일 정보 표시
        document.getElementById('excelImagesCount').textContent = `🖼️ ${files.length}개 파일 선택됨 (총 ${Array.from(files).reduce((sum, f) => sum + f.size, 0) / 1024 / 1024 > 1 ? (Array.from(files).reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1) + 'MB' : (Array.from(files).reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(1) + 'KB'})`;
        document.getElementById('excelImagesList').textContent = Array.from(files).map(f => f.name).join(', ');
        document.getElementById('excelImagesInfo').style.display = 'block';
    },

    // 엑셀 이미지 정보 업데이트
    updateExcelImagesInfo: function() {
        const fileNames = this.excelImages.map(f => f.name).join(', ');
        const totalSize = this.excelImages.reduce((sum, f) => sum + f.size, 0);
        
        document.getElementById('excelImagesCount').textContent = `🖼️ ${this.excelImages.length}개 파일 (총 ${Utils.formatFileSize(totalSize)})`;
        document.getElementById('excelImagesList').textContent = fileNames;
    },

    // 엑셀 미리보기 업데이트
    updateExcelPreview: function() {
        if (this.excelData.length === 0) return;

        const previewDiv = document.getElementById('excelMatchingPreview');
        const warningDiv = document.getElementById('excelWarning');
        const sendButton = document.getElementById('excelSendButton');

        let previewHTML = '';
        const dataCount = this.excelData.length;
        const imageCount = this.excelImages.length;

        // 매칭 상태 표시
        for (let i = 0; i < Math.max(dataCount, imageCount); i++) {
            const hasData = i < dataCount;
            const hasImage = i < imageCount;
            const productName = hasData ? (this.excelData[i].productName || this.excelData[i]['제품명'] || `제품 ${i + 1}`) : '데이터 없음';
            const imageName = hasImage ? this.excelImages[i].name : '이미지 없음';
            
            const statusIcon = hasData && hasImage ? '✅' : '❌';
            const statusClass = hasData && hasImage ? 'color: #28a745' : 'color: #dc3545';
            
            previewHTML += `<div style="${statusClass}; margin-bottom: 8px;">${statusIcon} 행 ${i + 1}: "${productName}" → ${imageName}</div>`;
        }

        previewDiv.innerHTML = previewHTML;
        document.getElementById('excelPreview').style.display = 'block';

        // 경고 표시 및 전송 버튼 활성화
        if (dataCount !== imageCount || dataCount === 0) {
            warningDiv.style.display = 'block';
            sendButton.disabled = true;
        } else {
            warningDiv.style.display = 'none';
            sendButton.disabled = false;
        }
    },

    // 엑셀 일괄 전송 시작
    startExcelTransfer: function() {
        if (this.isExcelTransferInProgress) {
            alert('이미 전송이 진행 중입니다.');
            return;
        }

        const url1 = document.getElementById('webhookUrl1').value.trim();
        const url2 = document.getElementById('webhookUrl2').value.trim();
        
        if (!url1 || !url2) {
            alert('웹훅 URL을 먼저 설정해주세요.');
            return;
        }

        if (this.excelData.length === 0 || this.excelImages.length === 0) {
            alert('엑셀 파일과 이미지를 모두 선택해주세요.');
            return;
        }

        if (this.excelData.length !== this.excelImages.length) {
            alert('엑셀 행 수와 이미지 파일 수가 일치하지 않습니다.');
            return;
        }

        // 진행 모달 열기
        document.getElementById('excelUploadModal').style.display = 'none';
        document.getElementById('excelProgressModal').style.display = 'flex';

        // 전송 시작
        this.isExcelTransferInProgress = true;
        this.currentExcelIndex = 0;
        document.getElementById('excelStopButton').disabled = false;
        document.getElementById('excelCloseButton').disabled = true;

        this.updateExcelProgress();
        this.processNextExcelItem();
    },

    // 다음 엑셀 아이템 처리
    processNextExcelItem: function() {
        if (!this.isExcelTransferInProgress || this.currentExcelIndex >= this.excelData.length) {
            this.finishExcelTransfer();
            return;
        }

        const currentData = this.excelData[this.currentExcelIndex];
        const currentImage = this.excelImages[this.currentExcelIndex];
        const itemNumber = this.currentExcelIndex + 1;

        // 로그 추가
        this.addExcelLog(`[${new Date().toLocaleTimeString()}] 🔄 제품 ${itemNumber}: ${currentData.productName || currentData['제품명'] || '제품명 없음'} 전송 시작`, 'info');

        // 데이터 구성 (기존 포스팅 형식과 동일)
        const content = this.buildExcelMessageContent(currentData);
        
        const discordMessage = {
            content: content,
            author: {
                id: "123456789",
                username: "testuser", 
                discriminator: "0001"
            },
            timestamp: new Date().toISOString(),
            attachments: [{
                id: `img000`,
                filename: currentImage.name,
                size: currentImage.size,
                url: null,
                content_type: currentImage.type || 'image/jpeg',
                base64: currentImage.base64Data ? currentImage.base64Data.split(',')[1] : null,
                is_local_file: true
            }]
        };

        // 웹훅 1 전송
        this.sendExcelWebhook1(discordMessage, itemNumber);
    },

    // 엑셀 데이터를 메시지 형식으로 변환
    buildExcelMessageContent: function(data) {
        let content = '';
        content += `[제품명]${data.productName || data['제품명'] || ''}\n`;
        content += `[제품가격]${data.originalPrice || data['정가'] || data.productPrice || data['제품가격'] || ''}\n`;
        content += `[할인가격]${data.salePrice || data['할인가'] || data.discountPrice || data['할인가격'] || ''}\n`;
        content += `[제품정보]${data.productInfo || data['제품정보'] || data.productDescription || data['제품설명'] || ''}\n`;
        content += `[고객리뷰]${data.customerReviews || data['고객리뷰'] || data.reviews || data['리뷰'] || '리뷰 정보 없음'}\n`;
        content += `[구매링크]${data.buyLink || data['구매링크'] || data.affiliateLink || data['어필리에이트링크'] || ''}\n`;
        content += `[대가성문구]이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.\n`;
        
        return content.trim();
    },

    // 엑셀 웹훅 1 전송
    sendExcelWebhook1: function(message, itemNumber) {
        const url = document.getElementById('webhookUrl1').value.trim();
        const startTime = Date.now();

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        })
        .then(response => {
            const duration = Date.now() - startTime;
            return response.text().then(text => {
                let responseData = null;
                
                try {
                    responseData = JSON.parse(text);
                } catch (e) {
                    if (text.includes('success') || text.includes('"status":"success"')) {
                        const productIdMatch = text.match(/"Product_ID":\s*"?([^",}]+)"?/);
                        responseData = { 
                            status: 'success', 
                            Product_ID: productIdMatch ? productIdMatch[1].trim() : null
                        };
                    }
                }
                
                if (responseData && responseData.status === 'success') {
                    this.addExcelLog(`    웹훅 1 성공 (${duration}ms)`, 'success');
                    
                    // 3초 후 웹훅 2 전송
                    setTimeout(() => {
                        this.sendExcelWebhook2(responseData.Product_ID, itemNumber);
                    }, 3000);
                } else {
                    this.addExcelLog(`    웹훅 1 실패: ${response.status} ${response.statusText}`, 'error');
                    this.currentExcelIndex++;
                    this.updateExcelProgress();
                    setTimeout(() => this.processNextExcelItem(), 1000);
                }
            });
        })
        .catch(error => {
            const duration = Date.now() - startTime;
            this.addExcelLog(`    웹훅 1 오류: ${error.message} (${duration}ms)`, 'error');
            this.currentExcelIndex++;
            this.updateExcelProgress();
            setTimeout(() => this.processNextExcelItem(), 1000);
        });
    },

    // 엑셀 웹훅 2 전송
    sendExcelWebhook2: function(productId, itemNumber) {
        const url = document.getElementById('webhookUrl2').value.trim();
        const startTime = Date.now();

        const simpleMessage = {
            content: `[Product_ID]${productId || ''}`,
            author: {
                id: "123456789",
                username: "testuser", 
                discriminator: "0001"
            },
            timestamp: new Date().toISOString(),
            attachments: []
        };

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(simpleMessage)
        })
        .then(response => {
            const duration = Date.now() - startTime;
            return response.text().then(text => {
                if (response.ok) {
                    this.addExcelLog(`    웹훅 2 성공 (${duration}ms)`, 'success');
                    this.addExcelLog(`✅ 제품 ${itemNumber} 전송 완료\n`, 'success');
                } else {
                    this.addExcelLog(`    웹훅 2 실패: ${response.status} ${response.statusText}`, 'error');
                }
                
                this.currentExcelIndex++;
                this.updateExcelProgress();
                setTimeout(() => this.processNextExcelItem(), 1000);
            });
        })
        .catch(error => {
            const duration = Date.now() - startTime;
            this.addExcelLog(`    웹훅 2 오류: ${error.message} (${duration}ms)`, 'error');
            this.currentExcelIndex++;
            this.updateExcelProgress();
            setTimeout(() => this.processNextExcelItem(), 1000);
        });
    },

    // 엑셀 진행률 업데이트
    updateExcelProgress: function() {
        const total = this.excelData.length;
        const completed = this.currentExcelIndex;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        document.getElementById('excelProgressText').textContent = `${completed}/${total} 완료 (${percentage}%)`;
        document.getElementById('excelProgressBar').style.width = `${percentage}%`;
    },

    // 엑셀 전송 완료
    finishExcelTransfer: function() {
        this.isExcelTransferInProgress = false;
        this.addExcelLog(`\n🎉 전체 ${this.excelData.length}개 제품 전송 완료!`, 'success');
        
        document.getElementById('excelStopButton').disabled = true;
        document.getElementById('excelCloseButton').disabled = false;
        
        Utils.showAchievement(`엑셀 일괄 전송이 완료되었습니다! (${this.excelData.length}개 제품)`);
    },

    // 엑셀 전송 중단
    stopExcelTransfer: function() {
        if (confirm('전송을 중단하시겠습니까?')) {
            this.isExcelTransferInProgress = false;
            this.addExcelLog(`\n⏹️ 사용자가 전송을 중단했습니다. (${this.currentExcelIndex}/${this.excelData.length} 완료)`, 'info');
            
            document.getElementById('excelStopButton').disabled = true;
            document.getElementById('excelCloseButton').disabled = false;
        }
    },

    // 엑셀 로그 추가
    addExcelLog: function(message, type = 'info') {
        const logDiv = document.getElementById('excelTransferLog');
        const logEntry = document.createElement('div');
        
        const typeColors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        
        logEntry.style.color = typeColors[type] || '#333';
        logEntry.style.marginBottom = '5px';
        logEntry.style.fontSize = '14px';
        logEntry.textContent = message;
        
        logDiv.appendChild(logEntry);
        logDiv.scrollTop = logDiv.scrollHeight;
    },

    // 웹훅 모달 열기
    openWebhookModal: function() {
        const modal = document.getElementById('postingWebhookModal');
        modal.style.display = 'flex';
        this.loadSavedUrls();
    },

    // 웹훅 모달 닫기
    closeWebhookModal: function() {
        document.getElementById('postingWebhookModal').style.display = 'none';
    },
    
    // 저장된 URL 로드
    loadSavedUrls: function() {
        const savedUrl1 = Utils.safeStorage.get('webhookUrl1', '');
        const savedUrl2 = Utils.safeStorage.get('webhookUrl2', '');
        
        setTimeout(() => {
            const webhook1 = document.getElementById('webhookUrl1');
            const webhook2 = document.getElementById('webhookUrl2');
            
            if (webhook1 && savedUrl1) {
                webhook1.value = savedUrl1;
                this.showSavedIndicator('savedIndicator1');
            }
            if (webhook2 && savedUrl2) {
                webhook2.value = savedUrl2;
                this.showSavedIndicator('savedIndicator2');
            }
        }, 100);
    },
    
    // 파일 핸들러 설정
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
    
    // 포스팅 파일 처리
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
    
    // 정보 파일 처리
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
    
    // 포스팅 파일 목록 업데이트
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
    
    // 정보 파일 목록 업데이트
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
    
    // 파일 삭제
    removePostFile: function(index) {
        this.postFiles.splice(index, 1);
        this.updatePostFileList();
    },
    
    removeInfoFile: function(index) {
        this.infoFiles.splice(index, 1);
        this.updateInfoFileList();
    },
    
    // 웹훅 URL 저장
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
    
    // 저장 표시기 표시
    showSavedIndicator: function(indicatorId) {
        const indicator = document.getElementById(indicatorId);
        if (indicator) {
            indicator.style.display = 'inline';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 3000);
        }
    },
    
    // 웹훅 레이블 가져오기
    getWebhookLabel: function(urlFieldId) {
        return urlFieldId === 'webhookUrl1' ? '웹훅 1 (Airtable)' : '웹훅 2 (Buffer)';
    },
    
    // 로그 출력
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
    
    // 로그 영역 초기화
    clearLogArea: function() {
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = '';
        }
    },
    
    // 전체 초기화
    clearAll: function() {
        this.clearAllFields();
        this.clearLogArea();
        this.addLogEntry('전체 초기화가 완료되었습니다.', 'info');
    },
    
    // 필드 초기화
    clearAllFields: function() {
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('discountPrice').value = '';
        document.getElementById('productInfo').value = '';
        document.getElementById('customerReview').value = '';
        document.getElementById('affiliateLink').value = '';
        document.getElementById('affiliateNotice').value = '';
        this.postFiles = [];
        this.infoFiles = [];
        this.updatePostFileList();
        this.updateInfoFileList();
    },
    
    // 메시지 내용 생성
    buildMessageContent: function() {
        const productName = document.getElementById('productName').value.trim();
        const productPrice = document.getElementById('productPrice').value.trim();
        const discountPrice = document.getElementById('discountPrice').value.trim();
        const productInfo = document.getElementById('productInfo').value.trim();
        const customerReview = document.getElementById('customerReview').value.trim();
        const affiliateLink = document.getElementById('affiliateLink').value.trim();
        const affiliateNotice = document.getElementById('affiliateNotice').value.trim();
        
        let content = '';
        content += `[제품명]${productName}\n`;
        content += `[제품가격]${productPrice}\n`;
        content += `[할인가격]${discountPrice}\n`;
        content += `[제품정보]${productInfo}\n`;
        content += `[고객리뷰]${customerReview}\n`;
        content += `[구매링크]${affiliateLink}\n`;
        content += `[대가성문구]${affiliateNotice}\n`;
        
        return content.trim();
    },
    
    // 필드 비활성화/활성화
    toggleFormFields: function(disabled) {
        const fields = [
            'productName', 'productPrice', 'discountPrice', 'productInfo', 
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
    
    // 전송 프로세스 시작
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
    
    // 웹훅 1 전송
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
                    
                    return;
                }
                
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
            
            this.addLogEntry(errorMessage, 'error');
            this.isTransferInProgress = false;
            this.toggleFormFields(false);
        });
    },
    
    // 웹훅 2 전송
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
                
                this.addLogEntry(message, response.ok ? 'success' : 'error');
            });
        })
        .catch(error => {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            const errorMessage = `${webhookLabel}\n상태: 네트워크 오류\n메시지: ${error.message}\n응답 시간: ${duration}ms`;
            
            this.addLogEntry(errorMessage, 'error');
            this.isTransferInProgress = false;
            this.toggleFormFields(false);
        });
    }
};
