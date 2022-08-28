/**
 * ================================================
 * Handle index.html document variables and events
 * @author Caleb Tham
 * ================================================
 */

/**
 * ================================================
 * Initialise document variables and events
 * ================================================
 */

// Initial screen elements
const initialScreen = document.getElementById("initial-screen");
const gameCodeInput = document.getElementById("game-code-input");
const newGameButton = document.getElementById("new-game-button");
const joinGameButton = document.getElementById("join-game-button");
const quickMatchButton = document.getElementById("quick-match-button");
const errorLabel = document.getElementById("error");

// Create screen elements
const createScreen = document.getElementById("create-screen");
const startButton = document.getElementById("start-button");
const backButton = document.getElementById("back-button");
const oneMinButton = document.getElementById("one-min-button");
const threeMinButton = document.getElementById("three-min-button");
const fiveMinButton = document.getElementById("five-min-button");
const tenMinButton = document.getElementById("ten-min-button");
const fifteenMinButton = document.getElementById("fifteen-min-button");
const thirtyMinButton = document.getElementById("thirty-min-button");
const sixtyMinButton = document.getElementById("sixty-min-button");
const infiniteButton = document.getElementById("infinite-button");
const noneButton = document.getElementById("none-button");
const oneSecButton = document.getElementById("one-sec-button");
const threeSecButton = document.getElementById("three-sec-button");
const fiveSecButton = document.getElementById("five-sec-button");
const tenSecButton = document.getElementById("ten-sec-button");
const fifteenSecButton = document.getElementById("fifteen-sec-button");
const thirtySecButton = document.getElementById("thirty-sec-button");
const sixtySecButton = document.getElementById("sixty-sec-button");
const whiteButton = document.getElementById("white-button");
const randomButton = document.getElementById("random-button");
const blackButton = document.getElementById("black-button");
 
// Game screen elements
const gameScreen = document.getElementById("game-screen");
const gameCodeDisplay = document.getElementById("game-code-display");
const takebackButton = document.getElementById("takeback-button");
const drawButton = document.getElementById("draw-button");
const resignButton = document.getElementById("resign-button");
const rematchButton = document.getElementById("rematch-button");
const acceptButton = document.getElementById("accept-button");
const declineButton = document.getElementById("decline-button");
const bottomPlayerLabel = document.getElementById("bottom-player-label");
const bottomTimerLabel = document.getElementById("bottom-timer-label");
const topPlayerLabel = document.getElementById("top-player-label");
const topTimerLabel = document.getElementById("top-timer-label");
const opponentActivityLabel = document.getElementById("opponent-activity");
const chatDisplay = document.getElementById("chat");
const chatInput = document.getElementById("chat-input");
const chatButton = document.getElementById("chat-button");

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

// Canvas Variables
const BOARD_LIGHT = "#f0d9b5";
const BOARD_DARK = "#b58863";
const boardCanvas = document.getElementById("board-canvas");
const boardCtx = boardCanvas.getContext("2d");;
const topCanvas = document.getElementById("top-canvas");
const topCtx = topCanvas.getContext("2d");
const bottomCanvas = document.getElementById("bottom-canvas");
const bottomCtx = bottomCanvas.getContext("2d");
let squareSize = getSquareSize();

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

// Store all sounds in an object
const SOUND = {
    badNotify: document.getElementById("bad-notify-sound"),
    capture: document.getElementById("capture-sound"),
    goodNotify: document.getElementById("good-notify-sound"),
    move: document.getElementById("move-sound"),
    socialNotify: document.getElementById("social-notify-sound")
}

// Timer variables
const FREQUENCY = 37; // frequency of interval in ms
let timerInterval;

// Game setup variables
let timer = 5; 
let increment = 0;
let colour;

// Game variables
let game;
let me;
let opponent;

/**
 * ================================================
 * Document event handlers
 * ================================================
 */

/**
 * If enter pressed, indicates to server to update chat and clears input
 * @param {KeyboardEvent} e Keyboard event
 */
function handleChatKeyDown(e) {
    if (e.key == "Enter") {
        handleChatButton();
    }
}

/**
 * Indicates to server to update chat and clears input
 */
