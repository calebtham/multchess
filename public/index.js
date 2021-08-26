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

// Store images of all pieces in an object. Image name corresponds to their respective piece number
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
};

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
const quickMatchButton = document.getElementById("quickMatchButton");
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
quickMatchButton.addEventListener("click", handleQuickMatchButton)
newGameButton.addEventListener("click", handleNewGameButton);
joinGameButton.addEventListener("click", handleJoinGameButton);
gameCodeInput.addEventListener("keypress", handleGameCodeKeyPress);

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

/**
 * Indicates to server that timer should be updated
 */
function handleVisibilityChange() {
    socket.emit("timeout"); // If not timeout, just updates timer - so when switch tabs, timer display still accurate
}

/**
 * If enter is pressed, attempts to join game
 * @param {KeyboardEvent} e 
 */
function handleGameCodeKeyPress(e) {
    if (e.key == "Enter") {
        handleJoinGameButton();
    } else { // If there was an error before, disregard it
        gameCodeInput.className = "";
        errorLabel.innerText = "";
    }
}

/**
 * Changes "start as" button group appearance and sets the colour to play as
 * @param {MouseEvent} e Mouse event
 */
function handleColourButton(e) {
    var button = e.target;

    // De-select all buttons
    whiteButton.className = "btn btn-secondary";
    randomButton.className = "btn btn-secondary";
    blackButton.className = "btn btn-secondary";

    // Choose which button to select and update colour
    switch (button) {
        case whiteButton:
        case document.getElementById("white"): // Add this case since this is the target if press image
            colour = Piece.white;
            button = whiteButton
            break;
        case randomButton:
            colour = undefined;
            break;
        case blackButton:
        case document.getElementById("black"): // Add this case since this is the target if press image
            colour = Piece.black;
            button = blackButton
            break;
    }

    button.className = "btn btn-primary";

}

/**
 * Changes "increment" button group appearance and sets the timer increment
 * @param {MouseEvent} e 
 */
function handleIncrementButton(e) {
    var button = e.target;

    // De-select all buttons
    noneButton.className = "btn btn-secondary";
    oneSecButton.className = "btn btn-secondary";
    threeSecButton.className = "btn btn-secondary";
    fiveSecButton.className = "btn btn-secondary";
    tenSecButton.className = "btn btn-secondary";
    fifteenSecButton.className = "btn btn-secondary";
    thirtySecButton.className = "btn btn-secondary";
    sixtySecButton.className = "btn btn-secondary";

    // Select chosen button
    button.className = "btn btn-primary";

    // Update increment
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

/**
 * Changes "timer" button group appearance and sets the timer
 * @param {MouseEvent} e 
 */
function handleTimerButton(e) {
    var button = e.target;

    // De-select all buttons
    oneMinButton.className = "btn btn-secondary";
    threeMinButton.className = "btn btn-secondary";
    fiveMinButton.className = "btn btn-secondary";
    tenMinButton.className = "btn btn-secondary";
    fifteenMinButton.className = "btn btn-secondary";
    thirtyMinButton.className = "btn btn-secondary";
    sixtyMinButton.className = "btn btn-secondary";
    infiniteButton.className = "btn btn-secondary";

    // Select chosen button
    button.className = "btn btn-primary";
    
    // Update timer
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
        case infiniteButton: // If infinite selected, disable increment buttons
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

    // If not infinite selected, enable all increment buttons
    noneButton.disabled = false;
    oneSecButton.disabled = false;
    threeSecButton.disabled = false;
    fiveSecButton.disabled = false;
    tenSecButton.disabled = false;
    fifteenSecButton.disabled = false;
    thirtySecButton.disabled = false;
    sixtySecButton.disabled = false;
}

/**
 * Hide create screen and show initial screen
 */
function handleBackButton() {
    createScreen.style.display = "none";
    initialScreen.style.display = "block";
}

/**
 * Hide initial screen and go to game screen. Indicate to server to find quick match
 */
function handleQuickMatchButton() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";
    socket.emit("quickMatch");
}

/**
 * Hide initial screen and go to create screen
 */
function handleNewGameButton() {
    initialScreen.style.display = "none";
    createScreen.style.display = "block";
}

/**
 * Hide create screen and go to game screen. Indicate to server to start new game with options set 
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
 * Indicates to server user declined a request
 */
 function handleDeclineButton() {
    socket.emit("decline");
}

/**
 * Indicate to server user accepted a request and which request was accepted
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
 * Indicate to server that a rematch request has been sent
 */
function handleRematchButton() {
    socket.emit("rematchRequest");
}

/**
 * Indicate to server that a takeback request has been sent
 */
function handleTakebackButton() {
    socket.emit("takebackRequest");
}

