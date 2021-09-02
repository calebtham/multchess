/**
 * ================================================
 * Handle server socket variables and events
 * @author Caleb Tham
 * ================================================
 */

/**
 * ================================================
 * Initialise socket variables and events
 * ================================================
 */

const socket = io("https://guarded-citadel-75405.herokuapp.com/");
//const socket = io("localhost:3000");

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("opponentJoined", handleOpponentJoined);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("messageRecieved", handleMessageReceived);
socket.on("gameEnd", handleGameEnd);

/**
 * ================================================
 * Server event handlers
 * ================================================
 */

/**
 * Update variables and document elements and start timer for when 2nd opponent has joined
 */
 function handleOpponentJoined() {

    // Add event listeners so player can make move / make game requests
    document.addEventListener("visibilitychange", handleVisibilityChange);
    boardCanvas.addEventListener("click", handleClick);
    boardCanvas.addEventListener("mousemove", handleHover);
    boardCanvas.addEventListener("mouseleave", handleMouseLeave)
    rematchButton.addEventListener("click", handleRematchButton);
    takebackButton.addEventListener("click", handleTakebackButton);
    drawButton.addEventListener("click", handleDrawButton);
    resignButton.addEventListener("click", handleResignButton);
    acceptButton.addEventListener("click", handleAcceptButton);
    declineButton.addEventListener("click", handleDeclineButton);
    chatButton.addEventListener("click", handleChatButton);
    chatInput.addEventListener("keydown", handleChatKeyDown);
    
    if (me.timeLeft != null) { // If there is a timer, start it on client-side
        clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, FREQUENCY);
    }

    playSound("goodnotify")
    
}

/**
 * Updates the timers on client side
 */
function updateTimer() {
    if (game.board.colourToMove == me.colour) {
        updatePlayerTimer(me)
    } else {
        updatePlayerTimer(opponent)
    }
    updateTimerText();
}

/**
 * Update a player's timer
 * @param {Object} player The player
 */
function updatePlayerTimer(player) {
    player.timeLeft -= FREQUENCY / 1000;
    if (player.timeLeft <= -FREQUENCY / 1000) { // Extend into negatives to give client error leeway. (actual timing done on server anyway)
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
    errorLabel.innerText = "Game already in progress";
}

/**
 * Display to user that the game corresponding to gamecode does not exist
 */
function handleUnknownGame() {
    gameCodeInput.className = "error";
    errorLabel.innerText = "Game not found";
}

/**
 * Given a game state, updates client game state and performs actions to initalise the game
 * Changes screen from the inital menu to the game screen
 * Initialises the event listeners, boardCanvas, and variables for the game
 * @param {Object} state The game state (i.e. a board object)
 */
async function handleInit(gameCode) {
    // Display
    gameCodeDisplay.innerText = "Your game code is: " + gameCode;
    await animateChangeScreen(createScreen.style.display == "block" ? createScreen : initialScreen, gameScreen);

    // Add abiltiy to resize canvas
    window.addEventListener("resize", handleResize);
    handleResize();
}

/**
 * Given a game state, updates the client game state.
 * Plays moving piece sound
 * @param {Object} state    The game state (i.e. a board object)
 */
function handleGameState(state, number) {

    // Handle sounds
    if (game && game.board.colourToMove != me.colour) { // If other player moved
        let move = Game.getStartAndTarget(game.board, state.game.board);
        if (move) {
            if (state.game.board.whiteInCheck && me.colour == Game.Piece.white || state.game.board.blackInCheck && me.colour == Game.Piece.black) { // Me in check
                playSound("badnotify")
            } else if (game.board.square[move.target] != 0 || (game.board.enPassantSquare == move.target && Game.isPieceType(game.board.square[move.start], Game.Piece.pawn))) { // Captured piece
                playSound("capture")
            } else { // Normal move
                playSound("move")
            }
        }
    }

    // Handle game
    game = new Game(state.game);
    me = state[number];
    opponent = state[3 - number];

    if (game.board.isGameFinished) { // If game end, stop timer
        clearInterval(timerInterval);
    }

    updateGraphics();
}

/**
 * Plays end of game sound
 */
function handleGameEnd() {
    playSound("endnotify")
}

/**
 * Plays message recieved sound
 */
function handleMessageReceived() {
    playSound("socialnotify")
}