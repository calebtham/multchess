////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Game graphics functions
 * @author Caleb Tham
 */
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Make the program wait for specified number of milliseconds
 * @param {number} ms Number of milliseconds to wait
 * @returns Promise
 */
const delay = ms => new Promise(res => setTimeout(res, ms));

/**
 * Animates going from one screen to another
 * @param {HTMLElement} init Screen to move from
 * @param {HTMLElement} next Screen to move to
 */
async function animateChangeScreen(init, next) {
    init.style.opacity = "0";
    await delay(100);
    init.style.display = "none";
    next.style.opacity = "0";
    next.style.display = "block";
    await delay(100);
    next.style.transform = "translateY(-20px)";
    next.style.opacity = "1";
}

/**
 * Animates going from one screen to another (backwards animation)
 * @param {HTMLElement} init Screen to move from
 * @param {HTMLElement} next Screen to move to
 */
async function animateBack(init, next) {
    init.style.opacity = "0";
    init.style.transform = "translateY(20px)";
    await delay(100);
    init.style.display = "none";
    next.style.opacity = "0";
    next.style.display = "block";
    await delay(100);
    next.style.opacity = "1";
}

/**
 * Calculates the length each square should be depending on the window dimensions
 * @returns Length of each square
 */
 function getSquareSize() {
    if (boardCanvas) {
        return boardCanvas.offsetWidth / 8
    } else {
        return 65;
    }
    
}

/**
 * Return the board x and y coordinate corresponding to the mouse position
 * @param {MouseEvent} e Mouse event
 * @returns The board x and y coordinate
 */
function getMouseSquare(e) {
    return {
        "x": min(Math.floor(e.offsetX / squareSize),7), 
        "y": min(Math.floor(e.offsetY / squareSize),7)
    }
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
    updateChat();

    if (!me.opponentJoined) {
        boardCtx.fillStyle = "rgba(255,255,255,0.5)";
        boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
    }
}

/**
 * Updates html to show chat
 */
function updateChat() {

    if (!me.opponentJoined) {
        chatInput.disabled = true;
        chatButton.disabled = true;
    } else {
        chatInput.disabled = false;
        chatButton.disabled = false;
    }

    chatDisplay.innerHTML = game.chat.map(message => `
        <p class="${message.playerNumber == me.number ? "me" : "opponent"}">${htmlEntities(message.content)}</p>
    `).join('');
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

/**
 * Escapes a string to be outputted to html
 * @param {string} str The string
 * @returns The escaped string
 */
function htmlEntities(str) {
    var encodedStr = str.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
        return '&#'+i.charCodeAt(0)+';';
    });
    return encodedStr;
}


/**
 * Draws the board
 */
function drawBoard() {
    drawBoardColour();
    drawBoardPieces();
}

/**
 * Depending on the player object me, updates which buttons are shown/are active and what the label
 * says
 */
