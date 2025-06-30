window.EngagementAssistant = {
    currentSelectedAccount: null,

    getHTML: function() {
        const mode = AppState.currentMode;
        
        return `
            <div class="section">
                <h2>📈 SNS 성장 도우미 (${mode.toUpperCase()} 모드)</h2>

                ${mode === 'pro' ? `
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h3>💎 Pro 모드 기능</h3>
                        <ul>
                            <li>✅ AI 기반 맞춤 목표 설정</li>
                            <li>✅ Buffer Analytics 연동</li>
                            <li>✅ ManyChat Analytics 연동</li>
                            <li>✅ 실시간 성과 분석</li>
                        </ul>
                    </div>
                ` : ''}

                <div class="section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0;">🎯 오늘의 목표</h2>
                    </div>
                    
                    <div style="display: flex; gap: 20px; align-items: stretch; min-height: 400px;">
                        <!-- 선택된 계정 현황 (60%) -->
                        <div style="flex: 6; background: white; padding: 25px; border-radius: 12px; border: 2px solid #667eea; position: relative; display: flex; flex-direction: column;">
                            <!-- 상단 정보 -->
                            <div style="position: absolute; top: 15px; left: 25px;">
                                <div style="color: #666; font-size: 18px; font-weight: bold;">2024.06.03</div>
                            </div>
                            
                            <div style="position: absolute; top: 15px; right: 25px; font-size: 16px; color: #667eea;">
                                <strong>총 진행률:</strong> <span id="overallProgress" style="font-size: 18px; color: #333; font-weight: bold;">0%</span>
                            </div>
                            
                            <!-- 중앙 계정명 -->
                            <div style="text-align: center; margin-top: 50px; margin-bottom: 30px;">
                                <h3 style="margin: 0; font-size: 24px; color: #333; font-weight: bold;"><span id="selectedAccountName">계정을 선택하세요</span></h3>
                            </div>
                            
                            <!-- 목표 영역 (왼쪽) -->
                            <div style="position: absolute; left: 40px; top: 65%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 22px;">
                                <!-- 포스팅 -->
                                <div style="display: flex; align-items: center; gap: 15px; width: 300px;">
                                    <div style="font-size: 18px; color: #666; font-weight: bold; width: 80px; text-align: left;">포스팅</div>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <button onclick="EngagementAssistant.updateCurrentGoal('postings', -1)" 
                                                style="width: 34px; height: 34px; min-width: 34px; min-height: 34px; font-size: 16px; border-radius: 50%; background: #667eea; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0; box-sizing: border-box; margin-top: 3px;">-</button>
                                        <div style="display: flex; align-items: center; min-width: 100px; justify-content: center;">
                                            <span id="current-postings" style="font-size: 24px; font-weight: bold; color: #333;">0</span>
                                            <span style="color: #999; font-size: 20px; margin: 0 10px;"> / </span>
                                            <span id="current-postings-target" style="font-size: 22px; color: #666;">0</span>
                                        </div>
                                        <button onclick="EngagementAssistant.updateCurrentGoal('postings', 1)" 
                                                style="width: 34px; height: 34px; min-width: 34px; min-height: 34px; font-size: 16px; border-radius: 50%; background: #667eea; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0; box-sizing: border-box; margin-top: 3px;">+</button>
                                    </div>
                                </div>
                                
                                <!-- 좋아요 -->
                                <div style="display: flex; align-items: center; gap: 15px; width: 300px;">
                                    <div style="font-size: 18px; color: #666; font-weight: bold; width: 80px; text-align: left;">좋아요</div>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <button onclick="EngagementAssistant.updateCurrentGoal('likes', -1)" 
                                                style="width: 34px; height: 34px; min-width: 34px; min-height: 34px; font-size: 16px; border-radius: 50%; background: #667eea; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0; box-sizing: border-box; margin-top: 3px;">-</button>
                                        <div style="display: flex; align-items: center; min-width: 100px; justify-content: center;">
                                            <span id="current-likes" style="font-size: 24px; font-weight: bold; color: #333;">0</span>
                                            <span style="color: #999; font-size: 20px; margin: 0 10px;"> / </span>
                                            <span id="current-likes-target" style="font-size: 22px; color: #666;">0</span>
                                        </div>
                                        <button onclick="EngagementAssistant.updateCurrentGoal('likes', 1)" 
                                                style="width: 34px; height: 34px; min-width: 34px; min-height: 34px; font-size: 16px; border-radius: 50%; background: #667eea; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0; box-sizing: border-box; margin-top: 3px;">+</button>
                                    </div>
                                </div>
                                
                                <!-- 댓글 -->
                                <div style="display: flex; align-items: center; gap: 15px; width: 300px;">
                                    <div style="font-size: 18px; color: #666; font-weight: bold; width: 80px; text-align: left;">댓글</div>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <button onclick="EngagementAssistant.updateCurrentGoal('comments', -1)" 
                                                style="width: 34px; height: 34px; min-width: 34px; min-height: 34px; font-size: 16px; border-radius: 50%; background: #667eea; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0; box-sizing: border-box; margin-top: 3px;">-</button>
                                        <div style="display: flex; align-items: center; min-width: 100px; justify-content: center;">
                                            <span id="current-comments" style="font-size: 24px; font-weight: bold; color: #333;">0</span>
                                            <span style="color: #999; font-size: 20px; margin: 0 10px;"> / </span>
                                            <span id="current-comments-target" style="font-size: 22px; color: #666;">0</span>
                                        </div>
                                        <button onclick="EngagementAssistant.updateCurrentGoal('comments', 1)" 
                                                style="width: 34px; height: 34px; min-width: 34px; min-height: 34px; font-size: 16px; border-radius: 50%; background: #667eea; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0; box-sizing: border-box; margin-top: 3px;">+</button>
                                    </div>
                                </div>
                                
                                <!-- 팔로우 -->
                                <div style="display: flex; align-items: center; gap: 15px; width: 300px;">
                                    <div style="font-size: 18px; color: #666; font-weight: bold; width: 80px; text-align: left;">팔로우</div>
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <button onclick="EngagementAssistant.updateCurrentGoal('follows', -1)" 
                                                style="width: 34px; height: 34px; min-width: 34px; min-height: 34px; font-size: 16px; border-radius: 50%; background: #667eea; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0; box-sizing: border-box; margin-top: 3px;">-</button>
                                        <div style="display: flex; align-items: center; min-width: 100px; justify-content: center;">
                                            <span id="current-follows" style="font-size: 24px; font-weight: bold; color: #333;">0</span>
                                            <span style="color: #999; font-size: 20px; margin: 0 10px;"> / </span>
                                            <span id="current-follows-target" style="font-size: 22px; color: #666;">0</span>
                                        </div>
                                        <button onclick="EngagementAssistant.updateCurrentGoal('follows', 1)" 
                                                style="width: 34px; height: 34px; min-width: 34px; min-height: 34px; font-size: 16px; border-radius: 50%; background: #667eea; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0; box-sizing: border-box; margin-top: 3px;">+</button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 진행률 바와 캐릭터 (오른쪽) -->
                            <div style="position: absolute; right: 35px; top: 65%; transform: translateY(-50%); display: flex; align-items: center; gap: 20px;">
                                <!-- 세로 진행률 바 -->
                                <div style="width: 28px; height: 250px; background: #e9ecef; border-radius: 14px; position: relative; border: 2px solid #dee2e6; flex-shrink: 0;">
                                    <div id="verticalProgress" style="position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(0deg, #28a745, #20c997); border-radius: 12px; transition: height 0.5s ease; height: 0%;"></div>
                                </div>
                                <!-- 진행률 캐릭터 -->
                                <div id="progressCharacter" style="font-size: 64px; line-height: 1; flex-shrink: 0;">😴</div>
                            </div>
                        </div>
                        
                        <!-- 계정 관리 (40%) -->
                        <div style="flex: 4; background: white; padding: 20px; border-radius: 12px; border: 2px solid #28a745; display: flex; flex-direction: column;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin: 0; font-size: 18px;">계정 관리</h3>
                                <button onclick="EngagementAssistant.openAccountEditor()" style="width: 32px; height: 32px; padding: 0; font-size: 16px; background: white; border: 1px solid #ddd; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="계정 편집">⚙️</button>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 12px;">
                                <label for="snsSelect" style="font-size: 14px; margin-bottom: 6px; font-weight: 600;">SNS 플랫폼</label>
                                <select id="snsSelect" style="padding: 10px; font-size: 14px; border: 1px solid #ddd; border-radius: 6px; width: 100%;">
                                    <option value="instagram">Instagram</option>
                                    <option value="x">X (Twitter)</option>
                                    <option value="threads">Threads</option>
                                </select>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label for="languageSelect" style="font-size: 14px; margin-bottom: 6px; font-weight: 600;">국가</label>
                                <select id="languageSelect" style="padding: 10px; font-size: 14px; border: 1px solid #ddd; border-radius: 6px; width: 100%;">
                                    <option value="korea">한국</option>
                                    <option value="japan">일본</option>
                                    <option value="usa">미국</option>
                                    <option value="canada">캐나다</option>
                                </select>
                            </div>
                            
                            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                                <button onclick="EngagementAssistant.addAccount()" style="flex: 1; background: #28a745; font-size: 14px; padding: 10px; margin: 0; border-radius: 6px;">➕ 추가</button>
                                <button onclick="EngagementAssistant.removeAccount()" style="flex: 1; background: #dc3545; font-size: 14px; padding: 10px; margin: 0; border-radius: 6px;">➖ 제거</button>
                            </div>
                            
                            <div style="margin-bottom: 10px;">
                                <label style="font-size: 14px; margin-bottom: 6px; font-weight: 600;">활성 계정 목록</label>
                            </div>
                            <select id="accountList" size="5" style="width: 100%; font-size: 13px; padding: 8px; flex: 1; font-family: 'Courier New', Consolas, monospace; border: 1px solid #ddd; border-radius: 6px; background: white;" onchange="EngagementAssistant.selectAccount()">
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 번역 도우미 -->
            <div class="section">
                <h2>🌐 번역 도우미</h2>
                
                <div class="form-group">
                    <label for="translationWebhook">웹훅 URL</label>
                    <div class="url-input-group">
                        <input type="text" id="translationWebhook" placeholder="번역 웹훅 URL을 입력하세요">
                        <button onclick="EngagementAssistant.saveTranslationWebhook()">저장</button>
                    </div>
                    <span id="translationWebhookSaved" class="saved-indicator" style="display: none;">✅ 저장됨</span>
                </div>
                
                <div class="form-group">
                    <label for="originalText">원문 (한국어)</label>
                    <textarea id="originalText" rows="3" placeholder="번역할 한국어 텍스트를 입력하세요..."></textarea>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <button onclick="EngagementAssistant.translateText()">🌐 번역</button>
                </div>
                
                <div class="form-group">
                    <label for="translationResult">번역 결과</label>
                    <textarea id="translationResult" rows="6" readonly placeholder=""></textarea>
                </div>
            </div>
			
			<!-- 계정 편집 모달 -->
			<div id="accountEditorModal" class="modal" style="display: none;">
				<div class="modal-content" style="max-width: 450px;">
					<span class="close" onclick="EngagementAssistant.closeAccountEditor()">&times;</span>
					<h2>⚙️ 국가 관리</h2>
					
					<div style="margin-bottom: 20px;">
						<h3>새 국가 추가</h3>
						<div style="display: flex; gap: 10px; align-items: end;">
							<div style="flex: 1;">
								<label for="newCountryInput" style="font-size: 14px;">국가명</label>
								<input type="text" id="newCountryInput" placeholder="예: 독일, 영국, 프랑스" style="width: 100%; padding: 8px;">
							</div>
							<button onclick="EngagementAssistant.addCountry()" style="background: #28a745; white-space: nowrap;">➕ 추가</button>
						</div>
					</div>
					
					<div style="margin-bottom: 20px;">
						<h3>기존 국가 관리</h3>
						<div id="countryList" style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 5px; padding: 10px;">
							<!-- 국가 목록이 동적으로 여기에 추가됩니다 -->
						</div>
					</div>
					
					<div style="display: flex; gap: 10px; justify-content: flex-end;">
						<button onclick="EngagementAssistant.closeAccountEditor()" class="btn-secondary">완료</button>
					</div>
				</div>
			</div>
        `;
    },

    initialize: function() {
		this.checkMidnightReset();
		this.restoreGoalsState();
		this.initializeAccountList();
		this.loadSavedTranslationWebhook();
		this.updateCountrySelects();
	},

    restoreGoalsState: function() {
        setTimeout(() => {
            ['postings', 'likes', 'comments', 'follows'].forEach(type => {
                const element = document.getElementById(`total-${type}`);
                const targetElement = document.getElementById(`total-${type}-target`);
                if (element) {
                    element.textContent = AppState.totalGoals[type];
                }
                if (targetElement) {
                    targetElement.textContent = AppState.totalGoals.targets[type];
                }
            });
            this.updateTotalProgress();
        }, 100);
    },

    initializeAccountList: function() {
        if (!AppState.accountList) {
            AppState.accountList = [
                'instagram-korea', 'instagram-japan', 'instagram-usa',
                'x-korea', 'x-japan', 'x-usa',
                'threads-korea', 'threads-japan', 'threads-usa'
            ];
        }
        this.updateAccountListDisplay();
        this.restoreLastSelectedAccount();
    },

    restoreLastSelectedAccount: function() {
        setTimeout(() => {
            const accountList = document.getElementById('accountList');
            if (!accountList || accountList.options.length === 0) return;
            
            const lastSelectedAccount = Utils.safeStorage.get('lastSelectedAccount', '');
            let targetIndex = 0;
            
            if (lastSelectedAccount) {
                for (let i = 0; i < accountList.options.length; i++) {
                    if (accountList.options[i].value === lastSelectedAccount) {
                        targetIndex = i;
                        break;
                    }
                }
            }
            
            accountList.selectedIndex = targetIndex;
            this.currentSelectedAccount = accountList.options[targetIndex].value;
            this.updateCurrentAccountDisplay();
            
            if (lastSelectedAccount && targetIndex > 0) {
                Utils.showAchievement(`마지막 선택 계정 "${this.getAccountDisplayName(...this.currentSelectedAccount.split('-'))}"이 자동으로 선택되었습니다! 🎯`);
            }
        }, 200);
    },

    addAccount: function() {
        const sns = document.getElementById('snsSelect').value;
        const language = document.getElementById('languageSelect').value;
        const accountKey = `${sns}-${language}`;
        
        if (!AppState.accountList.includes(accountKey)) {
            AppState.accountList.push(accountKey);
            this.updateAccountListDisplay();
            AppState.saveAppState();
            Utils.showAchievement(`${this.getAccountDisplayName(sns, language)} 계정이 추가되었습니다!`);
        } else {
            Utils.showAchievement('이미 존재하는 계정입니다.', 'error');
        }
    },

    removeAccount: function() {
        const accountList = document.getElementById('accountList');
        const selectedOption = accountList.options[accountList.selectedIndex];
        
        if (selectedOption) {
            const accountKey = selectedOption.value;
            const index = AppState.accountList.indexOf(accountKey);
            
            if (index > -1) {
                AppState.accountList.splice(index, 1);
                
                const lastSelectedAccount = Utils.safeStorage.get('lastSelectedAccount', '');
                if (lastSelectedAccount === accountKey) {
                    Utils.safeStorage.remove('lastSelectedAccount');
                    this.currentSelectedAccount = null;
                }
                
                this.updateAccountListDisplay();
                AppState.saveAppState();
                Utils.showAchievement(`${selectedOption.text} 계정이 제거되었습니다!`);
                
                setTimeout(() => {
                    const updatedAccountList = document.getElementById('accountList');
                    if (updatedAccountList && updatedAccountList.options.length > 0) {
                        updatedAccountList.selectedIndex = 0;
                        this.currentSelectedAccount = updatedAccountList.options[0].value;
                        this.updateCurrentAccountDisplay();
                        Utils.safeStorage.set('lastSelectedAccount', this.currentSelectedAccount);
                    } else {
                        this.currentSelectedAccount = null;
                        this.updateCurrentAccountDisplay();
                    }
                }, 100);
            }
        } else {
            Utils.showAchievement('제거할 계정을 선택해주세요.', 'error');
        }
    },

    updateAccountListDisplay: function() {
        const accountList = document.getElementById('accountList');
        if (!accountList) return;
        
        accountList.innerHTML = '';
        
        AppState.accountList.forEach(accountKey => {
            const [sns, language] = accountKey.split('-');
            const option = document.createElement('option');
            option.value = accountKey;
            option.textContent = this.getAccountDisplayName(sns, language);
            accountList.appendChild(option);
        });
    },

	getAccountDisplayName: function(sns, language) {
		// 정확히 12글자로 맞춤 (오른쪽에 공백 채움)
		const snsNames = {
			instagram: 'Instagram   ',  	// 9 + 3 = 12글자
			x: 'X           ',          	// 1 + 11 = 12글자  
			threads: 'Threads     '     	// 7 + 5 = 12글자
		};
		
		// AppState.countryList에서 동적으로 국가명 찾기
		const country = AppState.countryList.find(c => c.key === language);
		const countryName = country ? country.name : language;
		
		return `${snsNames[sns]}/ ${countryName}`;
	},

    selectAccount: function() {
        const accountList = document.getElementById('accountList');
        const selectedOption = accountList.options[accountList.selectedIndex];
        
        if (selectedOption) {
            this.currentSelectedAccount = selectedOption.value;
            this.updateCurrentAccountDisplay();
            Utils.safeStorage.set('lastSelectedAccount', this.currentSelectedAccount);
        }
    },

    updateCurrentAccountDisplay: function() {
        if (!this.currentSelectedAccount) {
            document.getElementById('selectedAccountName').textContent = '계정을 선택하세요';
            return;
        }
        
        const [sns, language] = this.currentSelectedAccount.split('-');
        const displayName = this.getAccountDisplayName(sns, language);
        document.getElementById('selectedAccountName').textContent = displayName;
        
        const accountGoals = this.getAccountGoals(this.currentSelectedAccount);
        
        document.getElementById('current-postings').textContent = accountGoals.postings;
        document.getElementById('current-postings-target').textContent = accountGoals.targets.postings;
        document.getElementById('current-likes').textContent = accountGoals.likes;
        document.getElementById('current-likes-target').textContent = accountGoals.targets.likes;
        document.getElementById('current-comments').textContent = accountGoals.comments;
        document.getElementById('current-comments-target').textContent = accountGoals.targets.comments;
        document.getElementById('current-follows').textContent = accountGoals.follows;
        document.getElementById('current-follows-target').textContent = accountGoals.targets.follows;
        
        this.updateCurrentProgress();
    },

    getAccountGoals: function(accountKey) {
        if (!AppState.accountGoals) {
            AppState.accountGoals = {};
        }
        
        if (!AppState.accountGoals[accountKey]) {
            const [sns, language] = accountKey.split('-');
            AppState.accountGoals[accountKey] = {
                postings: 0, likes: 0, comments: 0, follows: 0,
                targets: this.getDefaultTargets(sns, language)
            };
        }
        
        return AppState.accountGoals[accountKey];
    },

    getDefaultTargets: function(sns, language) {
        const baseTargets = {
            instagram: { postings: 3, likes: 40, comments: 20, follows: 20 },
            x: { postings: 15, likes: 50, comments: 30, follows: 30 },
            threads: { postings: 3, likes: 40, comments: 20, follows: 20 }
        };
        
        return baseTargets[sns] || { postings: 2, likes: 3, comments: 1, follows: 1 };
    },

    updateCurrentGoal: function(type, change) {
        if (!this.currentSelectedAccount) {
            Utils.showAchievement('계정을 먼저 선택해주세요.', 'error');
            return;
        }
        
        const accountGoals = this.getAccountGoals(this.currentSelectedAccount);
        const current = accountGoals[type];
        const target = accountGoals.targets[type];
        const newValue = Math.max(0, Math.min(target, current + change));
        
        accountGoals[type] = newValue;
        
        document.getElementById(`current-${type}`).textContent = newValue;
        this.updateCurrentProgress();
        
        if (newValue === target) {
            Utils.showAchievement(`${this.currentSelectedAccount} ${type} 목표 달성! 🎉`);
        }
        
        AppState.saveAppState();
    },

    updateCurrentProgress: function() {
        if (!this.currentSelectedAccount) {
            this.updateProgressCharacter(0);
            return;
        }
        
        const accountGoals = this.getAccountGoals(this.currentSelectedAccount);
        const totalCurrent = accountGoals.postings + accountGoals.likes + accountGoals.comments + accountGoals.follows;
        const totalTarget = accountGoals.targets.postings + accountGoals.targets.likes + accountGoals.targets.comments + accountGoals.targets.follows;
        const percentage = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
        
        this.updateProgressCharacter(percentage);
        this.updateTotalProgress();
    },

    updateTotalProgress: function() {
        let totalCurrent = 0;
        let totalTarget = 0;
        
        AppState.accountList.forEach(accountKey => {
            const accountGoals = this.getAccountGoals(accountKey);
            totalCurrent += accountGoals.postings + accountGoals.likes + accountGoals.comments + accountGoals.follows;
            totalTarget += accountGoals.targets.postings + accountGoals.targets.likes + accountGoals.targets.comments + accountGoals.targets.follows;
        });
        
        const percentage = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
        document.getElementById('overallProgress').textContent = `${percentage}%`;
        
        if (percentage >= 100) {
            Utils.showAchievement('🎉 모든 목표 달성! 오늘 정말 수고하셨습니다!');
        }
    },

    checkMidnightReset: function() {
        const lastResetDate = Utils.safeStorage.get('lastResetDate', '');
        const today = new Date().toDateString();
        
        if (lastResetDate !== today) {
            this.resetAllGoals();
            Utils.safeStorage.set('lastResetDate', today);
            Utils.showAchievement('자정이 지나 목표가 자동으로 리셋되었습니다! 🌅');
        }
    },

    resetAllGoals: function() {
        if (AppState.accountGoals) {
            Object.keys(AppState.accountGoals).forEach(accountKey => {
                AppState.accountGoals[accountKey].postings = 0;
                AppState.accountGoals[accountKey].likes = 0;
                AppState.accountGoals[accountKey].comments = 0;
                AppState.accountGoals[accountKey].follows = 0;
            });
        }
        
        if (this.currentSelectedAccount) {
            this.updateCurrentAccountDisplay();
        }
        
        AppState.saveAppState();
    },
	
	// 번역 웹훅 URL 저장
    saveTranslationWebhook: function() {
        const webhookUrl = document.getElementById('translationWebhook').value.trim();
        const indicator = document.getElementById('translationWebhookSaved');
        
        if (webhookUrl) {
            Utils.safeStorage.set('translationWebhookUrl', webhookUrl);
            this.showSavedIndicator(indicator);
            Utils.showAchievement('번역 웹훅 URL이 저장되었습니다.', 'success');
        } else {
            Utils.showAchievement('웹훅 URL을 입력해주세요.', 'error');
        }
    },

    // 저장된 번역 웹훅 URL 로드
    loadSavedTranslationWebhook: function() {
        const savedUrl = Utils.safeStorage.get('translationWebhookUrl', '');
        if (savedUrl) {
            document.getElementById('translationWebhook').value = savedUrl;
            const indicator = document.getElementById('translationWebhookSaved');
            this.showSavedIndicator(indicator);
        }
    },

    // 저장 표시기 표시
    showSavedIndicator: function(indicator) {
        if (indicator) {
            indicator.style.display = 'inline';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 3000);
        }
    },
	
	// 번역 기능 - 응답 처리 부분만 수정
	translateText: function() {
		const webhookUrl = document.getElementById('translationWebhook').value.trim();
		const originalText = document.getElementById('originalText').value.trim();
		const resultTextarea = document.getElementById('translationResult');
		
		if (!webhookUrl) {
			Utils.showAchievement('웹훅 URL을 입력해주세요.', 'error');
			return;
		}
		
		if (!originalText) {
			Utils.showAchievement('번역할 텍스트를 입력해주세요.', 'error');
			return;
		}
		
		// 활성 계정에서 고유한 국가 목록 추출
		const activeCountries = [...new Set(
			AppState.accountList.map(accountKey => {
				const [sns, countryKey] = accountKey.split('-');
				const country = AppState.countryList.find(c => c.key === countryKey);
				return country ? country.name : countryKey;
			})
		)];
		
		// 로딩 상태 표시
		resultTextarea.value = '번역 중...';
		
		// Discord 메시지 형식으로 웹훅 데이터 구성
		const webhookData = {
			content: `${originalText}\n\n[활성 국가] ${activeCountries.join(', ')}`,
			author: {
				id: "123456789",
				username: "translator",
				discriminator: "0001"
			},
			timestamp: new Date().toISOString(),
			attachments: []
		};
		
		const startTime = Date.now();
		
		// 웹훅 전송
		fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(webhookData)
		})
		.then(response => {
			const endTime = Date.now();
			const duration = endTime - startTime;
			
			return response.text().then(text => {
				console.log('받은 응답:', text);
				
				if (response.ok) {
					try {
						// 직접 JSON 파싱 시도
						const translationResults = JSON.parse(text);
						
						// JSON 객체인지 확인하고 번역 결과 포맷팅
						if (typeof translationResults === 'object' && translationResults !== null) {
							let resultText = '';
							Object.keys(translationResults).forEach(country => {
								resultText += `${country}: ${translationResults[country]}\n`;
							});
							
							resultTextarea.value = resultText.trim();
							Utils.showAchievement(`번역이 완료되었습니다! (${duration}ms) 🌐`);
						} else {
							// JSON이 아닌 경우 원시 데이터 표시
							resultTextarea.value = `번역 결과:\n${text}`;
							Utils.showAchievement(`번역 완료 (${duration}ms) 🌐`);
						}
						
					} catch (parseError) {
						console.log('JSON 파싱 실패:', parseError);
						
						// JSON 파싱 실패 시 텍스트에서 JSON 추출 시도
						const jsonMatch = text.match(/\{[\s\S]*\}/);
						if (jsonMatch) {
							try {
								const extractedJson = JSON.parse(jsonMatch[0]);
								let resultText = '';
								Object.keys(extractedJson).forEach(country => {
									resultText += `${country}: ${extractedJson[country]}\n`;
								});
								
								resultTextarea.value = resultText.trim();
								Utils.showAchievement(`번역이 완료되었습니다! (${duration}ms) 🌐`);
							} catch (extractError) {
								// 모든 파싱 실패 시 원시 데이터 표시
								resultTextarea.value = `원문: ${originalText}\n\n응답:\n${text}`;
								Utils.showAchievement(`번역 완료 (원시 데이터) (${duration}ms) 🌐`);
							}
						} else {
							// JSON을 찾을 수 없는 경우
							resultTextarea.value = `원문: ${originalText}\n\n응답:\n${text}`;
							Utils.showAchievement(`번역 완료 (원시 데이터) (${duration}ms) 🌐`);
						}
					}
				} else {
					resultTextarea.value = `번역 요청 실패\n상태: ${response.status} ${response.statusText}\n응답: ${text}`;
					Utils.showAchievement(`번역 요청 실패: ${response.status} ${response.statusText}`, 'error');
				}
			});
		})
		.catch(error => {
			const endTime = Date.now();
			const duration = endTime - startTime;
			
			console.error('번역 웹훅 전송 오류:', error);
			resultTextarea.value = `네트워크 오류 발생\n오류: ${error.message}\n응답 시간: ${duration}ms`;
			Utils.showAchievement('번역 요청 실패: ' + error.message, 'error');
		});
	},

    updateProgressCharacter: function(percentage) {
        const characterElement = document.getElementById('progressCharacter');
        const verticalProgress = document.getElementById('verticalProgress');
        
        if (!characterElement || !verticalProgress) return;
        
        verticalProgress.style.height = `${percentage}%`;
        
        let character = '😴';
        
        if (percentage >= 100) {
            character = '🎉';
            verticalProgress.style.background = '#28a745';
        } else if (percentage >= 75) {
            character = '🤩';
            verticalProgress.style.background = 'linear-gradient(0deg, #28a745, #20c997)';
        } else if (percentage >= 50) {
            character = '😊';
            verticalProgress.style.background = 'linear-gradient(0deg, #ffc107, #fd7e14)';
        } else if (percentage >= 25) {
            character = '🙂';
            verticalProgress.style.background = 'linear-gradient(0deg, #667eea, #764ba2)';
        } else if (percentage > 0) {
            character = '😐';
            verticalProgress.style.background = 'linear-gradient(0deg, #6c757d, #495057)';
        }
        
        characterElement.textContent = character;
    },
    
    // 계정 편집 모달 열기
	openAccountEditor: function() {
		const modal = document.getElementById('accountEditorModal');
		this.updateCountryList();
		modal.style.display = 'flex';  // 'block' 대신 'flex' 사용
	},

	// 계정 편집 모달 닫기
	closeAccountEditor: function() {
		document.getElementById('accountEditorModal').style.display = 'none';
	},
	
	// 국가 추가
	addCountry: function() {
		const countryName = document.getElementById('newCountryInput').value.trim();
		
		if (!countryName) {
			Utils.showAchievement('국가명을 입력해주세요.', 'error');
			return;
		}
		
		// 중복 체크
		const exists = AppState.countryList.some(country => 
			country.name.toLowerCase() === countryName.toLowerCase()
		);
		
		if (exists) {
			Utils.showAchievement('이미 존재하는 국가입니다.', 'error');
			return;
		}
		
		// 새 국가 추가
		const countryKey = countryName.toLowerCase().replace(/\s+/g, '');
		AppState.countryList.push({
			key: countryKey,
			name: countryName
		});
		
		AppState.saveAppState();
		
		// UI 업데이트
		this.updateCountrySelects();
		this.updateCountryList();
		
		// 입력창 초기화
		document.getElementById('newCountryInput').value = '';
		
		Utils.showAchievement(`"${countryName}" 국가가 추가되었습니다! ➕`);
	},

	// 국가 삭제
	removeCountry: function(countryKey) {
		const country = AppState.countryList.find(c => c.key === countryKey);
		if (!country) return;
		
		// 해당 국가를 사용하는 계정들 찾기
		const affectedAccounts = AppState.accountList.filter(account => 
			account.endsWith(`-${countryKey}`)
		);
		
		let confirmMessage = `"${country.name}" 국가를 삭제하시겠습니까?`;
		if (affectedAccounts.length > 0) {
			confirmMessage += `\n\n관련된 ${affectedAccounts.length}개 계정도 함께 삭제됩니다:`;
			affectedAccounts.forEach(account => {
				const [sns] = account.split('-');
				confirmMessage += `\n- ${this.getAccountDisplayName(sns, countryKey)}`;
			});
		}
		
		if (!confirm(confirmMessage)) return;
		
		// 관련 계정들 삭제
		affectedAccounts.forEach(account => {
			const index = AppState.accountList.indexOf(account);
			if (index > -1) {
				AppState.accountList.splice(index, 1);
			}
			
			// 목표 데이터도 삭제
			if (AppState.accountGoals[account]) {
				delete AppState.accountGoals[account];
			}
			
			// 현재 선택된 계정이 삭제되는 경우
			if (this.currentSelectedAccount === account) {
				this.currentSelectedAccount = null;
				Utils.safeStorage.remove('lastSelectedAccount');
			}
		});
		
		// 국가 목록에서 제거
		const countryIndex = AppState.countryList.findIndex(c => c.key === countryKey);
		if (countryIndex > -1) {
			AppState.countryList.splice(countryIndex, 1);
		}
		
		AppState.saveAppState();
		
		// UI 업데이트
		this.updateAccountListDisplay();
		this.updateCurrentAccountDisplay();
		this.updateCountrySelects();
		this.updateCountryList();
		
		// 새로운 계정 자동 선택
		setTimeout(() => {
			const accountList = document.getElementById('accountList');
			if (accountList && accountList.options.length > 0) {
				accountList.selectedIndex = 0;
				this.currentSelectedAccount = accountList.options[0].value;
				this.updateCurrentAccountDisplay();
				Utils.safeStorage.set('lastSelectedAccount', this.currentSelectedAccount);
			}
		}, 100);
		
		Utils.showAchievement(`"${country.name}" 국가가 삭제되었습니다! ➖`);
	},

	// 국가 목록 UI 업데이트
	updateCountryList: function() {
		const container = document.getElementById('countryList');
		if (!container) return;
		
		if (AppState.countryList.length === 0) {
			container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">등록된 국가가 없습니다.</p>';
			return;
		}
		
		let html = '';
		AppState.countryList.forEach(country => {
			// 해당 국가를 사용하는 계정 수 계산
			const accountCount = AppState.accountList.filter(account => 
				account.endsWith(`-${country.key}`)
			).length;
			
			html += `
				<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-bottom: 5px; background: #f8f9fa; border-radius: 5px; border: 1px solid #ddd;">
					<div>
						<strong>${country.name}</strong>
						<span style="color: #666; font-size: 12px; margin-left: 10px;">(${accountCount}개 계정)</span>
					</div>
					<button onclick="EngagementAssistant.removeCountry('${country.key}')" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 12px;">삭제</button>
				</div>
			`;
		});
		
		container.innerHTML = html;
	},

	// 국가 선택 드롭다운 업데이트
	updateCountrySelects: function() {
		const languageSelect = document.getElementById('languageSelect');
		if (languageSelect) {
			languageSelect.innerHTML = '';
			AppState.countryList.forEach(country => {
				const option = document.createElement('option');
				option.value = country.key;
				option.textContent = country.name;
				languageSelect.appendChild(option);
			});
		}
	}
};
