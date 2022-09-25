'use strict'

const EMPTY = ' '
const MINE = `<img src="img/mine.png">`
const EXPLODED_MINE = `<img src="img/mine.png" style="display: none;">`
const EXPOSED_MINE = `<img src="img/mine.png" style="display: block;">`
const FLAG = '🚩'
const LIVE = '💔'

var gMyIntervalId
var gblowAudio = new Audio('sounds/blow.wav')
var gGameStartAudio = new Audio('sounds/game-start.ogg')
var gGameWonAudio = new Audio('sounds/game-won.wav')
var gGameOverAudio = new Audio('sounds/game-over.wav')

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
    clicksCount: null,
    isMineExOn: true
}

var gHintMode = false
var gHintCounter = 0
var gMegaHintMode = false
var gMegaHintClicks = []

var gElLastCellClicked
var gameStatus = '😄'
var gLives
var gMinesCount = 0

function init() {
    gGameStartAudio.play()
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
            var negsCount = setMinesNegsCount(i, j, board)
            board[i][j] = (Math.random() > 0.2) ? negsCount : MINE
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
            var elMine = document.querySelector(`.cell-${i}-${j} img`)
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            if(elCell.innerHTML === '💥' || elCell.innerText === FLAG) continue
            if (gBoard[i][j] === MINE) elMine.style.display = 'block'
        }
    }
    gGameOverAudio.play()
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
    var elBtns = document.getElementsByTagName('button')
    for(var i = 0 ; i < elBtns.length ; i++){
        elBtns[i].style.backgroundColor = 'buttonface'
    }
    gGameStartAudio.play()
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.clicksCount = 0
    gMinesCount = 0
    gLives = 0
    gMegaHintClicks = []
    gGame.isMineExOn = true
    gMegaHintMode = false
    gameStatus = '😄'
    clearInterval(gMyIntervalId)
    gGame.isOn = true
    gBoard = gPrevBoard = buildBoard()
    renderBoard(gBoard, '.table')
    gLives = (gMinesCount < 3) ? gMinesCount : 3
    renderHearts()
    renderGameStatus()

}

function chooseLvl(elBtn) {
    if (elBtn.innerText === 'easy👍') {
        gLevel.SIZE = 4
        playAgain()
    }
    if (elBtn.innerText === 'hard🤞') {
        gLevel.SIZE = 8
        playAgain()
    }
    if (elBtn.innerText === 'extreme👾') {
        gLevel.SIZE = 12
        playAgain()

    }
}

function checkVictory() {
    var cellsLeftToWin = (gBoard.length * gBoard.length) - gMinesCount
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            if ((!elCell.classList.contains('unrevealed') && gBoard[i][j] !== MINE)|| elCell.innerHTML === '💥') cellsLeftToWin--
            console.log(cellsLeftToWin);
        }
    }
    if (cellsLeftToWin === 0) {
        gGameWonAudio.play()
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

function mineExterminator() {
    if(!gGame.isMineExOn) return
    gblowAudio.play()
    var elBtn = document.querySelector('.mine-exterminator')
    elBtn.style.backgroundColor = 'rgb(20, 181, 252)'
    var minesPos = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var elCell = document.querySelector(`.cell-${i}-${j} `)
            var elMine = document.querySelector(`.cell-${i}-${j} img`)
            if ((gBoard[i][j] === MINE || gBoard[i][j] === EXPLODED_MINE || gBoard[i][j] === EXPOSED_MINE)) {
                if(elCell.innerText === FLAG || elMine.style.display === "block" || elCell.classList.contains('main-hit'))continue
                minesPos.push({ i: i, j: j })
            }
        }
    }
    for(var i = 0 ; i< 3 ; i++){
        console.log(minesPos);
        // var rndPoses = []
        var rndPos = getRandomInt(0,minesPos.length-1)
        var elMine = document.querySelector(`.cell-${minesPos[rndPos].i}-${minesPos[rndPos].j} img`)
        console.log('elMine', elMine);
            elMine.style.display = 'block'
            var elCell = document.querySelector(`.cell-${minesPos[rndPos].i}-${minesPos[rndPos].j} `)
            elCell.classList.remove('unrevealed')
            elCell.innerHTML = '💥'
            // gBoard[minesPos[i].i][minesPos[i].j] = EMPTY
            gMinesCount--
    }
    gGame.isMineExOn = false
}

const checkbox = document.querySelector('.switch');

checkbox.addEventListener('change', ()=>{
  document.body.classList.toggle('toggle');
})