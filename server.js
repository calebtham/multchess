/**
 * @author Caleb Tham
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
    
    // Initialise server requests
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
    
    function handleDisconnect() {
        let roomName = clientRooms[client.id];
        
        if (roomName) {
            let room = io.sockets.adapter.rooms.get(roomName);

            // if one player left, notify player
            if (room) {
                blacklistedRooms[roomName] = true;
    
                state[roomName].game.endGame();
                state[roomName][3 - client.player.number].selectBooleanFlag("opponentDisconnected");
                emitState(roomName);
    
                // room destroyed automatically when all clients leave - just remove room from blacklist
            } else {
                blacklistedRooms[roomName] = undefined;
                if (quickMatchRoom == roomName) {
                    quickMatchRoom = undefined;
                }
            }
        }

    }

    function handleQuickMatch() {
        if (quickMatchRoom) {
            handleJoinGame(quickMatchRoom);
            quickMatchRoom = undefined;

        } else {
            quickMatchRoom = handleNewGame(5);
        }
    }

    function handleNewGame(timer = Infinity, increment = 0, colour = undefined) {
        let roomName;
        while (!roomName || io.sockets.adapter.rooms.get(roomName)) {
            roomName = makeid(5);
        }

        initRoomState(roomName, timer, increment, colour);
        initClient(roomName, 1);
        return roomName;
    }

    function initRoomState(roomName, timer, increment, colour) {
        state[roomName] = {}
        state[roomName].game = new Game(undefined, timer, increment, colour);
        state[roomName][1] = new Player(1, timer);
        state[roomName][2] = new Player(2, timer);
    }

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

        client.emit("init", roomName, state[roomName], playerNumber);
    }

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

    function checkmate(roomName) {
        state[roomName][client.player.number].score++;
        state[roomName][client.player.number].selectBooleanFlag("won");
        state[roomName][3 - client.player.number].selectBooleanFlag("lost");

        state[roomName].game.endGame();
        emitState(roomName);
    }

    function handleResign() {
        let roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][3 - client.player.number].score++;
            state[roomName][3 - client.player.number].selectBooleanFlag("opponentResigned");
            state[roomName][client.player.number].selectBooleanFlag("lost");
    
            state[roomName].game.endGame();
            emitState(roomName); 
        }
        
    }

    function handleTimeout() {
        let roomName = clientRooms[client.id];

        if (roomName) {

            if (state[roomName].game.timer != Infinity) {
                updatePlayerTimer(roomName, client.player.number)

                if (client.player.timeLeft <= 0) {
                    client.player.timeLeft = 0;
    
                    state[roomName][3 - client.player.number].score++;
                    state[roomName][3 - client.player.number].selectBooleanFlag("opponentTimedOut");
                    state[roomName][client.player.number].selectBooleanFlag("timedOut");
            
                    state[roomName].game.endGame();
                }
    
                emitState(roomName); 
            }

        }
    }

    function handleRematchRequest() {
        let roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][client.player.number].selectBooleanFlag("rematchRequestSent")
            state[roomName][3 - client.player.number].selectBooleanFlag("rematchRequestRecieved");
            emitState(roomName);
        }
        
    }

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

    function handleDrawRequest() {
        let roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][client.player.number].selectBooleanFlag("drawRequestSent");
            state[roomName][3 - client.player.number].selectBooleanFlag("drawRequestRecieved");
            emitState(roomName);
        }
        
    }

    function handleDrawAccept() {
        let roomName = clientRooms[client.id];

        if (roomName && state[roomName][3 - client.player.number].drawRequestSent) { // Check opponent actually requested this
            draw(roomName);
        }
    }

    function draw(roomName) {
        state[roomName][client.player.number].score++;
        state[roomName][3 - client.player.number].score++;

        state[roomName][client.player.number].selectBooleanFlag("stalemate");
        state[roomName][3 - client.player.number].selectBooleanFlag("stalemate");

        state[roomName].game.endGame();
        emitState(roomName);
    }

    function handleTakebackRequest() {
        let roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][client.player.number].selectBooleanFlag("takebackRequestSent");
            state[roomName][3 - client.player.number].selectBooleanFlag("takebackRequestRecieved");
            emitState(roomName);
        }
        
    }

    function handleTakebackAccept() {
        let roomName = clientRooms[client.id];

        if (roomName && state[roomName][3 - client.player.number].takebackRequestSent) { // Check opponent actually requested this
            state[roomName][1].selectBooleanFlag("none");
            state[roomName][2].selectBooleanFlag("none");

            state[roomName].game.serviceTakeback(state[roomName][client.player.number].colour);
            emitState(roomName);
        }
    }

    function handleDecline() {
        let roomName = clientRooms[client.id];

        if (roomName) {
            state[roomName][client.player.number].selectBooleanFlag("decline");
            state[roomName][3 - client.player.number].selectBooleanFlag("requestDeclined");
            emitState(roomName) 
        }
        
    }

    function updatePlayerTimer(roomName, number) {
        if (state[roomName].game.timer != Infinity) {
            let timeLastMoved = (state[roomName][3 - number].timeLastMoved) ? state[roomName][3 - number].timeLastMoved : Date.now();
            state[roomName][number].timeLeft -= (Date.now() - timeLastMoved) / 1000;
    
            if (state[roomName][number].timeLeft < 0) {
                state[roomName][number].timeLeft = 0
            }
    
            state[roomName][3 - number].timeLastMoved = Date.now()
        }   
    }

    function forEachClientIn(roomName, func) {
        for (const clientId of io.sockets.adapter.rooms.get(roomName)) {
            const clientSocket = io.sockets.sockets.get(clientId);
            
            func(clientSocket);
        }
    }
    
    function emitOpponent(roomName, event, data1, data2) {
        forEachClientIn(roomName, function(c) {
            if (c.id != client.id) {
                c.emit(event, data1, data2);
            }
        })
    }
    
    function emitAll(roomName, event, data) {
        io.sockets.in(roomName).emit(event, data);
    }
    
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