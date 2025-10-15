document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 元素獲取 ---
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const macromoleculeArea = document.getElementById('macromolecule-area');
    const enzymeButtons = document.querySelectorAll('.enzyme-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const assessmentModal = document.getElementById('assessment-modal');
    const finalScoreText = document.getElementById('final-score-text');
    const finalComment = document.getElementById('final-comment');
    const nextPageBtn = document.getElementById('next-page-btn');
    const restartBtn = document.getElementById('restart-btn');
    const feedbackArea = document.getElementById('feedback-area');
    const initialMessage = document.getElementById('initial-message');

    // --- 遊戲狀態變數 ---
    let score = 0;
    let timeLeft = 40;
    let timerInterval;
    let currentMolecule = null;
    let combo = 0;
    let gameActive = false;

    // 更新：將 small (圖案class) 和 channel (通道ID) 加回來
    const molecules = [
        { name: 'starch', enzyme: 'amylase-btn', displayText: '大分子澱粉', small: 'glucose', smallText: '葡萄糖', channel: '#glucose-channel' },
        { name: 'protein', enzyme: 'protease-btn', displayText: '大分子蛋白質', small: 'amino-acid', smallText: '胺基酸', channel: '#amino-acid-channel' },
        { name: 'lipid', enzyme: 'lipase-btn', displayText: '大分子脂肪', small: 'fatty-acid', smallText: '脂肪酸', channel: '#lipid-channel' }
    ];

    // --- 遊戲流程控制 ---
    function startGame() {
        score = 0;
        timeLeft = 40;
        combo = 0;
        gameActive = true;
        updateScore(0);
        timerDisplay.textContent = `時間：${timeLeft}`;
        initialMessage.style.display = 'block';
        gameOverModal.style.display = 'none';
        assessmentModal.style.display = 'none';
        timerInterval = setInterval(updateTimer, 1000);
        setTimeout(spawnMolecule, 1000);
        enzymeButtons.forEach(button => {
            button.onclick = (e) => handleEnzymeClick(e.target.id);
        });
    }

    function updateTimer() {
        timeLeft--;
        timerDisplay.textContent = `時間：${timeLeft}`;
        if (timeLeft <= 0) {
            endGame();
        }
    }

    function endGame() {
        clearInterval(timerInterval);
        gameActive = false;
        if (currentMolecule) {
            currentMolecule.element.remove();
            currentMolecule = null;
        }
        finalScoreText.textContent = `你的最終分數是：${score}`;
        if (score > 2000) {
            finalComment.textContent = "太厲害了！你是消化大師！";
        } else if (score > 1000) {
            finalComment.textContent = "不錯喔！細胞吸收到滿滿的養分了！";
        } else {
            finalComment.textContent = "再接再厲！為細胞補充更多能量吧！";
        }
        gameOverModal.style.display = 'flex';
        setTimeout(() => {
            gameOverModal.style.display = 'none';
            assessmentModal.style.display = 'flex';
            setupAssessment();
        }, 3000);
    }
    
    // --- 遊戲核心互動 ---
    function spawnMolecule() {
        if (!gameActive) return;
        if (currentMolecule && currentMolecule.element) {
            currentMolecule.element.remove();
        }
        const moleculeData = molecules[Math.floor(Math.random() * molecules.length)];
        const moleculeEl = document.createElement('div');
        moleculeEl.classList.add('macromolecule', moleculeData.name);
        const textEl = document.createElement('span');
        textEl.classList.add('molecule-text');
        textEl.textContent = moleculeData.displayText;
        moleculeEl.appendChild(textEl);
        const areaRect = macromoleculeArea.getBoundingClientRect();
        const x = Math.random() * (areaRect.width - 120);
        const y = Math.random() * (areaRect.height - 160);
        moleculeEl.style.left = `${x}px`;
        moleculeEl.style.top = `${y}px`;
        macromoleculeArea.appendChild(moleculeEl);
        currentMolecule = { ...moleculeData, element: moleculeEl };
    }

    function handleEnzymeClick(buttonId) {
        if (!gameActive || !currentMolecule) return;

        if (buttonId === currentMolecule.enzyme) {
            // 答對
            combo++;
            const points = 100 * combo;
            updateScore(points);
            showFeedback(`+${points}` + (combo > 1 ? ` COMBO x${combo}` : ''));
            
            const rect = currentMolecule.element.getBoundingClientRect();
            currentMolecule.element.classList.add('hit');
            
            // 更新：同時呼叫兩種分解動畫！
            showBreakdownEffect(rect.left, rect.top, currentMolecule.smallText); // 1. 閃現文字
            createMicromolecules(rect.left, rect.top, currentMolecule.small, currentMolecule.channel); // 2. 移動小分子

            setTimeout(spawnMolecule, 500);
        } else {
            // 答錯
            combo = 0;
            currentMolecule.element.classList.add('miss');
            setTimeout(() => {
                if(currentMolecule) currentMolecule.element.classList.remove('miss');
            }, 300);
        }
    }
    
    // --- 分數與視覺回饋 ---
    function updateScore(points) {
        score += points;
        scoreDisplay.textContent = `分數：${score}`;
    }

    function showFeedback(text) {
        const feedbackEl = document.createElement('div');
        feedbackEl.classList.add('score-popup');
        feedbackEl.textContent = text;
        feedbackArea.appendChild(feedbackEl);
        setTimeout(() => feedbackEl.remove(), 1000);
    }

    // --- 動畫效果 ---
    // 函數 1: 閃現文字 (保留)
    function showBreakdownEffect(startX, startY, text) {
        const gameAreaRect = document.getElementById('game-area').getBoundingClientRect();
        for (let i = 0; i < 7; i++) {
            const textEl = document.createElement('div');
            textEl.classList.add('breakdown-text-popup');
            textEl.textContent = text;
            const offsetX = Math.random() * 100 - 50;
            const offsetY = Math.random() * 100 - 50;
            textEl.style.left = `${startX - gameAreaRect.left + 60 + offsetX}px`;
            textEl.style.top = `${startY - gameAreaRect.top + 60 + offsetY}px`;
            macromoleculeArea.appendChild(textEl);
            setTimeout(() => textEl.remove(), 1000);
        }
    }
    
    // 函數 2: 移動小分子 (恢復)
    function createMicromolecules(startX, startY
