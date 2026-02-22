(function () {
  'use strict';

  const COLS = 17;
  const ROWS = 10;
  const CELL_SIZE = 40;
  const TOTAL_TIME_MS = 2 * 60 * 1000; // 2분

  let grid = [];        // grid[row][col] = { value, element }
  let score = 0;
  let timerId = null;
  let remainingMs = TOTAL_TIME_MS;
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let dragCurrent = { x: 0, y: 0 };
  let gameEnded = false;
  let gameStarted = false;

  const board = document.getElementById('board');
  const boardWrap = document.getElementById('boardWrap');
  const selectionBox = document.getElementById('selectionBox');
  const scoreEl = document.getElementById('score');
  const timerBar = document.getElementById('timerBar');
  const timerText = document.getElementById('timerText');
  const btnStart = document.getElementById('btnStart');
  const btnReset = document.getElementById('btnReset');
  const btnRestart = document.getElementById('btnRestart');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const startOverlay = document.getElementById('startOverlay');
  const btnStartPage = document.getElementById('btnStartPage');
  const finalScoreEl = document.getElementById('finalScore');
  const lightColorsCheck = document.getElementById('lightColors');
  const bgmCheck = document.getElementById('bgm');

  function getBoardRect() {
    return boardWrap.getBoundingClientRect();
  }

  function pixelToCell(clientX, clientY) {
    const rect = getBoardRect();
    const col = Math.floor((clientX - rect.left) / CELL_SIZE);
    const row = Math.floor((clientY - rect.top) / CELL_SIZE);
    return {
      col: Math.max(0, Math.min(COLS - 1, col)),
      row: Math.max(0, Math.min(ROWS - 1, row))
    };
  }

  const APPLE_IMG_PATH = 'apple.png';

  function createAppleIcon() {
    const img = document.createElement('img');
    img.src = APPLE_IMG_PATH;
    img.alt = '';
    img.setAttribute('class', 'apple-icon');
    return img;
  }

  function createGrid() {
    grid = [];
    board.innerHTML = '';
    for (let row = 0; row < ROWS; row++) {
      grid[row] = [];
      for (let col = 0; col < COLS; col++) {
        const value = Math.floor(Math.random() * 9) + 1;
        const el = document.createElement('div');
        el.className = 'apple';
        el.dataset.row = row;
        el.dataset.col = col;
        el.appendChild(createAppleIcon());
        const num = document.createElement('span');
        num.className = 'apple-num';
        num.textContent = value;
        el.appendChild(num);
        grid[row][col] = { value, element: el };
        board.appendChild(el);
      }
    }
  }

  function getCellsInSelection(startCell, currentCell) {
    const c0 = Math.min(startCell.col, currentCell.col);
    const c1 = Math.max(startCell.col, currentCell.col);
    const r0 = Math.min(startCell.row, currentCell.row);
    const r1 = Math.max(startCell.row, currentCell.row);
    const cells = [];
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (grid[r] && grid[r][c] && !grid[r][c].element.classList.contains('removed')) {
          cells.push({ row: r, col: c, value: grid[r][c].value });
        }
      }
    }
    return cells;
  }

  function sumCells(cells) {
    return cells.reduce((s, c) => s + c.value, 0);
  }

  function updateSelectionBox(startCell, currentCell, isValid) {
    const c0 = Math.min(startCell.col, currentCell.col);
    const c1 = Math.max(startCell.col, currentCell.col);
    const r0 = Math.min(startCell.row, currentCell.row);
    const r1 = Math.max(startCell.row, currentCell.row);
    selectionBox.style.left = c0 * CELL_SIZE + 'px';
    selectionBox.style.top = r0 * CELL_SIZE + 'px';
    selectionBox.style.width = (c1 - c0 + 1) * CELL_SIZE + 'px';
    selectionBox.style.height = (r1 - r0 + 1) * CELL_SIZE + 'px';
    selectionBox.style.display = 'block';
    selectionBox.classList.toggle('valid', isValid);
  }

  function clearSelectionHighlight() {
    board.querySelectorAll('.apple.selected, .apple.valid').forEach(el => {
      el.classList.remove('selected', 'valid');
    });
    selectionBox.style.display = 'none';
    selectionBox.classList.remove('valid');
  }

  function highlightSelection(cells, isValid) {
    clearSelectionHighlight();
    cells.forEach(({ row, col }) => {
      const el = grid[row][col].element;
      if (!el.classList.contains('removed')) {
        el.classList.add(isValid ? 'valid' : 'selected');
      }
    });
  }

  function removeApples(cells) {
    let points = 0;
    cells.forEach(({ row, col }) => {
      const data = grid[row][col];
      if (data && data.element && !data.element.classList.contains('removed')) {
        const el = data.element;
        const angle = Math.random() * Math.PI * 2;
        const dist = 55 + Math.random() * 45;
        const tx = Math.cos(angle) * dist;
        const ty = -Math.abs(Math.sin(angle)) * dist - 15;
        el.style.setProperty('--fly-x', tx + 'px');
        el.style.setProperty('--fly-y', ty + 'px');
        el.classList.add('removed');
        points += 1;
      }
    });
    return points;
  }

  function updateScore(delta) {
    score += delta;
    scoreEl.textContent = score;
  }

  function startTimer() {
    if (timerId) clearInterval(timerId);
    remainingMs = TOTAL_TIME_MS;
    gameEnded = false;
    gameStarted = true;
    btnStart.disabled = true;
    updateTimerDisplay();
    timerId = setInterval(() => {
      remainingMs -= 100;
      if (remainingMs <= 0) {
        remainingMs = 0;
        clearInterval(timerId);
        timerId = null;
        endGame();
      }
      updateTimerDisplay();
    }, 100);
  }

  function updateTimerDisplay() {
    const sec = Math.ceil(remainingMs / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    timerText.textContent = min + ':' + (s < 10 ? '0' : '') + s;
    const pct = (remainingMs / TOTAL_TIME_MS) * 100;
    timerBar.style.height = pct + '%';
  }

  function endGame() {
    gameEnded = true;
    finalScoreEl.textContent = score;
    gameOverOverlay.classList.add('show');
  }

  function resetGame() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    score = 0;
    scoreEl.textContent = '0';
    gameStarted = false;
    gameEnded = false;
    btnStart.disabled = false;
    remainingMs = TOTAL_TIME_MS;
    updateTimerDisplay();
    gameOverOverlay.classList.remove('show');
    createGrid();
    clearSelectionHighlight();
  }

  function onPointerDown(e) {
    if (!gameStarted || gameEnded) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    const cell = pixelToCell(clientX, clientY);
    isDragging = true;
    dragStart = { ...cell };
    dragCurrent = { ...cell };
    const cells = getCellsInSelection(dragStart, dragCurrent);
    const sum = sumCells(cells);
    const valid = sum === 10;
    updateSelectionBox(dragStart, dragCurrent, valid);
    highlightSelection(cells, valid);
  }

  function onPointerMove(e) {
    if (!isDragging || gameEnded) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    dragCurrent = pixelToCell(clientX, clientY);
    const cells = getCellsInSelection(dragStart, dragCurrent);
    const sum = sumCells(cells);
    const valid = sum === 10;
    updateSelectionBox(dragStart, dragCurrent, valid);
    highlightSelection(cells, valid);
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    const cells = getCellsInSelection(dragStart, dragCurrent);
    const sum = sumCells(cells);
    if (sum === 10 && cells.length > 0) {
      const points = removeApples(cells);
      updateScore(points);
    }
    clearSelectionHighlight();
  }

  boardWrap.addEventListener('mousedown', onPointerDown);
  boardWrap.addEventListener('mousemove', onPointerMove);
  boardWrap.addEventListener('mouseup', onPointerUp);
  boardWrap.addEventListener('mouseleave', onPointerUp);

  boardWrap.addEventListener('touchstart', (e) => {
    e.preventDefault();
    onPointerDown(e);
  }, { passive: false });
  boardWrap.addEventListener('touchmove', (e) => {
    e.preventDefault();
    onPointerMove(e);
  }, { passive: false });
  boardWrap.addEventListener('touchend', (e) => {
    e.preventDefault();
    onPointerUp(e);
  }, { passive: false });

  btnStart.addEventListener('click', function () {
    if (!gameStarted) startTimer();
  });
  btnReset.addEventListener('click', resetGame);
  btnRestart.addEventListener('click', function () {
    resetGame();
    startTimer();
  });
  btnStartPage.addEventListener('click', function () {
    startOverlay.classList.add('hidden');
  });

  lightColorsCheck.addEventListener('change', function () {
    document.body.classList.toggle('light-colors', this.checked);
  });

  bgmCheck.addEventListener('change', function () {
    // BGM은 추후 오디오 소스 연동 가능
    console.log('BGM', this.checked ? 'on' : 'off');
  });

  createGrid();
  updateTimerDisplay();
  clearSelectionHighlight();
})();
