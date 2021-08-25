////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Game graphics functions
 * @author Caleb Tham
 */
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Calculates the length each square should be depending on the window dimensions
 * @returns Length of each square
 */
 function getSquareSize() {
    if (window.innerWidth > 500) {

        return min(
            min(37 + Math.floor(((window.innerWidth - 500) / 350) * 28), 65), // min of 37, linearly scales up with window width, max of 65
            Math.floor(window.innerHeight / 8) // 8th of window width
        );

    } else {
        return Math.floor(window.innerWidth / 8);
    }
}

/**
 * Return the board x and y coordinate corresponding to the mouse position
 * @param {MouseEvent} e Mouse event
 * @returns The board x and y coordinate
 */
function getMouseSquare(e) {
    return {"x": min(Math.floor(e.offsetX / squareSize),7), 
            "y": min(Math.floor(e.offsetY / squareSize),7)}
}

/**
 * Draws the board and updates the text and buttons
 */
function updateGraphics() {
    drawBoard();
    drawTakenPieces(topCtx);
    drawTakenPieces(bottomCtx);
    updateTimerText();
    updateText();
    updateButtons();

    if (!me.opponentJoined) {
        boardCtx.fillStyle = "rgba(255,255,255,0.5)";
        boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
    }
}

function drawBoard() {
    drawBoardColour();
    drawBoardPieces();
}

/**
 * Depending on the opponent activity booleans, updates which buttons are shown/are active
 * and indicates to user the opponent's activity
 */
function updateButtons() {

    // If no game in progress
    if (!me.opponentJoined || board.isGameFinished) {
        drawButton.className = "btn btn-secondary";
        resignButton.className = "btn btn-secondary";
        
        drawButton.disabled = true;
        resignButton.disabled = true;
        
    } else {
        drawButton.className = "btn btn-primary";
        resignButton.className = "btn btn-danger";
        takebackButton.className = "btn btn-primary";

        drawButton.disabled = false;
        resignButton.disabled = false;
        takebackButton.disabled = false;

    }

    // If player is able to takeback
    if (((me.colour == Piece.white && board.history)
        || (me.colour == Piece.black && board.history && board.history.history))
        && !board.isGameFinished) {

        takebackButton.className = "btn btn-primary";
        takebackButton.disabled = false;

    } else {
        takebackButton.className = "btn btn-secondary";
        takebackButton.disabled = true;
    }

    // If game finished
    if (board.isGameFinished && !me.rematchRequestRecieved && !me.opponentDisconnected) {
        rematchButton.className = "btn btn-success";
        rematchButton.disabled = false;
        
    } else {
        rematchButton.className = "btn btn-secondary";
        rematchButton.disabled = true;
    }

    // Handle the request text and buttons
    acceptButton.hidden = true;
    declineButton.hidden = true;

    if (me.takebackRequestRecieved) {
        showAcceptDecline();
        opponentActivityLabel.innerHTML = "Opponent requests a takeback";

    } else if (me.rematchRequestRecieved) {
        showAcceptDecline();
        opponentActivityLabel.innerHTML = "Opponent requests a rematch";

    } else if (me.drawRequestRecieved) {
        showAcceptDecline();
        opponentActivityLabel.innerHTML = "Opponent requests a draw";

    } else if (me.takebackRequestSent) {
        takebackButton.className = "btn btn-secondary"
        takebackButton.disabled = true;
        opponentActivityLabel.innerHTML = "Takeback request sent";

    } else if (me.rematchRequestSent) {
        rematchButton.className = "btn btn-secondary"
        rematchButton.disabled = true;
        opponentActivityLabel.innerHTML = "Rematch request sent";

    } else if (me.drawRequestSent) {
        drawButton.className = "btn btn-secondary"
        drawButton.disabled = true;
        opponentActivityLabel.innerHTML = "Draw request sent";

    } else if (me.opponentDisconnected) {
        opponentActivityLabel.innerHTML = "Opponent disconnected";

    } else if (me.requestDeclined) {
        opponentActivityLabel.innerHTML = "Opponent declined request";

    } else if (me.opponentResigned) {
        opponentActivityLabel.innerHTML = "Opponent resigned. You won!";
        
    } else if (me.opponentTimedOut) {
        opponentActivityLabel.innerHTML = "Opponent timed out. You won!";

    } else if (me.timedOut) {
        opponentActivityLabel.innerHTML = "You timed out. You lost!";

    } else if (me.won) {
        opponentActivityLabel.innerHTML = "You won!";

    } else if (me.lost) {
        opponentActivityLabel.innerHTML = "You lost!";

    } else if (me.stalemate) {
        opponentActivityLabel.innerHTML = "It's a draw!";
    
    } else {
        opponentActivityLabel.innerHTML = "";

    }
}

function showAcceptDecline() {
    takebackButton.disabled = true;
    drawButton.disabled = true;
    resignButton.disabled = true;
    rematchButton.disabled = true;

    takebackButton.className = "btn btn-secondary";
    drawButton.className = "btn btn-secondary";
    resignButton.className = "btn btn-secondary";
    rematchButton.className = "btn btn-secondary";

    acceptButton.hidden = false;
    declineButton.hidden = false;
}

/**
 * Updates the text above and below the chess board
 * Indicates whose turn it is
 */
