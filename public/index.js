////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Handle index.html document variables and events
 * @author Caleb Tham
 */
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
let boardCanvas;
let boardCtx;
let topCanvas;
let topCtx;
let bottomCanvas;
let bottomCtx

// Initial screen elements
const initialScreen = document.getElementById("initialScreen");
const gameCodeInput = document.getElementById("gameCodeInput");
const newGameButton = document.getElementById("newGameButton");
const joinGameButton = document.getElementById("joinGameButton");
const errorLabel = document.getElementById("error");

// Create screen elements
const createScreen = document.getElementById("createScreen");
const startButton = document.getElementById("startButton");
const backButton = document.getElementById("backButton");
const oneMinButton = document.getElementById("oneMinButton");
const threeMinButton = document.getElementById("threeMinButton");
const fiveMinButton = document.getElementById("fiveMinButton");
const tenMinButton = document.getElementById("tenMinButton");
const fifteenMinButton = document.getElementById("fifteenMinButton");
const thirtyMinButton = document.getElementById("thirtyMinButton");
const sixtyMinButton = document.getElementById("sixtyMinButton");
const infiniteButton = document.getElementById("infiniteButton");
const noneButton = document.getElementById("noneButton");
const oneSecButton = document.getElementById("oneSecButton");
const threeSecButton = document.getElementById("threeSecButton");
const fiveSecButton = document.getElementById("fiveSecButton");
const tenSecButton = document.getElementById("tenSecButton");
const fifteenSecButton = document.getElementById("fifteenSecButton");
const thirtySecButton = document.getElementById("thirtySecButton");
const sixtySecButton = document.getElementById("sixtySecButton");
const whiteButton = document.getElementById("whiteButton");
const randomButton = document.getElementById("randomButton");
const blackButton = document.getElementById("blackButton");
 
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
const bottomTimerLabel = document.getElementById("bottomTimerLabel");
const topPlayerLabel = document.getElementById("topPlayerLabel");
const topTimerLabel = document.getElementById("topTimerLabel");
const opponentActivityLabel = document.getElementById("opponentActivity");

// Add event listeners
newGameButton.addEventListener("click", handleNewGameButton);
joinGameButton.addEventListener("click", handleJoinGameButton);

startButton.addEventListener("click", handleStartButton);
backButton.addEventListener("click", handleBackButton);

oneMinButton.addEventListener("click", handleTimerButton);
threeMinButton.addEventListener("click", handleTimerButton);
fiveMinButton.addEventListener("click", handleTimerButton);
tenMinButton.addEventListener("click", handleTimerButton);
fifteenMinButton.addEventListener("click", handleTimerButton);
thirtyMinButton.addEventListener("click", handleTimerButton);
sixtyMinButton.addEventListener("click", handleTimerButton);
infiniteButton.addEventListener("click", handleTimerButton);

noneButton.addEventListener("click", handleIncrementButton);
oneSecButton.addEventListener("click", handleIncrementButton);
threeSecButton.addEventListener("click", handleIncrementButton);
fiveSecButton.addEventListener("click", handleIncrementButton);
tenSecButton.addEventListener("click", handleIncrementButton);
fifteenSecButton.addEventListener("click", handleIncrementButton);
thirtySecButton.addEventListener("click", handleIncrementButton);
sixtySecButton.addEventListener("click", handleIncrementButton);

whiteButton.addEventListener("click", handleColourButton);
randomButton.addEventListener("click", handleColourButton);
blackButton.addEventListener("click", handleColourButton);

/**
 * Game setup variables
 */
var timer = 5; 
var increment = 0;
var colour;

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Document event handlers
 */

function handleColourButton(e) {
    var button = e.path[0];

    whiteButton.className = "btn btn-secondary";
    randomButton.className = "btn btn-secondary";
    blackButton.className = "btn btn-secondary";

    switch (button) {
        case whiteButton:
            colour = Piece.white;
            break;
        case document.getElementById("white"):
            colour = Piece.white;
            button = whiteButton
            break;
        case randomButton:
            colour = undefined;
            break;
        case blackButton:
            colour = Piece.black;
            break;
        case document.getElementById("black"):
            colour = Piece.black;
            button = blackButton
            break;
    }

    button.className = "btn btn-primary";

}

function handleIncrementButton(e) {
    var button = e.path[0];

    noneButton.className = "btn btn-secondary";
    oneSecButton.className = "btn btn-secondary";
    threeSecButton.className = "btn btn-secondary";
    fiveSecButton.className = "btn btn-secondary";
    tenSecButton.className = "btn btn-secondary";
    fifteenSecButton.className = "btn btn-secondary";
    thirtySecButton.className = "btn btn-secondary";
    sixtySecButton.className = "btn btn-secondary";

    button.className = "btn btn-primary";

    switch (button) {
        case noneButton:
            increment = 0;
            break;
        case oneSecButton:
            increment = 1;
            break;
        case threeSecButton:
            increment = 3;
            break;
        case fiveSecButton:
            increment = 5;
            break;
        case tenSecButton:
            increment = 10;
            break;
        case fifteenSecButton:
            increment = 15;
            break;
        case thirtySecButton:
            increment = 30;
            break;
        case sixtySecButton:
            increment = 60;
            break;
    }

}

