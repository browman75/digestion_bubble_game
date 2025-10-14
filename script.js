document.addEventListener('DOMContentLoaded', () => {
    // --- 遊戲元素獲取 ---
    const gameContainer = document.getElementById('game-container');
    const macromoleculeZone = document.getElementById('macromolecule-zone');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const comboDisplay = document.getElementById('combo-display');
    const enzymeButtons = document.querySelectorAll('.enzyme-btn');
    
    const gameOverlay = document.getElementById('game-overlay');
    const popup = document.getElementById('popup');
    const popupTitle = document.getElementById('popup-title');
    const popupMessage = document.getElementById('popup-message');
    const startGameBtn = document.getElementById('start-game-btn');

    // --- 評量元素獲取 ---
    const assessmentSection = document.getElementById('assessment-section');
    const draggables = document.querySelectorAll('.draggable');
    const droptargets = document.querySelectorAll('.droptarget');
    const q1Feedback = document.getElementById('q1-feedback');
    const mcqOptions = document.querySelectorAll('input[name="digestion-q"]');
    const q2Feedback = document.getElementById('q2-feedback');
    const prevBtn = document.getElementById('prev-btn');
    const restartBtn = document.getElementById('restart-btn');
    const nextBtn = document.getElementById('next-btn');

    // --- 遊戲狀態變數 ---
    let timer;
    let timeLeft = 60;
    let score = 0;
    let combo = 0;
    let gameInterval;
    let isGameActive = false;

    // --- 評量狀態變數 ---
    let q1Correct = false;
    let q2Correct = false;
    let q1Pairs = 0;

    const MOLECULE_TYPES = {
        starch: { name: '澱粉', small: 'glucose', smallCount: 5, content: '🍬-🍬-🍬-🍬' },
        protein: { name: '蛋白質', small: 'amino-acid', smallCount: 4, content: '🍫-🍫-🍫' },
        lipid: { name: '脂質', small: 'fatty-acid', smallCount: 3, content: '🍯' }
    };

    // --- 遊戲核心功能 ---

    function initGame() {
        timeLeft = 60;
        score = 0;
        combo = 0;
        isGameActive = false;
        updateScore(0);
        updateTimer();
        comboDisplay.textContent = '';
        macromoleculeZone.innerHTML = '';
        gameOverlay.style.display = 'flex';
        popupTitle.textContent = '準備好了嗎？';
        popupMessage.innerHTML = '快使用正確的消化酵素，幫助細胞吸收養分吧！';
        startGameBtn.textContent = '開始遊戲';
        startGameBtn.onclick = startGame;
        assessmentSection.classList.add('hidden');
        gameContainer.style.filter = 'none';
        resetAssessment();
    }

    function startGame() {
        if (isGameActive) return;
        isGameActive = true;
        gameOverlay.style.display = 'none';
        
        timer = setInterval(() => {
            timeLeft--;
            updateTimer();
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
        
        spawnMacromolecule();
        gameInterval = setInterval(spawnMacromolecule, 3000);
    }

    function endGame() {
        isGameActive = false;
        clearInterval(timer);
        clearInterval(gameInterval);
        timeLeft = 0;
        updateTimer();

        gameOverlay.style.display = 'flex';
        popupTitle.textContent = '時間到！';
        popupMessage.innerHTML = `最終分數：${score}<br>${getScoreMessage(score)}`;
        startGameBtn.textContent = '再玩一次';
        startGameBtn.onclick = initGame;
        
        // 顯示評量區
        gameContainer.style.filter = 'blur(5px)';
        assessmentSection.classList.remove('hidden');
    }
    
    function updateTimer() {
        timerDisplay.textContent = `時間：${timeLeft} 秒`;
    }

    function updateScore(points) {
        score += points;
        scoreDisplay.textContent = `分數：${score}`;
    }

    function updateCombo(isCorrect) {
        if (isCorrect) {
            combo++;
            if (combo > 1) {
                comboDisplay.textContent = `Combo x${combo}!`;
            }
        } else {
            combo = 0;
            comboDisplay.textContent = '';
        }
    }
    
    function getScoreMessage(finalScore) {
        if (finalScore >= 1500) return "太厲害了！你是消化大師！";
        if (finalScore >= 800) return "不錯喔！細胞吸收到滿滿的養分了！";
        if (finalScore > 0) return "還不錯，再接再厲！";
        return "別灰心，再試一次吧！";
    }

    function spawnMacromolecule() {
        if (macromoleculeZone.childElementCount >= 3) return; // 限制畫面上的分子數量
        
        const types = Object.keys(MOLECULE_TYPES);
        const typeKey = types[Math.floor(Math.random() * types.length)];
        const moleculeInfo = MOLECULE_TYPES[typeKey];

        const el = document.createElement('div');
        el.classList.add('macromolecule', typeKey);
        el.dataset.type = typeKey;
        el.textContent = moleculeInfo.content;
        
        // 設定隨機位置
        el.style.top = `${Math.random() * 80}%`;
        el.style.left = `${Math.random() * 70}%`;
        
        macromoleculeZone.appendChild(el);
    }

    function handleEnzymeClick(e) {
        if (!isGameActive) return;
        const enzymeType = e.target.dataset.enzyme;
        const targetMolecule = macromoleculeZone.querySelector('.macromolecule'); // 簡化：只攻擊第一個

        if (!targetMolecule) return;

        const moleculeType = targetMolecule.dataset.type;
        const startRect = e.target.getBoundingClientRect();
        const targetRect = targetMolecule.getBoundingClientRect();

        // 建立 projectile
        createProjectile(startRect, targetRect, () => {
             if (enzymeType === moleculeType) {
                // 正確
                const points = 100 * (combo + 1);
                updateScore(points);
                updateCombo(true);
                showScorePopup(targetRect, `+${points}`);
                decomposeMolecule(targetMolecule);
            } else {
                // 錯誤
                updateCombo(false);
                // 播放 'ㄉㄨㄞ' 音效或動畫
            }
        });
    }
    
    function createProjectile(startRect, targetRect, onHit) {
        const projectile = document.createElement('div');
        projectile.className = 'projectile';
        gameContainer.appendChild(projectile);
        
        const gameRect = gameContainer.getBoundingClientRect();

        projectile.style.left = `${startRect.left - gameRect.left + startRect.width / 2}px`;
        projectile.style.top = `${startRect.top - gameRect.top + startRect.height / 2}px`;

        // 確保在下一幀更新目標位置以觸發 transition
        requestAnimationFrame(() => {
            projectile.style.left = `${targetRect.left - gameRect.left + targetRect.width / 2}px`;
            projectile.style.top = `${targetRect.top - gameRect.top + targetRect.height / 2}px`;
        });
        
        setTimeout(() => {
            projectile.remove();
            onHit();
        }, 500);
    }
    
    function showScorePopup(targetRect, text) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = text;
        gameContainer.appendChild(popup);
        
        const gameRect = gameContainer.getBoundingClientRect();
        popup.style.left = `${targetRect.left - gameRect.left}px`;
        popup.style.top = `${targetRect.top - gameRect.top}px`;

        setTimeout(() => popup.remove(), 1000);
    }

    function decomposeMolecule(moleculeEl) {
        const type = moleculeEl.dataset.type;
        const info = MOLECULE_TYPES[type];
        if (!info) return;

        const startRect = moleculeEl.getBoundingClientRect();
        const gameRect = gameContainer.getBoundingClientRect();

        // 目標通道
        let targetChannel;
        if (info.small === 'glucose') targetChannel = document.getElementById('glucose-channel');
        else if (info.small === 'amino-acid') targetChannel = document.getElementById('amino-acid-channel');
        else targetChannel = document.getElementById('lipid-membrane');

        const endRect = targetChannel.getBoundingClientRect();
        
        for (let i = 0; i < info.smallCount; i++) {
            const smallMolecule = document.createElement('div');
            smallMolecule.className = `small-molecule ${info.small}`;
            gameContainer.appendChild(smallMolecule);
            
            const startX = startRect.left - gameRect.left + Math.random() * startRect.width;
            const startY = startRect.top - gameRect.top + Math.random() * startRect.height;
            
            smallMolecule.style.left = `${startX}px`;
            smallMolecule.style.top = `${startY}px`;

            const endX = endRect.left - gameRect.left + endRect.width / 2;
            const endY = endRect.top - gameRect.top + endRect.height / 2;

            // 動態設定 CSS 變數給 keyframe
            smallMolecule.style.setProperty('--tx', `${endX - startX}px`);
            smallMolecule.style.setProperty('--ty', `${endY - startY}px`);
            
            setTimeout(() => smallMolecule.remove(), 1500);
        }
        
        moleculeEl.remove();
    }


    // --- 評量區邏輯 ---
    let draggedItem = null;

    draggables.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            setTimeout(() => e.target.style.display = 'none', 0);
        });
        item.addEventListener('dragend', (e) => {
            setTimeout(() => e.target.style.display = 'block', 0);
            draggedItem = null;
        });
    });

    droptargets.forEach(target => {
        target.addEventListener('dragover', (e) => {
            e.preventDefault();
            target.classList.add('over');
        });
        target.addEventListener('dragleave', () => {
            target.classList.remove('over');
        });
        target.addEventListener('drop', (e) => {
            e.preventDefault();
            target.classList.remove('over');
            
            const source = draggedItem.dataset.source;
            const targetType = target.dataset.target;
            
            let isMatch = false;
            if ( (source === 'starch' && targetType === 'glucose') ||
                 (source === 'protein' && targetType === 'amino-acid') ||
                 (source === 'lipid' && targetType === 'fatty-acid') ) {
                isMatch = true;
            }

            if (isMatch && !target.classList.contains('correct-match')) {
                target.appendChild(draggedItem);
                draggedItem.setAttribute('draggable', 'false');
                draggedItem.style.cursor = 'default';
                target.classList.add('correct-match');
                q1Pairs++;
                if (q1Pairs === 3) {
                    q1Correct = true;
                    q1Feedback.textContent = '配對完全正確！';
                    q1Feedback.className = 'feedback correct';
                    checkAllAssessment();
                }
            }
        });
    });
    
    mcqOptions.forEach(option => {
        option.addEventListener('change', () => {
            if (option.value === 'B') {
                q2Feedback.textContent = '回答正確！養分需要變小才能被細胞吸收。';
                q2Feedback.className = 'feedback correct';
                q2Correct = true;
            } else {
                q2Feedback.textContent = '回答錯誤，再想一想喔！';
                q2Feedback.className = 'feedback incorrect';
                q2Correct = false;
            }
            checkAllAssessment();
        });
    });
    
    function checkAllAssessment() {
        if (q1Correct && q2Correct) {
            nextBtn.disabled = false;
            nextBtn.classList.remove('disabled');
        } else {
            nextBtn.disabled = true;
            nextBtn.classList.add('disabled');
        }
    }
    
    function resetAssessment() {
        q1Correct = false;
        q2Correct = false;
        q1Pairs = 0;
        
        q1Feedback.textContent = '';
        q2Feedback.textContent = '';
        
        // 重置拖曳題
        const dragContainer = document.querySelector('.drag-column');
        draggables.forEach(d => {
            d.setAttribute('draggable', 'true');
            d.style.cursor = 'grab';
            dragContainer.appendChild(d);
        });
        droptargets.forEach(t => t.classList.remove('correct-match'));

        // 重置單選題
        mcqOptions.forEach(opt => opt.checked = false);
        
        checkAllAssessment();
    }
    
    // --- 按鈕事件監聽 ---
    enzymeButtons.forEach(button => button.addEventListener('click', handleEnzymeClick));
    restartBtn.addEventListener('click', initGame);
    nextBtn.addEventListener('click', () => {
        if (!nextBtn.disabled) {
            alert('恭喜你，即將前往下一頁！');
            // window.location.href = '下一頁的網址';
        }
    });

    // --- 初始啟動 ---
    initGame();
});