/**
 * Indicate to server that a draw request has been sent
 */
function handleDrawButton() {
    socket.emit("drawRequest");
}

/**
 * Indicate to server that the user resigned
 */
function handleResignButton() {
    socket.emit("resign");
}

/**
 * Resize the game board graphics according to window size
 */
function handleResize() {
    const ratio = window.devicePixelRatio;

    squareSize = getSquareSize();

    // Set canvas height and width
    boardCanvas.width = squareSize * 8 * ratio;
    boardCanvas.height = squareSize * 8 * ratio;
    topCanvas.width = squareSize * 8 * ratio;
    topCanvas.height = 20 * ratio;
    bottomCanvas.width = squareSize * 8 * ratio;
    bottomCanvas.height = 20 * ratio;

    // Set CSS height and width
    const width = boardCanvas.width / ratio;
    const height = boardCanvas.height / ratio;

    boardCanvas.style.width = width + "px";
    boardCanvas.style.height = height + "px";
    topCanvas.style.width = width + "px";
    topCanvas.style.height = "20px";
    bottomCanvas.style.width = width + "px";
    bottomCanvas.style.height = "20px";

    // Scale by device pixel ratio, so graphics are not blurry
    boardCtx.scale(ratio, ratio);
    topCtx.scale(ratio, ratio);
    bottomCtx.scale(ratio, ratio);

    updateGraphics();
}

/**
 * Either attempts to pick up a piece or, if a piece already in hand, place a piece on the square 
 * corresponding to mouse position
 * If a piece is successfully placed, indicate to server to update game state
 * @param {MouseEvent} e Mouse event
 */
function handleClick(e) {
    if (!board.isGameFinished) {

        // Multiplier and offset used to flip board if player is black
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

            // If move was invalid, update graphics indicating so
            if (!madeMove) { 
                board.invalid = start;
                board.isLegalMove = new Array(64).fill(false);
                board.hiddenSquare = -1;
                board.inHand = Piece.none;
                board.movedTo = boardIndex;
                drawBoard();
            
            // If move was valid, update graphics on client-side before checking move on server
            } else {
                board.isLegalMove = new Array(64).fill(false);
                board.hiddenSquare = -1;
                board.inHand = Piece.none;
                board.movedTo = boardIndex;
                board.movedFrom = start;
                updateGraphics();
                socket.emit("moveMade", board); // Move will actually be made server-side. Still make move in client side for purpose of graphics and reducing load on server by prechecking (e.g. showing legal moves, clicking an invalid target square)
            }

    
        // Picking up a piece of correct colour and is player's turn
        } else if (isPieceColour(board.square[boardIndex],board.colourToMove)
                && board.colourToMove == me.colour) {

                    // If piece already in hand and click on the same piece, deselect piece
                    if (board.inHand ^ Piece.none && board.movedFrom == boardIndex) {
                        board.isLegalMove = new Array(64).fill(false);
                        board.hiddenSquare = -1;
                        board.inHand = Piece.none;
                        board.movedFrom = -1;
                        drawBoard();

                    // If picking up new piece, show legal moves
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
 * Highlights the square the mouse is hovering over (and to draw piece if in hand) if non touch
 * screen device
 * @param {MouseEvent} e Mouse event 
 */
function handleHover(e) {
    if (!isTouchDevice()) {
        
        // Multiplier and offset used to flip board if player is black
        var multiplier = (me.colour == Piece.white) ? 1 : -1;
        var offset = (me.colour == Piece.white) ? 0 : 7;
        var mouse = getMouseSquare(e);
        var boardIndex = convert2dTo1d(offset + mouse.x * multiplier, offset + mouse.y * multiplier);
    
        drawBoard();
    
        // If piece in hand, draw piece
        if (board.inHand ^ Piece.none) {
            if (isPieceColour(board.square[boardIndex], me.colour) && !board.isLegalMove[boardIndex]) {
                let square = convert1dTo2d(board.hiddenSquare);
                drawPiece(square.x, square.y, board.inHand);
                colourSquare(mouse.x, mouse.y, "rgba(255,255,255,0.3)");
            } else {
                drawPiece(offset + mouse.x * multiplier, offset + mouse.y * multiplier, board.inHand);
            }
            
        // Else, draw highlight
        } else {
            colourSquare(mouse.x, mouse.y, "rgba(255,255,255,0.3)");
        }
    }
}

/**
 * Stops board highlights
 * @param {MouseEvent} e Mouse event
 */
function handleMouseLeave(e) {
    board.isLegalMove = new Array(64).fill(false);
    board.hiddenSquare = -1;
    board.inHand = Piece.none;    
    drawBoard();
}

////////////////////////////////////////////////////////////////////////////////////////////////////