function updateButtons() {

    // If no game in progress
    if (!me.opponentJoined || game.board.isGameFinished) {
        drawButton.className = "btn btn-secondary";
        resignButton.className = "btn btn-secondary";
        
        drawButton.disabled = true;
        resignButton.disabled = true;
        
    // If game in progress
    } else {
        drawButton.className = "btn btn-primary";
        resignButton.className = "btn btn-danger";
        takebackButton.className = "btn btn-primary";

        drawButton.disabled = false;
        resignButton.disabled = false;
        takebackButton.disabled = false;

    }

    // If player is able to takeback
    if (((me.colour == Game.Piece.white && game.board.history)
        || (me.colour == Game.Piece.black && game.board.history && game.board.history.history))
        && !game.board.isGameFinished) {

        takebackButton.className = "btn btn-primary";
        takebackButton.disabled = false;

    // If player cannot takeback
    } else {
        takebackButton.className = "btn btn-secondary";
        takebackButton.disabled = true;
    }

    // If game finished
    if (game.board.isGameFinished && !me.rematchRequestRecieved && !me.opponentDisconnected) {
        rematchButton.className = "btn btn-success";
        rematchButton.disabled = false;

    // If game not finished
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

/**
 * Makes the accept and decline button visible
 */
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

    // Update the bottom and top labels
    bottomPlayerLabel.innerText = " You: " + me.score;

    if (me.opponentJoined) {
        topPlayerLabel.innerText = " Opponent: " + opponent.score;

        // Indicate which player turn it is with glow on text
        if (game.board.isGameFinished) {
            topPlayerLabel.classList.remove("glow");
            bottomPlayerLabel.classList.remove("glow");
        } else if (game.board.colourToMove == me.colour) {
            topPlayerLabel.classList.remove("glow");
            bottomPlayerLabel.classList.add("glow");
        } else {
            topPlayerLabel.classList.add("glow");
            bottomPlayerLabel.classList.remove("glow");
        }

    } else { 
        topPlayerLabel.innerHTML = "&nbsp;Waiting for opponent..."
    }

    // Highlight the active timer
    if (game.board.colourToMove == me.colour) {
        topTimerLabel.style.color = "rgba(255,255,255,0.5)";
        bottomTimerLabel.style.color = "rgba(255,255,255,0.9)";
    } else {
        topTimerLabel.style.color = "rgba(255,255,255,0.9)";
        bottomTimerLabel.style.color = "rgba(255,255,255,0.5)";
    }
}

/**
 * Updates the timers of both players according to their player object variable
 */
function updateTimerText() {
    if (me.timeLeft != null) {

        bottomTimerLabel.innerHTML = formatTimeFromSeconds(me.timeLeft);
    
        if (me.opponentJoined) {
            topTimerLabel.innerHTML = formatTimeFromSeconds(opponent.timeLeft);
        }

    } else {
        topTimerLabel.innerHTML = "&infin;"
        bottomTimerLabel.innerHTML = "&infin;";
    }
    
}

/**
 * Draws the pieces that a player has taken and the material advantage of winning player
 * Depending on the context given, shows either white pieces taken or black pieces taken
 * @param {CanvasRenderingContext2D} ctx Either top or bottom canvas context
 */
function drawTakenPieces(ctx) {
    let player = (ctx == topCtx) ? opponent : me;
    const offset = 20;
    let i = 0;

    ctx.clearRect(0,0,topCanvas.width,topCanvas.height);
    ctx.font = "16px sans-serif";

    // If drawing pieces white has taken
    if (player.colour == Game.Piece.white) {
        game.board.blackPiecesTaken.forEach(piece => {
            ctx.drawImage(IMG[piece], offset * i, 0, 20, 20);
            i++;
        });
        if (game.board.whiteAdvantage > 0) { // If white has advantage
            ctx.fillText(" + " + game.board.whiteAdvantage, offset * i, 17);
        }

    // If drawing pieces black has taken
    } else {
        game.board.whitePiecesTaken.forEach(piece => {
            ctx.drawImage(IMG[piece], offset * i, 0, 20, 20);
            i++;
        });
        if (game.board.whiteAdvantage < 0) { // If black has advantage
            ctx.fillText(" + " + -1 * game.board.whiteAdvantage, offset * i, 17);
        }
    }
    
}

/**
 * Draws the background for the board
 */
function drawBoardColour() {

    // Multiplier and offset used to flip board for black
    let multiplier = (me.colour == Game.Piece.white) ? 1 : -1;
    let offset = (me.colour == Game.Piece.white) ? 0 : 7;

    // Fill board dark brown
    boardCtx.fillStyle = BOARD_DARK;
    boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);

    for (let i = 0; i < 8; i++ ) {
        for (let j = 0; j < 8; j++) {

            // Alternate board squares light brown
            if ((i + j) % 2 == 0) { 
                colourSquare(offset + multiplier * i, offset + multiplier * j,BOARD_LIGHT);
            }

            // Highlight legal moves green
            if (game.board.isLegalMove[Game.convert2dTo1d(i,j)]) { 
                colourSquare(offset + multiplier * i, offset + multiplier * j,"rgb(0, 255,0,0.2)");
            }

            // Highlight squares that a piece has just moved to / from
            if (game.board.movedFrom == Game.convert2dTo1d(i,j) || game.board.movedTo == Game.convert2dTo1d(i,j)) {
                colourSquare(offset + multiplier * i, offset + multiplier * j,"rgb(255,255,0,0.2)");
            }

            // Highlight square red if just made invalid move from there
            if (game.board.invalid == Game.convert2dTo1d(i,j)) {
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
        if (i != game.board.hiddenSquare) {
            drawPiece(Game.convert1dTo2d(i).x, Game.convert1dTo2d(i).y, game.board.square[i]);
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

    // Multiplier and offset used to flip board for black
    let multiplier = (me.colour == Game.Piece.white) ? 1 : -1;
    let offset = (me.colour == Game.Piece.white) ? 0 : 7;

    x = offset + multiplier * x;
    y = offset + multiplier * y;

    if (Game.isPieceType(piece, Game.Piece.king)) {
        if ((game.board.whiteInCheck && Game.isPieceColour(piece, Game.Piece.white))
            || (game.board.blackInCheck && Game.isPieceColour(piece, Game.Piece.black))) {
                
                colourSquare(x, y, "rgb(255,0,0,0.5)")
        }
    }

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