function handleTimerButton(e) {
    alert("hello")
    var button = e.path[0];

    oneMinButton.className = "btn btn-secondary";
    threeMinButton.className = "btn btn-secondary";
    fiveMinButton.className = "btn btn-secondary";
    tenMinButton.className = "btn btn-secondary";
    fifteenMinButton.className = "btn btn-secondary";
    thirtyMinButton.className = "btn btn-secondary";
    sixtyMinButton.className = "btn btn-secondary";
    infiniteButton.className = "btn btn-secondary";

    button.className = "btn btn-primary";
    
    switch (button) {
        case oneMinButton:
            timer = 1;
            break;
        case threeMinButton:
            timer = 3;
            break;
        case fiveMinButton:
            timer = 5;
            break;
        case tenMinButton:
            timer = 10;
            break;
        case fifteenMinButton:
            timer = 15;
            break;
        case thirtyMinButton:
            timer = 30;
            break;
        case sixtyMinButton:
            timer = 60;
            break;
        case infiniteButton:
            timer = Infinity;
            noneButton.disabled = true;
            oneSecButton.disabled = true;
            threeSecButton.disabled = true;
            fiveSecButton.disabled = true;
            tenSecButton.disabled = true;
            fifteenSecButton.disabled = true;
            thirtySecButton.disabled = true;
            sixtySecButton.disabled = true;
            return;
    }

    noneButton.disabled = false;
    oneSecButton.disabled = false;
    threeSecButton.disabled = false;
    fiveSecButton.disabled = false;
    tenSecButton.disabled = false;
    fifteenSecButton.disabled = false;
    thirtySecButton.disabled = false;
    sixtySecButton.disabled = false;
}

function handleBackButton() {
    createScreen.style.display = "none";
    initialScreen.style.display = "block";
}

function handleNewGameButton() {
    initialScreen.style.display = "none";
    createScreen.style.display = "block";
}

/**
 * Function to indicate to server new game button was pressed
 */
 function handleStartButton() {
    createScreen.style.display = "none";
    gameScreen.style.display = "block";
    socket.emit("newGame", timer, increment, colour);
}

/**
 * Function to indicate to server join button was pressed
 */
function handleJoinGameButton() {
    socket.emit("joinGame", gameCodeInput.value);
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
 * Function to resize the game board graphics according to window size
 */
function handleResize() {
    const ratio = window.devicePixelRatio;

    squareSize = getSquareSize();

    boardCanvas.width = squareSize * 8 * ratio;
    boardCanvas.height = squareSize * 8 * ratio;
    topCanvas.width = squareSize * 8 * ratio;
    topCanvas.height = 20 * ratio;
    bottomCanvas.width = squareSize * 8 * ratio;
    bottomCanvas.height = 20 * ratio;

    const width = boardCanvas.width / ratio;
    const height = boardCanvas.height / ratio;

    boardCanvas.style.width = width + "px";
    boardCanvas.style.height = height + "px";
    topCanvas.style.width = width + "px";
    topCanvas.style.height = "20px";
    bottomCanvas.style.width = width + "px";
    bottomCanvas.style.height = "20px";

    boardCtx.scale(ratio, ratio);
    topCtx.scale(ratio, ratio);
    bottomCtx.scale(ratio, ratio);

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
        if (board.inHand ^ Piece.none && 
            (!isPieceColour(board.square[boardIndex], board.colourToMove)
                || board.isLegalMove[boardIndex])) { 
    
            var start = board.movedFrom

            var madeMove = makeMove(start, boardIndex, false);

            if (!madeMove) {
                board.invalid = start;
                board.isLegalMove = new Array(64).fill(false);
                board.hiddenSquare = -1;
                board.inHand = Piece.none;
                board.movedTo = boardIndex;
                drawBoard();
                
            } else {
                board.isLegalMove = new Array(64).fill(false);
                board.hiddenSquare = -1;
                board.inHand = Piece.none;
                board.movedTo = boardIndex;
                board.movedFrom = start;
                drawBoard();
                socket.emit("moveMade", board); // Move will actually be made server-side. Still make move in client side for purpose of graphics and reducing load on server by prechecking (e.g. showing legal moves, clicking an invalid target square)
            }

    
        // Picking up a piece of correct colour and is player's turn
        } else if (isPieceColour(board.square[boardIndex],board.colourToMove)
                && board.colourToMove == me.colour) {

                    if (board.inHand ^ Piece.none && board.movedFrom == boardIndex) {
                        board.isLegalMove = new Array(64).fill(false);
                        board.hiddenSquare = -1;
                        board.inHand = Piece.none;
                        board.movedFrom = -1;
                        drawBoard();

                    } else {
                        board.isLegalMove = new Array(64).fill(false);

                        generateLegalMoves(boardIndex, true).forEach(move => {
                            board.isLegalMove[decode(move).target] = true;
                        });
                
                        board.inHand = board.square[boardIndex];
                        board.movedTo = -1
                        board.movedFrom = boardIndex
                        board.hiddenSquare = -1;
                
                        drawBoard();

                        board.hiddenSquare = boardIndex;                        
                    }
            
    
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
    var boardIndex = convert2dTo1d(offset + mouse.x * multiplier, offset + mouse.y * multiplier);

    drawBoard();

    if (board.inHand ^ Piece.none) {
        if (isPieceColour(board.square[boardIndex], me.colour) && !board.isLegalMove[boardIndex]) {
            let square = convert1dTo2d(board.hiddenSquare);
            drawPiece(square.x, square.y, board.inHand);
            colourSquare(mouse.x, mouse.y, "rgba(255,255,255,0.3)");
        } else {
            drawPiece(offset + mouse.x * multiplier, offset + mouse.y * multiplier, board.inHand);
        }
        
    } else if (window.innerWidth > 500) {
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
    drawBoard();
}

////////////////////////////////////////////////////////////////////////////////////////////////////

