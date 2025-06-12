// 감동 선물 사연 모듈 (기존 content-generator에서 분리)
window.ProductGiftStory = {
    // 상태 관리
    currentImageTab: 'photo',
    webhookUrls: {
        contentGeneration: '',
        imageRegeneration: '',
        contentSubmission: ''
    },
    isGenerating: false,
    
    // HTML 반환 (기존 content-generator의 감동 선물 사연 부분)
    getHTML: function() {
        return `
            <div class="gift-story-container">
                <!-- 액션 버튼 영역 -->
                <div class="action-buttons" style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <button id="generateBtn" onclick="ProductGiftStory.generateContent()">🎬 컨텐츠 생성</button>
                    <button onclick="ProductGiftStory.clearContent()">🔄 초기화</button>
                    <button id="submitBtn" onclick="ProductGiftStory.submitContent()">📤 컨텐츠 전송</button>
                    <button onclick="ProductGiftStory.openWebhookModal()">⚙️ 설정</button>
                </div>

                <!-- 시나리오 에디터 (30% 영역) -->
                <div class="scenario-editor" style="margin-bottom: 20px;">
                    <label for="generatedScenario">📝 생성된 시나리오</label>
                    <textarea id="generatedScenario" rows="6" placeholder="생성된 스토리가 여기에 표시됩니다..."></textarea>
                </div>

                <!-- 이미지 영역 (70% 영역) -->
                <div class="image-section">
                    <!-- 이미지 탭 -->
                    <div class="image-tabs" style="display: flex; margin-bottom: 15px;">
                        <button class="image-tab active" data-tab="photo" onclick="ProductGiftStory.switchImageTab('photo')">📷 사진</button>
                        <button class="image-tab" data-tab="prompt" onclick="ProductGiftStory.switchImageTab('prompt')">📝 프롬프트</button>
                    </div>

                    <!-- 사진 탭 컨텐츠 -->
                    <div id="photo-tab" class="image-tab-content active">
                        <div class="image-display" style="text-align: center; padding: 40px; border: 2px dashed #ddd; border-radius: 8px; background: #f9f9f9;">
                            <img id="generatedImage" src="" alt="생성된 이미지" style="max-width: 240px; max-height: 300px; aspect-ratio: 4/5; object-fit: cover; border-radius: 8px; display: none;">
                            <p id="imagePlaceholder" class="image-placeholder" style="color: #666; font-size: 16px;">이미지가 생성되면 여기에 표시됩니다</p>
                        </div>
                    </div>

                    <!-- 프롬프트 탭 컨텐츠 -->
                    <div id="prompt-tab" class="image-tab-content" style="display: none;">
                        <div class="prompt-editor">
                            <textarea id="imagePrompt" rows="8" placeholder="이미지 프롬프트가 여기에 표시됩니다..."></textarea>
                        </div>
                        <div class="prompt-actions" style="margin-top: 15px; text-align: center;">
                            <button id="regenerateBtn" onclick="ProductGiftStory.regenerateImage()">🖼️ 이미지 재생성</button>
                        </div>
                    </div>
                </div>

                <!-- 상태 메시지 -->
                <div id="giftStoryStatus" style="margin-top: 20px; padding: 15px; border-radius: 8px; display: none;"></div>
            </div>

            <!-- 웹훅 설정 모달 -->
            <div id="giftStoryWebhookModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <span class="close" onclick="ProductGiftStory.closeWebhookModal()">&times;</span>
                    <h2>⚙️ 웹훅 설정</h2>
                    
                    <div class="form-group">
                        <label>웹훅 1 - 컨텐츠 생성:</label>
                        <div class="url-input-group">
                            <input type="text" id="giftWebhook1Url" placeholder="컨텐츠 생성 웹훅 URL">
                            <button onclick="ProductGiftStory.saveWebhook(1)">저장</button>
                        </div>
                        <span id="giftWebhook1Saved" class="saved-indicator" style="display: none;">✅ 저장됨</span>
                    </div>
                    
                    <div class="form-group">
                        <label>웹훅 2 - 이미지 재생성:</label>
                        <div class="url-input-group">
                            <input type="text" id="giftWebhook2Url" placeholder="이미지 재생성 웹훅 URL">
                            <button onclick="ProductGiftStory.saveWebhook(2)">저장</button>
                        </div>
                        <span id="giftWebhook2Saved" class="saved-indicator" style="display: none;">✅ 저장됨</span>
                    </div>
                    
                    <div class="form-group">
                        <label>웹훅 3 - 컨텐츠 전송:</label>
                        <div class="url-input-group">
                            <input type="text" id="giftWebhook3Url" placeholder="컨텐츠 전송 웹훅 URL">
                            <button onclick="ProductGiftStory.saveWebhook(3)">저장</button>
                        </div>
                        <span id="giftWebhook3Saved" class="saved-indicator" style="display: none;">✅ 저장됨</span>
                    </div>
                    
                    <div class="modal-actions">
                        <button onclick="ProductGiftStory.closeWebhookModal()" class="btn-secondary">닫기</button>
                    </div>
                </div>
            </div>
        `;
    },

    // 초기화
    initialize: function() {
        this.loadSavedWebhooks();
        this.setupEventListeners();
    },

    // 저장된 웹훅 URL 로드
    loadSavedWebhooks: function() {
        this.webhookUrls.contentGeneration = Utils.safeStorage.get('giftContentGenerationWebhook', '');
        this.webhookUrls.imageRegeneration = Utils.safeStorage.get('giftImageRegenerationWebhook', '');
        this.webhookUrls.contentSubmission = Utils.safeStorage.get('giftContentSubmissionWebhook', '');

        // UI에 반영
        setTimeout(() => {
            const webhook1 = document.getElementById('giftWebhook1Url');
            const webhook2 = document.getElementById('giftWebhook2Url');
            const webhook3 = document.getElementById('giftWebhook3Url');

            if (webhook1 && this.webhookUrls.contentGeneration) {
                webhook1.value = this.webhookUrls.contentGeneration;
                this.showSavedIndicator('giftWebhook1Saved');
            }
            if (webhook2 && this.webhookUrls.imageRegeneration) {
                webhook2.value = this.webhookUrls.imageRegeneration;
                this.showSavedIndicator('giftWebhook2Saved');
            }
            if (webhook3 && this.webhookUrls.contentSubmission) {
                webhook3.value = this.webhookUrls.contentSubmission;
                this.showSavedIndicator('giftWebhook3Saved');
            }
        }, 100);
    },

    // 이벤트 리스너 설정
    setupEventListeners: function() {
        // 필요시 추가 이벤트 리스너를 여기에 설정
        console.log('ProductGiftStory 이벤트 리스너 설정 완료');
    },

    // 이미지 탭 전환
    switchImageTab: function(tabName) {
        this.currentImageTab = tabName;

        // 탭 버튼 활성화 상태 변경
        document.querySelectorAll('.image-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 컨텐츠 표시/숨김
        document.querySelectorAll('.image-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}-tab`).style.display = 'block';
    },

    // 웹훅 모달 열기
    openWebhookModal: function() {
        const modal = document.getElementById('giftStoryWebhookModal');
        modal.style.display = 'flex';  // 'block' 대신 'flex' 사용
        this.loadSavedWebhooks();
    },

    // 웹훅 모달 닫기
    closeWebhookModal: function() {
        document.getElementById('giftStoryWebhookModal').style.display = 'none';
    },

    // 웹훅 URL 저장
    saveWebhook: function(webhookNumber) {
        const urlInput = document.getElementById(`giftWebhook${webhookNumber}Url`);
        const indicator = document.getElementById(`giftWebhook${webhookNumber}Saved`);
        const url = urlInput.value.trim();

        if (!url) {
            Utils.showAchievement('웹훅 URL을 입력해주세요.', 'error');
            return;
        }

        // 저장
        const webhookKeys = ['', 'giftContentGenerationWebhook', 'giftImageRegenerationWebhook', 'giftContentSubmissionWebhook'];
        const storageKey = webhookKeys[webhookNumber];
        
        if (storageKey) {
            Utils.safeStorage.set(storageKey, url);
            
            // 메모리에도 저장
            const webhookProps = ['', 'contentGeneration', 'imageRegeneration', 'contentSubmission'];
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

        const webhookUrl = this.webhookUrls.contentGeneration;
        if (!webhookUrl) {
            Utils.showAchievement('웹훅 1 (컨텐츠 생성) URL을 설정해주세요.', 'error');
            this.openWebhookModal();
            return;
        }

        this.isGenerating = true;
        this.showLoading(true);
        this.showStatus('컨텐츠를 생성하고 있습니다...', 'info');

        // Discord 메시지 형식으로 요청 데이터 구성
        const requestData = {
            content: "감동적인 선물 사연 컨텐츠 생성 요청",
            author: {
                id: "123456789",
                username: "content_generator",
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
                console.log('컨텐츠 생성 응답:', text);

                if (response.ok) {
                    try {
                        const result = JSON.parse(text);
                        this.handleGenerationSuccess(result, duration);
                    } catch (parseError) {
                        // JSON 파싱 실패 시 텍스트 기반 처리
                        this.handleGenerationSuccess({
                            scenario: text.substring(0, 500),
                            image_url: '',
                            image_prompt: '이미지 프롬프트 생성 실패'
                        }, duration);
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            });
        })
        .catch(error => {
            const duration = Date.now() - startTime;
            console.error('컨텐츠 생성 오류:', error);
            this.handleGenerationError(error, duration);
        })
        .finally(() => {
            this.isGenerating = false;
            this.showLoading(false);
        });
    },

    // 생성 성공 처리
    handleGenerationSuccess: function(result, duration) {
        // 시나리오 업데이트
        const scenarioTextarea = document.getElementById('generatedScenario');
        if (scenarioTextarea && result.scenario) {
            scenarioTextarea.value = result.scenario;
        }

        // 이미지 업데이트
        const imageElement = document.getElementById('generatedImage');
        const placeholder = document.getElementById('imagePlaceholder');
        
        if (result.image_url && imageElement) {
            imageElement.src = result.image_url;
            imageElement.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        }

        // 프롬프트 업데이트
        const promptTextarea = document.getElementById('imagePrompt');
        if (promptTextarea && result.image_prompt) {
            promptTextarea.value = result.image_prompt;
        }

        this.showStatus(`컨텐츠 생성 완료! (${duration}ms) 🎉`, 'success');
        Utils.showAchievement('감동적인 선물 사연이 생성되었습니다! 📖');
    },

    // 생성 오류 처리
    handleGenerationError: function(error, duration) {
        this.showStatus(`컨텐츠 생성 실패: ${error.message} (${duration}ms)`, 'error');
        Utils.showAchievement('컨텐츠 생성에 실패했습니다. 다시 시도해주세요.', 'error');
    },

    // 이미지 재생성
    regenerateImage: function() {
        if (this.isGenerating) {
            Utils.showAchievement('이미지 재생성이 진행 중입니다.', 'error');
            return;
        }

        const webhookUrl = this.webhookUrls.imageRegeneration;
        const promptTextarea = document.getElementById('imagePrompt');
        
        if (!webhookUrl) {
            Utils.showAchievement('웹훅 2 (이미지 재생성) URL을 설정해주세요.', 'error');
            this.openWebhookModal();
            return;
        }

        if (!promptTextarea || !promptTextarea.value.trim()) {
            Utils.showAchievement('이미지 프롬프트를 입력해주세요.', 'error');
            return;
        }

        this.isGenerating = true;
        this.showLoading(true);
        this.showStatus('이미지를 재생성하고 있습니다...', 'info');

        const requestData = {
            content: promptTextarea.value.trim(),
            author: {
                id: "123456789",
                username: "image_regenerator",
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
                console.log('이미지 재생성 응답:', text);

                if (response.ok) {
                    try {
                        const result = JSON.parse(text);
                        this.handleImageRegenerationSuccess(result, duration);
                    } catch (parseError) {
                        throw new Error('응답 파싱 실패');
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            });
        })
        .catch(error => {
            const duration = Date.now() - startTime;
            console.error('이미지 재생성 오류:', error);
            this.showStatus(`이미지 재생성 실패: ${error.message} (${duration}ms)`, 'error');
            Utils.showAchievement('이미지 재생성에 실패했습니다. 다시 시도해주세요.', 'error');
        })
        .finally(() => {
            this.isGenerating = false;
            this.showLoading(false);
        });
    },

    // 이미지 재생성 성공 처리
    handleImageRegenerationSuccess: function(result, duration) {
        const imageElement = document.getElementById('generatedImage');
        const placeholder = document.getElementById('imagePlaceholder');
        
        if (result.image_url && imageElement) {
            imageElement.src = result.image_url;
            imageElement.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        }

        // 사진 탭으로 자동 전환
        this.switchImageTab('photo');

        this.showStatus(`이미지 재생성 완료! (${duration}ms) 🖼️`, 'success');
        Utils.showAchievement('새로운 이미지가 생성되었습니다! 🎨');
    },

    // 컨텐츠 전송
    submitContent: function() {
        const webhookUrl = this.webhookUrls.contentSubmission;
        const scenarioTextarea = document.getElementById('generatedScenario');
        const imageElement = document.getElementById('generatedImage');
        
        if (!webhookUrl) {
            Utils.showAchievement('웹훅 3 (컨텐츠 전송) URL을 설정해주세요.', 'error');
            this.openWebhookModal();
            return;
        }

        if (!scenarioTextarea || !scenarioTextarea.value.trim()) {
            Utils.showAchievement('전송할 시나리오가 없습니다.', 'error');
            return;
        }

        this.showLoading(true);
        this.showStatus('컨텐츠를 전송하고 있습니다...', 'info');

        const requestData = {
            content: scenarioTextarea.value.trim(),
            image_url: imageElement && imageElement.src ? imageElement.src : '',
            author: {
                id: "123456789",
                username: "content_submitter",
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
                console.log('컨텐츠 전송 응답:', text);

                if (response.ok) {
                    this.showStatus(`컨텐츠 전송 완료! (${duration}ms) 📤`, 'success');
                    Utils.showAchievement('SNS 포스팅이 예약되었습니다! 🚀');
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            });
        })
        .catch(error => {
            const duration = Date.now() - startTime;
            console.error('컨텐츠 전송 오류:', error);
            this.showStatus(`컨텐츠 전송 실패: ${error.message} (${duration}ms)`, 'error');
            Utils.showAchievement('컨텐츠 전송에 실패했습니다. 다시 시도해주세요.', 'error');
        })
        .finally(() => {
            this.showLoading(false);
        });
    },

    // 컨텐츠 초기화
    clearContent: function() {
        if (confirm('현재 작업 중인 컨텐츠를 모두 초기화하시겠습니까?')) {
            // 시나리오 초기화
            const scenarioTextarea = document.getElementById('generatedScenario');
            if (scenarioTextarea) scenarioTextarea.value = '';

            // 이미지 초기화
            const imageElement = document.getElementById('generatedImage');
            const placeholder = document.getElementById('imagePlaceholder');
            if (imageElement) {
                imageElement.src = '';
                imageElement.style.display = 'none';
            }
            if (placeholder) placeholder.style.display = 'block';

            // 프롬프트 초기화
            const promptTextarea = document.getElementById('imagePrompt');
            if (promptTextarea) promptTextarea.value = '';

            // 상태 메시지 초기화
            this.hideStatus();

            // 사진 탭으로 돌아가기
            this.switchImageTab('photo');

            Utils.showAchievement('컨텐츠가 초기화되었습니다.', 'info');
        }
    },

    // 로딩 상태 표시
    showLoading: function(show) {
        const generateBtn = document.getElementById('generateBtn');
        const submitBtn = document.getElementById('submitBtn');
        const regenerateBtn = document.getElementById('regenerateBtn');

        if (show) {
            if (generateBtn) {
                generateBtn.disabled = true;
                generateBtn.innerHTML = '<span class="button-loading"></span>생성 중...';
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="button-loading"></span>전송 중...';
            }
            if (regenerateBtn) {
                regenerateBtn.disabled = true;
                regenerateBtn.innerHTML = '<span class="button-loading"></span>재생성 중...';
            }
        } else {
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '🎬 컨텐츠 생성';
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '📤 컨텐츠 전송';
            }
            if (regenerateBtn) {
                regenerateBtn.disabled = false;
                regenerateBtn.innerHTML = '🖼️ 이미지 재생성';
            }
        }
    },

    // 상태 메시지 표시
    showStatus: function(message, type) {
        const statusDiv = document.getElementById('giftStoryStatus');
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
        const statusDiv = document.getElementById('giftStoryStatus');
        if (statusDiv) {
            statusDiv.style.display = 'none';
        }
    }
};