function updateText() {
    bottomPlayerLabel.innerText = " You: " + me.score;

    if (me.opponentJoined) {
        topPlayerLabel.innerText = " Opponent: " + opponent.score;

        if (board.isGameFinished) {
            topPlayerLabel.classList.remove("glow");
            bottomPlayerLabel.classList.remove("glow");
        } else if (board.colourToMove == me.colour) {
            topPlayerLabel.classList.remove("glow");
            bottomPlayerLabel.classList.add("glow");
        } else {
            topPlayerLabel.classList.add("glow");
            bottomPlayerLabel.classList.remove("glow");
        }

    } else { 
        topPlayerLabel.innerText = "Waiting for opponent to join..."
    }

    if (board.colourToMove == me.colour) {
        topTimerLabel.style.color = "rgba(255,255,255,0.5)";
        bottomTimerLabel.style.color = "rgba(255,255,255,0.9)";
    } else {
        topTimerLabel.style.color = "rgba(255,255,255,0.9)";
        bottomTimerLabel.style.color = "rgba(255,255,255,0.5)";
    }
}

function updateTimerText() {
    if (me.timeLeft != null) {
        var minutes;
        var seconds;
    
        minutes = Math.floor(me.timeLeft / 60);
        seconds = me.timeLeft - (minutes * 60);
        let fraction = (me.timeLeft < 60) ? 2 : 0;
        minutes = minutes.toLocaleString('en-UK', {minimumIntegerDigits: 2, maximumFractionDigits: 0, useGrouping:false});
        seconds = seconds.toLocaleString('en-UK', {minimumIntegerDigits: 2, maximumFractionDigits: fraction, minimumFractionDigits: fraction, useGrouping:false});
        if (seconds == "60") {
            seconds = "59";
        }
    
        bottomTimerLabel.innerText = minutes + ":" + seconds;
    
        if (me.opponentJoined) {
            minutes = Math.floor(opponent.timeLeft / 60);
            seconds = opponent.timeLeft - (minutes * 60);
            let fraction = (opponent.timeLeft < 60) ? 2 : 0;
            minutes = minutes.toLocaleString('en-UK', {minimumIntegerDigits: 2, maximumFractionDigits: 0, useGrouping:false});
            seconds = seconds.toLocaleString('en-UK', {minimumIntegerDigits: 2, maximumFractionDigits: fraction, minimumFractionDigits: fraction, useGrouping:false});
            if (seconds == "60") {
                seconds = "59";
            }

            topTimerLabel.innerText = minutes + ":" + seconds;
        }
    } else {
        topTimerLabel.innerHTML = "&infin;"
        bottomTimerLabel.innerHTML = "&infin;";
    }
    
}

function drawTakenPieces(ctx) {
    var player = (ctx == topCtx) ? opponent : me;
    const offset = 20;
    let i = 0;

    ctx.clearRect(0,0,topCanvas.width,topCanvas.height);
    ctx.font = "16px sans-serif";

    if (player.colour == Piece.white) {
        board.blackPiecesTaken.forEach(piece => {
            ctx.drawImage(IMG[piece], offset * i, 0, 20, 20);
            i++;
        });
        if (board.whiteAdvantage > 0) {
            ctx.fillText(" + " + board.whiteAdvantage, offset * i, 17);
        }
    } else {
        board.whitePiecesTaken.forEach(piece => {
            ctx.drawImage(IMG[piece], offset * i, 0, 20, 20);
            i++;
        });
        if (board.whiteAdvantage < 0) {
            ctx.fillText(" + " + -1 * board.whiteAdvantage, offset * i, 17);
        }
    }
    
}

/**
 * Draws the background for the board
 */
function drawBoardColour() {

    boardCtx.fillStyle = BOARD_BLACK;
    boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);

    var multiplier = (me.colour == Piece.white) ? 1 : -1;
    var offset = (me.colour == Piece.white) ? 0 : 7;

    for (let i = 0; i < 8; i++ ) {
        for (let j = 0; j < 8; j++) {
            if ((i + j) % 2 == 0) {
                colourSquare(offset + multiplier * i, offset + multiplier * j,BOARD_WHITE);
            }
            if (board.isLegalMove[convert2dTo1d(i,j)]) {
                colourSquare(offset + multiplier * i, offset + multiplier * j,"rgb(0, 255,0,0.2)");
            }
            if (board.movedFrom == convert2dTo1d(i,j) || board.movedTo == convert2dTo1d(i,j)) {
                colourSquare(offset + multiplier * i, offset + multiplier * j,"rgb(255,255,0,0.2)");
            }
            if (board.invalid == convert2dTo1d(i,j)) {
                colourSquare(offset + multiplier * i, offset + multiplier * j,"rgb(255,0,0,0.5)");
            }
        }
    }

    
}

/**
 * Draws the pieces on the board
 */
function drawBoardPieces() {
    for (let i = 0; i < 64; i++) {
        if (i != board.hiddenSquare) {
            drawPiece(convert1dTo2d(i).x, convert1dTo2d(i).y, board.square[i]);
        }
    }
}

/**
 * Given coordinates and a piece, draws the piece on that coordinate
 * @param {number} x The x coordinate of the piece
 * @param {number} y The y coordinate of the piece
 * @param {number} piece The piece
 */
function drawPiece(x, y, piece) {
    if (piece == 0) return;

    var multiplier = (me.colour == Piece.white) ? 1 : -1;
    var offset = (me.colour == Piece.white) ? 0 : 7;

    x = offset + multiplier * x;
    y = offset + multiplier * y;

    boardCtx.drawImage(IMG[piece], squareSize * x, squareSize * y, squareSize, squareSize);
}

/**
 * Colours the square on the given coordinate to the given colour
 * @param {number} x The x coordinate on the board
 * @param {number} y The y coordinate on the board
 * @param {string} colour The colour of the square
 */
function colourSquare(x, y, colour) {
    boardCtx.fillStyle = colour;
    boardCtx.fillRect(squareSize * x, squareSize * y, squareSize, squareSize);
}