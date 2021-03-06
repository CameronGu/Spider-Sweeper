import { createBoard, TILE_STATUSES, getNeighborTiles, checkWin} from './minesweeper.js'

const BOARD_SIZE = 10;
const NUMBER_OF_MINES = 10;
const icons = {
    mine: "🕷️",
    marked: "🕸️",
    mistake: "💩"
};

  //game timer

// const startGame = (BOARD_SIZE,NUMBER_OF_MINES) => {
//     const board = createBoard(BOARD_SIZE,NUMBER_OF_MINES);
//     //reset timer
//     var timer = document.querySelector(".timer");
//     timer.innerHTML = "0 mins 0 secs";
//     clearInterval(interval);
    
// }

  let second = 0, minute = 0, millisecond = 0;
  let timer = document.querySelector(".timer");
  let interval;
  const formatTimer = num => {
      return num.toString().padStart(2,'0')
  }
  const startTimer = () => {
      interval = setInterval(function(){
          timer.innerHTML = `${formatTimer(minute)}:${formatTimer(second)}:${formatTimer(millisecond)}`;
          millisecond++;
          if(millisecond === 100) {
              second++;
              millisecond = 0;
          }
          if(second == 60){
              minute++;
              second = 0;
          }
          if(minute == 60){
              hour++;
              minute = 0;
          }
      },10);
  }
  const stopTimer = () => {
    return clearInterval(interval);
  }
  const resetTimer = () => {
    return (timer.innerHTML = "00:00:00",
    clearInterval(interval));
  }

const board = createBoard(BOARD_SIZE,NUMBER_OF_MINES);
const boardElement = document.querySelector(".board");
const minesRemainingText = document.querySelector("[data-mine-count]");
const messageText = document.querySelector(".subtext");
startTimer();

boardElement.style.setProperty("--size", BOARD_SIZE)
minesRemainingText.textContent = NUMBER_OF_MINES;

board.forEach(row => {
    row.forEach(tile => {
        boardElement.append(tile.element);
        tile.element.addEventListener("click", () => {
            revealTile(board, tile);
            checkGameEnd();
        });
        tile.element.addEventListener("contextmenu", e => {
            e.preventDefault();
            markTile(tile);
            numMinesLeft(board, NUMBER_OF_MINES);
        })
    })
})

const shakeBoard = () => {
    boardElement.classList.remove("shake");
    void boardElement.offsetWidth;  // trick to enable resetting the animation
    boardElement.classList.add("shake");
}

const markTile = tile => {
    const isMarkable = (tile.status === TILE_STATUSES.HIDDEN || tile.status === TILE_STATUSES.MARKED);
    const isHidden = tile.status === TILE_STATUSES.HIDDEN;
    const isMarked = tile.status === TILE_STATUSES.MARKED;
    const noMoreMarksRemain = minesRemainingText.textContent <= 0;
    if (isMarkable) {
        if (noMoreMarksRemain && !isMarked) {
            shakeBoard();
            return;
        }
        if (isMarked) {
            tile.status = TILE_STATUSES.HIDDEN;
            tile.element.textContent = "";
        } else {
            tile.status = TILE_STATUSES.MARKED;
            tile.element.textContent = icons.marked;
        }
    }
}

const revealSpiderHead = (minesRemaining, NUMBER_OF_MINES) => {
    const spiderHeadElement = document.querySelector(".spider_head");
    const percentMinesRemaining = minesRemaining / NUMBER_OF_MINES;
    spiderHeadElement.style.transform = "translateX("+(50*percentMinesRemaining)+"%)";
}

const numMinesLeft = (board, NUMBER_OF_MINES) => {
    const markedTilesCount = board.reduce((count, row) => {
        return (count + row.filter(tile => tile.status === TILE_STATUSES.MARKED).length)}, 0);
    const minesRemaining = NUMBER_OF_MINES - markedTilesCount;
    minesRemainingText.textContent = minesRemaining;
    revealSpiderHead(minesRemaining, NUMBER_OF_MINES)
}

const revealTile = (board, tile) => {
    const revealable = tile.status === TILE_STATUSES.HIDDEN;
    const isMine = tile.mine === true;
    if (revealable) {
        if (isMine) {
            tile.element.textContent = icons.mine;
            tile.status = TILE_STATUSES.MINE;
            shakeBoard();
            checkGameEnd('LOSE');
            return;
        } else {
            tile.status = TILE_STATUSES.NUMBER; 
            tile.element.textContent = tile.nearbyMines > 0 ? tile.nearbyMines : '';
        }
        if (tile.nearbyMines === 0) {
            getNeighborTiles(board,tile).forEach(neighbor => revealTile(board, board[neighbor.y][neighbor.x]))
        }
    }
}

const checkGameEnd = status => {
    const lose = status === 'LOSE';
    const win = checkWin(board);

    if (win || lose) {
        stopTimer();
        boardElement.addEventListener("click", stopProp, { capture: true });
        boardElement.addEventListener("contextmenu", stopProp, { capture: true });
    }

    if (win) {
        messageText.textContent = "Winner!";
    }
    if (lose) {
        messageText.textContent = "You Lose";
        board.forEach(row => {
            row.forEach(tile => {
                if (tile.status === TILE_STATUSES.MARKED && tile.mine === false) {
                        tile.status = TILE_STATUSES.MISTAKE;
                        tile.element.textContent = icons.mistake;
                }
                if (tile.mine) {
                    if (tile.status === TILE_STATUSES.MARKED) {
                        tile.status = TILE_STATUSES.MISTAKE;
                        tile.element.textContent = icons.marked;
                    } else {
                        revealTile(board, tile)
                    }
                }    
            })
        })
    }
}

const stopProp = (e) => {
    e.stopImmediatePropagation()
  }