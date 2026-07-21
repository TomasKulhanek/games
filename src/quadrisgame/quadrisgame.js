import { customElement, bindable } from 'aurelia';

// ---------------------------------------------------------------------------
// Piece definitions (each piece: color + array of square rotation matrices).
// Most pieces use 4×4 matrices; larger pieces (e.g. the L-pentomino) use a
// 5×5 matrix. All game logic iterates over the actual matrix dimensions, so
// pieces are not restricted to a fixed size.
// ---------------------------------------------------------------------------
const TETROMINOES = [
  { // I
    color: '#0e7490',
    shapes: [
      [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
      [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
      [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
      [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
    ]
  },
  { // O
    color: '#b45309',
    shapes: [
      [[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]],
      [[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]],
      [[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]],
      [[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]],
    ]
  },
  { // T
    color: '#7e22ce',
    shapes: [
      [[0,0,0,0],[0,1,1,1],[0,0,1,0],[0,0,0,0]],
      [[0,0,1,0],[0,1,1,0],[0,0,1,0],[0,0,0,0]],
      [[0,0,1,0],[0,1,1,1],[0,0,0,0],[0,0,0,0]],
      [[0,0,1,0],[0,0,1,1],[0,0,1,0],[0,0,0,0]],
    ]
  },
  { // S
    color: '#15803d',
    shapes: [
      [[0,0,0,0],[0,0,1,1],[0,1,1,0],[0,0,0,0]],
      [[0,0,1,0],[0,0,1,1],[0,0,0,1],[0,0,0,0]],
      [[0,0,0,0],[0,0,1,1],[0,1,1,0],[0,0,0,0]],
      [[0,0,1,0],[0,0,1,1],[0,0,0,1],[0,0,0,0]],
    ]
  },
  { // Z
    color: '#b91c1c',
    shapes: [
      [[0,0,0,0],[0,1,1,0],[0,0,1,1],[0,0,0,0]],
      [[0,0,0,1],[0,0,1,1],[0,0,1,0],[0,0,0,0]],
      [[0,0,0,0],[0,1,1,0],[0,0,1,1],[0,0,0,0]],
      [[0,0,0,1],[0,0,1,1],[0,0,1,0],[0,0,0,0]],
    ]
  },
  { // J
    color: '#1d4ed8',
    shapes: [
      [[0,0,0,0],[0,1,1,1],[0,0,0,1],[0,0,0,0]],
      [[0,0,1,1],[0,0,1,0],[0,0,1,0],[0,0,0,0]],
      [[0,1,0,0],[0,1,1,1],[0,0,0,0],[0,0,0,0]],
      [[0,0,1,0],[0,0,1,0],[0,1,1,0],[0,0,0,0]],
    ]
  },
  { // L
    color: '#c2410c',
    shapes: [
      [[0,0,0,0],[0,1,1,1],[0,1,0,0],[0,0,0,0]],
      [[0,0,1,0],[0,0,1,0],[0,0,1,1],[0,0,0,0]],
      [[0,0,0,1],[0,1,1,1],[0,0,0,0],[0,0,0,0]],
      [[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0]],
    ]
  },
  { // L5 - L-shaped pentomino: long side is 4 cells + 1 foot (5 cells total)
    color: '#c2410c', // paired with L
    shapes: [
      [[0,0,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,1,0,0]],
      [[0,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
      [[0,0,1,1,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,0,0]],
      [[0,0,0,0,0],[0,0,0,0,1],[0,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0]],
    ]
  },
  { // I5 - straight pentomino: a bar of 5 cells
    color: '#1d4ed8', // paired with J
    shapes: [
      [[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0]],
      [[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
      [[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0]],
      [[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    ]
  },
  { // S5 - S-shaped pentomino (5 cells)
    color: '#15803d', // paired with S
    shapes: [
      [[0,0,0,0,0],
       [0,1,1,1,0],
       [0,0,0,1,1],
       [0,0,0,0,0],
       [0,0,0,0,0]],
      [[0,0,0,1,0],
       [0,0,0,1,0],
       [0,0,1,1,0],
       [0,0,1,0,0],
       [0,0,0,0,0]],
      [[0,0,0,0,0],
       [0,0,0,0,0],
       [0,1,1,0,0],
       [0,0,1,1,1],
       [0,0,0,0,0]],
      [[0,0,0,0,0],
       [0,0,1,0,0],
       [0,1,1,0,0],
       [0,1,0,0,0],
       [0,1,0,0,0]],
    ]
  },
  { // Z5 - Z-shaped pentomino (5 cells)
    color: '#b91c1c', // paired with Z
    shapes: [
      [[0,0,0,0,0],
       [0,1,1,1,0],
       [1,1,0,0,0],
       [0,0,0,0,0],
       [0,0,0,0,0]],
      [[0,0,0,0,0],
       [0,1,0,0,0],
       [0,1,1,0,0],
       [0,0,1,0,0],
       [0,0,1,0,0]],
      [[0,0,0,0,0],
       [0,0,1,1,0],
       [1,1,1,0,0],
       [0,0,0,0,0],
       [0,0,0,0,0]],
      [[0,1,0,0,0],
       [0,1,0,0,0],
       [0,1,1,0,0],
       [0,0,1,0,0],
       [0,0,0,0,0]],
      
    ]
  },
  { // q
    color: '#b45309', // paired with O
    shapes: [
      [[0,0,0,0],
       [0,1,1,0],
       [1,1,1,0],
       [0,0,0,0]],
      [[0,1,0,0],
       [0,1,1,0],
       [0,1,1,0],
       [0,0,0,0]],
      [[0,0,0,0],
       [0,1,1,1],
       [0,1,1,0],
       [0,0,0,0]],
      [[0,0,0,0],
       [0,1,1,0],
       [0,1,1,0],
       [0,0,1,0]],            
    ]
  },
  { // p
    color: '#7e22ce', // paired with T
    shapes: [
      [[0,0,0,0],
       [1,1,1,0],
       [0,1,1,0],
       [0,0,0,0]],
      [[0,0,1,0],
       [0,1,1,0],
       [0,1,1,0],
       [0,0,0,0]],
      [[0,0,0,0],
       [0,1,1,0],
       [0,1,1,1],
       [0,0,0,0]],
      [[0,0,0,0],
       [0,1,1,0],
       [0,1,1,0],
       [0,1,0,0]],            
    ]
  },
  
];

const ROWS = 20;
const DEFAULT_COLS = 10;
const MIN_COLS = 6;
const NEXT_PREVIEW_CELLS = 4;
const FLASH_DURATION_MS = 350;   // how long full rows flash white before clearing
const FALL_ROWS_PER_SEC = 30;    // gravity animation speed for surviving blocks

function randomTetromino() {
  return TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
}

@customElement('dbs-quadrisgame')
export class Quadrisgame {
  // Aurelia refs bound via ref="..."
  containerEl = null;
  boardCanvas = null;
  nextCanvas = null;
  sidePanelEl = null;

  // observable state (bound in template)
  mode = 'intro'; // 'intro' | 'playing' | 'gameover'
  score = 0;
  level = 1;

  // internal game state (not bound)
  _board = null;
  _current = null;     // { tetromino, rotation, x, y }
  _next = null;        // tetromino
  _cols = DEFAULT_COLS; // dynamic board width in cells
  _cellSize = 0;
  _animId = null;
  _dropInterval = 800; // ms
  _lastDrop = 0;
  _keyHandler = null;
  _touchHandlers = null; // { board, boardStart, boardMove, boardEnd, side, sideTap }
  _resizeObserver = null;
  _resizeTimeout = null;

  // line-clear animation state
  _phase = 'active';   // 'active' | 'flash' | 'falling'
  _fullRows = [];      // full rows detected in the current clear step
  _clearSet = null;    // Set of "r,c" keys for every cell being cleared (rows + colour matches)
  _pendingClearValue = 0; // score value (rows + exploded cells) awaiting the falling settle
  _flashStart = 0;
  _fallingCells = [];  // [{ col, color, y (float row), targetRow }]
  _lastFall = 0;
  _cascade = 1;        // current chain step (1 = first clear, grows per cascade)

  // ---------- lifecycle ----------------------------------------------------

  attached() {
    this._setupResizeObserver();
  }

  detaching() {
    this._stopGame();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this._resizeTimeout) {
      clearTimeout(this._resizeTimeout);
      this._resizeTimeout = null;
    }
  }

  // ---------- resize handling ----------------------------------------------

  _setupResizeObserver() {
    this._resizeObserver = new ResizeObserver(() => {
      // Debounce resize to avoid thrashing
      if (this._resizeTimeout) clearTimeout(this._resizeTimeout);
      this._resizeTimeout = setTimeout(() => {
        this._onResize();
      }, 150);
    });
    this._resizeObserver.observe(this.containerEl);
  }

  _onResize() {
    // Resize only has an effect in intro (mode 1) and game over (mode 3),
    // which are pure CSS-driven layouts and adapt automatically.
    // During play (mode 2) resize is ignored so the game is not interrupted.
  }

  // ---------- public actions -----------------------------------------------

  startGame() {
    this.score = 0;
    this.level = 1;
    this._dropInterval = 800;
    this.mode = 'playing';

    // Wait for Aurelia to render the canvas elements
    setTimeout(() => {
      this._initCanvases();
      this._board = this._emptyBoard();
      this._phase = 'active';
      this._fullRows = [];
      this._clearSet = null;
      this._pendingClearValue = 0;
      this._fallingCells = [];
      this._cascade = 1;
      this._next = randomTetromino();
      this._spawnPiece();
      this._bindKeys();
      this._bindTouch();
      this._lastDrop = performance.now();
      this._loop(performance.now());
    }, 0);
  }

  goToIntro() {
    this._stopGame();
    this.mode = 'intro';
    this.score = 0;
    this.level = 1;
  }

  // ---------- canvas setup -------------------------------------------------

  _initCanvases() {
    const containerW = this.containerEl.clientWidth;
    const containerH = this.containerEl.clientHeight;

    // Reserve space on the right for the side panel (score/level/next/help)
    // and for the container padding.
    const sidePanelW = 110;
    const gap = 16;
    const padding = 12;
    const availW = containerW - sidePanelW - gap - padding * 2;
    const availH = containerH - padding * 2;

    // Cell size is determined by the fixed number of rows (board height).
    this._cellSize = Math.max(8, Math.floor(availH / ROWS));

    // Board width (columns) is recomputed to fill the available width
    // after reserving space for the side panel.
    this._cols = Math.max(MIN_COLS, Math.floor(availW / this._cellSize));

    const bw = this._cellSize * this._cols;
    const bh = this._cellSize * ROWS;

    this.boardCanvas.width = bw;
    this.boardCanvas.height = bh;

    const nextCellSize = this._cellSize;
    this.nextCanvas.width = nextCellSize * NEXT_PREVIEW_CELLS;
    this.nextCanvas.height = nextCellSize * NEXT_PREVIEW_CELLS;
  }

  // ---------- board helpers ------------------------------------------------

  _emptyBoard() {
    return Array.from({ length: ROWS }, () => Array(this._cols).fill(null));
  }

  _spawnPiece() {
    const tetromino = this._next;
    this._next = randomTetromino();
    this._current = {
      tetromino,
      rotation: 0,
      x: Math.floor(this._cols / 2) - 2,
      y: 0,
    };
    // Game over check
    if (!this._canPlace(this._current)) {
      this._gameOver();
    }
  }

  _shape(piece) {
    return piece.tetromino.shapes[piece.rotation];
  }

  _canPlace(piece, dx = 0, dy = 0, rotation = piece.rotation) {
    const shape = piece.tetromino.shapes[rotation];
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (!shape[row][col]) continue;
        const nx = piece.x + col + dx;
        const ny = piece.y + row + dy;
        if (nx < 0 || nx >= this._cols || ny >= ROWS) return false;
        if (ny < 0) continue; // above board is ok during spawn
        if (this._board[ny][nx]) return false;
      }
    }
    return true;
  }

  _lockPiece() {
    const piece = this._current;
    const shape = this._shape(piece);
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (!shape[row][col]) continue;
        const nx = piece.x + col;
        const ny = piece.y + row;
        if (ny >= 0 && ny < ROWS) {
          this._board[ny][nx] = piece.tetromino.color;
        }
      }
    }
    this._current = null;

    const clears = this._computeClears();
    if (clears.cells.size > 0) {
      // Start the clear animation: cleared cells flash, then survivors fall.
      this._clearSet = clears.cells;
      this._fullRows = clears.rows;
      this._pendingClearValue = clears.value;
      this._phase = 'flash';
      this._flashStart = performance.now();
    } else {
      this._spawnPiece();
    }
  }

  _findFullRows() {
    const rows = [];
    for (let row = 0; row < ROWS; row++) {
      if (this._board[row].every(cell => cell !== null)) rows.push(row);
    }
    return rows;
  }

  // Explosion rule: find every cell that belongs to a run of 5 or more cells
  // of the same colour in a straight line — horizontal, vertical, or either
  // diagonal. Returns a Set of "row,col" keys.
  _findColorMatches() {
    const marks = new Set();
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < this._cols; c++) {
        const color = this._board[r][c];
        if (!color) continue;
        for (const [dr, dc] of dirs) {
          // Only count a run from its start cell (previous cell differs).
          const pr = r - dr, pc = c - dc;
          if (pr >= 0 && pr < ROWS && pc >= 0 && pc < this._cols &&
              this._board[pr][pc] === color) continue;
          let len = 0, rr = r, cc = c;
          while (rr >= 0 && rr < ROWS && cc >= 0 && cc < this._cols &&
                 this._board[rr][cc] === color) {
            len++; rr += dr; cc += dc;
          }
          if (len >= 5) {
            rr = r; cc = c;
            for (let i = 0; i < len; i++) {
              marks.add(rr + ',' + cc);
              rr += dr; cc += dc;
            }
          }
        }
      }
    }
    return marks;
  }

  // Combine both clearing rules into a single set of cells to remove:
  //  1. full rows (classic line clear)
  //  2. 5-in-a-line same-colour runs (explosion)
  // `value` is the score awarded before the cascade multiplier is applied:
  //  - Row clears reward the number of blocks removed (fair across board
  //    widths). Clearing several rows at once applies a diminishing bonus:
  //    n rows => multiplier (2 - 1/2^(n-1)): 1 row x1.0, 2 x1.5, 3 x1.75, ...
  //  - Explosions add the number of blocks that disappeared.
  _computeClears() {
    const rows = this._findFullRows();
    const fullRowSet = new Set(rows);
    const matches = this._findColorMatches();
    const cells = new Set(matches);
    for (const r of rows) {
      for (let c = 0; c < this._cols; c++) cells.add(r + ',' + c);
    }
    let explode = 0;
    for (const key of matches) {
      const r = parseInt(key, 10);
      if (!fullRowSet.has(r)) explode++;
    }
    const n = rows.length;
    const rowBlocks = n * this._cols;                 // each full row has _cols blocks
    const rowMultiplier = n > 0 ? 2 - Math.pow(2, 1 - n) : 0;
    const rowScore = Math.round(rowBlocks * rowMultiplier);
    return { cells, rows, value: rowScore + explode };
  }

  // Build the falling-cell list: full rows are removed and every surviving
  // cell gets a target position after per-column gravity is applied.
  _startFalling() {
    // Per-column collapse: a cleared cell is removed and everything above it in
    // the SAME column falls straight down. Columns are independent, so gravity
    // only ever acts vertically (never left/right).
    const clearSet = this._clearSet || new Set();
    const falling = [];
    for (let col = 0; col < this._cols; col++) {
      const survivors = [];
      for (let row = 0; row < ROWS; row++) {
        if (clearSet.has(row + ',' + col)) continue;
        const color = this._board[row][col];
        if (color) survivors.push({ row, color });
      }
      // Assign target rows from the bottom up, preserving order.
      let target = ROWS - 1;
      for (let i = survivors.length - 1; i >= 0; i--) {
        falling.push({
          col,
          color: survivors[i].color,
          y: survivors[i].row,      // current (animated) row position
          targetRow: target,
        });
        target--;
      }
    }
    this._fallingCells = falling;
    this._board = this._emptyBoard(); // rebuilt on finalize; rendered from list
    this._phase = 'falling';
    this._lastFall = performance.now();

    // If nothing actually needs to move, finalize immediately.
    if (falling.every(c => c.y >= c.targetRow)) {
      this._finalizeClear();
    }
  }

  _finalizeClear() {
    // Settle the survivors into the board at their final positions.
    for (const cell of this._fallingCells) {
      this._board[cell.targetRow][cell.col] = cell.color;
    }
    this._fallingCells = [];

    // Award score for what was cleared this cascade step (full rows plus any
    // exploded colour-match cells). Later steps in the same chain are worth
    // progressively more (combo bonus).
    this.score += this._pendingClearValue * this._cascade;
    // Level up roughly every 10 rows regardless of board width (scores now
    // scale with the number of blocks, so divide by blocks-per-10-rows).
    this.level = Math.floor(this.score / (this._cols * 10)) + 1;
    this._dropInterval = Math.max(100, 800 - (this.level - 1) * 70);

    // Gravity may have created brand-new full rows or 5-in-a-line colour
    // matches. If so, flash and clear those too, then let gravity run again —
    // repeat until the board is stable.
    const next = this._computeClears();
    if (next.cells.size > 0) {
      this._cascade++;
      this._clearSet = next.cells;
      this._fullRows = next.rows;
      this._pendingClearValue = next.value;
      this._phase = 'flash';
      this._flashStart = performance.now();
      return;
    }

    // Nothing left to clear: resume normal play.
    this._fullRows = [];
    this._clearSet = null;
    this._pendingClearValue = 0;
    this._cascade = 1;
    this._phase = 'active';
    this._lastDrop = performance.now();
    this._spawnPiece();
  }

  // ---------- key input ----------------------------------------------------

  // Perform a single game action; shared by keyboard and touch input.
  _action(type) {
    if (this.mode !== 'playing' || this._phase !== 'active' || !this._current) return;
    const p = this._current;
    switch (type) {
      case 'left':
        if (this._canPlace(p, -1, 0)) p.x--;
        break;
      case 'right':
        if (this._canPlace(p, 1, 0)) p.x++;
        break;
      case 'softDrop':
        if (this._canPlace(p, 0, 1)) p.y++;
        else this._lockPiece();
        break;
      case 'rotate': {
        const nextRot = (p.rotation + 1) % 4;
        if (this._canPlace(p, 0, 0, nextRot)) p.rotation = nextRot;
        break;
      }
      case 'rotateLeft': {
        const nextRot = (p.rotation + 3) % 4;
        if (this._canPlace(p, 0, 0, nextRot)) p.rotation = nextRot;
        break;
      }
      case 'hardDrop':
        while (this._canPlace(p, 0, 1)) p.y++;
        this._lockPiece();
        break;
      default:
        return;
    }
    this._draw();
  }

  _bindKeys() {
    const keyMap = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowDown: 'softDrop',
      ArrowUp: 'rotate',
      ' ': 'hardDrop',
      Space: 'hardDrop',
      Spacebar: 'hardDrop',
    };
    this._keyHandler = (e) => {
      const action = keyMap[e.key];
      if (!action) return;
      this._action(action);
      e.preventDefault();
    };
    document.addEventListener('keydown', this._keyHandler);
  }

  _unbindKeys() {
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
  }

  // ---------- touch input --------------------------------------------------
  // Tap on the play area (board)  -> rotate left
  // Tap on the side panel (right) -> hard drop
  // Horizontal swipe on the board -> move left / right
  // Downward swipe on the board   -> soft drop
  _bindTouch() {
    const board = this.boardCanvas;
    const side = this.sidePanelEl;
    if (!board) return;

    const TAP_MAX_MOVE = 12; // px; a touch that moves less than this is a tap
    let startX = 0, startY = 0, lastX = 0, lastY = 0, maxMove = 0;

    const boardStart = (e) => {
      const t = e.changedTouches[0];
      startX = lastX = t.clientX;
      startY = lastY = t.clientY;
      maxMove = 0;
      e.preventDefault();
    };
    const boardMove = (e) => {
      const t = e.changedTouches[0];
      maxMove = Math.max(maxMove, Math.hypot(t.clientX - startX, t.clientY - startY));
      const cs = this._cellSize || 24;
      const dx = t.clientX - lastX;
      const dy = t.clientY - lastY;
      // Slide horizontally to move; slide down to soft drop. Move by however
      // many whole cells the finger has travelled (keeping the remainder), so
      // both smooth and coarse/fast swipes track correctly.
      if (Math.abs(dx) >= Math.abs(dy)) {
        const steps = Math.trunc(dx / cs);
        if (steps !== 0) {
          const dir = steps > 0 ? 'right' : 'left';
          for (let i = 0; i < Math.abs(steps); i++) this._action(dir);
          lastX += steps * cs;
          lastY = t.clientY;
        }
      } else {
        const steps = Math.trunc(dy / cs);
        if (steps > 0) {
          for (let i = 0; i < steps; i++) this._action('softDrop');
          lastY += steps * cs;
          lastX = t.clientX;
        }
      }
      e.preventDefault();
    };
    const boardEnd = (e) => {
      // A tap (little movement) on the play area rotates the piece left.
      if (maxMove < TAP_MAX_MOVE) this._action('rotateLeft');
      e.preventDefault();
    };

    board.addEventListener('touchstart', boardStart, { passive: false });
    board.addEventListener('touchmove', boardMove, { passive: false });
    board.addEventListener('touchend', boardEnd, { passive: false });

    const handlers = { board, boardStart, boardMove, boardEnd };

    if (side) {
      const sideTap = (e) => {
        this._action('hardDrop');
        e.preventDefault();
      };
      side.addEventListener('touchstart', sideTap, { passive: false });
      handlers.side = side;
      handlers.sideTap = sideTap;
    }

    this._touchHandlers = handlers;
  }

  _unbindTouch() {
    const h = this._touchHandlers;
    if (!h) return;
    h.board.removeEventListener('touchstart', h.boardStart);
    h.board.removeEventListener('touchmove', h.boardMove);
    h.board.removeEventListener('touchend', h.boardEnd);
    if (h.side) h.side.removeEventListener('touchstart', h.sideTap);
    this._touchHandlers = null;
  }

  // ---------- game loop ----------------------------------------------------

  _loop(timestamp) {
    if (this.mode !== 'playing') return;

    if (this._phase === 'active') {
      if (timestamp - this._lastDrop >= this._dropInterval) {
        this._lastDrop = timestamp;
        if (this._canPlace(this._current, 0, 1)) {
          this._current.y++;
        } else {
          this._lockPiece();
        }
      }
    } else if (this._phase === 'flash') {
      if (timestamp - this._flashStart >= FLASH_DURATION_MS) {
        this._startFalling();
      }
    } else if (this._phase === 'falling') {
      this._updateFalling(timestamp);
    }

    this._draw();
    this._animId = requestAnimationFrame((ts) => this._loop(ts));
  }

  _updateFalling(timestamp) {
    const dt = (timestamp - this._lastFall) / 1000;
    this._lastFall = timestamp;
    const step = FALL_ROWS_PER_SEC * dt;
    let settled = true;
    for (const cell of this._fallingCells) {
      if (cell.y < cell.targetRow) {
        cell.y = Math.min(cell.targetRow, cell.y + step);
        if (cell.y < cell.targetRow) settled = false;
      }
    }
    if (settled) this._finalizeClear();
  }

  _stopGame() {
    if (this._animId) {
      cancelAnimationFrame(this._animId);
      this._animId = null;
    }
    this._unbindKeys();
    this._unbindTouch();
  }

  _gameOver() {
    this._stopGame();
    this.mode = 'gameover';
  }

  // ---------- rendering ----------------------------------------------------

  _draw() {
    if (!this.boardCanvas || !this.nextCanvas) return;
    this._drawBoard();
    this._drawNext();
  }

  _drawBoard() {
    const ctx = this.boardCanvas.getContext('2d');
    const cs = this._cellSize;
    const w = this.boardCanvas.width;
    const h = this.boardCanvas.height;

    // Background
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < this._cols; c++) {
        ctx.strokeRect(c * cs, r * cs, cs, cs);
      }
    }

    // Falling animation: render survivors at their interpolated positions.
    if (this._phase === 'falling') {
      for (const cell of this._fallingCells) {
        this._drawCell(ctx, cell.col, cell.y, cell.color, cs);
      }
      return;
    }

    // Flash phase: cleared cells (full rows and colour matches) blink before
    // disappearing.
    const flashing = this._phase === 'flash';
    const flashSet = flashing ? (this._clearSet || new Set()) : null;
    const flashOn = flashing
      ? Math.floor((performance.now() - this._flashStart) / 90) % 2 === 0
      : false;

    // Locked cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < this._cols; c++) {
        const color = this._board[r][c];
        if (color) {
          if (flashSet && flashSet.has(r + ',' + c)) {
            this._drawCell(ctx, c, r, flashOn ? '#ffffff' : '#e0e0ff', cs);
          } else {
            this._drawCell(ctx, c, r, color, cs);
          }
        }
      }
    }

    // Ghost and current piece only exist during active play.
    if (this._phase !== 'active' || !this._current) return;

    // Ghost piece (drop preview)
    const ghost = { ...this._current };
    while (this._canPlace(ghost, 0, 1)) ghost.y++;
    const ghostShape = this._shape(ghost);
    for (let row = 0; row < ghostShape.length; row++) {
      for (let col = 0; col < ghostShape[row].length; col++) {
        if (!ghostShape[row][col]) continue;
        const gx = ghost.x + col;
        const gy = ghost.y + row;
        if (gy >= 0 && gy < ROWS) {
          ctx.globalAlpha = 0.25;
          this._drawCell(ctx, gx, gy, this._current.tetromino.color, cs);
          ctx.globalAlpha = 1;
        }
      }
    }

    // Current piece
    const shape = this._shape(this._current);
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (!shape[row][col]) continue;
        const px = this._current.x + col;
        const py = this._current.y + row;
        if (py >= 0 && py < ROWS) {
          this._drawCell(ctx, px, py, this._current.tetromino.color, cs);
        }
      }
    }
  }

  _drawNext() {
    const ctx = this.nextCanvas.getContext('2d');
    const cs = this._cellSize;
    const shape = this._next.shapes[0];
    const dim = Math.max(shape.length, NEXT_PREVIEW_CELLS);
    const sz = cs * dim;

    if (this.nextCanvas.width !== sz || this.nextCanvas.height !== sz) {
      this.nextCanvas.width = sz;
      this.nextCanvas.height = sz;
    }

    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, sz, sz);

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          this._drawCell(ctx, col, row, this._next.color, cs);
        }
      }
    }
  }

  _drawCell(ctx, cx, cy, color, cs) {
    const x = cx * cs;
    const y = cy * cs;
    const m = Math.max(1, Math.floor(cs * 0.07)); // margin
    ctx.fillStyle = color;
    ctx.fillRect(x + m, y + m, cs - m * 2, cs - m * 2);

    // Simple 3-D highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x + m, y + m, cs - m * 2, m);
    ctx.fillRect(x + m, y + m, m, cs - m * 2);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + m, y + cs - m * 2, cs - m * 2, m);
    ctx.fillRect(x + cs - m * 2, y + m, m, cs - m * 2);
  }
}
