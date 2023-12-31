"use strict";

const BLACK = 1,
  WHITE = -1;
let data = [];
let turn = true;
const board = document.getElementById("board");
const h2 = document.querySelector("h2");
const counter = document.getElementById("counter");
const modal = document.getElementById("modal");
document.querySelectorAll(".select").forEach((value) => {
  value.addEventListener("click", start);
});

// AIの強さを選択
let weakAI = false; //　true:弱いAI, false:強いAI

let cells = 8; // マスの数

// AIの後攻プレイヤー
const AI_COLOR = WHITE;

// スタート画面でマスの数が選択された時の処理
function start(e) {
  if (Number(e.target.id) == 1){ 
    weakAI = true;
  } else if (Number(e.target.id) == 2){
    weakAI = false;
  }
  board.innerHTML = "";
  init();
  modal.classList.add("hide");
  // AIのターンが始まる
  if (!turn) {
    setTimeout(aiTurn, 1000);
  }
}

// 初期化
function init() {
  for (let i = 0; i < cells; i++) {
    const tr = document.createElement("tr");
    data[i] = Array(cells).fill(0);
    for (let j = 0; j < cells; j++) {
      const td = document.createElement("td");
      const disk = document.createElement("div");
      tr.appendChild(td);
      td.appendChild(disk);
      td.className = "cell";
      td.onclick = clicked;
    }
    board.appendChild(tr);
  }

  putDisc(3, 3, WHITE);
  putDisc(4, 4, WHITE);
  putDisc(3, 4, BLACK);
  putDisc(4, 3, BLACK);
  showTurn();
}

init();

// 石を描画
function putDisc(x, y, color) {
  board.rows[y].cells[x].firstChild.className =
    color === BLACK ? "black" : "white";
  board.rows[y].cells[x].animate(
    { opacity: [0.4, 1] },
    { duration: 700, fill: "forwards" }
  );
  data[y][x] = color;
}

// 手番などの表示
function showTurn() {
  h2.textContent = turn ? "あなたの番" : "CPUの番";
  let numWhite = 0,
    numBlack = 0,
    numEmpty = 0;
  for (let x = 0; x < cells; x++) {
    for (let y = 0; y < cells; y++) {
      if (data[x][y] === WHITE) {
        numWhite++;
      }
      if (data[x][y] === BLACK) {
        numBlack++;
      }
      if (data[x][y] === 0) {
        numEmpty++;
      }
    }
  }
  document.getElementById("numBlack").textContent = numBlack;
  document.getElementById("numWhite").textContent = numWhite;

  let blacDisk = checkReverse(BLACK);
  let whiteDisk = checkReverse(WHITE);

  if (numWhite + numBlack === cells * cells || (!blacDisk && !whiteDisk)) {
    if (numBlack > numWhite) {
      document.getElementById("numBlack").textContent = numBlack + numEmpty;
      h2.textContent = "勝ち!!";
      restartBtn();
      showAnime();
    } else if (numBlack < numWhite) {
      document.getElementById("numWhite").textContent = numWhite + numEmpty;
      h2.textContent = "負け!!";
      restartBtn();
      showAnime();
    } else {
      h2.textContent = "引き分け";
      restartBtn();
      showAnime();
    }
    return;
  }
  if (!blacDisk && turn) {
    h2.textContent = "黒スキップ";
    showAnime();
    turn = !turn;
    setTimeout(showTurn, 2000);
    return;
  }
  if (!whiteDisk && !turn) {
    h2.textContent = "白スキップ";
    showAnime();
    turn = !turn;
    setTimeout(showTurn, 2000);
    return;
  }
  // AIのターンが始まる
  if (!turn) {
    setTimeout(aiTurn, 1000);
  }
}

// マスがクリックされた時の処理
function clicked() {
  const color = turn ? BLACK : WHITE;
  const y = this.parentNode.rowIndex;
  const x = this.cellIndex;
  // マスに置けるかチェック
  if (data[y][x] !== 0) {
    return;
  }
  const result = checkPut(x, y, color);
  if (result.length > 0) {
    result.forEach((value) => {
      putDisc(value[0], value[1], color);
    });
    turn = !turn;
  }
  showTurn();
}

// 置いたマスの周囲8方向をチェック
function checkPut(x, y, color) {
  let dx, dy;
  const opponentColor = color == BLACK ? WHITE : BLACK;
  let tmpReverseDisk = [];
  let reverseDisk = [];
  // 周囲8方向を調べる配列
  const direction = [
    [-1, 0], // 左
    [-1, 1], // 左下
    [0, 1], // 下
    [1, 1], // 右下
    [1, 0], // 右
    [1, -1], // 右上
    [0, -1], // 上
    [-1, -1], // 左上
  ];

  // すでに置いてある
  if (data[y][x] === BLACK || data[y][x] === WHITE) {
    return [];
  }
  // 置いた石の周りに違う色の石があるかチェック
  for (let i = 0; i < direction.length; i++) {
    dx = direction[i][0] + x;
    dy = direction[i][1] + y;
    if (
      dx >= 0 &&
      dy >= 0 &&
      dx <= cells - 1 &&
      dy <= cells - 1 &&
      opponentColor === data[dy][dx]
    ) {
      tmpReverseDisk.push([x, y]);
      tmpReverseDisk.push([dx, dy]);
      // 裏返せるかチェック
      while (true) {
        dx += direction[i][0];
        dy += direction[i][1];
        if (
          dx < 0 ||
          dy < 0 ||
          dx > cells - 1 ||
          dy > cells - 1 ||
          data[dy][dx] === 0
        ) {
          tmpReverseDisk = [];
          break;
        }
        if (opponentColor === data[dy][dx]) {
          tmpReverseDisk.push([dx, dy]);
        }
        if (color === data[dy][dx]) {
          reverseDisk = reverseDisk.concat(tmpReverseDisk);
          tmpReverseDisk = [];
          break;
        }
      }
    }
  }
  return reverseDisk;
}

