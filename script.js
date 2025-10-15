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

    // 更新：增加 displayText 和 smallText 屬性
    const molecules = [
        { name: 'starch', enzyme: 'amylase-btn', displayText: '大分子澱粉', smallText: '葡萄糖' },
        { name: 'protein', enzyme: 'protease-btn', displayText: '大分子蛋白質', smallText: '胺基酸' },
        { name: 'lipid', enzyme: 'lipase-btn', displayText: '大分子脂肪', smallText: '脂肪酸' }
    ];

    // --- 遊戲流程控制 ---
    function startGame() {
        // 重置狀態
        score = 0;
        timeLeft = 60;
        combo = 0;
        gameActive = true;
        updateScore(0);
        timerDisplay.textContent = `時間：${timeLeft}`;
        initialMessage.style.display = 'block';

        // 隱藏彈出視窗
        gameOverModal.style.display = 'none';
        assessmentModal.style.display = 'none';
        
        // 開始計時器
        timerInterval = setInterval(updateTimer, 1000);

        // 產生第一個分子
        setTimeout(spawnMolecule, 1000);
        
        // 為按鈕添加事件監聽
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

        // 短暫顯示分數後，自動跳到評量
        setTimeout(() => {
            gameOverModal.style.display = 'none';
            assessmentModal.style.display = 'flex';
            setupAssessment();
        }, 3000);
    }
    
    // --- 遊戲核心互動 ---
    function spawnMolecule() {
        if (!gameActive) return;
        
        // 清除舊的分子
        if (currentMolecule && currentMolecule.element) {
            currentMolecule.element.remove();
        }

        const moleculeData = molecules[Math.floor(Math.random() * molecules.length)];
        const moleculeEl = document.createElement('div');
        moleculeEl.classList.add('macromolecule', moleculeData.name);

        // 更新：新增文字標籤
        const textEl = document.createElement('span');
        textEl.classList.add('molecule-text');
        textEl.textContent = moleculeData.displayText;
        moleculeEl.appendChild(textEl);
        
        // 隨機定位
        const areaRect = macromoleculeArea.getBoundingClientRect();
        const x = Math.random() * (areaRect.width - 120); // 配合變大的分子調整
        const y = Math.random() * (areaRect.height - 160); // 留出下方空間
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
            
            // 觸發分解動畫
            const rect = currentMolecule.element.getBoundingClientRect();
            currentMolecule.element.classList.add('hit');
            // 更新：調用新的分解動畫函數
            showBreakdownEffect(rect.left, rect.top, currentMolecule.smallText);

            setTimeout(spawnMolecule, 500); // 延遲後產生新分子
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
    // 更新：全新的分解動畫函數
    function showBreakdownEffect(startX, startY, text) {
        const gameAreaRect = document.getElementById('game-area').getBoundingClientRect();

        // 產生多個文字彈出效果
        for (let i = 0; i < 7; i++) {
            const textEl = document.createElement('div');
            textEl.classList.add('breakdown-text-popup');
            textEl.textContent = text;
            
            // 在原大分子位置附近隨機散開
            const offsetX = Math.random() * 100 - 50;
            const offsetY = Math.random() * 100 - 50;
            
            // 計算絕對位置
            textEl.style.left = `${startX - gameAreaRect.left + 60 + offsetX}px`;
            textEl.style.top = `${startY - gameAreaRect.top + 60 + offsetY}px`;
            
            macromoleculeArea.appendChild(textEl);
            
            // 動畫結束後移除元素
            setTimeout(() => textEl.remove(), 1000);
        }
    }
    
    // --- 評量區塊邏輯 (此區塊無變更) ---
    let assessmentState = {
        q1Correct: false,
        q2Correct: false
    };

    function setupAssessment() {
        const draggables = document.querySelectorAll('.draggable');
        const droptargets = document.querySelectorAll('.droptarget');
        let draggedItem = null;

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                draggedItem = e.target;
                setTimeout(() => e.target.style.display = 'none', 0);
            });
            draggable.addEventListener('dragend', (e) => {
                setTimeout(() => {
                    draggedItem.style.display = 'block';
                    draggedItem = null;
                }, 0);
            });
        });

        droptargets.forEach(droptarget => {
            droptarget.addEventListener('dragover', e => e.preventDefault());
            droptarget.addEventListener('dragenter', e => {
                e.preventDefault();
                e.target.classList.add('over');
            });
            droptarget.addEventListener('dragleave', e => e.target.classList.remove('over'));
            droptarget.addEventListener('drop', e => {
                e.target.classList.remove('over');
                if (e.target.dataset.match === draggedItem.id) {
                    e.target.appendChild(draggedItem);
                    draggedItem.setAttribute('draggable', 'false');
                    e.target.classList.add('correct');
                    checkAssessmentCompletion();
                }
            });
        });

        const mcqForm = document.getElementById('mcq-question');
        mcqForm.addEventListener('change', checkAssessmentCompletion);
    }
    
    function checkAssessmentCompletion() {
        const correctDrops = document.querySelectorAll('.droptarget.correct').length;
        assessmentState.q1Correct = (correctDrops === 3);

        const selectedAnswer = document.querySelector('input[name="digestion-q"]:checked');
        assessmentState.q2Correct = (selectedAnswer && selectedAnswer.value === 'B');
        
        if (assessmentState.q1Correct && assessmentState.q2Correct) {
            document.getElementById('assessment-hint').style.display = 'none';
            nextPageBtn.disabled = false;
        }
    }
    
    // --- 導航按鈕 ---
    restartBtn.addEventListener('click', () => {
        window.location.reload();
    });

    nextPageBtn.addEventListener('click', () => {
        if (!nextPageBtn.disabled) {
            alert("恭喜你！即將前往下一頁！(這裡是預留的連結位置)");
            // window.location.href = '下一頁的網址';
        }
    });

    // --- 遊戲自動開始 ---
    startGame();
});
