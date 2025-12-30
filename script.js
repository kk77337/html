// 游戏状态
let gameState = {
    isPlaying: false,
    score: 0,
    bestScore: 0,
    reactionTimes: [],
    currentTarget: null,
    timeoutId: null,
    startTime: null
};

// DOM 元素
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const targetButton = document.getElementById('targetButton');
const gameBoard = document.getElementById('gameBoard');
const waitingMessage = document.getElementById('waitingMessage');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('bestScore');
const avgReactionDisplay = document.getElementById('avgReaction');
const difficultySelect = document.getElementById('difficulty');
const historyList = document.getElementById('historyList');

// 难度配置
const difficultyConfig = {
    easy: { delay: 3000, name: '简单' },
    medium: { delay: 2000, name: '中等' },
    hard: { delay: 1000, name: '困难' },
    extreme: { delay: 500, name: '极限' }
};

// 初始化
function init() {
    // 从本地存储加载最佳记录
    const savedBestScore = localStorage.getItem('bestScore');
    if (savedBestScore) {
        gameState.bestScore = parseInt(savedBestScore);
        bestScoreDisplay.textContent = gameState.bestScore;
    }

    // 事件监听
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    targetButton.addEventListener('click', handleTargetClick);
    difficultySelect.addEventListener('change', updateDifficulty);

    // 初始状态
    updateDisplay();
}

// 开始游戏
function startGame() {
    if (gameState.isPlaying) return;

    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.reactionTimes = [];
    historyList.innerHTML = '';

    startBtn.textContent = '游戏中...';
    startBtn.disabled = true;
    waitingMessage.style.display = 'block';
    targetButton.style.display = 'none';

    updateDisplay();
    scheduleNextTarget();
}

// 安排下一个目标出现
function scheduleNextTarget() {
    if (!gameState.isPlaying) return;

    const difficulty = difficultySelect.value;
    const delay = difficultyConfig[difficulty].delay;
    
    // 随机延迟，增加挑战性
    const randomDelay = delay + Math.random() * 1000 - 500;
    const actualDelay = Math.max(500, randomDelay);

    waitingMessage.style.display = 'block';
    targetButton.style.display = 'none';

    gameState.timeoutId = setTimeout(() => {
        showTarget();
    }, actualDelay);
}

// 显示目标
function showTarget() {
    if (!gameState.isPlaying) return;

    waitingMessage.style.display = 'none';
    targetButton.style.display = 'block';

    // 随机位置
    const boardRect = gameBoard.getBoundingClientRect();
    const buttonSize = 100;
    const maxX = boardRect.width - buttonSize - 20;
    const maxY = boardRect.height - buttonSize - 20;

    const randomX = Math.random() * maxX + 10;
    const randomY = Math.random() * maxY + 10;

    targetButton.style.left = randomX + 'px';
    targetButton.style.top = randomY + 'px';

    // 记录出现时间
    gameState.startTime = Date.now();

    // 随机颜色
    const colors = [
        '#f5576c',
        '#4facfe',
        '#43e97b',
        '#fa709a',
        '#30cfd0'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    targetButton.style.background = randomColor;
}

// 处理目标点击
function handleTargetClick() {
    if (!gameState.isPlaying || !gameState.startTime) return;

    const reactionTime = Date.now() - gameState.startTime;
    gameState.reactionTimes.push(reactionTime);
    gameState.score++;

    // 更新最佳记录
    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        localStorage.setItem('bestScore', gameState.bestScore.toString());
    }

    // 添加到历史记录
    addToHistory(reactionTime);

    // 更新显示
    updateDisplay();

    // 隐藏目标
    targetButton.style.display = 'none';
    waitingMessage.style.display = 'block';

    // 安排下一个目标
    setTimeout(() => {
        scheduleNextTarget();
    }, 500);
}

// 添加到历史记录
function addToHistory(reactionTime) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'time';
    timeSpan.textContent = `第 ${gameState.score} 次`;

    const resultSpan = document.createElement('span');
    resultSpan.className = 'result';
    
    let resultText = `${reactionTime}ms`;
    let resultClass = '';
    
    if (reactionTime < 200) {
        resultText += ' ⚡ 极快！';
        resultClass = 'excellent';
    } else if (reactionTime < 300) {
        resultText += ' 🎯 很快！';
        resultClass = 'good';
    } else if (reactionTime < 500) {
        resultText += ' 👍 不错';
        resultClass = 'ok';
    } else {
        resultText += ' 💪 继续努力';
        resultClass = 'slow';
    }

    resultSpan.textContent = resultText;
    historyItem.appendChild(timeSpan);
    historyItem.appendChild(resultSpan);
    historyList.insertBefore(historyItem, historyList.firstChild);

    // 限制历史记录数量
    while (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
    }
}

// 更新显示
function updateDisplay() {
    scoreDisplay.textContent = gameState.score;
    bestScoreDisplay.textContent = gameState.bestScore;

    if (gameState.reactionTimes.length > 0) {
        const avg = Math.round(
            gameState.reactionTimes.reduce((a, b) => a + b, 0) / gameState.reactionTimes.length
        );
        avgReactionDisplay.textContent = avg + 'ms';
    } else {
        avgReactionDisplay.textContent = '-';
    }
}

// 重置游戏
function resetGame() {
    gameState.isPlaying = false;
    gameState.score = 0;
    gameState.reactionTimes = [];
    gameState.startTime = null;

    if (gameState.timeoutId) {
        clearTimeout(gameState.timeoutId);
        gameState.timeoutId = null;
    }

    startBtn.textContent = '开始游戏';
    startBtn.disabled = false;
    waitingMessage.style.display = 'block';
    targetButton.style.display = 'none';
    historyList.innerHTML = '';

    updateDisplay();
}

// 更新难度
function updateDifficulty() {
    if (gameState.isPlaying) {
        resetGame();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

