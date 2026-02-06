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

let board = Array(9).fill(null);  // null | "X" | "O"
let currentPlayer = "X";
let gameOver = false;

function init() {
  createBoard();
  render();
  setTurnStatus();
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

    boardEl.appendChild(cellBtn);
  }
}

function handleCellClick(event) {
  const idx = Number(event.currentTarget.dataset.index);

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
  for (const idx of line) {
    cells[idx].classList.add("win");
  }
}

function render() {
  const cells = [...document.querySelectorAll(".cell")];

  cells.forEach((cell, i) => {
    const value = board[i];

    cell.textContent = value ?? "";
    cell.classList.toggle("x", value === "X");
    cell.classList.toggle("o", value === "O");
  });
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
}

restartBtn.addEventListener("click", restartGame);

init();
