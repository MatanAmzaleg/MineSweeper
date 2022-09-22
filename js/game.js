'use strict'

const EMPTY = ' '
const MINE = `<img src="img/mine.png">`
const EXPLODED_MINE = `<img src="img/mine.png" style="display: none;">`
const FLAG = '🚩'
const LIVE = '💔'

var gMyIntervalId

var gBoard
var gPrevBoard

var gLevel = {
    SIZE: 4
};


var gGame = {
    isOn: false,
    shownCount: 1,
    markedCount: 0,
    secsPassed: 0,
    clicksCount: null
}

var gMegaHintMode = false
var gMegaHintClicks = []

var gElLastCellClicked
var gameStatus = '😄'
var gLives
var gMinesCount = 0

function init() {
    gGame.isOn = true
    gGame.clicksCount = 0
    gBoard = gPrevBoard = buildBoard()
    renderBoard(gBoard, '.table')
    console.table(gBoard)
    gLives = (gMinesCount < 3) ? gMinesCount : 3
    renderHearts()
    renderGameStatus()
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = (Math.random() > 0.2) ? EMPTY : MINE
            if (board[i][j] === MINE) gMinesCount++
        }
    }
    return board
}



function setMinesNegsCount(cellI, cellJ, board) {
    var negsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j] === MINE || board[i][j] === EXPLODED_MINE) negsCount++;
        }
    }
    return negsCount;
}

function gameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var elCell = document.querySelector(`.cell-${i}-${j} img`)
            if (gBoard[i][j] === MINE) elCell.style.display = 'block'
        }
    }
    gGame.isOn = false
    clearInterval(gMyIntervalId)
    gameStatus = '🤯'
    renderGameStatus()
}

function expandShown(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j] === MINE || board[i][j] === EXPLODED_MINE) continue;
            var elCell = document.querySelector(`.cell-${i}-${j} `)
            if (elCell.innerText === FLAG || !elCell.classList.contains('unrevealed')) continue
            if (elCell.classList.contains('unrevealed')) gGame.shownCount++
            elCell.classList.remove('unrevealed')
            var negsCount = setMinesNegsCount(i, j, gBoard)
            elCell.innerText = negsCount === 0 ? EMPTY : negsCount
            if (negsCount === 0) expandShown(i, j, board)
        }

    }
}



function playAgain() {
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.clicksCount = 0
    gMinesCount = 0
    gLives = 0
    gameStatus = '😄'
    clearInterval(gMyIntervalId)
    gGame.isOn = true
    gBoard = gPrevBoard = buildBoard()
    renderBoard(gBoard, '.table')
    console.table(gBoard)
    gLives = (gMinesCount < 3) ? gMinesCount : 3
    renderHearts()
    renderGameStatus()

}

function chooseLvl(elBtn) {
    if (elBtn.innerText === 'easy👍') {
        gLevel.SIZE = 4
        gBoard = buildBoard()
        renderBoard(gBoard, '.table')
    }
    if (elBtn.innerText === 'hard🤞') {
        gLevel.SIZE = 8
        gBoard = buildBoard()
        renderBoard(gBoard, '.table')
    }
    if (elBtn.innerText === 'extreme👾') {
        gLevel.SIZE = 12
        gBoard = buildBoard()
        renderBoard(gBoard, '.table')

    }
}

function checkVictory() {
    var cellsLeftToWin = (gBoard.length * gBoard.length) - gMinesCount
    console.log(gMinesCount, 'gMinesCount');
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            if (!elCell.classList.contains('unrevealed') && gBoard[i][j] !== MINE) cellsLeftToWin--
        }
    }
    if (cellsLeftToWin === 0) {
        gGame.isOn = false
        gGame.secsPassed = 0
        clearInterval(gMyIntervalId)
        gameStatus = '😍'
        renderGameStatus()
        return true
    }
}

function getRndPos() {
    return { i: getRandomInt(0, gLevel.SIZE - 1), j: getRandomInt(0, gLevel.SIZE - 1) }
}

function undo() {
    if (gGame.clicksCount <= 0 || !gGame.isOn || !(gElLastCellClicked.classList.contains('mine-hit'))) return
    document.querySelector('.mine-hit img').style.display = 'none'
    gElLastCellClicked.classList.replace('mine-hit', 'unrevealed')
    gLives++
    var pos = getClassName(gElLastCellClicked.classList[1]);
    console.log(gBoard[pos[0]][pos[1]]);
    gBoard[pos[0]][pos[1]] = MINE
    gGame.clicksCount--
    renderMoves()
    renderHearts()
}


function getClassName(className) {
    var x = className.split('-')
    x.splice(0, 1)
    return x
}

// function mineExterminator() {
//     var minesPos = []
//     for (var i = 0; i < gBoard.length; i++) {
//         for (var j = 0; j < gBoard.length; j++) {
//             // var currCell = document.querySelector(`.cell-${i}-${j}`)
//             var elMine = document.querySelector(`.cell-${i}-${j} img`)
//             if ((gBoard[i][j] === MINE || gBoard[i][j] === EXPLODED_MINE)) {
//                 minesPos.push({ i: i, j: j })
//             }
//         }
//     }
//     console.log(minesPos);
//     return minesPos
// }

const checkbox = document.querySelector('.switch');

checkbox.addEventListener('change', ()=>{
  document.body.classList.toggle('toggle');
})