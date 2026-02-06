"use strict";

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const helperTextEl = document.getElementById("helperText");
const selectionTextEl = document.getElementById("selectionText");

const restartBtn = document.getElementById("restartBtn");
const confirmBtn = document.getElementById("confirmBtn");

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let board = Array(9).fill(null); // null | "X" | "O"
let currentPlayer = "X";
let gameOver = false;

// selection only (not a move)
let selectedIndex = 0;

function init() {
  createBoard();
  renderBoard();
  setTurnText();
  updateBackgroundForTurn();

  setSelectedIndex(0);

  confirmBtn.addEventListener("click", confirmSelectedMove);
  restartBtn.addEventListener("click", restartGame);

  // keyboard support on the board container
  boardEl.addEventListener("keydown", handleBoardKeyDown);

  boardEl.focus();
  updateConfirmButton();
}

function createBoard() {
  boardEl.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.dataset.index = String(i);
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", `Cell ${i + 1}`);

    // CLICK = SELECT ONLY
    cell.addEventListener("click", () => {
      if (gameOver) return;
      setSelectedIndex(i);
      boardEl.focus();
    });

    boardEl.appendChild(cell);
  }
}

function handleBoardKeyDown(e) {
  // Restart anytime
  if (e.key === "r" || e.key === "R") {
    e.preventDefault();
    restartGame();
    return;
  }

  if (gameOver) return;

  const row = Math.floor(selectedIndex / 3);
  const col = selectedIndex % 3;

  let next = selectedIndex;

  switch (e.key) {
    case "ArrowUp":
      e.preventDefault();
      next = ((row + 2) % 3) * 3 + col;
      setSelectedIndex(next);
      return;

    case "ArrowDown":
      e.preventDefault();
      next = ((row + 1) % 3) * 3 + col;
      setSelectedIndex(next);
      return;

    case "ArrowLeft":
      e.preventDefault();
      next = row * 3 + ((col + 2) % 3);
      setSelectedIndex(next);
      return;

    case "ArrowRight":
      e.preventDefault();
      next = row * 3 + ((col + 1) % 3);
      setSelectedIndex(next);
      return;

    // Enter/Space = CONFIRM (finalize)
    case "Enter":
    case " ":
      e.preventDefault();
      confirmSelectedMove();
      return;

    default:
      return;
  }
}

function setSelectedIndex(idx) {
  selectedIndex = idx;

  const cells = getCells();
  cells.forEach((c) => c.classList.remove("selected"));
  cells[selectedIndex].classList.add("selected");

  const r = Math.floor(selectedIndex / 3) + 1;
  const c = (selectedIndex % 3) + 1;

  if (board[selectedIndex] === null) {
    selectionTextEl.textContent = `Selected: Row ${r}, Col ${c} (empty)`;
  } else {
    selectionTextEl.textContent = `Selected: Row ${r}, Col ${c} (occupied)`;
  }

  helperTextEl.textContent = "Select a square, then click Confirm Move.";
  updateConfirmButton();
}

function updateConfirmButton() {
  // Confirm only if game is active and selected cell is empty
  confirmBtn.disabled = gameOver || board[selectedIndex] !== null;
}

function confirmSelectedMove() {
  // CONFIRM is the ONLY place we actually place a mark + switch turns
  if (gameOver) return;
  if (board[selectedIndex] !== null) return;

  // Place mark
  board[selectedIndex] = currentPlayer;

  // Update UI
  renderBoard();

  // Check win/draw
  const winInfo = getWinInfo();
  if (winInfo) {
    gameOver = true;
    highlightWin(winInfo.line);
    statusEl.className = "status result " + 
  (currentPlayer === "X" ? "win-x" : "win-o");

statusEl.textContent = `${currentPlayer} WINS! 🎉`;

helperTextEl.textContent = "Game over. Press Restart to play again.";

    confirmBtn.disabled = true;
    disableFilledFocus(); // optional clean-up
    return;
  }

  if (board.every((x) => x !== null)) {
    gameOver = true;
    statusEl.className = "status result draw";

statusEl.textContent = "IT'S A DRAW! 🤝";

helperTextEl.textContent = "No more moves. Press Restart to play again.";

    confirmBtn.disabled = true;
    disableFilledFocus();
    return;
  }

  // SWITCH TURN ONLY AFTER CONFIRM
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  setTurnText();

  // Keep selection in place and update confirm enabled/disabled
  setSelectedIndex(selectedIndex);
}

function getWinInfo() {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

function renderBoard() {
  const cells = getCells();

  cells.forEach((cell, i) => {
    const v = board[i];
    cell.textContent = v ?? "";
    cell.classList.toggle("x", v === "X");
    cell.classList.toggle("o", v === "O");
  });

  // Re-apply selection highlight after rendering
  if (cells[selectedIndex]) {
    cells.forEach((c) => c.classList.remove("selected"));
    cells[selectedIndex].classList.add("selected");
  }

  updateConfirmButton();
}

function setTurnText() {
  statusEl.innerHTML = `<strong>Turn:</strong> <span>${currentPlayer}</span>`;
  updateBackgroundForTurn(); // ✅ makes the body class match the current player
}

function highlightWin(line) {
  const cells = getCells();
  line.forEach((idx) => cells[idx].classList.add("win"));
}
function updateBackgroundForTurn() {
  document.body.classList.remove("turn-x", "turn-o");

  if (currentPlayer === "X") {
    document.body.classList.add("turn-x");
  } else {
    document.body.classList.add("turn-o");
  }
}

function restartGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  
  gameOver = false;
  statusEl.className = "status"; // reset styling

  // Clear win highlights
  getCells().forEach((c) => c.classList.remove("win"));

  renderBoard();
  setTurnText();

  setSelectedIndex(0);
  helperTextEl.textContent = "Select a square, then click Confirm Move.";
  boardEl.focus();
}

function disableFilledFocus() {
  // Not required, but keeps UI feeling consistent after game ends
  // (Cells still visible; confirm disabled; selection stays.)
  updateConfirmButton();
}

function getCells() {
  return [...document.querySelectorAll(".cell")];
}

init();
