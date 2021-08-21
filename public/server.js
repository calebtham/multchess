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

//const socket = io("https://guarded-citadel-75405.herokuapp.com/");
const socket = io("localhost:3000");

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("opponentJoined", handleOpponentJoined);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);
/** */

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Server event handlers
 */

/**
 * Function to update variables and document elements for when 2nd opponent has joined
 */
 function handleOpponentJoined() {
    boardCanvas.addEventListener("click", handleClick);
    boardCanvas.addEventListener("mousemove", handleHover);
    boardCanvas.addEventListener("mouseleave", handleMouseLeave)
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
 * Given a game state, updates client game state and performs actions to initalise the game
 * Changes screen from the inital menu to the game screen
 * Initialises the event listeners, boardCanvas, and variables for the game
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

    boardCanvas = document.getElementById("boardCanvas");
    boardCtx = boardCanvas.getContext("2d");

    topCanvas = document.getElementById("topCanvas");
    topCtx = topCanvas.getContext("2d");
    
    bottomCanvas = document.getElementById("bottomCanvas");
    bottomCtx = bottomCanvas.getContext("2d");

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
    updateGraphics();
}