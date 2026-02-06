"use strict";

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const helperTextEl = document.getElementById("helperText");
const restartBtn = document.getElementById("restartBtn");

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
];

let board = Array(9).fill(null);   // null | "X" | "O"
let currentPlayer = "X";
let gameOver = false;

// Keyboard support state: which cell is currently "selected"
let selectedIndex = 0;

function init() {
  createBoard();
  render();
  setTurnStatus();
  setSelectedIndex(0);

  restartBtn.addEventListener("click", restartGame);

  // Keyboard support: listen on the board (so it works when focused)
  boardEl.addEventListener("keydown", handleBoardKeyDown);

  // Nice UX: focus board automatically so keyboard works immediately
  boardEl.focus();
}

function createBoard() {
  boardEl.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const cellBtn = document.createElement("button");
    cellBtn.type = "button";
    cellBtn.className = "cell";
    cellBtn.dataset.index = String(i);
    cellBtn.setAttribute("role", "gridcell");
    cellBtn.setAttribute("aria-label", `Cell ${i + 1}`);

    cellBtn.addEventListener("click", handleCellClick);

    // Allow tabbing to cells too (optional but accessible)
    cellBtn.tabIndex = -1;

    boardEl.appendChild(cellBtn);
  }
}

function handleCellClick(event) {
  const idx = Number(event.currentTarget.dataset.index);
  attemptMove(idx);
}

function attemptMove(idx) {
  if (gameOver) return;
  if (board[idx] !== null) return;

  board[idx] = currentPlayer;
  render();

  const winInfo = getWinInfo();
  if (winInfo) {
    gameOver = true;
    highlightWin(winInfo.line);
    setStatusMessage(`${currentPlayer} wins!`, "Game over.");
    disableAllCells();
    return;
  }

  if (board.every((cell) => cell !== null)) {
    gameOver = true;
    setStatusMessage("It's a draw!", "No more moves.");
    disableAllCells();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  setTurnStatus();
}

function handleBoardKeyDown(e) {
  // Restart key (works anytime)
  if (e.key === "r" || e.key === "R") {
    e.preventDefault();
    restartGame();
    return;
  }

  // If game over, allow only restart
  if (gameOver) return;

  const row = Math.floor(selectedIndex / 3);
  const col = selectedIndex % 3;

  let nextIndex = selectedIndex;

  switch (e.key) {
    case "ArrowUp":
      e.preventDefault();
      nextIndex = ((row + 2) % 3) * 3 + col; // wrap up
      setSelectedIndex(nextIndex);
      return;

    case "ArrowDown":
      e.preventDefault();
      nextIndex = ((row + 1) % 3) * 3 + col; // wrap down
      setSelectedIndex(nextIndex);
      return;

    case "ArrowLeft":
      e.preventDefault();
      nextIndex = row * 3 + ((col + 2) % 3); // wrap left
      setSelectedIndex(nextIndex);
      return;

    case "ArrowRight":
      e.preventDefault();
      nextIndex = row * 3 + ((col + 1) % 3); // wrap right
      setSelectedIndex(nextIndex);
      return;

    case "Enter":
    case " ":
      e.preventDefault();
      attemptMove(selectedIndex);
      return;

    default:
      return;
  }
}

function setSelectedIndex(idx) {
  selectedIndex = idx;

  const cells = [...document.querySelectorAll(".cell")];
  cells.forEach((cell) => cell.classList.remove("selected"));

  const selectedCell = cells[selectedIndex];
  if (selectedCell) selectedCell.classList.add("selected");
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

function highlightWin(line) {
  const cells = [...document.querySelectorAll(".cell")];
  for (const idx of line) cells[idx].classList.add("win");
}

function render() {
  const cells = [...document.querySelectorAll(".cell")];

  cells.forEach((cell, i) => {
    const value = board[i];
    cell.textContent = value ?? "";
    cell.classList.toggle("x", value === "X");
    cell.classList.toggle("o", value === "O");
  });

  // Keep selected highlight visible after rerender
  setSelectedIndex(selectedIndex);
}

function setTurnStatus() {
  statusEl.innerHTML = `<strong>Turn:</strong> <span>${currentPlayer}</span>`;
  helperTextEl.textContent = "Game in progress.";
}

function setStatusMessage(mainText, helperText) {
  statusEl.innerHTML = `<strong>${mainText}</strong>`;
  helperTextEl.textContent = helperText;
}

function disableAllCells() {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.setAttribute("disabled", "true");
  });
}

function enableAllCells() {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.removeAttribute("disabled");
  });
}

function clearWinHighlight() {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("win");
  });
}

function restartGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameOver = false;

  enableAllCells();
  clearWinHighlight();
  render();
  setTurnStatus();

  // Reset keyboard cursor and refocus board
  setSelectedIndex(0);
  boardEl.focus();
}

init();
