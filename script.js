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
    let timeLeft = 40; // 在這裡調整遊戲秒數
    let timerInterval;
    let currentMolecule = null;
    let combo = 0;
    let gameActive = false;

    // 定義分子屬性
    const molecules = [
        { name: 'starch', enzyme: 'amylase-btn', displayText: '大分子澱粉', smallShape: 'glucose', smallText: '葡萄糖', channel: '#glucose-channel' },
        { name: 'protein', enzyme: 'protease-btn', displayText: '大分子蛋白質', smallShape: 'amino-acid', smallText: '胺基酸', channel: '#amino-acid-channel' },
        { name: 'lipid', enzyme: 'lipase-btn', displayText: '大分子脂肪', smallShape: 'fatty-acid', smallText: '脂肪酸', channel: '#lipid-channel' }
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
        initialMessage.style.opacity = '1';
        gameOverModal.style.display = 'none';
        assessmentModal.style.display = 'none';
        
        clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 1000);
        
        // 確保遊戲區域已有分子被清除
        macromoleculeArea.innerHTML = ''; 
        macromoleculeArea.appendChild(initialMessage); // 把訊息放回正確位置

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
        if (currentMolecule && currentMolecule.element) {
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
            combo++;
            const points = 100 * combo;
            updateScore(points);
            showFeedback(`+${points}` + (combo > 1 ? ` COMBO x${combo}` : ''));
            
            const rect = currentMolecule.element.getBoundingClientRect();
            currentMolecule.element.classList.add('hit');
            
            showBreakdownTextEffect(rect, currentMolecule.smallText);
            createMicromoleculeShapes(rect, currentMolecule.smallShape, currentMolecule.channel);

            const moleculeToRemove = currentMolecule.element;
            currentMolecule = null; 
            setTimeout(() => moleculeToRemove.remove(), 500);
            setTimeout(spawnMolecule, 600);

        } else {
            combo = 0;
            currentMolecule.element.classList.add('miss');
            setTimeout(() => {
                if(currentMolecule && currentMolecule.element) {
                  currentMolecule.element.classList.remove('miss');
                }
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
    // 動畫 1: 閃現文字
    function showBreakdownTextEffect(startRect, text) {
        // === 修正點 ===
        // 取得參考容器的邊界
        const containerRect = macromoleculeArea.getBoundingClientRect(); 
        for (let i = 0; i < 7; i++) {
            const textEl = document.createElement('div');
            textEl.classList.add('breakdown-text-popup');
            textEl.textContent = text;
            const offsetX = Math.random() * 100 - 50;
            const offsetY = Math.random() * 100 - 50;
            // 計算相對於容器的位置
            textEl.style.left = `${startRect.left - containerRect.left + 60 + offsetX}px`;
            textEl.style.top = `${startRect.top - containerRect.top + 60 + offsetY}px`;
            macromoleculeArea.appendChild(textEl);
            setTimeout(() => textEl.remove(), 1000);
        }
    }
    
    // 動畫 2: 移動小分子圖案
    function createMicromoleculeShapes(startRect, shapeType, channelSelector) {
        // === 修正點 ===
        // 取得參考容器的邊界 (遊戲上部 + 整個遊戲區域)
        const containerRect = macromoleculeArea.getBoundingClientRect();
        const gameAreaRect = document.getElementById('game-area').getBoundingClientRect();
        const channelEl = document.querySelector(channelSelector);
        if (!channelEl) return;
        
        const channelRect = channelEl.getBoundingClientRect();
        // 終點位置需要相對於 #macromolecule-area 計算
        const endX = channelRect.left - containerRect.left + channelRect.width / 2;
        const endY = channelRect.top - containerRect.top + channelRect.height / 2;

        for (let i = 0; i < 5; i++) {
            const microEl = document.createElement('div');
            microEl.classList.add('micromolecule', shapeType);
            // 起點位置也需要相對於容器計算
            microEl.style.left = `${startRect.left - containerRect.left + 60 + Math.random() * 40 - 20}px`;
            microEl.style.top = `${startRect.top - containerRect.top + 60 + Math.random() * 40 - 20}px`;
            macromoleculeArea.appendChild(microEl);

            setTimeout(() => {
                microEl.style.transition = 'all 1s ease-in-out';
                microEl.style.left = `${endX + Math.random() * 20 - 10}px`;
                microEl.style.top = `${endY}px`;
                microEl.style.opacity = '0';
                microEl.style.transform = 'scale(0.5)';
            }, 100 * i);
            setTimeout(() => microEl.remove(), 1100 + 100 * i);
        }
    }
    
    // --- 評量區塊邏輯 (此區塊無變更) ---
    let assessmentState = { q1Correct: false, q2Correct: false };
    function setupAssessment() {
        const draggables = document.querySelectorAll('.draggable');
        const droptargets = document.querySelectorAll('.droptarget');
        let draggedItem = null;
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => { draggedItem = e.target; setTimeout(() => e.target.style.display = 'none', 0); });
            draggable.addEventListener('dragend', () => { setTimeout(() => { if(draggedItem) { draggedItem.style.display = 'block'; draggedItem = null;} }, 0); });
        });
        droptargets.forEach(droptarget => {
            droptarget.addEventListener('dragover', e => e.preventDefault());
            droptarget.addEventListener('dragenter', e => { e.preventDefault(); e.target.classList.add('over'); });
            droptarget.addEventListener('dragleave', e => e.target.classList.remove('over'));
            droptarget.addEventListener('drop', e => {
                e.target.classList.remove('over');
                if (draggedItem && e.target.dataset.match === draggedItem.id) {
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
        assessmentModal.style.display = 'none';
        startGame();
    });
    nextPageBtn.addEventListener('click', () => {
        if (!nextPageBtn.disabled) {
            alert("恭喜你！即將前往下一頁！(這裡是預留的連結位置)");
        }
    });

    // --- 遊戲自動開始 ---
    startGame();
});
