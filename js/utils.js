function renderBoard(mat, selector) {

    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            var cell = (mat[i][j] === MINE) ? MINE : EMPTY
            const className = 'cell unrevealed cell-' + i + '-' + j
            strHTML += `<td onMousedown="cellClicked(this, ${i}, ${j}, event)" class="${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}


function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    console.log(`.cell-${location.i}-${location.j}`);
    console.log('elCell', elCell);
    elCell.innerHTML = value
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

