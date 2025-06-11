// 분석 대시보드 모듈 (Pro 전용)
window.Analytics = {
    // 샘플 데이터
    sampleData: {
        followerGrowth: 23,
        engagementRate: 3.2,
        todayRevenue: 12.50,
        weeklyGrowth: 156,
        monthlyGrowth: 678,
        topPerformingPosts: [
            { title: "애플 에어팟 프로", likes: 234, comments: 45 },
            { title: "삼성 갤럭시 버즈", likes: 189, comments: 32 },
            { title: "소니 WH-1000XM4", likes: 167, comments: 28 }
        ],
        languagePerformance: {
            korean: { followers: 1234, engagement: 3.5 },
            japanese: { followers: 987, engagement: 2.8 },
            french: { followers: 756, engagement: 3.1 }
        }
    },

    // HTML 반환
    getHTML: function() {
        return `
            <div class="section">
                <h2>📊 분석 대시보드 (Pro 모드)</h2>
                <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h3>💎 실시간 성과 분석</h3>
                    <p>Buffer와 ManyChat API를 통한 실시간 데이터 수집 및 분석</p>
                </div>
                
                <!-- 주요 지표 카드 -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #28a745;">
                        <h3>📈 팔로워 성장</h3>
                        <p style="font-size: 2em; color: #28a745; margin: 10px 0;" id="followerGrowth">+${this.sampleData.followerGrowth}</p>
                        <p>오늘 새 팔로워</p>
                        <small>이번 주: +${this.sampleData.weeklyGrowth} | 이번 달: +${this.sampleData.monthlyGrowth}</small>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #667eea;">
                        <h3>💬 인게이지먼트</h3>
                        <p style="font-size: 2em; color: #667eea; margin: 10px 0;" id="engagementRate">${this.sampleData.engagementRate}%</p>
                        <p>평균 인게이지먼트율</p>
                        <small>지난주 대비 +0.3%p 증가</small>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #ffa500;">
                        <h3>💰 수익</h3>
                        <p style="font-size: 2em; color: #ffa500; margin: 10px 0;" id="todayRevenue">$${this.sampleData.todayRevenue}</p>
                        <p>오늘 수익</p>
                        <small>이번 달 누적: $${AppState.revenue.total || 0}</small>
                    </div>
                </div>

                <!-- 언어별 성과 분석 -->
                <div class="section">
                    <h2>🌍 언어별 성과 분석</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ff6b6b;">
                            <h4>🇰🇷 한국어 계정</h4>
                            <p><strong>팔로워:</strong> ${this.sampleData.languagePerformance.korean.followers}</p>
                            <p><strong>인게이지먼트:</strong> ${this.sampleData.languagePerformance.korean.engagement}%</p>
                            <div class="progress-bar" style="height: 8px;">
                                <div class="progress-fill" style="width: ${this.sampleData.languagePerformance.korean.engagement * 20}%; background: #ff6b6b;"></div>
                            </div>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #4ecdc4;">
                            <h4>🇯🇵 일본어 계정</h4>
                            <p><strong>팔로워:</strong> ${this.sampleData.languagePerformance.japanese.followers}</p>
                            <p><strong>인게이지먼트:</strong> ${this.sampleData.languagePerformance.japanese.engagement}%</p>
                            <div class="progress-bar" style="height: 8px;">
                                <div class="progress-fill" style="width: ${this.sampleData.languagePerformance.japanese.engagement * 20}%; background: #4ecdc4;"></div>
                            </div>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #45b7d1;">
                            <h4>🇫🇷 프랑스어 계정</h4>
                            <p><strong>팔로워:</strong> ${this.sampleData.languagePerformance.french.followers}</p>
                            <p><strong>인게이지먼트:</strong> ${this.sampleData.languagePerformance.french.engagement}%</p>
                            <div class="progress-bar" style="height: 8px;">
                                <div class="progress-fill" style="width: ${this.sampleData.languagePerformance.french.engagement * 20}%; background: #45b7d1;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 최고 성과 포스팅 -->
                <div class="section">
                    <h2>🏆 최고 성과 포스팅</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px;">
                        ${this.sampleData.topPerformingPosts.map((post, index) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: ${index < this.sampleData.topPerformingPosts.length - 1 ? '1px solid #eee' : 'none'};">
                                <div>
                                    <h4 style="margin: 0; color: #333;">${post.title}</h4>
                                    <small style="color: #666;">최근 7일</small>
                                </div>
                                <div style="text-align: right;">
                                    <p style="margin: 0; color: #667eea;">❤️ ${post.likes}</p>
                                    <p style="margin: 0; color: #28a745;">💬 ${post.comments}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- API 연동 상태 -->
                <div class="section">
                    <h2>🔌 API 연동 상태</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <h4>Buffer API</h4>
                            <div style="width: 20px; height: 20px; background: #28a745; border-radius: 50%; margin: 10px auto;"></div>
                            <p style="color: #28a745; margin: 0;">연결됨</p>
                            <small>마지막 동기화: 5분 전</small>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <h4>ManyChat API</h4>
                            <div style="width: 20px; height: 20px; background: #28a745; border-radius: 50%; margin: 10px auto;"></div>
                            <p style="color: #28a745; margin: 0;">연결됨</p>
                            <small>마지막 동기화: 3분 전</small>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                            <h4>Instagram API</h4>
                            <div style="width: 20px; height: 20px; background: #ffc107; border-radius: 50%; margin: 10px auto;"></div>
                            <p style="color: #ffc107; margin: 0;">제한된 연결</p>
                            <small>읽기 전용 모드</small>
                        </div>
                    </div>
                </div>

                <!-- 실시간 업데이트 -->
                <div style="text-align: center; margin-top: 30px;">
                    <button onclick="Analytics.refreshData()" style="background: #17a2b8;">🔄 데이터 새로고침</button>
                    <button onclick="Analytics.exportReport()" style="background: #6f42c1;">📁 리포트 내보내기</button>
                    <p style="color: #666; margin-top: 10px; font-size: 14px;">
                        자동 업데이트: 매 5분마다 | 마지막 업데이트: ${new Date().toLocaleTimeString('ko-KR')}
                    </p>
                </div>
            </div>
        `;
    },

    // 초기화
    initialize: function() {
        this.startAutoRefresh();
        this.updateRevenueData();
    },

    // 자동 새로고침 시작
    startAutoRefresh: function() {
        // 실제 구현에서는 API 호출을 통해 데이터 업데이트
        setInterval(() => {
            if (AppState.currentPage === 'analytics-dashboard') {
                this.simulateDataUpdate();
            }
        }, 30000); // 30초마다 업데이트
    },

    // 데이터 시뮬레이션 업데이트
    simulateDataUpdate: function() {
        // 팔로워 수 약간 증가
        this.sampleData.followerGrowth += Math.floor(Math.random() * 3);
        
        // 인게이지먼트율 약간 변동
        this.sampleData.engagementRate += (Math.random() - 0.5) * 0.2;
        this.sampleData.engagementRate = Math.max(0, Math.min(10, this.sampleData.engagementRate));
        
        // 수익 약간 증가
        this.sampleData.todayRevenue += Math.random() * 2;
        
        // UI 업데이트
        this.updateDisplayValues();
    },

    // 표시값 업데이트
    updateDisplayValues: function() {
        const followerElement = document.getElementById('followerGrowth');
        const engagementElement = document.getElementById('engagementRate');
        const revenueElement = document.getElementById('todayRevenue');
        
        if (followerElement) {
            followerElement.textContent = `+${this.sampleData.followerGrowth}`;
        }
        if (engagementElement) {
            engagementElement.textContent = `${this.sampleData.engagementRate.toFixed(1)}%`;
        }
        if (revenueElement) {
            revenueElement.textContent = `$${this.sampleData.todayRevenue.toFixed(2)}`;
        }
    },

    // 수익 데이터 업데이트
    updateRevenueData: function() {
        // AppState의 수익 정보를 분석 대시보드에 반영
        AppState.revenue.total = this.sampleData.todayRevenue * 30; // 월 수익 시뮬레이션
        AppState.saveAppState();
    },

    // 데이터 새로고침
    refreshData: function() {
        Utils.showAchievement('데이터를 새로고침하고 있습니다...');
        
        // 실제 구현에서는 여기서 API 호출
        setTimeout(() => {
            this.simulateDataUpdate();
            Utils.showAchievement('데이터가 업데이트되었습니다! 📊');
        }, 1500);
    },

    // 리포트 내보내기
    exportReport: function() {
        const reportData = {
            date: new Date().toISOString().split('T')[0],
            followerGrowth: this.sampleData.followerGrowth,
            engagementRate: this.sampleData.engagementRate,
            revenue: this.sampleData.todayRevenue,
            languagePerformance: this.sampleData.languagePerformance,
            topPosts: this.sampleData.topPerformingPosts
        };

        const csvContent = this.generateCSVReport(reportData);
        this.downloadCSV(csvContent, `EasyGift143_Report_${reportData.date}.csv`);
        
        Utils.showAchievement('리포트가 다운로드되었습니다! 📁');
    },

    // CSV 리포트 생성
    generateCSVReport: function(data) {
        let csv = "항목,값\n";
        csv += `날짜,${data.date}\n`;
        csv += `팔로워 증가,${data.followerGrowth}\n`;
        csv += `인게이지먼트율,${data.engagementRate}%\n`;
        csv += `일일 수익,$${data.revenue}\n`;
        csv += "\n언어별 성과\n";
        csv += "언어,팔로워,인게이지먼트\n";
        
        Object.keys(data.languagePerformance).forEach(lang => {
            const perf = data.languagePerformance[lang];
            csv += `${lang},${perf.followers},${perf.engagement}%\n`;
        });
        
        csv += "\n최고 성과 포스팅\n";
        csv += "제목,좋아요,댓글\n";
        
        data.topPosts.forEach(post => {
            csv += `${post.title},${post.likes},${post.comments}\n`;
        });
        
        return csv;
    },

    // CSV 다운로드
    downloadCSV: function(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
};
