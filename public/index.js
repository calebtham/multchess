////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @author Caleb Tham
 */

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Initialise socket variables and events
 */
const socket = io("https://lit-fortress-90404.herokuapp.com/");
//const socket = io("localhost:3000");

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("opponentJoined", handleOpponentJoined);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);
/** */

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Initialise document variables and events
 */
const BOARD_WHITE = "#f0d9b5";
const BOARD_BLACK = "#b58863";
const IMG = { 
    "9": document.getElementById("9"),
    "10": document.getElementById("10"),
    "11": document.getElementById("11"),
    "12": document.getElementById("12"),
    "13": document.getElementById("13"),
    "14": document.getElementById("14"),
    "17": document.getElementById("17"),
    "18": document.getElementById("18"),
    "19": document.getElementById("19"),
    "20": document.getElementById("20"),
    "21": document.getElementById("21"),
    "22": document.getElementById("22")
}; // Store images of all pieces in an object

let squareSize = getSquareSize();
let canvas;
let ctx;


// Initial screen elements
const initialScreen = document.getElementById("initialScreen");
const gameCodeInput = document.getElementById("gameCodeInput");
const newGameButton = document.getElementById("newGameButton");
const joinGameButton = document.getElementById("joinGameButton");
const errorLabel = document.getElementById("error");
 
// Game screen elements
const gameScreen = document.getElementById("gameScreen");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");
const takebackButton = document.getElementById("takebackButton");
const drawButton = document.getElementById("drawButton");
const resignButton = document.getElementById("resignButton");
const rematchButton = document.getElementById("rematchButton");
const acceptButton = document.getElementById("acceptButton");
const declineButton = document.getElementById("declineButton");
const bottomPlayerLabel = document.getElementById("bottomPlayerLabel");
const topPlayerLabel = document.getElementById("topPlayerLabel");
const opponentActivityLabel = document.getElementById("opponentActivity");

newGameButton.addEventListener("click", handleNewGame);
joinGameButton.addEventListener("click", handleJoinGame);
/** */

////////////////////////////////////////////////////////////////////////////////////////////////////

/** 
 * Initialise game variables
 */

let board;
let me;
let opponent;

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Function to update variables and document elements for when 2nd opponent has joined
 */
 function handleOpponentJoined() {
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mousemove", handleHover);
    canvas.addEventListener("mouseleave", handleMouseLeave)
    rematchButton.addEventListener("click", handleRematchButton);
    takebackButton.addEventListener("click", handleTakebackButton);
    drawButton.addEventListener("click", handleDrawButton);
    resignButton.addEventListener("click", handleResignButton);
    acceptButton.addEventListener("click", handleAcceptButton);
    declineButton.addEventListener("click", handleDeclineButton);
}

/**
 * Function to display to user that the game corresponding to gamecode is full
 */
function handleTooManyPlayers() {
    gameCodeInput.style.backgroundColor = "rgba(255,200,200)";
    errorLabel.innerText = "Game already in progress"
}

/**
 * Function to display to user that the game corresponding to gamecode does not exist
 */
function handleUnknownGame() {
    gameCodeInput.style.backgroundColor = "rgba(255,200,200)";
    errorLabel.innerText = "Game not found"
}

/**
 * Function to indicate to server new game button was pressed
 */
 function handleNewGame() {
    socket.emit("newGame");
}

/**
 * Function to indicate to server join button was pressed
 */
function handleJoinGame() {
    socket.emit("joinGame", gameCodeInput.value);
}

/**
 * Given a game state, updates the client game state
 * @param {Object} state    The game state (i.e. a board object)
 */
function handleGameState(state, number) {
    board = state.game.board;
    me = state[number];
    opponent = state[3 - number];
    updateGraphics();
} 

/**
 * Function to carry out appropriate action when user declines a request. Indicates to server what
 * action to carry out
 */
 function handleDeclineButton() {
    socket.emit("decline");
}

/**
 * Function to carry out appropriate action when user accepts a request. Indicates to server what
 * action to carry out
 */
function handleAcceptButton() {

    if (me.rematchRequestRecieved) {
        socket.emit("rematchAccept");

    } else if (me.takebackRequestRecieved) {
        socket.emit("takebackAccept");

    } else if (me.drawRequestRecieved) {
        socket.emit("drawAccept");
    }
}

/**
 * Function to indicate to server that a rematch request has been sent
 */
function handleRematchButton() {
    socket.emit("rematchRequest");
}

/**
 * Function to indicate to server that a takeback request has been sent
 */
function handleTakebackButton() {
    socket.emit("takebackRequest");
}

/**
 * Function to indicate to server that a draw request has been sent
 */
function handleDrawButton() {
    socket.emit("drawRequest");
}

/**
 * Function to indicate to server that the user resigned
 */
function handleResignButton() {
    socket.emit("resign");
}

/**
 * Given a game state, updates client game state and performs actions to initalise the game
 * Changes screen from the inital menu to the game screen
 * Initialises the event listeners, canvas, and variables for the game
 * @param {Object} state The game state (i.e. a board object)
 */
function handleInit(gameCode, state, number) {
    gameCodeDisplay.innerText = gameCode;

    board = state.game.board;
    me = state[number];
    opponent = state[3 - number]

    initialScreen.style.display = "none";
    gameScreen.style.display = "block";
    window.addEventListener("resize", handleResize);

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    handleResize();
}

