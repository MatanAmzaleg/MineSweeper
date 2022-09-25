'use strict'

function setTime() {
    ++gGame.secsPassed
    var elSecSpan = document.querySelector('.sec-span')
    var elMsSpan = document.querySelector('.ms-span')
    elMsSpan.textContent = pad(gGame.secsPassed % 60)
    elSecSpan.textContent = pad(parseInt(gGame.secsPassed / 100)) + ':'
}

function pad(val) {
    var valString = val + ""
    if (valString.length < 2) {
        return "0" + valString
    } else {
        return valString
    }
}

function renderHearts() {
    var elLives = document.querySelector('.lives')
    elLives.innerText = ' '
    for (var i = 0; i < gLives; i++) {
        elLives.innerText += LIVE
    }

}

function renderGameStatus() {
    var elStatusBtn = document.querySelector('.game-status')
    elStatusBtn.innerHTML = gameStatus
}

function renderMoves() {
    var elMoves = document.querySelector('.moves')
    elMoves.innerText = gGame.clicksCount
}

function cellClicked(elCell, i, j, ev){
    if(gMegaHintMode) {
        megaHintCellClicked(elCell, i, j, ev)
        return
    } 
    regularCellClicked(elCell, i, j, ev)
}


function megaHint(){
    gMegaHintMode = true 
    var elBtn = document.querySelector('.mega-hint-btn')
    elBtn.style.backgroundColor = '#45fcb6'
}

function megaHintCellClicked(elCell, i, j){
    gMegaHintClicks.push(getClassName(elCell.classList[0]))
    if(gMegaHintClicks.length===2){
        for(var i = gMegaHintClicks[0][0] ; i <= gMegaHintClicks[1][0]; i++){
            for(var j = gMegaHintClicks[0][1] ; j <= gMegaHintClicks[1][1]; j++){
                var currCell = document.querySelector(`.cell-${i}-${j}`)
                if(currCell.innerHTML === MINE || currCell.innerHTML === EXPLODED_MINE){
                    var elMine = document.querySelector(`.cell-${i}-${j} img`)
                    elMine.style.display = 'block'
                }
            } 
        }
        setTimeout(() => { 
            for(var i = gMegaHintClicks[0][0] ; i <= gMegaHintClicks[1][0]; i++){
                for(var j = gMegaHintClicks[0][1] ; j <= gMegaHintClicks[1][1]; j++){
                    var currCell = document.querySelector(`.cell-${i}-${j}`)
                    if(currCell.innerHTML === MINE || currCell.innerHTML === EXPLODED_MINE || currCell.innerHTML === EXPOSED_MINE){
                        if(currCell.classList.contains('mine-hit'))continue
                        var elMine = document.querySelector(`.cell-${i}-${j} img`)
                        elMine.style.display = 'none'
                    }
                }              
            }
            gMegaHintMode = false 
            return
         }, 2000)
    }
}

function hint(){
    while(gHintCounter !== 3){
        gHintMode = true
        gHintCounter ++
    }
}

function regularCellClicked(elCell, i, j, ev) {
    if (!gGame.isOn ) return
    // if(gHintMode){
    //     console.log(elCell);
    //       for (var y = i - 1; y <= j + 1; y++) {
    //     if (i < 0 || i >= gBoard.length) continue;
    //     for (var x = j - 1; x <= y + 1; x++) {
    //         if (j < 0 || j >= gBoard[y].length) continue;
    //         var currCell = document.querySelector(`.cell-${y}-${x} `)
    //         console.log(currCell);
    //         currCell.classList.remove('unrevealed')
    //         var negsCount = setMinesNegsCount(i, j, gBoard)
    //         elCell.innerText = negsCount === 0 ? EMPTY : negsCount
    //         gHintMode = false

    //     }

    // }
    //     return
    // }
    if (gGame.clicksCount === 0) gMyIntervalId = setInterval(setTime, 10)
    gGame.clicksCount++
    renderMoves()
    if (ev.which === 3) {
        elCell.addEventListener("contextmenu", e => e.preventDefault());
        if (elCell.innerText !== FLAG) {
            if (gGame.markedCount === gMinesCount || !elCell.classList.contains('unrevealed')) return
            elCell.innerText = FLAG
            gGame.markedCount++
        } else if (elCell.innerText = FLAG) {
            elCell.innerText = EMPTY
            gGame.markedCount--
        }
    }
    if (ev.which === 1) {
        if (elCell.innerHTML === FLAG) return
        elCell.classList.remove('unrevealed')
        gElLastCellClicked = elCell
        if (gBoard[i][j] === MINE || gBoard[i][j] === EXPLODED_MINE) {
            elCell.innerHTML = MINE
            gblowAudio.play()
            gLives--
            renderHearts()
            var elMine = document.querySelector(`.cell-${i}-${j} img`)
            elMine.style.display = 'block'
            elCell.classList.add('mine-hit')
            if (gLives === 0) {
                gameOver()
                return
            }
        } else{
            var negsCount = setMinesNegsCount(i, j, gBoard)
            elCell.innerText = negsCount === 0 ? EMPTY : negsCount
            if (negsCount === 0) expandShown(i, j, gBoard)
            if (checkVictory()) return
        }
    }
}