function handleChatButton() {
    if (chatInput.value != "") {
        socket.emit("chat", chatInput.value);
        chatInput.value = "";
    }
}

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
    let button = e.target;

    // De-select all buttons
    whiteButton.className = "btn btn-secondary";
    randomButton.className = "btn btn-secondary";
    blackButton.className = "btn btn-secondary";

    // Choose which button to select and update colour
    switch (button) {
        case whiteButton:
        case document.getElementById("white"): // Add this case since this is the target if press image
            colour = Game.Piece.white;
            button = whiteButton
            break;
        case randomButton:
            colour = undefined;
            break;
        case blackButton:
        case document.getElementById("black"): // Add this case since this is the target if press image
            colour = Game.Piece.black;
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
    let button = e.target;

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
    let button = e.target;

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
async function handleBackButton() {
    await animateBack(createScreen, initialScreen);
}

/**
 * Indicate loading. Indicate to server to find quick match
 */
function handleQuickMatchButton() {
    document.getElementsByTagName("html")[0].style.cursor = "wait"
    socket.emit("quickMatch");
}

/**
 * Hide initial screen and go to create screen
 */
async function handleNewGameButton() {
    await animateChangeScreen(initialScreen, createScreen)
}

/**
 * Indicate loading. Indicate to server to start new game with options set 
 */
 function handleStartButton() {
    document.getElementsByTagName("html")[0].style.cursor = "wait"
    socket.emit("newGame", timer, increment, colour);
}

/**
 * Indicate loading. Indicate to server join button was pressed
 */
function handleJoinGameButton() {
    document.getElementsByTagName("html")[0].style.cursor = "wait"
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

    // Scale by device pixel ratio, so graphics are not blurry
    boardCtx.scale(ratio, ratio);
    topCtx.scale(ratio, ratio);
    bottomCtx.scale(ratio, ratio);

    updateGraphics();
}

/**
 * Either attempts to pick up a piece or, if a piece already in hand, place a piece on the square 
 * corresponding to mouse position.
 * If a piece is successfully placed, indicate to server to update game state
 * @param {MouseEvent} e Mouse event
 */
function handleClick(e) {
    if (!game.board.isGameFinished) {

        // Multiplier and offset used to flip board if player is black
        let multiplier = (me.colour == Game.Piece.white) ? 1 : -1;
        let offset = (me.colour == Game.Piece.white) ? 0 : 7;
    
        let mouse = getMouseSquare(e);
        let boardIndex = Game.convert2dTo1d(offset + mouse.x * multiplier, offset + mouse.y * multiplier);
    
        game.board.invalid = -1;
    
        // Dropping a piece
        if (game.board.inHand ^ Game.Piece.none && // Check there is a piece in hand with bitwise XOR
            (!Game.isPieceColour(game.board.square[boardIndex], game.board.colourToMove)
                || game.board.isLegalMove[boardIndex])) { 
    
            let start = game.board.movedFrom
            let captured = (game.board.square[boardIndex] != 0 && !Game.isSameColour(game.board.square[boardIndex], game.board.square[start])) || (game.board.enPassantSquare == boardIndex && Game.isPieceType(game.board.square[start], Game.Piece.pawn));
            let madeMove = game.makeMove(start, boardIndex, false);

            // If move was invalid, update graphics indicating so
            if (!madeMove) { 
                game.board.invalid = start;
                game.board.isLegalMove = new Array(64).fill(false);
                game.board.hiddenSquare = -1;
                game.board.inHand = Game.Piece.none;
                game.board.movedTo = boardIndex;
                drawBoard();
            
            // If move was valid, update graphics on client-side before checking move on server
            } else {
                let check = game.board.whiteInCheck && opponent.colour == Game.Piece.white || game.board.blackInCheck && opponent.colour == Game.Piece.black;

                game.board.isLegalMove = new Array(64).fill(false);
                game.board.hiddenSquare = -1;
                game.board.inHand = Game.Piece.none;
                game.board.movedTo = boardIndex;
                game.board.movedFrom = start;
                
                updateGraphics();
                
                if (check) { // If checking other player
                    SOUND.badNotify.play();
                } else if (captured) { // If captured a piece
                    SOUND.capture.play();
                } else { // If standard
                    SOUND.move.play();
                }
                
                socket.emit("moveMade", game.board); // Move will actually be made server-side. Still make move in client side for purpose of graphics and reducing load on server by prechecking (e.g. showing legal moves, clicking an invalid target square)
            }

    
        // Picking up a piece of correct colour and is player's turn
        } else if (Game.isPieceColour(game.board.square[boardIndex],game.board.colourToMove)
                && game.board.colourToMove == me.colour) {

                    // If piece already in hand and click on the same piece, deselect piece
                    if (game.board.inHand ^ Game.Piece.none && game.board.movedFrom == boardIndex) { // Check there is a piece in hand with bitwise XOR
                        game.board.isLegalMove = new Array(64).fill(false);
                        game.board.hiddenSquare = -1;
                        game.board.inHand = Game.Piece.none;
                        game.board.movedFrom = -1;
                        drawBoard();

                    // If picking up new piece, show legal moves
                    } else {
                        game.board.isLegalMove = new Array(64).fill(false);

                        game.generateLegalMoves(boardIndex, true).forEach(move => {
                            game.board.isLegalMove[Game.decode(move).target] = true;
                        });
                
                        game.board.inHand = game.board.square[boardIndex];
                        game.board.movedTo = -1
                        game.board.movedFrom = boardIndex
                        game.board.hiddenSquare = -1;
                
                        drawBoard();

                        game.board.hiddenSquare = boardIndex;
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
        let multiplier = (me.colour == Game.Piece.white) ? 1 : -1;
        let offset = (me.colour == Game.Piece.white) ? 0 : 7;
        let mouse = getMouseSquare(e);
        let boardIndex = Game.convert2dTo1d(offset + mouse.x * multiplier, offset + mouse.y * multiplier);
    
        drawBoard();
    
        // If piece in hand, draw piece
        if (game.board.inHand ^ Game.Piece.none) { // Check there is a piece in hand with bitwise XOR
            if (Game.isPieceColour(game.board.square[boardIndex], me.colour) && !game.board.isLegalMove[boardIndex]) {
                let square = Game.convert1dTo2d(game.board.hiddenSquare);
                drawPiece(square.x, square.y, game.board.inHand);
                colourSquare(mouse.x, mouse.y, "rgba(255,255,255,0.3)");
            } else {
                drawPiece(offset + mouse.x * multiplier, offset + mouse.y * multiplier, game.board.inHand);
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
    game.board.isLegalMove = new Array(64).fill(false);
    game.board.hiddenSquare = -1;
    game.board.inHand = Game.Piece.none;    
    drawBoard();
}