/**
 * Function to resize the game board graphics according to window size
 */
function handleResize() {
    squareSize = getSquareSize();

    canvas.width = squareSize * 8
    canvas.height = squareSize * 8

    const ratio = window.devicePixelRatio;
    const width = canvas.width;
    const height = canvas.height;

    canvas.width *= ratio;
    canvas.height *= ratio;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.scale(ratio, ratio);

    updateGraphics();
}

/**
 * Function either attempts to pick up a piece or, if a piece already in hand, place a piece on the
 * square corresponding to mouse position
 * If a piece is successfully placed, indicate to server to update game state
 * @param {MouseEvent} e Mouse event
 */
function handleClick(e) {
    if (!board.isGameFinished) {

        var multiplier = (me.colour == Piece.white) ? 1 : -1;
        var offset = (me.colour == Piece.white) ? 0 : 7;
    
        var mouse = getMouseSquare(e);
        var boardIndex = convert2dTo1d(offset + mouse.x * multiplier, offset + mouse.y * multiplier);
    
        board.invalid = -1;
    
        // Dropping a piece
        if (board.inHand ^ Piece.none) { 
    
            var start = board.movedFrom

            if (start == boardIndex) {
                board.isLegalMove = new Array(64).fill(false);
                board.hiddenSquare = -1;
                board.inHand = Piece.none;
                board.movedFrom = -1;
                updateGraphics();

            } else {
                var madeMove = makeMove(start, boardIndex, false);

                if (!madeMove) {
                    board.invalid = start;
                    board.isLegalMove = new Array(64).fill(false);
                    board.hiddenSquare = -1;
                    board.inHand = Piece.none;
                    board.movedTo = boardIndex;
                    updateGraphics();
                    
                } else {
                    socket.emit("moveMade", board); // Move will actually be made server-side. Still make move in client side for purpose of prechecking (to reduce load on server) and graphics (e.g. clicking an invalid target square)
                }
            }
    
        // Picking up a piece of correct colour and is player's turn
        } else if (board.square[boardIndex] ^ Piece.none 
                && isPieceColour(board.square[boardIndex],board.colourToMove)
                && board.colourToMove == me.colour) {
    
            generateLegalMoves(boardIndex, true).forEach(move => {
                board.isLegalMove[decode(move).target] = true;
            });
    
            board.inHand = board.square[boardIndex];
            board.movedTo = -1
            board.movedFrom = boardIndex
    
            updateGraphics();
    
            board.hiddenSquare = boardIndex;
    
        } 
    }
    
}

/**
 * Function to highlight the square the mouse is hovering over (and to draw piece if in hand)
 * @param {MouseEvent} e Mouse event 
 */
function handleHover(e) {
    var mouse = getMouseSquare(e);
    var multiplier = (me.colour == Piece.white) ? 1 : -1;
    var offset = (me.colour == Piece.white) ? 0 : 7;

    updateGraphics();

    if (board.inHand ^ Piece.none) {
        drawPiece(offset + mouse.x * multiplier, offset + mouse.y * multiplier, board.inHand);
    } else {
        colourSquare(mouse.x, mouse.y, "rgba(255,255,255,0.3)");
    }
}

/**
 * Function to stop board highlights
 * @param {MouseEvent} e Mouse event
 */
function handleMouseLeave(e) {
    board.isLegalMove = new Array(64).fill(false);
    board.hiddenSquare = -1;
    board.inHand = Piece.none;    
    updateGraphics();
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Calculates the length each square should be depending on the window dimensions
 * @returns Length of each square
 */
 function getSquareSize() {
    if (window.innerWidth > 500) {

        return min(
            min(42 + Math.floor(((window.innerWidth - 500) / 350) * 28), 70), // min of 42, linearly scales up with window width, max of 70
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
    drawBoardColour();
    drawBoardPieces();
    updateText();
    updateButtons();

    if (!me.opponentJoined) {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
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
    if (board.isGameFinished && !me.rematchRequestRecieved && !me.disconnected) {
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

    } else if (me.disconnected) {
        opponentActivityLabel.innerHTML = "Opponent disconnected";

    } else if (me.declinedRequest) {
        opponentActivityLabel.innerHTML = "Opponent declined request";

    } else if (me.resigned) {
        opponentActivityLabel.innerHTML = "Opponent resigned";

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

    //infoLabel.innerText = colourToMoveCaps() + " to move.";

    bottomPlayerLabel.innerText = "You: " + me.score;

    if (me.opponentJoined) {
        topPlayerLabel.innerText = "Opponent: " + opponent.score;

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
}

/**
 * Draws the background for the board
 */
function drawBoardColour() {

    ctx.fillStyle = BOARD_BLACK;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    ctx.drawImage(IMG[piece], squareSize * x, squareSize * y, squareSize, squareSize);
}

/**
 * Colours the square on the given coordinate to the given colour
 * @param {number} x The x coordinate on the board
 * @param {number} y The y coordinate on the board
 * @param {string} colour The colour of the square
 */
function colourSquare(x, y, colour) {
    ctx.fillStyle = colour;
    ctx.fillRect(squareSize * x, squareSize * y, squareSize, squareSize);
}

////////////////////////////////////////////////////////////////////////////////////////////////////

function testMoveGeneration() {
    var time = -Date.now()
    for (let i=0; i<100; i++) {
        generateAllLegalMoves(true);
    }
    time += Date.now();
    return time;
}
