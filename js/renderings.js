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

function cellClicked(elCell, i, j, ev) {
    if (!gGame.isOn) return
    if (gGame.clicksCount === 0) gMyIntervalId = setInterval(setTime, 10)
    gGame.clicksCount++
    renderMoves()
    if (ev.which === 3) {
        elCell.addEventListener("contextmenu", e => e.preventDefault());
        if (gBoard[i][j] === EMPTY || gBoard[i][j] === MINE) {
            if (gGame.markedCount === gMinesCount || !elCell.classList.contains('unrevealed')) return
            gBoard[i][j] = FLAG
            elCell.innerText = FLAG
            gGame.markedCount++
        }  else if (gBoard[i][j] = FLAG) {
            gBoard[i][j] = EMPTY
            elCell.innerText = EMPTY
            gGame.markedCount--
        }
    }
    if (ev.which === 1) {
        if(elCell.innerHTML === FLAG) return
        elCell.classList.remove('unrevealed')
        if (elCell.innerHTML === MINE) {
            gLives--
            var elLives = document.querySelector('.lives')
            elLives.innerText = elLives.innerText.slice(0, gLives)
            var elMine = document.querySelector(`.cell-${i}-${j} img`)
            elMine.style.display = 'block'
            elCell.classList.add('mine-hit')
            if (gLives === 0) {
                console.log('game over');
                gameOver()
                return
            }
        } else {
            var negsCount = setMinesNegsCount(i, j, gBoard)
            elCell.innerText = negsCount === 0 ? EMPTY : negsCount
            if (negsCount === 0) expandShown(i, j, gBoard)
            // console.log();
            if(checkVictory()) return
        }
    }
}