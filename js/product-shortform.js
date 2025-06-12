// 숏폼 콘텐츠 생성 모듈 (수정 버전)
window.ProductShortForm = {
    // 상태 관리
    webhookUrls: {
        scriptGeneration: '', // 웹훅 1: 대본 생성
        imageGeneration: ''   // 웹훅 2: 이미지 생성
    },
    isGenerating: false,
    cuts: {
        cut1: { script: '', image: '', prompt: '' },
        cut2: { script: '', image: '', prompt: '' },
        cut3: { script: '', image: '', prompt: '' },
        cut4: { script: '', image: '', isProductImage: true }, // 실제 제품 이미지
        cut5: { script: '', image: '', prompt: '' }
    },
    productImageFile: null,
    generatedFullScript: '', // 전체 대본 저장용

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

    // Cut별 HTML 생성
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
                    <!-- AI 생성 이미지 -->
                    <div style="margin-bottom: 15px;">
                        <label style="font-size: 14px; font-weight: 600;">생성된 이미지</label>
                        <div id="cut${cutNumber}ImagePreview" style="margin-top: 5px; text-align: center; min-height: 120px; border: 2px dashed #ddd; border-radius: 5px; display: flex; align-items: center; justify-content: center; background: #f9f9f9;">
                            <span style="color: #666;">이미지가 생성되면 여기에 표시됩니다</span>
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
                    <img src="${e.target.result}" alt="제품 이미지" style="max-width: 150px; max-height: 150px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${file.name}</p>
                `;
            }
        };
        reader.readAsDataURL(file);

        this.showStatus('제품 이미지가 업로드되었습니다.', 'success');
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

    // 대본 생성 성공 처리 (수정: Cut별 분산 제거)
    handleScriptGenerationSuccess: function(result, duration) {
        // 전체 대본만 표시하고 내부 변수에 저장
        const scriptTextarea = document.getElementById('generatedScript');
        if (scriptTextarea && result.script) {
            scriptTextarea.value = result.script;
            this.generatedFullScript = result.script; // 내부 저장
        }

        // ⭐ 수정: Cut별 대본 분산을 여기서 하지 않음

        // 이미지 생성 버튼 활성화
        const generateImagesBtn = document.getElementById('generateImagesBtn');
        if (generateImagesBtn) {
            generateImagesBtn.disabled = false;
        }

        this.showStatus(`대본 생성 완료! (${duration}ms) 📝`, 'success');
        Utils.showAchievement('5컷 대본이 생성되었습니다! 이제 이미지를 생성해보세요.');
    },

    // 텍스트에서 Cut별 대본 파싱
    parseScriptFromText: function(text) {
        const cuts = {};
        
        // Cut 1-5 패턴으로 분리 시도
        for (let i = 1; i <= 5; i++) {
            const pattern = new RegExp(`Cut ${i}[:\s]*([^C]*?)(?=Cut ${i+1}|$)`, 'i');
            const match = text.match(pattern);
            if (match) {
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

    // ⭐ 수정: 이미지 생성 시작 시 Cut별 대본 분산 실행
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

        // ⭐ 추가: 이미지 생성 시작 시 Cut별 대본 분산
        this.distributeCutScripts();

        // Cut 1, 2, 3, 5 대본 수집 (Cut 4는 제품 이미지이므로 제외)
        const cuts = [1, 2, 3, 5];
        const scriptsToGenerate = {};
        
        cuts.forEach(cutNum => {
            const scriptElement = document.getElementById(`cut${cutNum}Script`);
            if (scriptElement && scriptElement.value.trim()) {
                scriptsToGenerate[`cut${cutNum}`] = scriptElement.value.trim();
            }
        });

        if (Object.keys(scriptsToGenerate).length === 0) {
            Utils.showAchievement('대본을 먼저 생성해주세요.', 'error');
            return;
        }

        this.isGenerating = true;
        this.showLoading(true);
        this.showStatus('이미지를 생성하고 있습니다...', 'info');

        const requestData = {
            content: JSON.stringify(scriptsToGenerate),
            author: {
                id: "123456789",
                username: "image_generator",
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
                        this.handleImageGenerationSuccess(result, duration);
                    } catch (parseError) {
                        // JSON 파싱 실패 시 기본 처리
                        this.showStatus(`이미지 생성 응답 파싱 실패 (${duration}ms)`, 'error');
                        Utils.showAchievement('이미지 생성 응답을 처리할 수 없습니다.', 'error');
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            });
        })
        .catch(error => {
            const duration = Date.now() - startTime;
            console.error('이미지 생성 오류:', error);
            this.showStatus(`이미지 생성 실패: ${error.message} (${duration}ms)`, 'error');
            Utils.showAchievement('이미지 생성에 실패했습니다. 다시 시도해주세요.', 'error');
        })
        .finally(() => {
            this.isGenerating = false;
            this.showLoading(false);
        });
    },

    // ⭐ 추가: Cut별 대본 분산 함수
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

        // ⭐ 추가: 대본 분산 후 Cut 2, 4의 대본→이미지 버튼도 활성화
        [2, 4].forEach(cutNum => {
            const scriptToImageBtn = document.getElementById(`scriptToImageCut${cutNum}Btn`);
            if (scriptToImageBtn && cutNum !== 4) { // Cut 4는 제품 이미지라서 제외
                scriptToImageBtn.disabled = false;
            }
        });

        Utils.showAchievement('대본이 Cut별로 분산되었습니다! 📝');
    },

    // 이미지 생성 성공 처리
    handleImageGenerationSuccess: function(result, duration) {
        let generatedCount = 0;

        // Cut 1, 3, 5 이미지 업데이트
        [1, 3, 5].forEach(cutNum => {
            const cutKey = `cut${cutNum}`;
            if (result[cutKey]) {
                // 이미지 URL 업데이트
                if (result[cutKey].image_url) {
                    const imagePreview = document.getElementById(`cut${cutNum}ImagePreview`);
                    if (imagePreview) {
                        imagePreview.innerHTML = `
                            <img src="${result[cutKey].image_url}" alt="Cut ${cutNum} 이미지" 
                                 style="max-width: 150px; max-height: 150px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        `;
                    }
                    this.cuts[cutKey].image = result[cutKey].image_url;
                    generatedCount++;
                }

                // 프롬프트 업데이트
                if (result[cutKey].prompt) {
                    const promptElement = document.getElementById(`cut${cutNum}Prompt`);
                    if (promptElement) {
                        promptElement.value = result[cutKey].prompt;
                    }
                    this.cuts[cutKey].prompt = result[cutKey].prompt;
                }

                // 개별 버튼들 활성화
                const scriptToImageBtn = document.getElementById(`scriptToImageCut${cutNum}Btn`);
                const promptToImageBtn = document.getElementById(`promptToImageCut${cutNum}Btn`);
                if (scriptToImageBtn) {
                    scriptToImageBtn.disabled = false;
                }
                if (promptToImageBtn) {
                    promptToImageBtn.disabled = false;
                }
            }
        });

        this.showStatus(`이미지 생성 완료! ${generatedCount}개 이미지가 생성되었습니다. (${duration}ms) 🖼️`, 'success');
        Utils.showAchievement(`${generatedCount}개의 이미지가 생성되었습니다! 🎨`);
    },

    // ⭐ 새로운 함수: 대본에서 프롬프트+이미지 한번에 생성
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

        const requestData = {
            content: JSON.stringify({
                [`cut${cutNumber}`]: scriptElement.value.trim(),
                script_to_image: true // 대본에서 프롬프트+이미지 생성
            }),
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
                if (response.ok) {
                    try {
                        const result = JSON.parse(text);
                        this.handleScriptToImageSuccess(cutNumber, result, duration);
                    } catch (parseError) {
                        this.showStatus(`Cut ${cutNumber} 생성 응답 파싱 실패 (${duration}ms)`, 'error');
                        Utils.showAchievement('생성 응답을 처리할 수 없습니다.', 'error');
                    }
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

    // ⭐ 새로운 함수: 프롬프트에서 이미지만 재생성
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

        const requestData = {
            content: JSON.stringify({
                [`cut${cutNumber}`]: promptElement.value.trim(),
                prompt_to_image: true // 프롬프트에서 이미지만 생성
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
                if (response.ok) {
                    try {
                        const result = JSON.parse(text);
                        this.handlePromptToImageSuccess(cutNumber, result, duration);
                    } catch (parseError) {
                        this.showStatus(`Cut ${cutNumber} 이미지 재생성 응답 파싱 실패 (${duration}ms)`, 'error');
                        Utils.showAchievement('이미지 재생성 응답을 처리할 수 없습니다.', 'error');
                    }
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

    // ⭐ 새로운 함수: 대본→이미지 생성 성공 처리
    handleScriptToImageSuccess: function(cutNumber, result, duration) {
        const cutKey = `cut${cutNumber}`;
        
        if (result[cutKey]) {
            // 프롬프트 업데이트
            if (result[cutKey].prompt) {
                const promptElement = document.getElementById(`cut${cutNumber}Prompt`);
                if (promptElement) {
                    promptElement.value = result[cutKey].prompt;
                }
                this.cuts[cutKey].prompt = result[cutKey].prompt;
            }

            // 이미지 업데이트
            if (result[cutKey].image_url) {
                const imagePreview = document.getElementById(`cut${cutNumber}ImagePreview`);
                if (imagePreview) {
                    imagePreview.innerHTML = `
                        <img src="${result[cutKey].image_url}" alt="Cut ${cutNumber} 이미지" 
                             style="max-width: 150px; max-height: 150px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    `;
                }
                this.cuts[cutKey].image = result[cutKey].image_url;
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

    // ⭐ 새로운 함수: 프롬프트→이미지 재생성 성공 처리
    handlePromptToImageSuccess: function(cutNumber, result, duration) {
        const cutKey = `cut${cutNumber}`;
        
        if (result[cutKey] && result[cutKey].image_url) {
            const imagePreview = document.getElementById(`cut${cutNumber}ImagePreview`);
            if (imagePreview) {
                imagePreview.innerHTML = `
                    <img src="${result[cutKey].image_url}" alt="Cut ${cutNumber} 이미지" 
                         style="max-width: 150px; max-height: 150px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                `;
            }
            this.cuts[cutKey].image = result[cutKey].image_url;

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
