class MathGame {
    constructor() {
        this.currentLevel = 1;
        this.currentQuestion = 0;
        this.score = 0;
        this.startTime = null;
        this.endTime = null;
        this.wrongAnswers = [];
        this.questionHistory = [];
        this.usedQuestions = new Set();
        
        this.initializeElements();
        this.bindEvents();
        this.detectMobile();
    }

    initializeElements() {
        // 屏幕元素
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultScreen = document.getElementById('result-screen');
        this.reviewScreen = document.getElementById('review-screen');

        // 游戏元素
        this.currentLevelElement = document.getElementById('current-level');
        this.currentQuestionElement = document.getElementById('current-question');
        this.currentScoreElement = document.getElementById('current-score');
        this.questionElement = document.getElementById('question');
        this.answerInput = document.getElementById('answer-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.feedbackElement = document.getElementById('feedback');

        // 结果元素
        this.finalScoreElement = document.getElementById('final-score');
        this.accuracyElement = document.getElementById('accuracy');
        this.timeUsedElement = document.getElementById('time-used');
        this.weaknessContent = document.getElementById('weakness-content');
        this.restartBtn = document.getElementById('restart-btn');
        this.reviewBtn = document.getElementById('review-btn');

        // 回顾元素
        this.reviewContent = document.getElementById('review-content');
        this.backToResultBtn = document.getElementById('back-to-result');
    }

    detectMobile() {
        // 检测移动设备
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (this.isMobile) {
            document.body.classList.add('mobile');
            // 移动端优化：调整输入框属性
            this.answerInput.setAttribute('inputmode', 'numeric');
            this.answerInput.setAttribute('pattern', '[0-9]*');
        }
    }

    bindEvents() {
        // 按钮事件绑定
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        this.submitBtn.addEventListener('click', () => this.checkAnswer());
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.reviewBtn.addEventListener('click', () => this.showReview());
        this.backToResultBtn.addEventListener('click', () => this.showResultScreen());

        // 移动端优化：虚拟键盘完成按钮
        this.answerInput.addEventListener('blur', () => {
            if (this.isMobile && this.answerInput.value) {
                setTimeout(() => this.checkAnswer(), 100);
            }
        });
    }

    startGame() {
        this.resetGame();
        this.showScreen('game-screen');
        this.startTime = new Date();
        
        // 移动端优化：延迟聚焦避免页面跳动
        setTimeout(() => {
            this.answerInput.focus();
            if (this.isMobile) {
                // 移动端自动弹出数字键盘
                this.answerInput.click();
            }
        }, 300);
        
        this.generateQuestion();
    }

    resetGame() {
        this.currentLevel = 1;
        this.currentQuestion = 0;
        this.score = 0;
        this.wrongAnswers = [];
        this.questionHistory = [];
        this.usedQuestions.clear();
        this.updateGameInfo();
    }

    generateQuestion() {
        this.currentQuestion++;
        this.updateGameInfo();
        
        let num1, num2, operator, answer;
        let questionString;
        let attempts = 0;
        
        do {
            // 根据关卡调整难度
            if (this.currentLevel <= 5) {
                // 1-5关：简单加法，数字范围10-50
                num1 = this.getRandomInt(10, 50);
                num2 = this.getRandomInt(10, 50);
                operator = '+';
                answer = num1 + num2;
            } else if (this.currentLevel <= 10) {
                // 6-10关：简单减法，结果为正数
                num1 = this.getRandomInt(20, 70);
                num2 = this.getRandomInt(10, num1 - 5);
                operator = '-';
                answer = num1 - num2;
            } else if (this.currentLevel <= 15) {
                // 11-15关：混合运算，数字范围扩大
                operator = Math.random() > 0.5 ? '+' : '-';
                if (operator === '+') {
                    num1 = this.getRandomInt(20, 80);
                    num2 = this.getRandomInt(20, 80);
                    answer = num1 + num2;
                } else {
                    num1 = this.getRandomInt(30, 100);
                    num2 = this.getRandomInt(10, num1 - 10);
                    answer = num1 - num2;
                }
            } else {
                // 16-20关：复杂运算，包含进位借位
                operator = Math.random() > 0.5 ? '+' : '-';
                if (operator === '+') {
                    num1 = this.getRandomInt(40, 99);
                    num2 = this.getRandomInt(10, 99 - num1);
                    answer = num1 + num2;
                } else {
                    num1 = this.getRandomInt(50, 100);
                    num2 = this.getRandomInt(20, num1 - 20);
                    answer = num1 - num2;
                }
            }
            
            questionString = `${num1} ${operator} ${num2} = ?`;
            attempts++;
        } while ((answer > 100 || answer < 0 || this.usedQuestions.has(questionString)) && attempts < 100);

        this.usedQuestions.add(questionString);
        this.currentQuestionData = { num1, num2, operator, answer, questionString };
        
        this.questionElement.textContent = questionString;
        this.answerInput.value = '';
        
        // 移动端优化：自动聚焦并弹出数字键盘
        setTimeout(() => {
            this.answerInput.focus();
            if (this.isMobile) {
                this.answerInput.click();
            }
        }, 300);
        
        this.feedbackElement.textContent = '';
        this.feedbackElement.className = 'feedback';
    }

    checkAnswer() {
        const userAnswer = parseInt(this.answerInput.value);
        
        if (isNaN(userAnswer)) {
            this.showFeedback('请输入有效数字！', 'wrong');
            return;
        }

        const isCorrect = userAnswer === this.currentQuestionData.answer;
        
        // 记录答题历史
        this.questionHistory.push({
            ...this.currentQuestionData,
            userAnswer,
            isCorrect,
            level: this.currentLevel
        });

        if (isCorrect) {
            this.score += 10;
            this.showFeedback('✓ 回答正确！', 'correct');
        } else {
            this.wrongAnswers.push({
                ...this.currentQuestionData,
                userAnswer
            });
            this.showFeedback(`✗ 回答错误！正确答案是：${this.currentQuestionData.answer}`, 'wrong');
        }

        this.updateGameInfo();

        setTimeout(() => {
            if (this.currentQuestion < 10) {
                this.generateQuestion();
            } else if (this.currentLevel < 20) {
                this.currentLevel++;
                this.currentQuestion = 0;
                this.generateQuestion();
            } else {
                this.endGame();
            }
        }, 1500);
    }

    showFeedback(message, className) {
        this.feedbackElement.textContent = message;
        this.feedbackElement.className = `feedback ${className}`;
    }

    updateGameInfo() {
        this.currentLevelElement.textContent = this.currentLevel;
        this.currentQuestionElement.textContent = this.currentQuestion;
        this.currentScoreElement.textContent = this.score;
    }

    endGame() {
        this.endTime = new Date();
        this.showScreen('result-screen');
        this.displayResults();
        this.analyzeWeakness();
    }

    displayResults() {
        const timeUsed = Math.round((this.endTime - this.startTime) / 1000);
        const accuracy = Math.round((this.questionHistory.filter(q => q.isCorrect).length / this.questionHistory.length) * 100);
        
        this.finalScoreElement.textContent = this.score;
        this.accuracyElement.textContent = `${accuracy}%`;
        this.timeUsedElement.textContent = timeUsed;
    }

    analyzeWeakness() {
        this.weaknessContent.innerHTML = '';
        
        if (this.wrongAnswers.length === 0) {
            this.weaknessContent.innerHTML = '<p class="weakness-item">🎉 太棒了！没有发现薄弱环节！</p>';
            return;
        }

        // 分析错误类型
        const additionErrors = this.wrongAnswers.filter(q => q.operator === '+');
        const subtractionErrors = this.wrongAnswers.filter(q => q.operator === '-');
        
        // 分析进位借位问题
        const carryErrors = additionErrors.filter(q => (q.num1 % 10) + (q.num2 % 10) >= 10);
        const borrowErrors = subtractionErrors.filter(q => (q.num1 % 10) < (q.num2 % 10));
        
        // 分析数字大小问题
        const largeNumberErrors = this.wrongAnswers.filter(q => q.num1 > 70 || q.num2 > 70);
        
        // 显示分析结果
        if (additionErrors.length > subtractionErrors.length) {
            this.addWeaknessItem('加法运算', `需要加强加法练习（${additionErrors.length}次错误）`);
        } else if (subtractionErrors.length > 0) {
            this.addWeaknessItem('减法运算', `需要加强减法练习（${subtractionErrors.length}次错误）`);
        }
        
        if (carryErrors.length > 0) {
            this.addWeaknessItem('进位加法', `需要练习进位加法（${carryErrors.length}次错误）`);
        }
        
        if (borrowErrors.length > 0) {
            this.addWeaknessItem('借位减法', `需要练习借位减法（${borrowErrors.length}次错误）`);
        }
        
        if (largeNumberErrors.length > 0) {
            this.addWeaknessItem('大数运算', `需要加强大数字运算能力（${largeNumberErrors.length}次错误）`);
        }
        
        // 显示最常见的错误题目
        const mostCommonError = this.findMostCommonError();
        if (mostCommonError) {
            this.addWeaknessItem('常见错误模式', `经常在 "${mostCommonError.questionString}" 这类题目上出错`);
        }
    }

    addWeaknessItem(title, description) {
        const item = document.createElement('div');
        item.className = 'weakness-item';
        item.innerHTML = `<strong>${title}:</strong> ${description}`;
        this.weaknessContent.appendChild(item);
    }

    findMostCommonError() {
        const errorCounts = {};
        this.wrongAnswers.forEach(error => {
            const key = `${error.num1}${error.operator}${error.num2}`;
            errorCounts[key] = (errorCounts[key] || 0) + 1;
        });
        
        const mostCommon = Object.entries(errorCounts).sort((a, b) => b[1] - a[1])[0];
        if (mostCommon) {
            const [key] = mostCommon;
            const match = key.match(/(\d+)([+-])(\d+)/);
            if (match) {
                return {
                    num1: parseInt(match[1]),
                    operator: match[2],
                    num2: parseInt(match[3]),
                    questionString: `${match[1]} ${match[2]} ${match[3]} = ?`
                };
            }
        }
        return null;
    }

    showReview() {
        this.showScreen('review-screen');
        this.reviewContent.innerHTML = '';
        
        if (this.wrongAnswers.length === 0) {
            this.reviewContent.innerHTML = '<p>没有错题需要回顾！</p>';
            return;
        }
        
        this.wrongAnswers.forEach((error, index) => {
            const item = document.createElement('div');
            item.className = 'review-item';
            item.innerHTML = `
                <div class="review-question">${error.questionString}</div>
                <div class="review-answer">你的答案: ${error.userAnswer} | 正确答案: ${error.answer}</div>
            `;
            this.reviewContent.appendChild(item);
        });
    }

    showResultScreen() {
        this.showScreen('result-screen');
    }

    restartGame() {
        // 清空已用题目集合，确保生成新题目
        this.usedQuestions.clear();
        this.startGame();
    }

    showScreen(screenName) {
        // 隐藏所有屏幕
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 显示指定屏幕
        document.getElementById(screenName).classList.add('active');
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new MathGame();
});