// 裏返せる場所があるか確認
function checkReverse(color) {
  for (let x = 0; x < cells; x++) {
    for (let y = 0; y < cells; y++) {
      const result = checkPut(x, y, color);
      console.log(result);
      if (result.length > 0) {
        return true;
      }
    }
  }
  return false;
}

// ゲーム終了画面
function restartBtn() {
  const restartBtn = document.getElementById("restartBtn");
  restartBtn.classList.remove("hide");
  restartBtn.animate(
    { opacity: [1, 0.5, 1] },
    { delay: 2000, duration: 3000, iterations: "Infinity" }
  );

  restartBtn.addEventListener("click", () => {
    document.location.reload();
  });
}
function showAnime() {
  h2.animate({ opacity: [0, 1] }, { duration: 500, iterations: 4 });
}

// AIのターン
function aiTurn() {
  const availableMoves = findAvailableMoves(AI_COLOR);
  if (availableMoves.length > 0 && weakAI) {
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    const [x, y] = randomMove;
    console.info("weak ai");
    setTimeout(() => {
      clicked.call(board.rows[y].cells[x]);
    }, 1000);
  } else if (availableMoves.length > 0 && !weakAI) {
    // ミニマックス法で最善手を見つける
    console.info("not weak ai");
    const bestMove = findBestMove(availableMoves);
    const [x, y] = bestMove;
    setTimeout(() => {
      clicked.call(board.rows[y].cells[x]);
    }, 1000);
  } else {
    // パス
    turn = !turn;
    showTurn();
  }
}

// ミニマックス法で最善手を見つける
function findBestMove(availableMoves) {
  let bestMove = null;
  let bestScore = -Infinity;

  for (const move of availableMoves) {
    const [x, y] = move;
    const newData = deepCopy(data); // ボードのコピー
    const result = checkPut(x, y, AI_COLOR);

    if (result.length > 0) {
      result.forEach((value) => {
        newData[value[1]][value[0]] = AI_COLOR;
      });

      const score = minimax(newData, 3, false); // 探索の深さは調整可能
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }
  return bestMove;
}

// ミニマックス法の再帰的な実装
function minimax(board, depth, isMaximizing) {
  const scores = {
    [AI_COLOR]: 1,
    [BLACK]: -1,
    [WHITE]: 1,
  };

  if (depth === 0) {
    return evaluate(board);
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (let x = 0; x < cells; x++) {
      for (let y = 0; y < cells; y++) {
        if (board[y][x] === 0) {
          const newData = deepCopy(board);
          const result = checkPut(x, y, AI_COLOR);
          if (result.length > 0) {
            result.forEach((value) => {
              newData[value[1]][value[0]] = AI_COLOR;
            });
            const score = minimax(newData, depth - 1, false);
            maxScore = Math.max(maxScore, score);
          }
        }
      }
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (let x = 0; x < cells; x++) {
      for (let y = 0; y < cells; y++) {
        if (board[y][x] === 0) {
          const newData = deepCopy(board);
          const result = checkPut(x, y, BLACK);
          if (result.length > 0) {
            result.forEach((value) => {
              newData[value[1]][value[0]] = BLACK;
            });
            const score = minimax(newData, depth - 1, true);
            minScore = Math.min(minScore, score);
          }
        }
      }
    }
    return minScore;
  }
}

// ボードの評価関数
function evaluate(board) {
  const weights = [
    [100, -20, 10, 5, 5, 10, -20, 100],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [10, -2, 2, 1, 1, 2, -2, 10],
    [5, -2, 1, 1, 1, 1, -2, 5],
    [5, -2, 1, 1, 1, 1, -2, 5],
    [10, -2, 2, 1, 1, 2, -2, 10],
    [-20, -50, -2, -2, -2, -2, -50, -20],
    [100, -20, 10, 5, 5, 10, -20, 100],
  ];

  let score = 0;
  for (let x = 0; x < cells; x++) {
    for (let y = 0; y < cells; y++) {
      if (board[y][x] === AI_COLOR) {
        score += weights[y][x];
      } else if (board[y][x] === BLACK) {
        score -= weights[y][x];
      }
    }
  }
  return score;
}

// ディープコピーを作成
function deepCopy(arr) {
  return JSON.parse(JSON.stringify(arr));
}

// AIが置ける場所を探す
function findAvailableMoves(color) {
  const availableMoves = [];
  for (let x = 0; x < cells; x++) {
    for (let y = 0; y < cells; y++) {
      const result = checkPut(x, y, color);
      if (result.length > 0) {
        availableMoves.push([x, y]);
      }
    }
  }
  return availableMoves;
}
