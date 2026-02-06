"use strict";

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const helperTextEl = document.getElementById("helperText");
const selectionTextEl = document.getElementById("selectionText");

const restartBtn = document.getElementById("restartBtn");
const confirmBtn = document.getElementById("confirmBtn");

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
];

let board = Array(9).fill(null);   // null | "X" | "O"
let currentPlayer = "X";
let gameOver = false;

// Selection state (does NOT place a move until confirmed)
let selectedIndex = 0;

function init() {
  createBoard();
  render();
  setTurnStatus();
  setSelectedIndex(0);

  restartBtn.addEventListener("click", restartGame);
  confirmBtn.addEventListener("click", confirmSelectedMove);

  boardEl.addEventListener("keydown", handleBoardKeyDown);

  // Start ready for keyboard play
  boardEl.focus();
  updateConfirmButtonState();
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

    // Click selects ONLY (no immediate placement)
    cellBtn.addEventListener("click", () => {
      setSelectedIndex(i);
      boardEl.focus();
    });

    cellBtn.tabIndex = -1;
    boardEl.appendChild(cellBtn);
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

  let nextIndex = selectedIndex;

  switch (e.key) {
    case "ArrowUp":
      e.preventDefault();
      nextIndex = ((row + 2) % 3) * 3 + col;
      setSelectedIndex(nextIndex);
      return;

    case "ArrowDown":
      e.preventDefault();
      nextIndex = ((row + 1) % 3) * 3 + col;
      setSelectedIndex(nextIndex);
      return;

    case "ArrowLeft":
      e.preventDefault();
      nextIndex = row * 3 + ((col + 2) % 3);
      setSelectedIndex(nextIndex);
      return;

    case "ArrowRight":
      e.preventDefault();
      nextIndex = row * 3 + ((col + 1) % 3);
      setSelectedIndex(nextIndex);
      return;

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

  const cells = [...document.querySelectorAll(".cell")];
  cells.forEach((cell) => cell.classList.remove("selected"));

  const selectedCell = cells[selectedIndex];
  if (selectedCell) selectedCell.classList.add("selected");

  const value = board[selectedIndex];
  const row = Math.floor(selectedIndex / 3) + 1;
  const col = (selectedIndex % 3) + 1;

  selectionTextEl.textContent =
    value === null
      ? `Selected: Row ${row}, Col ${col} (empty)`
      : `Selected: Row ${row}, Col ${col} (occupied)`;

  helperTextEl.textContent = "Select a square, then confirm your move.";
  updateConfirmButtonState();
}

function updateConfirmButtonState() {
  const canConfirm = !gameOver && board[selectedIndex] === null;
  confirmBtn.disabled = !canConfirm;
}

function confirmSelectedMove() {
  if (gameOver) return;
  if (board[selectedIndex] !== null) return;

  // Place the move only on confirm
  board[selectedIndex] = currentPlayer;
  render();

  const winInfo = getWinInfo();
  if (winInfo) {
    gameOver = true;
    highlightWin(winInfo.line);
    setStatusMessage(`${currentPlayer} wins!`, "Game over.");
    disableAllCells();
    confirmBtn.disabled = true;
    return;
  }

  if (board.every((cell) => cell !== null)) {
    gameOver = true;
    setStatusMessage("It's a draw!", "No more moves.");
    disableAllCells();
    confirmBtn.disabled = true;
    return;
  }

  // Switch turn ONLY after confirmed placement
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  setTurnStatus();

  // Keep selection where it is, but update confirm availability
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

  // Re-apply selection highlight after re-render
  setSelectedIndex(selectedIndex);
}

function setTurnStatus() {
  statusEl.innerHTML = `<strong>Turn:</strong> <span>${currentPlayer}</span>`;
}

function setStatusMessage(mainText, helperText) {
  statusEl.innerHTML = `<strong>${mainText}</strong>`;
  helperTextEl.textContent = helperText;
  selectionTextEl.textContent = "Selected: none";
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

  setSelectedIndex(0);
  helperTextEl.textContent = "Select a square, then confirm your move.";
  boardEl.focus();
}

init();
