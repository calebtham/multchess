////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Handle server socket variables and events
 * @author Caleb Tham
 */
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Initialise socket variables and events
 * @author Caleb Tham
 */

const socket = io("https://guarded-citadel-75405.herokuapp.com/");
//const socket = io("localhost:3000");

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("opponentJoined", handleOpponentJoined);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);
/** */

let timerInterval;
let frequency = 37; // frequency of interval in ms

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Server event handlers
 */

/**
 * Update variables and document elements and start timer for when 2nd opponent has joined
 */
 function handleOpponentJoined() {

    // Add event listeners so player can make move / make game requests
    document.addEventListener("visibilitychange", handleVisibilityChange)
    boardCanvas.addEventListener("click", handleClick);
    boardCanvas.addEventListener("mousemove", handleHover);
    boardCanvas.addEventListener("mouseleave", handleMouseLeave)
    rematchButton.addEventListener("click", handleRematchButton);
    takebackButton.addEventListener("click", handleTakebackButton);
    drawButton.addEventListener("click", handleDrawButton);
    resignButton.addEventListener("click", handleResignButton);
    acceptButton.addEventListener("click", handleAcceptButton);
    declineButton.addEventListener("click", handleDeclineButton);
    
    if (me.timeLeft != null) { // If there is a timer, start it on client-side
        clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, frequency);
    }
    
}

/**
 * Updates the timer on client side
 */
function updateTimer() {
    if (board.colourToMove == me.colour) {
        updatePlayerTimer(me)
    } else {
        updatePlayerTimer(opponent)
    }
    updateTimerText();
}

function updatePlayerTimer(player) {
    player.timeLeft -= frequency / 1000;
    if (player.timeLeft <= -frequency / 1000) { // Extend into negatives to give client error leeway. (actual timing done on server anyway)
        player.timeLeft = 0;
        clearInterval(timerInterval);
        socket.emit("timeout")

    } else if (player.timeLeft < 0) { // For graphics
        player.timeLeft = 0;
    }
}

/**
 * Display to user that the game corresponding to gamecode is full
 */
function handleTooManyPlayers() {
    gameCodeInput.className = "error";
    errorLabel.innerText = "Game already in progress"
}

/**
 * Display to user that the game corresponding to gamecode does not exist
 */
function handleUnknownGame() {
    gameCodeInput.className = "error";
    errorLabel.innerText = "Game not found"
}

/**
 * Given a game state, updates client game state and performs actions to initalise the game
 * Changes screen from the inital menu to the game screen
 * Initialises the event listeners, boardCanvas, and variables for the game
 * @param {Object} state The game state (i.e. a board object)
 */
 function handleInit(gameCode, state, number) {
    // Display game code
    gameCodeDisplay.innerText = "Your game code is: " + gameCode;

    // Update game state
    board = state.game.board;
    me = state[number];
    opponent = state[3 - number]

    // Initialise canvas
    boardCanvas = document.getElementById("boardCanvas");
    boardCtx = boardCanvas.getContext("2d");

    topCanvas = document.getElementById("topCanvas");
    topCtx = topCanvas.getContext("2d");
    
    bottomCanvas = document.getElementById("bottomCanvas");
    bottomCtx = bottomCanvas.getContext("2d");

    // Add abiltiy to resize canvas
    window.addEventListener("resize", handleResize);
    handleResize();
}

/**
 * Given a game state, updates the client game state
 * @param {Object} state    The game state (i.e. a board object)
 */
function handleGameState(state, number) {
    board = state.game.board;
    me = state[number];
    opponent = state[3 - number];

    if (board.isGameFinished) { // If game end, stop timer
        clearInterval(timerInterval);
    }

    updateGraphics();
}