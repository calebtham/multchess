/**
 * ================================================
 * Handle client requests
 * @author Caleb Tham
 * ================================================
 */

const io = require("socket.io")(process.env.PORT || 3000, {
    cors: {
        origin: "*",
    }
});

const { Game } = require("./game.js");
const { Player } = require("./player.js");
const { makeid } = require("./util.js");

// Initialise server variables
const state = {};
const clientRooms = {};
const blacklistedRooms = {};
let quickMatchRoom;

io.on("connection", client => {
    
    // Initialise client requests
    client.on("quickMatch", handleQuickMatch);
    client.on("newGame", handleNewGame);
    client.on("joinGame", handleJoinGame);
    client.on("moveMade", handleMoveMade);
    client.on("rematchRequest", handleRematchRequest);
    client.on("rematchAccept", handleRematchAccept);
    client.on("drawRequest", handleDrawRequest);
    client.on("drawAccept", handleDrawAccept);
    client.on("takebackRequest", handleTakebackRequest);
    client.on("takebackAccept", handleTakebackAccept);
    client.on("decline", handleDecline);
    client.on("resign", handleResign);
    client.on("timeout", handleTimeout);
    client.on("disconnect", handleDisconnect);
    client.on("chat", handleChat);
    
    /**
     * Notify a player that their opponent has disconnected.
     * Updates variables to stop another player from joining a disconnected room
     */
    function handleDisconnect() {
        let roomName = clientRooms[client.id];
        
        if (roomName) {
            let room = io.sockets.adapter.rooms.get(roomName);

            // If one player left, notify player
            if (room) {
                blacklistedRooms[roomName] = true;
    
                state[roomName].game.endGame();
                state[roomName][3 - client.player.number].selectBooleanFlag("opponentDisconnected");
                emitAll(roomName, "gameEnd");
                emitState(roomName);
    
            // Room destroyed automatically when all clients leave, so just remove room from blacklist
            } else {
                blacklistedRooms[roomName] = undefined;
                if (quickMatchRoom == roomName) {
                    quickMatchRoom = undefined;
                }
            }
        }
    }

    /**
     * If there is a pending quick match, join this. Otherwise, create a pending quick match
     */
    function handleQuickMatch() {
        let roomName = clientRooms[client.id];

        if (!roomName) {
            if (quickMatchRoom) {
                let temp = quickMatchRoom;
                quickMatchRoom = undefined;
                handleJoinGame(temp);
    
            } else {
                quickMatchRoom = handleNewGame(5);
            }
        }
        
    }

    /**
     * Creates a new game and initialises player 1
     * @param {number} timer Game timer in minutes
     * @param {number} increment Game timer increment in seconds
     * @param {number} colour Colour player 1 is to start as
     * @returns The client's room name
     */
    function handleNewGame(timer = Infinity, increment = 0, colour = undefined) {
        let roomName;
        while (!roomName || io.sockets.adapter.rooms.get(roomName)) {
            roomName = makeid(5);
        }

        initRoomState(roomName, timer, increment, colour);
        initClient(roomName, 1);
        return roomName;
    }

    /**
     * Initialises state variables of the room
     * @param {string} roomName The client's room name
     * @param {number} timer Game timer in minutes
     * @param {number} increment Game timer increment in seconds
     * @param {number} colour Colour player 1 is to start as
     */
    function initRoomState(roomName, timer, increment, colour) {
        state[roomName] = {}
        state[roomName].game = new Game(undefined, timer, increment, colour);
        state[roomName][1] = new Player(1, timer);
        state[roomName][2] = new Player(2, timer);
    }

    /**
     * Initialises client variables of the room
     * @param {string} roomName The client's room name
     * @param {number} playerNumber The client's player number
     */
    function initClient(roomName, playerNumber) {
        clientRooms[client.id] = roomName;
        client.join(roomName);
        
        if (playerNumber == 1) {
            client.player = state[roomName][1];
        } else {
            client.player = state[roomName][2];
        }

        if (playerNumber == state[roomName].game.board.startingPlayer) {
            state[roomName][playerNumber].colour = Game.Piece.white;
            state[roomName][3 - playerNumber].colour = Game.Piece.black;
        } else {
            state[roomName][playerNumber].colour = Game.Piece.black;
            state[roomName][3 - playerNumber].colour = Game.Piece.white;
        }

        client.emit("init", roomName);
        client.emit("gameState", state[roomName], client.player.number);
    }

    /**
     * Checks if the room exists or is full. If not, joins the client to the room and starts the
     * game
     * @param {string} roomName The client's room name
     */
    function handleJoinGame(roomName) {
        if (blacklistedRooms[roomName]) {
            client.emit("tooManyPlayers");
            return;
        }

        let room = io.sockets.adapter.rooms.get(roomName);

        if (room) {
            if (room.size === 0) {
                client.emit("unknownGame");
                return;
            } else if (room.size > 1) {
                client.emit("tooManyPlayers");
                return;
            }
        } else {
            client.emit("unknownGame");
            return;
        }

        initClient(roomName, 2);

        state[roomName][1].opponentJoined = true;
        state[roomName][2].opponentJoined = true;

        state[roomName].game.startGame();

        emitAll(roomName, "opponentJoined"); 
        emitState(roomName); 
    }

    /**
     * Verifies the move is valid and makes the move on the server (to ensure board variables are 
     * updated as appropriate).
     * Updates the player timers.
     * Handles end game states.
     * @param {Object} nextBoard The next board
     * @returns True iff the move made is valid
     */
    function handleMoveMade(nextBoard) {
        let roomName = clientRooms[client.id];

        if (roomName && nextBoard) {
            let initBoard = state[roomName].game.board; 
            let valid = false;
    
            if (initBoard.colourToMove == client.player.colour) { // Check client was meant to make the next move
                let move = Game.getStartAndTarget(initBoard, nextBoard); // Checks there is a potential move to get from init board to next board and returns the move if so
    
                if (!initBoard.isGameFinished && move) {
                    if (state[roomName].game.makeMove(move.start, move.target)) { 
                        valid = true;

                        client.player.timeLastMoved = Date.now(); // Update so can check next move time difference

                        updatePlayerTimer(roomName, client.player.number);

                        if (client.player.timeLeft <= 0) {
                            state[roomName].game.undoMove();
                            handleTimeout();
                            return valid;

                        } else if (state[roomName].game.board.checkmate) {
                            checkmate(roomName);
                            return valid;
                        } else if (state[roomName].game.board.stalemate) {
                            draw(roomName);
                            return valid;
                        }

                        if (state[roomName].timer != Infinity) {
                            client.player.timeLeft += state[roomName].game.increment;
                        }
                        
                    } 
                }
            }
    
            emitState(roomName);
            return valid;
        }
        
    }

    /**
     * End game and notify players the client won
     * @param {string} roomName The client's room name
     */
    function checkmate(roomName) {
        state[roomName][client.player.number].score++;
        state[roomName][client.player.number].selectBooleanFlag("won");
        state[roomName][3 - client.player.number].selectBooleanFlag("lost");

        state[roomName].game.endGame();
        emitAll(roomName, "gameEnd");
        emitState(roomName);
    }

    /**
     * End game and notify players the client resigned
     */
    function handleResign() {
        let roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][3 - client.player.number].score++;
            state[roomName][3 - client.player.number].selectBooleanFlag("opponentResigned");
            state[roomName][client.player.number].selectBooleanFlag("lost");
    
            state[roomName].game.endGame();
            emitAll(roomName, "gameEnd");
            emitState(roomName); 
        }
        
    }

    /**
     * Check if either player timed out. If so, notify the players and end game
     */
    function handleTimeout() {
        let roomName = clientRooms[client.id];

        if (roomName) {

            if (state[roomName].game.timer != Infinity) {
                updatePlayerTimer(roomName, state[roomName].game.board.colourToMove) // Update timer of player to move

                if (client.player.timeLeft <= 0) {
                    client.player.timeLeft = 0;
    
                    state[roomName][3 - client.player.number].score++;
                    state[roomName][3 - client.player.number].selectBooleanFlag("opponentTimedOut");
                    state[roomName][client.player.number].selectBooleanFlag("timedOut");
            
                    state[roomName].game.endGame();
                    emitAll(roomName, "gameEnd");
                }
                
                else if (state[roomName][3 - client.player.number].timeLeft <= 0) {
                    state[roomName][3 - client.player.number].timeLeft = 0;

                    state[roomName][client.player.number].score++;
                    state[roomName][client.player.number].selectBooleanFlag("opponentTimedOut");
                    state[roomName][3 - client.player.number].selectBooleanFlag("timedOut");
            
                    state[roomName].game.endGame();
                    emitAll(roomName, "gameEnd");
                }
    
                emitState(roomName); 
            }

        }
    }

    /**
     * Notify players that a rematch request has been sent
     */
    function handleRematchRequest() {
        let roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][client.player.number].selectBooleanFlag("rematchRequestSent")
            state[roomName][3 - client.player.number].selectBooleanFlag("rematchRequestRecieved");
            emitOpponent(roomName, "messageRecieved");
            emitState(roomName);
        }
        
    }

    /**
     * Start a new game with the starting player swapped if a rematch request had been sent
     */
    function handleRematchAccept() {
        let roomName = clientRooms[client.id];

        if (roomName && state[roomName][3 - client.player.number].rematchRequestSent) { // Check opponent actually requested this
            let startingPlayer = (state[roomName].game.board.startingPlayer == 1) ? 2 : 1; // switch starting player
            let prevGame = state[roomName].game;

            let temp = state[roomName][1].colour;
            state[roomName][1].colour = state[roomName][2].colour;
            state[roomName][2].colour = temp;

            state[roomName][1].selectBooleanFlag("none");
            state[roomName][2].selectBooleanFlag("none");

            state[roomName][1].timeLeft = (prevGame.timer ? prevGame.timer : Infinity) * 60;
            state[roomName][2].timeLeft = (prevGame.timer ? prevGame.timer : Infinity) * 60;

            state[roomName][1].timeLastMoved = undefined;
            state[roomName][2].timeLastMoved = undefined;

            state[roomName].game = new Game(undefined, prevGame.timer, prevGame.increment, undefined);
            state[roomName].game.startingPlayer = startingPlayer;
            state[roomName].game.startGame();

            emitState(roomName);
            emitAll(roomName, "opponentJoined")
        }
        
    }

    /**
     * Notify players that a draw request has been sent
     */
    function handleDrawRequest() {
        let roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][client.player.number].selectBooleanFlag("drawRequestSent");
            state[roomName][3 - client.player.number].selectBooleanFlag("drawRequestRecieved");
            emitOpponent(roomName, "messageRecieved");
            emitState(roomName);
        }
        
    }

    /**
     * End game and notify players that it is a draw if a draw request had been sent
     */
    function handleDrawAccept() {
        let roomName = clientRooms[client.id];

        if (roomName && state[roomName][3 - client.player.number].drawRequestSent) { // Check opponent actually requested this
            draw(roomName);
        }
    }

    /**
     * End game and notify players that it is a draw
     * @param {string} roomName The client's room name
     */
    function draw(roomName) {
        state[roomName][client.player.number].score++;
        state[roomName][3 - client.player.number].score++;

        state[roomName][client.player.number].selectBooleanFlag("stalemate");
        state[roomName][3 - client.player.number].selectBooleanFlag("stalemate");

        state[roomName].game.endGame();
        emitAll(roomName, "gameEnd");
        emitState(roomName);
    }

    /**
     * Notify players a takeback request has been sent
     */
    function handleTakebackRequest() {
        let roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][client.player.number].selectBooleanFlag("takebackRequestSent");
            state[roomName][3 - client.player.number].selectBooleanFlag("takebackRequestRecieved");
            emitOpponent(roomName, "messageRecieved");
            emitState(roomName);
        }
        
    }

    /**
     * Service a takeback request if one had been sent
     */
    function handleTakebackAccept() {
        let roomName = clientRooms[client.id];

        if (roomName && state[roomName][3 - client.player.number].takebackRequestSent) { // Check opponent actually requested this
            state[roomName][1].selectBooleanFlag("none");
            state[roomName][2].selectBooleanFlag("none");

            state[roomName].game.serviceTakeback(state[roomName][client.player.number].colour);
            emitState(roomName);
        }
    }

    /**
     * Notify players a request has been declined
     */
    function handleDecline() {
        let roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][client.player.number].selectBooleanFlag("decline");
            state[roomName][3 - client.player.number].selectBooleanFlag("requestDeclined");
            emitOpponent(roomName, "messageRecieved");
            emitState(roomName) 
        }   
    }

    function handleChat(message) {
        let roomName = clientRooms[client.id];

        if (roomName) {
            let chatMessage = {
                playerNumber: client.player.number,
                content: message
            }
    
            state[roomName].game.chat.push(chatMessage);
            emitOpponent(roomName, "messageRecieved");
            emitState(roomName);
        }
        
    }

    /**
     * Updates the player's time left on the timer
     * @param {string} roomName The client's room name
     * @param {number} number The player's number
     */
    function updatePlayerTimer(roomName, number) {
        if (state[roomName].game.timer != Infinity && state[roomName][3 - number]) {
            let timeLastMoved = (state[roomName][3 - number].timeLastMoved) ? state[roomName][3 - number].timeLastMoved : Date.now();
            state[roomName][number].timeLeft -= (Date.now() - timeLastMoved) / 1000;
    
            if (state[roomName][number].timeLeft < 0) {
                state[roomName][number].timeLeft = 0
            }
    
            state[roomName][3 - number].timeLastMoved = Date.now()
        }   
    }

    /**
     * Applies a function to each client in a room
     * @param {string} roomName The room name
     * @param {*} func The function to apply to each client
     */
    function forEachClientIn(roomName, func) {
        for (const clientId of io.sockets.adapter.rooms.get(roomName)) {
            const clientSocket = io.sockets.sockets.get(clientId);
            
            func(clientSocket);
        }
    }
    
    /**
     * Emits an event to the client's opponent
     * @param {string} roomName The client's room name
     * @param {string} event Event to emit
     * @param {any} data1 Argument 1
     * @param {any} data2 Argument 2
     */
    function emitOpponent(roomName, event, data1=undefined, data2=undefined) {
        forEachClientIn(roomName, c => {
            if (c.id != client.id) {
                c.emit(event, data1, data2);
            }
        })
    }
    
    /**
     * Emits an event to all players in the room
     * @param {string} roomName The client's room name
     * @param {string} event Event to emit
     * @param {any} data Argument 1
     */
    function emitAll(roomName, event, data=undefined) {
        io.sockets.in(roomName).emit(event, data);
    }
    
    /**
     * Emits the relevant game state to all players in the room
     * @param {string} roomName The client's room name
     */
    function emitState(roomName) {
        if (!client.player.rematchRequestSent 
            && !(state[roomName].game.board.isGameFinished 
                && (client.player.rematchRequestSent 
                    || client.player.rematchRequestSent 
                    || client.player.requestDeclined 
                    || state[roomName][3-client.player.number].requestDeclined))) { // game end timer bug
                        updatePlayerTimer(roomName, (client.player.colour == state[roomName].game.board.colourToMove) ? client.player.number : 3 - client.player.number);
        } 

        client.emit("gameState", state[roomName], client.player.number);
        emitOpponent(roomName, "gameState", state[roomName], 3 - client.player.number);
    }
});